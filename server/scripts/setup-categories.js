const { createClient } = require('@supabase/supabase-js');

// 注意: 请在环境变量中设置这些值，不要硬编码
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

async function setup() {
  console.log('=== 开始设置数据库 ===\n');

  // 1. 检查 categories 表是否存在
  console.log('1. 检查 categories 表...');
  try {
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'categories');

    if (!tables || tables.length === 0) {
      console.log('   categories 表不存在，需要创建');
      console.log('\n   ⚠️ 请在 Supabase Dashboard SQL 编辑器执行以下 SQL:\n');
      console.log(`
-- 创建分类表
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
  parent_id UUID REFERENCES categories(id),
  icon TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 插入默认分类
INSERT INTO categories (name, type, icon, is_default) VALUES
('餐饮', 'expense', '🍜', true),
('交通', 'expense', '🚗', true),
('购物', 'expense', '🛒', true),
('居住', 'expense', '🏠', true),
('娱乐', 'expense', '🎬', true),
('医疗', 'expense', '💊', true),
('教育', 'expense', '📚', true),
('其他', 'expense', '📦', true),
('工资', 'income', '💰', true),
('兼职', 'income', '💼', true),
('投资', 'income', '📈', true),
('其他', 'income', '🎁', true);

-- 修改 transactions 表
ALTER TABLE transactions ALTER COLUMN category_id TYPE text;
CREATE INDEX idx_transactions_category ON transactions(category_id);

-- 开启 RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
      `);
      console.log('\n   执行完成后告诉我，我会继续插入测试数据\n');
      return;
    } else {
      console.log('   categories 表已存在\n');
    }
  } catch (e) {
    console.log('   检查表错误:', e.message);
  }

  // 2. 插入默认分类
  console.log('2. 插入默认分类...');
  const categories = [
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

  // 先清空现有数据
  await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // 插入新数据
  const { error: insertError } = await supabase
    .from('categories')
    .insert(categories);

  if (insertError) {
    console.log('   插入错误:', insertError.message);
  } else {
    console.log('   分类插入成功\n');
  }

  // 3. 检查分类数据
  console.log('3. 验证分类数据...');
  const { data: existingCats, error: fetchError } = await supabase
    .from('categories')
    .select('*');

  if (fetchError) {
    console.log('   获取分类错误:', fetchError.message);
  } else {
    console.log(`   已有 ${existingCats.length} 条分类数据`);
    console.log('   支出:', existingCats.filter(c => c.type === 'expense').map(c => c.name).join(', '));
    console.log('   收入:', existingCats.filter(c => c.type === 'income').map(c => c.name).join(', '));
  }

  console.log('\n=== 数据库设置完成 ===');
}

setup().catch(console.error);
