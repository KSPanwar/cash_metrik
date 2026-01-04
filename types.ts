
export type TransactionType = 'Credit' | 'Debit';
export type BankType = 'PNB' | 'HDFC' | 'SBI' | 'Manual';
export type CategoryType = 'Income' | 'Expense' | 'Savings';

export interface Category {
  id: string;
  type: CategoryType;
}

export interface Transaction {
  id: string;
  date: Date;
  type: TransactionType;
  amount: number;
  remarks: string;
  payee: string;
  category?: string;
  isManual?: boolean;
  bank: BankType | string;
}

export interface DailySummary {
  date: string;
  totalDebit: number;
  totalCredit: number;
  transactions: Transaction[];
}

export type ViewTab = 'calendar' | 'all' | 'grouped' | 'yearly' | 'categories' | 'how-to' | 'about' | 'feedback';
