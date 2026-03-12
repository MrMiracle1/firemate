-- =============================================
-- Phase 1: 数据库变更 SQL 脚本
-- 请在 Supabase SQL 编辑器中执行
-- =============================================

-- T001: 创建分类表
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
  parent_id UUID REFERENCES categories(id),
  icon TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- T002: 插入默认支出分类
INSERT INTO categories (name, type, icon, is_default) VALUES
('餐饮', 'expense', '🍜', true),
('交通', 'expense', '🚗', true),
('购物', 'expense', '🛒', true),
('居住', 'expense', '🏠', true),
('娱乐', 'expense', '🎬', true),
('医疗', 'expense', '💊', true),
('教育', 'expense', '📚', true),
('其他', 'expense', '📦', true);

-- 插入默认收入分类
INSERT INTO categories (name, type, icon, is_default) VALUES
('工资', 'income', '💰', true),
('兼职', 'income', '💼', true),
('投资', 'income', '📈', true),
('其他', 'income', '🎁', true);

-- T003: 修改transactions表category_id字段类型为TEXT（字符串ID）
ALTER TABLE transactions ALTER COLUMN category_id TYPE text;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);

-- T004: 开启RLS策略
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看自己的分类
CREATE POLICY "Users can view own categories" ON categories
  FOR SELECT USING (auth.uid() = user_id);

-- 创建策略：用户只能创建自己的分类
CREATE POLICY "Users can insert own categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 创建策略：用户只能更新自己的分类
CREATE POLICY "Users can update own categories" ON categories
  FOR UPDATE USING (auth.uid() = user_id);

-- 创建策略：用户只能删除自己的分类
CREATE POLICY "Users can delete own categories" ON categories
  FOR DELETE USING (auth.uid() = user_id);

-- 为测试用户创建默认分类（因为测试用户没有通过auth）
-- 注意：这只是临时方案，生产环境应该通过 trigger 处理
INSERT INTO categories (name, type, icon, is_default, user_id)
SELECT name, type, icon, is_default, '00000000-0000-0000-0000-000000000001'
FROM categories WHERE is_default = true
ON CONFLICT DO NOTHING;
