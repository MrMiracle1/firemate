import { supabase } from '../lib/supabase';

export interface Budget {
  id?: string;
  user_id: string;
  amount: number;
  month: string;
  modified_count?: number;
  last_modified_at?: string;
  created_at?: string;
}

export const budgetService = {
  async getByMonth(userId: string, month: string): Promise<Budget | null> {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('month', month)
      .single();

    if (error) return null;
    return data;
  },

  async upsert(userId: string, budget: { month: string; amount: number }): Promise<Budget> {
    const { month, amount } = budget;

    // 检查当月是否已有预算
    const existing = await this.getByMonth(userId, month);

    if (existing) {
      // 检查修改次数
      if (existing.modified_count && existing.modified_count >= 1) {
        throw new Error('本月已修改过预算一次');
      }

      // 更新预算
      const { data, error } = await supabase
        .from('budgets')
        .update({
          amount,
          modified_count: (existing.modified_count || 0) + 1,
          last_modified_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('month', month)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // 创建预算
      const { data, error } = await supabase
        .from('budgets')
        .insert({
          user_id: userId,
          month,
          amount,
          modified_count: 0
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  async getSpending(userId: string, month: string): Promise<number> {
    // 获取月份的开始和结束日期
    const startDate = `${month}-01`;
    const endDate = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0)
      .toISOString()
      .split('T')[0];

    const { data, error } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;

    return (data || []).reduce((sum, t) => sum + Number(t.amount), 0);
  }
};
