# 实施计划：财务管理 App V1.0

**分支**：`001-finance-app` | **日期**：2026-03-07 | **规格**：[spec.md](./spec.md)

**输入**：来自 `/specs/001-finance-app/spec.md` 的功能规格

---

## 摘要

财务管理 App V1.0 是产品的首个版本，重点在于整体基础架构的搭建。核心功能包括：账户管理、手动记账、内部转账、首页仪表盘、预算管理、报表可视化、目标储蓄。采用 React Native (Expo) + Node.js 后端 + Supabase (PostgreSQL + Auth) 技术栈，实现前后端分离架构。

---

## 技术上下文

| 项目 | 内容 |
|------|------|
| **语言/版本** | TypeScript 5.x, Node.js 20+ |
| **主要依赖** | Expo SDK 52+, Zustand 5.x, Supabase, react-native-gifted-charts, zod |
| **存储** | PostgreSQL (Supabase) + AsyncStorage (本地缓存) |
| **测试** | Jest, React Native Testing Library |
| **目标平台** | Android 优先 (SDK 21+), iOS 扩展 (12.0+) |
| **项目类型** | 移动端 App (Mobile App) |
| **架构** | 前后端分离 (Frontend + Backend) |
| **性能目标** | 页面加载 < 2s, 记账操作 < 500ms, 图表渲染 < 1s |
| **约束** | 离线可用、云端同步可选、RLS 行级安全 |
| **规模/范围** | 约 15+ 页面、5 张数据库表、7 个核心功能模块 |

---

## 章程检查

### GATE: 必须在 Phase 0 研究前通过

| 章程原则 | 检查结果 | 说明 |
|----------|----------|------|
| I. 迭代式开发 | ✅ 通过 | V1.0 作为独立可测试的迭代周期 |
| II. 移动优先 | ✅ 通过 | Android 优先开发 |
| III. AI 能力可插拔 | ✅ 通过 | 架构支持多 Provider（V2.0 考虑） |
| IV. 渐进式功能开发 | ✅ 通过 | 优先核心记账功能，逐步扩展 |
| V. 数据本地优先 | ✅ 通过 | 支持匿名登录本地模式 + 邮箱注册云端模式 |
| VI. 分类层级支持 | ✅ 通过 | 支持二级分类 |

**结论**：所有章程检查通过，无需复杂度过跟踪。

---

## 项目结构

### 文档（本次迭代）

```
specs/001-finance-app/
├── plan.md              # 本文件
├── research.md          # Phase 0 研究结果
├── data-model.md        # Phase 1 数据模型
├── quickstart.md        # Phase 1 快速开始指南
├── contracts/           # Phase 1 接口契约（本项目为移动端应用，无外部接口）
├── tasks.md             # Phase 2 任务清单
├── spec.md              # 功能规格
└── tech.md              # 技术方案
```

### 源代码（项目根目录）

```
firemate-app/                    # React Native App (Expo)
├── app/                        # Expo Router 页面
│   ├── (tabs)/                # 底部标签页
│   │   ├── _layout.tsx
│   │   ├── index.tsx          # 首页/仪表盘
│   │   ├── add.tsx            # 记一笔
│   │   ├── accounts/           # 账户管理
│   │   └── more/               # 更多（报表、预算、目标、设置）
│   └── +layout.tsx             # 根布局
├── components/                  # 通用组件
│   ├── AccountCard.tsx
│   ├── TransactionItem.tsx
│   ├── BudgetProgress.tsx
│   ├── GoalCard.tsx
│   ├── CategoryPicker.tsx
│   └── common/                 # 基础组件（Button, Input, Modal）
├── stores/                     # Zustand 状态管理
│   ├── accountStore.ts
│   ├── transactionStore.ts
│   ├── budgetStore.ts
│   └── goalStore.ts
├── services/                    # 业务服务层
│   ├── accountService.ts
│   ├── transactionService.ts
│   ├── budgetService.ts
│   └── goalService.ts
├── lib/                        # 工具库
│   ├── supabase.ts             # Supabase 客户端
│   ├── constants.ts             # 常量定义
│   └── utils.ts                 # 工具函数
├── types/                      # TypeScript 类型定义
│   └── index.ts
├── data/                       # 初始数据
│   └── categories.json          # 默认分类数据
├── tests/                      # 测试文件
└── package.json

server/                         # Node.js 后端
├── src/
│   ├── routes/                 # API 路由
│   │   ├── accounts.ts         # 账户相关 API
│   │   ├── transactions.ts    # 流水相关 API
│   │   ├── budgets.ts         # 预算相关 API
│   │   └── goals.ts           # 目标相关 API
│   ├── services/               # 业务逻辑
│   │   ├── accountService.ts
│   │   └── transactionService.ts
│   ├── lib/                    # 工具库
│   │   └── supabase.ts        # Supabase 客户端
│   └── index.ts                # 入口文件
└── package.json

supabase/                       # Supabase 配置
└── config/
    └── config.ts               # 项目配置（数据库连接信息）
```

**结构决策**：采用 Expo Router 文件路由 + Zustand 状态管理 + Service 层分离的前后端分离架构。Node.js 后端处理业务逻辑，Supabase 提供数据库和认证服务。

---

## Phase 0: 研究与决策

### 研究主题

| 主题 | 决策 | 理由 |
|------|------|------|
| 跨平台框架 | React Native (Expo) | 成熟稳定，文档完善，Expo 简化构建流程 |
| 状态管理 | Zustand | 轻量级，TypeScript 支持好，与 React Native 兼容 |
| 数据库 | Supabase (PostgreSQL) | 开源替代 Firebase，RLS 安全性好 |
| 本地缓存 | AsyncStorage | Expo 原生支持，简单可靠 |
| 图表库 | react-native-gifted-charts | 轻量，支持饼图、折线图、条形图 |
| 表单验证 | zod | TypeScript 原生支持，类型安全 |

### 研究结果

详细研究结果见 [research.md](./research.md)。

---

## Phase 1: 设计与契约

### 数据模型

详细数据模型见 [data-model.md](./data-model.md)。

**核心实体**：

| 实体 | 主要字段 | 关系 |
|------|----------|------|
| Account | id, name, type, balance, icon, color, note | 1:N Transaction, 1:1 Goal |
| Transaction | id, type, category_id, amount, account_id, date, note | N:1 Account, N:1 Category |
| Budget | id, amount, month, modified_count | 1:1 User |
| Goal | id, name, target_amount, linked_account_id, status | N:1 Account |
| Category | id, name, type, parent_id, icon | 1:N Transaction, 自关联 |

### 快速开始

详细快速开始指南见 [quickstart.md](./quickstart.md)。

---

## 复杂度跟踪

> 无复杂度违规。所有章程检查通过。

---

## 下一步

Phase 2：执行 `/speckit.tasks` 生成任务清单。
