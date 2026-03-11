import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

interface AuthState {
  userId: string | null;
  isAnonymous: boolean;
  isLoading: boolean;

  // Actions
  initializeAuth: () => Promise<void>;
  signInAnonymous: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// 生成随机 UUID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// 存储键
const USER_ID_KEY = 'firemate_user_id';
const IS_ANONYMOUS_KEY = 'firemate_is_anonymous';

export const useAuthStore = create<AuthState>((set, get) => ({
  userId: null,
  isAnonymous: true,
  isLoading: true,

  initializeAuth: async () => {
    set({ isLoading: true });
    try {
      // 从本地存储读取用户 ID
      const storedUserId = await AsyncStorage.getItem(USER_ID_KEY);
      const storedIsAnonymous = await AsyncStorage.getItem(IS_ANONYMOUS_KEY);

      if (storedUserId) {
        set({
          userId: storedUserId,
          isAnonymous: storedIsAnonymous === 'true',
          isLoading: false
        });
      } else {
        // 首次使用，创建匿名用户
        await get().signInAnonymous();
      }
    } catch (error) {
      console.error('Auth init error:', error);
      // 出错时使用默认测试用户
      set({
        userId: '00000000-0000-0000-0000-000000000001',
        isAnonymous: true,
        isLoading: false
      });
    }
  },

  signInAnonymous: async () => {
    const anonymousId = generateUUID();
    await AsyncStorage.setItem(USER_ID_KEY, anonymousId);
    await AsyncStorage.setItem(IS_ANONYMOUS_KEY, 'true');
    set({ userId: anonymousId, isAnonymous: true, isLoading: false });
  },

  signInWithEmail: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await AsyncStorage.setItem(USER_ID_KEY, data.user.id);
        await AsyncStorage.setItem(IS_ANONYMOUS_KEY, 'false');
        set({ userId: data.user.id, isAnonymous: false, isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signUpWithEmail: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await AsyncStorage.setItem(USER_ID_KEY, data.user.id);
        await AsyncStorage.setItem(IS_ANONYMOUS_KEY, 'false');
        set({ userId: data.user.id, isAnonymous: false, isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await supabase.auth.signOut();
      // 清除本地存储并创建新的匿名用户
      await get().signInAnonymous();
    } catch (error) {
      // 即使出错也重置为匿名
      await get().signInAnonymous();
    }
  },
}));

// 获取当前用户 ID 的辅助函数
export async function getCurrentUserId(): Promise<string> {
  const userId = await AsyncStorage.getItem(USER_ID_KEY);
  return userId || '00000000-0000-0000-0000-000000000001';
}
