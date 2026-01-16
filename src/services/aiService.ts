import { GoogleGenerativeAI } from "@google/generative-ai";
import { DashboardData } from "../hooks/useDashboardData";

// TODO: Reemplaza esto con tu API Key real de Google AI Studio
// Obténla gratis aquí: https://aistudio.google.com/app/apikey
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(API_KEY);

export const generateFinancialTip = async (
  data: DashboardData
): Promise<{ text: string; isAi: boolean }> => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const isStrategic = Math.random() > 0.5; // 50% chance of broad advice vs specific analysis

    const context = `
      Actúa como un asesor financiero personal, amigable pero directo.
      
      DATOS DEL USUARIO (Mes Actual):
      - Ingresos: ${data.currentMonthIncome}
      - Gastos: ${data.currentMonthExpense}
      - Balance: ${data.totalBalance}
      - Categoría Top: ${
        data.topCategory?.name
      } (${data.topCategory?.percentage.toFixed(0)}%)
      - Gastos Hormiga: ${data.antExpenses.total}
      - Día caro: ${data.expensiveDay?.day}

      TAREA:
      Dame un consejo de 1 o 2 frases.
      ${
        isStrategic
          ? "Ignora los detalles numéricos exactos y dame un tip de educación financiera general pero aplicable a mi contexto (ej. regla 50/30/20, fondo de emergencia, inversiones) para variar."
          : "Analiza un dato específico de los de arriba y dame una advertencia o felicitación concreta."
      }
      
      Usa emojis. Sé variado, no repitas siempre lo mismo.
    `;

    const result = await model.generateContent(context);
    const response = await result.response;
    return { text: response.text(), isAi: true };
  } catch (error) {
    console.warn("AI unavailable:", error);
    return { text: generateLocalTip(data), isAi: false };
  }
};

// 🛡️ PLAN B: Lógica Local
const generateLocalTip = (data: DashboardData): string => {
  const {
    currentMonthIncome,
    currentMonthExpense,
    antExpenses,
    topCategory,
    totalBalance,
  } = data;

  // 1. Alerta Roja: Gastos > Ingresos
  if (currentMonthIncome > 0 && currentMonthExpense > currentMonthIncome) {
    return "⚠️ Alerta: Estás gastando más de lo que ganas este mes. Reduce gastos no esenciales urgentemente.";
  }

  // 2. Gastos Hormiga Altos (> 10% del total)
  if (
    currentMonthExpense > 0 &&
    antExpenses.total / currentMonthExpense > 0.1
  ) {
    return `🐜 Cuidado: Los \"gastos hormiga\" suman S/ ${antExpenses.total.toFixed(
      0
    )}. ¡Es el ${((antExpenses.total / currentMonthExpense) * 100).toFixed(
      0
    )}% de tus gastos!`;
  }

  // 3. Categoría Dominante (> 40% del total)
  if (topCategory && topCategory.percentage > 40) {
    return `📊 Ojo: El ${topCategory.percentage.toFixed(
      0
    )}% de tu dinero se va en ${
      topCategory.name
    }. Intenta diversificar o reducir este rubro.`;
  }

  // 4. Ahorro Saludable (Gastos < 80% de Ingresos)
  if (
    currentMonthIncome > 0 &&
    currentMonthExpense < currentMonthIncome * 0.8
  ) {
    return "🎉 ¡Excelente! Estás ahorrando más del 20% de tus ingresos. Es un gran momento para invertir o pagar deudas.";
  }

  // 5. Día Caro
  if (data.expensiveDay) {
    return `📅 Patrón detectado: Los ${
      data.expensiveDay.day
    } sueles gastar más (S/ ${data.expensiveDay.amount.toFixed(
      0
    )}). ¡Ten cuidado ese día!`;
  }

  // Default
  return "💡 Consejo: Revisar tus finanzas 5 minutos al día puede ahorrarte mucho estrés a fin de mes.";
};
