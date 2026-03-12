import { create } from 'zustand';
import { Category } from '../types';
import { API_BASE_URL, TEST_USER_ID } from '../lib/supabase';
import { cacheService, CACHE_KEYS } from '../lib/cache';

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchCategories: (type?: 'expense' | 'income') => Promise<void>;
  createCategory: (category: Omit<Category, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getCategoriesByType: (type: 'expense' | 'income') => Category[];
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async (type?: 'expense' | 'income') => {
    set({ loading: true, error: null });

    try {
      let url = `${API_BASE_URL}/api/categories`;
      if (type) {
        url += `?type=${type}`;
      }

      const response = await fetch(url, {
        headers: { 'x-user-id': TEST_USER_ID }
      });

      if (!response.ok) throw new Error('Failed to fetch categories');

      const categories = await response.json();

      // 缓存数据
      await cacheService.set(CACHE_KEYS.CATEGORIES, categories);

      set({ categories, loading: false });
    } catch (error) {
      console.error('Error fetching categories:', error);
      // 网络错误时使用缓存
      const cached = await cacheService.get<Category[]>(CACHE_KEYS.CATEGORIES);
      if (cached) {
        set({ categories: cached, loading: false });
      } else {
        set({ error: (error as Error).message, loading: false });
      }
    }
  },

  createCategory: async (category) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': TEST_USER_ID
        },
        body: JSON.stringify(category)
      });
      if (!response.ok) throw new Error('Failed to create category');

      // 重新获取分类列表
      await get().fetchCategories();
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateCategory: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': TEST_USER_ID
        },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update category');

      // 重新获取分类列表
      await get().fetchCategories();
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  deleteCategory: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': TEST_USER_ID }
      });
      if (!response.ok) throw new Error('Failed to delete category');

      // 重新获取分类列表
      await get().fetchCategories();
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  getCategoriesByType: (type) => {
    return get().categories.filter(c => c.type === type);
  }
}));
