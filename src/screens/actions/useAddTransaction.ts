import { useState, useRef, useCallback } from "react";
import { Alert, ScrollView, Animated, Dimensions } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { State } from "react-native-gesture-handler";
import { auth } from "../../config/firebaseConfig";
import { addTransaction } from "../../services/transactionService";
import { getAccounts, Account } from "../../services/accountService";
import {
  getCategories,
  Category,
  addCategory,
  updateCategory,
} from "../../services/categoryService";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Simple in-memory cache to speed up subsequent opens
let cachedAccounts: Account[] = [];
let cachedCategories: Category[] = [];

export const useAddTransaction = () => {
  const navigation = useNavigation();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [loading, setLoading] = useState(false);

  // Data State
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedAcc, setSelectedAcc] = useState<Account | null>(null);
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);

  // Date State
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAccountPicker, setShowAccountPicker] = useState(false);

  // Animation State
  const translateY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  // Fetch Data on Focus
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        const user = auth.currentUser;
        if (!user) return;

        // 1. Optimistic Load from Cache
        if (cachedAccounts.length > 0) setAccounts(cachedAccounts);
        if (cachedCategories.length > 0) setCategories(cachedCategories);

        // 2. Fetch Fresh Data (Background)
        const accs = await getAccounts(user.uid);
        const cats = await getCategories(user.uid);

        // 3. Update State & Cache
        setAccounts(accs);
        setCategories(cats);
        cachedAccounts = accs;
        cachedCategories = cats;

        // Set Defaults
        if (accs.length > 0) setSelectedAcc(accs[0]);

        // Check for Default Category (isDefault = true)
        let defaultCat = cats.find((c: any) => c.isDefault === true);

        // Fallback: Check by name for legacy support
        if (!defaultCat) {
          const legacyDefault = cats.find((c) => c.name === "Sin Categoría");
          if (legacyDefault && legacyDefault.id) {
            // Found existing legacy category. Migrate it to isDefault=true
            try {
              await updateCategory(user.uid, legacyDefault.id, {
                isDefault: true,
              });
              defaultCat = { ...legacyDefault, isDefault: true };
            } catch (e) {
              console.log("Migration failed", e);
              defaultCat = legacyDefault; // Use it anyway even if migration failed
            }
          }
        }

        // If it still doesn't exist, create it automatically with isDefault=true
        if (!defaultCat) {
          try {
            // ... creation logic ...
            // ... creation logic ...
            await addCategory(user.uid, {
              name: "Sin Categoría",
              icon: "help-circle-outline",
              color: "#9EA6B5",
              isDefault: true,
            });

            // Refresh list
            const updatedCats = await getCategories(user.uid);
            setCategories(updatedCats);
            defaultCat = updatedCats.find((c: any) => c.isDefault === true);
          } catch (e) {
            console.error("Auto-creation failed", e);
          }
        }

        if (defaultCat) {
          setSelectedCat(defaultCat);
        } else if (cats.length > 0) {
          setSelectedCat(cats[0]);
        }
      };

      fetchData();
    }, [])
  );

  // Update selected category if null and we have categories
  useFocusEffect(
    useCallback(() => {
      if (!selectedCat && categories.length > 0) {
        const defaultCat = categories.find((c: any) => c.isDefault === true);
        if (defaultCat) {
          setSelectedCat(defaultCat);
        } else {
          setSelectedCat(categories[0]);
        }
      }
    }, [categories])
  );

  const handleFocusNote = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }, 300);
  };

  const handleSave = async () => {
    if (!amount) {
      Alert.alert("Error", "Ingresa un monto");
      return;
    }
    if (!selectedAcc) {
      Alert.alert(
        "Error",
        "Selecciona una cuenta (crea una primero si no tienes)"
      );
      return;
    }
    if (!selectedCat) {
      Alert.alert("Error", "Selecciona una categoría");
      return;
    }

    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    try {
      await addTransaction(user.uid, {
        type,
        amount: parseFloat(amount),
        description: description || (type === "income" ? "Ingreso" : "Gasto"),
        date: date,
        // Account Info
        accountId: selectedAcc.id!,
        accountName: selectedAcc.name,
        // Category Info
        categoryId: selectedCat.id!,
        categoryName: selectedCat.name,
        categoryIcon: selectedCat.icon,
      });
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", "No se pudo guardar");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAmount("");
    setDescription("");
    setType("expense");
    setDate(new Date());
    if (accounts.length > 0) setSelectedAcc(accounts[0]);
  };

  // Gesture Handler
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationY } = event.nativeEvent;
      if (translationY > 100) {
        navigation.goBack();
      } else {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  return {
    amount,
    setAmount,
    description,
    setDescription,
    type,
    setType,
    loading,
    accounts,
    categories,
    selectedAcc,
    setSelectedAcc,
    selectedCat,
    setSelectedCat,
    date,
    setDate,
    showDatePicker,
    setShowDatePicker,
    showAccountPicker,
    setShowAccountPicker,
    translateY,
    scrollViewRef,
    handleFocusNote,
    handleSave,
    handleReset,
    onGestureEvent,
    onHandlerStateChange,
    navigation,
  };
};
