export type TransactionType = "ingreso" | "egreso" | "ahorro" | "pago_prestamo";

export interface TransactionDetail {
  categoria_id: string;
  monto: number;
  nombre_item: string;
}

export interface Transaction {
  id: string;
  monto_total: number;
  tipo: TransactionType;
  descripcion: string;
  fecha: Date | any; // Firestore Timestamp
  id_cuenta: string;
  id_meta_destino?: string;
  tiene_desglose: boolean;
  detalles_desglose?: TransactionDetail[];
  url_comprobante?: string;
  entrada_ia_cruda?: string;
}
