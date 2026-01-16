import { db } from "../config/firebaseConfig";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
  doc,
  runTransaction,
} from "firebase/firestore";

export interface Transaction {
  id?: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  date: Date;
  serviceId?: string;
  // Dynamic fields
  accountId: string; // ID of the account
  accountName: string; // Snapshot for history
  categoryId: string; // ID of the category
  categoryName: string; // Snapshot for history
  categoryIcon: string;
  categoryColor?: string; // Icon color
  // Metadata for detail view
  serviceName?: string;
  subscriberName?: string;
}

/**
 * Agrega una transacción y actualiza el saldo de la cuenta
 */
export const addTransaction = async (
  userId: string,
  transaction: Transaction
) => {
  try {
    await runTransaction(db, async (transactionDb) => {
      // 1. Get Account (READ first)
      const accountRef = doc(
        db,
        "users",
        userId,
        "accounts",
        transaction.accountId
      );
      const accountDoc = await transactionDb.get(accountRef);

      if (!accountDoc.exists()) {
        throw new Error("Account does not exist!");
      }

      // 2. Prepare Transaction Write
      const transactionsRef = collection(db, "users", userId, "transactions");
      const newTransactionRef = doc(transactionsRef);

      transactionDb.set(newTransactionRef, {
        ...transaction,
        date: transaction.date,
        createdAt: new Date(),
      });

      // 3. Calculate and Update Balance (WRITE)
      const currentBalance = accountDoc.data().currentBalance || 0;
      const newBalance =
        transaction.type === "income"
          ? currentBalance + transaction.amount
          : currentBalance - transaction.amount;

      transactionDb.update(accountRef, { currentBalance: newBalance });
    });
  } catch (e) {
    console.error("Error adding transaction:", e);
    throw e;
  }
};

/**
 * Obtiene las transacciones del usuario ordenadas por fecha
 */
/**
 * Obtiene las transacciones del usuario, opcionalmente filtradas por fecha
 */
export const getTransactions = async (
  userId: string,
  startDate?: Date,
  endDate?: Date
) => {
  try {
    const ref = collection(db, "users", userId, "transactions");
    let q = query(ref, orderBy("date", "desc"));

    if (startDate && endDate) {
      q = query(
        ref,
        where("date", ">=", startDate),
        where("date", "<=", endDate),
        orderBy("date", "desc")
      );
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

/**
 * Calcula el balance actual (Ingresos - Egresos)
 */
export const getWalletBalance = async (userId: string) => {
  try {
    const all = await getTransactions(userId);
    const income = all
      .filter((t) => t.type === "income")
      .reduce((acc, curr) => acc + curr.amount, 0);
    const expense = all
      .filter((t) => t.type === "expense")
      .reduce((acc, curr) => acc + curr.amount, 0);
    return income - expense;
  } catch (e) {
    console.error(e);
    return 0;
  }
};
