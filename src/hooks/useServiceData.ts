import { useState, useEffect } from "react";
import { onSnapshot, query, orderBy } from "firebase/firestore";
import {
  checkAndGenerateServiceDebts,
  Subscriber,
  OwnerDebt,
  Service,
} from "../services/subscriptionService";
import {
  getSubscribersCollection,
  getOwnerDebtsCollection,
} from "../utils/firestoreUtils";
// Note: We need to ensure getOwnerDebtsCollection exists in firestoreUtils or add it.

export const useServiceData = (
  userId: string | undefined,
  service: Service
) => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [ownerDebts, setOwnerDebts] = useState<OwnerDebt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !service.id) return;

    setLoading(true);

    // 1. Ejecutar Lazy Check (Generación Automática de deudas del dueño)
    checkAndGenerateServiceDebts(userId, service);

    // 2. Escuchar Suscriptores
    const subRef = getSubscribersCollection(userId, service.id);
    const unsubSub = onSnapshot(subRef, (snapshot) => {
      const subs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Subscriber[];
      setSubscribers(subs);
    });

    // 3. Escuchar Deudas del Dueño (OwnerDebts)
    const ownerDebtsRef = getOwnerDebtsCollection(userId, service.id);
    const qOwner = query(ownerDebtsRef, orderBy("createdAt", "desc"));

    const unsubOwner = onSnapshot(qOwner, (snapshot) => {
      const debts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as OwnerDebt[];
      setOwnerDebts(debts);
      setLoading(false); // Data arrived
    });

    return () => {
      unsubSub();
      unsubOwner();
    };
  }, [userId, service]);

  return { subscribers, ownerDebts, loading };
};
