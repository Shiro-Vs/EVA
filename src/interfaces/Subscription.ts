export type SubscriptionFrequency = "mensual" | "anual";

export interface Subscriber {
  id: string; // Vincula con Contact.id — es la llave real en los diccionarios de PaymentHistory de abajo
  nombre: string;
  cuota: number;
  es_cortesia: boolean;
  pagado_hasta: Date | any;
  fecha_inicio: Date | any;
  color?: string;
}

export interface PaymentHistory {
  mes_anio: string;
  costo_servicio_momento: number;
  fecha_limite_esperada: Date | any;
  fecha_real_pago: Date | any;
  dias_atraso: number;
  balance_servicio: number;
  // Llaveados por Subscriber.id (antes por nombre — un contacto renombrado o
  // dos contactos homónimos corrompían estos registros en silencio).
  registro_pagos_personas: Record<string, boolean>;
  cuotas_momento?: Record<string, number>; // Nuevo: Captura los precios en este mes específico
  montos_pagados?: Record<string, number>; // Nuevo: El dinero real que entregó la persona
  es_compartido_momento?: boolean; // Nuevo: Para saber si en ese mes era compartido
  frecuencia_momento?: SubscriptionFrequency; // Nuevo: Para saber si el pago fue mensual o anual
  id_cuenta_pago_real?: string; // Nuevo: La cuenta exacta con la que se pagó ese mes
  monto_pagado_banco?: number; // Nuevo: El monto real que se pagó al banco (puede variar del costo del servicio)
}

export interface Subscription {
  id: string;
  nombre: string;
  costo_total_actual: number;
  dia_cobro: number;
  frecuencia: SubscriptionFrequency;
  es_compartido: boolean;
  id_cuenta_pago: string;
  fecha_inicio: Date | any;
  color?: string;
  icon?: string;
  // Sub-colecciones manejadas como tipos para conveniencia en el frontend
  suscriptores?: Subscriber[];
  historial_pagos?: PaymentHistory[];
}
