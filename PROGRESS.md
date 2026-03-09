# 火伴记账 App 项目进度总结

## 项目概述

- **项目名称**：火伴记账 (Firemate)
- **分支**：`001-finance-app` / `main`
- **技术栈**：React Native (Expo) + Node.js + Supabase

---

## 当前进度

### ✅ 已完成

| 模块 | 状态 | 说明 |
|------|------|------|
| **项目初始化** | ✅ 完成 | Expo 前端 + Node.js 后端项目已创建 |
| **数据库设计** | ✅ 完成 | Schema 已设计，需在 Supabase 执行 |
| **后端 API** | ✅ 完成 | 账户、流水、预算、目标 CRUD 接口 |
| **前端页面** | ✅ 完成 | 首页、记账、账户、预算、目标、报表 |
| **状态管理** | ✅ 完成 | Zustand stores 已配置 |
| **本地测试** | ⚠️ 部分 | 后端已测试，前端需配置数据库后测试 |

### ⏳ 待完成

| 任务 | 优先级 | 说明 |
|------|--------|------|
| **配置 Supabase 数据库** | P0 | 需要在 Supabase 后台执行 `server/sql/schema.sql` |
| **前端本地测试** | P1 | 启动 `npx expo start --web` 测试 |
| **服务器部署** | P1 | 部署后端到 `111.229.145.143:3000` |
| **正式环境配置** | P2 | 修改前端 API 地址为正式服务器 |

---

## 项目结构

```
firemate-v2/
├── firemate-app/          # React Native 前端
│   ├── app/              # Expo Router 页面
│   │   ├── (tabs)/      # 底部导航
│   │   │   ├── index.tsx    # 首页
│   │   │   ├── add.tsx     # 记账
│   │   │   ├── accounts.tsx # 账户
│   │   │   └── more.tsx    # 更多
│   │   └── more/          # 子页面
│   │       ├── budget.tsx  # 预算
│   │       ├── goals.tsx   # 目标
│   │       └── reports.tsx # 报表
│   └── src/
│       ├── stores/       # Zustand 状态管理
│       ├── types/        # TypeScript 类型
│       ├── lib/          # Supabase 客户端
│       └── data/         # 分类数据
│
├── server/               # Node.js 后端
│   ├── src/
│   │   ├── routes/      # API 路由
│   │   ├── services/    # 业务逻辑
│   │   └── lib/        # Supabase 客户端
│   ├── sql/
│   │   └── schema.sql  # 数据库 Schema
│   └── .env            # 环境配置
│
└── specs/               # 项目文档
    └── 001-finance-app/
        ├── spec.md      # 功能规格
        ├── tasks.md     # 任务清单
        └── tech.md      # 技术方案
```

---

## 快速开始（从其他电脑）

### 1. 克隆项目

```bash
git clone https://github.com/MrMiracle1/firemate.git
cd firemate
```

### 2. 安装依赖

```bash
# 前端
cd firemate-app
npm install

# 后端
cd ../server
npm install
```

### 3. 配置 Supabase 数据库

> ⚠️ 必须步骤

1. 打开 [Supabase Dashboard](https://supabase.com/dashboard)
2. 进入你的项目 → **SQL Editor**
3. 复制 `server/sql/schema.sql` 全部内容
4. 点击 **Run** 执行

### 4. 配置环境变量

编辑 `server/.env`：

```env
PORT=3000
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

### 5. 启动后端

```bash
cd server
npm run dev
```

验证：`curl http://localhost:3000/health`

### 6. 启动前端

```bash
cd firemate-app
npx expo start --web
```

浏览器打开 `http://localhost:8081`

---

## Supabase 配置信息

| 配置项 | 值 |
|--------|-----|
| Project ID | rwuszzdciisktpbumvgo |
| Supabase URL | https://rwuszzdciisktpbumvgo.supabase.co |
| Anon Key (前端用) | 在 Supabase 设置 → API 中获取 |
| Service Role Key (后端用) | 在 Supabase 设置 → API 中获取 |

---

## 服务器部署

后端部署到 `111.229.145.143:3000`：

```bash
cd server
npm run build
# 部署 dist/ 目录到服务器
```

部署后修改前端 API 地址：
- 开发环境：`http://localhost:3000`
- 正式环境：`http://111.229.145.143:3000`

---

## 已知问题

1. **前端 Web 启动**：需要先执行 `npm install react-native-web --legacy-peer-deps`
2. **数据库**：必须先在 Supabase 执行 schema.sql 才能正常测试

---

## 任务清单

完整任务见 `specs/001-finance-app/tasks.md`

**MVP 范围**（优先完成）：
1. ✅ 项目初始化
2. ✅ 后端 API
3. ⏳ 配置数据库
4. ⏳ 前端测试
5. ⏳ 服务器部署

---

## 联系方式

如有疑问，请查看：
- 功能规格：`specs/001-finance-app/spec.md`
- 技术方案：`specs/001-finance-app/tech.md`
- 任务清单：`specs/001-finance-app/tasks.md`

---

*最后更新：2026-03-09*
