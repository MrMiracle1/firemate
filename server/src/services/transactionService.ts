import { supabase } from '../lib/supabase';

export interface Transaction {
  id?: string;
  user_id: string;
  type: 'income' | 'expense' | 'transfer';
  category_id?: string;
  amount: number;
  account_id: string;
  to_account_id?: string;
  date: string;
  note?: string;
  created_at?: string;
}

interface GetOptions {
  limit: number;
  offset: number;
}

export const transactionService = {
  async getAll(userId: string, options: GetOptions): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*, category:categories(*), account:accounts(*), to_account:accounts(*)')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(options.offset, options.offset + options.limit - 1);

    if (error) throw error;
    return data || [];
  },

  async create(userId: string, transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .insert({ ...transaction, user_id: userId })
      .select()
      .single();

    if (error) throw error;

    // 更新账户余额
    await this.updateAccountBalance(userId, transaction);

    return data;
  },

  async delete(userId: string, id: string): Promise<void> {
    // 先获取交易信息用于恢复余额
    const { data: transaction } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (transaction) {
      // 恢复账户余额
      await this.reverseAccountBalance(userId, transaction);
    }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('user_id', userId)
      .eq('id', id);

    if (error) throw error;
  },

  async updateAccountBalance(userId: string, transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>): Promise<void> {
    const { account_id, to_account_id, type, amount } = transaction;

    if (type === 'income') {
      // 收入：增加账户余额
      await this.addBalance(account_id!, amount);
    } else if (type === 'expense') {
      // 支出：减少账户余额
      await this.subtractBalance(account_id!, amount);
    } else if (type === 'transfer' && to_account_id) {
      // 转账：转出账户减少，转入账户增加
      await this.subtractBalance(account_id!, amount);
      await this.addBalance(to_account_id, amount);
    }
  },

  async reverseAccountBalance(userId: string, transaction: Transaction): Promise<void> {
    const { account_id, to_account_id, type, amount } = transaction;

    if (type === 'income') {
      await this.subtractBalance(account_id!, amount);
    } else if (type === 'expense') {
      await this.addBalance(account_id!, amount);
    } else if (type === 'transfer' && to_account_id) {
      await this.addBalance(account_id!, amount);
      await this.subtractBalance(to_account_id, amount);
    }
  },

  async addBalance(accountId: string, amount: number): Promise<void> {
    const { data } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', accountId)
      .single();

    if (data) {
      await supabase
        .from('accounts')
        .update({ balance: Number(data.balance) + amount })
        .eq('id', accountId);
    }
  },

  async subtractBalance(accountId: string, amount: number): Promise<void> {
    const { data } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', accountId)
      .single();

    if (data) {
      await supabase
        .from('accounts')
        .update({ balance: Number(data.balance) - amount })
        .eq('id', accountId);
    }
  }
};
