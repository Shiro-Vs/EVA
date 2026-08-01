import { PaymentHistory } from "../../interfaces/Subscription";
import { MESES_NOMBRES, compareMesAnioAsc } from "./serviceUtils";

export const sumValues = (obj: any) =>
  Object.values(obj || {}).reduce(
    (acc: number, val: any) => acc + (Number(val) || 0),
    0,
  );

export const getSortedHistoryAsc = (historial_pagos: PaymentHistory[]) => {
  return [...(historial_pagos || [])].sort((a, b) =>
    compareMesAnioAsc(a.mes_anio, b.mes_anio),
  );
};

export const getMesFin = (
  mesInicio: string | undefined,
  numMeses: number,
  freq: string,
  historial_pagos: PaymentHistory[],
) => {
  if (!mesInicio || !historial_pagos) return "";

  const sortedHistoryAsc = getSortedHistoryAsc(historial_pagos);
  const startIndex = sortedHistoryAsc.findIndex(
    (h) => h.mes_anio === mesInicio,
  );

  let [mesStr, anioStr] = mesInicio.split(" ");
  let currentDate = new Date(parseInt(anioStr), MESES_NOMBRES.indexOf(mesStr), 1);

  let lastFreq = "mensual";
  for (let i = 0; i < numMeses; i++) {
    const hist = startIndex !== -1 ? sortedHistoryAsc[startIndex + i] : null;
    lastFreq = hist ? hist.frecuencia_momento || "mensual" : freq;

    if (lastFreq === "anual") {
      currentDate.setFullYear(currentDate.getFullYear() + 1);
    } else {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  }

  if (lastFreq === "mensual") {
    currentDate.setMonth(currentDate.getMonth() - 1);
  }

  return `${MESES_NOMBRES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
};

export const calculateTotalMonto = (
  subscriberId: string,
  numMeses: number,
  mesInicio: string | undefined,
  historial_pagos: PaymentHistory[],
  suscriptores: any[],
) => {
  if (!mesInicio) return 0;

  const sortedHistoryAsc = getSortedHistoryAsc(historial_pagos);
  const startIndex = sortedHistoryAsc.findIndex(
    (h) => h.mes_anio === mesInicio,
  );

  const sub = suscriptores.find((s: any) => s.id === subscriberId);
  const cuotaBase = sub?.cuota || 0;

  let total = 0;
  for (let i = 0; i < numMeses; i++) {
    const hist = startIndex !== -1 ? sortedHistoryAsc[startIndex + i] : null;
    if (hist) {
      total +=
        hist.cuotas_momento?.[subscriberId] !== undefined
          ? hist.cuotas_momento[subscriberId]
          : cuotaBase;
    } else {
      total += cuotaBase;
    }
  }
  return Math.round(total * 100) / 100;
};

export const getPeriodDisplayLabel = (
  mesInicio: string | undefined,
  meses: number,
  frecuencia: string,
  historial_pagos: PaymentHistory[],
) => {
  if (!mesInicio || !historial_pagos) return "";

  const sortedHistoryAsc = getSortedHistoryAsc(historial_pagos);
  const startIndex = sortedHistoryAsc.findIndex(
    (h) => h.mes_anio === mesInicio,
  );

  let totalAnos = 0;
  let totalMeses = 0;

  for (let i = 0; i < meses; i++) {
    const hist = startIndex !== -1 ? sortedHistoryAsc[startIndex + i] : null;
    const freq = hist ? hist.frecuencia_momento || "mensual" : frecuencia;

    if (freq === "anual") {
      totalAnos++;
    } else {
      totalMeses++;
    }
  }

  const labels = [];
  if (totalAnos > 0)
    labels.push(`${totalAnos} ${totalAnos === 1 ? "año" : "años"}`);
  if (totalMeses > 0)
    labels.push(`${totalMeses} ${totalMeses === 1 ? "mes" : "meses"}`);

  return labels.join(" y ");
};
