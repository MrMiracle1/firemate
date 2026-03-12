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
    // 1. 生成临时 ID 用于乐观更新
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const tempGoal: Goal = {
      ...goal,
      id: tempId,
      user_id: TEST_USER_ID,
      created_at: new Date().toISOString(),
      status: 'active',
      progress: 0
    };

    // 2. 乐观更新：立即添加到列表
    set((state) => ({
      goals: [...state.goals, tempGoal],
      loading: true,
      error: null
    }));

    // 3. 调用 API
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

      // 4. 成功后用真实数据替换临时数据
      const createdGoal = await response.json();
      set((state) => ({
        goals: state.goals.map((g) =>
          g.id === tempId ? { ...createdGoal, progress: createdGoal.account ? (Number(createdGoal.account.balance) / Number(createdGoal.target_amount)) * 100 : 0 } : g
        ),
        loading: false
      }));
    } catch (error) {
      // 5. 失败回滚：删除临时数据
      set((state) => ({
        goals: state.goals.filter((g) => g.id !== tempId),
        error: (error as Error).message,
        loading: false
      }));
      throw error;
    }
  },

  updateGoal: async (id, updates) => {
    // 1. 保存旧数据用于回滚
    const oldGoals = [...get().goals];

    // 2. 乐观更新
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === id ? { ...g, ...updates } : g
      ),
      error: null
    }));

    // 3. 调用 API
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
      // 4. 失败回滚
      set({ goals: oldGoals, error: (error as Error).message, loading: false });
      throw error;
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
