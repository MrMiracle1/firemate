# 快速开始指南：财务管理 App V1.0

**分支**：`001-finance-app`
**日期**：2026-03-08

---

## 前置要求

| 工具 | 版本要求 |
|------|----------|
| Node.js | 20+ |
| npm / yarn | 最新稳定版 |
| Expo CLI | SDK 52+ |
| Android Studio | JDK 17+ (Android 开发) |
| Xcode | 15+ (iOS 开发，仅 macOS) |

---

## 1. 环境搭建

### 1.1 安装依赖

```bash
# 克隆项目
git clone <repository-url>
cd firemate-app

# 安装依赖
npm install

# 或使用 yarn
yarn install
```

### 1.2 配置 Supabase

1. 创建 Supabase 项目：https://supabase.com
2. 在 `.env` 文件中配置：

```env
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

3. 执行数据库初始化脚本：

```bash
# 使用 Supabase CLI 或在 Supabase SQL Editor 中执行 data-model.md 中的 SQL
```

---

## 2. 开发运行

### 2.1 启动开发服务器

```bash
# 启动 Expo 开发服务器
npx expo start

# 或指定平台
npx expo start --android
npx expo start --ios
```

### 2.2 运行在 Android

```bash
# 确保 Android SDK 配置正确
echo $ANDROID_HOME

# 启动 Android 模拟器或连接真机
npx expo run:android
```

---

## 3. 项目结构

```
firemate-app/
├── app/                    # 页面路由
│   ├── (tabs)/            # 底部标签
│   └── _layout.tsx        # 根布局
├── components/            # UI 组件
├── stores/                # 状态管理
├── services/              # 业务服务
├── lib/                   # 工具库
├── types/                 # 类型定义
└── data/                  # 静态数据
```

---

## 4. 核心功能流程

### 4.1 首次使用流程

```
1. 打开 App
   ↓
2. 选择登录方式（匿名登录 / 邮箱注册）
   ↓
3. 进入首页（总资产为 0）
   ↓
4. 引导添加第一个账户
   ↓
5. 开始记账
```

### 4.2 记账流程

```
1. 点击首页"记一笔"按钮
   ↓
2. 选择类型（支出/收入/转账）
   ↓
3. 选择分类（如餐饮 > 晚餐）
   ↓
4. 输入金额
   ↓
5. 选择账户
   ↓
6. 选择日期（默认今天）
   ↓
7. 可选添加备注
   ↓
8. 点击保存
   ↓
9. 返回首页，更新总资产和最近流水
```

### 4.3 查看报表流程

```
1. 点击底部导航"更多"
   ↓
2. 选择"报表"
   ↓
3. 选择时间范围
   ↓
4. 查看饼图（支出分类）/ 折线图（趋势）/ 条形图（账户）
```

---

## 5. 常见问题

### 5.1 如何添加账户？

```
首页 → 账户 Tab → 点击右上角"+" → 填写账户名称 → 选择类型 → 输入初始余额 → 保存
```

### 5.2 如何设置预算？

```
首页 → 更多 Tab → 预算 → 点击"设置预算" → 输入月度预算金额 → 保存
```

### 5.3 如何创建储蓄目标？

```
首页 → 更多 Tab → 目标 → 点击"+" → 输入目标名称 → 输入目标金额 → 选择关联账户 → 保存
```

---

## 6. 测试

### 6.1 运行单元测试

```bash
npm test

# 或监听模式
npm test -- --watch
```

### 6.2 测试关键流程

| 功能 | 测试点 |
|------|--------|
| 账户 | 创建、编辑、删除、余额计算 |
| 记账 | 收入、支出、转账、分类筛选 |
| 预算 | 设置、修改限制、进度计算 |
| 目标 | 创建、进度计算、达成状态 |
| 报表 | 饼图数据、折线图趋势、条形图分布 |

---

## 7. 构建发布

### 7.1 Android 构建

```bash
# 生成 Android APK
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```

### 7.2 iOS 构建

```bash
# 生成 iOS 项目
npx expo prebuild --platform ios
cd ios
xcodebuild -workspace *.xcworkspace -scheme * -configuration Release
```

---

## 8. 相关文档

- 功能规格：[spec.md](./spec.md)
- 技术方案：[tech.md](./tech.md)
- 数据模型：[data-model.md](./data-model.md)
- 研究报告：[research.md](./research.md)
