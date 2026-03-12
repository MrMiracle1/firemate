import { Router, Request, Response } from 'express';
import { categoryService } from '../services/categoryService';
import { supabase } from '../lib/supabase';

const router = Router();

// Seed default categories (development only)
router.post('/seed', async (req: Request, res: Response) => {
  try {
    const defaultCategories = [
      { name: '餐饮', type: 'expense', icon: '🍜', is_default: true },
      { name: '交通', type: 'expense', icon: '🚗', is_default: true },
      { name: '购物', type: 'expense', icon: '🛒', is_default: true },
      { name: '居住', type: 'expense', icon: '🏠', is_default: true },
      { name: '娱乐', type: 'expense', icon: '🎬', is_default: true },
      { name: '医疗', type: 'expense', icon: '💊', is_default: true },
      { name: '教育', type: 'expense', icon: '📚', is_default: true },
      { name: '其他', type: 'expense', icon: '📦', is_default: true },
      { name: '工资', type: 'income', icon: '💰', is_default: true },
      { name: '兼职', type: 'income', icon: '💼', is_default: true },
      { name: '投资', type: 'income', icon: '📈', is_default: true },
      { name: '其他', type: 'income', icon: '🎁', is_default: true },
    ];

    // 先删除现有默认分类
    await supabase.from('categories').delete().eq('is_default', true);

    // 插入新数据
    const { data, error } = await supabase.from('categories').insert(defaultCategories).select();

    if (error) throw error;

    res.json({ success: true, count: data?.length || 0 });
  } catch (error: any) {
    console.error('Error seeding categories:', error);
    res.status(500).json({ error: error.message || 'Failed to seed categories' });
  }
});

// 获取所有分类（可选 type 过滤）
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { type } = req.query;
    let categories;

    if (type === 'expense' || type === 'income') {
      categories = await categoryService.getByType(userId, type);
    } else {
      categories = await categoryService.getAll(userId);
    }

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// 获取单个分类
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const categoryId = Array.isArray(id) ? id[0] : id;
    const category = await categoryService.getById(userId, categoryId);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// 创建分类
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, type, parent_id, icon } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    if (!['expense', 'income'].includes(type)) {
      return res.status(400).json({ error: 'Type must be expense or income' });
    }

    const category = await categoryService.create(userId, {
      name,
      type,
      parent_id,
      icon,
      is_default: false
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// 更新分类
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const categoryId = Array.isArray(id) ? id[0] : id;
    const { name, icon, parent_id } = req.body;

    const category = await categoryService.update(userId, categoryId, {
      name,
      icon,
      parent_id
    });

    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// 删除分类
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const categoryId = Array.isArray(id) ? id[0] : id;
    await categoryService.delete(userId, categoryId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;
