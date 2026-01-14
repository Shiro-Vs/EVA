import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  ScrollView,
  Dimensions,
} from "react-native";
import { colors } from "../../theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { Account } from "../../services/accountService";
import { Category } from "../../services/categoryService";
import { CustomAlertModal } from "../../components/common/CustomAlertModal";

import { useAccounts } from "./useAccounts";
import {
  styles,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
} from "./AccountsScreen.styles";

export default function AccountsScreen() {
  const {
    activeTab,
    setActiveTab,
    accounts,
    categories,
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
  } = useAccounts();

  const { width } = Dimensions.get("window");
  const scrollRef = useRef<FlatList>(null);

  // Sync Tab -> Scroll
  const handleTabPress = (tab: "accounts" | "categories") => {
    setActiveTab(tab);
    if (tab === "accounts") {
      scrollRef.current?.scrollToOffset({ offset: 0, animated: true });
    } else {
      scrollRef.current?.scrollToOffset({ offset: width, animated: true });
    }
  };

  // Sync Scroll -> Tab
  const handleScroll = (event: any) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollX / width);
    const newTab = index === 0 ? "accounts" : "categories";
    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
  };

  const renderAccountItem = ({ item }: { item: Account }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => openAccEdit(item)}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.iconBox,
          { backgroundColor: (item.color || colors.primary) + "20" },
        ]}
      >
        <Ionicons
          name={(item.icon as any) || "wallet"}
          size={24}
          color={item.color || colors.primary}
        />
      </View>
      <View style={styles.info}>
        <Text style={styles.itemTitle}>{item.name}</Text>
        <Text style={styles.itemSubtitle}>
          {item.type === "cash"
            ? "Efectivo"
            : item.type === "bank"
            ? "Banco"
            : "Digital"}
        </Text>
        <Text style={styles.amount}>S/ {item.currentBalance.toFixed(2)}</Text>
      </View>
      {item.isDefault && (
        <View style={{ marginRight: 10 }}>
          <Ionicons name="star" size={16} color={colors.textSecondary} />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => openCatEdit(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconBox, { backgroundColor: item.color + "20" }]}>
        <Ionicons name={item.icon as any} size={24} color={item.color} />
      </View>
      <View style={styles.info}>
        <Text style={styles.itemTitle}>{item.name}</Text>
      </View>
      {item.isDefault && (
        <View style={{ marginRight: 10 }}>
          <Ionicons name="star" size={16} color={colors.textSecondary} />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Configuración</Text>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "accounts" && styles.activeTab]}
          onPress={() => handleTabPress("accounts")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "accounts" && styles.activeTabText,
            ]}
          >
            Cuentas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "categories" && styles.activeTab]}
          onPress={() => handleTabPress("categories")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "categories" && styles.activeTabText,
            ]}
          >
            Categorías
          </Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Scroll (Swipeable) */}
      <FlatList
        ref={scrollRef}
        data={["accounts", "categories"]}
        keyExtractor={(item) => item}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={{ width: width }}>
            {item === "accounts" ? (
              <FlatList
                data={accounts}
                keyExtractor={(item) => item.id || Math.random().toString()}
                renderItem={renderAccountItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No tienes cuentas</Text>
                }
              />
            ) : (
              <FlatList
                data={categories}
                keyExtractor={(item) => item.id || Math.random().toString()}
                renderItem={renderCategoryItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No tienes categorías</Text>
                }
              />
            )}
          </View>
        )}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={activeTab === "accounts" ? openAccCreate : openCatCreate}
      >
        <Ionicons name="add" size={30} color="#000" />
      </TouchableOpacity>

      {/* --- Modal Accounts --- */}
      <Modal
        visible={accountModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAccountModalVisible(false)}
        statusBarTranslucent={true}
      >
        <TouchableWithoutFeedback onPress={() => setAccountModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  {accEditingId ? "Editar Cuenta" : "Nueva Cuenta"}
                </Text>

                <Text style={styles.label}>Nombre</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: BCP"
                  placeholderTextColor={colors.textSecondary}
                  value={accName}
                  onChangeText={setAccName}
                />

                <Text style={styles.label}>Saldo Actual</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  value={accBalance}
                  onChangeText={setAccBalance}
                />

                {/* Color Picker */}
                <Text style={styles.label}>Color</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginBottom: 16 }}
                >
                  {CATEGORY_COLORS.map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.colorCircle,
                        { backgroundColor: c },
                        accColor === c && styles.selectedColor,
                      ]}
                      onPress={() => setAccColor(c)}
                    />
                  ))}
                </ScrollView>

                {/* Icon Picker */}
                <Text style={styles.label}>Icono</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: 20 }}
                  style={{ marginBottom: 24 }}
                >
                  {[
                    "wallet",
                    "card",
                    "cash",
                    "phone-portrait", // Yape/Plin
                    "briefcase",
                    "business",
                    "stats-chart",
                    "trending-up",
                    "lock-closed",
                  ].map((ic) => (
                    <TouchableOpacity
                      key={ic}
                      style={[
                        styles.iconSelect,
                        accIcon === ic && styles.selectedIcon,
                      ]}
                      onPress={() => setAccIcon(ic)}
                    >
                      <Ionicons
                        name={ic as any}
                        size={24}
                        color={accIcon === ic ? "#FFF" : colors.text}
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveAccount}
                >
                  <Text style={styles.saveButtonText}>Guardar</Text>
                </TouchableOpacity>

                {accEditingId && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDeleteAccount}
                  >
                    <Text style={styles.deleteButtonText}>Eliminar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* --- Modal Categories --- */}
      <Modal
        visible={categoryModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCategoryModalVisible(false)}
        statusBarTranslucent={true}
      >
        <TouchableWithoutFeedback
          onPress={() => setCategoryModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  {catEditingId ? "Editar Categoría" : "Nueva Categoría"}
                </Text>

                <Text style={styles.label}>Nombre</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Comida"
                  placeholderTextColor={colors.textSecondary}
                  value={catName}
                  onChangeText={setCatName}
                />

                <Text style={styles.label}>Color</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginBottom: 16 }}
                >
                  {CATEGORY_COLORS.map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.colorCircle,
                        { backgroundColor: c },
                        catColor === c && styles.selectedColor,
                      ]}
                      onPress={() => setCatColor(c)}
                    />
                  ))}
                </ScrollView>

                <Text style={styles.label}>Icono</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginBottom: 20 }}
                >
                  {CATEGORY_ICONS.map((icon) => (
                    <TouchableOpacity
                      key={icon}
                      style={[
                        styles.iconSelect,
                        catIcon === icon && styles.selectedIcon,
                      ]}
                      onPress={() => setCatIcon(icon)}
                    >
                      <Ionicons
                        name={icon as any}
                        size={24}
                        color={catIcon === icon ? "#000" : "#FFF"}
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveCategory}
                >
                  <Text style={styles.saveButtonText}>Guardar</Text>
                </TouchableOpacity>

                {catEditingId && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDeleteCategory}
                  >
                    <Text style={styles.deleteButtonText}>Eliminar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* --- Custom Standard Alert --- */}
      <CustomAlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        variant={alertType}
        onClose={() => setAlertVisible(false)}
        onConfirm={() => {
          if (onAlertConfirm) onAlertConfirm();
          setAlertVisible(false);
        }}
      />
    </View>
  );
}
