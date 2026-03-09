// 账户类型
export type AccountType = 'cash' | 'bank_card' | 'third_party' | 'investment' | 'savings';

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  balance: number;
  icon?: string;
  color?: string;
  note?: string;
  created_at: string;
  updated_at: string;
}

// 交易类型
export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  category_id?: string;
  category?: Category;
  amount: number;
  account_id: string;
  account?: Account;
  to_account_id?: string;
  to_account?: Account;
  date: string;
  note?: string;
  created_at: string;
}

// 分类类型
export type CategoryType = 'expense' | 'income';

export interface Category {
  id: string;
  user_id?: string;
  name: string;
  type: CategoryType;
  parent_id?: string;
  icon?: string;
  is_default: boolean;
  children?: Category[];
}

// 预算类型
export interface Budget {
  id: string;
  user_id: string;
  amount: number;
  month: string;
  modified_count: number;
  last_modified_at?: string;
  created_at: string;
}

// 目标类型
export type GoalStatus = 'active' | 'achieved';

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  linked_account_id: string;
  account?: Account;
  status: GoalStatus;
  created_at: string;
  progress?: number;
}

// 资产汇总
export interface AssetSummary {
  total: number;
  byType: Record<AccountType, number>;
}

// 月度收支
export interface MonthlySummary {
  income: number;
  expense: number;
  balance: number;
}
