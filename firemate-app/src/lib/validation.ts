import { z } from 'zod';

// 账户验证 Schema
export const accountSchema = z.object({
  name: z.string().min(1, '账户名称不能为空').max(50, '名称不能超过50个字符'),
  type: z.enum(['cash', 'bank_card', 'third_party', 'investment', 'savings']),
  balance: z.number().default(0),
  color: z.string().optional(),
});

// 交易验证 Schema
export const transactionSchema = z.object({
  type: z.enum(['expense', 'income', 'transfer']),
  amount: z.number().positive('金额必须大于0'),
  category_id: z.string().optional(),
  account_id: z.string().min(1, '请选择账户'),
  to_account_id: z.string().optional(),
  date: z.string().refine((val) => /^\d{4}-\d{2}-\d{2}$/.test(val), {
    message: '日期格式应为 YYYY-MM-DD',
  }),
  note: z.string().max(500, '备注不能超过500个字符').optional(),
}).refine((data) => {
  if (data.type === 'transfer' && !data.to_account_id) {
    return false;
  }
  return true;
}, {
  message: '请选择转入账户',
  path: ['to_account_id'],
}).refine((data) => {
  if (data.type !== 'transfer' && !data.category_id) {
    return false;
  }
  return true;
}, {
  message: '请选择分类',
  path: ['category_id'],
});

// 预算验证 Schema
export const budgetSchema = z.object({
  month: z.string().refine((val) => /^\d{4}-\d{2}$/.test(val), {
    message: '月份格式应为 YYYY-MM',
  }),
  amount: z.number().positive('预算金额必须大于0'),
});

// 目标验证 Schema
export const goalSchema = z.object({
  name: z.string().min(1, '目标名称不能为空').max(100, '名称不能超过100个字符'),
  target_amount: z.number().positive('目标金额必须大于0'),
  linked_account_id: z.string().min(1, '请选择关联账户'),
});

// 验证辅助函数
export function validateForm<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.issues.map((err: z.ZodIssue) => err.message);
  return { success: false, errors };
}
