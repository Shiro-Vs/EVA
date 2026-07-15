import { Subscription, PaymentHistory, Subscriber } from "../../interfaces/Subscription";
import { MESES_NOMBRES, compareMesAnioDesc, compareMesAnioAsc, parseMesAnio } from "./serviceUtils";

/**
 * Sincroniza el historial de pagos de un servicio, asegurando que todos los meses
 * desde la fecha de inicio hasta el mes actual existan en el historial.
 */
export const syncServiceHistory = (service: Subscription) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(service.fecha_inicio);
  
  if (!service.historial_pagos) service.historial_pagos = [];

  // 0. Limpiar ciclos futuros que no tengan pagos, para que se regeneren con la configuración actual
  service.historial_pagos = service.historial_pagos.filter(hist => {
    if (hist.fecha_limite_esperada) {
      const limit = new Date(hist.fecha_limite_esperada);
      limit.setHours(0, 0, 0, 0);
      if (limit > today) {
        const hasServicePayment = !!hist.fecha_real_pago;
        const hasParticipantPayments = Object.values(hist.montos_pagados || {}).some((m: any) => Number(m) > 0);
        if (!hasServicePayment && !hasParticipantPayments) {
          return false; // Eliminar para que el bucle lo regenere
        }
      }
    }
    return true;
  });
  
  // 1. Ordenar ASC para iterar hacia adelante
  service.historial_pagos.sort((a, b) => compareMesAnioAsc(a.mes_anio, b.mes_anio));

  // Determinar max pagado_hasta
  let maxPagadoHasta = new Date(0);
  if (service.suscriptores) {
    service.suscriptores.forEach(sub => {
      if (sub.pagado_hasta) {
        const pDate = new Date(sub.pagado_hasta);
        if (pDate > maxPagadoHasta) maxPagadoHasta = pDate;
      }
    });
  }

  const mesesMap: Record<string, number> = {
    Enero: 0, Febrero: 1, Marzo: 2, Abril: 3, Mayo: 4, Junio: 5,
    Julio: 6, Agosto: 7, Septiembre: 8, Octubre: 9, Noviembre: 10, Diciembre: 11,
  };

  let generatedFutureCycle = false;

  // 2. Generar ciclos faltantes hacia el futuro
  while (true) {
    let nextDate: Date;
    const wasEmpty = service.historial_pagos.length === 0;

    if (wasEmpty) {
      nextDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    } else {
      const lastHist = service.historial_pagos[service.historial_pagos.length - 1];
      const freq = lastHist.frecuencia_momento || service.frecuencia;
      let [m, y] = lastHist.mes_anio.split(" ");
      nextDate = new Date(parseInt(y), mesesMap[m], 1);
      
      if (freq === "anual") {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      } else {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
    }

    const limitExpected = new Date(nextDate.getFullYear(), nextDate.getMonth(), service.dia_cobro);
    
    // Condición de parada
    if (limitExpected > today) {
      if (generatedFutureCycle && limitExpected > maxPagadoHasta) {
        break; // Ya generamos el próximo recibo y pasamos cualquier pago adelantado
      }
      if (!wasEmpty) {
        generatedFutureCycle = true;
      }
    }

    const mesAnio = `${MESES_NOMBRES[nextDate.getMonth()]} ${nextDate.getFullYear()}`;
    
    if (!service.historial_pagos.some(h => h.mes_anio === mesAnio)) {
      service.historial_pagos.push({
        mes_anio: mesAnio,
        costo_servicio_momento: service.costo_total_actual,
        fecha_limite_esperada: limitExpected,
        fecha_real_pago: null,
        dias_atraso: 0,
        balance_servicio: -service.costo_total_actual,
        registro_pagos_personas: {},
        cuotas_momento: {},
        montos_pagados: {},
        es_compartido_momento: service.es_compartido,
        frecuencia_momento: service.frecuencia,
        id_cuenta_pago_real: service.id_cuenta_pago
      });
    }
  }

  // 3. Determinar el mes activo actual (el más reciente <= hoy)
  let currentActiveMonth = "";
  let maxPastDate = new Date(0);
  service.historial_pagos.forEach(hist => {
    if (hist.fecha_limite_esperada) {
      const limit = new Date(hist.fecha_limite_esperada);
      limit.setHours(0,0,0,0);
      if (limit <= today && limit >= maxPastDate) {
        maxPastDate = limit;
        currentActiveMonth = hist.mes_anio;
      }
    }
  });

  // Si no hay ninguno <= hoy, el activo es el primero (caso donde el servicio apenas va a empezar)
  if (!currentActiveMonth && service.historial_pagos.length > 0) {
    currentActiveMonth = service.historial_pagos[0].mes_anio;
  }

  // 4. Sincronizar participantes
  service.historial_pagos.forEach(hist => {
    if ((hist.es_compartido_momento ?? service.es_compartido) && service.suscriptores) {
      const isCurrentMonth = hist.mes_anio === currentActiveMonth;
      
      let [m, y] = hist.mes_anio.split(" ");
      const histDate = new Date(parseInt(y), mesesMap[m], 1);
      const endOfCycle = new Date(histDate.getFullYear(), histDate.getMonth() + 1, service.dia_cobro);

      service.suscriptores.forEach(sub => {
        const subJoinDate = new Date(sub.fecha_inicio);
        
        if (subJoinDate < endOfCycle) {
          if (hist.registro_pagos_personas[sub.nombre] === undefined) {
            const paidUntilDate = sub.pagado_hasta ? new Date(sub.pagado_hasta) : null;
            const isPaidByDate = paidUntilDate && histDate <= new Date(paidUntilDate.getFullYear(), paidUntilDate.getMonth(), 1);

            hist.registro_pagos_personas[sub.nombre] = sub.es_cortesia || !!isPaidByDate;
            if (!hist.cuotas_momento) hist.cuotas_momento = {};
            if (!hist.montos_pagados) hist.montos_pagados = {};
            
            const freq = hist.frecuencia_momento || service.frecuencia;
            
            if (freq === "anual") {
                hist.cuotas_momento[sub.nombre] = sub.cuota;
            } else {
                const prevMonthStart = new Date(histDate.getFullYear(), histDate.getMonth() - 1, 1);
                const endOfPrevCycle = new Date(prevMonthStart.getFullYear(), prevMonthStart.getMonth() + 1, service.dia_cobro);
                const isJoinMonth = subJoinDate >= endOfPrevCycle || (service.historial_pagos?.[0]?.mes_anio === hist.mes_anio);

                if (isJoinMonth && !sub.es_cortesia) {
                  const { quota, isCourtesy } = calculateProratedQuota(sub.cuota, subJoinDate, service.dia_cobro);
                  hist.cuotas_momento[sub.nombre] = quota;
                  hist.registro_pagos_personas[sub.nombre] = isCourtesy;
                } else {
                  hist.cuotas_momento[sub.nombre] = sub.cuota;
                }
            }
            
            hist.montos_pagados[sub.nombre] = 0;
          }
        }
      });
    }
  });

  // 5. Recalcular balances y ordenar DESC para la vista
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
