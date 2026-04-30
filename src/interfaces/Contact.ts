export interface Contact {
  id: string;
  nombre: string;
  color: string;
  telefono?: string;
  total_deuda?: number; // Calculado dinámicamente
  total_servicios?: number; // Calculado dinámicamente
}
