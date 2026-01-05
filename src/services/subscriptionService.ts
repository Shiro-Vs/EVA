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
import { addTransaction } from "./transactionService";

// --- Tipos ---
export interface Service {
  id?: string;
  name: string;
  cost: number; // Costo total del servicio
  billingDay: number; // Día del mes que se paga
  icon?: string;
  createdAt: Date;
}

export interface Subscriber {
  id?: string;
  name: string;
  quota: number; // Cuánto paga esta persona
  startDate: Date;
}

export interface Debt {
  id?: string;
  month: string; // "Enero 2024"
  amount: number;
  status: "pending" | "paid";
  paidAt?: Date;
}

export interface ServicePayment {
  id?: string;
  amount: number;
  date: Date;
  note?: string;
}

export interface OwnerDebt {
  id?: string;
  month: string;
  amount: number;
  status: "pending" | "paid";
  paidAt?: Date;
  createdAt: Date;
}

// --- Funciones Principales ---

/** Crea un nuevo servicio */
export const createService = async (userId: string, service: Service) => {
  try {
    const ref = collection(db, "users", userId, "services");
    await addDoc(ref, {
      ...service,
      createdAt: new Date(),
    });
    console.log("✅ Servicio creado");
  } catch (e) {
    console.error("Error creating service:", e);
    throw e;
  }
};

/** Obtiene todos los servicios */
export const getServices = async (userId: string) => {
  try {
    const ref = collection(db, "users", userId, "services");
    // const q = query(ref, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(ref);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Service[];
  } catch (e) {
    console.error(e);
    return [];
  }
};

/** Agrega un suscriptor a un servicio y le genera la deuda del mes actual */
export const addSubscriber = async (
  userId: string,
  serviceId: string,
  subscriber: Subscriber
) => {
  try {
    const ref = collection(
      db,
      "users",
      userId,
      "services",
      serviceId,
      "subscribers"
    );
    const subDoc = await addDoc(ref, {
      ...subscriber,
      startDate: new Date(),
    });

    // Generar deuda del mes actual (opcional, pero buena UX)
    await generateDebt(userId, serviceId, subDoc.id, subscriber.quota);

    return subDoc.id;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

/** Genera una deuda manual (o automática) para un suscriptor */
export const generateDebt = async (
  userId: string,
  serviceId: string,
  subscriberId: string,
  amount: number,
  monthLabel?: string
) => {
  try {
    const month =
      monthLabel ||
      new Date().toLocaleString("es-ES", { month: "long", year: "numeric" });

    const ref = collection(
      db,
      "users",
      userId,
      "services",
      serviceId,
      "subscribers",
      subscriberId,
      "debts"
    );
    await addDoc(ref, {
      month,
      amount,
      status: "pending",
      createdAt: new Date(),
    });
  } catch (e) {
    console.error(e);
  }
};

/** Marca una deuda como PAGADA y genera el INGRESO en la billetera */
export const paySubscriberDebt = async (
  userId: string,
  serviceId: string,
  subscriberId: string,
  debtId: string,
  amount: number,
  debtMonth: string
) => {
  try {
    // 1. Actualizar deuda a 'paid'
    const debtRef = doc(
      db,
      "users",
      userId,
      "services",
      serviceId,
      "subscribers",
      subscriberId,
      "debts",
      debtId
    );
    await updateDoc(debtRef, {
      status: "paid",
      paidAt: new Date(),
    });

    // 2. Crear INGRESO en Billetera
    await addTransaction(userId, {
      type: "income",
      amount: amount,
      category: "Suscripciones",
      description: `Pago ${debtMonth} (Suscripción)`,
      date: new Date(),
    });
    console.log("✅ Deuda pagada e ingreso registrado");
  } catch (e) {
    console.error(e);
    throw e;
  }
};

/** LÓGICA PARA ADELANTAR MESES **/

/** Parsea "Enero 2024" y devuelve el Date del mes siguiente 1ro */
/** Parsea "Enero 2024" o "Enero de 2024" y devuelve el Date del mes siguiente 1ro */
const getNextMonthDate = (currentMonthLabel: string): Date => {
  // Mapeo simple de meses en español
  const monthsEs = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];

  // Normalizar: minúsculas y eliminar " de " si existe
  const normalized = currentMonthLabel.toLowerCase().replace(" de ", " ");
  const parts = normalized.split(" ").filter((p) => p.trim() !== "");

  if (parts.length < 2) return new Date(); // Fallback hoy

  const monthIndex = monthsEs.indexOf(parts[0]);
  const year = parseInt(parts[parts.length - 1]); // El año suele estar al final

  if (monthIndex === -1 || isNaN(year)) return new Date();

  // Crear fecha del mes actual (día 1)
  const current = new Date(year, monthIndex, 1);
  // Sumar 1 mes
  current.setMonth(current.getMonth() + 1);
  return current;
};

/** Genera etiqueta "Febrero 2024" desde un Date */
const formatMonthLabel = (date: Date): string => {
  return date.toLocaleString("es-ES", { month: "long", year: "numeric" });
  // Nota: toLocaleString a veces da minúsculas "enero", ajustamos a Title Case si se desea visualmente
  // pero para consistencia interna mantengamos lo que salga o hagamos mayúscula la primera.
  // Vamos a capitalizar la primera letra.
  const label = date.toLocaleString("es-ES", {
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
};

/**
 * Paga X meses por adelantado.
 * Prioriza pagar deudas PENDIENTES antiguas primero.
 * Si sobran meses, crea nuevas deudas futuras.
 * Crea 1 solo ingreso en Billetera por el total.
 */
export const payMultipleMonths = async (
  userId: string,
  serviceId: string,
  subscriber: Subscriber,
  numberOfMonths: number,
  allDebts: Debt[] = [] // Pasamos todas las deudas para analizar
) => {
  try {
    const totalAmount = subscriber.quota * numberOfMonths;

    // 1. Identificar y ordenar deudas pendientes
    // Helper para parsear fechas
    const parseMonth = (m: string) => {
      const monthsEs = [
        "enero",
        "febrero",
        "marzo",
        "abril",
        "mayo",
        "junio",
        "julio",
        "agosto",
        "septiembre",
        "octubre",
        "noviembre",
        "diciembre",
      ];

      const normalized = m.toLowerCase().replace(" de ", " ");
      const parts = normalized.split(" ").filter((p) => p.trim() !== "");

      if (parts.length < 2) return 0;

      const midx = monthsEs.indexOf(parts[0]);
      const y = parseInt(parts[parts.length - 1]);

      if (midx === -1 || isNaN(y)) return 0;
      return new Date(y, midx, 1).getTime();
    };

    const pendingDebts = allDebts
      .filter((d) => d.status === "pending")
      .sort((a, b) => parseMonth(a.month) - parseMonth(b.month)); // Ascendente (más viejas primero)

    let monthsRemaning = numberOfMonths;

    // 2. Pagar deudas pendientes (hasta que se acaben los meses o las deudas)
    for (const debt of pendingDebts) {
      if (monthsRemaning <= 0) break;

      const debtRef = doc(
        db,
        "users",
        userId,
        "services",
        serviceId,
        "subscribers",
        subscriber.id!,
        "debts",
        debt.id!
      );

      await updateDoc(debtRef, {
        status: "paid",
        paidAt: new Date(),
      });

      monthsRemaning--;
    }

    // 3. Si aún quedan meses por cubrir, generar nuevos a futuro
    if (monthsRemaning > 0) {
      // Encontrar la fecha base: la última deuda existente (sea pagada o pendiente) o HOY
      let startDate: Date;

      if (allDebts.length > 0) {
        // Ordenar todas por fecha descendente para encontrar la última
        const sortedAll = [...allDebts].sort(
          (a, b) => parseMonth(b.month) - parseMonth(a.month)
        );
        const lastDebt = sortedAll[0];
        startDate = getNextMonthDate(lastDebt.month);
      } else {
        startDate = new Date();
      }

      for (let i = 0; i < monthsRemaning; i++) {
        const iterDate = new Date(startDate);
        iterDate.setMonth(startDate.getMonth() + i);

        const monthLabel = formatMonthLabel(iterDate);

        const ref = collection(
          db,
          "users",
          userId,
          "services",
          serviceId,
          "subscribers",
          subscriber.id!,
          "debts"
        );

        await addDoc(ref, {
          month: monthLabel,
          amount: subscriber.quota,
          status: "paid",
          paidAt: new Date(),
          createdAt: new Date(),
        });
      }
    }

    // 4. Registrar UN SOLO ingreso en Billetera por el total original
    await addTransaction(userId, {
      type: "income",
      amount: totalAmount,
      category: "Suscripciones",
      description: `Adelanto ${numberOfMonths} meses (${subscriber.name})`,
      date: new Date(),
    });

    console.log(
      `✅ Procesado: ${
        numberOfMonths - monthsRemaning
      } pendientes pagadas, ${monthsRemaning} nuevas creadas.`
    );
  } catch (e) {
    console.error("Error pagando meses adelantados", e);
    throw e;
  }
};

/** Registra que YO pagué el servicio (EGRESO) */
export const recordServicePayment = async (
  userId: string,
  serviceId: string,
  serviceName: string,
  amount: number
) => {
  try {
    // 1. Guardar en histórico de pagos del servicio
    const paymentsRef = collection(
      db,
      "users",
      userId,
      "services",
      serviceId,
      "owner_payments"
    );
    await addDoc(paymentsRef, {
      amount,
      date: new Date(),
    });

    // 2. Crear EGRESO en Billetera
    await addTransaction(userId, {
      type: "expense",
      amount: amount,
      category: "Servicios",
      description: `Pago Mensual ${serviceName}`,
      date: new Date(),
    });
    console.log("✅ Pago de servicio registrado y egreso creado");
  } catch (e) {
    console.error(e);
    throw e;
  }
};

/** Eliminar una deuda (Mes). Si estaba pagada, reembolsa */
export const deleteSubscriberDebt = async (
  userId: string,
  serviceId: string,
  subscriberId: string,
  debt: Debt
) => {
  try {
    // 1. Si es PAID, crear reembolso
    if (debt.status === "paid") {
      await addTransaction(userId, {
        type: "expense",
        amount: debt.amount,
        category: "Reembolso",
        description: `Corrección: Eliminado ${debt.month}`,
        date: new Date(),
      });
    }

    // 2. Eliminar documento
    const debtRef = doc(
      db,
      "users",
      userId,
      "services",
      serviceId,
      "subscribers",
      subscriberId,
      "debts",
      debt.id!
    );
    await deleteDoc(debtRef);
  } catch (e) {
    console.error("Error deleting debt:", e);
    throw e;
  }
};

/** Revertir a PENDIENTE. Si estaba pagada, reembolsa */
export const revertDebtToPending = async (
  userId: string,
  serviceId: string,
  subscriberId: string,
  debt: Debt
) => {
  try {
    if (debt.status === "pending") return; // Nada que hacer

    // 1. Reembolso
    await addTransaction(userId, {
      type: "expense",
      amount: debt.amount,
      category: "Reembolso",
      description: `Corrección: ${debt.month} a Pendiente`,
      date: new Date(),
    });

    // 2. Actualizar estado
    const debtRef = doc(
      db,
      "users",
      userId,
      "services",
      serviceId,
      "subscribers",
      subscriberId,
      "debts",
      debt.id!
    );
    await updateDoc(debtRef, {
      status: "pending",
      paidAt: null as any, // Borrar fecha pago
    });
  } catch (e) {
    console.error("Error reverting debt:", e);
    throw e;
  }
};

/** Actualizar datos del suscriptor */
export const updateSubscriber = async (
  userId: string,
  serviceId: string,
  subscriberId: string,
  data: Partial<Subscriber>
) => {
  try {
    const ref = doc(
      db,
      "users",
      userId,
      "services",
      serviceId,
      "subscribers",
      subscriberId
    );
    await updateDoc(ref, data);
    console.log("✅ Suscriptor actualizado");
  } catch (e) {
    console.error("Error updating subscriber:", e);
    throw e;
  }
};

/** Eliminar suscriptor y sus deudas (NO las transacciones de billetera) */
export const deleteSubscriber = async (
  userId: string,
  serviceId: string,
  subscriberId: string
) => {
  try {
    // 1. Eliminar subcolección de deudas (manualmente documento por documento)
    // Firestore no borra subcolecciones con deleteDoc automáticamente.
    const debtsRef = collection(
      db,
      "users",
      userId,
      "services",
      serviceId,
      "subscribers",
      subscriberId,
      "debts"
    );
    const snapshot = await getDocs(debtsRef);
    const deletePromises = snapshot.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(deletePromises);

    // 2. Eliminar documento del suscriptor
    const subRef = doc(
      db,
      "users",
      userId,
      "services",
      serviceId,
      "subscribers",
      subscriberId
    );
    await deleteDoc(subRef);
    console.log("✅ Suscriptor eliminado");
  } catch (e) {
    console.error("Error deleting subscriber:", e);
    throw e;
  }
};

/** Verificar y generar deudas automáticas (Lazy Check) */
export const checkAndGenerateServiceDebts = async (
  userId: string,
  service: Service
) => {
  try {
    const today = new Date();
    // 1. Chequear si ya pasó el día de corte este mes
    // Si hoy es 5 y el corte es el 4, ya pasó.
    // Si hoy es 3 y el corte es el 4, no pasó.
    if (today.getDate() < service.billingDay) {
      // Aún no es fecha de corte, no hacer nada para ESTE mes.
      return;
    }

    // Generar label del mes actual
    const currentMonthLabel = formatMonthLabel(today);

    // --- A. DEUDA DEL DUEÑO (OwnerDebt) ---
    const ownerDebtsRef = collection(
      db,
      "users",
      userId,
      "services",
      service.id!,
      "owner_debts"
    );
    // Consultar si existe deuda para este mes
    const qOwner = query(ownerDebtsRef);
    const snapshotOwner = await getDocs(qOwner);
    const existsOwner = snapshotOwner.docs.some(
      (doc) => doc.data().month === currentMonthLabel
    );

    if (!existsOwner) {
      await addDoc(ownerDebtsRef, {
        month: currentMonthLabel,
        amount: service.cost,
        status: "pending",
        createdAt: new Date(),
      });
      console.log(`✅ Owner Debt generada para ${currentMonthLabel}`);
    }

    // --- B. DEUDA DE SUSCRIPTORES ---
    // Obtener suscriptores
    const subscribersRef = collection(
      db,
      "users",
      userId,
      "services",
      service.id!,
      "subscribers"
    );
    const subSnapshot = await getDocs(subscribersRef);

    for (const subDoc of subSnapshot.docs) {
      const subData = subDoc.data() as Subscriber;
      const subId = subDoc.id;

      // Chequear si existe la deuda para este suscriptor
      const debtRef = collection(
        db,
        "users",
        userId,
        "services",
        service.id!,
        "subscribers",
        subId,
        "debts"
      );
      const debtsSnap = await getDocs(debtRef);
      const existsSubDebt = debtsSnap.docs.some(
        (d) => d.data().month === currentMonthLabel
      );

      if (!existsSubDebt) {
        await addDoc(debtRef, {
          month: currentMonthLabel,
          amount: subData.quota,
          status: "pending",
          createdAt: new Date(),
        });
        console.log(
          `✅ Subscriber Debt generada para ${subData.name} - ${currentMonthLabel}`
        );
      }
    }
  } catch (e) {
    console.error("Error en Lazy Check:", e);
  }
};

/** Pagar deuda del dueño (Egreso real) */
export const payOwnerDebt = async (
  userId: string,
  serviceId: string,
  debt: OwnerDebt
) => {
  try {
    // 1. Actualizar estado
    const debtRef = doc(
      db,
      "users",
      userId,
      "services",
      serviceId,
      "owner_debts",
      debt.id!
    );
    await updateDoc(debtRef, {
      status: "paid",
      paidAt: new Date(),
    });

    // 2. Crear Egreso en Billetera
    await addTransaction(userId, {
      type: "expense",
      amount: debt.amount,
      category: "Servicios",
      description: `Pago Mensual ${debt.month}`,
      date: new Date(),
    });
  } catch (e) {
    console.error("Error pagando owner debt:", e);
    throw e;
  }
};

/** Actualizar servicio */
export const updateService = async (
  userId: string,
  serviceId: string,
  data: Partial<Service>
) => {
  try {
    const ref = doc(db, "users", userId, "services", serviceId);
    await updateDoc(ref, data);
    console.log("✅ Servicio actualizado");
  } catch (e) {
    console.error("Error actualizando servicio", e);
    throw e;
  }
};

/** Eliminar servicio y TODA su data (Cascade) */
export const deleteService = async (userId: string, serviceId: string) => {
  try {
    const serviceRef = doc(db, "users", userId, "services", serviceId);

    // 1. Borrar Owner Debts
    const ownerDebtsRef = collection(
      db,
      "users",
      userId,
      "services",
      serviceId,
      "owner_debts"
    );
    const odSnap = await getDocs(ownerDebtsRef);
    await Promise.all(odSnap.docs.map((d) => deleteDoc(d.ref)));

    // 2. Borrar Owner Payments (Legacy/Historial)
    const ownerPaysRef = collection(
      db,
      "users",
      userId,
      "services",
      serviceId,
      "owner_payments"
    );
    const opSnap = await getDocs(ownerPaysRef);
    await Promise.all(opSnap.docs.map((d) => deleteDoc(d.ref)));

    // 3. Borrar Suscriptores y SUS deudas
    const subsRef = collection(
      db,
      "users",
      userId,
      "services",
      serviceId,
      "subscribers"
    );
    const subsSnap = await getDocs(subsRef);

    for (const sub of subsSnap.docs) {
      const subDebtsRef = collection(
        db,
        "users",
        userId,
        "services",
        serviceId,
        "subscribers",
        sub.id,
        "debts"
      );
      const subDebtsSnap = await getDocs(subDebtsRef);
      await Promise.all(subDebtsSnap.docs.map((d) => deleteDoc(d.ref))); // Borrar deudas
      await deleteDoc(sub.ref); // Borrar suscriptor
    }

    // 4. Borrar Servicio
    await deleteDoc(serviceRef);
    console.log("✅ Servicio eliminado completamente");
  } catch (e) {
    console.error("Error eliminando servicio", e);
    throw e;
  }
};
