# 火伴记账 App V1.1 实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**目标:** 将记账从独立 Tab 改为弹窗模式，添加交易详情/编辑功能，完善交互体验

**架构:**
- Tab 2 从独立页面改为交易列表
- 新增 add-modal.tsx 作为记一笔/编辑的弹窗组件
- 新增 transaction/[id].tsx 作为交易详情页
- 首页和记账 Tab 的交易点击都跳转到详情页（复用逻辑）

**技术栈:** React Native (Expo), Zustand, Expo Router

---

## 第一阶段：Tab 结构改造 + 弹窗基础

### Task 1: 创建记一笔弹窗组件

**Files:**
- Create: `firemate-app/app/add-modal.tsx`

**Step 1: 创建弹窗组件基础结构**

```tsx
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAccountStore } from '../src/stores/accountStore';
import { useTransactionStore } from '../src/stores/transactionStore';
import categoriesData from '../src/data/categories.json';

interface AddModalProps {
  visible: boolean;
  onClose: () => void;
  editTransaction?: any; // 传入则表示编辑模式
  onSuccess?: () => void;
}

export default function AddModal({ visible, onClose, editTransaction, onSuccess }: AddModalProps) {
  // ... 实现代码见文件
}
```

**Step 2: 验证文件创建成功**

Run: `ls -la firemate-app/app/add-modal.tsx`

**Step 3: Commit**

```bash
git add firemate-app/app/add-modal.tsx
git commit -m "feat: create add-modal component for add/edit transaction"
```

---

### Task 2: 修改 Tab 布局 - 记账 Tab 改为交易列表

**Files:**
- Modify: `firemate-app/app/(tabs)/_layout.tsx:36-40`

**Step 1: 将 add 改为 ledger**

```tsx
<Tabs.Screen
  name="ledger"
  options={{
    title: '记账',
    tabBarIcon: ({ focused }) => <TabIcon name="ledger" focused={focused} iconName="list" />
  }}
/>
```

**Step 2: 重命名 add.tsx 为 ledger.tsx 并改为交易列表**

Run: `mv firemate-app/app/(tabs)/add.tsx firemate-app/app/(tabs)/ledger.tsx`

**Step 3: 修改 ledger.tsx 内容为交易列表**

将原来的记账表单改为显示所有交易列表，底部保留"记一笔"按钮，点击弹出 add-modal

**Step 4: Commit**

```bash
git add firemate-app/app/(tabs)/_layout.tsx firemate-app/app/(tabs)/ledger.tsx
git commit -m "feat: rename add to ledger, show transaction list"
```

---

### Task 3: 在记账 Tab 添加记一笔按钮和弹窗

**Files:**
- Modify: `firemate-app/app/(tabs)/ledger.tsx`

**Step 1: 添加状态控制弹窗显示**

```tsx
const [showAddModal, setShowAddModal] = useState(false);
```

**Step 2: 在页面底部添加按钮**

```tsx
<TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
  <Ionicons name="add" size={24} color="#FFFFFF" />
  <Text style={styles.addButtonText}>记一笔</Text>
</TouchableOpacity>
```

**Step 3: 引入弹窗组件**

```tsx
import AddModal from '../../add-modal';
```

**Step 4: 在 return 中添加弹窗**

```tsx
<AddModal
  visible={showAddModal}
  onClose={() => setShowAddModal(false)}
  onSuccess={() => {
    setShowAddModal(false);
    fetchTransactions(true);
  }}
/>
```

**Step 5: Commit**

```bash
git add firemate-app/app/(tabs)/ledger.tsx
git commit -m "feat: add button to open add-modal in ledger tab"
```

---

## 第二阶段：交易详情页

### Task 4: 创建交易详情页

**Files:**
- Create: `firemate-app/app/transaction/[id].tsx`

**Step 1: 创建详情页基础结构**

```tsx
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTransactionStore } from '../../src/stores/transactionStore';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { transactions, deleteTransaction } = useTransactionStore();

  const transaction = transactions.find(t => t.id === id);

  if (!transaction) {
    return <Text>交易不存在</Text>;
  }

  // ... 实现编辑和删除功能
}
```

**Step 2: 添加到路由**

确保 expo-router 自动识别 `[id].tsx` 为动态路由

**Step 3: Commit**

```bash
git add firemate-app/app/transaction/
git commit -m "feat: create transaction detail page"
```

---

### Task 5: 首页最近流水点击跳转详情

**Files:**
- Modify: `firemate-app/app/(tabs)/index.tsx`

**Step 1: 添加 router 跳转**

```tsx
const router = useRouter();

// 在交易项的 onPress 中添加
onPress={() => router.push(`/transaction/${item.id}`)}
```

**Step 2: Commit**

```bash
git add firemate-app/app/(tabs)/index.tsx
git commit -m "feat: navigate to transaction detail from home"
```

---

### Task 6: 记账 Tab 交易点击跳转详情

**Files:**
- Modify: `firemate-app/app/(tabs)/ledger.tsx`

**Step 1: 添加 router 和点击事件**

```tsx
const router = useRouter();

// 在交易列表项添加 onPress
onPress={() => router.push(`/transaction/${item.id}`)}
```

**Step 2: Commit**

```bash
git add firemate-app/app/(tabs)/ledger.tsx
git commit -m "feat: navigate to detail from ledger"
```

---

## 第三阶段：后端 API - 编辑交易

### Task 7: 后端添加交易更新接口

**Files:**
- Modify: `server/src/routes/transactions.ts`
- Modify: `server/src/services/transactionService.ts`

**Step 1: 在 transactionService.ts 添加 update 方法**

```typescript
async update(userId: string, id: string, updates: Partial<Transaction>): Promise<Transaction> {
  // 先获取旧数据用于回滚余额
  const oldTransaction = await this.getById(id);

  // 回滚旧余额
  if (oldTransaction) {
    await this.reverseAccountBalance(userId, oldTransaction);
  }

  // 更新交易
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;

  // 应用新余额
  const newTransaction = { ...oldTransaction, ...updates } as Transaction;
  await this.updateAccountBalance(userId, newTransaction);

  return data;
}
```

**Step 2: 在 routes/transactions.ts 添加 PUT 路由**

```typescript
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.headers['x-user-id'] as string;

  try {
    const transaction = await transactionService.update(userId, id, req.body);
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});
```

**Step 3: 构建并部署**

```bash
cd server && npm run build
# 部署到服务器
```

**Step 4: Commit**

```bash
git add server/src/routes/transactions.ts server/src/services/transactionService.ts
git commit -m "feat: add PUT /api/transactions/:id endpoint"
```

---

## 第四阶段：交互完善

### Task 8: 添加防重复提交

**Files:**
- Modify: `firemate-app/src/stores/transactionStore.ts`
- Modify: `firemate-app/app/add-modal.tsx`

**Step 1: 在 store 添加 submitting 状态**

```typescript
interface TransactionState {
  // ... existing
  submitting: boolean;

  createTransaction: (transaction: any) => Promise<boolean>; // 返回成功与否
}

createTransaction: async (transaction) => {
  set({ submitting: true, error: null });
  try {
    // ... existing
    set({ submitting: false });
    return true;
  } catch (error) {
    set({ submitting: false });
    return false;
  }
}
```

**Step 2: 在弹窗按钮使用**

```tsx
<TouchableOpacity
  disabled={submitting}
  onPress={handleSubmit}
>
  {submitting ? <ActivityIndicator /> : <Text>保存</Text>}
</TouchableOpacity>
```

**Step 3: Commit**

```bash
git add firemate-app/src/stores/transactionStore.ts firemate-app/app/add-modal.tsx
git commit -m "feat: add submitting state to prevent duplicate"
```

---

### Task 9: 添加退出登录

**Files:**
- Modify: `firemate-app/app/(tabs)/more.tsx`

**Step 1: 引入 auth store**

```tsx
import { useAuthStore } from '../../src/lib/auth';
```

**Step 2: 添加退出按钮**

```tsx
<TouchableOpacity
  style={styles.logoutButton}
  onPress={() => {
    Alert.alert('退出登录', '确定要退出登录吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '退出',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/auth');
        }
      }
    ]);
  }}
>
  <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
  <Text style={styles.logoutText}>退出登录</Text>
</TouchableOpacity>
```

**Step 3: Commit**

```bash
git add firemate-app/app/(tabs)/more.tsx
git commit -m "feat: add sign out button to more page"
```

---

## 验收检查清单

- [ ] Tab 2 名称为"记账"，显示所有交易
- [ ] 点击"记一笔"从底部弹出表单
- [ ] 提交按钮有 loading 状态防重复
- [ ] 首页点击交易可查看详情
- [ ] 记账 Tab 点击交易可查看详情
- [ ] 详情页有编辑按钮，点击进入编辑弹窗
- [ ] 详情页有删除按钮，点击确认后删除
- [ ] 删除后余额自动恢复
- [ ] 更多页面有退出登录按钮
