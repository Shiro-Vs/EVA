import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CustomCalendarPicker } from "../../components/common/CustomCalendarPicker";
import { PanGestureHandler } from "react-native-gesture-handler";

import { styles, SCREEN_HEIGHT_CONST } from "./AddTransactionScreen.styles";
import { useAddTransaction } from "./useAddTransaction";
import { colors } from "../../theme/colors";

export default function AddTransactionScreen() {
  const {
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
  } = useAddTransaction();

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={() => navigation.goBack()}>
        <View style={StyleSheet.absoluteFill} />
      </TouchableWithoutFeedback>

      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetY={10} // Only activate if moved 10px down
        activeOffsetX={[-500, 500]} // Don't interrupt horizontal swipes
      >
        <Animated.View
          style={[
            styles.content,
            {
              transform: [
                {
                  translateY: translateY.interpolate({
                    inputRange: [0, SCREEN_HEIGHT_CONST],
                    outputRange: [0, SCREEN_HEIGHT_CONST],
                    extrapolate: "clamp",
                  }),
                },
              ],
            },
          ]}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
            style={{ flex: 1 }}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={{ flex: 1 }}>
                <View style={styles.handle} />

                {/* Header */}
                <View style={styles.header}>
                  <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.closeButton}
                  >
                    <Ionicons
                      name="close"
                      size={24}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                  <Text style={styles.title}>Nuevo Movimiento</Text>
                  <TouchableOpacity onPress={handleReset}>
                    <Text style={styles.resetText}>Reset</Text>
                  </TouchableOpacity>
                </View>

                {/* Toggle Switch */}
                <View style={styles.toggleContainer}>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      type === "expense" && styles.toggleActive,
                    ]}
                    onPress={() => setType("expense")}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        type === "expense" && styles.toggleTextActive,
                      ]}
                    >
                      Egreso
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      type === "income" && styles.toggleActive,
                    ]}
                    onPress={() => setType("income")}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        type === "income" && styles.toggleTextActive,
                      ]}
                    >
                      Ingreso
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Amount Input */}
                <View style={styles.amountContainer}>
                  <Text
                    style={[
                      styles.currencySymbol,
                      {
                        color: type === "income" ? colors.success : colors.text,
                      },
                    ]}
                  >
                    S/
                  </Text>
                  <TextInput
                    style={[
                      styles.amountInput,
                      {
                        color: type === "income" ? colors.success : colors.text,
                      },
                    ]}
                    placeholder="0.00"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                    autoFocus
                  />
                </View>

                <ScrollView
                  ref={scrollViewRef}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 300 }}
                >
                  {/* Note Input */}
                  <View style={styles.inputGroupTop}>
                    <View style={styles.noteContainer}>
                      <Ionicons
                        name="create-outline"
                        size={20}
                        color={colors.textSecondary}
                        style={{ marginRight: 10 }}
                      />
                      <TextInput
                        style={styles.noteInputSmall}
                        placeholder="Nota (Opcional)"
                        placeholderTextColor={colors.textSecondary}
                        value={description}
                        onChangeText={setDescription}
                        onFocus={handleFocusNote}
                      />
                    </View>
                  </View>

                  {/* Category Selector */}
                  <View style={styles.categoryContainer}>
                    <Text style={styles.sectionLabel}>Categoría</Text>
                    {categories.length > 0 ? (
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 10 }}
                      >
                        {categories.map((cat) => (
                          <TouchableOpacity
                            key={cat.id}
                            style={[
                              styles.catBadge,
                              selectedCat?.id === cat.id && {
                                backgroundColor: cat.color + "30", // Light bg
                                borderColor: cat.color,
                              },
                            ]}
                            onPress={() => setSelectedCat(cat)}
                          >
                            <Ionicons
                              name={cat.icon as any}
                              size={16}
                              color={
                                selectedCat?.id === cat.id
                                  ? cat.color
                                  : colors.textSecondary
                              }
                            />
                            <Text
                              style={[
                                styles.catText,
                                selectedCat?.id === cat.id && {
                                  color: cat.color,
                                  fontWeight: "bold",
                                },
                              ]}
                            >
                              {cat.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    ) : (
                      <Text style={styles.emptyText}>
                        No hay categorías. Crea una en Configuración.
                      </Text>
                    )}
                  </View>

                  {/* Date & Payment Row */}
                  <View style={styles.rowContainer}>
                    {/* Account Selector */}
                    <TouchableOpacity
                      style={[styles.inputRow, { flex: 1, marginRight: 10 }]}
                      onPress={() => setShowAccountPicker(true)}
                    >
                      <View style={styles.iconBox}>
                        <Ionicons
                          name={(selectedAcc?.icon as any) || "card-outline"}
                          size={20}
                          color={colors.text}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.labelSmall}>Desde</Text>
                        <Text style={styles.valueText} numberOfLines={1}>
                          {selectedAcc?.name || "Seleccionar"}
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-down"
                        size={16}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>

                    {/* Date Selector */}
                    <TouchableOpacity
                      style={[styles.inputRow, { flex: 1 }]}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <View style={styles.iconBox}>
                        <Ionicons
                          name="calendar-outline"
                          size={20}
                          color={colors.text}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.labelSmall}>Fecha</Text>
                        <Text style={styles.valueText}>
                          {date.toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                          })}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>

                  {/* Save Button */}
                  <TouchableOpacity
                    style={[
                      styles.saveButton,
                      {
                        backgroundColor:
                          type === "income" ? colors.success : colors.primary,
                      },
                      loading && { opacity: 0.7 },
                    ]}
                    onPress={handleSave}
                    disabled={loading}
                  >
                    <Text style={styles.saveText}>
                      {loading ? "Guardando..." : "Guardar Movimiento"}
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </Animated.View>
      </PanGestureHandler>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowDatePicker(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.dateModalContent}>
                <CustomCalendarPicker
                  initialDate={date}
                  onDateChange={(newDate) => {
                    setDate(newDate);
                    setShowDatePicker(false);
                  }}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Account Picker Modal */}
      <Modal
        visible={showAccountPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAccountPicker(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowAccountPicker(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.paymentModalContent}>
                <Text style={styles.modalTitle}>Seleccionar Cuenta</Text>
                {accounts.length > 0 ? (
                  accounts.map((acc) => (
                    <TouchableOpacity
                      key={acc.id}
                      style={styles.paymentMethodItem}
                      onPress={() => {
                        setSelectedAcc(acc);
                        setShowAccountPicker(false);
                      }}
                    >
                      <Ionicons
                        name={
                          acc.id === selectedAcc?.id
                            ? "radio-button-on"
                            : "radio-button-off"
                        }
                        size={20}
                        color={
                          acc.id === selectedAcc?.id
                            ? colors.primary
                            : colors.textSecondary
                        }
                      />
                      <View style={{ marginLeft: 10 }}>
                        <Text
                          style={[
                            styles.paymentMethodText,
                            acc.id === selectedAcc?.id && {
                              color: colors.primary,
                              fontWeight: "bold",
                            },
                          ]}
                        >
                          {acc.name}
                        </Text>
                        <Text
                          style={{ color: colors.textSecondary, fontSize: 12 }}
                        >
                          S/ {acc.currentBalance.toFixed(2)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.emptyText}>
                    No tienes cuentas. Crea una primero.
                  </Text>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
