import { collection, doc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export const getServicesCollection = (userId: string) =>
  collection(db, "users", userId, "services");

export const getServiceDoc = (userId: string, serviceId: string) =>
  doc(db, "users", userId, "services", serviceId);

export const getSubscribersCollection = (userId: string, serviceId: string) =>
  collection(db, "users", userId, "services", serviceId, "subscribers");

export const getSubscriberDoc = (
  userId: string,
  serviceId: string,
  subscriberId: string
) =>
  doc(db, "users", userId, "services", serviceId, "subscribers", subscriberId);

export const getDebtsCollection = (
  userId: string,
  serviceId: string,
  subscriberId: string
) =>
  collection(
    db,
    "users",
    userId,
    "services",
    serviceId,
    "subscribers",
    subscriberId,
    "debts"
  );

export const getDebtDoc = (
  userId: string,
  serviceId: string,
  subscriberId: string,
  debtId: string
) =>
  doc(
    db,
    "users",
    userId,
    "services",
    serviceId,
    "subscribers",
    subscriberId,
    "debts",
    debtId
  );

export const getOwnerDebtsCollection = (userId: string, serviceId: string) =>
  collection(db, "users", userId, "services", serviceId, "owner_debts");

export const getOwnerDebtDoc = (
  userId: string,
  serviceId: string,
  debtId: string
) => doc(db, "users", userId, "services", serviceId, "owner_debts", debtId);
