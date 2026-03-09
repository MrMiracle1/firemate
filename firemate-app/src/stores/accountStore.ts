import { create } from 'zustand';
import { Account, AssetSummary, AccountType } from '../types';
import { API_BASE_URL, TEST_USER_ID } from '../lib/supabase';

interface AccountState {
  accounts: Account[];
  totalSummary: AssetSummary | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchAccounts: () => Promise<void>;
  fetchTotalSummary: () => Promise<void>;
  createAccount: (account: Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateAccount: (id: string, updates: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
}

export const useAccountStore = create<AccountState>((set, get) => ({
  accounts: [],
  totalSummary: null,
  loading: false,
  error: null,

  fetchAccounts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/accounts`, {
        headers: { 'x-user-id': TEST_USER_ID }
      });
      if (!response.ok) throw new Error('Failed to fetch accounts');
      const accounts = await response.json();
      set({ accounts, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchTotalSummary: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/accounts/total/summary`, {
        headers: { 'x-user-id': TEST_USER_ID }
      });
      if (!response.ok) throw new Error('Failed to fetch summary');
      const totalSummary = await response.json();
      set({ totalSummary, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  createAccount: async (account) => {
    set({ loading: true, error: null });
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
      await get().fetchAccounts();
      await get().fetchTotalSummary();
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateAccount: async (id, updates) => {
    set({ loading: true, error: null });
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
      await get().fetchAccounts();
      await get().fetchTotalSummary();
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
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
      await get().fetchAccounts();
      await get().fetchTotalSummary();
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  }
}));
