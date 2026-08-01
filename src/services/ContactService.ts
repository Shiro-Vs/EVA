import { Contact } from "../interfaces/Contact";
import { mockDatabase } from "../data/mock/mockData";
import { calcularDeudaDeContacto, contarServiciosActivos } from "../logic/shared/financeLogic";

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

export const ContactService = {
  async getContacts(): Promise<Contact[]> {
    await networkDelay(300);
    const contacts = clone(mockDatabase.contacts);

    contacts.forEach(contact => {
      contact.total_deuda = calcularDeudaDeContacto(mockDatabase.subscriptions, contact.id);
      contact.total_servicios = contarServiciosActivos(mockDatabase.subscriptions, contact.id);
    });

    return contacts;
  },

  async createContact(contact: Omit<Contact, "id">): Promise<Contact> {
    await networkDelay(400);
    const id = `cont_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newContact: Contact = { ...contact, id };
    mockDatabase.contacts.push(newContact);
    return clone(newContact);
  },

  async updateContact(id: string, data: Partial<Contact>): Promise<Contact> {
    await networkDelay(400);
    const index = mockDatabase.contacts.findIndex(c => c.id === id);
    if (index === -1) throw new Error("Contacto no encontrado");

    mockDatabase.contacts[index] = { ...mockDatabase.contacts[index], ...data };

    // El historial de suscripciones se indexa por Contact.id, no por nombre —
    // renombrar un contacto ya no requiere tocar ninguna suscripción.

    return clone(mockDatabase.contacts[index]);
  },

  async deleteContact(id: string): Promise<boolean> {
    await networkDelay(400);
    const initialLength = mockDatabase.contacts.length;
    mockDatabase.contacts = mockDatabase.contacts.filter(c => c.id !== id);
    return mockDatabase.contacts.length < initialLength;
  },

  async canDeleteContact(contactId: string): Promise<{ canDelete: boolean; reason?: string }> {
    await networkDelay(300);

    const contact = mockDatabase.contacts.find(c => c.id === contactId);
    if (!contact) return { canDelete: true };

    // 1. Verificar deuda (usando lógica centralizada)
    const totalDebt = calcularDeudaDeContacto(mockDatabase.subscriptions, contactId);
    if (totalDebt > 0) {
      return {
        canDelete: false,
        reason: `Este contacto tiene una deuda pendiente de S/ ${totalDebt.toFixed(2)}.`
      };
    }

    // 2. Verificar participación activa
    const activeServicesCount = contarServiciosActivos(mockDatabase.subscriptions, contactId);
    if (activeServicesCount > 0) {
      const activeServices = mockDatabase.subscriptions.filter(sub =>
        sub.suscriptores?.some(s => s.id === contactId)
      );
      const names = activeServices.map(s => s.nombre).join(", ");
      return {
        canDelete: false,
        reason: `Este contacto participa en ${activeServicesCount} servicios activos: ${names}. Debes quitarlo de esos servicios primero.`
      };
    }

    return { canDelete: true };
  },

  async pruneOrphanSubscribers(): Promise<void> {
    await networkDelay(300);
    const contactIds = new Set(mockDatabase.contacts.map(c => c.id));

    mockDatabase.subscriptions.forEach(sub => {
      if (sub.suscriptores) {
        sub.suscriptores = sub.suscriptores.filter(s => contactIds.has(s.id));
      }

      if (sub.historial_pagos) {
        sub.historial_pagos.forEach(hist => {
          if (!hist.fecha_real_pago) {
            Object.keys(hist.registro_pagos_personas).forEach(id => {
              if (!contactIds.has(id)) {
                delete hist.registro_pagos_personas[id];
                if (hist.cuotas_momento) delete hist.cuotas_momento[id];
                if (hist.montos_pagados) delete hist.montos_pagados[id];
              }
            });
          }
        });
      }
    });
  }
};
