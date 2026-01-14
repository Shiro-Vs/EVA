/**
 * Utility functions for date manipulation and formatting
 */

export const monthsEs = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

/**
 * Genera etiqueta "Enero 2024" desde un Date
 */
export const formatMonthLabel = (date: Date): string => {
  return `${monthsEs[date.getMonth()]} ${date.getFullYear()}`;
};

/**
 * Parsea "Enero 2024" o "Enero de 2024" y devuelve el Date (1ro del mes)
 */
export const parseMonthLabel = (label: string): Date => {
  const clean = label.toLowerCase().replace(" de ", " ");
  const parts = clean.split(" ");
  const monthName = parts[0];
  const yearStr = parts[1];

  const monthIndex = monthsEs.findIndex((m) => m.toLowerCase() === monthName);

  // Si no encuentra el mes, default a Enero (o manejar error)
  const safeMonthIndex = monthIndex !== -1 ? monthIndex : 0;

  return new Date(parseInt(yearStr), safeMonthIndex, 1);
};

/**
 * Obtiene el Date del mes siguiente dado un label actual ("Enero 2024")
 */
export const getNextMonthDate = (currentMonthLabel: string): Date => {
  const date = parseMonthLabel(currentMonthLabel);
  // Sumar 1 mes
  date.setMonth(date.getMonth() + 1);
  return date;
};
