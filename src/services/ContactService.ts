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
      contact.total_deuda = calcularDeudaDeContacto(mockDatabase.subscriptions, contact.nombre);
      contact.total_servicios = contarServiciosActivos(mockDatabase.subscriptions, contact.nombre);
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
    
    const oldName = mockDatabase.contacts[index].nombre;
    const newName = data.nombre || oldName;
    
    mockDatabase.contacts[index] = { ...mockDatabase.contacts[index], ...data };
    
    // Cascada de actualización de nombre en suscripciones
    if (oldName !== newName) {
      mockDatabase.subscriptions.forEach(sub => {
        sub.suscriptores?.forEach(s => { if (s.nombre === oldName) s.nombre = newName; });
        sub.historial_pagos?.forEach(hist => {
          if (hist.registro_pagos_personas[oldName] !== undefined) {
            hist.registro_pagos_personas[newName] = hist.registro_pagos_personas[oldName];
            delete hist.registro_pagos_personas[oldName];
          }
          if (hist.cuotas_momento?.[oldName] !== undefined) {
            hist.cuotas_momento[newName] = hist.cuotas_momento[oldName];
            delete hist.cuotas_momento[oldName];
          }
          if (hist.montos_pagados?.[oldName] !== undefined) {
            hist.montos_pagados[newName] = hist.montos_pagados[oldName];
            delete hist.montos_pagados[oldName];
          }
        });
      });
    }
    
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
    
    const contactName = contact.nombre;

    // 1. Verificar deuda (usando lógica centralizada)
    const totalDebt = calcularDeudaDeContacto(mockDatabase.subscriptions, contactName);
    if (totalDebt > 0) {
      return { 
        canDelete: false, 
        reason: `Este contacto tiene una deuda pendiente de S/ ${totalDebt.toFixed(2)}.` 
      };
    }

    // 2. Verificar participación activa
    const activeServicesCount = contarServiciosActivos(mockDatabase.subscriptions, contactName);
    if (activeServicesCount > 0) {
      const activeServices = mockDatabase.subscriptions.filter(sub => 
        sub.suscriptores?.some(s => s.nombre === contactName)
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
    const contactNames = new Set(mockDatabase.contacts.map(c => c.nombre));
    
    mockDatabase.subscriptions.forEach(sub => {
      if (sub.suscriptores) {
        sub.suscriptores = sub.suscriptores.filter(s => contactNames.has(s.nombre));
      }
      
      if (sub.historial_pagos) {
        sub.historial_pagos.forEach(hist => {
          if (!hist.fecha_real_pago) {
            Object.keys(hist.registro_pagos_personas).forEach(name => {
              if (!contactNames.has(name)) {
                delete hist.registro_pagos_personas[name];
                if (hist.cuotas_momento) delete hist.cuotas_momento[name];
                if (hist.montos_pagados) delete hist.montos_pagados[name];
              }
            });
          }
        });
      }
    });
  }
};
