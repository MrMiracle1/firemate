# 实施计划：账单增删改 V1.2

**分支**：`main` | **日期**：2026-03-11 | **规格**：[transaction-crud-design.md](./transaction-crud-design.md)

---

## 摘要

本次迭代主要解决账单增删改的体验问题和新需求：
- 分类数据存数据库，用户可自定义
- 详情页改为独立页面（非弹窗）
- 每个字段可点击编辑，独立弹窗
- 乐观更新 + 失败弹窗提示

---

## 技术上下文

| 项目 | 内容 |
|------|------|
| **语言/版本** | TypeScript 5.x, React Native (Expo) |
| **主要依赖** | Expo SDK 55+, Zustand 5.x, Supabase |
| **存储** | PostgreSQL (Supabase) + AsyncStorage (本地缓存) |
| **目标平台** | Android / iOS |
| **架构** | 前端分离 + Store + API Service 分离 |

---

## 项目结构

### 文档

```
specs/001-finance-app/
├── plan.md                      # 原有计划
├── plan-v1.1.md                # V1.1 计划
├── transaction-crud-design.md   # 设计规格（附录）
└── tasks-v1.2.md               # 本次任务清单（本文件）
```

### 源代码变更

```
firemate-app/
├── app/
│   ├── (tabs)/ledger.tsx            # 修改：交易列表
│   ├── (tabs)/index.tsx             # 修改：首页
│   ├── transaction/[id].tsx         # 新增：详情页
│   └── components/
│       ├── AmountEditor.tsx          # 新增：金额编辑弹窗
│       ├── CategoryEditor.tsx       # 新增：分类编辑弹窗
│       ├── AccountEditor.tsx         # 新增：账户编辑弹窗
│       ├── DateEditor.tsx           # 新增：日期编辑弹窗
│       ├── NoteEditor.tsx           # 新增：备注编辑弹窗
│       └── TypeEditor.tsx           # 新增：类型编辑弹窗
├── src/
│   ├── stores/
│   │   ├── transactionStore.ts      # 修改：乐观更新
│   │   ├── accountStore.ts          # 修改：乐观更新
│   │   └── categoryStore.ts        # 新增：分类 Store
│   ├── services/
│   │   ├── transactionApi.ts       # 新增：API Service
│   │   ├── accountApi.ts           # 新增：API Service
│   │   └── categoryApi.ts          # 新增：分类 API
│   └── types/index.ts              # 修改：添加类型
```

---

## 详细设计

### 1. 分类数据存储

- **分类存数据库**，用户可自定义（方案 C）
- 用户可新增、编辑分类
- 二级分类结构

### 2. 详情页

- **独立页面** `/transaction/[id]`
- 每个字段可点击编辑
- 数据从 Store 读取（不等待加载）

### 3. 编辑弹窗

6 个独立弹窗组件：
- **金额弹窗**：实时校验，>0，最多2位小数
- **分类弹窗**：网格列表，二级分类
- **账户弹窗**：水平滚动选择
- **日期弹窗**：日历选择器 + 时间（可选）
- **备注弹窗**：128字符限制
- **类型弹窗**：支出/收入/转账

### 4. 乐观更新流程

```
用户编辑 → 关闭弹窗 → 验证输入
    ↓
┌──────┴──────┐
↓              ↓
验证通过      验证失败
↓              ↓
更新Store   显示错误
+ API         不保存
↓
API失败 → 弹窗提示"是否重试"
```

### 5. 输入验证规则

| 字段 | 规则 | 错误提示 |
|------|------|----------|
| 金额 | >0，最多2位小数 | "金额必须大于0" |
| 日期 | ≤今天 | "日期不能超过今天" |
| 备注 | ≤128字符 | "备注不能超过128字符" |
| 账户 | 必选 | "请选择账户" |
| 分类 | 必选 | "请选择分类" |
| 转入账户 | 必选，不同 | "请选择转入账户" |

---

## 数据库变更

### 1. 创建分类表

```sql
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
```

### 2. 修改交易表

```sql
ALTER TABLE transactions ALTER COLUMN category_id TYPE text;
CREATE INDEX idx_transactions_category ON transactions(category_id);
```

---

## 实现计划

### Phase 1: 数据库变更
1. 创建分类表
2. 插入默认分类
3. 修改 transactions.category_id 类型

### Phase 2: API 层
1. 创建 categoryApi
2. 修改 transactionApi.update 支持部分字段更新

### Phase 3: Store 层
1. 新增 categoryStore
2. 修改 transactionStore 为乐观更新
3. 修改 accountStore 为乐观更新

### Phase 4: 组件层
1. 创建详情页 `/transaction/[id]`
2. 创建 6 个编辑弹窗组件
3. 修改 ledger.tsx 和 index.tsx 使用详情页

### Phase 5: 测试
1. 测试各字段编辑
2. 测试验证逻辑
3. 测试失败弹窗

---

## 复杂度跟踪

| 模块 | 复杂度 | 说明 |
|------|--------|------|
| 详情页 | 中 | 新页面 |
| 编辑弹窗 x6 | 中-高 | 6个组件 |
| 乐观更新 | 中 | Store 修改 |
| 分类数据库 | 中 | 数据库变更 |

---

## 下一步

执行 `/speckit.tasks` 生成任务清单。
