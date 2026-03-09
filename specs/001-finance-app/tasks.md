# 任务清单：财务管理 App V1.0

**输入**：来自 `/specs/001-finance-app/` 的设计文档
**前置条件**：plan.md、spec.md、data-model.md、research.md、quickstart.md

**测试**：spec.md 中未明确要求测试，本项目测试为可选

**组织方式**：任务按用户故事分组，每个故事可独立实现和测试

---

## 格式说明：`[编号] [可并行?] [所属故事] 描述`

- **[可并行?]**: 标记为 [P] 表示可并行执行（不同文件、无依赖）
- **[所属故事]**: 标记如 [US1]、[US2] 表示属于哪个用户故事
- 描述中需包含具体文件路径

---

## 第一阶段：项目初始化

**目的**：初始化前端和后端项目

- [ ] T001 根据 plan.md 创建项目目录结构
- [ ] T002 在 firemate-app/ 初始化 React Native (Expo) 项目
- [ ] T003 在 server/ 初始化 Node.js + Express 项目
- [ ] T004 [P] 为两个项目配置 TypeScript
- [ ] T005 [P] 配置 ESLint 和 Prettier
- [ ] T006 安装核心依赖（Zustand、Supabase 客户端、zod 等）

---

## 第二阶段：基础设施（数据库与后端）

**目的**：完成后才能开始实现任何用户故事

**⚠️ 关键**：此阶段未完成前无法开始用户故事开发

- [ ] T007 在 server/src/lib/supabase.ts 配置 Supabase 客户端
- [ ] T008 [P] 在 server/sql/schema.sql 创建数据库 schema
- [ ] T009 [P] 在 Supabase 执行数据库 schema
- [ ] T010 在 server/src/index.ts 创建 Express 服务器入口
- [ ] T011 配置环境变量处理（.env）
- [ ] T012 创建 API 路由结构（accounts、transactions、budgets、goals）
- [ ] T013 配置 Express 中间件（CORS、JSON 解析、错误处理）
- [ ] T014 在 firemate-app/src/types/index.ts 创建 TypeScript 类型定义
- [ ] T015 建立 Zustand 基础 stores 结构

**检查点**：基础设施就绪 - 用户故事可以开始并行开发

---

## 第三阶段：用户故事一 - 查看总资产（优先级：P1）🎯 MVP

**目标**：在首页显示总资产

**独立测试方法**：打开 App，验证总资产卡片显示所有账户余额之和

### 实现任务

- [ ] T016 [P] [US1] 在 firemate-app/src/types/index.ts 创建 Account 类型定义
- [ ] T017 [P] [US1] 在 server/src/types/account.ts 创建账户模型/API 响应类型
- [ ] T018 [US1] 在 server/src/services/accountService.ts 实现 accountService.getAll()
- [ ] T019 [US1] 在 server/src/routes/accounts.ts 创建 GET /api/accounts 接口
- [ ] T020 [US1] 在 firemate-app/src/stores/accountStore.ts 实现 accountStore
- [ ] T021 [US1] 在 firemate-app/src/components/TotalAssetsCard.tsx 创建总资产卡片组件
- [ ] T022 [US1] 在 firemate-app/src/app/(tabs)/index.tsx 构建首页总资产显示

**检查点**：用户故事一应可独立完整运行和测试

---

## 第四阶段：用户故事二 - 账户管理（优先级：P1）

**目标**：创建、编辑、删除、列表显示账户

**独立测试方法**：添加账户，验证出现在列表中，编辑它，删除它

### 实现任务

- [ ] T023 [P] [US2] 在 server/src/services/accountService.ts 实现 accountService.create()
- [ ] T024 [P] [US2] 在 server/src/services/accountService.ts 实现 accountService.update()
- [ ] T025 [P] [US2] 在 server/src/services/accountService.ts 实现 accountService.delete()
- [ ] T026 [US2] 在 server/src/routes/accounts.ts 创建 POST /api/accounts 接口
- [ ] T027 [US2] 在 server/src/routes/accounts.ts 创建 PUT /api/accounts/:id 接口
- [ ] T028 [US2] 在 server/src/routes/accounts.ts 创建 DELETE /api/accounts/:id 接口
- [ ] T029 [US2] 在 firemate-app/src/stores/accountStore.ts 更新 accountStore 的 CRUD 方法
- [ ] T030 [US2] 在 firemate-app/src/components/AccountCard.tsx 创建账户卡片组件
- [ ] T031 [US2] 在 firemate-app/src/components/AddAccountModal.tsx 创建添加账户弹窗组件
- [ ] T032 [US2] 在 firemate-app/src/app/(tabs)/accounts/index.tsx 构建账户列表页面
- [ ] T033 [US2] 添加账户类型分组显示（现金、银行卡等）

**检查点**：用户故事一和二应可独立运行

---

## 第五阶段：用户故事三 - 手动记账（优先级：P1）

**目标**：记录收入和支出交易

**独立测试方法**：创建收入/支出交易，验证出现在交易列表中且账户余额更新

### 实现任务

- [ ] T034 [P] [US3] 在 firemate-app/src/types/index.ts 创建 Transaction 类型定义
- [ ] T035 [P] [US3] 在 firemate-app/src/data/categories.json 创建默认分类数据
- [ ] T036 [P] [US3] 在 server/src/services/transactionService.ts 实现 transactionService.create()
- [ ] T037 [US3] 在 server/src/routes/transactions.ts 创建 POST /api/transactions 接口
- [ ] T038 [US3] 实现余额计算逻辑（收入 - 支出 + 转入 - 转出）
- [ ] T039 [US3] 在 firemate-app/src/stores/accountStore.ts 交易后更新账户余额
- [ ] T040 [US3] 在 firemate-app/src/components/TransactionItem.tsx 创建交易项组件
- [ ] T041 [US3] 在 firemate-app/src/components/CategoryPicker.tsx 创建分类选择器组件
- [ ] T042 [US3] 在 firemate-app/src/app/(tabs)/add.tsx 创建记账页面
- [ ] T043 [US3] 在首页添加最近交易列表

**检查点**：用户故事一、二、三应可独立运行

---

## 第六阶段：用户故事四 - 内部转账（优先级：P2）

**目标**：在账户之间转账，不计入收支统计

**独立测试方法**：创建转账，验证两个账户余额都正确更新，无收入/支出记录

### 实现任务

- [ ] T044 [P] [US4] 在 transactionService.create() 中添加转账类型处理
- [ ] T045 [US4] 创建转账专用验证（to_account_id 不能等于 account_id）
- [ ] T046 [US4] 在记账页面添加转账选项
- [ ] T047 [US4] 转账时更新两个账户的余额

**检查点**：用户故事四与二、三集成但可独立测试

---

## 第七阶段：用户故事五 - 预算管理（优先级：P2）

**目标**：设置月度预算并追踪消费进度

**独立测试方法**：设置预算，记录支出，验证进度条更新并显示正确颜色（绿/橙/红）

### 实现任务

- [ ] T048 [P] [US5] 在 firemate-app/src/types/index.ts 创建 Budget 类型定义
- [ ] T049 [P] [US5] 在 server/src/services/budgetService.ts 实现预算服务
- [ ] T050 [US5] 在 server/src/routes/budgets.ts 创建预算 API 路由
- [ ] T051 [US5] 实现每月修改次数限制（每月最多1次）
- [ ] T052 [US5] 在 firemate-app/src/stores/budgetStore.ts 创建预算 store
- [ ] T053 [US5] 在 firemate-app/src/components/BudgetProgress.tsx 创建预算进度组件
- [ ] T054 [US5] 在首页添加预算显示
- [ ] T055 [US5] 在 firemate-app/src/app/(tabs)/more/budget.tsx 创建预算设置页面

**检查点**：用户故事五与三集成但可独立测试

---

## 第八阶段：用户故事六 - 报表可视化（优先级：P3）

**目标**：消费分析可视化图表

**独立测试方法**：查看饼图（支出分类）、折线图（月度趋势）、条形图（账户余额）

### 实现任务

- [ ] T056 [P] [US6] 在 server/src/routes/reports.ts 创建报表 API 接口
- [ ] T057 [P] [US6] 实现按分类聚合支出查询
- [ ] T058 [P] [US6] 实现月度趋势聚合查询
- [ ] T059 [US6] 安装 react-native-gifted-charts
- [ ] T060 [US6] 创建支出分类饼图组件
- [ ] T061 [US6] 创建月度趋势折线图组件
- [ ] T062 [US6] 创建账户余额条形图组件
- [ ] T063 [US6] 在 firemate-app/src/app/(tabs)/more/reports.tsx 构建报表页面（带 Tab 切换）

**检查点**：所有用户故事应可独立运行

---

## 第九阶段：用户故事七 - 目标储蓄（优先级：P3）

**目标**：创建储蓄目标并关联账户

**独立测试方法**：创建目标，验证进度条随关联账户余额变化而更新

### 实现任务

- [ ] T064 [P] [US7] 在 firemate-app/src/types/index.ts 创建 Goal 类型定义
- [ ] T065 [P] [US7] 在 server/src/services/goalService.ts 实现目标服务
- [ ] T066 [US7] 在 server/src/routes/goals.ts 创建目标 API 路由
- [ ] T067 [US7] 实现自动状态更新（达到目标金额时从 active 变为 achieved）
- [ ] T068 [US7] 在 firemate-app/src/stores/goalStore.ts 创建目标 store
- [ ] T069 [US7] 在 firemate-app/src/components/GoalCard.tsx 创建目标卡片组件
- [ ] T070 [US7] 在 firemate-app/src/app/(tabs)/more/goals.tsx 构建目标页面
- [ ] T071 [US7] 处理关联账户被删除时的目标重关联

---

## 第十阶段：收尾与跨领域优化

**目的**：影响多个用户故事的改进

- [ ] T072 [P] 在前端和后端使用 zod 添加表单验证
- [ ] T073 [P] 实现 AsyncStorage 缓存支持离线
- [ ] T074 添加加载状态和错误处理 UI
- [ ] T075 实现匿名认证流程
- [ ] T076 添加邮箱注册/登录流程
- [ ] T077 优化性能（分页、懒加载）
- [ ] T078 更新文档（README、quickstart.md）
- [ ] T079 全用户故事集成测试

---

## 依赖关系与执行顺序

### 阶段依赖

- **第一阶段（初始化）**：无依赖，可立即开始
- **第二阶段（基础设施）**：依赖第一阶段完成 - 阻塞所有用户故事
- **用户故事阶段（第三至九）**：全部依赖第二阶段完成
  - 用户故事可以并行进行（如有人力）
  - 或按优先级顺序进行（P1 → P2 → P3）
- **第十阶段（收尾）**：依赖所有用户故事完成

### 用户故事依赖

- **US1 查看总资产（P1）**：第二阶段后可开始 - 无需依赖其他故事
- **US2 账户管理（P1）**：第二阶段后可开始 - US1 数据需要但可独立测试
- **US3 手动记账（P1）**：第二阶段 + US2 后可开始 - 需要账户存在
- **US4 内部转账（P2）**：第二阶段 + US2 + US3 后可开始 - 需要账户和交易
- **US5 预算管理（P2）**：第二阶段 + US3 后可开始 - 需要交易数据
- **US6 报表可视化（P3）**：第二阶段 + US3 后可开始 - 需要交易数据
- **US7 目标储蓄（P3）**：第二阶段 + US2 后可开始 - 需要账户

### 各用户故事内部

- 模型/类型 → 服务
- 服务 → 路由
- 后端 API → 前端集成
- 核心实现 → 优化

### 并行机会

- 第一阶段：T001-T006 可并行执行
- 第二阶段：T007-T015 可并行执行（T008 必须在 T009 之前完成）
- 第二阶段完成后，所有 P1 用户故事可并行开始：
  - 开发人员 A：US1（总资产）
  - 开发人员 B：US2（账户管理）
  - 开发人员 C：US3（记账）

---

## 执行策略

### MVP 优先（仅用户故事一至三）

1. 完成第一阶段：初始化
2. 完成第二阶段：基础设施（关键 - 阻塞所有故事）
3. 完成第三阶段：US1 - 总资产
4. **暂停并验证**：独立测试 US1
5. 完成第四阶段：US2 - 账户管理
6. **暂停并验证**：独立测试 US2
7. 完成第五阶段：US3 - 手动记账
8. **暂停并验证**：独立测试 US3（MVP 完成！）

### 增量交付

1. 初始化 + 基础设施 → 基础就绪
2. 添加 US1 → 测试 → 部署（显示总资产）
3. 添加 US2 → 测试 → 部署（可管理账户）
4. 添加 US3 → 测试 → 部署（可记账 - MVP！）
5. 添加 US4-US7 → 测试 → 部署（完整 V1.0）

### 团队并行策略

多名开发人员时：

1. 团队共同完成第一阶段 + 第二阶段
2. 第二阶段完成后：
   - 开发人员 A：US1 + US2（紧密相关 - 都关于账户）
   - 开发人员 B：US3 + US4（交易相关）
   - 开发人员 C：US5 + US6 + US7（分析功能）
3. 各故事独立完成和集成

---

## 总结

| 指标 | 数值 |
|------|------|
| **总任务数** | 79 |
| **第一阶段：初始化** | 6 个任务 |
| **第二阶段：基础设施** | 9 个任务 |
| **第三阶段：US1（总资产）** | 7 个任务 |
| **第四阶段：US2（账户管理）** | 11 个任务 |
| **第五阶段：US3（记账）** | 10 个任务 |
| **第六阶段：US4（转账）** | 4 个任务 |
| **第七阶段：US5（预算）** | 8 个任务 |
| **第八阶段：US6（报表）** | 8 个任务 |
| **第九阶段：US7（目标）** | 8 个任务 |
| **第十阶段：收尾** | 8 个任务 |
| **可并行任务数** | 约 40 个（标记 [P]） |
| **MVP 范围** | 用户故事一至三（第三至五阶段） |

**独立测试标准**：
- US1：打开 App → 看到总资产卡片显示正确总和
- US2：添加账户 → 出现在列表中 → 编辑 → 删除
- US3：记录收入/支出 → 出现在交易列表中 → 余额更新
- US4：账户间转账 → 两个余额正确更新
- US5：设置预算 → 记录支出 → 进度条显示正确颜色
- US6：查看报表 → 三个图表正确渲染数据
- US7：创建目标 → 进度随账户余额变化更新
