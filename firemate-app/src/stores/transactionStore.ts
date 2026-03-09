import { create } from 'zustand';
import { Transaction } from '../types';
import { API_BASE_URL, TEST_USER_ID } from '../lib/supabase';

interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  offset: number;

  // Actions
  fetchTransactions: (reset?: boolean) => Promise<void>;
  createTransaction: (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  loading: false,
  error: null,
  hasMore: true,
  offset: 0,

  fetchTransactions: async (reset = false) => {
    const offset = reset ? 0 : get().offset;
    set({ loading: true, error: null });

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/transactions?limit=20&offset=${offset}`,
        { headers: { 'x-user-id': TEST_USER_ID } }
      );
      if (!response.ok) throw new Error('Failed to fetch transactions');

      const transactions = await response.json();

      set({
        transactions: reset ? transactions : [...get().transactions, ...transactions],
        offset: offset + 20,
        hasMore: transactions.length === 20,
        loading: false
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  createTransaction: async (transaction) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': TEST_USER_ID
        },
        body: JSON.stringify(transaction)
      });
      if (!response.ok) throw new Error('Failed to create transaction');
      await get().fetchTransactions(true);
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  deleteTransaction: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/transactions/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': TEST_USER_ID }
      });
      if (!response.ok) throw new Error('Failed to delete transaction');
      await get().fetchTransactions(true);
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  }
}));
