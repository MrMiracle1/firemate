import { validateForm, accountSchema, transactionSchema } from '../src/lib/validation';

describe('Validation Tests', () => {
  describe('accountSchema', () => {
    it('should validate valid account data', () => {
      const result = validateForm(accountSchema, {
        name: '测试账户',
        type: 'cash',
        balance: 1000,
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty account name', () => {
      const result = validateForm(accountSchema, {
        name: '',
        type: 'cash',
        balance: 0,
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid account type', () => {
      const result = validateForm(accountSchema, {
        name: '测试',
        type: 'invalid_type',
        balance: 0,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('transactionSchema', () => {
    it('should validate valid expense transaction', () => {
      const result = validateForm(transactionSchema, {
        type: 'expense',
        amount: 100,
        category_id: 'exp-1',
        account_id: 'acc-1',
        date: '2024-01-01',
      });
      expect(result.success).toBe(true);
    });

    it('should validate valid income transaction', () => {
      const result = validateForm(transactionSchema, {
        type: 'income',
        amount: 5000,
        category_id: 'inc-1',
        account_id: 'acc-1',
        date: '2024-01-15',
      });
      expect(result.success).toBe(true);
    });

    it('should reject transaction without amount', () => {
      const result = validateForm(transactionSchema, {
        type: 'expense',
        amount: 0,
        category_id: 'exp-1',
        account_id: 'acc-1',
        date: '2024-01-01',
      });
      expect(result.success).toBe(false);
    });

    it('should reject expense without category', () => {
      const result = validateForm(transactionSchema, {
        type: 'expense',
        amount: 100,
        category_id: undefined,
        account_id: 'acc-1',
        date: '2024-01-01',
      });
      expect(result.success).toBe(false);
    });

    it('should validate transfer transaction', () => {
      const result = validateForm(transactionSchema, {
        type: 'transfer',
        amount: 1000,
        category_id: undefined,
        account_id: 'acc-1',
        to_account_id: 'acc-2',
        date: '2024-01-01',
      });
      expect(result.success).toBe(true);
    });
  });
});
