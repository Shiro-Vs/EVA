import { db } from "../config/firebaseConfig";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  getDocs,
  orderBy,
  Timestamp,
} from "firebase/firestore";

export interface Account {
  id?: string;
  name: string;
  icon: string;
  color: string;
  currency: string;
  initialBalance: number;
  currentBalance: number;
  type?: "bank" | "cash" | "wallet" | "other"; // Deprecated, keeping optional for legacy
  createdAt?: Date;
  isDefault?: boolean;
}

const getCollection = (userId: string) =>
  collection(db, "users", userId, "accounts");

export const addAccount = async (userId: string, account: Account) => {
  try {
    const ref = getCollection(userId);
    await addDoc(ref, {
      ...account,
      createdAt: new Date(),
    });
  } catch (e) {
    console.error("Error adding account:", e);
    throw e;
  }
};

export const getAccounts = async (userId: string) => {
  try {
    const q = query(getCollection(userId), orderBy("createdAt", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Account[];
  } catch (e) {
    console.error("Error fetching accounts:", e);
    return [];
  }
};

export const deleteAccount = async (userId: string, accountId: string) => {
  try {
    const ref = doc(db, "users", userId, "accounts", accountId);
    await deleteDoc(ref);
  } catch (e) {
    console.error("Error deleting account:", e);
    throw e;
  }
};

export const updateAccount = async (
  userId: string,
  accountId: string,
  data: Partial<Account>
) => {
  try {
    const ref = doc(db, "users", userId, "accounts", accountId);
    await updateDoc(ref, data);
  } catch (e) {
    console.error("Error updating account:", e);
    throw e;
  }
};
