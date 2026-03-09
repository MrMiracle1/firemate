import { create } from 'zustand';
import { Budget } from '../types';
import { API_BASE_URL, TEST_USER_ID } from '../lib/supabase';

interface BudgetState {
  budget: Budget | null;
  spending: number;
  loading: boolean;
  error: string | null;

  // Actions
  fetchBudget: (month: string) => Promise<void>;
  setBudget: (month: string, amount: number) => Promise<void>;
}

export const useBudgetStore = create<BudgetState>((set) => ({
  budget: null,
  spending: 0,
  loading: false,
  error: null,

  fetchBudget: async (month: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/budgets?month=${month}`,
        { headers: { 'x-user-id': TEST_USER_ID } }
      );
      if (!response.ok) throw new Error('Failed to fetch budget');

      const budget = await response.json();
      set({ budget, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  setBudget: async (month: string, amount: number) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/budgets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': TEST_USER_ID
        },
        body: JSON.stringify({ month, amount })
      });
      if (!response.ok) throw new Error('Failed to set budget');
      await fetch(`${API_BASE_URL}/api/budgets?month=${month}`, {
        headers: { 'x-user-id': TEST_USER_ID }
      }).then(r => r.json()).then(data => {
        set({ budget: data, loading: false });
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  }
}));
