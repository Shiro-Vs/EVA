import { User } from "../../interfaces/User";
import { Account } from "../../interfaces/Account";
import { Category } from "../../interfaces/Category";
import { Goal } from "../../interfaces/Goal";
import { Contact } from "../../interfaces/Contact";
import { Loan } from "../../interfaces/Loan";
import { Transaction } from "../../interfaces/Transaction";
import { Subscription } from "../../interfaces/Subscription";

export interface MockDBState {
  users: User[];
  accounts: Account[];
  categories: Category[];
  goals: Goal[];
  contacts: Contact[];
  loans: Loan[];
  transactions: Transaction[];
  subscriptions: Subscription[];
}

export let mockDatabase: MockDBState = {
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
  ],
  contacts: [
    { id: "cont_maria", nombre: "Maria", color: "#EC4899" },
    { id: "cont_pedro", nombre: "Pedro", color: "#10B981" },
    { id: "cont_juan", nombre: "Juan", color: "#F59E0B" },
    { id: "cont_ana", nombre: "Ana", color: "#8B5CF6" },
    { id: "cont_carlos", nombre: "Carlos", color: "#3B82F6" },
    { id: "cont_sofia", nombre: "Sofia", color: "#14B8A6" },
    { id: "cont_luis", nombre: "Luis", color: "#F43F5E" },
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
    { id: "trx_3", monto_total: 45.9, tipo: "egreso", descripcion: "Pago Netflix", fecha: new Date("2026-03-12"), id_cuenta: "cta_bbva_1", tiene_desglose: false },
    { id: "trx_4", monto_total: 32.9, tipo: "egreso", descripcion: "Pago Spotify", fecha: new Date("2026-04-05"), id_cuenta: "cta_yape_1", tiene_desglose: false },
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
      fecha_inicio: new Date(2026, 0, 1),
      icon: "play",
      color: "#E50914",
      suscriptores: [
        { nombre: "Maria", cuota: 15.3, es_cortesia: false, pagado_hasta: null, fecha_inicio: new Date(2026, 0, 1), color: "#EC4899" },
        { nombre: "Pedro", cuota: 15.3, es_cortesia: false, pagado_hasta: null, fecha_inicio: new Date(2026, 0, 1), color: "#10B981" },
        { nombre: "Ana", cuota: 15.3, es_cortesia: true, pagado_hasta: null, fecha_inicio: new Date(2026, 1, 15), color: "#8B5CF6" },
      ],
      historial_pagos: [
        {
          mes_anio: "Abril 2026",
          costo_servicio_momento: 45.9,
          fecha_limite_esperada: new Date(2026, 3, 12),
          fecha_real_pago: null,
          dias_atraso: 0,
          balance_servicio: -45.9,
          registro_pagos_personas: { Maria: false, Pedro: false, Ana: true },
          cuotas_momento: { Maria: 15.3, Pedro: 15.3, Ana: 0 },
          montos_pagados: { Maria: 0, Pedro: 0, Ana: 0 }
        },
        {
          mes_anio: "Marzo 2026",
          costo_servicio_momento: 45.9,
          fecha_limite_esperada: new Date(2026, 2, 12),
          fecha_real_pago: new Date(2026, 2, 12),
          dias_atraso: 0,
          balance_servicio: -30.6,
          registro_pagos_personas: { Maria: false, Pedro: true, Ana: true },
          cuotas_momento: { Maria: 15.3, Pedro: 15.3, Ana: 0 },
          montos_pagados: { Maria: 0, Pedro: 15.3, Ana: 0 }
        },
        {
          mes_anio: "Febrero 2026",
          costo_servicio_momento: 45.9,
          fecha_limite_esperada: new Date(2026, 1, 12),
          fecha_real_pago: new Date(2026, 1, 14),
          dias_atraso: 2,
          balance_servicio: 0,
          registro_pagos_personas: { Maria: true, Pedro: true, Ana: true },
          cuotas_momento: { Maria: 15.3, Pedro: 15.3, Ana: 0 },
          montos_pagados: { Maria: 15.3, Pedro: 15.3, Ana: 0 }
        },
        {
          mes_anio: "Enero 2026",
          costo_servicio_momento: 45.9,
          fecha_limite_esperada: new Date(2026, 0, 12),
          fecha_real_pago: new Date(2026, 0, 12),
          dias_atraso: 0,
          balance_servicio: 0,
          registro_pagos_personas: { Maria: true, Pedro: true },
          cuotas_momento: { Maria: 22.95, Pedro: 22.95 },
          montos_pagados: { Maria: 22.95, Pedro: 22.95 }
        }
      ],
    },
    {
      id: "srv_spotify_1",
      nombre: "Spotify Familiar",
      costo_total_actual: 32.9,
      dia_cobro: 5,
      frecuencia: "mensual",
      es_compartido: true,
      id_cuenta_pago: "cta_yape_1",
      fecha_inicio: new Date(2026, 1, 1),
      icon: "musical-notes",
      color: "#1DB954",
      suscriptores: [
        { nombre: "Carlos", cuota: 10.0, es_cortesia: false, pagado_hasta: null, fecha_inicio: new Date(2026, 1, 1), color: "#3B82F6" },
        { nombre: "Sofia", cuota: 10.0, es_cortesia: false, pagado_hasta: null, fecha_inicio: new Date(2026, 1, 1), color: "#14B8A6" },
        { nombre: "Juan", cuota: 0, es_cortesia: true, pagado_hasta: null, fecha_inicio: new Date(2026, 1, 1), color: "#F59E0B" },
      ],
      historial_pagos: [
        {
          mes_anio: "Abril 2026",
          costo_servicio_momento: 32.9,
          fecha_limite_esperada: new Date(2026, 3, 5),
          fecha_real_pago: null,
          dias_atraso: 0,
          balance_servicio: -12.9,
          registro_pagos_personas: { Carlos: true, Sofia: true, Juan: true },
          cuotas_momento: { Carlos: 10, Sofia: 10, Juan: 0 },
          montos_pagados: { Carlos: 10, Sofia: 10, Juan: 0 }
        }
      ]
    },
    {
      id: "srv_disney_1",
      nombre: "Disney+",
      costo_total_actual: 27.9,
      dia_cobro: 20,
      frecuencia: "mensual",
      es_compartido: true,
      id_cuenta_pago: "cta_bbva_1",
      fecha_inicio: new Date(2026, 2, 1),
      icon: "star",
      color: "#006E99",
      suscriptores: [
        { nombre: "Luis", cuota: 14.0, es_cortesia: false, pagado_hasta: null, fecha_inicio: new Date(2026, 2, 1), color: "#F43F5E" },
      ],
      historial_pagos: [
        {
          mes_anio: "Marzo 2026",
          costo_servicio_momento: 27.9,
          fecha_limite_esperada: new Date(2026, 2, 20),
          fecha_real_pago: new Date(2026, 2, 20),
          dias_atraso: 0,
          balance_servicio: -13.9,
          registro_pagos_personas: { Luis: true },
          cuotas_momento: { Luis: 14.0 },
          montos_pagados: { Luis: 14.0 }
        }
      ]
    }
  ]
};
