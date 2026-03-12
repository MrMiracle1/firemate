/**
 * 数据同步服务 - 集中管理跨 Store 的连锁更新
 *
 * 数据依赖关系:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │                         Transaction (交易)                       │
 * │    amount, type, account_id, category_id, date                 │
 * └──────────┬─────────────────┬─────────────────┬──────────────────┘
 *            │                 │                 │
 *            ▼                 ▼                 ▼
 *     ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
 *     │   Account   │   │   Budget    │   │  Category   │
 *     │   (余额)    │   │  (预算剩余) │   │  (分类统计) │
 *     └──────┬──────┘   └──────┬──────┘   └─────────────┘
 *            │                 │
 *            ▼                 │
 *     ┌─────────────┐          │
 *     │ TotalSummary│          │
 *     │  (总资产)   │          │
 *     └──────┬──────┘          │
 *            │                 │
 *            ▼                 ▼
 *     ┌─────────────────────────────────────┐
 *     │            Goal (目标进度)           │
 *     │    关联账户余额变化会影响目标进度    │
 *     └─────────────────────────────────────┘
 */

import { useAccountStore } from '../stores/accountStore';
import { useBudgetStore } from '../stores/budgetStore';
import { useGoalStore } from '../stores/goalStore';

/**
 * 刷新所有依赖交易的相关数据
 * 在 create/update/delete transaction 后调用
 */
export const refreshTransactionRelatedData = async () => {
  // 并行刷新多个 Store
  await Promise.all([
    useAccountStore.getState().fetchAccounts(true),
    useAccountStore.getState().fetchTotalSummary(true),
    useGoalStore.getState().fetchGoals(),
  ]);

  // 刷新当前月的预算
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  useBudgetStore.getState().fetchBudget(currentMonth);
};

/**
 * 刷新账户相关数据
 * 在 create/update/delete account 后调用
 */
export const refreshAccountRelatedData = async () => {
  await Promise.all([
    useAccountStore.getState().fetchAccounts(true),
    useAccountStore.getState().fetchTotalSummary(true),
    useGoalStore.getState().fetchGoals(),
  ]);
};

/**
 * 刷新预算相关数据
 * 在预算设置/更新后调用
 */
export const refreshBudgetRelatedData = async () => {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  await useBudgetStore.getState().fetchBudget(currentMonth);
};

/**
 * 刷新目标相关数据
 * 在目标创建/更新后调用
 */
export const refreshGoalRelatedData = async () => {
  await useGoalStore.getState().fetchGoals();
};
