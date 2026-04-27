export interface Contact {
  id: string;
  nombre: string;
  color: string;
  email?: string;
  telefono?: string;
  total_deuda?: number; // Calculado dinámicamente
}
