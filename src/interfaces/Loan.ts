export type LoanPaymentStatus = "pagado" | "pendiente" | "vencido";

export interface LoanSchedule {
  numero_cuota: number;
  monto_cuota: number;
  fecha_vencimiento: Date | any;
  estado: LoanPaymentStatus;
  monto_mora_acumulado: number;
  fecha_real_pago?: Date | any;
}

export interface Loan {
  id: string;
  entidad: string;
  monto_total_prestado: number;
  numero_cuotas_totales: number;
  tasa_interes: number;
  cronograma?: LoanSchedule[];
}
