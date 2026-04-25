export interface ContactService {
  id_servicio: string;
  cuota: number;
}

export interface Contact {
  id: string;
  nombre: string;
  total_deuda_acumulada: number;
  servicios_activos: ContactService[];
}
