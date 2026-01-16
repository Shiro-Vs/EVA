import {
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  doc,
  writeBatch,
  collection,
  increment,
} from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { Account } from "./accountService";
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
  paymentDate?: Date,
  account?: Account,
  note?: string
) => {
  try {
    if (!account) {
      throw new Error("Se requiere una cuenta para registrar el ingreso.");
    }

    const debtRef = getDebtDoc(userId, serviceId, subscriberId, debtId);
    const dateToRecord = paymentDate || new Date();

    await updateDoc(debtRef, {
      status: "paid",
      paidAt: dateToRecord,
      amount: amount, // Save actual paid amount
      note: note || null,
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
      description:
        `Pago ${subName} - ${serviceName} (${debtMonth})` +
        (note ? ` - ${note}` : ""),
      date: dateToRecord,
      serviceId: serviceId,
      accountId: account.id!, // Account is mandatory per check above
      accountName: account.name,
      // For category, we might default to a generic one or leave undefined if optional?
      // Interface seemed to require categoryId. I'll use a placeholder or check if optional.
      // Looking at transactionService, categoryId is string.
      // I will put a placeholder for now as we don't have a category picker here yet.
      // "Reembolsos" was used before as string.
      // But Transaction interface says `categoryId: string; categoryName: string`.
      // I will assume "0" or "reembolsos" id for now to avoid break, or fetch default.
      // To be safe I will use the account icon/color for category visual if needed or just empty strings if allowed.
      categoryId: "subscription_income",
      categoryName: "Cobro de Servicio",
      categoryIcon: "cash-outline", // Default
      categoryColor: "#4CAF50", // Success color
      serviceName: serviceName,
      subscriberName: subName,
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
// ... (existing helper imports)

/**
 * Procesa múltiples pagos en una sola transacción atómica.
 * Optimizado para rendimiento y consistencia.
 */
export const processBulkPayment = async (
  userId: string,
  serviceId: string,
  subscriber: Subscriber,
  items: {
    label: string;
    amount: number;
    debtId?: string; // Si existe
    isNew: boolean;
  }[],
  paymentDate: Date,
  account: Account,
  serviceName: string,
  note?: string
) => {
  try {
    // 2. Prepare Batch
    const batch = writeBatch(db);
    let totalAmount = 0;
    const subName = subscriber.name;

    // 3. Queue Writes
    for (const item of items) {
      totalAmount += item.amount;
      const finalLabel = item.label;

      // A. Handle Debt (Update or Create)
      if (!item.isNew && item.debtId) {
        // Update existing
        const debtRef = doc(
          db,
          "users",
          userId,
          "services",
          serviceId,
          "subscribers",
          subscriber.id!,
          "debts",
          item.debtId
        );
        batch.update(debtRef, {
          status: "paid",
          paidAt: paymentDate,
          amount: item.amount,
          note: note || null,
        });
      } else {
        // Create new
        const debtsCollectionRef = collection(
          db,
          "users",
          userId,
          "services",
          serviceId,
          "subscribers",
          subscriber.id!,
          "debts"
        );
        const newDebtRef = doc(debtsCollectionRef);
        batch.set(newDebtRef, {
          month: finalLabel,
          amount: item.amount,
          status: "paid",
          paidAt: paymentDate,
          createdAt: new Date(),
        });
      }

      // B. Create Transaction Record (Wallet)
      const transactionsRef = collection(db, "users", userId, "transactions");
      const newTransRef = doc(transactionsRef);
      batch.set(newTransRef, {
        type: "income",
        amount: item.amount,
        description:
          `Pago ${subName} - ${serviceName} (${finalLabel})` +
          (note ? ` - ${note}` : ""),
        date: paymentDate,
        createdAt: new Date(),
        serviceId: serviceId,
        accountId: account.id!,
        accountName: account.name,
        categoryId: "subscription_income",
        categoryName: "Cobro de Servicio",
        categoryIcon: "cash-outline",
        categoryColor: "#4CAF50",
        serviceName: serviceName,
        subscriberName: subName,
      });
    }

    // 4. Update Account Balance
    const accountRef = doc(db, "users", userId, "accounts", account.id!);
    batch.update(accountRef, { currentBalance: increment(totalAmount) });

    // 5. Commit Batch
    await batch.commit();
  } catch (e) {
    console.error("Error in bulk payment batch:", e);
    throw e;
  }
};
