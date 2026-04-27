export type SubscriptionFrequency = "mensual" | "anual";

export interface Subscriber {
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
  registro_pagos_personas: Record<string, boolean>;
  cuotas_momento?: Record<string, number>; // Nuevo: Captura los precios en este mes específico
  montos_pagados?: Record<string, number>; // Nuevo: El dinero real que entregó la persona
  es_compartido_momento?: boolean; // Nuevo: Para saber si en ese mes era compartido
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
