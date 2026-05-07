import { Subscription } from "../interfaces/Subscription";
import { MESES_NOMBRES, compareMesAnioDesc, compareMesAnioAsc, parseMesAnio } from "./serviceUtils";

/**
 * Sincroniza el historial de pagos de un servicio, asegurando que todos los meses
 * desde la fecha de inicio hasta el mes actual existan en el historial.
 */
export const syncServiceHistory = (service: Subscription) => {
  const today = new Date();
  const startDate = new Date(service.fecha_inicio);
  
  if (!service.historial_pagos) service.historial_pagos = [];
  
  let cursor = new Date(today.getFullYear(), today.getMonth(), 1);
  const limitDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

  // 1. Asegurar que los meses necesarios existan
  while (cursor >= limitDate) {
    const mesAnio = `${MESES_NOMBRES[cursor.getMonth()]} ${cursor.getFullYear()}`;
    let hist = service.historial_pagos.find(h => h.mes_anio === mesAnio);
    
    // Decidir si este mes corresponde a un registro de pago según la frecuencia
    const isAnniversaryMonth = cursor.getMonth() === startDate.getMonth();
    const shouldHaveRecord = service.frecuencia === "mensual" || isAnniversaryMonth;

    if (!hist && shouldHaveRecord) {
      hist = {
        mes_anio: mesAnio,
        costo_servicio_momento: service.costo_total_actual,
        fecha_limite_esperada: new Date(cursor.getFullYear(), cursor.getMonth(), service.dia_cobro),
        fecha_real_pago: null,
        dias_atraso: 0,
        balance_servicio: -service.costo_total_actual,
        registro_pagos_personas: {},
        cuotas_momento: {},
        montos_pagados: {},
        es_compartido_momento: service.es_compartido,
        frecuencia_momento: service.frecuencia,
        id_cuenta_pago_real: service.id_cuenta_pago
      };
      service.historial_pagos.push(hist);
    }
    
    // 2. Sincronizar participantes para este mes (si existe registro y es compartido)
    if (hist && (hist.es_compartido_momento ?? service.es_compartido) && service.suscriptores) {
      // Si el registro es anual, cobramos la cuota completa (anual)
      // Si el registro es mensual, cobramos la cuota mensual
      service.suscriptores.forEach(sub => {
        const subJoinDate = new Date(sub.fecha_inicio);
        const endOfCycle = new Date(cursor.getFullYear(), cursor.getMonth() + 1, service.dia_cobro);
        
        if (subJoinDate < endOfCycle) {
          if (hist!.registro_pagos_personas[sub.nombre] === undefined) {
            const currentMonthDate = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
            const paidUntilDate = sub.pagado_hasta ? new Date(sub.pagado_hasta) : null;
            const isPaidByDate = paidUntilDate && currentMonthDate <= new Date(paidUntilDate.getFullYear(), paidUntilDate.getMonth(), 1);

            hist!.registro_pagos_personas[sub.nombre] = sub.es_cortesia || !!isPaidByDate;
            if (!hist!.cuotas_momento) hist!.cuotas_momento = {};
            if (!hist!.montos_pagados) hist!.montos_pagados = {};
            
            // Lógica de cuota según frecuencia del momento
            const freq = hist!.frecuencia_momento || service.frecuencia;
            
            if (freq === "anual") {
                // En anual no solemos prorratear el primer año tan fácilmente, 
                // cobramos la cuota que el usuario tenga configurada como "anual"
                hist!.cuotas_momento[sub.nombre] = sub.cuota;
            } else {
                // Mensual: aplicar prorrateo si es el mes de inicio
                const prevMonthStart = new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1);
                const endOfPrevCycle = new Date(prevMonthStart.getFullYear(), prevMonthStart.getMonth() + 1, service.dia_cobro);
                const isJoinMonth = subJoinDate >= endOfPrevCycle || cursor.getTime() === limitDate.getTime();

                if (isJoinMonth && !sub.es_cortesia) {
                  const { quota, isCourtesy } = calculateProratedQuota(sub.cuota, subJoinDate, service.dia_cobro);
                  hist!.cuotas_momento[sub.nombre] = quota;
                  hist!.registro_pagos_personas[sub.nombre] = isCourtesy;
                } else {
                  hist!.cuotas_momento[sub.nombre] = sub.cuota;
                }
            }
            
            hist!.montos_pagados[sub.nombre] = 0;
          } else {
            // REGLA: Solo actualizamos la cuota si es el mes actual.
            // Los meses pasados mantienen su cuota "congelada" aunque no se hayan pagado.
            const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
            const isCurrentMonth = cursor.getTime() === currentMonthStart;

            if (isCurrentMonth && hist!.montos_pagados?.[sub.nombre] === 0) {
              if (hist!.cuotas_momento) hist!.cuotas_momento[sub.nombre] = sub.cuota;
            }
          }
        }
      });
    }

    cursor.setMonth(cursor.getMonth() - 1);
  }
  
  // Recalcular balances de todos los meses
  service.historial_pagos.forEach(hist => {
    const recaudado = Object.values(hist.montos_pagados || {}).reduce((a: number, b: any) => a + (Number(b) || 0), 0);
    hist.balance_servicio = recaudado - hist.costo_servicio_momento;
  });

  service.historial_pagos.sort((a, b) => compareMesAnioDesc(a.mes_anio, b.mes_anio));
};

/**
 * Calcula la cuota prorrateada para el primer mes de un suscriptor.
 */
export const calculateProratedQuota = (fullQuota: number, joinDate: Date, billingDay: number) => {
  // Encontrar el próximo día de cobro relativo a la unión
  let nextBilling = new Date(joinDate.getFullYear(), joinDate.getMonth(), billingDay);
  if (joinDate.getDate() > billingDay) {
    nextBilling.setMonth(nextBilling.getMonth() + 1);
  }
  
  const diffTime = Math.abs(nextBilling.getTime() - joinDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Regla de cortesía: menos de 5 días = GRATIS
  if (diffDays < 5) return { quota: 0, isCourtesy: true };
  
  // Si es casi el mes completo (28 días o más), cobrar completo
  if (diffDays >= 28) return { quota: fullQuota, isCourtesy: false };
  
  // Calcular proporcional
  const proportional = (fullQuota / 30) * diffDays;
  return { quota: Math.round(proportional * 100) / 100, isCourtesy: false };
};

/**
 * Aplica un pago adelantado usando lógica FIFO (First-In, First-Out).
 * Salda primero los meses más antiguos pendientes.
 */
export const applyFIFOPayment = (service: Subscription, subscriberName: string, monthsPaid: number) => {
  if (!service.historial_pagos) service.historial_pagos = [];
  
  const sub = service.suscriptores?.find(s => s.nombre === subscriberName);
  if (!sub) return;

  // 1. Obtener meses pendientes en los que el suscriptor ya participaba (ordenados ascendentemente)
  const pendingMonths = [...service.historial_pagos]
    .filter(h => h.registro_pagos_personas[subscriberName] === false)
    .sort((a, b) => compareMesAnioAsc(a.mes_anio, b.mes_anio));

  let remaining = monthsPaid;

  // 2. Saldar deudas existentes
  pendingMonths.forEach(h => {
    if (remaining > 0) {
      h.registro_pagos_personas[subscriberName] = true;
      if (h.montos_pagados && h.cuotas_momento) {
        h.montos_pagados[subscriberName] = h.cuotas_momento[subscriberName];
      }
      remaining--;
    }
  });

  // 3. Si aún sobran meses pagados, adelantamos 'pagado_hasta'
  if (remaining > 0) {
    let baseDate: Date;
    
    // Si ya tenía una fecha de pago futuro, empezamos desde ahí
    if (sub.pagado_hasta) {
      baseDate = new Date(sub.pagado_hasta);
    } else {
      // Si no, empezamos desde el mes actual
      const today = new Date();
      baseDate = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    baseDate.setMonth(baseDate.getMonth() + remaining);
    sub.pagado_hasta = baseDate;
  }

  // 4. Recalcular balances del historial afectado
  service.historial_pagos.forEach(hist => {
    const recaudado = Object.values(hist.montos_pagados || {}).reduce((a: number, b: any) => a + (Number(b) || 0), 0);
    hist.balance_servicio = recaudado - hist.costo_servicio_momento;
  });
};
