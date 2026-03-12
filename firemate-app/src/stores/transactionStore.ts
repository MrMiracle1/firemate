import { create } from 'zustand';
import { Transaction } from '../types';
import { API_BASE_URL, TEST_USER_ID } from '../lib/supabase';
import { cacheService, CACHE_KEYS } from '../lib/cache';
import { refreshTransactionRelatedData } from '../lib/dataSync';

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
  updateTransaction: (id: string, transaction: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at'>>) => Promise<void>;
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

    // 优先使用缓存（仅在 reset 时使用）
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
    // 1. 生成临时 ID 用于乐观更新
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const tempTransaction: Transaction = {
      ...transaction,
      id: tempId,
      user_id: TEST_USER_ID,
      created_at: new Date().toISOString()
    };

    // 2. 乐观更新：立即添加到列表开头
    set((state) => ({
      transactions: [tempTransaction, ...state.transactions],
      loading: true,
      error: null
    }));

    // 3. 调用 API
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

      // 4. 成功后用真实数据替换临时数据
      const createdTransaction = await response.json();
      set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === tempId ? createdTransaction : t
        ),
        loading: false
      }));

      // 5. 刷新相关数据（账户、预算、目标等）
      await refreshTransactionRelatedData();
    } catch (error) {
      // 6. 失败回滚：删除临时数据
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== tempId),
        error: (error as Error).message,
        loading: false
      }));
      throw error;
    }
  },

  updateTransaction: async (id, updates) => {
    // 1. 乐观更新：先保存旧数据用于回滚
    const oldTransactions = [...get().transactions];

    // 2. 立即更新本地 state
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
      error: null
    }));

    // 3. 调用 API
    try {
      const response = await fetch(`${API_BASE_URL}/api/transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': TEST_USER_ID
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update transaction');
      }

      // 成功后刷新相关数据（账户、预算、目标等）
      await refreshTransactionRelatedData();
    } catch (error) {
      // 4. 失败回滚
      set({ transactions: oldTransactions });
      throw error;
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
      // 刷新相关数据（账户、预算、目标等）
      await refreshTransactionRelatedData();
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  }
}));
