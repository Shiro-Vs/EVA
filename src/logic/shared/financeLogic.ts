import { Subscription } from "../../interfaces/Subscription";
import { Contact } from "../../interfaces/Contact";
import { parseMesAnio } from "./serviceUtils";

/**
 * Calcula la deuda acumulada de un contacto sumando las cuotas no pagadas
 * cuya fecha límite ya ha pasado.
 */
export const calcularDeudaDeContacto = (subscriptions: Subscription[], contactName: string): number => {
  let totalDebt = 0;
  const today = new Date();

  subscriptions.forEach(sub => {
    sub.historial_pagos?.forEach(hist => {
      const isPaid = hist.registro_pagos_personas[contactName];
      const limitDate = hist.fecha_limite_esperada;

      // Solo sumar a la deuda si ya pasó la fecha límite y no ha pagado
      if (today >= limitDate && isPaid === false) {
        const cuota = hist.cuotas_momento?.[contactName] || 0;
        const pagado = hist.montos_pagados?.[contactName] || 0;
        totalDebt += (cuota - pagado);
      }
    });
  });

  return totalDebt;
};

/**
 * Cuenta cuántos servicios activos tiene un contacto.
 */
export const contarServiciosActivos = (subscriptions: Subscription[], contactName: string): number => {
  return subscriptions.filter(sub => 
    sub.suscriptores?.some(s => s.nombre === contactName)
  ).length;
};

/**
 * Genera el resumen financiero detallado de un contacto (Historial por servicio)
 */
export const generarResumenContacto = (subscriptions: Subscription[], contactName: string) => {
  const result = {
    totalDebt: 0,
    services: [] as any[]
  };

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  subscriptions.forEach(sub => {
    const isSubscribed = sub.suscriptores?.some(s => s.nombre === contactName) || 
                        sub.historial_pagos?.some(h => h.registro_pagos_personas[contactName] !== undefined);

    if (isSubscribed) {
      const serviceSummary = {
        serviceId: sub.id,
        serviceName: sub.nombre,
        icon: sub.icon,
        color: sub.color,
        debt: 0,
        monthsDelay: 0,
        monthsAdvance: 0,
        history: [] as any[]
      };

      sub.historial_pagos?.forEach(hist => {
        if (hist.registro_pagos_personas[contactName] !== undefined) {
          const cuota = hist.cuotas_momento?.[contactName] || 0;
          const pagado = hist.montos_pagados?.[contactName] || 0;
          const isPaid = hist.registro_pagos_personas[contactName];
          const histDate = parseMesAnio(hist.mes_anio);
          
          let status: "pending" | "paid" | "overdue" = isPaid ? "paid" : "pending";
          
          if (!isPaid) {
            const limitDate = hist.fecha_limite_esperada;
            if (now >= limitDate) {
              status = "overdue";
              serviceSummary.monthsDelay++;
              serviceSummary.debt += (cuota - pagado);
            }
          } else if (histDate > currentMonthStart) {
            serviceSummary.monthsAdvance++;
          }

          if (now >= hist.fecha_limite_esperada || isPaid) {
            serviceSummary.history.push({
              mes_anio: hist.mes_anio,
              cuota,
              pagado,
              status
            });
          }
        }
      });

      if (serviceSummary.history.length > 0) {
        result.totalDebt += serviceSummary.debt;
        result.services.push(serviceSummary);
      }
    }
  });

  return result;
};
