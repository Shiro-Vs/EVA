export type AccountType = "debito" | "credito" | "billetera_digital";

export interface Account {
  id: string;
  nombre: string;
  tipo: AccountType;
  saldo_actual: number;
  id_cuenta_padre?: string;
  es_billetera_digital: boolean;
  limite_credito?: number;
  dia_corte?: number;
  dia_pago?: number;
  color: string;
  icono: string;
  es_predeterminada: boolean;
  excluir_del_total: boolean;
}
