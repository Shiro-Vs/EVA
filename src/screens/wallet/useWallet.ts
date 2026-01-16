import { useState, useCallback, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { auth, db } from "../../config/firebaseConfig";
import { Transaction } from "../../services/transactionService";
import { getServices } from "../../services/serviceManager";
import { getCategories, Category } from "../../services/categoryService";
import { getAccounts, Account } from "../../services/accountService";
import {
  collection,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";

export const useWallet = () => {
  // Data State
  const [rawTransactions, setRawTransactions] = useState<Transaction[]>([]);
  const [incomeTransactions, setIncomeTransactions] = useState<Transaction[]>(
    []
  );
  const [expenseTransactions, setExpenseTransactions] = useState<Transaction[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Global Filter Options (True Source of Truth)
  const [globalCategories, setGlobalCategories] = useState<Category[]>([]);
  const [globalServices, setGlobalServices] = useState<
    {
      name: string;
      icon?: string;
      color?: string;
      iconLibrary?: string;
    }[]
  >([]);
  const [globalSubscribers, setGlobalSubscribers] = useState<
    { name: string; color?: string }[]
  >([]);
  const [globalAccounts, setGlobalAccounts] = useState<Account[]>([]);

  // Unified Active Filters State
  const [activeFilters, setActiveFilters] = useState<{
    months: string[]; // Format: "YYYY-MM"
    categories: string[];
    services: string[];
    subscribers: string[];
    accounts: string[];
  }>({
    months: [],
    categories: [],
    services: [],
    subscribers: [],
    accounts: [],
  });

  const fetchGlobalFilterOptions = async () => {
    // ... (Keep existing fetch logic)
    const user = auth.currentUser;
    if (!user) return;

    try {
      // 1. Fetch All Categories
      const cats = await getCategories(user.uid);
      setGlobalCategories(cats);

      // 2. Fetch All Services
      const services = await getServices(user.uid);
      // Dedup service names but keep metadata (icon/color)
      const uniqueServicesMap = new Map<
        string,
        {
          name: string;
          icon?: string;
          color?: string;
          iconLibrary?: string;
        }
      >();
      services.forEach((s) => {
        if (!uniqueServicesMap.has(s.name)) {
          uniqueServicesMap.set(s.name, {
            name: s.name,
            icon: s.icon || undefined,
            color: s.color || undefined,
            iconLibrary: s.iconLibrary || "Ionicons",
          });
        }
      });
      setGlobalServices(
        Array.from(uniqueServicesMap.values()).sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );

      // 3. Fetch All Subscribers from ALL Services
      const uniqueSubscribersMap = new Map<
        string,
        { name: string; color?: string }
      >();

      await Promise.all(
        services.map(async (service) => {
          if (!service.id) return;
          try {
            const subsSnapshot = await getDocs(
              collection(
                db,
                "users",
                user.uid,
                "services",
                service.id,
                "subscribers"
              )
            );
            subsSnapshot.forEach((doc) => {
              const data = doc.data();
              if (data.name && typeof data.name === "string") {
                // Normalize: remove extra spaces, trim
                const cleanName = data.name.replace(/\s+/g, " ").trim();
                if (cleanName.length > 0) {
                  if (!uniqueSubscribersMap.has(cleanName)) {
                    uniqueSubscribersMap.set(cleanName, {
                      name: cleanName,
                      color: data.color,
                    });
                  }
                }
              }
            });
          } catch (err) {
            console.warn(
              `Error fetching subs for service ${service.name}`,
              err
            );
          }
        })
      );

      setGlobalSubscribers(
        Array.from(uniqueSubscribersMap.values()).sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );

      // 4. Fetch All Accounts
      const accs = await getAccounts(user.uid);
      setGlobalAccounts(accs);
    } catch (e) {
      console.error("Error fetching global filter options", e);
    }
  };

  // Initial Load of Global Options
  useEffect(() => {
    fetchGlobalFilterOptions();
  }, []);

  // Real-time Transactions Listener
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    const q = query(
      collection(db, "users", user.uid, "transactions"),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: (doc.data().date as Timestamp).toDate(),
        })) as Transaction[];

        setRawTransactions(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to transactions:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Apply Filters Effect
  useEffect(() => {
    let filtered = rawTransactions;

    // Date/Month Filter (Multi-select)
    if (activeFilters.months.length > 0) {
      filtered = filtered.filter((t: any) => {
        const tDate = t.date?.toDate ? t.date.toDate() : new Date(t.date);
        // Format YYYY-MM
        const key = `${tDate.getFullYear()}-${String(
          tDate.getMonth() + 1
        ).padStart(2, "0")}`;
        return activeFilters.months.includes(key);
      });
    }

    // Multi-select Logic (OR within category)
    if (activeFilters.categories.length > 0) {
      filtered = filtered.filter((t) =>
        activeFilters.categories.includes(t.categoryName)
      );
    }
    if (activeFilters.services.length > 0) {
      filtered = filtered.filter(
        (t) => t.serviceName && activeFilters.services.includes(t.serviceName)
      );
    }
    if (activeFilters.subscribers.length > 0) {
      filtered = filtered.filter(
        (t) =>
          t.subscriberName &&
          activeFilters.subscribers.includes(t.subscriberName)
      );
    }
    if (activeFilters.accounts.length > 0) {
      filtered = filtered.filter((t) =>
        activeFilters.accounts.includes(t.accountName)
      );
    }

    // Split
    const income = filtered.filter((t) => t.type === "income");
    const expense = filtered.filter((t) => t.type === "expense");

    setIncomeTransactions(income);
    setExpenseTransactions(expense);
  }, [rawTransactions, activeFilters]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGlobalFilterOptions();
    // Transactions update automatically via listener, but we could mock a wait if needed
    setRefreshing(false);
  };

  const applyFilters = (newFilters: Partial<typeof activeFilters>) => {
    setActiveFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setActiveFilters({
      months: [],
      categories: [],
      services: [],
      subscribers: [],
      accounts: [],
    });
  };

  const setMonthsFilter = (months: string[]) => {
    setActiveFilters((prev) => ({ ...prev, months }));
  };

  // Deprecated/Adapter for single date if needed (removed)

  return {
    incomeTransactions,
    expenseTransactions,
    loading,
    refreshing,
    onRefresh,
    activeFilters,
    applyFilters,
    clearFilters,
    setMonthsFilter, // New
    uniqueCategories: globalCategories,
    uniqueServices: globalServices,
    uniqueSubscribers: globalSubscribers,
    uniqueAccounts: globalAccounts,
  };
};
