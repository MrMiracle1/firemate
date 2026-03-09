# 研究报告：财务管理 App V1.0 技术选型

**分支**：`001-finance-app`
**日期**：2026-03-07

---

## 1. 跨平台移动端框架

### 决策：React Native (Expo)

| 方案 | 优点 | 缺点 | 结论 |
|------|------|------|------|
| **React Native (Expo)** | 成熟稳定、生态丰富、文档完善 | JavaScript 运行时 | ✅ 采用 |
| Flutter | 性能好、自带 UI 框架 | 学习曲线较陡 | 备选 |
| uni-app | 国产生态好 | 社区活跃度较低 | 备选 |

**理由**：Expo 简化了 React Native 的开发、构建和发布流程，配套工具成熟。

---

## 2. 状态管理

### 决策：Zustand

| 方案 | 优点 | 缺点 | 结论 |
|------|------|------|------|
| **Zustand** | 轻量、TypeScript 支持好、无 Provider 嵌套 | 社区相对较小 | ✅ 采用 |
| Redux Toolkit | 功能强大、社区大 | 学习曲线较陡 | 备选 |
| Jotai | 原子化状态、适合复杂状态 | 概念较新 | 备选 |

**理由**：Zustand 简洁 API 与 React Native 完美兼容，适合财务管理 App 的状态规模。

---

## 3. 数据库与后端

### 决策：Supabase (PostgreSQL)

| 方案 | 优点 | 缺点 | 结论 |
|------|------|------|------|
** | 开| **Supabase源、PostgreSQL 核心、RLS 安全、实时订阅 | 需要配置 | ✅ 采用 |
| Firebase | 功能完整、生态好 | 闭源、NoSQL | 备选 |
| 自建后端 | 完全控制 | 维护成本高 | 备选 |

**理由**：Supabase 是 Firebase 的开源替代品，使用 PostgreSQL 关系型数据库，RLS 行级安全适合财务数据保护。

---

## 4. 本地缓存

### 决策：AsyncStorage

| 方案 | 优点 | 缺点 | 结论 |
|------|------|------|------|
| **AsyncStorage** | Expo 原生支持、简单可靠 | 性能一般 | ✅ 采用 |
| MMKV | 性能好、跨平台 | 需要额外配置 | 备选 |

**理由**：AsyncStorage 是 Expo/React Native 官方推荐的本地存储方案，对于用户偏好设置等小规模数据足够使用。

---

## 5. 图表库

### 决策：react-native-gifted-charts

| 方案 | 优点 | 缺点 | 结论 |
|------|------|------|------|
| **react-native-gifted-charts** | 轻量、支持饼图/折线图/条形图 | 相对较新 | ✅ 采用 |
| react-native-chart-kit | 功能丰富、社区活跃 | 依赖较多 | 备选 |
| victory-native | 功能强大 | 体积较大 | 备选 |

**理由**：react-native-gifted-charts 专为 React Native 设计，体积小且满足 V1.0 图表需求。

---

## 6. 表单验证

### 决策：zod

| 方案 | 优点 | 缺点 | 结论 |
|------|------|------|------|
| **zod** | TypeScript 原生、类型安全、简洁 | 相对较新 | ✅ 采用 |
| Yup | 生态成熟 | 类型推导较弱 | 备选 |
| Joi | 功能强大 | 主要用于 Node.js | 备选 |

**理由**：zod 与 TypeScript 无缝集成，财务管理 App 需要严格的数据校验。

---

## 7. 认证模式

### 决策：匿名登录 + 邮箱注册

| 模式 | 用途 | 实现 |
|------|------|------|
| 匿名登录 | 本地使用，无需注册 | Supabase 匿名认证 |
| 邮箱注册 | 需要云端同步 | Supabase Email Auth |

**理由**：符合 V1.0 需求，用户可先本地使用，后续需要同步时再注册。

---

## 8. 后端服务

### 决策：Node.js + Express

| 方案 | 优点 | 缺点 | 结论 |
|------|------|------|------|
| **Node.js + Express** | 与前端语言统一、灵活 | 需要自行运维 | ✅ 采用 |
| Spring Boot | Java 生态庞大 | 学习曲线较陡 | 备选 |
| Supabase Edge Functions | 原生集成 | Deno 运行时 | 备选 |

**理由**：Node.js 与前端语言统一，使用 TypeScript 可实现全栈类型安全。

---

## 总结

所有技术选型均已确定，技术栈如下：

- **前端**：React Native (Expo) + TypeScript + Zustand
- **后端**：Node.js + Express + Supabase (PostgreSQL + Auth)
- **本地**：AsyncStorage
- **图表**：react-native-gifted-charts
- **验证**：zod
