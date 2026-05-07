import { Subscription, Subscriber } from "../interfaces/Subscription";
import { mockDatabase } from "../data/mock/mockData";
import { parseMesAnio, compareMesAnioDesc, MESES_NOMBRES } from "../logic/serviceUtils";
import { syncServiceHistory } from "../logic/subscriptionLogic";

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
    
    // Sincronizar todos los servicios antes de devolverlos
    mockDatabase.subscriptions.forEach(sub => syncServiceHistory(sub));
    
    return clone(mockDatabase.subscriptions);
  },

  async getSubscriptionById(id: string): Promise<Subscription | null> {
    await networkDelay(300);
    const sub = mockDatabase.subscriptions.find(s => s.id === id);
    if (sub) {
      syncServiceHistory(sub);
      return clone(sub);
    }
    return null;
  },

  async updateSubscription(id: string, data: Partial<Subscription>): Promise<Subscription> {
    await networkDelay(500);
    const index = mockDatabase.subscriptions.findIndex(s => s.id === id);
    if (index === -1) throw new Error("Servicio no encontrado");
    
    mockDatabase.subscriptions[index] = { 
      ...mockDatabase.subscriptions[index], 
      ...data 
    };
    
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

    syncServiceHistory(service);
    return clone(service);
  },

  async removeSubscriber(subscriptionId: string, subscriberName: string): Promise<Subscription> {
    await networkDelay(500);
    const index = mockDatabase.subscriptions.findIndex(s => s.id === subscriptionId);
    if (index === -1) throw new Error("Servicio no encontrado");
    
    const service = mockDatabase.subscriptions[index];
    if (service.suscriptores) {
      service.suscriptores = service.suscriptores.filter(s => s.nombre !== subscriberName);
    }
    
    // Limpieza de historial pendiente
    if (service.historial_pagos) {
      service.historial_pagos.forEach(hist => {
        if (!hist.fecha_real_pago) {
            delete hist.registro_pagos_personas[subscriberName];
            if (hist.cuotas_momento) delete hist.cuotas_momento[subscriberName];
            if (hist.montos_pagados) delete hist.montos_pagados[subscriberName];
        }
      });
    }

    return clone(service);
  },

  async addSubscriberToService(serviceId: string, subData: { nombre: string; cuota: number; color: string }): Promise<boolean> {
    await networkDelay(500);
    const sub = mockDatabase.subscriptions.find(s => s.id === serviceId);
    if (!sub) return false;
    if (!sub.suscriptores) sub.suscriptores = [];
    if (sub.suscriptores.some(s => s.nombre === subData.nombre)) return false;
    
    sub.suscriptores.push({
      nombre: subData.nombre,
      cuota: subData.cuota,
      es_cortesia: subData.cuota === 0,
      pagado_hasta: null,
      fecha_inicio: new Date()
    });

    syncServiceHistory(sub);
    return true;
  }
};
