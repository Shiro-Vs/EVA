import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import EVAModal from "../../../../components/common/EVAModal";
import { useAppTheme } from "../../../../hooks/useAppTheme";

interface PayServiceModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (monto: number, cuentaId: string, fecha: Date) => void;
  montoSugerido: number;
  mes: string;
  accounts: any[];
  initialAccountId?: string;
  initialDate?: Date;
}

export default function PayServiceModal({
  visible,
  onClose,
  onConfirm,
  montoSugerido,
  mes,
  accounts,
  initialAccountId,
  initialDate,
}: PayServiceModalProps) {
  const { colors } = useAppTheme();
  const [monto, setMonto] = useState(montoSugerido.toString());
  const [idCuenta, setIdCuenta] = useState(initialAccountId || accounts[0]?.id || "");
  const [isAccountListVisible, setIsAccountListVisible] = useState(false);
  
  // Inicializar la fecha en el mes que se está pagando para ahorrar clics
  const [selectedDate, setSelectedDate] = useState(() => {
    if (initialDate) return new Date(initialDate);
    
    const [mesStr, anioStr] = mes.split(" ");
    const mesesMap: Record<string, number> = {
      "Enero": 0, "Febrero": 1, "Marzo": 2, "Abril": 3, "Mayo": 4, "Junio": 5,
      "Julio": 6, "Agosto": 7, "Septiembre": 8, "Octubre": 9, "Noviembre": 10, "Diciembre": 11
    };
    const targetDate = new Date();
    targetDate.setFullYear(parseInt(anioStr));
    targetDate.setMonth(mesesMap[mesStr] || 0);
    // Intentamos poner el día de hoy si estamos en el mes actual, sino el día 1
    const now = new Date();
    if (now.getMonth() === targetDate.getMonth() && now.getFullYear() === targetDate.getFullYear()) {
      return now;
    }
    targetDate.setDate(1);
    return targetDate;
  });

  const handleConfirm = () => {
    onConfirm(parseFloat(monto) || montoSugerido, idCuenta, selectedDate);
  };

  const selectedAccount = accounts.find(a => a.id === idCuenta);

  return (
    <EVAModal
      visible={visible}
      title={isAccountListVisible ? "Seleccionar Cuenta" : "Pagar Servicio"}
      onClose={() => {
        if (isAccountListVisible) setIsAccountListVisible(false);
        else onClose();
      }}
      primaryButtonText={isAccountListVisible ? undefined : "Confirmar Pago"}
      onPrimaryAction={isAccountListVisible ? undefined : handleConfirm}
      secondaryButtonText={isAccountListVisible ? "Volver" : "Cancelar"}
      onSecondaryAction={() => {
        if (isAccountListVisible) setIsAccountListVisible(false);
        else onClose();
      }}
    >
      <View className="py-2">
        {!isAccountListVisible ? (
          <>
            {/* Info del Mes y Fecha de Pago Interactiva */}
            <View 
              className="p-4 rounded-2xl mb-6 border"
              style={{ backgroundColor: colors.card, borderColor: `${colors.text}10` }}
            >
              <View 
                className="flex-row items-center justify-between mb-4 pb-4 border-b"
                style={{ borderBottomColor: colors.border }}
              >
                <View>
                  <Text 
                    className="font-asap-semibold text-[10px] uppercase tracking-widest mb-1"
                    style={{ color: colors.textSecondary }}
                  >
                    MES A PAGAR
                  </Text>
                  <Text 
                    className="font-asap-bold text-lg"
                    style={{ color: colors.text }}
                  >
                    {mes}
                  </Text>
                </View>
                <View style={{ backgroundColor: `${colors.primary}15`, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
                   <Text style={{ color: colors.primary, fontFamily: 'AsapBold', fontSize: 10, textTransform: 'uppercase' }}>Pendiente</Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between">
                <View>
                  <Text 
                    className="font-asap-semibold text-[10px] uppercase tracking-widest mb-1"
                    style={{ color: colors.textSecondary }}
                  >
                    FECHA DE PAGO
                  </Text>
                  <Text 
                    className="font-asap-semibold text-sm"
                    style={{ color: colors.text }}
                  >
                    {selectedDate.toLocaleDateString("es-ES", { day: '2-digit', month: 'short', year: 'numeric' })}
                  </Text>
                </View>

                <View 
                  className="flex-row items-center rounded-xl px-1 py-1 shadow-sm border"
                  style={{ backgroundColor: colors.background, borderColor: colors.border }}
                >
                  <TouchableOpacity 
                    onPress={() => {
                      const d = new Date(selectedDate);
                      d.setDate(d.getDate() - 1);
                      setSelectedDate(d);
                    }}
                    className="w-8 h-8 items-center justify-center"
                  >
                    <Ionicons name="chevron-back" size={16} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => {
                      const d = new Date(selectedDate);
                      d.setDate(d.getDate() + 1);
                      setSelectedDate(d);
                    }}
                    className="w-8 h-8 items-center justify-center"
                  >
                    <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Input Monto */}
            <View className="mb-6">
              <Text 
                className="font-asap-semibold text-[10px] uppercase tracking-widest mb-3 ml-1"
                style={{ color: colors.textSecondary }}
              >
                Monto pagado
              </Text>
              <View 
                className="flex-row items-center p-4 rounded-2xl border"
                style={{ backgroundColor: colors.card, borderColor: `${colors.text}05` }}
              >
                <Text style={{ color: colors.text, fontFamily: 'AsapBold', fontSize: 20, marginRight: 8 }}>S/</Text>
                <TextInput
                  value={monto}
                  onChangeText={setMonto}
                  keyboardType="numeric"
                  className="flex-1 font-asap-bold text-xl"
                  style={{ color: colors.text }}
                  placeholder="0.00"
                  placeholderTextColor={colors.muted}
                />
                <TouchableOpacity 
                  onPress={() => setMonto(montoSugerido.toString())}
                  style={{ backgroundColor: `${colors.primary}15`, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}
                >
                  <Text style={{ color: colors.primary, fontFamily: 'AsapBold', fontSize: 10 }}>RESETEAR</Text>
                </TouchableOpacity>
              </View>
              <Text 
                className="font-asap text-[10px] mt-2 ml-1 italic"
                style={{ color: colors.textSecondary, opacity: 0.6 }}
              >
                * Monto a pagar es S/ {montoSugerido.toFixed(2)}
              </Text>
            </View>

            {/* Selector Cuenta */}
            <View className="mb-4">
              <Text 
                className="font-asap-semibold text-[10px] uppercase tracking-widest mb-3 ml-1"
                style={{ color: colors.textSecondary }}
              >
                CUENTA CON LA QUE PAGASTE
              </Text>
              <TouchableOpacity
                onPress={() => setIsAccountListVisible(true)}
                className="flex-row items-center justify-between p-4 rounded-2xl border"
                style={{ backgroundColor: colors.card, borderColor: `${colors.text}05` }}
              >
                <View className="flex-row items-center">
                  <View 
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: `${selectedAccount?.color || colors.primary}15` }}
                  >
                    <Ionicons name={selectedAccount?.icono || "card-outline"} size={20} color={selectedAccount?.color || colors.primary} />
                  </View>
                  <Text 
                    className="font-asap-bold text-base"
                    style={{ color: colors.text }}
                  >
                    {selectedAccount?.nombre || "Seleccionar cuenta"}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.muted} />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          /* Lista de Cuentas */
          <View className="w-full">
            {accounts.map((account) => (
              <TouchableOpacity
                key={account.id}
                onPress={() => {
                  setIdCuenta(account.id);
                  setIsAccountListVisible(false);
                }}
                className="flex-row items-center p-5 mb-2 rounded-2xl border"
                style={{ 
                  backgroundColor: idCuenta === account.id ? `${colors.primary}10` : colors.card,
                  borderColor: idCuenta === account.id ? colors.primary : "transparent"
                }}
              >
                <View 
                  className="w-10 h-10 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: idCuenta === account.id ? `${colors.primary}20` : `${colors.text}05` }}
                >
                  <Ionicons 
                    name={account.icono} 
                    size={20} 
                    color={idCuenta === account.id ? colors.primary : colors.muted} 
                  />
                </View>
                <Text 
                  className="font-asap-bold text-base"
                  style={{ color: idCuenta === account.id ? colors.primary : colors.text }}
                >
                  {account.nombre}
                </Text>
                {idCuenta === account.id && (
                  <View className="flex-1 items-end">
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </EVAModal>
  );
}
