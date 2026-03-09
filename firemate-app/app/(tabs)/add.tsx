import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAccountStore } from '../../src/stores/accountStore';
import { useTransactionStore } from '../../src/stores/transactionStore';
import categoriesData from '../../src/data/categories.json';

type TransactionType = 'expense' | 'income' | 'transfer';

export default function AddTransactionScreen() {
  const router = useRouter();
  const { accounts, fetchAccounts } = useAccountStore();
  const { createTransaction } = useTransactionStore();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [accountId, setAccountId] = useState<string | undefined>();
  const [toAccountId, setToAccountId] = useState<string | undefined>();
  const [note, setNote] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  const expenseCategories = categoriesData.expense as any[];
  const incomeCategories = categoriesData.income as any[];

  const currentCategories = type === 'income' ? incomeCategories : expenseCategories;

  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('提示', '请输入有效金额');
      return;
    }
    if (!accountId) {
      Alert.alert('提示', '请选择账户');
      return;
    }
    if (type === 'transfer' && !toAccountId) {
      Alert.alert('提示', '请选择转入账户');
      return;
    }
    if (type !== 'transfer' && !categoryId) {
      Alert.alert('提示', '请选择分类');
      return;
    }

    try {
      await createTransaction({
        type,
        amount: parseFloat(amount),
        category_id: categoryId,
        account_id: accountId,
        to_account_id: toAccountId,
        date,
        note
      });
      Alert.alert('成功', '记账成功', [
        { text: '确定', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('错误', '记账失败，请重试');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* 类型切换 */}
      <View style={styles.typeSwitch}>
        <TouchableOpacity
          style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]}
          onPress={() => { setType('expense'); setCategoryId(undefined); }}
        >
          <Text style={[styles.typeText, type === 'expense' && styles.typeTextActive]}>支出</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeButton, type === 'income' && styles.typeButtonActive]}
          onPress={() => { setType('income'); setCategoryId(undefined); }}
        >
          <Text style={[styles.typeText, type === 'income' && styles.typeTextActive]}>收入</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeButton, type === 'transfer' && styles.typeButtonActive]}
          onPress={() => { setType('transfer'); setCategoryId(undefined); }}
        >
          <Text style={[styles.typeText, type === 'transfer' && styles.typeTextActive]}>转账</Text>
        </TouchableOpacity>
      </View>

      {/* 金额输入 */}
      <View style={styles.amountSection}>
        <Text style={styles.currencySymbol}>¥</Text>
        <TextInput
          style={styles.amountInput}
          placeholder="0.00"
          placeholderTextColor="#D1D5DB"
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />
      </View>

      {/* 分类选择 */}
      {type !== 'transfer' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>选择分类</Text>
          <View style={styles.categoryGrid}>
            {currentCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryItem, categoryId === category.id && styles.categoryItemActive]}
                onPress={() => setCategoryId(category.id)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[styles.categoryName, categoryId === category.id && styles.categoryNameActive]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* 账户选择 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{type === 'transfer' ? '转出账户' : '支付账户'}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.accountRow}>
            {accounts.map((account) => (
              <TouchableOpacity
                key={account.id}
                style={[styles.accountChip, accountId === account.id && styles.accountChipActive]}
                onPress={() => setAccountId(account.id)}
              >
                <Text style={styles.accountChipText}>{account.name}</Text>
              </TouchableOpacity>
            ))}
            {accounts.length === 0 && (
              <Text style={styles.emptyText}>暂无账户，请先添加账户</Text>
            )}
          </View>
        </ScrollView>
      </View>

      {/* 转入账户（转账时） */}
      {type === 'transfer' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>转入账户</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.accountRow}>
              {accounts.filter(a => a.id !== accountId).map((account) => (
                <TouchableOpacity
                  key={account.id}
                  style={[styles.accountChip, toAccountId === account.id && styles.accountChipActive]}
                  onPress={() => setToAccountId(account.id)}
                >
                  <Text style={styles.accountChipText}>{account.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* 日期选择 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>日期</Text>
        <TextInput
          style={styles.dateInput}
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
        />
      </View>

      {/* 备注 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>备注（可选）</Text>
        <TextInput
          style={styles.noteInput}
          placeholder="添加备注..."
          value={note}
          onChangeText={setNote}
          multiline
        />
      </View>

      {/* 保存按钮 */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>保存</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6'
  },
  typeSwitch: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 4
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10
  },
  typeButtonActive: {
    backgroundColor: '#FFFFFF'
  },
  typeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280'
  },
  typeTextActive: {
    color: '#2DD4BF'
  },
  amountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 20
  },
  currencySymbol: {
    fontSize: 32,
    color: '#6B7280',
    marginRight: 8
  },
  amountInput: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1F2937',
    minWidth: 150,
    textAlign: 'center'
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 12
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  categoryItem: {
    width: '22%',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6'
  },
  categoryItemActive: {
    backgroundColor: '#2DD4BF'
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4
  },
  categoryName: {
    fontSize: 12,
    color: '#6B7280'
  },
  categoryNameActive: {
    color: '#FFFFFF'
  },
  accountRow: {
    flexDirection: 'row',
    gap: 8
  },
  accountChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8
  },
  accountChipActive: {
    backgroundColor: '#2DD4BF'
  },
  accountChipText: {
    fontSize: 14,
    color: '#6B7280'
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF'
  },
  dateInput: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    fontSize: 16
  },
  noteInput: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    minHeight: 60,
    textAlignVertical: 'top'
  },
  saveButton: {
    backgroundColor: '#2DD4BF',
    marginHorizontal: 20,
    marginVertical: 30,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF'
  }
});
