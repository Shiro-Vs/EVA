import { db } from "../config/firebaseConfig";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { Subscriber } from "./types";
import { generateDebt } from "./debtService";

/**
 * Agrega un suscriptor a un servicio y le genera la deuda del mes actual
 */
export const addSubscriber = async (
  userId: string,
  serviceId: string,
  subscriber: Subscriber
) => {
  try {
    const docRef = await addDoc(
      collection(db, "users", userId, "services", serviceId, "subscribers"),
      subscriber
    );
    const subId = docRef.id;

    // Generar deuda del mes actual automáticamente
    // OJO: Si hoy es 20 de Enero, genera Enero.
    await generateDebt(userId, serviceId, subId, subscriber.quota);

    return subId;
  } catch (e) {
    console.error("Error añadiendo suscriptor: ", e);
    throw e;
  }
};

/**
 * Actualizar datos del suscriptor
 */
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
  } catch (e) {
    console.error(e);
    throw e;
  }
};

/**
 * Eliminar suscriptor y sus deudas (NO las transacciones de billetera)
 */
export const deleteSubscriber = async (
  userId: string,
  serviceId: string,
  subscriberId: string
) => {
  try {
    // 1. Eliminar sus deudas (Subcolección)
    const debtsSnapshot = await getDocs(
      collection(
        db,
        "users",
        userId,
        "services",
        serviceId,
        "subscribers",
        subscriberId,
        "debts"
      )
    );
    for (const d of debtsSnapshot.docs) {
      await deleteDoc(d.ref);
    }

    // 2. Eliminar el documento del suscriptor
    await deleteDoc(
      doc(
        db,
        "users",
        userId,
        "services",
        serviceId,
        "subscribers",
        subscriberId
      )
    );
  } catch (e) {
    console.error(e);
    throw e;
  }
};
