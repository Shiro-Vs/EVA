export interface Service {
  id?: string;
  name: string;
  cost: number;
  billingDay: number;
  icon?: string | null;
  iconLibrary?: string | null; // "Ionicons" | "MaterialCommunityIcons"
  logoUrl?: string | null; // URL for original brand logo
  color?: string | null; // Hex color for branding
  shared?: boolean; // If true, enables subscribers management
  createdAt: Date;
  startDate?: Date; // Start date of service (for backfilling & billing day)
  order?: number;
}

export interface Subscriber {
  id?: string;
  name: string;
  quota: number;
  startDate: Date;
  color?: string;
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
