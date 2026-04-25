export type SubscriptionFrequency = "mensual" | "anual";

export interface Subscriber {
  nombre: string;
  cuota: number;
  es_cortesia: boolean;
  pagado_hasta: Date | any;
}

export interface PaymentHistory {
  mes_anio: string;
  costo_servicio_momento: number;
  fecha_limite_esperada: Date | any;
  fecha_real_pago: Date | any;
  dias_atraso: number;
  balance_servicio: number;
  registro_pagos_personas: Record<string, boolean>;
}

export interface Subscription {
  id: string;
  nombre: string;
  costo_total_actual: number;
  dia_cobro: number;
  frecuencia: SubscriptionFrequency;
  es_compartido: boolean;
  id_cuenta_pago: string;
  // Sub-colecciones manejadas como tipos para conveniencia en el frontend
  suscriptores?: Subscriber[];
  historial_pagos?: PaymentHistory[];
}
