import { db } from "../config/firebaseConfig";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

// Definimos la estructura de un Usuario en la BD
export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Date;
  photoURL?: string;
  // Campos futuros para la billetera
  balance?: number;
  currency?: string;
}

/**
 * Crea el registro del usuario en Firestore usando su UID como ID del documento
 */
export const createUserRecord = async (user: any, name: string) => {
  try {
    const userRef = doc(db, "users", user.uid);
    const userData: UserData = {
      uid: user.uid,
      email: user.email,
      displayName: name,
      createdAt: new Date(),
      balance: 0, // Saldo inicial
      currency: "USD",
    };

    await setDoc(userRef, userData);
    console.log("✅ Usuario guardado en BD:", user.uid);
  } catch (e) {
    console.error("Error guardando usuario en BD:", e);
    throw e;
  }
};

/**
 * Obtiene los datos del usuario desde Firestore
 */
export const getUserData = async (uid: string) => {
  try {
    const userRef = doc(db, "users", uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserData;
    } else {
      console.log("⚠️ No existe documento para este usuario");
      return null;
    }
  } catch (e) {
    console.error("Error obteniendo usuario:", e);
    return null;
  }
};
