import {
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  doc, // Keep this for now if generic doc ref needed, but try to use helpers
} from "firebase/firestore";
import { Debt, Subscriber } from "./types";
import {
  getDebtsCollection,
  getDebtDoc,
  getServiceDoc,
  getSubscriberDoc,
} from "../utils/firestoreUtils";
import { addTransaction } from "./transactionService";
import {
  formatMonthLabel,
  getNextMonthDate,
  monthsEs,
  parseMonthLabel,
} from "../utils/dateUtils";

/**
 * Genera una deuda manual (o automática) para un suscriptor
 */
export const generateDebt = async (
  userId: string,
  serviceId: string,
  subscriberId: string,
  amount: number,
  monthLabel?: string,
  initialStatus: "pending" | "paid" = "pending",
  paymentDate?: Date
) => {
  try {
    let finalLabel = monthLabel;
    if (!finalLabel) {
      finalLabel = formatMonthLabel(new Date());
    }

    const newDebt: Debt = {
      month: finalLabel,
      amount: amount,
      status: initialStatus,
    };

    if (initialStatus === "paid" && paymentDate) {
      newDebt.paidAt = paymentDate;
    } else if (initialStatus === "paid") {
      newDebt.paidAt = new Date();
    }

    const docRef = await addDoc(
      getDebtsCollection(userId, serviceId, subscriberId),
      { ...newDebt, createdAt: new Date() }
    );
    return docRef.id;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

/**
 * Marca una deuda como PAGADA y genera el INGRESO en la billetera
 */
export const paySubscriberDebt = async (
  userId: string,
  serviceId: string,
  subscriberId: string,
  debtId: string,
  amount: number,
  debtMonth: string,
  paymentDate?: Date
) => {
  try {
    const debtRef = getDebtDoc(userId, serviceId, subscriberId, debtId);
    const dateToRecord = paymentDate || new Date();

    await updateDoc(debtRef, {
      status: "paid",
      paidAt: dateToRecord,
    });

    // Registrar Ingreso en Billetera
    // Necesitamos el nombre del suscriptor y servicio para la descripción
    const serviceDoc = await getDoc(getServiceDoc(userId, serviceId));
    const subDoc = await getDoc(
      getSubscriberDoc(userId, serviceId, subscriberId)
    );
    const serviceName = serviceDoc.exists()
      ? serviceDoc.data().name
      : "Servicio";
    const subName = subDoc.exists() ? subDoc.data().name : "Suscriptor";

    await addTransaction(userId, {
      type: "income",
      amount: amount,
      category: "Reembolsos", // O servicios
      description: `Pago ${subName} - ${serviceName} (${debtMonth})`,
      date: dateToRecord,
      serviceId: serviceId,
    });
  } catch (e) {
    console.error(e);
    throw e;
  }
};

/**
 * Eliminar una deuda (Mes). Si estaba pagada, reembolsa
 * (Reembolsa significa quitar el ingreso de billetera?
 *  Por simplicidad, NO borramos la transacción de billetera automáticamente para no descuadrar,
 *  pero podrías implementar eso si quisieras strict consistency).
 */
export const deleteSubscriberDebt = async (
  userId: string,
  serviceId: string,
  subscriberId: string,
  debt: Debt
) => {
  try {
    await deleteDoc(getDebtDoc(userId, serviceId, subscriberId, debt.id!));
  } catch (e) {
    console.error(e);
    throw e;
  }
};

/**
 * Revertir a PENDIENTE.
 */
export const revertDebtToPending = async (
  userId: string,
  serviceId: string,
  subscriberId: string,
  debt: Debt
) => {
  try {
    const debtRef = getDebtDoc(userId, serviceId, subscriberId, debt.id!);
    await updateDoc(debtRef, {
      status: "pending",
      paidAt: null, // Borrar fecha pago
    });
    // Opcional: Crear transacción de egreso "corrección"? No por ahora.
  } catch (e) {
    console.error(e);
    throw e;
  }
};

/** LÓGICA PARA ADELANTAR MESES **/

/**
 * Parsea "Enero 2024" o "Enero de 2024" y devuelve el Date del mes siguiente 1ro
 */

/**
 * Paga X meses por adelantado.
 */
export const payMultipleMonths = async (
  userId: string,
  serviceId: string,
  subscriber: Subscriber,
  numberOfMonths: number,
  allDebts: Debt[] = [] // Pasamos todas las deudas para analizar
) => {
  // NOTA: Esta función es compleja y llama a paySubscriberDebt muchas veces.
  // Por simplicidad en este refactor, copiaremos la lógica tal cual.
  // ... (Implementación completa si fuera necesaria, por ahora solo placeholder de la lógica existente)
  // Como el usuario no usa mucho esta función según el contexto reciente,
  // la incluiré simplificada o completa si tengo el source.
  // Tengo el source del view_file anterior.
  // Copiaré la lógica exacta.

  try {
    let paidCount = 0;
    const paymentDate = new Date();

    // 1. Identificar y ordenar deudas pendientes
    const pendingDebts = allDebts
      .filter((d) => d.status === "pending")
      .sort((a, b) => {
        return (
          parseMonthLabel(a.month).getTime() -
          parseMonthLabel(b.month).getTime()
        );
      });

    // 2. Pagar Pendientes primero
    for (const debt of pendingDebts) {
      if (paidCount >= numberOfMonths) break;
      await paySubscriberDebt(
        userId,
        serviceId,
        subscriber.id!,
        debt.id!,
        subscriber.quota, // Asumimos monto completo
        debt.month,
        paymentDate
      );
      paidCount++;
    }

    // 3. Si faltan meses, generar nuevos a futuro
    if (paidCount < numberOfMonths) {
      // Determinar cuál es el último mes que existe (pagado o pendiente)
      let lastDate = new Date(); // Default hoy
      if (allDebts.length > 0) {
        // Buscar el mas futuro
        const sortedAll = [...allDebts].sort(
          (a, b) =>
            parseMonthLabel(b.month).getTime() -
            parseMonthLabel(a.month).getTime()
        );
        const lastDebt = sortedAll[0];
        lastDate = parseMonthLabel(lastDebt.month);
      } else {
        // Si no hay deudas nunca, empezamos desde startDate del suscriptor? O desde hoy?
        // Mejor desde el mes actual.
        // Pero restamos 1 mes para que el getNext sea el actual?
        // No, current logic is fine inside loop.
        // Actually, logic below handles "next month" from label.
        // We need a base label.
        lastDate.setMonth(lastDate.getMonth() - 1); // Hack to start from current?
      }

      let currentLabel = formatMonthLabel(lastDate);
      if (allDebts.length === 0) {
        // Si es nuevo, start from NOW
        const now = new Date();
        // We want the first generated month to be NOW or Next?
        // Usually "Advance" implies future, but if I owe nothing, maybe I want to pay THIS month.
        // Let's assume we continue from chain.
        // If I have no debts, I probably want to pay starting this month.
        // So `lastDate` should be previous month.
        now.setMonth(now.getMonth() - 1);
        currentLabel = formatMonthLabel(now);
      }

      while (paidCount < numberOfMonths) {
        const nextDate = getNextMonthDate(currentLabel);
        const nextLabel = formatMonthLabel(nextDate);

        // Generar y Pagar
        const newId = await generateDebt(
          userId,
          serviceId,
          subscriber.id!,
          subscriber.quota,
          nextLabel,
          "paid",
          paymentDate
        );

        // El generateDebt ya lo marca como paid si passas 'paid'.
        // Pero NO genera transacción en billetera si usas generateDebt directo?
        // Mi generateDebt NO llama a addTransaction.
        // Entonces debo llamar a paySubscriberDebt?
        // Si llamo a paySubscriberDebt necesito un ID.
        // Si generateDebt create "paid", I need to manually add transaction separately?
        // OR generate as pending then pay.
        // Optimization: Generate as Pending then Pay.
        // But wait, generateDebt param `initialStatus`...
        // Let's call paySubscriberDebt immediately after.

        // Actually better: Generate as 'pending' then paySubscriberDebt.
        // If I generate as 'paid' directly, I miss the wallet transaction unless I add logic there.
        // Let's verify `generateDebt` code above... It does NOT add transaction.
        // So:

        // CORRECTION to above logic to match original `subscriptionService.ts` flow:
        // Original logic called `generateDebt(..., 'paid')` and then `paySubscriberDebt`.
        // Wait, if it's paid, `paySubscriberDebt` updates status to paid (redundant) AND adds transaction.
        // So yes, call generate(paid) then pay(...) is fine.

        if (newId) {
          await paySubscriberDebt(
            userId,
            serviceId,
            subscriber.id!,
            newId,
            subscriber.quota,
            nextLabel,
            paymentDate
          );
        }

        currentLabel = nextLabel;
        paidCount++;
      }
    }
  } catch (e) {
    console.error(e);
    throw e;
  }
};
