import { supabase } from '../lib/supabase';

export interface Transaction {
  id?: string;
  user_id: string;
  type: 'income' | 'expense' | 'transfer';
  category_id?: string;
  amount: number;
  account_id: string;
  to_account_id?: string;
  date: string;
  note?: string;
  created_at?: string;
}

interface GetOptions {
  limit: number;
  offset: number;
}

export const transactionService = {
  async getAll(userId: string, options: GetOptions): Promise<Transaction[]> {
    // 如果 userId 不是有效的 UUID，返回空数组
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    if (!isValidUUID) return [];

    // 先查询交易记录（包含分类）
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(options.offset, options.offset + options.limit - 1);

    if (error) throw error;
    if (!transactions || transactions.length === 0) return [];

    // 收集所有账户ID
    const accountIds = new Set<string>();
    transactions.forEach(t => {
      if (t.account_id) accountIds.add(t.account_id);
      if (t.to_account_id) accountIds.add(t.to_account_id);
    });

    // 查询所有相关账户（包括已删除的），不限制 is_deleted
    let accountsMap = new Map();
    if (accountIds.size > 0) {
      const { data: accounts } = await supabase
        .from('accounts')
        .select('*')
        .in('id', Array.from(accountIds));

      if (accounts) {
        accounts.forEach(a => accountsMap.set(a.id, a));
      }
    }

    // 关联账户数据到交易记录
    const result = transactions.map(t => ({
      ...t,
      account: t.account_id ? accountsMap.get(t.account_id) : null,
      to_account: t.to_account_id ? accountsMap.get(t.to_account_id) : null
    }));

    return result;
  },

  async create(userId: string, transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>): Promise<Transaction> {
    // 如果 userId 不是有效的 UUID，抛出错误
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    if (!isValidUUID) throw new Error('Invalid user ID');

    // 验证账户存在
    if (!transaction.account_id) {
      throw new Error('Account is required');
    }

    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('id', transaction.account_id)
      .maybeSingle();

    if (accountError) {
      console.error('Account query error:', accountError);
      throw new Error('Failed to verify account');
    }

    if (!account) {
      throw new Error('Account not found: ' + transaction.account_id);
    }

    // 处理 category_id：如果不是有效UUID则设为null（兼容前端JSON分类ID）
    const categoryId = transaction.category_id;
    const isCategoryIdValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId || '');

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        ...transaction,
        user_id: userId,
        category_id: isCategoryIdValidUUID ? categoryId : null
      })
      .select()
      .single();

    if (error) throw error;

    // 更新账户余额（如果失败不影响交易创建）
    try {
      await this.updateAccountBalance(userId, transaction);
    } catch (balanceError) {
      console.error('Balance update failed:', balanceError);
    }

    return data;
  },

  async delete(userId: string, id: string): Promise<void> {
    // 如果 userId 不是有效的 UUID，抛出错误
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    if (!isValidUUID) throw new Error('Invalid user ID');

    // 先获取交易信息用于恢复余额
    const { data: transaction } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (transaction) {
      // 恢复账户余额
      await this.reverseAccountBalance(userId, transaction);
    }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('user_id', userId)
      .eq('id', id);

    if (error) throw error;
  },

  async update(userId: string, id: string, updates: Partial<Transaction>): Promise<Transaction> {
    // 如果 userId 不是有效的 UUID，抛出错误
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    if (!isValidUUID) throw new Error('Invalid user ID');

    // 获取旧交易数据
    const { data: oldTransaction } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (!oldTransaction) {
      throw new Error('Transaction not found');
    }

    // 判断是否需要更新余额
    const needBalanceUpdate =
      updates.amount !== undefined || updates.account_id !== undefined || updates.type !== undefined || updates.to_account_id !== undefined;

    if (needBalanceUpdate) {
      // 回滚旧余额
      await this.reverseAccountBalance(userId, oldTransaction);
    }

    // 处理 category_id：如果不是有效UUID则设为null
    const categoryId = updates.category_id;
    const isCategoryIdValidUUID = categoryId ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId) : true;

    const updateData = {
      ...updates,
      category_id: isCategoryIdValidUUID ? categoryId : null
    };

    // 更新交易记录
    const { data, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    if (needBalanceUpdate && data) {
      // 应用新余额
      await this.updateAccountBalance(userId, {
        account_id: data.account_id,
        to_account_id: data.to_account_id,
        type: data.type,
        amount: data.amount,
        date: data.date
      });
    }

    return data;
  },

  async updateAccountBalance(userId: string, transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>): Promise<void> {
    const { account_id, to_account_id, type, amount } = transaction;

    if (type === 'income') {
      // 收入：增加账户余额
      await this.addBalance(account_id!, amount);
    } else if (type === 'expense') {
      // 支出：减少账户余额
      await this.subtractBalance(account_id!, amount);
    } else if (type === 'transfer' && to_account_id) {
      // 转账：转出账户减少，转入账户增加
      await this.subtractBalance(account_id!, amount);
      await this.addBalance(to_account_id, amount);
    }
  },

  async reverseAccountBalance(userId: string, transaction: Transaction): Promise<void> {
    const { account_id, to_account_id, type, amount } = transaction;

    if (type === 'income') {
      await this.subtractBalance(account_id!, amount);
    } else if (type === 'expense') {
      await this.addBalance(account_id!, amount);
    } else if (type === 'transfer' && to_account_id) {
      await this.addBalance(account_id!, amount);
      await this.subtractBalance(to_account_id, amount);
    }
  },

  async addBalance(accountId: string, amount: number): Promise<void> {
    // 读取当前余额并更新（非原子，Supabase免费版不支持存储过程）
    const { data } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', accountId)
      .single();

    if (data) {
      await supabase
        .from('accounts')
        .update({ balance: Number(data.balance) + amount })
        .eq('id', accountId);
    }
  },

  async subtractBalance(accountId: string, amount: number): Promise<void> {
    // 读取当前余额并更新（非原子，Supabase免费版不支持存储过程）
    const { data } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', accountId)
      .single();

    if (data) {
      await supabase
        .from('accounts')
        .update({ balance: Number(data.balance) - amount })
        .eq('id', accountId);
    }
  }
};
