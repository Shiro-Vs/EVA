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

export interface Category {
  id?: string;
  name: string;
  icon: string;
  color: string;
  createdAt?: string; // ISO string or Timestamp
  isDefault?: boolean;
}

const getCollection = (userId: string) =>
  collection(db, "users", userId, "categories");

export const addCategory = async (userId: string, category: Category) => {
  try {
    const ref = getCollection(userId);
    await addDoc(ref, {
      ...category,
      createdAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error("Error adding category:", e);
    throw e;
  }
};

export const getCategories = async (userId: string) => {
  try {
    const q = query(getCollection(userId), orderBy("createdAt", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Category[];
  } catch (e) {
    console.error("Error fetching categories:", e);
    return [];
  }
};

export const updateCategory = async (
  userId: string,
  categoryId: string,
  data: Partial<Category>
) => {
  try {
    const ref = doc(db, "users", userId, "categories", categoryId);
    await updateDoc(ref, data);
  } catch (e) {
    console.error("Error updating category:", e);
    throw e;
  }
};

export const deleteCategory = async (userId: string, categoryId: string) => {
  try {
    const ref = doc(db, "users", userId, "categories", categoryId);
    await deleteDoc(ref);
  } catch (e) {
    console.error("Error deleting category:", e);
    throw e;
  }
};

// Default Categories for new users (helper)
export const DEFAULT_CATEGORIES: Omit<Category, "id">[] = [
  { name: "Comida", icon: "fast-food", color: "#FF6B6B" },
  { name: "Transporte", icon: "bus", color: "#4ECDC4" },
  { name: "Ocio", icon: "game-controller", color: "#FFE66D" },
  { name: "Salud", icon: "medkit", color: "#FF9F43" },
  { name: "Educación", icon: "school", color: "#54A0FF" },
  { name: "Salario", icon: "cash", color: "#2ECC71" },
  { name: "Regalos", icon: "gift", color: "#FD79A8" },
];
