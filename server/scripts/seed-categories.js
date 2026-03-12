import { createClient } from '@supabase/supabase-js';

// 注意: 请在环境变量中设置这些值，不要硬编码
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedCategories() {
  console.log('开始插入默认分类...\n');

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

  // 先检查是否已有数据
  const { data: existing } = await supabase.from('categories').select('count');
  console.log('当前分类数量:', existing?.[0]?.count || 0);

  // 插入数据 (忽略已存在的)
  const { data, error } = await supabase
    .from('categories')
    .upsert(categories.map(c => ({ ...c, id: crypto.randomUUID() })), { onConflict: 'name,type' })
    .select();

  if (error) {
    console.log('插入错误:', error.message);
    // 尝试逐个插入
    console.log('\n尝试逐个插入...');
    for (const cat of categories) {
      const { error: e } = await supabase.from('categories').insert(cat).select();
      if (e && !e.message.includes('duplicate')) {
        console.log(`  ${cat.name}: ${e.message}`);
      } else {
        console.log(`  ${cat.name}: OK`);
      }
    }
  } else {
    console.log('批量插入成功!');
  }

  // 验证
  const { data: final } = await supabase.from('categories').select('*');
  console.log('\n最终分类数量:', final?.length || 0);
  if (final) {
    console.log('支出:', final.filter(c => c.type === 'expense').map(c => c.name).join(', '));
    console.log('收入:', final.filter(c => c.type === 'income').map(c => c.name).join(', '));
  }
}

seedCategories();
