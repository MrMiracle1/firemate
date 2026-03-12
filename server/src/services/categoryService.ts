import { supabase } from '../lib/supabase';

export interface Category {
  id?: string;
  user_id: string;
  name: string;
  type: 'expense' | 'income';
  parent_id?: string;
  icon?: string;
  is_default?: boolean;
  created_at?: string;
}

export const categoryService = {
  // 获取用户的所有分类（包括默认分类）
  async getAll(userId: string): Promise<Category[]> {
    // 如果 userId 不是有效的 UUID，只返回默认分类
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

    let query = supabase.from('categories').select('*');

    if (isValidUUID) {
      query = query.or(`user_id.eq.${userId},is_default.eq.true`);
    } else {
      query = query.eq('is_default', true);
    }

    const { data, error } = await query.order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // 获取分类（支持 type 过滤）
  async getByType(userId: string, type: 'expense' | 'income'): Promise<Category[]> {
    // 如果 userId 不是有效的 UUID，只返回默认分类
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

    let query = supabase.from('categories').select('*').eq('type', type);

    if (isValidUUID) {
      query = query.or(`user_id.eq.${userId},is_default.eq.true`);
    } else {
      query = query.eq('is_default', true);
    }

    const { data, error } = await query.order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // 创建分类
  async create(userId: string, category: Omit<Category, 'id' | 'user_id' | 'created_at'>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert({ ...category, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 更新分类
  async update(userId: string, id: string, updates: Partial<Category>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 删除分类
  async delete(userId: string, id: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  },

  // 获取单个分类
  async getById(userId: string, id: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  }
};
