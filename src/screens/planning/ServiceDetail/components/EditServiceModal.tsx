import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Pressable,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import EVAModal from "../../../../components/common/EVAModal";
import { ServiceIcon, POPULAR_ICONS, PRESET_COLORS } from "../../../../utils/serviceIcons";

interface EditServiceModalProps {
  visible: boolean;
  onClose: () => void;
  service: any;
  draftService: any;
  setDraftService: (service: any) => void;
  costoInput: string;
  setCostoInput: (costo: string) => void;
  onSave: () => void;
  accounts: any[];
}

const EditServiceModal: React.FC<EditServiceModalProps> = ({
  visible,
  onClose,
  service,
  draftService,
  setDraftService,
  costoInput,
  setCostoInput,
  onSave,
  accounts,
}) => {
  const [isAccountSelectorExpanded, setAccountSelectorExpanded] = useState(false);
  const [isDaySelectorExpanded, setDaySelectorExpanded] = useState(false);
  const [errors, setErrors] = useState({ nombre: "", costo: "" });

  useEffect(() => {
    if (visible) {
      setErrors({ nombre: "", costo: "" });
      setAccountSelectorExpanded(false);
      setDaySelectorExpanded(false);
    }
  }, [visible]);

  const validateAndSave = () => {
    let hasError = false;
    const newErrors = { nombre: "", costo: "" };

    if (!draftService.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio";
      hasError = true;
    }

    const costoNum = parseFloat(costoInput);
    if (!costoInput.trim() || isNaN(costoNum) || costoNum <= 0) {
      newErrors.costo = "El costo debe ser un número mayor a 0";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setErrors({ nombre: "", costo: "" });
    onSave();
  };

  const toggleCompartido = () => {
    setDraftService({
      ...draftService,
      es_compartido: !draftService.es_compartido,
    });
  };

  const toggleFrecuencia = (freq: "mensual" | "anual") => {
    setDraftService({ ...draftService, frecuencia: freq });
  };

  const currentAccount =
    accounts.find((a) => a.id === draftService.id_cuenta_pago) || accounts[0];

  return (
    <EVAModal
      visible={visible}
      title={`Configurar ${service.nombre}`}
      onClose={onClose}
      primaryButtonText="Guardar Cambios"
      onPrimaryAction={validateAndSave}
      scrollEnabled={!isDaySelectorExpanded}
    >
      {/* Overlay para cerrar selectores al tocar fuera */}
      {(isAccountSelectorExpanded || isDaySelectorExpanded) && (
        <Pressable
          style={[StyleSheet.absoluteFill, { zIndex: 45 }]}
          onPress={() => {
            setAccountSelectorExpanded(false);
            setDaySelectorExpanded(false);
          }}
        />
      )}

      <View className="px-2">
        {/* Selector de Día Integrado (Se muestra sobre el contenido si está expandido) */}
        {isDaySelectorExpanded && (
          <View className="absolute top-0 left-0 right-0 bottom-0 bg-background z-[100] rounded-2xl p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-text-primary font-asap-bold text-lg">
                Seleccionar Día de Cobro
              </Text>
              <TouchableOpacity onPress={() => setDaySelectorExpanded(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="flex-row flex-wrap justify-between">
                {Array.from({ length: 31 }, (_, i) => i + 1).map((item) => (
                  <TouchableOpacity
                    key={item}
                    onPress={() => {
                      setDraftService({
                        ...draftService,
                        dia_cobro: item,
                      });
                      setDaySelectorExpanded(false);
                    }}
                    className={`w-[18%] aspect-square items-center justify-center rounded-xl mb-3 ${
                      draftService.dia_cobro === item
                        ? "bg-primary"
                        : "bg-card"
                    }`}
                  >
                    <Text
                      className={`font-asap-bold text-base ${
                        draftService.dia_cobro === item
                          ? "text-white"
                          : "text-text-primary"
                      }`}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        <Text className="text-text-secondary font-asap-semibold text-xs uppercase tracking-wider mb-4">
          Personalización del Servicio
        </Text>

        {/* Nombre del Servicio */}
        <Text className="text-text-secondary font-asap-semibold text-[10px] uppercase tracking-widest mb-3 ml-1">
          Nombre
        </Text>
        <View className={`bg-card px-4 py-1 rounded-xl ${errors.nombre ? "border border-red-500" : ""}`}>
          <TextInput
            className="text-text-primary font-asap-bold text-base"
            value={draftService.nombre}
            onChangeText={(text) => {
              setDraftService({ ...draftService, nombre: text });
              if (errors.nombre) setErrors({ ...errors, nombre: "" });
            }}
            placeholder="Ej. Netflix Personal"
            placeholderTextColor="#8F99A1"
          />
        </View>
        {errors.nombre ? (
          <Text className="text-red-500 font-asap text-[10px] mt-1 ml-1">
            {errors.nombre}
          </Text>
        ) : null}
        <View className="mb-6" />

        {/* Selector de Iconos */}
        <Text className="text-text-secondary font-asap-semibold text-[10px] uppercase tracking-widest mb-3 ml-1">
          Icono
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6 -mx-2 px-2"
        >
          {POPULAR_ICONS.map((icon) => (
            <TouchableOpacity
              key={icon}
              onPress={() => setDraftService({ ...draftService, icon: icon })}
              className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${
                draftService.icon === icon ? "bg-primary" : "bg-card"
              }`}
            >
              <ServiceIcon
                name={icon}
                size={20}
                color={draftService.icon === icon ? "white" : "#64748B"}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Selector de Color Personalizado */}
        <Text className="text-text-secondary font-asap-semibold text-[10px] uppercase tracking-widest mb-3 ml-1">
          Color
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row mb-8 -mx-2 px-2"
        >
          {PRESET_COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setDraftService({ ...draftService, color: c })}
              style={{ backgroundColor: c }}
              className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                draftService.color === c ? "border-2 border-white" : ""
              } shadow-sm`}
            >
              {draftService.color === c && (
                <Ionicons name="checkmark" size={20} color="white" />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text className="text-text-secondary font-asap-semibold text-xs uppercase tracking-wider mb-4">
          Detalles de Facturación
        </Text>

        {/* Costo */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-text-primary font-asap text-base">
            Costo Total
          </Text>
          <View
            className={`flex-row items-center bg-card px-3 py-0 rounded-xl ${errors.costo ? "border border-red-500" : ""}`}
          >
            <Text className="text-text-secondary font-asap mr-1">S/</Text>
            <TextInput
              className="text-text-primary font-asap-bold text-lg min-w-[50px]"
              value={costoInput}
              onChangeText={(text) => {
                setCostoInput(text);
                if (errors.costo) setErrors({ ...errors, costo: "" });
              }}
              keyboardType="numeric"
            />
          </View>
        </View>
        {errors.costo ? (
          <Text className="text-red-500 font-asap text-[10px] -mt-5 mb-6 text-right">
            {errors.costo}
          </Text>
        ) : null}

        {/* Día de Cobro */}
        <View className="flex-row items-center justify-between mb-6 z-40">
          <Text className="text-text-primary font-asap text-base">
            Día de cobro
          </Text>
          <TouchableOpacity
            className="flex-row items-center justify-between bg-card px-4 py-3 rounded-xl min-w-[90px]"
            onPress={() => setDaySelectorExpanded(true)}
            activeOpacity={0.7}
          >
            <Text className="text-text-primary font-asap-bold text-sm text-center flex-1 mr-2">
              {draftService.dia_cobro}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#8F99A1" />
          </TouchableOpacity>
        </View>

        {/* Frecuencia */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-text-primary font-asap text-base">
            Frecuencia
          </Text>
          <View className="flex-row bg-card rounded-xl p-1">
            <TouchableOpacity
              onPress={() => toggleFrecuencia("mensual")}
              className={`px-4 py-1.5 rounded-lg ${
                draftService.frecuencia === "mensual"
                  ? "bg-primary"
                  : "bg-transparent"
              }`}
            >
              <Text
                className={`font-asap-semibold text-xs ${
                  draftService.frecuencia === "mensual"
                    ? "text-white"
                    : "text-text-secondary"
                }`}
              >
                Mensual
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => toggleFrecuencia("anual")}
              className={`px-4 py-1.5 rounded-lg ${
                draftService.frecuencia === "anual"
                  ? "bg-primary"
                  : "bg-transparent"
              }`}
            >
              <Text
                className={`font-asap-semibold text-xs ${
                  draftService.frecuencia === "anual"
                    ? "text-white"
                    : "text-text-secondary"
                }`}
              >
                Anual
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cuenta de Pago */}
        <View className="flex-row items-center justify-between mb-8 z-50">
          <Text className="text-text-primary font-asap text-base">Cuenta</Text>
          <View>
            <TouchableOpacity
              className="flex-row items-center justify-between bg-card px-4 py-3 rounded-xl min-w-[150px]"
              onPress={() => setAccountSelectorExpanded(!isAccountSelectorExpanded)}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <Ionicons
                  name={currentAccount.icono}
                  size={16}
                  color={currentAccount.color}
                  className="mr-2"
                />
                <Text className="text-text-primary font-asap-semibold text-sm">
                  {currentAccount.nombre}
                </Text>
              </View>
              <Ionicons
                name={isAccountSelectorExpanded ? "chevron-up" : "chevron-down"}
                size={16}
                color="#8F99A1"
                className="ml-2"
              />
            </TouchableOpacity>

            {isAccountSelectorExpanded && (
              <View
                className="absolute right-0 bottom-14 bg-background rounded-xl shadow-2xl py-2"
                style={{ width: 170, zIndex: 1000, elevation: 20 }}
              >
                {accounts.map((account) => (
                  <TouchableOpacity
                    key={account.id}
                    className={`flex-row items-center px-4 py-3 ${
                      draftService.id_cuenta_pago === account.id
                        ? "bg-primary/10"
                        : ""
                    }`}
                    onPress={() => {
                      setDraftService({
                        ...draftService,
                        id_cuenta_pago: account.id,
                      });
                      setAccountSelectorExpanded(false);
                    }}
                  >
                    <Ionicons
                      name={account.icono}
                      size={18}
                      color={account.color}
                      className="mr-3"
                    />
                    <Text
                      className={`font-asap-semibold text-sm ${
                        draftService.id_cuenta_pago === account.id
                          ? "text-primary"
                          : "text-text-primary"
                      }`}
                    >
                      {account.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Fecha de Inicio del Servicio (Fija en edición) */}
        <View className="flex-row items-center justify-between mb-6 pt-4 border-t border-border/10">
          <View className="flex-1 mr-4">
            <Text className="text-text-primary font-asap-bold text-base">
              Fecha de Inicio
            </Text>
            <Text className="text-text-secondary font-asap text-xs mt-1">
              Periodo en que se creó este servicio
            </Text>
          </View>
          
          <View className="bg-card px-4 py-2 rounded-xl">
            <Text className="text-text-secondary font-asap-bold text-sm capitalize">
              {draftService?.fecha_inicio 
                ? new Date(draftService.fecha_inicio).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
                : "N/A"}
            </Text>
          </View>
        </View>

        {/* Modalidad Compartida */}
        <View className="flex-row items-center justify-between mb-4 pt-4 border-t border-border/10">
          <View className="flex-1 mr-4">
            <Text className="text-text-primary font-asap-bold text-base">
              Servicio Compartido
            </Text>
            <Text className="text-text-secondary font-asap text-xs mt-1">
              Dividir cuenta con familiares/amigos
            </Text>
          </View>
          <Switch
            value={draftService.es_compartido}
            onValueChange={toggleCompartido}
            trackColor={{ false: "#E2E8F0", true: "#1F7ECC80" }}
            thumbColor={draftService.es_compartido ? "#1F7ECC" : "#94A3B8"}
          />
        </View>
      </View>
    </EVAModal>
  );
};

export default EditServiceModal;
