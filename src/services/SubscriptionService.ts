import { Subscription, Subscriber } from "../interfaces/Subscription";
import { mockDatabase } from "../data/mock/mockData";
import { parseMesAnio, compareMesAnioDesc, MESES_NOMBRES } from "../logic/shared/serviceUtils";
import { syncServiceHistory } from "../logic/shared/subscriptionLogic";

const networkDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const clone = <T>(obj: T): T => {
  const json = JSON.stringify(obj);
  return JSON.parse(json, (key, value) => {
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      return new Date(value);
    }
    return value;
  });
};

export const SubscriptionService = {
  async getSubscriptions(): Promise<Subscription[]> {
    await networkDelay(500);

    // Sincronizar todos los servicios antes de devolverlos (syncServiceHistory es pura, no muta)
    mockDatabase.subscriptions = mockDatabase.subscriptions.map(sub => syncServiceHistory(sub));

    return clone(mockDatabase.subscriptions);
  },

  async getSubscriptionById(id: string): Promise<Subscription | null> {
    await networkDelay(300);
    const index = mockDatabase.subscriptions.findIndex(s => s.id === id);
    if (index === -1) return null;

    const synced = syncServiceHistory(mockDatabase.subscriptions[index]);
    mockDatabase.subscriptions[index] = synced;
    return clone(synced);
  },

  async updateSubscription(id: string, data: Partial<Subscription>): Promise<Subscription> {
    await networkDelay(500);
    const index = mockDatabase.subscriptions.findIndex(s => s.id === id);
    if (index === -1) throw new Error("Servicio no encontrado");

    const oldService = mockDatabase.subscriptions[index];
    const isSwitchingToIndividual = oldService.es_compartido && data.es_compartido === false;
    const isSwitchingToShared = oldService.es_compartido === false && data.es_compartido === true;
    const isSwitchingToAnnual = oldService.frecuencia === "mensual" && data.frecuencia === "anual";
    const isSwitchingToMonthly = oldService.frecuencia === "anual" && data.frecuencia === "mensual";

    mockDatabase.subscriptions[index] = {
      ...oldService,
      ...data
    };

    let updatedService = mockDatabase.subscriptions[index];

    // Manejar transición de historial para el mes actual si no se ha pagado
    if (updatedService.historial_pagos && updatedService.historial_pagos.length > 0) {
      const currentMonth = updatedService.historial_pagos[0];

      if (!currentMonth.fecha_real_pago) {
        // Transición de Compartido / Individual
        if (isSwitchingToIndividual) {
          currentMonth.es_compartido_momento = false;
          currentMonth.registro_pagos_personas = {};
        } else if (isSwitchingToShared) {
          currentMonth.es_compartido_momento = true;
        }

        // Transición de Frecuencia
        if (isSwitchingToAnnual) {
          currentMonth.frecuencia_momento = "anual";
          currentMonth.costo_servicio_momento = updatedService.costo_total_actual;
        } else if (isSwitchingToMonthly) {
          currentMonth.frecuencia_momento = "mensual";
          currentMonth.costo_servicio_momento = updatedService.costo_total_actual;
        }

        // Si hubo cambios críticos (compartido o frecuencia), sincronizamos participantes de nuevo
        if (isSwitchingToShared || isSwitchingToAnnual || isSwitchingToMonthly) {
            // Limpiamos registros previos del mes para que se vuelvan a calcular con el nuevo costo/frecuencia
            currentMonth.registro_pagos_personas = {};
            currentMonth.cuotas_momento = {};
            currentMonth.montos_pagados = {};
            updatedService = syncServiceHistory(updatedService);
            mockDatabase.subscriptions[index] = updatedService;
        }
      }
    }

    return clone(mockDatabase.subscriptions[index]);
  },

  async addOrUpdateSubscriber(subscriptionId: string, subscriber: Subscriber, editingIndex: number | null): Promise<Subscription> {
    await networkDelay(500);
    const index = mockDatabase.subscriptions.findIndex(s => s.id === subscriptionId);
    if (index === -1) throw new Error("Servicio no encontrado");

    const service = mockDatabase.subscriptions[index];
    if (!service.suscriptores) service.suscriptores = [];

    if (editingIndex !== null && editingIndex >= 0) {
      service.suscriptores[editingIndex] = subscriber;
    } else {
      if (!subscriber.fecha_inicio) subscriber.fecha_inicio = new Date();
      service.suscriptores.push(subscriber);
    }

    const synced = syncServiceHistory(service);
    mockDatabase.subscriptions[index] = synced;
    return clone(synced);
  },

  async removeSubscriber(subscriptionId: string, subscriberId: string): Promise<Subscription> {
    await networkDelay(500);
    const index = mockDatabase.subscriptions.findIndex(s => s.id === subscriptionId);
    if (index === -1) throw new Error("Servicio no encontrado");

    const service = mockDatabase.subscriptions[index];
    if (service.suscriptores) {
      service.suscriptores = service.suscriptores.filter(s => s.id !== subscriberId);
    }

    // Si la fecha de cobro de un mes generado es en el futuro, el ciclo aún no comienza.
    // Por ende, borramos al usuario de ese mes para que no aparezca.
    if (service.historial_pagos) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      service.historial_pagos.forEach(hist => {
        if (hist.fecha_limite_esperada) {
          const limitDate = new Date(hist.fecha_limite_esperada);
          limitDate.setHours(0, 0, 0, 0);

          if (limitDate > today) {
            delete hist.registro_pagos_personas[subscriberId];
            if (hist.cuotas_momento) delete hist.cuotas_momento[subscriberId];
            if (hist.montos_pagados) delete hist.montos_pagados[subscriberId];
          }
        }
      });
    }

    return clone(service);
  },

  async addSubscriberToService(serviceId: string, subData: { id: string; nombre: string; cuota: number; color: string }): Promise<boolean> {
    await networkDelay(500);
    const index = mockDatabase.subscriptions.findIndex(s => s.id === serviceId);
    if (index === -1) return false;
    const sub = mockDatabase.subscriptions[index];
    if (!sub.suscriptores) sub.suscriptores = [];
    if (sub.suscriptores.some(s => s.id === subData.id)) return false;

    sub.suscriptores.push({
      id: subData.id,
      nombre: subData.nombre,
      cuota: subData.cuota,
      es_cortesia: subData.cuota === 0,
      pagado_hasta: null,
      fecha_inicio: new Date()
    });

    mockDatabase.subscriptions[index] = syncServiceHistory(sub);
    return true;
  }
};
