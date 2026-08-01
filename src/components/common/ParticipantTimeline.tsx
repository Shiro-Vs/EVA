import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { PaymentHistory } from '../../interfaces/Subscription';
import { compareMesAnioAsc } from '../../logic/shared/serviceUtils';

interface ParticipantTimelineProps {
  subscriberId: string;
  historial_pagos: PaymentHistory[];
  mesInicio: string; // The active/current month in context
  monthsToShow?: number; // How many dots to show
}

export const ParticipantTimeline: React.FC<ParticipantTimelineProps> = ({
  subscriberId,
  historial_pagos,
  mesInicio,
  monthsToShow = 4
}) => {
  const { colors } = useAppTheme();

  if (!historial_pagos || historial_pagos.length === 0) return null;

  const sortedHistory = [...historial_pagos].sort((a, b) => compareMesAnioAsc(a.mes_anio, b.mes_anio));

  const activeIndex = sortedHistory.findIndex(h => h.mes_anio === mesInicio);
  if (activeIndex === -1) return null;

  const startIdx = Math.max(0, activeIndex - monthsToShow + 1);
  const relevantHistory = sortedHistory.slice(startIdx, activeIndex + 1);

  return (
    <View style={styles.container}>
      {relevantHistory.map((hist, index) => {
        const isPaid = hist.registro_pagos_personas?.[subscriberId] === true;
        const isCurrent = hist.mes_anio === mesInicio;
        const participated = hist.registro_pagos_personas?.[subscriberId] !== undefined;

        let dotColor = `${colors.text}20`; // Not participated
        if (participated) {
          dotColor = isPaid ? colors.income : colors.warning;
        }

        return (
          <View key={hist.mes_anio} style={styles.dotContainer}>
            <View 
              style={[
                styles.dot, 
                { backgroundColor: isCurrent ? 'transparent' : dotColor },
                isCurrent && styles.currentDot,
                isCurrent && { borderColor: dotColor }
              ]} 
            />
            {index < relevantHistory.length - 1 && (
              <View style={[styles.line, { backgroundColor: `${colors.text}10` }]} />
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  dotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  currentDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 3,
  },
  line: {
    width: 8,
    height: 2,
    marginHorizontal: 2,
    borderRadius: 1,
  }
});
