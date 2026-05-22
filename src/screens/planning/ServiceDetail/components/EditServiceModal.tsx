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
import { useAppTheme } from "../../../../hooks/useAppTheme";

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
  const { colors, fonts } = useAppTheme();
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
    (accounts && accounts.length > 0)
      ? (accounts.find((a) => a.id === draftService.id_cuenta_pago) || accounts[0])
      : { id: "none", nombre: "Cargando...", icono: "help-circle", color: colors.muted };

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
          <View 
            className="absolute top-0 left-0 right-0 bottom-0 z-[100] rounded-2xl p-4"
            style={{ backgroundColor: colors.background }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text 
        className=" text-lg"
        style={{ fontFamily: fonts.family.bold, color: colors.text }}
       >
                Seleccionar Día de Cobro
              </Text>
              <TouchableOpacity onPress={() => setDaySelectorExpanded(false)}>
                <Ionicons name="close" size={24} color={colors.muted} />
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
                    className="w-[18%] aspect-square items-center justify-center rounded-xl mb-3"
                    style={{ 
                      backgroundColor: draftService.dia_cobro === item ? colors.primary : colors.card,
                      borderWidth: 1,
                      borderColor: draftService.dia_cobro === item ? colors.primary : `${colors.text}05`
                    }}
                  >
                    <Text
           className=" text-base"
           style={{ fontFamily: fonts.family.bold, color: draftService.dia_cobro === item ? "white" : colors.text }}
          >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        <Text 
     className=" text-xs uppercase tracking-wider mb-4"
     style={{ fontFamily: fonts.family.semiBold, color: colors.textSecondary }}
    >
          Personalización del Servicio
        </Text>

        {/* Nombre del Servicio */}
        <Text 
     className=" text-[10px] uppercase tracking-widest mb-3 ml-1"
     style={{ fontFamily: fonts.family.semiBold, color: colors.textSecondary }}
    >
          Nombre
        </Text>
        <View 
          className="px-4 py-1 rounded-xl"
          style={{ 
            backgroundColor: colors.card, 
            borderWidth: 1, 
            borderColor: errors.nombre ? colors.expense : "transparent" 
          }}
        >
          <TextInput
      className=" text-base"
      style={{ fontFamily: fonts.family.bold, color: colors.text }}
      value={draftService.nombre}
      onChangeText={(text) => {
              setDraftService({ ...draftService, nombre: text });
              if (errors.nombre) setErrors({ ...errors, nombre: "" });
            }}
            placeholder="Ej. Netflix Personal"
            placeholderTextColor={colors.muted}
          />
        </View>
        {errors.nombre ? (
          <Text 
      className=" text-[10px] mt-1 ml-1"
      style={{ fontFamily: fonts.family.regular, color: colors.expense }}
     >
            {errors.nombre}
          </Text>
        ) : null}
        <View className="mb-6" />

        {/* Selector de Iconos */}
        <Text 
     className=" text-[10px] uppercase tracking-widest mb-3 ml-1"
     style={{ fontFamily: fonts.family.semiBold, color: colors.textSecondary }}
    >
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
              className="w-10 h-10 rounded-xl items-center justify-center mr-3"
              style={{ 
                backgroundColor: draftService.icon === icon ? colors.primary : colors.card,
                borderWidth: 1,
                borderColor: draftService.icon === icon ? colors.primary : `${colors.text}05`
              }}
            >
              <ServiceIcon
                name={icon}
                size={20}
                color={draftService.icon === icon ? "white" : colors.muted}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Selector de Color Personalizado */}
        <Text 
     className=" text-[10px] uppercase tracking-widest mb-3 ml-1"
     style={{ fontFamily: fonts.family.semiBold, color: colors.textSecondary }}
    >
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

        <Text 
     className=" text-xs uppercase tracking-wider mb-4"
     style={{ fontFamily: fonts.family.semiBold, color: colors.textSecondary }}
    >
          Detalles de Facturación
        </Text>

        {/* Costo */}
        <View className="flex-row items-center justify-between mb-6">
          <Text 
      className=" text-base"
      style={{ fontFamily: fonts.family.regular, color: colors.text }}
     >
            Costo Total
          </Text>
          <View
            className="flex-row items-center px-3 py-0 rounded-xl"
            style={{ 
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: errors.costo ? colors.expense : "transparent"
            }}
          >
            <Text style={{ color: colors.textSecondary, fontFamily: 'Asap', marginRight: 4 }}>S/</Text>
            <TextInput
       className=" text-lg min-w-[50px]"
       style={{ fontFamily: fonts.family.bold, color: colors.text }}
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
          <Text 
      className=" text-[10px] -mt-5 mb-6 text-right"
      style={{ fontFamily: fonts.family.regular, color: colors.expense }}
     >
            {errors.costo}
          </Text>
        ) : null}

        {/* Día de Cobro */}
        <View className="flex-row items-center justify-between mb-6 z-40">
          <Text 
      className=" text-base"
      style={{ fontFamily: fonts.family.regular, color: colors.text }}
     >
            Día de cobro
          </Text>
          <TouchableOpacity
            className="flex-row items-center justify-between px-4 py-3 rounded-xl min-w-[90px]"
            style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: `${colors.text}05` }}
            onPress={() => setDaySelectorExpanded(true)}
            activeOpacity={0.7}
          >
            <Text 
       className=" text-sm text-center flex-1 mr-2"
       style={{ fontFamily: fonts.family.bold, color: colors.text }}
      >
              {draftService.dia_cobro}
            </Text>
            <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Frecuencia */}
        <View className="flex-row items-center justify-between mb-2">
          <Text 
      className=" text-base"
      style={{ fontFamily: fonts.family.regular, color: colors.text }}
     >
            Frecuencia
          </Text>
          <View 
            className="flex-row rounded-xl p-1"
            style={{ backgroundColor: colors.card }}
          >
            <TouchableOpacity
              onPress={() => toggleFrecuencia("mensual")}
              className="px-4 py-1.5 rounded-lg"
              style={{ backgroundColor: draftService.frecuencia === "mensual" ? colors.primary : "transparent" }}
            >
              <Text
        className=" text-xs"
        style={{ fontFamily: fonts.family.semiBold, color: draftService.frecuencia === "mensual" ? "white" : colors.textSecondary }}
       >
                Mensual
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => toggleFrecuencia("anual")}
              className="px-4 py-1.5 rounded-lg"
              style={{ backgroundColor: draftService.frecuencia === "anual" ? colors.primary : "transparent" }}
            >
              <Text
        className=" text-xs"
        style={{ fontFamily: fonts.family.semiBold, color: draftService.frecuencia === "anual" ? "white" : colors.textSecondary }}
       >
                Anual
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Advertencia de cambio de frecuencia */}
        {draftService.frecuencia !== service.frecuencia && (
          <View style={{ backgroundColor: `${colors.warning}15`, padding: 12, borderRadius: 12, marginBottom: 20, flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="alert-circle" size={18} color={colors.warning} style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.warning, fontFamily: fonts.family.bold, fontSize: 10 }}>⚠️ CAMBIO DE CICLO</Text>
              <Text style={{ color: colors.textSecondary, fontFamily: fonts.family.regular, fontSize: 9, marginTop: 2 }}>
                Recuerda ajustar las cuotas de los participantes. Los meses anteriores y sus deudas no se verán afectados.
              </Text>
            </View>
          </View>
        )}

        {/* Cuenta de Pago */}
        <View className="flex-row items-center justify-between mb-8 z-50">
          <Text 
      className=" text-base"
      style={{ fontFamily: fonts.family.regular, color: colors.text }}
     >
            Cuenta
          </Text>
          <View>
            <TouchableOpacity
              className="flex-row items-center justify-between px-4 py-3 rounded-xl min-w-[150px]"
              style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: `${colors.text}05` }}
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
                <Text 
         className=" text-sm"
         style={{ fontFamily: fonts.family.semiBold, color: colors.text }}
        >
                  {currentAccount.nombre}
                </Text>
              </View>
              <Ionicons
                name={isAccountSelectorExpanded ? "chevron-up" : "chevron-down"}
                size={16}
                color={colors.textSecondary}
                className="ml-2"
              />
            </TouchableOpacity>

            {isAccountSelectorExpanded && (
              <View
                className="absolute right-0 bottom-14 rounded-xl shadow-2xl py-2"
                style={{ width: 170, zIndex: 1000, elevation: 20, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }}
              >
                {accounts.map((account) => (
                  <TouchableOpacity
                    key={account.id}
                    className="flex-row items-center px-4 py-3"
                    style={{ 
                      backgroundColor: draftService.id_cuenta_pago === account.id ? `${colors.primary}15` : "transparent"
                    }}
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
           className=" text-sm"
           style={{ fontFamily: fonts.family.semiBold, color: draftService.id_cuenta_pago === account.id ? colors.primary : colors.text }}
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
        <View 
          className="flex-row items-center justify-between mb-6 pt-4 border-t"
          style={{ borderTopColor: colors.border }}
        >
          <View className="flex-1 mr-4">
            <Text 
       className=" text-base"
       style={{ fontFamily: fonts.family.bold, color: colors.text }}
      >
              Fecha de Inicio
            </Text>
            <Text 
       className=" text-xs mt-1"
       style={{ fontFamily: fonts.family.regular, color: colors.textSecondary }}
      >
              Periodo en que se creó este servicio
            </Text>
          </View>
          
          <View 
            className="px-4 py-2 rounded-xl"
            style={{ backgroundColor: colors.card }}
          >
            <Text 
       className=" text-sm capitalize"
       style={{ fontFamily: fonts.family.bold, color: colors.textSecondary }}
      >
              {draftService?.fecha_inicio 
                ? new Date(draftService.fecha_inicio).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
                : "N/A"}
            </Text>
          </View>
        </View>

        {/* Modalidad Compartida */}
        <View 
          className="flex-row items-center justify-between mb-4 pt-4 border-t"
          style={{ borderTopColor: colors.border }}
        >
          <View className="flex-1 mr-4">
            <Text 
       className=" text-base"
       style={{ fontFamily: fonts.family.bold, color: colors.text }}
      >
              Servicio Compartido
            </Text>
            <Text 
       className=" text-xs mt-1"
       style={{ fontFamily: fonts.family.regular, color: colors.textSecondary }}
      >
              Dividir cuenta con familiares/amigos
            </Text>
          </View>
          <Switch
            value={draftService.es_compartido}
            onValueChange={toggleCompartido}
            trackColor={{ false: colors.border, true: `${colors.primary}80` }}
            thumbColor={draftService.es_compartido ? colors.primary : colors.muted}
          />
        </View>
      </View>
    </EVAModal>
  );
};

export default EditServiceModal;
