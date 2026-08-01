import React from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import EVAModal from "../../../../components/common/EVAModal";
import { useAppTheme } from "../../../../hooks/useAppTheme";
import {
  getMesFin,
  calculateTotalMonto,
  getPeriodDisplayLabel,
} from "../../../../logic/shared/serviceHistoryUtils";
import {
  PaymentHistory,
  Subscriber,
} from "../../../../interfaces/Subscription";
import * as Haptics from "expo-haptics";

import { ParticipantPaymentView } from "./ParticipantPaymentView";

interface ParticipantPaymentModalProps {
  paymentModal: any;
  setPaymentModal: (val: any | ((prev: any) => any)) => void;
  frecuencia: string;
  historial_pagos: PaymentHistory[];
  suscriptores: Subscriber[];
  onTogglePayment: (subscriberId: string, monto?: number) => void;
  onAdvancePayment: (subscriberId: string, months: number) => void;
}

export const ParticipantPaymentModal: React.FC<
  ParticipantPaymentModalProps
> = ({
  paymentModal,
  setPaymentModal,
  frecuencia,
  historial_pagos,
  suscriptores,
  onTogglePayment,
  onAdvancePayment,
}) => {
  const { colors, fonts } = useAppTheme();
  const [isSuccess, setIsSuccess] = React.useState(false);

  // Resetea el estado de éxito cuando se abre un nuevo modal
  React.useEffect(() => {
    if (paymentModal.visible) {
      setIsSuccess(false);
    }
  }, [paymentModal.visible]);

  const confirmPayment = async () => {
    setIsSuccess(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    setTimeout(() => {
      const finalMonto = parseFloat(paymentModal.monto) || 0;
      if (onAdvancePayment && paymentModal.meses > 1) {
        onAdvancePayment(paymentModal.id, paymentModal.meses);
      } else {
        onTogglePayment(paymentModal.id, finalMonto);
      }
      setPaymentModal((prev: any) => ({ ...prev, visible: false }));
    }, 800);
  };

  return (
    <EVAModal
      visible={paymentModal.visible}
      title={`Pago de ${paymentModal.nombre}`}
      onClose={() => setPaymentModal({ ...paymentModal, visible: false })}
      primaryButtonText="Confirmar Pago"
      onPrimaryAction={confirmPayment}
      secondaryButtonText="Cancelar"
      isSuccess={isSuccess}
    >
      <ParticipantPaymentView
        data={paymentModal}
        setData={setPaymentModal}
        frecuencia={frecuencia}
        historial_pagos={historial_pagos}
        suscriptores={suscriptores}
      />
    </EVAModal>
  );
};

export default ParticipantPaymentModal;
