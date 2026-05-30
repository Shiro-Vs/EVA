import { Subscription, PaymentHistory, Subscriber } from "../../interfaces/Subscription";

export const mesesMap: Record<string, number> = {
  Enero: 0,
  Febrero: 1,
  Marzo: 2,
  Abril: 3,
  Mayo: 4,
  Junio: 5,
  Julio: 6,
  Agosto: 7,
  Septiembre: 8,
  Octubre: 9,
  Noviembre: 10,
  Diciembre: 11,
};

export const mesesNombres = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export const sumValues = (obj: any) =>
  Object.values(obj || {}).reduce(
    (acc: number, val: any) => acc + (Number(val) || 0),
    0,
  );

export const getSortedHistoryAsc = (historial_pagos: PaymentHistory[]) => {
  return [...(historial_pagos || [])].sort((a, b) => {
    const [mA, yA] = a.mes_anio.split(" ");
    const [mB, yB] = b.mes_anio.split(" ");
    return (
      new Date(parseInt(yA), mesesMap[mA], 1).getTime() -
      new Date(parseInt(yB), mesesMap[mB], 1).getTime()
    );
  });
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
  let currentDate = new Date(parseInt(anioStr), mesesMap[mesStr], 1);

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

  return `${mesesNombres[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
};

export const calculateTotalMonto = (
  nombre: string,
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

  const sub = suscriptores.find((s: any) => s.nombre === nombre);
  const cuotaBase = sub?.cuota || 0;

  let total = 0;
  for (let i = 0; i < numMeses; i++) {
    const hist = startIndex !== -1 ? sortedHistoryAsc[startIndex + i] : null;
    if (hist) {
      total +=
        hist.cuotas_momento?.[nombre] !== undefined
          ? hist.cuotas_momento[nombre]
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
