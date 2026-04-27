import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import EVAModal from "../../../../components/common/EVAModal";

interface PayServiceModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (monto: number, cuentaId: string, fecha: Date) => void;
  montoSugerido: number;
  mes: string;
  accounts: any[];
}

export default function PayServiceModal({
  visible,
  onClose,
  onConfirm,
  montoSugerido,
  mes,
  accounts,
}: PayServiceModalProps) {
  const [monto, setMonto] = useState(montoSugerido.toString());
  const [idCuenta, setIdCuenta] = useState(accounts[0]?.id || "");
  const [isAccountListVisible, setIsAccountListVisible] = useState(false);
  
  // Inicializar la fecha en el mes que se está pagando para ahorrar clics
  const [selectedDate, setSelectedDate] = useState(() => {
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
            <View className="bg-slate-50 p-4 rounded-2xl mb-6">
              <View className="flex-row items-center justify-between mb-4 pb-4 border-b border-slate-200/50">
                <View>
                  <Text className="text-text-secondary font-asap-semibold text-[10px] uppercase tracking-widest mb-1">
                    MES A PAGAR
                  </Text>
                  <Text className="text-text-primary font-asap-bold text-lg">{mes}</Text>
                </View>
                <View className="bg-primary/10 px-3 py-1.5 rounded-xl">
                   <Text className="text-primary font-asap-bold text-[10px] uppercase">Pendiente</Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-text-secondary font-asap-semibold text-[10px] uppercase tracking-widest mb-1">
                    FECHA DE PAGO
                  </Text>
                  <Text className="text-text-primary font-asap-semibold text-sm">
                    {selectedDate.toLocaleDateString("es-ES", { day: '2-digit', month: 'short', year: 'numeric' })}
                  </Text>
                </View>

                <View className="flex-row items-center bg-white rounded-xl px-1 py-1 shadow-sm border border-slate-100">
                  <TouchableOpacity 
                    onPress={() => {
                      const d = new Date(selectedDate);
                      d.setDate(d.getDate() - 1);
                      setSelectedDate(d);
                    }}
                    className="w-8 h-8 items-center justify-center"
                  >
                    <Ionicons name="chevron-back" size={16} color="#1F7ECC" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => {
                      const d = new Date(selectedDate);
                      d.setDate(d.getDate() + 1);
                      setSelectedDate(d);
                    }}
                    className="w-8 h-8 items-center justify-center"
                  >
                    <Ionicons name="chevron-forward" size={16} color="#1F7ECC" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Input Monto */}
            <View className="mb-6">
              <Text className="text-text-secondary font-asap-semibold text-[10px] uppercase tracking-widest mb-3 ml-1">
                Monto pagado
              </Text>
              <View className="bg-card flex-row items-center p-4 rounded-2xl">
                <Text className="text-text-primary font-asap-bold text-xl mr-2">S/</Text>
                <TextInput
                  value={monto}
                  onChangeText={setMonto}
                  keyboardType="numeric"
                  className="flex-1 text-text-primary font-asap-bold text-xl"
                  placeholder="0.00"
                />
                <TouchableOpacity 
                  onPress={() => setMonto(montoSugerido.toString())}
                  className="bg-primary/10 px-3 py-1.5 rounded-lg"
                >
                  <Text className="text-primary font-asap-bold text-[10px]">RESETEAR</Text>
                </TouchableOpacity>
              </View>
              <Text className="text-text-secondary/60 font-asap text-[10px] mt-2 ml-1 italic">
                * Monto a pagar es S/ {montoSugerido.toFixed(2)}
              </Text>
            </View>

            {/* Selector Cuenta */}
            <View className="mb-4">
              <Text className="text-text-secondary font-asap-semibold text-[10px] uppercase tracking-widest mb-3 ml-1">
                CUENTA CON LA QUE PAGASTE
              </Text>
              <TouchableOpacity
                onPress={() => setIsAccountListVisible(true)}
                className="bg-card flex-row items-center justify-between p-4 rounded-2xl"
              >
                <View className="flex-row items-center">
                  <View 
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: `${selectedAccount?.color || "#1F7ECC"}15` }}
                  >
                    <Ionicons name={selectedAccount?.icono || "card-outline"} size={20} color={selectedAccount?.color || "#1F7ECC"} />
                  </View>
                  <Text className="text-text-primary font-asap-bold text-base">
                    {selectedAccount?.nombre || "Seleccionar cuenta"}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#64748B" />
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
                className={`flex-row items-center p-5 mb-2 rounded-2xl ${
                  idCuenta === account.id ? "bg-primary/10" : "bg-card/50"
                }`}
              >
                <View 
                  className="w-10 h-10 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: idCuenta === account.id ? "#1F7ECC20" : "#F1F5F9" }}
                >
                  <Ionicons 
                    name={account.icono} 
                    size={20} 
                    color={idCuenta === account.id ? "#1F7ECC" : "#64748B"} 
                  />
                </View>
                <Text className={`font-asap-bold text-base ${
                  idCuenta === account.id ? "text-primary" : "text-text-primary"
                }`}>
                  {account.nombre}
                </Text>
                {idCuenta === account.id && (
                  <View className="flex-1 items-end">
                    <Ionicons name="checkmark-circle" size={24} color="#1F7ECC" />
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
