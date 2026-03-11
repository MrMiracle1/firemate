import { create } from 'zustand';
import { Transaction } from '../types';
import { API_BASE_URL, TEST_USER_ID } from '../lib/supabase';
import { cacheService, CACHE_KEYS } from '../lib/cache';

const PAGE_SIZE = 20;

interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  offset: number;

  // Actions
  fetchTransactions: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
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

    // 优先使用缓存
    if (reset) {
      const cached = await cacheService.get<Transaction[]>(CACHE_KEYS.TRANSACTIONS);
      if (cached) {
        set({ transactions: cached });
      }
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/transactions?limit=${PAGE_SIZE}&offset=${offset}`,
        { headers: { 'x-user-id': TEST_USER_ID } }
      );
      if (!response.ok) throw new Error('Failed to fetch transactions');

      const transactions = await response.json();

      // 缓存数据
      if (reset) {
        await cacheService.set(CACHE_KEYS.TRANSACTIONS, transactions);
      }

      set({
        transactions: reset ? transactions : [...get().transactions, ...transactions],
        offset: offset + PAGE_SIZE,
        hasMore: transactions.length === PAGE_SIZE,
        loading: false
      });
    } catch (error) {
      // 网络错误时使用缓存
      if (reset) {
        const cached = await cacheService.get<Transaction[]>(CACHE_KEYS.TRANSACTIONS);
        if (cached) {
          set({ transactions: cached, loading: false });
        } else {
          set({ error: (error as Error).message, loading: false });
        }
      } else {
        set({ error: (error as Error).message, loading: false });
      }
    }
  },

  loadMore: async () => {
    const { hasMore, loading } = get();
    if (!hasMore || loading) return;
    await get().fetchTransactions(false);
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
