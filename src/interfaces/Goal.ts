export type GoalPriority = "alta" | "media" | "baja";

export interface Goal {
  id: string;
  nombre: string;
  monto_objetivo: number;
  monto_actual: number;
  fecha_limite: Date | any;
  prioridad: GoalPriority;
}
