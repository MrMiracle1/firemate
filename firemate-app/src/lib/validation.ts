import { z } from 'zod';

// 验证规则常量
export const VALIDATION_RULES = {
  NOTE_MAX_LENGTH: 128,
  AMOUNT_MIN: 0.01,
  AMOUNT_MAX: 999999999,
  ACCOUNT_NAME_MAX_LENGTH: 50,
  CATEGORY_NAME_MAX_LENGTH: 50,
};

// 验证消息
export const VALIDATION_MESSAGES = {
  REQUIRED: '此字段为必填项',
  INVALID_AMOUNT: '请输入有效金额',
  AMOUNT_TOO_LARGE: '金额超出允许范围',
  NOTE_TOO_LONG: `备注不能超过${VALIDATION_RULES.NOTE_MAX_LENGTH}个字符`,
};

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

// 备注验证函数
export function validateNote(note: string): { valid: boolean; error?: string } {
  if (note.length > VALIDATION_RULES.NOTE_MAX_LENGTH) {
    return { valid: false, error: VALIDATION_MESSAGES.NOTE_TOO_LONG };
  }
  return { valid: true };
}

// 备注截断函数
export function truncateNote(note: string): string {
  return note.slice(0, VALIDATION_RULES.NOTE_MAX_LENGTH);
}

// 金额验证函数
export function validateAmount(amount: number): { valid: boolean; error?: string } {
  if (isNaN(amount) || amount <= 0) {
    return { valid: false, error: VALIDATION_MESSAGES.INVALID_AMOUNT };
  }
  if (amount > VALIDATION_RULES.AMOUNT_MAX) {
    return { valid: false, error: VALIDATION_MESSAGES.AMOUNT_TOO_LARGE };
  }
  return { valid: true };
}

// 格式化金额输入（只允许数字和小数点，最多2位小数）
export function formatAmountInput(text: string): string {
  // 移除不是数字或小数点的字符
  let formatted = text.replace(/[^0-9.]/g, '');

  // 确保只有一个小数点
  const parts = formatted.split('.');
  if (parts.length > 2) {
    formatted = parts[0] + '.' + parts.slice(1).join('');
  }

  // 限制小数位数为2位
  if (parts.length === 2 && parts[1].length > 2) {
    formatted = parts[0] + '.' + parts[1].slice(0, 2);
  }

  return formatted;
}
