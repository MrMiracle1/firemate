# 任务清单：账单增删改 V1.2

**分支**：`main` | **日期**：2026-03-11 | **计划**：[plan-v1.2.md](./plan-v1.2.md)

---

## 摘要

| 项目 | 数量 |
|------|------|
| 总任务数 | 42 |
| 用户故事数 | 3 |
| 可并行任务 | 18 |

---

## 用户故事

### US1: 详情页独立页面
用户点击交易进入详情页，可以查看和编辑每一笔交易的详细信息

**优先级**: P1
**测试标准**: 点击交易进入详情页，详情页显示完整信息，点击任意字段可编辑

### US2: 字段编辑弹窗
每个字段（金额、分类、账户、日期、备注、类型）有独立的编辑弹窗，支持即时保存

**优先级**: P1
**测试标准**: 点击每个字段弹出对应编辑弹窗，保存后数据更新，前端有反馈

### US3: 分类数据库存储
分类数据存储在数据库中，用户可自定义分类

**优先级**: P2
**测试标准**: 分类从数据库加载，用户可新增/编辑分类，后端API正常

---

## 依赖关系图

```
Phase 1: 数据库变更
    │
    ├── T001 创建分类表
    ├── T002 插入默认分类
    ├── T003 修改transactions.category_id类型
    └── T004 开启RLS策略

Phase 2: 后端API
    │
    ├── T005 [P] 创建分类路由 categories.ts
    ├── T006 [P] 创建分类Service
    ├── T007 修改交易更新API支持部分字段
    ├── T008 创建分类API: GET /api/categories
    ├── T009 创建分类API: POST /api/categories
    ├── T010 创建分类API: PUT /api/categories/:id
    └── T011 创建分类API: DELETE /api/categories/:id

Phase 3: 前端Store
    │
    ├── T012 [P] 新建categoryStore.ts
    ├── T013 修改transactionStore乐观更新
    ├── T014 [P] 修改accountStore乐观更新
    └── T015 添加验证工具函数

Phase 4: 详情页
    │
    ├── T016 [P] 创建详情页路由 transaction/[id].tsx
    ├── T017 详情页加载逻辑（从store读取）
    ├── T018 详情页UI布局（各字段可点击）
    └── T019 添加返回按钮

Phase 5: 编辑弹窗组件
    │
    ├── T020 [P] AmountEditor金额编辑弹窗（含校验）
    ├── T021 [P] CategoryEditor分类编辑弹窗
    ├── T022 [P] AccountEditor账户编辑弹窗
    ├── T023 DateEditor日期编辑弹窗（含日历）
    ├── T024 NoteEditor备注编辑弹窗（128字符）
    └── T025 TypeEditor类型编辑弹窗

Phase 6: 集成与前后端联调
    │
    ├── T026 前后端联调: 分类API测试
    ├── T027 前后端联调: 交易更新API测试
    ├── T028 前后端联调: 详情页加载测试
    ├── T029 前后端联调: 金额编辑测试
    ├── T030 前后端联调: 分类编辑测试
    ├── T031 前后端联调: 账户编辑测试
    ├── T032 前后端联调: 日期编辑测试
    ├── T033 前后端联调: 备注编辑测试
    └── T034 前后端联调: 类型编辑测试

Phase 7: 验证与失败处理测试
    │
    ├── T035 测试: 金额<=0 显示错误提示
    ├── T036 测试: 日期选择未来日期提示
    ├── T037 测试: 备注超过128字符提示
    ├── T038 测试: 未选择账户提示
    ├── T039 测试: 未选择分类提示（支出/收入）
    ├── T040 测试: API失败弹窗提示"是否重试"
    └── T041 测试: 网络离线提示

Phase 8: 收尾与清理
    │
    ├── T042 [P] 删除旧的transaction-detail-modal.tsx
    ├── T043 [P] 更新ledger.tsx跳转到详情页
    ├── T044 更新index.tsx跳转到详情页
    └── T045 清理所有console.log调试代码

Phase 9: 分类自定义功能
    │
    ├── T046 分类列表页面（新建分类）
    ├── T047 分类编辑功能
    ├── T048 分类删除功能
    └── T049 前后端联调: 分类CRUD测试
```

---

## Phase 1: 数据库变更

**目标**: 创建分类表和修改交易表

### 任务

- [ ] T001 在Supabase创建categories表，字段：id(UUID), user_id(UUID), name(TEXT), type(TEXT), parent_id(UUID), icon(TEXT), is_default(BOOLEAN), created_at(TIMESTAMPTZ)
  - 文件: Supabase Dashboard
- [ ] T002 插入默认支出分类（餐饮、交通、购物、居住、娱乐、医疗、教育、其他）和收入分类（工资、兼职、投资、其他）
  - 文件: Supabase Dashboard
- [ ] T003 修改transactions表category_id字段类型为TEXT，创建索引idx_transactions_category
  - 文件: Supabase Dashboard
- [ ] T004 为categories表开启RLS策略
  - 文件: Supabase Dashboard

---

## Phase 2: 后端API

**目标**: 创建分类API和修改交易API

### 任务

- [ ] T005 [P] 创建分类路由 server/src/routes/categories.ts
  - 文件: server/src/routes/categories.ts
  - 依赖: T001
- [ ] T006 [P] 创建分类Service server/src/services/categoryService.ts
  - 文件: server/src/services/categoryService.ts
  - 依赖: T001
- [ ] T007 修改server/src/routes/transactions.ts的PUT方法，支持部分字段更新（不要求所有字段）
  - 文件: server/src/routes/transactions.ts
  - 依赖: T003
- [ ] T008 实现GET /api/categories分类列表API
  - 文件: server/src/routes/categories.ts
  - 依赖: T005, T006
- [ ] T009 实现POST /api/categories新建分类API
  - 文件: server/src/routes/categories.ts
  - 依赖: T005, T006
- [ ] T010 实现PUT /api/categories/:id更新分类API
  - 文件: server/src/routes/categories.ts
  - 依赖: T005, T006
- [ ] T011 实现DELETE /api/categories/:id删除分类API
  - 文件: server/src/routes/categories.ts
  - 依赖: T005, T006

---

## Phase 3: 前端Store

**目标**: 创建分类Store和修改交易/账户Store

### 任务

- [ ] T012 [P] 新建firemate-app/src/stores/categoryStore.ts，包含categories状态和fetchCategories方法
  - 文件: firemate-app/src/stores/categoryStore.ts
  - 依赖: T008
- [ ] T013 修改firemate-app/src/stores/transactionStore.ts的updateTransaction方法为乐观更新：先更新本地state，再发API，失败回滚
  - 文件: firemate-app/src/stores/transactionStore.ts
  - 依赖: T007
- [ ] T014 [P] 修改firemate-app/src/stores/accountStore.ts的updateAccount方法为乐观更新
  - 文件: firemate-app/src/stores/accountStore.ts
- [ ] T015 添加验证工具函数：金额校验、日期校验、备注长度校验
  - 文件: firemate-app/src/lib/validation.ts
  - 依赖: plan-v1.2.md验证规则

---

## Phase 4: 详情页

**目标**: 创建详情页独立页面

### 任务

- [ ] T016 [P] 新建firemate-app/app/transaction/[id].tsx动态路由详情页
  - 文件: firemate-app/app/transaction/[id].tsx
- [ ] T017 详情页useEffect中从store读取交易数据（不等待加载）
  - 文件: firemate-app/app/transaction/[id].tsx
  - 依赖: T013
- [ ] T018 [P] 详情页UI布局：金额大字体、分类行、账户行、日期行、备注行、类型行，点击各行触发编辑
  - 文件: firemate-app/app/transaction/[id].tsx
- [ ] T019 添加详情页返回按钮，点击返回列表页
  - 文件: firemate-app/app/transaction/[id].tsx

---

## Phase 5: 编辑弹窗组件

**目标**: 创建6个独立编辑弹窗组件

### 任务

- [ ] T020 [P] 创建AmountEditor.tsx：金额输入框+数字键盘，类型切换（支出/收入/转账），实时校验>0，最多2位小数，保存按钮
  - 文件: firemate-app/app/components/AmountEditor.tsx
  - 依赖: T015, T018
- [ ] T021 [P] 创建CategoryEditor.tsx：分类网格列表（一级+二级），支持选择
  - 文件: firemate-app/app/components/CategoryEditor.tsx
  - 依赖: T012, T018
- [ ] T022 [P] 创建AccountEditor.tsx：账户水平滚动选择，支持转出/转入账户
  - 文件: firemate-app/app/components/AccountEditor.tsx
  - 依赖: T014, T018
- [ ] T023 创建DateEditor.tsx：日历选择器视图，选择年月日后选择时间（可选），快捷按钮（今天/昨天），验证不能选择未来日期
  - 文件: firemate-app/app/components/DateEditor.tsx
  - 依赖: T015, T018
- [ ] T024 创建NoteEditor.tsx：多行文本输入，实时显示字数0/128，超过128字符阻止输入并提示
  - 文件: firemate-app/app/components/NoteEditor.tsx
  - 依赖: T015, T018
- [ ] T025 创建TypeEditor.tsx：支出/收入/转账三选一，显示说明文字
  - 文件: firemate-app/app/components/TypeEditor.tsx
  - 依赖: T018

---

## Phase 6: 前后端联调

**目标**: 测试所有前后端交互

### 任务

- [ ] T026 前后端联调: 分类API测试 - GET /api/categories 返回分类列表
  - 依赖: T008
  - 测试命令: curl http://111.229.145.143:3000/api/categories -H "x-user-id: xxx"
- [ ] T027 前后端联调: 交易更新API测试 - PUT /api/transactions/:id 只传一个字段
  - 依赖: T007
  - 测试命令: curl -X PUT http://111.229.145.143:3000/api/transactions/:id -d '{"amount": 100}'
- [ ] T028 前后端联调: 详情页加载测试 - 打开详情页能看到数据
  - 依赖: T016, T017
  - 测试: 浏览器访问 http://localhost:8081/transaction/[id]
- [ ] T029 前后端联调: 金额编辑测试 - 修改金额，保存，刷新后数据正确
  - 依赖: T020
  - 测试: 点击金额，修改为200，保存，验证数据库和页面
- [ ] T030 前后端联调: 分类编辑测试 - 选择分类，保存，刷新后分类正确
  - 依赖: T021
  - 测试: 点击分类，选择"餐饮"，保存
- [ ] T031 前后端联调: 账户编辑测试 - 选择账户，保存，刷新后正确
  - 依赖: T022
  - 测试: 点击账户，选择"支付宝"，保存
- [ ] T032 前后端联调: 日期编辑测试 - 选择日期，保存，刷新后正确
  - 依赖: T023
  - 测试: 点击日期，选择昨天，保存
- [ ] T033 前后端联调: 备注编辑测试 - 输入备注，保存，刷新后正确
  - 依赖: T024
  - 测试: 点击备注，输入"测试备注"，保存
- [ ] T034 前后端联调: 类型编辑测试 - 切换类型，保存，刷新后正确
  - 依赖: T025
  - 测试: 点击类型，从支出改为收入，保存

---

## Phase 7: 验证与失败处理测试

**目标**: 测试前端验证反馈和错误处理

### 任务

- [ ] T035 测试: 金额<=0 显示错误提示 - 输入0或负数，底部显示红色"金额必须大于0"
  - 依赖: T020, T035
  - 测试: 金额输入框输入0
- [ ] T036 测试: 日期选择未来日期提示 - 选择明天，底部显示红色"日期不能超过今天"
  - 依赖: T023
  - 测试: 日历选择明天
- [ ] T037 测试: 备注超过128字符提示 - 输入129字符，底部显示红色"备注不能超过128字符"
  - 依赖: T024
  - 测试: 备注输入129个字符
- [ ] T038 测试: 未选择账户提示 - 不选账户点击保存，显示"请选择账户"
  - 依赖: T022
  - 测试: 打开账户弹窗，不选择直接点保存
- [ ] T039 测试: 未选择分类提示（支出/收入） - 不选分类点击保存，显示"请选择分类"
  - 依赖: T021
  - 测试: 支出类型下不选分类点保存
- [ ] T040 测试: API失败弹窗提示 - 模拟断网，编辑后保存，弹窗显示"保存失败，是否重试"
  - 依赖: T013, T020
  - 测试: 断网后编辑金额
- [ ] T041 测试: 网络离线提示 - 离线模式下显示离线标识
  - 依赖: T013
  - 测试: 关闭网络刷新页面

---

## Phase 8: 收尾与清理

**目标**: 清理旧代码和最终集成

### 任务

- [ ] T042 [P] 删除firemate-app/app/transaction-detail-modal.tsx旧弹窗组件
  - 文件: firemate-app/app/transaction-detail-modal.tsx
- [ ] T043 [P] 修改firemate-app/app/(tabs)/ledger.tsx点击交易跳转到/transaction/[id]
  - 文件: firemate-app/app/(tabs)/ledger.tsx
  - 依赖: T016
- [ ] T044 更新firemate-app/app/(tabs)/index.tsx点击交易跳转到详情页
  - 文件: firemate-app/app/(tabs)/index.tsx
  - 依赖: T016
- [ ] T045 清理所有console.log调试代码
  - 文件: 全局

---

## Phase 9: 分类自定义功能

**目标**: 实现用户自定义分类功能

### 任务

- [ ] T046 新建分类管理页面：显示分类列表，支持新增分类
  - 文件: firemate-app/app/(tabs)/categories.tsx 或 /more/categories.tsx
  - 依赖: T012
- [ ] T047 分类编辑功能：点击分类可编辑名称/图标
  - 文件: firemate-app/app/components/CategoryEditModal.tsx
  - 依赖: T046, T010
- [ ] T048 分类删除功能：删除分类（软删除）
  - 依赖: T011
- [ ] T049 前后端联调: 分类CRUD测试 - 新增、编辑、删除分类
  - 依赖: T046, T047, T048

---

## 并行执行机会

### Phase 2 内部可并行
- T005, T006 可并行创建

### Phase 3 内部可并行
- T012, T014, T015 可并行

### Phase 5 内部可并行
- T020, T021, T022, T023, T024, T025 可并行（6个弹窗组件）

### Phase 6 联调测试可并行
- T026-T034 每个API/功能可并行测试

### Phase 7 测试可并行
- T035-T041 每个验证项可并行测试

### Phase 8 清理可并行
- T042, T043, T044 可并行

---

## 执行顺序建议

**顺序执行**（有依赖）:
1. Phase 1 (T001-T004) - 数据库
2. Phase 2 (T005-T011) - 后端API
3. Phase 3 (T012-T015) - Store
4. Phase 4 (T016-T019) - 详情页
5. Phase 5 (T020-T025) - 弹窗组件
6. Phase 6 (T026-T034) - 联调测试
7. Phase 7 (T035-T041) - 验证测试
8. Phase 8 (T042-T045) - 收尾
9. Phase 9 (T046-T049) - 分类自定义

**并行执行**:
- Phase 5 内部6个组件可以同时开发
- Phase 6 联调测试可以同时进行
- Phase 7 验证测试可以同时进行
