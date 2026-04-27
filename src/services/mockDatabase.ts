import { User } from "../interfaces/User";
import { Account } from "../interfaces/Account";
import { Category } from "../interfaces/Category";
import { Goal } from "../interfaces/Goal";
import { Contact } from "../interfaces/Contact";
import { Loan } from "../interfaces/Loan";
import { Transaction } from "../interfaces/Transaction";
import { Subscription, Subscriber, PaymentHistory } from "../interfaces/Subscription";

// ==========================================
// MOCK DATABASE GLOBAL (Simulación de Firebase)
// ==========================================

interface MockDBState {
  users: User[];
  accounts: Account[];
  categories: Category[];
  goals: Goal[];
  contacts: Contact[];
  loans: Loan[];
  transactions: Transaction[];
  subscriptions: Subscription[];
}

// Datos Semilla (Seed Data)
let mockDatabase: MockDBState = {
  users: [
    {
      uid: "user_123",
      correo: "usuario@eva.app",
      nombre_pantalla: "Roberto",
      moneda_principal: "PEN",
      preferencias_ia: { auto_categorizar: true, asistente_voz: false },
      fecha_creacion: new Date("2026-01-01"),
    }
  ],
  accounts: [
    {
      id: "cta_bbva_1",
      nombre: "BBVA Débito",
      tipo: "debito",
      saldo_actual: 2500.50,
      es_billetera_digital: false,
      color: "#1F7ECC",
      icono: "card-outline",
      es_predeterminada: true,
      excluir_del_total: false,
    },
    {
      id: "cta_bcp_1",
      nombre: "BCP Crédito",
      tipo: "credito",
      saldo_actual: -450.00,
      es_billetera_digital: false,
      limite_credito: 5000,
      dia_corte: 15,
      dia_pago: 5,
      color: "#FF7F00",
      icono: "card",
      es_predeterminada: false,
      excluir_del_total: false,
    },
    {
      id: "cta_yape_1",
      nombre: "Yape",
      tipo: "billetera_digital",
      saldo_actual: 320.00,
      es_billetera_digital: true,
      color: "#742284",
      icono: "phone-portrait-outline",
      es_predeterminada: false,
      excluir_del_total: false,
    },
    {
      id: "cta_cash_1",
      nombre: "Efectivo",
      tipo: "debito",
      saldo_actual: 150.00,
      es_billetera_digital: false,
      color: "#10B981",
      icono: "cash-outline",
      es_predeterminada: false,
      excluir_del_total: false,
    }
  ],
  categories: [
    { id: "cat_food", nombre: "Alimentación", icono: "restaurant", color: "#F59E0B", presupuesto_mensual: 800, creada_por_ia: false },
    { id: "cat_transport", nombre: "Transporte", icono: "bus", color: "#3B82F6", presupuesto_mensual: 200, creada_por_ia: false },
    { id: "cat_entertainment", nombre: "Ocio", icono: "game-controller", color: "#8B5CF6", presupuesto_mensual: 300, creada_por_ia: false },
    { id: "cat_utilities", nombre: "Servicios", icono: "home", color: "#10B981", presupuesto_mensual: 400, creada_por_ia: false },
    { id: "cat_salary", nombre: "Sueldo", icono: "briefcase", color: "#10B981", presupuesto_mensual: 0, creada_por_ia: false },
  ],
  goals: [
    { id: "goal_trip", nombre: "Viaje a Cusco", monto_objetivo: 2000, monto_actual: 500, fecha_limite: new Date("2026-12-01"), prioridad: "alta" },
    { id: "goal_laptop", nombre: "Laptop Nueva", monto_objetivo: 4500, monto_actual: 1200, fecha_limite: new Date("2027-03-15"), prioridad: "media" },
  ],
  contacts: [
    { id: "cont_maria", nombre: "Maria", color: "#EC4899" },
    { id: "cont_pedro", nombre: "Pedro", color: "#10B981" },
    { id: "cont_juan", nombre: "Juan", color: "#F59E0B" },
  ],
  loans: [
    { 
      id: "loan_car", 
      entidad: "BCP Vehicular", 
      monto_total_prestado: 35000, 
      numero_cuotas_totales: 48, 
      tasa_interes: 12.5,
      cronograma: []
    }
  ],
  transactions: [
    { id: "trx_1", monto_total: 120, tipo: "egreso", descripcion: "Supermercado Wong", fecha: new Date(), id_cuenta: "cta_bbva_1", tiene_desglose: false },
    { id: "trx_2", monto_total: 3500, tipo: "ingreso", descripcion: "Sueldo Abril", fecha: new Date(), id_cuenta: "cta_bbva_1", tiene_desglose: false },
  ],
  subscriptions: [
    {
      id: "srv_netflix_1",
      nombre: "Netflix",
      costo_total_actual: 45.9,
      dia_cobro: 12,
      frecuencia: "mensual",
      es_compartido: true,
      id_cuenta_pago: "cta_bbva_1",
      fecha_inicio: new Date(2026, 0, 1), // Enero 2026
      icon: "play",
      color: "#E50914",
      suscriptores: [
        { nombre: "Maria", cuota: 22.95, es_cortesia: false, pagado_hasta: new Date(), fecha_inicio: new Date(2026, 0, 1) },
        { nombre: "Mamá", cuota: 22.95, es_cortesia: true, pagado_hasta: new Date(), fecha_inicio: new Date(2026, 0, 1) },
      ],
      historial_pagos: [
        {
          mes_anio: "Abril 2026",
          costo_servicio_momento: 45.9,
          fecha_limite_esperada: new Date(),
          fecha_real_pago: null,
          dias_atraso: 0,
          balance_servicio: -22.95,
          registro_pagos_personas: { Maria: false, Mamá: true },
          cuotas_momento: { Maria: 22.95, Mamá: 22.95 },
          montos_pagados: { Maria: 0, Mamá: 0 }
        },
        {
          mes_anio: "Marzo 2026",
          costo_servicio_momento: 45.9,
          fecha_limite_esperada: new Date(),
          fecha_real_pago: new Date(),
          dias_atraso: 2,
          balance_servicio: 0,
          registro_pagos_personas: { Maria: true, Mamá: true },
          cuotas_momento: { Maria: 22.95, Mamá: 22.95 },
          montos_pagados: { Maria: 22.95, Mamá: 0 }
        },
      ],
    }
  ]
};

// Utilidades
const networkDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper para clonar objetos y simular que devolvemos datos "desconectados" de la BD
// Para manejar fechas con JSON, interceptamos la clonación o re-hidratamos.
const clone = <T>(obj: T): T => {
  const json = JSON.stringify(obj);
  return JSON.parse(json, (key, value) => {
    // Re-hidratar fechas (simplificado)
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      return new Date(value);
    }
    return value;
  });
};

export const mockDB = {
  // -----------------------------------------------------
  // AUTENTICACIÓN (Auth simulada)
  // -----------------------------------------------------
  async login(email: string, password: string): Promise<User> {
    await networkDelay(1000); 
    
    if (!email) throw new Error("El correo es requerido");
    
    const normalizedEmail = email.trim().toLowerCase();
    const user = mockDatabase.users.find(u => u.correo.toLowerCase() === normalizedEmail);
    
    if (user) {
      return clone(user);
    } else {
      throw new Error("Usuario no encontrado (Verifica que sea usuario@eva.app)");
    }
  },

  async register(email: string, password: string, nombre: string): Promise<User> {
    await networkDelay(1200); // Simulando creación en Auth y documento en Firestore
    
    // Verificamos que no exista
    const exists = mockDatabase.users.some(u => u.correo === email.toLowerCase());
    if (exists) {
      throw new Error("El correo ya está en uso");
    }

    const newUser: User = {
      uid: `user_${Date.now()}`,
      correo: email.toLowerCase(),
      nombre_pantalla: nombre,
      moneda_principal: "PEN",
      preferencias_ia: { auto_categorizar: true, asistente_voz: false },
      fecha_creacion: new Date(),
    };
    
    // Agregamos al inicio (simulando que ahora es el usuario activo principal para getProfile)
    mockDatabase.users.unshift(newUser);
    return clone(newUser);
  },

  // -----------------------------------------------------
  // LECTURAS GENERALES (GETTERS)
  // -----------------------------------------------------
  async getAccounts(): Promise<Account[]> { await networkDelay(300); return clone(mockDatabase.accounts); },
  async getCategories(): Promise<Category[]> { await networkDelay(300); return clone(mockDatabase.categories); },
  async getGoals(): Promise<Goal[]> { await networkDelay(300); return clone(mockDatabase.goals); },
  async getContacts(): Promise<Contact[]> { await networkDelay(300); return clone(mockDatabase.contacts); },
  async getLoans(): Promise<Loan[]> { await networkDelay(300); return clone(mockDatabase.loans); },
  async getTransactions(): Promise<Transaction[]> { await networkDelay(400); return clone(mockDatabase.transactions); },
  async getSubscriptions(): Promise<Subscription[]> { await networkDelay(500); return clone(mockDatabase.subscriptions); },
  async getUserProfile(): Promise<User> { await networkDelay(200); return clone(mockDatabase.users[0]); },

  // -----------------------------------------------------
  // TRANSACCIONES (Ejemplo de actualización cruzada)
  // -----------------------------------------------------
  async createTransaction(transactionData: Omit<Transaction, "id">): Promise<Transaction> {
    await networkDelay(500);
    
    // Crear la transacción
    const newTx: Transaction = {
      ...transactionData,
      id: `trx_${Date.now()}`
    };
    mockDatabase.transactions.unshift(newTx);

    // Actualizar el saldo de la cuenta automáticamente (Trigger simulado)
    const accountIndex = mockDatabase.accounts.findIndex(a => a.id === newTx.id_cuenta);
    if (accountIndex !== -1) {
      if (newTx.tipo === "ingreso") {
        mockDatabase.accounts[accountIndex].saldo_actual += newTx.monto_total;
      } else if (newTx.tipo === "egreso") {
        mockDatabase.accounts[accountIndex].saldo_actual -= newTx.monto_total;
      }
    }

    return clone(newTx);
  },

  // -----------------------------------------------------
  // SUSCRIPCIONES (Lógica Compleja)
  // -----------------------------------------------------
  async getSubscriptionById(id: string): Promise<Subscription | null> {
    await networkDelay(300);
    const sub = mockDatabase.subscriptions.find(s => s.id === id);
    return sub ? clone(sub) : null;
  },

  async updateSubscription(id: string, data: Partial<Subscription>): Promise<Subscription> {
    await networkDelay(500);
    const index = mockDatabase.subscriptions.findIndex(s => s.id === id);
    if (index === -1) throw new Error("Servicio no encontrado");
    
    // Actualizamos el objeto en la BD con los nuevos datos
    mockDatabase.subscriptions[index] = { 
      ...mockDatabase.subscriptions[index], 
      ...data,
      dia_cobro: data.dia_cobro !== undefined ? parseInt(data.dia_cobro.toString()) : mockDatabase.subscriptions[index].dia_cobro
    };
    
    const updatedService = mockDatabase.subscriptions[index];
    
    // Generar historial si la fecha de inicio cambió o es nueva
    if (data.fecha_inicio) {
      const startDate = new Date(data.fecha_inicio);
      const today = new Date();
      
      if (!updatedService.historial_pagos) updatedService.historial_pagos = [];
      
      let currentCheck = new Date(today.getFullYear(), today.getMonth(), 1);
      const limitCheck = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      
      const mesesMap = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

      while (currentCheck >= limitCheck) {
        const mesAnio = `${mesesMap[currentCheck.getMonth()]} ${currentCheck.getFullYear()}`;
        
        const exists = updatedService.historial_pagos.some(h => h.mes_anio === mesAnio);
        if (!exists) {
          const newHistory: PaymentHistory = {
            mes_anio: mesAnio,
            costo_servicio_momento: updatedService.costo_total_actual,
            fecha_limite_esperada: new Date(currentCheck.getFullYear(), currentCheck.getMonth(), updatedService.dia_cobro),
            fecha_real_pago: null,
            dias_atraso: 0,
            balance_servicio: -updatedService.costo_total_actual,
            registro_pagos_personas: {},
            cuotas_momento: {},
            montos_pagados: {},
            es_compartido_momento: updatedService.es_compartido
          };
          
          if (updatedService.es_compartido) {
            updatedService.suscriptores?.forEach(sub => {
               newHistory.registro_pagos_personas[sub.nombre] = false;
               if (newHistory.cuotas_momento) newHistory.cuotas_momento[sub.nombre] = sub.cuota;
               if (newHistory.montos_pagados) newHistory.montos_pagados[sub.nombre] = 0;
            });
          }

          updatedService.historial_pagos.push(newHistory);
        }
        
        currentCheck.setMonth(currentCheck.getMonth() - 1);
      }

      // Manejar el cambio de compartido/personal en meses existentes (especialmente el actual)
      const currentMesAnio = `${mesesMap[today.getMonth()]} ${today.getFullYear()}`;
      const currentHistIndex = updatedService.historial_pagos.findIndex(h => h.mes_anio === currentMesAnio);

      if (currentHistIndex !== -1) {
        const currentHist = updatedService.historial_pagos[currentHistIndex];
        currentHist.es_compartido_momento = updatedService.es_compartido;
        
        if (!updatedService.es_compartido) {
          // Si pasó a personal, limpiamos el mes actual
          currentHist.registro_pagos_personas = {};
          currentHist.cuotas_momento = {};
          currentHist.montos_pagados = {};
          currentHist.balance_servicio = -currentHist.costo_servicio_momento;
        } else if (Object.keys(currentHist.registro_pagos_personas).length === 0) {
          // Si volvió a compartido y estaba vacío, restauramos los suscriptores actuales
          updatedService.suscriptores?.forEach(sub => {
            currentHist.registro_pagos_personas[sub.nombre] = false;
            if (currentHist.cuotas_momento) currentHist.cuotas_momento[sub.nombre] = sub.cuota;
            if (currentHist.montos_pagados) currentHist.montos_pagados[sub.nombre] = 0;
          });
        }
      }

      updatedService.historial_pagos.sort((a, b) => {
        const [mA, yA] = a.mes_anio.split(" ");
        const [mB, yB] = b.mes_anio.split(" ");
        const dateA = new Date(parseInt(yA), mesesMap.indexOf(mA), 1);
        const dateB = new Date(parseInt(mB), mesesMap.indexOf(mB), 1);
        return dateB.getTime() - dateA.getTime();
      });
    }

    return clone(mockDatabase.subscriptions[index]);
  },

  async togglePaymentStatus(subscriptionId: string, monthIndex: number, personaNombre: string, montoManual?: number): Promise<Subscription> {
    await networkDelay(400); 
    const index = mockDatabase.subscriptions.findIndex(s => s.id === subscriptionId);
    if (index === -1) throw new Error("Servicio no encontrado");
    
    const service = mockDatabase.subscriptions[index];
    if (!service.historial_pagos || !service.historial_pagos[monthIndex]) throw new Error("Historial no encontrado");

    const currentMonth = service.historial_pagos[monthIndex];
    const prevStatus = currentMonth.registro_pagos_personas[personaNombre];
    currentMonth.registro_pagos_personas[personaNombre] = !prevStatus;

    if (!currentMonth.montos_pagados) currentMonth.montos_pagados = {};

    if (currentMonth.registro_pagos_personas[personaNombre]) {
      // Al marcar como pagado, usamos el monto manual si existe, sino la cuota sugerida
      if (montoManual !== undefined) {
        currentMonth.montos_pagados[personaNombre] = montoManual;
      } else {
        const suggested = currentMonth.cuotas_momento?.[personaNombre] || 
                        service.suscriptores?.find(s => s.nombre === personaNombre)?.cuota || 0;
        currentMonth.montos_pagados[personaNombre] = suggested;
      }
    } else {
      // Al desmarcar, el monto pagado vuelve a 0
      currentMonth.montos_pagados[personaNombre] = 0;
    }

    // Recalcular balance usando el dinero REAL recibido (montos_pagados)
    const recaudado = Object.values(currentMonth.montos_pagados).reduce((sum, val) => sum + val, 0);

    currentMonth.balance_servicio = recaudado - currentMonth.costo_servicio_momento;
    return clone(service);
  },

  async registerServicePaymentToBank(subscriptionId: string, montoReal: number, monthIndex: number = 0, fechaPago?: Date): Promise<Subscription> {
    await networkDelay(600);
    const index = mockDatabase.subscriptions.findIndex(s => s.id === subscriptionId);
    if (index === -1) throw new Error("Servicio no encontrado");
    
    const service = mockDatabase.subscriptions[index];
    if (service.historial_pagos && service.historial_pagos[monthIndex]) {
      service.historial_pagos[monthIndex].fecha_real_pago = fechaPago || new Date();
      service.historial_pagos[monthIndex].costo_servicio_momento = montoReal;
    }
    return clone(service);
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
      // Nuevo suscriptor
      if (!subscriber.fecha_inicio) subscriber.fecha_inicio = new Date();
      service.suscriptores.push(subscriber);
    }

    // Sincronizar el historial basado en la fecha_inicio y actualizar cuotas si es necesario
    if (service.historial_pagos) {
      const startDate = new Date(subscriber.fecha_inicio);
      const limitDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      service.historial_pagos.forEach(hist => {
        const parts = hist.mes_anio.split(" ");
        if (parts.length < 2) return;
        
        const mesStr = parts[0].trim();
        const anioStr = parts[1].trim();

        const mesesMap: Record<string, number> = {
          "Enero": 0, "Febrero": 1, "Marzo": 2, "Abril": 3, "Mayo": 4, "Junio": 5,
          "Julio": 6, "Agosto": 7, "Septiembre": 8, "Octubre": 9, "Noviembre": 10, "Diciembre": 11
        };
        
        const histMonth = mesesMap[mesStr];
        if (histMonth === undefined) return;
        
        const histDate = new Date(parseInt(anioStr), histMonth, 1);

        // Si es un mes futuro o el mes actual, actualizamos la cuota
        if (histDate >= currentMonthStart) {
          if (hist.registro_pagos_personas[subscriber.nombre] === undefined) {
            hist.registro_pagos_personas[subscriber.nombre] = false;
            if (hist.cuotas_momento) hist.cuotas_momento[subscriber.nombre] = subscriber.cuota;
            if (hist.montos_pagados) hist.montos_pagados[subscriber.nombre] = 0;
          } else {
            // Actualizamos la cuota para el mes actual/futuro
            if (hist.cuotas_momento) hist.cuotas_momento[subscriber.nombre] = subscriber.cuota;
          }
        } else {
          // Es un mes pasado: solo agregamos al suscriptor si no existía y su fecha de inicio lo permite
          if (histDate >= limitDate) {
            if (hist.registro_pagos_personas[subscriber.nombre] === undefined) {
              hist.registro_pagos_personas[subscriber.nombre] = false;
              if (hist.cuotas_momento) hist.cuotas_momento[subscriber.nombre] = subscriber.cuota;
              if (hist.montos_pagados) hist.montos_pagados[subscriber.nombre] = 0;
            }
          } else {
            // El suscriptor no debería existir en este mes (antes de su fecha de inicio)
            delete hist.registro_pagos_personas[subscriber.nombre];
            if (hist.cuotas_momento) delete hist.cuotas_momento[subscriber.nombre];
            if (hist.montos_pagados) delete hist.montos_pagados[subscriber.nombre];
          }
        }
      });
    }

    return clone(service);
  },

  async registerAdvancePayment(serviceId: string, subscriberName: string, months: number): Promise<Subscription> {
    await networkDelay(600);
    const subIndex = mockDatabase.subscriptions.findIndex(s => s.id === serviceId);
    if (subIndex === -1) throw new Error("Subscription not found");
    
    const service = mockDatabase.subscriptions[subIndex];
    const subscriber = service.suscriptores?.find(s => s.nombre === subscriberName);
    
    if (subscriber) {
      const currentPaidUntil = subscriber.pagado_hasta ? new Date(subscriber.pagado_hasta) : new Date();
      currentPaidUntil.setMonth(currentPaidUntil.getMonth() + months);
      subscriber.pagado_hasta = currentPaidUntil;

      if (service.historial_pagos) {
        for (let i = 0; i < Math.min(months, service.historial_pagos.length); i++) {
          const hist = service.historial_pagos[i];
          hist.registro_pagos_personas[subscriberName] = true;
          
          if (!hist.montos_pagados) hist.montos_pagados = {};
          const cuota = hist.cuotas_momento?.[subscriberName] || subscriber.cuota || 0;
          hist.montos_pagados[subscriberName] = cuota;
        }
      }
    }
    
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
    
    // Al quitar un usuario del servicio, queremos que deje de aparecer en los meses
    // que aún no se han pagado (futuro o mes actual pendiente).
    // Pero se mantendrá en los meses donde ya existe un registro histórico cerrado.
    if (service.historial_pagos) {
      service.historial_pagos.forEach(hist => {
        // Si el registro de la persona para este mes está marcado como NO pagado
        // y el servicio completo para este mes aún no se marca como pagado al banco,
        // lo eliminamos para que deje de ser una carga pendiente.
        if (!hist.fecha_real_pago && !hist.registro_pagos_personas[subscriberName]) {
            delete hist.registro_pagos_personas[subscriberName];
            if (hist.cuotas_momento) delete hist.cuotas_momento[subscriberName];
            if (hist.montos_pagados) delete hist.montos_pagados[subscriberName];
        }
      });
    }

    return clone(service);
  }
};
