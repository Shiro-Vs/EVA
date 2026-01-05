import { db } from "../config/firebaseConfig";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
} from "firebase/firestore";

export interface Transaction {
  id?: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: Date;
}

/**
 * Agrega una transacción a la subcolección del usuario
 */
export const addTransaction = async (
  userId: string,
  transaction: Transaction
) => {
  try {
    const ref = collection(db, "users", userId, "transactions");
    await addDoc(ref, {
      ...transaction,
      date: transaction.date, // Firestore guarda fechas como Timestamp
      createdAt: new Date(),
    });
    console.log("✅ Transacción guardada");
  } catch (e) {
    console.error("Error adding transaction:", e);
    throw e;
  }
};

/**
 * Obtiene las transacciones del usuario ordenadas por fecha
 */
export const getTransactions = async (
  userId: string,
  typeFilter?: "income" | "expense"
) => {
  try {
    const ref = collection(db, "users", userId, "transactions");
    let q = query(ref, orderBy("date", "desc"));

    if (typeFilter) {
      q = query(ref, where("type", "==", typeFilter), orderBy("date", "desc"));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: (doc.data().date as Timestamp).toDate(), // Convertir Timestamp a Date
    })) as Transaction[];
  } catch (e) {
    console.error("Error fetching transactions:", e);
    return [];
  }
};
