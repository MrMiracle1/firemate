import { create } from 'zustand';
import { Goal } from '../types';
import { API_BASE_URL, TEST_USER_ID } from '../lib/supabase';

interface GoalState {
  goals: Goal[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchGoals: () => Promise<void>;
  createGoal: (goal: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'status'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
}

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  loading: false,
  error: null,

  fetchGoals: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/goals`, {
        headers: { 'x-user-id': TEST_USER_ID }
      });
      if (!response.ok) throw new Error('Failed to fetch goals');
      const goals = await response.json();

      // 计算进度
      const goalsWithProgress = goals.map((goal: Goal) => ({
        ...goal,
        progress: goal.account
          ? (Number(goal.account.balance) / Number(goal.target_amount)) * 100
          : 0
      }));

      set({ goals: goalsWithProgress, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  createGoal: async (goal) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': TEST_USER_ID
        },
        body: JSON.stringify(goal)
      });
      if (!response.ok) throw new Error('Failed to create goal');
      await get().fetchGoals();
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateGoal: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/goals/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': TEST_USER_ID
        },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update goal');
      await get().fetchGoals();
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  deleteGoal: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/goals/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': TEST_USER_ID }
      });
      if (!response.ok) throw new Error('Failed to delete goal');
      await get().fetchGoals();
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  }
}));
