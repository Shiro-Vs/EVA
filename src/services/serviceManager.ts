import { db } from "../config/firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
  getDoc,
} from "firebase/firestore";
import { Service, OwnerDebt, Subscriber } from "./types";
import { addTransaction } from "./transactionService";
import { monthsEs } from "../utils/dateUtils";
import { getServicesCollection } from "../utils/firestoreUtils";

// Helper to generate debts (circular dependency handling: we import the logic here if needed, or keep it separate)
// Actually checkAndGenerateServiceDebts needs generate OwnerDebt, which is debt logic but specific to Service Owner.
// We will keep checkAndGenerateServiceDebts here as it is "Service Management".

/**
 * Crea un nuevo servicio
 */
export const createService = async (userId: string, service: Service) => {
  try {
    const docRef = await addDoc(getServicesCollection(userId), service);
    console.log("Servicio creado con ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error añadiendo servicio: ", e);
    throw e;
  }
};

/**
 * Obtiene todos los servicios
 */
export const getServices = async (userId: string) => {
  try {
    const q = query(
      getServicesCollection(userId),
      // orderBy("order", "asc"), // Reverting to avoid index errors
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const services: Service[] = [];
    querySnapshot.forEach((doc) => {
      // Convertir Timestamp a Date
      const data = doc.data();
      services.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate
          ? data.createdAt.toDate()
          : new Date(),
      } as Service);
    });
    return services;
  } catch (e) {
    console.error("Error obteniendo servicios: ", e);
    throw e;
  }
};

/**
 * Actualizar servicio
 */
export const updateService = async (
  userId: string,
  serviceId: string,
  data: Partial<Service>
) => {
  try {
    const ref = doc(db, "users", userId, "services", serviceId);
    await updateDoc(ref, data);
  } catch (e) {
    console.error(e);
    throw e;
  }
};

/**
 * Eliminar servicio y TODA su data (Cascade)
 */
export const deleteService = async (userId: string, serviceId: string) => {
  try {
    // 1. Eliminar Suscriptores (y sus deudas)
    const subsSnapshot = await getDocs(
      collection(db, "users", userId, "services", serviceId, "subscribers")
    );
    for (const subDoc of subsSnapshot.docs) {
      // Eliminar deudas del suscriptor
      const debtsSnapshot = await getDocs(
        collection(
          db,
          "users",
          userId,
          "services",
          serviceId,
          "subscribers",
          subDoc.id,
          "debts"
        )
      );
      for (const debtDoc of debtsSnapshot.docs) {
        await deleteDoc(debtDoc.ref);
      }
      await deleteDoc(subDoc.ref);
    }

    // 2. Eliminar OwnerDebts
    const ownerDebtsSnapshot = await getDocs(
      collection(db, "users", userId, "services", serviceId, "owner_debts")
    );
    for (const d of ownerDebtsSnapshot.docs) {
      await deleteDoc(d.ref);
    }

    // 3. Eliminar Servicio
    await deleteDoc(doc(db, "users", userId, "services", serviceId));
  } catch (e) {
    console.error(e);
    throw e;
  }
};

/**
 * Pagar deuda del dueño (Egreso real)
 */
export const payOwnerDebt = async (
  userId: string,
  serviceId: string,
  debt: OwnerDebt,
  paymentDate?: Date
) => {
  try {
    // 1. Actualizar estado a pagado
    const debtRef = doc(
      db,
      "users",
      userId,
      "services",
      serviceId,
      "owner_debts",
      debt.id!
    );
    const dateToRecord = paymentDate || new Date();

    await updateDoc(debtRef, {
      status: "paid",
      paidAt: dateToRecord,
    });

    // 2. Registrar Transacción (Egreso)
    // Necesitamos el nombre del servicio, lo obtenemos:
    const serviceDoc = await getDoc(
      doc(db, "users", userId, "services", serviceId)
    );
    const serviceName = serviceDoc.exists()
      ? serviceDoc.data().name
      : "Servicio";

    await addTransaction(userId, {
      type: "expense",
      amount: debt.amount,
      category: "Servicios",
      description: `Pago mensual ${serviceName} (${debt.month})`,
      date: dateToRecord,
      serviceId: serviceId,
    });
  } catch (e) {
    console.error(e);
    throw e;
  }
};

/**
 * Verificar y generar deudas automáticas (Lazy Check)
 * Se ejecuta al entrar al detalle del servicio.
 * Genera "Mis Pagos" (OwnerDebts) basados en la fecha de corte.
 */
export const checkAndGenerateServiceDebts = async (
  userId: string,
  service: Service
) => {
  try {
    const today = new Date();
    const billingDay = service.billingDay;

    // Use startDate if available. Handle Firebase Timestamp (toDate) or Date object.
    const getJsDate = (d: any) =>
      d?.toDate ? d.toDate() : new Date(d || new Date());
    const startCursor = getJsDate(service.startDate || service.createdAt);

    // Iterar mes a mes desde startCursor hasta hoy
    let cursor = new Date(startCursor);
    // Ajustar cursor al primer día del mes de inicio
    cursor.setDate(1);
    cursor.setHours(0, 0, 0, 0);

    // Obtener deudas existentes
    const q = query(
      collection(db, "users", userId, "services", service.id!, "owner_debts")
    );
    const snapshot = await getDocs(q);
    const existingMonths = snapshot.docs.map((d) => d.data().month);

    while (cursor <= today) {
      const year = cursor.getFullYear();
      const monthIndex = cursor.getMonth();
      const monthName = monthsEs[monthIndex];
      const monthLabel = `${monthName} ${year}`;

      // Fecha de corte de ESTE mes cursor
      // Si hoy es Enero 5, y el corte es el 15. Enero NO se cobra hasta el 15.
      // Si el cursor es Enero.
      const cutOffDate = new Date(year, monthIndex, billingDay);

      // Solo generamos si YA PASÓ la fecha de corte
      // Ojo: Si hoy es 20 Enero y corte es 15, Genera Enero.
      // Si hoy es 10 Enero y corte es 15, NO genera Enero aún.
      if (today >= cutOffDate) {
        if (!existingMonths.includes(monthLabel)) {
          // Generar Deuda
          const newDebt: OwnerDebt = {
            month: monthLabel,
            amount: service.cost,
            status: "pending",
            createdAt: new Date(),
          };
          await addDoc(
            collection(
              db,
              "users",
              userId,
              "services",
              service.id!,
              "owner_debts"
            ),
            newDebt
          );
          console.log(`Generated Owner Debt: ${monthLabel}`);
        }
      }

      cursor.setMonth(cursor.getMonth() + 1);
    }
  } catch (e) {
    console.error(e);
  }
};

/**
 * Actualizar orden de servicios en Batch
 */
export const updateServiceOrder = async (
  userId: string,
  services: Service[]
) => {
  try {
    const { writeBatch } = await import("firebase/firestore");
    const { db } = await import("../config/firebaseConfig"); // Ensure db is imported if not available in scope or use existing import
    const { doc } = await import("firebase/firestore");

    const batch = writeBatch(db);

    services.forEach((service, index) => {
      if (!service.id) return;
      const ref = doc(db, "users", userId, "services", service.id);
      batch.update(ref, { order: index });
    });

    await batch.commit();
    console.log("Orden de servicios actualizado");
  } catch (e) {
    console.error("Error actualizando orden: ", e);
    throw e;
  }
};
