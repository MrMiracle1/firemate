import { create } from 'zustand';
import { Account, AssetSummary, AccountType } from '../types';
import { API_BASE_URL, TEST_USER_ID } from '../lib/supabase';
import { cacheService, CACHE_KEYS } from '../lib/cache';
import { refreshAccountRelatedData } from '../lib/dataSync';

interface AccountState {
  accounts: Account[];
  totalSummary: AssetSummary | null;
  loading: boolean;
  error: string | null;
  isOffline: boolean;

  // Actions
  fetchAccounts: (forceRefresh?: boolean) => Promise<void>;
  fetchTotalSummary: (forceRefresh?: boolean) => Promise<void>;
  createAccount: (account: Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateAccount: (id: string, updates: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
}

export const useAccountStore = create<AccountState>((set, get) => ({
  accounts: [],
  totalSummary: null,
  loading: false,
  error: null,
  isOffline: false,

  fetchAccounts: async (forceRefresh = false) => {
    // 如果不强制刷新，尝试从缓存读取
    if (!forceRefresh) {
      const cached = await cacheService.get<Account[]>(CACHE_KEYS.ACCOUNTS);
      if (cached) {
        set({ accounts: cached, isOffline: false });
      }
    }

    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/accounts`, {
        headers: { 'x-user-id': TEST_USER_ID }
      });
      if (!response.ok) throw new Error('Failed to fetch accounts');
      const accounts = await response.json();
      // 缓存数据
      await cacheService.set(CACHE_KEYS.ACCOUNTS, accounts);
      set({ accounts, loading: false, isOffline: false });
    } catch (error) {
      // 网络错误时使用缓存数据
      const cached = await cacheService.get<Account[]>(CACHE_KEYS.ACCOUNTS);
      if (cached) {
        set({ accounts: cached, loading: false, isOffline: true, error: '离线模式' });
      } else {
        set({ error: (error as Error).message, loading: false });
      }
    }
  },

  fetchTotalSummary: async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = await cacheService.get<AssetSummary>(CACHE_KEYS.TOTAL_SUMMARY);
      if (cached) {
        set({ totalSummary: cached });
      }
    }

    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/accounts/total/summary`, {
        headers: { 'x-user-id': TEST_USER_ID }
      });
      if (!response.ok) throw new Error('Failed to fetch summary');
      const totalSummary = await response.json();
      await cacheService.set(CACHE_KEYS.TOTAL_SUMMARY, totalSummary);
      set({ totalSummary, loading: false, isOffline: false });
    } catch (error) {
      const cached = await cacheService.get<AssetSummary>(CACHE_KEYS.TOTAL_SUMMARY);
      if (cached) {
        set({ totalSummary: cached, loading: false, isOffline: true });
      } else {
        set({ error: (error as Error).message, loading: false });
      }
    }
  },

  createAccount: async (account) => {
    // 1. 生成临时 ID 用于乐观更新
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const tempAccount: Account = {
      ...account,
      id: tempId,
      user_id: TEST_USER_ID,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 2. 乐观更新：立即添加到列表
    set((state) => ({
      accounts: [...state.accounts, tempAccount],
      loading: true,
      error: null
    }));

    // 3. 调用 API
    try {
      const response = await fetch(`${API_BASE_URL}/api/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': TEST_USER_ID
        },
        body: JSON.stringify(account)
      });

      if (!response.ok) throw new Error('Failed to create account');

      // 4. 成功后用真实数据替换临时数据
      const createdAccount = await response.json();
      set((state) => ({
        accounts: state.accounts.map((a) =>
          a.id === tempId ? createdAccount : a
        ),
        loading: false
      }));

      // 5. 刷新相关数据（目标进度等）
      await cacheService.remove(CACHE_KEYS.ACCOUNTS);
      await refreshAccountRelatedData();
    } catch (error) {
      // 6. 失败回滚：删除临时数据
      set((state) => ({
        accounts: state.accounts.filter((a) => a.id !== tempId),
        error: (error as Error).message,
        loading: false
      }));
      throw error;
    }
  },

  updateAccount: async (id, updates) => {
    // 1. 乐观更新：先保存旧数据用于回滚
    const oldAccounts = [...get().accounts];
    const oldSummary = get().totalSummary;

    // 2. 立即更新本地 state
    set((state) => ({
      accounts: state.accounts.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
      totalSummary: oldSummary ? {
        ...oldSummary,
        total: oldSummary.total + ((updates.balance || 0) - (oldAccounts.find(a => a.id === id)?.balance || 0))
      } : null,
      error: null
    }));

    // 3. 调用 API
    try {
      const response = await fetch(`${API_BASE_URL}/api/accounts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': TEST_USER_ID
        },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update account');

      // 刷新相关数据（目标进度等）
      await refreshAccountRelatedData();
    } catch (error) {
      // 4. 失败回滚
      set({ accounts: oldAccounts, totalSummary: oldSummary });
      throw error;
    }
  },

  deleteAccount: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/accounts/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': TEST_USER_ID }
      });
      if (!response.ok) throw new Error('Failed to delete account');
      await cacheService.remove(CACHE_KEYS.ACCOUNTS);
      // 刷新相关数据（目标进度等）
      await refreshAccountRelatedData();
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  }
}));
