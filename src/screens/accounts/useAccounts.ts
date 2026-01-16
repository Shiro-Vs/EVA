import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { auth } from "../../config/firebaseConfig";
import {
  getAccounts,
  addAccount,
  updateAccount,
  deleteAccount,
  Account,
} from "../../services/accountService";
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  Category,
} from "../../services/categoryService";
import { CATEGORY_COLORS } from "./AccountsScreen.styles";

export type Tab = "accounts" | "categories";

export const useAccounts = () => {
  const [activeTab, setActiveTab] = useState<Tab>("accounts");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  // Account Form State
  const [accEditingId, setAccEditingId] = useState<string | null>(null);
  const [accName, setAccName] = useState("");
  const [accBalance, setAccBalance] = useState("");
  const [accIcon, setAccIcon] = useState("wallet");
  const [accColor, setAccColor] = useState(CATEGORY_COLORS[4]); // Default Blue

  // Category Form State
  const [catEditingId, setCatEditingId] = useState<string | null>(null);
  const [catName, setCatName] = useState("");
  const [catIcon, setCatIcon] = useState("fast-food");
  const [catColor, setCatColor] = useState(CATEGORY_COLORS[0]);
  // Custom Alert State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState<
    "info" | "confirm" | "destructive"
  >("info");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [onAlertConfirm, setOnAlertConfirm] = useState<
    (() => void) | undefined
  >(undefined);

  // --- Data Fetching ---
  const fetchData = async () => {
    // ... (fetch logic remains same) ...
    const user = auth.currentUser;
    if (!user) return;
    setLoading(true);
    if (activeTab === "accounts") {
      let fetchedAccounts = await getAccounts(user.uid);

      // Migration: Ensure default "Efectivo" account exists
      const hasDefaultAcc = fetchedAccounts.some(
        (a: any) => a.isDefault === true
      );

      if (!hasDefaultAcc) {
        const legacyCash = fetchedAccounts.find((a) => a.name === "Efectivo");
        if (legacyCash && legacyCash.id) {
          // Update existing "Efectivo" to be default
          try {
            await updateAccount(user.uid, legacyCash.id, { isDefault: true });
            fetchedAccounts = fetchedAccounts.map((a) =>
              a.id === legacyCash.id ? { ...a, isDefault: true } : a
            );
          } catch (e) {
            console.log("Acc migration failed", e);
          }
        } else {
          // Create new default "Efectivo"
          try {
            const newDefault = {
              name: "Efectivo",
              currentBalance: 0,
              initialBalance: 0,
              currency: "PEN",
              icon: "cash",
              color: "#2ECC71", // Green
              isDefault: true,
              createdAt: new Date(),
            };
            await addAccount(user.uid, newDefault as any);
            // Re-fetch to get the new list with ID
            fetchedAccounts = await getAccounts(user.uid);
          } catch (e) {
            console.log("Acc creation failed", e);
          }
        }
      }

      // Sort: Default FIRST, others by creation (preserved from query)
      fetchedAccounts.sort((a, b) => {
        if (a.isDefault) return -1;
        if (b.isDefault) return 1;
        return 0;
      });

      setAccounts(fetchedAccounts);
    } else {
      let fetchedCategories = await getCategories(user.uid);

      // ... (migration logic remains same) ...
      const hasDefault = fetchedCategories.some(
        (c: any) => c.isDefault === true
      );

      if (!hasDefault) {
        const legacyDefault = fetchedCategories.find(
          (c) => c.name === "Sin Categoría"
        );
        if (legacyDefault && legacyDefault.id) {
          try {
            await updateCategory(user.uid, legacyDefault.id, {
              isDefault: true,
            });
            fetchedCategories = fetchedCategories.map((c) =>
              c.id === legacyDefault.id ? { ...c, isDefault: true } : c
            );
          } catch (e) {
            console.log("Migration failed in AccountsScreen", e);
          }
        }
      }
      setCategories(fetchedCategories);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [activeTab])
  );

  // --- Handlers: Categories ---
  const openCatCreate = () => {
    setCatEditingId(null);
    setCatName("");
    setCatIcon("fast-food");
    setCatColor(CATEGORY_COLORS[0]);
    setCategoryModalVisible(true);
  };

  const openCatEdit = (cat: Category) => {
    setCatEditingId(cat.id || null);
    setCatName(cat.name);
    setCatIcon(cat.icon);
    setCatColor(cat.color);
    setCategoryModalVisible(true);
  };

  const handleSaveCategory = async () => {
    const user = auth.currentUser;
    if (!user) return;
    if (!catName) {
      setAlertTitle("Error");
      setAlertMessage("Escribe un nombre");
      setAlertType("info");
      setAlertVisible(true);
      return;
    }
    try {
      const payload = {
        name: catName,
        icon: catIcon,
        color: catColor,
      };

      if (catEditingId) {
        await updateCategory(user.uid, catEditingId, payload);
      } else {
        await addCategory(user.uid, { ...payload } as any);
      }
      setCategoryModalVisible(false);
      fetchData();
    } catch (e) {
      setAlertTitle("Error");
      setAlertMessage("Error al guardar categoría");
      setAlertType("info");
      setAlertVisible(true);
    }
  };

  const handleDeleteCategory = () => {
    if (!catEditingId) return;

    const categoryToDelete = categories.find((c) => c.id === catEditingId);
    if (categoryToDelete?.isDefault) {
      setAlertTitle("Acción no permitida");
      setAlertMessage(
        "Esta es la categoría principal y no puede ser eliminada."
      );
      setAlertType("info");
      setAlertVisible(true);
      return;
    }

    setAlertTitle("Eliminar Categoría");
    setAlertMessage("¿Seguro que deseas eliminar esta categoría?");
    setAlertType("destructive");
    setOnAlertConfirm(() => async () => {
      const user = auth.currentUser;
      if (user) {
        await deleteCategory(user.uid, catEditingId);
        setCategoryModalVisible(false);
        fetchData();
      }
    });
    setAlertVisible(true);
  };

  // --- Handlers: Accounts ---
  const openAccCreate = () => {
    setAccEditingId(null);
    setAccName("");
    setAccBalance("");
    setAccIcon("wallet");
    setAccColor(CATEGORY_COLORS[4]); // Blue default
    setAccountModalVisible(true);
  };

  const openAccEdit = (acc: Account) => {
    setAccEditingId(acc.id || null);
    setAccName(acc.name);
    setAccBalance(acc.currentBalance.toString());
    setAccIcon(acc.icon || "wallet");
    setAccColor(acc.color || CATEGORY_COLORS[4]);
    setAccountModalVisible(true);
  };

  const handleSaveAccount = async () => {
    const user = auth.currentUser;
    if (!user) return;
    if (!accName || !accBalance) {
      setAlertTitle("Error");
      setAlertMessage("Completa los campos");
      setAlertType("info");
      setAlertVisible(true);
      return;
    }
    try {
      const balance = parseFloat(accBalance);
      const payload = {
        name: accName,
        currentBalance: balance,
        icon: accIcon,
        color: accColor,
      };

      if (accEditingId) {
        await updateAccount(user.uid, accEditingId, payload);
      } else {
        await addAccount(user.uid, {
          ...payload,
          initialBalance: balance,
          currency: "PEN",
        } as any);
      }
      setAccountModalVisible(false);
      fetchData();
    } catch (e) {
      setAlertTitle("Error");
      setAlertMessage("Error al guardar cuenta");
      setAlertType("info");
      setAlertVisible(true);
    }
  };

  const handleDeleteAccount = () => {
    if (!accEditingId) return;

    const accountToDelete = accounts.find((a) => a.id === accEditingId);
    if (accountToDelete?.isDefault) {
      setAlertTitle("Acción no permitida");
      setAlertMessage(
        "Esta es la cuenta principal (Efectivo) y no puede ser eliminada."
      );
      setAlertType("info");
      setAlertVisible(true);
      return;
    }

    setAlertTitle("Eliminar Cuenta");
    setAlertMessage("¿Seguro que deseas eliminar esta cuenta?");
    setAlertType("destructive");
    setOnAlertConfirm(() => async () => {
      const user = auth.currentUser;
      if (user) {
        await deleteAccount(user.uid, accEditingId);
        setAccountModalVisible(false);
        fetchData();
      }
    });
    setAlertVisible(true);
  };

  return {
    activeTab,
    setActiveTab,
    accounts,
    categories,
    loading,
    // Modals
    accountModalVisible,
    setAccountModalVisible,
    categoryModalVisible,
    setCategoryModalVisible,
    // Acc Form
    accEditingId,
    accName,
    setAccName,
    accBalance,
    setAccBalance,
    accIcon,
    setAccIcon,
    accColor,
    setAccColor,
    openAccCreate,
    openAccEdit,
    handleSaveAccount,
    handleDeleteAccount,
    // Cat Form
    catEditingId,
    catName,
    setCatName,
    catIcon,
    setCatIcon,
    catColor,
    setCatColor,
    openCatCreate,
    openCatEdit,
    handleSaveCategory,
    handleDeleteCategory,
    // Custom Alert Props
    alertVisible,
    setAlertVisible,
    alertTitle,
    alertMessage,
    alertType,
    onAlertConfirm,
  };
};
