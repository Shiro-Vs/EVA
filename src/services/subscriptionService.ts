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

    // 2. Obtener info del suscriptor para el nombre (opcional, o pasarla por param)
    // Asumimos que viene ok.

    // 3. Crear INGRESO en Billetera
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
