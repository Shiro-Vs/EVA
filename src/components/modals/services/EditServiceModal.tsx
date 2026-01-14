import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  Switch,
  Alert,
} from "react-native";
import { styles } from "../../../screens/subscriptions/ServiceDetailScreen.styles";
import { colors } from "../../../theme/colors";
import { SERVICE_PRESETS } from "../../../utils/servicePresets";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { CustomCalendarPicker } from "../../common/CustomCalendarPicker";

interface EditServiceModalProps {
  visible: boolean;
  onClose: () => void;
  isEditing?: boolean; // New prop
  initialName?: string;
  initialCost?: number;
  initialDay?: number;
  initialColor?: string;
  initialIcon?: string;
  initialLogoUrl?: string;
  initialIconLibrary?: string;
  initialShared?: boolean;
  initialStartDate?: Date;
  onSubmit: (
    name: string,
    cost: string,
    day: string,
    color?: string,
    icon?: string,
    logoUrl?: string,
    iconLibrary?: string,
    shared?: boolean,
    startDate?: Date
  ) => void;
}

export const EditServiceModal = ({
  visible,
  onClose,
  isEditing = false,
  initialName = "",
  initialCost = 0,
  initialDay = 1,
  initialColor,
  initialIcon,
  initialLogoUrl,
  initialIconLibrary,
  initialShared,
  initialStartDate,
  onSubmit,
}: EditServiceModalProps) => {
  const [editServiceName, setEditServiceName] = useState(initialName);
  const [editServiceCost, setEditServiceCost] = useState(
    initialCost.toString()
  );
  // We keep 'day' for internal logic if needed, but UI uses Start Date
  const [editServiceDay, setEditServiceDay] = useState(initialDay.toString());
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  // Start Date State
  const [startDate, setStartDate] = useState(initialStartDate || new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // New States for Customization
  const [customColor, setCustomColor] = useState(
    initialColor || colors.primary
  );
  const [customIcon, setCustomIcon] = useState(initialIcon);
  const [customLogoUrl, setCustomLogoUrl] = useState(initialLogoUrl);
  const [customIconLibrary, setCustomIconLibrary] = useState(
    initialIconLibrary || "Ionicons"
  );
  const [isShared, setIsShared] = useState(initialShared || false); // New State

  // Error Modal State
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const showError = (message: string) => {
    setErrorMessage(message);
    setErrorModalVisible(true);
  };

  useEffect(() => {
    setEditServiceName(initialName);
    setEditServiceCost(initialCost.toString());
    setEditServiceDay(initialDay.toString());
    setCustomColor(initialColor || colors.primary);
    setCustomIcon(initialIcon);
    setCustomLogoUrl(initialLogoUrl);
    setCustomIconLibrary(initialIconLibrary || "Ionicons");
    setIsShared(initialShared || false);
    setStartDate(initialStartDate || new Date());

    const match = SERVICE_PRESETS.find(
      (p) => p.name.toLowerCase() === initialName.toLowerCase()
    );
    if (match) setSelectedPreset(match.name);
    else setSelectedPreset(null);
  }, [
    initialName,
    initialCost,
    initialDay,
    initialColor,
    initialIcon,
    initialLogoUrl,
    initialIconLibrary,
    initialShared,
    visible,
  ]);

  const handlePresetSelect = (preset: (typeof SERVICE_PRESETS)[0]) => {
    setSelectedPreset(preset.name);
    if (preset.name !== "Personalizado") {
      setEditServiceName(preset.name);
      setCustomColor(preset.color);
      setCustomIcon(preset.icon);
      setCustomIconLibrary(preset.lib || "Ionicons");
      setCustomLogoUrl(undefined);
    } else {
      setCustomLogoUrl(undefined);
      setCustomIconLibrary("Ionicons");
    }
  };

  const handleSave = () => {
    if (!editServiceName.trim()) {
      showError("Por favor ingresa un nombre para el servicio.");
      return;
    }
    const cost = parseFloat(editServiceCost);
    if (isNaN(cost) || cost <= 0) {
      showError("Por favor ingresa un costo válido mayor a 0.");
      return;
    }

    onSubmit(
      editServiceName,
      editServiceCost,
      startDate.getDate().toString(),
      customColor,
      customIcon,
      customLogoUrl,
      customIconLibrary,
      isShared,
      startDate
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {isEditing ? "Editar Servicio" : "Nuevo Servicio"}
              </Text>

              {/* Preset Selector */}
              <Text
                style={{
                  alignSelf: "flex-start",
                  color: colors.textSecondary,
                  marginBottom: 10,
                  fontSize: 12,
                }}
              >
                PLATAFORMA (Iconos Vectoriales)
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 10,
                  marginBottom: 20,
                }}
              >
                {SERVICE_PRESETS.map((preset) => (
                  <TouchableOpacity
                    key={preset.name}
                    onPress={() => handlePresetSelect(preset)}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: preset.color,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: selectedPreset === preset.name ? 2 : 0,
                      borderColor:
                        selectedPreset === preset.name
                          ? colors.primary
                          : "#FFF",
                      overflow: "hidden",
                    }}
                  >
                    {preset.lib === "MaterialCommunityIcons" ? (
                      <MaterialCommunityIcons
                        name={preset.icon as any}
                        size={20}
                        color="#FFF"
                      />
                    ) : (
                      <Ionicons
                        name={preset.icon as any}
                        size={20}
                        color="#FFF"
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <Text
                style={{
                  alignSelf: "flex-start",
                  color: colors.textSecondary,
                  marginBottom: 5,
                }}
              >
                Nombre
              </Text>
              <TextInput
                style={styles.input}
                value={editServiceName}
                onChangeText={setEditServiceName}
              />

              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      alignSelf: "flex-start",
                      color: colors.textSecondary,
                      marginBottom: 5,
                    }}
                  >
                    Costo (S/)
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={editServiceCost}
                    onChangeText={setEditServiceCost}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      alignSelf: "flex-start",
                      color: colors.textSecondary,
                      marginBottom: 5,
                    }}
                  >
                    Fecha Inicio
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.input,
                      {
                        justifyContent: "center",
                      },
                    ]}
                    onPress={() => setShowDatePicker(!showDatePicker)}
                  >
                    <Text style={{ color: colors.text }}>
                      {startDate.toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Date Picker Overlay Modal */}
              <Modal
                visible={showDatePicker}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowDatePicker(false)}
              >
                <TouchableWithoutFeedback
                  onPress={() => setShowDatePicker(false)}
                >
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: "rgba(0,0,0,0.5)",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <TouchableWithoutFeedback>
                      <View
                        style={{
                          backgroundColor: "#1E1E1E", // Fallback or colors.surface if confirmed
                          padding: 20,
                          borderRadius: 20,
                          width: "90%",
                          maxWidth: 340,
                          borderWidth: 1,
                          borderColor: colors.border || "#333",
                        }}
                      >
                        <CustomCalendarPicker
                          initialDate={startDate}
                          onDateChange={(date) => {
                            setStartDate(date);
                            setEditServiceDay(date.getDate().toString());
                            setShowDatePicker(false); // Close immediately
                          }}
                        />
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </TouchableWithoutFeedback>
              </Modal>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                }}
              >
                <Text style={{ color: colors.textSecondary }}>
                  Color del Icono:
                </Text>
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: customColor,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                />
              </View>

              {/* Shared Toggle */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                  backgroundColor: colors.background,
                  padding: 10,
                  borderRadius: 10,
                }}
              >
                <View>
                  <Text style={{ color: colors.text, fontWeight: "bold" }}>
                    ¿Es compartido?
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                    Activa la gestión de suscriptores
                  </Text>
                </View>
                <Switch
                  value={isShared}
                  onValueChange={setIsShared}
                  trackColor={{ false: "#767577", true: colors.primary }}
                  thumbColor={isShared ? "#fff" : "#f4f3f4"}
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSave}
                  style={styles.saveButton}
                >
                  <Text style={styles.saveText}>
                    {isEditing ? "Guardar" : "Crear"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Custom Error Modal */}
              <Modal
                visible={errorModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setErrorModalVisible(false)}
                statusBarTranslucent={true}
              >
                <TouchableWithoutFeedback
                  onPress={() => setErrorModalVisible(false)}
                >
                  <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                      <View
                        style={[styles.modalContent, { alignItems: "center" }]}
                      >
                        <Ionicons
                          name="alert-circle"
                          size={48}
                          color={colors.error}
                          style={{ marginBottom: 10 }}
                        />
                        <Text
                          style={[styles.modalTitle, { textAlign: "center" }]}
                        >
                          Atención
                        </Text>
                        <Text
                          style={{
                            color: colors.text,
                            textAlign: "center",
                            marginBottom: 20,
                          }}
                        >
                          {errorMessage}
                        </Text>

                        <TouchableOpacity
                          onPress={() => setErrorModalVisible(false)}
                          style={[
                            styles.cancelButton,
                            { width: "100%", alignItems: "center" },
                          ]}
                        >
                          <Text style={styles.cancelText}>Entendido</Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </TouchableWithoutFeedback>
              </Modal>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
