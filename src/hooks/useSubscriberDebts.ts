import { useState, useEffect } from "react";
import { onSnapshot, query, orderBy } from "firebase/firestore";
import { Debt } from "../services/types";
import { getDebtsCollection } from "../utils/firestoreUtils";

export const useSubscriberDebts = (
  userId: string | undefined,
  serviceId: string,
  subscriberId: string | undefined
) => {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId || !serviceId || !subscriberId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const debtRef = getDebtsCollection(userId, serviceId, subscriberId);
    const q = query(debtRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Debt[];
        setDebts(data);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching debts:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, serviceId, subscriberId]);

  return { debts, loading, error };
};
