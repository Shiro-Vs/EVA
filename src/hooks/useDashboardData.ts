import { useState, useEffect } from "react";
import { auth, db } from "../config/firebaseConfig";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  where,
  getDocs,
} from "firebase/firestore";
import { Transaction } from "../services/transactionService";
import { Service } from "../services/subscriptionService";
import {
  startOfMonth,
  endOfMonth,
  isSameMonth,
  subMonths,
  format,
  isSameDay,
  isValid,
} from "date-fns";
import { es } from "date-fns/locale/es";

export interface DashboardData {
  loading: boolean;
  totalBalance: number;
  currentMonthIncome: number;
  currentMonthExpense: number;
  netFlow: number;
  // Insights
  topCategory: { name: string; amount: number; percentage: number } | null;
  antExpenses: { count: number; total: number };
  expensiveDay: { day: string; amount: number } | null;
  // Charts
  trendData: { label: string; value: number; type: "income" | "expense" }[];
  coveragePercentage: number;
  spendingTrend?: { percentage: number; direction: "up" | "down" } | null;
  // Upcoming
  upcomingServices: Service[];
  subscriberStats?: {
    totalSubscribers: number;
    totalDebtors: number;
    topDebtors: { name: string; total: number; breakdown: any[] }[];
  };
  categoryBreakdown: {
    name: string;
    amount: number;
    color: string;
    percentage: number;
  }[];
}

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData>({
    loading: true,
    totalBalance: 0,
    currentMonthIncome: 0,
    currentMonthExpense: 0,
    netFlow: 0,
    topCategory: null,
    antExpenses: { count: 0, total: 0 },
    expensiveDay: null,
    trendData: [],
    coveragePercentage: 0,
    upcomingServices: [],
    categoryBreakdown: [],
  });

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // 1. Listen to Transactions (Last 6 months ideally, but all for now to keep it simple)
    const qTrans = query(
      collection(db, "users", user.uid, "transactions"),
      orderBy("date", "desc")
    );

    console.log("Setting up Dashboard listeners...");

    // 2. Listen to Services (Active)
    const qServices = query(collection(db, "users", user.uid, "services"));

    const unsubscribeTrans = onSnapshot(qTrans, (snapshot) => {
      console.log(`Transactions snapshot: ${snapshot.docs.length} docs`);
      const transactions = snapshot.docs.map((doc) => {
        const d = doc.data();
        // Safe Date Parsing
        let dateObj = new Date();
        if (d.date) {
          if (d.date.toDate) dateObj = d.date.toDate(); // Firestore Timestamp
          else dateObj = new Date(d.date); // String/Number
        }

        return {
          id: doc.id,
          ...d,
          date: dateObj,
        };
      }) as Transaction[];

      console.log("Processing transactions...");
      processDashboardData(transactions);
    });

    const unsubscribeServices = onSnapshot(qServices, (snapshot) => {
      // We need services for "Upcoming" and "Coverage" context
      const services = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Service[];

      // Update data with service contextual info if needed
      // For now, processDashboardData handles transactions.
      // Upcoming services logic is separate calculation.
      processUpcomingServices(services);
    });

    return () => {
      unsubscribeTrans();
      unsubscribeServices();
    };
  }, []);

  const processUpcomingServices = (services: Service[]) => {
    // Calculate next payment dates
    const upcoming = services
      .map((s) => {
        // Clone logic from useServices/getDaysRemaining but return sorting date
        const today = new Date();
        const day = s.billingDay;
        let target = new Date(today.getFullYear(), today.getMonth(), day);
        if (target.getDate() < today.getDate()) {
          target = new Date(today.getFullYear(), today.getMonth() + 1, day);
        }
        return { ...s, nextPaymentDate: target };
      })
      .sort((a, b) => a.nextPaymentDate.getTime() - b.nextPaymentDate.getTime())
      .slice(0, 5); // Return top 5

    setData((prev) => ({ ...prev, upcomingServices: upcoming }));
  };

  const processDashboardData = (transactions: Transaction[]) => {
    const today = new Date();
    const currentMonthStart = startOfMonth(today);
    const currentMonthEnd = endOfMonth(today);

    // 1. Balance & Cashflow
    let income = 0;
    let expense = 0;
    let balance = 0; // Simplified accumulator, usually calculated from accounts but this works for net flow

    // 2. Insights
    const categoryTotals: Record<string, number> = {};
    let antCount = 0;
    let antTotal = 0;
    const dayTotals: Record<string, number> = {};

    // 3. Trend (Last 6 months)
    const trendMap: Record<string, { income: number; expense: number }> = {};
    for (let i = 0; i < 6; i++) {
      const d = subMonths(today, i);
      const key = format(d, "MMM", { locale: es });
      trendMap[key] = { income: 0, expense: 0 };
    }

    console.log(`Processing ${transactions.length} transactions for dashboard`);

    transactions.forEach((t) => {
      // Skip invalid dates to prevent RangeError
      if (!t.date || !isValid(t.date)) return;

      const amount = t.amount;
      const isInc = t.type === "income";

      // Net Balance (Approximation from flow)
      if (isInc) balance += amount;
      else balance -= amount;

      // Current Month Stats
      if (isSameMonth(t.date, today)) {
        if (isInc) income += amount;
        else {
          expense += amount;

          // Category Analysis (Expense only)
          const cat = t.categoryName || "Otros";
          categoryTotals[cat] = (categoryTotals[cat] || 0) + amount;

          // Ant Expenses (< 10 PEN)
          if (amount < 10) {
            antCount++;
            antTotal += amount;
          }

          // Expensive Day
          const dayKey = format(t.date, "EEEE", { locale: es }); // lunes, martes...
          dayTotals[dayKey] = (dayTotals[dayKey] || 0) + amount;
        }
      }

      // Trend Data
      const monthKey = format(t.date, "MMM", { locale: es });
      if (trendMap[monthKey]) {
        if (isInc) trendMap[monthKey].income += amount;
        else trendMap[monthKey].expense += amount;
      }
    });

    // Finalize Insights
    let topCat: { name: string; amount: number; percentage: number } | null =
      null;
    let maxCatVal = 0;
    Object.entries(categoryTotals).forEach(([cat, val]) => {
      if (val > maxCatVal) {
        maxCatVal = val;
        topCat = {
          name: cat,
          amount: val,
          percentage: expense > 0 ? (val / expense) * 100 : 0,
        };
      }
    });

    let topDay: { day: string; amount: number } | null = null;
    let maxDayVal = 0;
    Object.entries(dayTotals).forEach(([day, val]) => {
      if (val > maxDayVal) {
        maxDayVal = val;
        topDay = {
          day: day.charAt(0).toUpperCase() + day.slice(1),
          amount: val,
        };
      }
    });

    // Finalize Trend
    const trendData = Object.entries(trendMap)
      .reverse()
      .flatMap(([label, val]) => [
        { label, value: val.income, type: "income" as const },
        { label, value: val.expense, type: "expense" as const },
      ]);

    // --- Process Category Breakdown (Donut Chart) ---
    const categoryEntries = Object.entries(categoryTotals).map(
      ([name, amount]) => ({
        name,
        amount,
      })
    );
    // Sort desc
    categoryEntries.sort((a, b) => b.amount - a.amount);

    const colorsPalette = [
      "#FF6384",
      "#36A2EB",
      "#FFCE56",
      "#4BC0C0",
      "#9966FF",
    ]; // Example palette

    let breakdown = [];
    if (categoryEntries.length > 5) {
      const top4 = categoryEntries.slice(0, 4);
      const others = categoryEntries
        .slice(4)
        .reduce((sum, item) => sum + item.amount, 0);

      breakdown = top4.map((c, i) => ({
        name: c.name,
        amount: c.amount,
        color: colorsPalette[i % colorsPalette.length],
        percentage: expense > 0 ? (c.amount / expense) * 100 : 0,
      }));

      breakdown.push({
        name: "Otros",
        amount: others,
        color: "#C9CBCF", // Grey for others
        percentage: expense > 0 ? (others / expense) * 100 : 0,
      });
    } else {
      breakdown = categoryEntries.map((c, i) => ({
        name: c.name,
        amount: c.amount,
        color: colorsPalette[i % colorsPalette.length],
        percentage: expense > 0 ? (c.amount / expense) * 100 : 0,
      }));
    }

    // Spending Trend (Current vs Last Month)
    const lastMonthDate = subMonths(today, 1);
    const lastMonthKey = format(lastMonthDate, "MMM", { locale: es });
    const lastMonthExpense = trendMap[lastMonthKey]?.expense || 0;

    let spendingTrend: { percentage: number; direction: "up" | "down" } | null =
      null;

    if (lastMonthExpense > 0 && expense > 0) {
      const diff = expense - lastMonthExpense;
      const pct = (Math.abs(diff) / lastMonthExpense) * 100;
      spendingTrend = {
        percentage: pct,
        direction: diff > 0 ? "up" : "down",
      };
    }

    setData((prev) => ({
      ...prev,
      loading: false,
      totalBalance: balance, // Note: Ideally fetch exact account balances sum
      currentMonthIncome: income,
      currentMonthExpense: expense,
      netFlow: income - expense,
      topCategory: topCat,
      antExpenses: { count: antCount, total: antTotal },
      expensiveDay: topDay,
      trendData,
      coveragePercentage: expense > 0 ? (income / expense) * 100 : 0, // Simplified Coverage
      spendingTrend,
      categoryBreakdown: breakdown,
    }));
  };

  // --- NEW: Subscriber Stats & Debts Logic ---
  const fetchSubscriberStats = async (services: Service[]) => {
    if (!services.length) return;
    const user = auth.currentUser;
    if (!user) return;

    try {
      // console.log("DEBUG: Fetching subscriber stats...");
      const allDebtsMap: Record<string, { total: number; breakdown: any[] }> =
        {};
      const uniqueSubscribers = new Set<string>();

      for (const service of services) {
        if (!service.shared) {
          continue;
        }

        const subCol = collection(
          db,
          "users",
          user.uid,
          "services",
          service.id!,
          "subscribers"
        );
        const subSnaps = await getDocs(subCol);

        for (const subDoc of subSnaps.docs) {
          const subData = subDoc.data();
          const nameKey = subData.name.trim();
          uniqueSubscribers.add(nameKey); // Count unique people by name

          const debtCol = collection(
            db,
            "users",
            user.uid,
            "services",
            service.id!,
            "subscribers",
            subDoc.id,
            "debts"
          );
          const qDebts = query(debtCol, where("status", "==", "pending"));

          const debtSnaps = await getDocs(qDebts);

          if (!debtSnaps.empty) {
            if (!allDebtsMap[nameKey]) {
              allDebtsMap[nameKey] = { total: 0, breakdown: [] };
            }

            debtSnaps.forEach((d) => {
              const dData = d.data();
              allDebtsMap[nameKey].total += dData.amount;
              allDebtsMap[nameKey].breakdown.push({
                service: service.name,
                amount: dData.amount,
                month: dData.month,
              });
            });
          }
        }
      }

      const aggregatedDebts = Object.entries(allDebtsMap)
        .map(([name, data]) => ({
          name,
          total: data.total,
          breakdown: data.breakdown,
        }))
        .sort((a, b) => b.total - a.total); // Highest debt first

      const stats = {
        totalSubscribers: uniqueSubscribers.size,
        totalDebtors: aggregatedDebts.length,
        topDebtors: aggregatedDebts.slice(0, 5), // Keep top 5 for widget
      };

      setData((prev) => ({ ...prev, subscriberStats: stats }));
    } catch (e) {
      console.error("Error fetching subscriber stats:", e);
    }
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // 1. Listen to Transactions
    const qTrans = query(
      collection(db, "users", user.uid, "transactions"),
      orderBy("date", "desc")
    );

    // 2. Listen to Services
    const qServices = query(collection(db, "users", user.uid, "services"));

    const unsubscribeTrans = onSnapshot(qTrans, (snapshot) => {
      const transactions = snapshot.docs.map((doc) => {
        const d = doc.data();
        let dateObj = new Date();
        if (d.date) {
          if (d.date.toDate) dateObj = d.date.toDate();
          else dateObj = new Date(d.date);
        }
        return { id: doc.id, ...d, date: dateObj };
      }) as Transaction[];
      processDashboardData(transactions);
    });

    const unsubscribeServices = onSnapshot(qServices, (snapshot) => {
      const services = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Service[];

      processUpcomingServices(services);
      fetchSubscriberStats(services); // Trigger stats fetch
    });

    return () => {
      unsubscribeTrans();
      unsubscribeServices();
    };
  }, []);

  return data;
};
