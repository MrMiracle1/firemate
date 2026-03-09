# 数据模型：财务管理 App V1.0

**分支**：`001-finance-app`
**日期**：2026-03-08

---

## 1. 实体定义

### 1.1 Account (账户)

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | UUID | 是 | 主键 |
 UUID | 是 || user_id | 所属用户（外键关联 auth.users） |
| name | TEXT | 是 | 账户名称 |
| type | TEXT | 是 | 账户类型：cash, bank_card, third_party, investment, savings |
| balance | DECIMAL(15,2) | 是 | 当前余额 |
| icon | TEXT | 否 | 图标标识 |
| color | TEXT | 否 | 颜色值 |
| note | TEXT | 否 | 备注 |
| is_deleted | BOOLEAN | 是 | 软删除标记 |
| created_at | TIMESTAMPTZ | 是 | 创建时间 |
| updated_at | TIMESTAMPTZ | 是 | 更新时间 |

**关系**：
- 1:N Transaction (一个账户可对应多笔流水)
- 1:1 Goal (一个目标关联一个账户)
- N:1 User (多个账户属于一个用户)

---

### 1.2 Transaction (流水)

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | UUID | 是 | 主键 |
| user_id | UUID | 是 | 所属用户 |
| type | TEXT | 是 | 类型：income, expense, transfer |
| category_id | UUID | 是 | 分类（收入/支出时必填） |
| amount | DECIMAL(15,2) | 是 | 金额 |
| account_id | UUID | 是 | 账户（收入/支出时必填） |
| to_account_id | UUID | 否 | 目标账户（仅转账时使用） |
| date | DATE | 是 | 交易日期 |
| note | TEXT | 否 | 备注 |
| created_at | TIMESTAMPTZ | 是 | 创建时间 |

**关系**：
- N:1 Account (多笔流水属于一个账户)
- N:1 Category (多笔流水属于一个分类)

**状态转换**：无

---

### 1.3 Category (分类)

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | UUID | 是 | 主键 |
| user_id | UUID | 是 | 所属用户 |
| name | TEXT | 是 | 分类名称 |
| type | TEXT | 是 | 类型：expense, income |
| parent_id | UUID | 否 | 父分类 ID（二级分类） |
| icon | TEXT | 否 | 图标标识 |
| is_default | BOOLEAN | 是 | 是否为默认分类 |
| created_at | TIMESTAMPTZ | 是 | 创建时间 |

**关系**：
- 自关联：parent_id 指向自身（一级分类无父分类，二级分类指向一级）
- 1:N Transaction (一个分类可对应多笔流水)

---

### 1.4 Budget (预算)

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | UUID | 是 | 主键 |
| user_id | UUID | 是 | 所属用户 |
| amount | DECIMAL(15,2) | 是 | 预算金额 |
| month | DATE | 是 | 预算月份（格式：YYYY-MM-01） |
| modified_count | INTEGER | 是 | 当月修改次数 |
| last_modified_at | TIMESTAMPTZ | 否 | 最后修改时间 |
| created_at | TIMESTAMPTZ | 是 | 创建时间 |

**约束**：
- UNIQUE(user_id, month)：每个用户每月只能有一个预算

---

### 1.5 Goal (目标)

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | UUID | 是 | 主键 |
| user_id | UUID | 是 | 所属用户 |
| name | TEXT | 是 | 目标名称 |
| target_amount | DECIMAL(15,2) | 是 | 目标金额 |
| linked_account_id | UUID | 是 | 关联账户 |
| status | TEXT | 是 | 状态：active, achieved |
| created_at | TIMESTAMPTZ | 是 | 创建时间 |

**关系**：
- N:1 Account (目标关联一个账户)

---

## 2. 验证规则

### 2.1 账户验证

| 规则 | 说明 |
|------|------|
| name 非空 | 账户名称必填 |
| name 长度 | 1-50 字符 |
| type 枚举 | 必须是 cash, bank_card, third_party, investment, savings 之一 |
| balance 范围 | 无限制（允许负数如信用卡） |

### 2.2 流水验证

| 规则 | 说明 |
|------|------|
| type 枚举 | 必须是 income, expense, transfer 之一 |
| amount > 0 | 金额必须大于 0 |
| category_id | income/expense 时必填 |
| account_id | income/expense 时必填 |
| to_account_id | transfer 时必填，且不能与 account_id 相同 |
| date | 不能超过当前日期 |

### 2.3 预算验证

| 规则 | 说明 |
|------|------|
| amount > 0 | 预算金额必须大于 0 |
| modified_count ≤ 1 | 每月只能修改 1 次 |

### 2.4 目标验证

| 规则 | 说明 |
|------|------|
| name 非空 | 目标名称必填 |
| target_amount > 0 | 目标金额必须大于 0 |
| linked_account_id | 必须关联一个有效账户 |

---

## 3. 数据库表创建 SQL

```sql
-- 分类表（先创建，因为其他表依赖它）
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
  parent_id UUID REFERENCES categories(id),
  icon TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 账户表
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cash', 'bank_card', 'third_party', 'investment', 'savings')),
  balance DECIMAL(15,2) DEFAULT 0,
  icon TEXT,
  color TEXT,
  note TEXT,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 流水表
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  category_id UUID REFERENCES categories(id),
  amount DECIMAL(15,2) NOT NULL,
  account_id UUID REFERENCES accounts(id),
  to_account_id UUID REFERENCES accounts(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 预算表
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  amount DECIMAL(15,2) NOT NULL,
  month DATE NOT NULL,
  modified_count INTEGER DEFAULT 0,
  last_modified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- 目标表
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  target_amount DECIMAL(15,2) NOT NULL,
  linked_account_id UUID REFERENCES accounts(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'achieved')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "Users can access own categories" ON categories
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own accounts" ON accounts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own transactions" ON transactions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own budgets" ON budgets
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own goals" ON goals
  FOR ALL USING (auth.uid() = user_id);
```

---

## 4. 初始数据

### 4.1 默认支出分类（一级）

| 名称 | 图标 |
|------|------|
| 餐饮 | 🍜 |
| 交通 | 🚗 |
| 购物 | 🛒 |
| 居住 | 🏠 |
| 娱乐 | 🎬 |
| 医疗 | 💊 |
| 教育 | 📚 |
| 其他 | 📦 |

### 4.2 默认支出分类（二级）

| 父分类 | 子分类 |
|--------|--------|
| 餐饮 | 早餐, 午餐, 晚餐, 零食, 外卖 |
| 交通 | 公交, 地铁, 出租, 加油, 停车 |
| 购物 | 服装, 日用品, 电子产品 |
| 居住 | 房租, 水电, 物业 |
| 娱乐 | 电影, 游戏, 旅游 |
| 医疗 | 门诊, 药品, 保险 |
| 教育 | 培训, 书籍, 课程 |

### 4.3 默认收入分类

| 名称 | 图标 |
|------|------|
| 工资 | 💰 |
| 兼职 | 💼 |
| 投资 | 📈 |
| 其他 | 🎁 |
