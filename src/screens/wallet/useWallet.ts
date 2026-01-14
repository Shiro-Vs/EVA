import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { auth } from "../../config/firebaseConfig";
import {
  getTransactions,
  Transaction,
} from "../../services/transactionService";

export const useWallet = () => {
  const [filter, setFilter] = useState<"income" | "expense">("income");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    const data = await getTransactions(user.uid, filter);
    setTransactions(data);
    setLoading(false);
  };

  // Cargar datos cada vez que la pantalla se enfoca
  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [filter])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  return {
    filter,
    setFilter,
    transactions,
    loading,
    refreshing,
    onRefresh,
  };
};
