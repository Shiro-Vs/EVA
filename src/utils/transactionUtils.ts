import { Transaction } from "../services/transactionService";
import { format, isToday, isYesterday, isValid } from "date-fns";
import { es } from "date-fns/locale/es";

/**
 * Parsea la descripción para intentar extraer contexto si falta metadata.
 * Formato esperado típico: "Pago [Nombre] - [Servicio] ([Mes])"
 */
export const parseTransactionMetadata = (transaction: Transaction) => {
  const { description, serviceName, subscriberName } = transaction;

  // Si ya tenemos metadata explicita, usémosla
  if (serviceName || subscriberName) {
    return {
      title:
        transaction.type === "income"
          ? subscriberName || "Ingreso"
          : serviceName || "Gasto",
      subtitle: extractMonth(description) || serviceName || "Transacción",
    };
  }

  // Fallback: Parsear strings
  let title = description;
  let subtitle = "";

  // Intento 1: "Pago Juan - Netflix (Enero)"
  if (description.startsWith("Pago ")) {
    const clean = description.replace("Pago ", "");
    const parts = clean.split("-").map((p) => p.trim());

    if (parts.length >= 2) {
      // Juan, Netflix (Enero)
      title = parts[0]; // Juan
      subtitle = parts[1]; // Netflix (Enero)
    }
  }

  return { title, subtitle };
};

const extractMonth = (desc: string): string | null => {
  const match = desc.match(/\((.*?)\)/);
  return match ? match[1] : null; // "Enero"
};

export const groupTransactionsByDate = (transactions: Transaction[]) => {
  const groups: { title: string; data: Transaction[] }[] = [];

  transactions.forEach((t) => {
    let date = t.date;

    // Safety check for date
    if (!isValid(date)) {
      // Try parsing if string
      date = new Date(t.date);
    }

    if (!isValid(date)) {
      console.warn("Invalid date for transaction:", t.id);
      // Fallback or skip? Let's skip grouping it or put in "Sin Fecha"
      // For now, allow it but don't crash date-fns
      // Use current date as fallback just to show it? Or better "Fecha Inválida"
      // Let's safe guard.
      const existingGroup = groups.find((g) => g.title === "Desconocido");
      if (existingGroup) {
        existingGroup.data.push(t);
      } else {
        groups.push({ title: "Desconocido", data: [t] });
      }
      return;
    }

    let title = "";

    try {
      if (isToday(date)) {
        title = "Hoy";
      } else if (isYesterday(date)) {
        title = "Ayer";
      } else {
        title = format(date, "d 'de' MMMM", { locale: es });
      }
    } catch (e) {
      console.error("Date formatting error:", e);
      title = "Desconocido";
    }

    // Capitalize first letter
    if (title && title !== "Hoy" && title !== "Ayer") {
      title = title.charAt(0).toUpperCase() + title.slice(1);
    }

    const existingGroup = groups.find((g) => g.title === title);
    if (existingGroup) {
      existingGroup.data.push(t);
    } else {
      groups.push({ title, data: [t] });
    }
  });

  return groups;
};
