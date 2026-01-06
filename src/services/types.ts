export interface Service {
  id?: string;
  name: string;
  cost: number;
  billingDay: number;
  icon?: string;
  createdAt: Date;
}

export interface Subscriber {
  id?: string;
  name: string;
  quota: number;
  startDate: Date;
}

export interface Debt {
  id?: string;
  month: string;
  amount: number;
  status: "pending" | "paid";
  paidAt?: Date | any; // allow firebase timestamp for flexibility
}

export interface ServicePayment {
  id?: string;
  amount: number;
  date: Date;
  note?: string;
}

export interface OwnerDebt {
  id?: string;
  month: string;
  amount: number;
  status: "pending" | "paid";
  paidAt?: Date;
  createdAt: Date;
}
