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
  async getContacts(): Promise<Contact[]> { 
    await networkDelay(300); 
    const contacts = clone(mockDatabase.contacts);
    
    // Calcular deuda y servicios para cada contacto
    contacts.forEach(contact => {
      let debt = 0;
      let servicesCount = 0;
      
      mockDatabase.subscriptions.forEach(sub => {
        // Contar servicios activos
        if (sub.suscriptores?.some(s => s.nombre === contact.nombre)) {
          servicesCount++;
        }

        // Calcular deuda
        sub.historial_pagos?.forEach(hist => {
          if (hist.registro_pagos_personas[contact.nombre] === false) {
            const cuota = hist.cuotas_momento?.[contact.nombre] || 0;
            const pagado = hist.montos_pagados?.[contact.nombre] || 0;
            debt += (cuota - pagado);
          }
        });
      });
      
      contact.total_deuda = debt;
      contact.total_servicios = servicesCount;
    });
    
    return contacts;
  },
  async getLoans(): Promise<Loan[]> { await networkDelay(300); return clone(mockDatabase.loans); },
  async getTransactions(): Promise<Transaction[]> { await networkDelay(400); return clone(mockDatabase.transactions); },
  async getSubscriptions(): Promise<Subscription[]> { await networkDelay(500); return clone(mockDatabase.subscriptions); },

  async addSubscriberToService(serviceId: string, subData: { nombre: string; cuota: number; color: string }): Promise<boolean> {
    await networkDelay(500);
    const sub = mockDatabase.subscriptions.find(s => s.id === serviceId);
    if (!sub) return false;

    if (!sub.suscriptores) sub.suscriptores = [];
    
    // Verificar si ya existe
    if (sub.suscriptores.some(s => s.nombre === subData.nombre)) return false;

    sub.suscriptores.push({
      nombre: subData.nombre,
      cuota: subData.cuota,
      es_cortesia: subData.cuota === 0,
      pagado_hasta: new Date(),
      fecha_inicio: new Date()
    });

    // Actualizar historial del mes actual (primer elemento por convención en el mock)
    if (sub.historial_pagos && sub.historial_pagos.length > 0) {
      const currentMonth = sub.historial_pagos[0];
      if (currentMonth.registro_pagos_personas[subData.nombre] === undefined) {
        currentMonth.registro_pagos_personas[subData.nombre] = subData.cuota === 0;
        
        // Inicializar si no existen
        if (!currentMonth.cuotas_momento) currentMonth.cuotas_momento = {};
        if (!currentMonth.montos_pagados) currentMonth.montos_pagados = {};
        
        currentMonth.cuotas_momento[subData.nombre] = subData.cuota;
        currentMonth.montos_pagados[subData.nombre] = 0;
      }
    }

    return true;
  },
  async getUserProfile(): Promise<User> { await networkDelay(200); return clone(mockDatabase.users[0]); },
  
  // CONTACTOS CRUD
  async createContact(contact: Omit<Contact, "id">): Promise<Contact> {
    await networkDelay(400);
    // Asegurar ID único
    const id = `cont_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newContact: Contact = {
      ...contact,
      id
    };
    mockDatabase.contacts.push(newContact);
    return clone(newContact);
  },

  async updateContact(id: string, data: Partial<Contact>): Promise<Contact> {
    await networkDelay(400);
    const index = mockDatabase.contacts.findIndex(c => c.id === id);
    if (index === -1) throw new Error("Contacto no encontrado");
    
    const oldName = mockDatabase.contacts[index].nombre;
    const newName = data.nombre || oldName;
    const newColor = data.color || mockDatabase.contacts[index].color;
    
    // Actualizar contacto en la lista
    mockDatabase.contacts[index] = { ...mockDatabase.contacts[index], ...data };
    
    // CASPUCADE: Actualizar suscripciones y participantes
    mockDatabase.subscriptions.forEach(sub => {
      // 1. Actualizar datos en el perfil del suscriptor
      if (sub.suscriptores) {
        sub.suscriptores.forEach(s => {
          if (s.nombre === oldName) {
            s.nombre = newName;
            if (data.color) s.color = data.color;
          }
        });
      }
      
      // 2. Actualizar llaves en el historial de pagos
      if (sub.historial_pagos && oldName !== newName) {
        sub.historial_pagos.forEach(hist => {
          // Registro de pagos
          if (hist.registro_pagos_personas[oldName] !== undefined) {
            hist.registro_pagos_personas[newName] = hist.registro_pagos_personas[oldName];
            delete hist.registro_pagos_personas[oldName];
          }
          
          // Cuotas momento
          if (hist.cuotas_momento?.[oldName] !== undefined) {
            hist.cuotas_momento[newName] = hist.cuotas_momento[oldName];
            delete hist.cuotas_momento[oldName];
          }
          
          // Montos pagados
          if (hist.montos_pagados?.[oldName] !== undefined) {
            hist.montos_pagados[newName] = hist.montos_pagados[oldName];
            delete hist.montos_pagados[oldName];
          }
        });
      }
    });
    
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

    // 1. Verificar deuda
    let totalDebt = 0;
    mockDatabase.subscriptions.forEach(sub => {
      sub.historial_pagos?.forEach(hist => {
        if (hist.registro_pagos_personas[contactName] === false) {
          const cuota = hist.cuotas_momento?.[contactName] || 0;
          const pagado = hist.montos_pagados?.[contactName] || 0;
          totalDebt += (cuota - pagado);
        }
      });
    });

    if (totalDebt > 0) {
      return { 
        canDelete: false, 
        reason: `Este contacto tiene una deuda pendiente de S/ ${totalDebt.toFixed(2)}.` 
      };
    }

    // 2. Verificar participación activa
    const activeServices = mockDatabase.subscriptions.filter(sub => 
      sub.suscriptores?.some(s => s.nombre === contactName)
    );

    if (activeServices.length > 0) {
      const names = activeServices.map(s => s.nombre).join(", ");
      return { 
        canDelete: false, 
        reason: `Este contacto participa en servicios activos: ${names}. Debes quitarlo de esos servicios primero.` 
      };
    }

    return { canDelete: true };
  },

  // Eliminar suscriptores que no existen en la lista de contactos
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
  },

  async getContactSummary(contactName: string): Promise<{
    totalDebt: number;
    services: {
      serviceId: string;
      serviceName: string;
      icon: string;
      color: string;
      debt: number;
      monthsDelay: number;
      monthsAdvance: number;
      history: {
        mes_anio: string;
        cuota: number;
        pagado: number;
        status: "pending" | "paid" | "overdue";
      }[];
    }[];
  }> {
    await networkDelay(600);
    const result = {
      totalDebt: 0,
      services: [] as any[]
    };

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    mockDatabase.subscriptions.forEach(sub => {
      // Verificar si el contacto es suscriptor actual o histórico
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
            
            // Parsear mes/año para lógica de tiempo
            const [mesStr, anioStr] = hist.mes_anio.split(" ");
            const mesesMap: Record<string, number> = {
              "Enero": 0, "Febrero": 1, "Marzo": 2, "Abril": 3, "Mayo": 4, "Junio": 5,
              "Julio": 6, "Agosto": 7, "Septiembre": 8, "Octubre": 9, "Noviembre": 10, "Diciembre": 11
            };
            const histDate = new Date(parseInt(anioStr), mesesMap[mesStr] || 0, 1);
            
            let status: "pending" | "paid" | "overdue" = isPaid ? "paid" : "pending";
            
            if (!isPaid) {
              const payDay = sub.dia_cobro || 1;
              const limitDate = new Date(histDate.getFullYear(), histDate.getMonth(), payDay);
              if (now > limitDate) {
                status = "overdue";
                serviceSummary.monthsDelay++;
                serviceSummary.debt += (cuota - pagado);
              } else {
                serviceSummary.debt += (cuota - pagado);
              }
            } else if (histDate > currentMonthStart) {
              serviceSummary.monthsAdvance++;
            }

            serviceSummary.history.push({
              mes_anio: hist.mes_anio,
              cuota,
              pagado,
              status
            });
          }
        });

        if (serviceSummary.history.length > 0) {
          result.totalDebt += serviceSummary.debt;
          result.services.push(serviceSummary);
        }
      }
    });

    return result;
  },
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
    
    const oldStartDate = new Date(mockDatabase.subscriptions[index].fecha_inicio).getTime();
    const newStartDate = data.fecha_inicio ? new Date(data.fecha_inicio).getTime() : oldStartDate;
    const today = new Date();
    const mesesMap = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    // Generar historial si la fecha de inicio cambió
    if (!updatedService.historial_pagos) updatedService.historial_pagos = [];

    if (data.fecha_inicio && newStartDate !== oldStartDate) {
      const startDate = new Date(data.fecha_inicio);
      let currentCheck = new Date(today.getFullYear(), today.getMonth(), 1);
      const limitCheck = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      
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
            es_compartido_momento: updatedService.es_compartido,
            id_cuenta_pago_real: updatedService.id_cuenta_pago
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
    }

    // Sincronizar SIEMPRE el mes actual
    const currentMesAnio = `${mesesMap[today.getMonth()]} ${today.getFullYear()}`;
    const currentHistIndex = updatedService.historial_pagos.findIndex(h => h.mes_anio === currentMesAnio);

    if (currentHistIndex !== -1) {
      const currentHist = updatedService.historial_pagos[currentHistIndex];
      currentHist.es_compartido_momento = updatedService.es_compartido;
      currentHist.costo_servicio_momento = updatedService.costo_total_actual;
      
      if (!updatedService.es_compartido) {
        currentHist.registro_pagos_personas = {};
        currentHist.cuotas_momento = {};
        currentHist.montos_pagados = {};
        currentHist.balance_servicio = -currentHist.costo_servicio_momento;
      } else {
        const recaudado = Object.values(currentHist.montos_pagados || {}).reduce((a: number, b: any) => a + (Number(b) || 0), 0);
        currentHist.balance_servicio = recaudado - currentHist.costo_servicio_momento;

        if (Object.keys(currentHist.registro_pagos_personas).length === 0) {
          updatedService.suscriptores?.forEach(sub => {
            currentHist.registro_pagos_personas[sub.nombre] = false;
            if (currentHist.cuotas_momento) currentHist.cuotas_momento[sub.nombre] = sub.cuota;
            if (currentHist.montos_pagados) currentHist.montos_pagados[sub.nombre] = 0;
          });
        }
      }
    }

    updatedService.historial_pagos.sort((a, b) => {
      const [mA, yA] = a.mes_anio.split(" ");
      const [mB, yB] = b.mes_anio.split(" ");
      const dateA = new Date(parseInt(yA), mesesMap.indexOf(mA), 1);
      const dateB = new Date(parseInt(mB), mesesMap.indexOf(mB), 1);
      return dateB.getTime() - dateA.getTime();
    });

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

  async registerServicePaymentToBank(subscriptionId: string, montoReal: number, monthIndex: number = 0, fechaPago?: Date, cuentaId?: string): Promise<Subscription> {
    await networkDelay(600);
    const index = mockDatabase.subscriptions.findIndex(s => s.id === subscriptionId);
    if (index === -1) throw new Error("Servicio no encontrado");
    
    const service = mockDatabase.subscriptions[index];
    if (service.historial_pagos && service.historial_pagos[monthIndex]) {
      service.historial_pagos[monthIndex].fecha_real_pago = fechaPago || new Date();
      service.historial_pagos[monthIndex].costo_servicio_momento = montoReal;
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

  async addOrUpdateSubscriber(subscriptionId: string, subscriber: Subscriber, editingIndex: number | null): Promise<Subscription> {
    await networkDelay(500);
    const index = mockDatabase.subscriptions.findIndex(s => s.id === subscriptionId);
    if (index === -1) throw new Error("Servicio no encontrado");
    
    const service = mockDatabase.subscriptions[index];
    if (!service.suscriptores) service.suscriptores = [];

    let oldName: string | null = null;
    if (editingIndex !== null && editingIndex >= 0) {
      oldName = service.suscriptores[editingIndex].nombre;
      service.suscriptores[editingIndex] = subscriber;
    } else {
      // Nuevo suscriptor
      if (!subscriber.fecha_inicio) subscriber.fecha_inicio = new Date();
      service.suscriptores.push(subscriber);
    }

    const newName = subscriber.nombre;

    // Sincronizar el historial
    if (service.historial_pagos) {
      const startDate = new Date(subscriber.fecha_inicio);
      const limitDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const mesesMap = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
      const currentMesAnio = `${mesesMap[now.getMonth()]} ${now.getFullYear()}`;

      service.historial_pagos.forEach(hist => {
        // Manejar cambio de nombre en el historial si es edición
        if (oldName && oldName !== newName) {
          if (hist.registro_pagos_personas[oldName] !== undefined) {
            hist.registro_pagos_personas[newName] = hist.registro_pagos_personas[oldName];
            delete hist.registro_pagos_personas[oldName];
          }
          if (hist.cuotas_momento && hist.cuotas_momento[oldName] !== undefined) {
            hist.cuotas_momento[newName] = hist.cuotas_momento[oldName];
            delete hist.cuotas_momento[oldName];
          }
          if (hist.montos_pagados && hist.montos_pagados[oldName] !== undefined) {
            hist.montos_pagados[newName] = hist.montos_pagados[oldName];
            delete hist.montos_pagados[oldName];
          }
        }

        // Lógica de Sincronización
        const parts = hist.mes_anio.split(" ");
        if (parts.length < 2) return;
        
        const mesStr = parts[0].trim();
        const anioStr = parts[1].trim();
        const histMonth = mesesMap.indexOf(mesStr);
        if (histMonth === -1) return;
        
        const histDate = new Date(parseInt(anioStr), histMonth, 1);

        // CASO 1: Es el mes actual (Por nombre para evitar fallos de Date) o un mes futuro
        if (hist.mes_anio === currentMesAnio || histDate > currentMonthStart) {
          if (hist.registro_pagos_personas[newName] === undefined) {
            hist.registro_pagos_personas[newName] = subscriber.es_cortesia;
            if (!hist.cuotas_momento) hist.cuotas_momento = {};
            if (!hist.montos_pagados) hist.montos_pagados = {};
            hist.cuotas_momento[newName] = subscriber.cuota;
            hist.montos_pagados[newName] = 0;
          } else {
            // Actualizamos la cuota para el mes actual/futuro
            if (!hist.cuotas_momento) hist.cuotas_momento = {};
            hist.cuotas_momento[newName] = subscriber.cuota;
            
            // Si antes era cortesía (pagado=true) y ahora no, o viceversa, actualizamos el estado
            if (!hist.montos_pagados?.[newName] || hist.montos_pagados?.[newName] === 0) {
              hist.registro_pagos_personas[newName] = subscriber.es_cortesia;
            }
          }
        } 
        // CASO 2: Es un mes pasado
        else if (histDate < currentMonthStart) {
          if (histDate >= limitDate) {
            if (hist.registro_pagos_personas[newName] === undefined) {
              hist.registro_pagos_personas[newName] = false;
              if (!hist.cuotas_momento) hist.cuotas_momento = {};
              if (!hist.montos_pagados) hist.montos_pagados = {};
              hist.cuotas_momento[newName] = subscriber.cuota;
              hist.montos_pagados[newName] = 0;
            }
          } else {
            // El suscriptor no debería existir en este mes (antes de su fecha de inicio)
            delete hist.registro_pagos_personas[newName];
            if (hist.cuotas_momento) delete hist.cuotas_momento[newName];
            if (hist.montos_pagados) delete hist.montos_pagados[newName];
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
        // Si el servicio completo para este mes aún no se marca como pagado al banco,
        // lo eliminamos para que deje de aparecer en el control de pagos.
        if (!hist.fecha_real_pago) {
            delete hist.registro_pagos_personas[subscriberName];
            if (hist.cuotas_momento) delete hist.cuotas_momento[subscriberName];
            if (hist.montos_pagados) delete hist.montos_pagados[subscriberName];
        }
      });
    }

    return clone(service);
  }
};
