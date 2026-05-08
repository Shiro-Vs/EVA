import { Transaction } from "../interfaces/Transaction";
import { Subscription } from "../interfaces/Subscription";
import { Category } from "../interfaces/Category";
import { mockDatabase } from "../data/mock/mockData";
import { generarResumenContacto } from "../logic/financeLogic";
import { applyFIFOPayment } from "../logic/subscriptionLogic";

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

  async getContactSummary(contactName: string) {
    await networkDelay(600);
    return generarResumenContacto(mockDatabase.subscriptions, contactName);
  },

  async togglePaymentStatus(subscriptionId: string, monthIndex: number, personaNombre: string, montoManual?: number): Promise<Subscription> {
    await networkDelay(400); 
    const index = mockDatabase.subscriptions.findIndex(s => s.id === subscriptionId);
    if (index === -1) throw new Error("Servicio no encontrado");
    
    const service = mockDatabase.subscriptions[index];
    if (!service.historial_pagos || !service.historial_pagos[monthIndex]) throw new Error("Historial no encontrado");

    // Lógica FIFO: Si vamos a PAGAR (es decir, actualmente está pendiente en el mes clickeado),
    // buscamos el mes más antiguo pendiente.
    const isPaying = service.historial_pagos[monthIndex].registro_pagos_personas[personaNombre] === false;
    
    let targetMonth = service.historial_pagos[monthIndex];

    if (isPaying) {
      // Import compareMesAnioAsc if not imported. Wait, I should implement local ascending sort
      const mesesMap: Record<string, number> = {
        Enero: 0, Febrero: 1, Marzo: 2, Abril: 3, Mayo: 4, Junio: 5,
        Julio: 6, Agosto: 7, Septiembre: 8, Octubre: 9, Noviembre: 10, Diciembre: 11,
      };
      const pendingMonths = [...service.historial_pagos]
        .filter(h => h.registro_pagos_personas[personaNombre] === false)
        .sort((a, b) => {
          const [mA, yA] = a.mes_anio.split(" ");
          const [mB, yB] = b.mes_anio.split(" ");
          return new Date(parseInt(yA), mesesMap[mA], 1).getTime() - new Date(parseInt(yB), mesesMap[mB], 1).getTime();
        });
      
      if (pendingMonths.length > 0) {
        targetMonth = pendingMonths[0];
      }
    }

    const prevStatus = targetMonth.registro_pagos_personas[personaNombre];
    targetMonth.registro_pagos_personas[personaNombre] = !prevStatus;

    if (!targetMonth.montos_pagados) targetMonth.montos_pagados = {};

    if (targetMonth.registro_pagos_personas[personaNombre]) {
      targetMonth.montos_pagados[personaNombre] = montoManual ?? (targetMonth.cuotas_momento?.[personaNombre] || 0);
    } else {
      targetMonth.montos_pagados[personaNombre] = 0;
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

  async registerAdvancePayment(serviceId: string, subscriberName: string, months: number): Promise<Subscription> {
    await networkDelay(600);
    const subIndex = mockDatabase.subscriptions.findIndex(s => s.id === serviceId);
    if (subIndex === -1) throw new Error("Subscription not found");
    
    const service = mockDatabase.subscriptions[subIndex];
    applyFIFOPayment(service, subscriberName, months);
    
    return clone(service);
  }
};
