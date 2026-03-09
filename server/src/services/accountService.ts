import { supabase } from '../lib/supabase';

export interface Account {
  id?: string;
  user_id: string;
  name: string;
  type: 'cash' | 'bank_card' | 'third_party' | 'investment' | 'savings';
  balance: number;
  icon?: string;
  color?: string;
  note?: string;
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const accountService = {
  async getAll(userId: string): Promise<Account[]> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(userId: string, id: string): Promise<Account | null> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('id', id)
      .eq('is_deleted', false)
      .single();

    if (error) return null;
    return data;
  },

  async create(userId: string, account: Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Account> {
    const { data, error } = await supabase
      .from('accounts')
      .insert({ ...account, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(userId: string, id: string, updates: Partial<Account>): Promise<Account> {
    const { data, error } = await supabase
      .from('accounts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(userId: string, id: string): Promise<void> {
    const { error } = await supabase
      .from('accounts')
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('id', id);

    if (error) throw error;
  },

  async getTotalSummary(userId: string): Promise<{ total: number; byType: Record<string, number> }> {
    const accounts = await this.getAll(userId);

    const total = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
    const byType: Record<string, number> = {};

    accounts.forEach(acc => {
      byType[acc.type] = (byType[acc.type] || 0) + Number(acc.balance);
    });

    return { total, byType };
  }
};
