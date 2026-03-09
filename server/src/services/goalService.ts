import { supabase } from '../lib/supabase';

export interface Goal {
  id?: string;
  user_id: string;
  name: string;
  target_amount: number;
  linked_account_id: string;
  status?: 'active' | 'achieved';
  created_at?: string;
}

export const goalService = {
  async getAll(userId: string): Promise<Goal[]> {
    const { data, error } = await supabase
      .from('goals')
      .select('*, account:accounts(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(userId: string, goal: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'status'>): Promise<Goal> {
    const { data, error } = await supabase
      .from('goals')
      .insert({ ...goal, user_id: userId, status: 'active' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(userId: string, id: string, updates: Partial<Goal>): Promise<Goal> {
    const { data, error } = await supabase
      .from('goals')
      .update(updates)
      .eq('user_id', userId)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(userId: string, id: string): Promise<void> {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('user_id', userId)
      .eq('id', id);

    if (error) throw error;
  },

  async checkAndUpdateStatus(userId: string): Promise<void> {
    const goals = await this.getAll(userId);

    for (const goal of goals) {
      if (goal.status === 'active' && goal.linked_account_id) {
        const { data: account } = await supabase
          .from('accounts')
          .select('balance')
          .eq('id', goal.linked_account_id)
          .single();

        if (account && Number(account.balance) >= goal.target_amount) {
          await this.update(userId, goal.id!, { status: 'achieved' });
        }
      }
    }
  }
};
