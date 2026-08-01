import { Transaction } from "../interfaces/Transaction";
import { Subscription } from "../interfaces/Subscription";
import { Category } from "../interfaces/Category";
import { mockDatabase } from "../data/mock/mockData";
import { generarResumenContacto } from "../logic/shared/financeLogic";
import { applyFIFOPayment } from "../logic/shared/subscriptionLogic";
import { compareMesAnioAsc } from "../logic/shared/serviceUtils";

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

export const FinanceService = {
  async getTransactions(): Promise<Transaction[]> {
    await networkDelay(400);
    return clone(mockDatabase.transactions);
  },

  async getCategories(): Promise<Category[]> {
    await networkDelay(300);
    return clone(mockDatabase.categories);
  },

  async createTransaction(transactionData: Omit<Transaction, "id">): Promise<Transaction> {
    await networkDelay(500);
    const newTx: Transaction = { ...transactionData, id: `trx_${Date.now()}` };
    mockDatabase.transactions.unshift(newTx);

    // Actualizar saldo de cuenta
    const accountIndex = mockDatabase.accounts.findIndex(a => a.id === newTx.id_cuenta);
    if (accountIndex !== -1) {
      if (newTx.tipo === "ingreso") mockDatabase.accounts[accountIndex].saldo_actual += newTx.monto_total;
      else mockDatabase.accounts[accountIndex].saldo_actual -= newTx.monto_total;
    }

    return clone(newTx);
  },

  async getContactSummary(contactId: string) {
    await networkDelay(600);
    return generarResumenContacto(mockDatabase.subscriptions, contactId);
  },

  async togglePaymentStatus(subscriptionId: string, monthIndex: number, personaId: string, montoManual?: number): Promise<Subscription> {
    await networkDelay(400);
    const index = mockDatabase.subscriptions.findIndex(s => s.id === subscriptionId);
    if (index === -1) throw new Error("Servicio no encontrado");

    const service = mockDatabase.subscriptions[index];
    if (!service.historial_pagos || !service.historial_pagos[monthIndex]) throw new Error("Historial no encontrado");

    // Lógica FIFO: Si vamos a PAGAR (es decir, actualmente está pendiente en el mes clickeado),
    // buscamos el mes más antiguo pendiente.
    const isPaying = service.historial_pagos[monthIndex].registro_pagos_personas[personaId] === false;

    let targetMonth = service.historial_pagos[monthIndex];

    if (isPaying) {
      const pendingMonths = [...service.historial_pagos]
        .filter(h => h.registro_pagos_personas[personaId] === false)
        .sort((a, b) => compareMesAnioAsc(a.mes_anio, b.mes_anio));

      if (pendingMonths.length > 0) {
        targetMonth = pendingMonths[0];
      }
    }

    const prevStatus = targetMonth.registro_pagos_personas[personaId];
    targetMonth.registro_pagos_personas[personaId] = !prevStatus;

    if (!targetMonth.montos_pagados) targetMonth.montos_pagados = {};

    if (targetMonth.registro_pagos_personas[personaId]) {
      targetMonth.montos_pagados[personaId] = montoManual ?? (targetMonth.cuotas_momento?.[personaId] || 0);
    } else {
      targetMonth.montos_pagados[personaId] = 0;
    }

    const recaudado = Object.values(targetMonth.montos_pagados).reduce((sum, val) => sum + val, 0);
    targetMonth.balance_servicio = recaudado - targetMonth.costo_servicio_momento;

    return clone(service);
  },

  async registerServicePaymentToBank(subscriptionId: string, montoReal: number, monthIndex: number = 0, fechaPago?: Date, cuentaId?: string): Promise<Subscription> {
    await networkDelay(600);
    const index = mockDatabase.subscriptions.findIndex(s => s.id === subscriptionId);
    if (index === -1) throw new Error("Servicio no encontrado");
    
    const service = mockDatabase.subscriptions[index];
    if (service.historial_pagos && service.historial_pagos[monthIndex]) {
      service.historial_pagos[monthIndex].fecha_real_pago = fechaPago || new Date();
      service.historial_pagos[monthIndex].monto_pagado_banco = montoReal;
      if (cuentaId) {
        service.historial_pagos[monthIndex].id_cuenta_pago_real = cuentaId;
      }
    }
    return clone(service);
  },

  async undoServicePaymentToBank(subscriptionId: string, monthIndex: number): Promise<Subscription> {
    await networkDelay(600);
    const index = mockDatabase.subscriptions.findIndex(s => s.id === subscriptionId);
    if (index === -1) throw new Error("Servicio no encontrado");
    
    const service = mockDatabase.subscriptions[index];
    if (service.historial_pagos && service.historial_pagos[monthIndex]) {
      service.historial_pagos[monthIndex].fecha_real_pago = null;
      service.historial_pagos[monthIndex].id_cuenta_pago_real = undefined;
    }
    return clone(service);
  },

  async registerAdvancePayment(serviceId: string, subscriberId: string, months: number): Promise<Subscription> {
    await networkDelay(600);
    const subIndex = mockDatabase.subscriptions.findIndex(s => s.id === serviceId);
    if (subIndex === -1) throw new Error("Subscription not found");

    const updated = applyFIFOPayment(mockDatabase.subscriptions[subIndex], subscriberId, months);
    mockDatabase.subscriptions[subIndex] = updated;

    return clone(updated);
  }
};
