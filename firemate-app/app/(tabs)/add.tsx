import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAccountStore } from '../../src/stores/accountStore';
import { useTransactionStore } from '../../src/stores/transactionStore';
import categoriesData from '../../src/data/categories.json';

// Apple Design Color Palette
const colors = {
  primary: '#007AFF',        // iOS Blue
  secondary: '#5856D6',      // iOS Purple
  success: '#34C759',        // iOS Green
  danger: '#FF3B30',         // iOS Red
  warning: '#FF9500',        // iOS Orange
  background: '#F2F2F7',   // iOS Light Gray
  card: '#FFFFFF',
  text: '#000000',
  textSecondary: '#8E8E93',
  textTertiary: '#C7C7CC',
  separator: '#E5E5EA',
};

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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>记账</Text>
          <Text style={styles.headerSubtitle}>记录每一笔收支</Text>
        </View>

        {/* 类型切换 - iOS Segmented Control */}
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

        {/* 金额输入 - iOS Card */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>{type === 'expense' ? '支出金额' : type === 'income' ? '收入金额' : '转账金额'}</Text>
          <View style={styles.amountSection}>
            <Text style={styles.currencySymbol}>¥</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor={colors.textTertiary}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
        </View>

        {/* 分类选择 - iOS Grid */}
        {type !== 'transfer' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>选择分类</Text>
            <View style={styles.categoryGrid}>
              {currentCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.categoryItem, categoryId === category.id && styles.categoryItemActive]}
                  onPress={() => setCategoryId(category.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.categoryIconContainer, categoryId === category.id && styles.categoryIconActive]}>
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                  </View>
                  <Text style={[styles.categoryName, categoryId === category.id && styles.categoryNameActive]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* 账户选择 - iOS Horizontal Scroll */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{type === 'transfer' ? '转出账户' : '支付账户'}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.accountRow}>
              {accounts.map((account) => (
                <TouchableOpacity
                  key={account.id}
                  style={[styles.accountChip, accountId === account.id && styles.accountChipActive]}
                  onPress={() => setAccountId(account.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.accountChipText, accountId === account.id && styles.accountChipTextActive]}>
                    {account.name}
                  </Text>
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
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.accountChipText, toAccountId === account.id && styles.accountChipTextActive]}>
                      {account.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* 日期选择 - iOS Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>日期</Text>
          <TextInput
            style={styles.dateInput}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        {/* 备注 - iOS Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>备注（可选）</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="添加备注..."
            placeholderTextColor={colors.textTertiary}
            value={note}
            onChangeText={setNote}
            multiline
          />
        </View>

        {/* 保存按钮 - iOS Primary Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
          <Text style={styles.saveButtonText}>保存</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.37,
  },
  headerSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 4,
  },
  typeSwitch: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 4,
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
  },
  typeText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  typeTextActive: {
    color: '#FFFFFF',
  },
  amountCard: {
    backgroundColor: colors.card,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 5,
    },
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 12,
  },
  amountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencySymbol: {
    fontSize: 32,
    color: colors.textSecondary,
    marginRight: 8,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text,
    minWidth: 150,
    textAlign: 'center',
  },
  section: {
    backgroundColor: colors.card,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryItem: {
    width: '22%',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  categoryItemActive: {
    backgroundColor: '#E3F2FD',
  },
  categoryIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  categoryIconActive: {
    backgroundColor: colors.primary,
  },
  categoryIcon: {
    fontSize: 22,
  },
  categoryName: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  categoryNameActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  accountRow: {
    flexDirection: 'row',
    gap: 8,
  },
  accountChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: colors.background,
    marginRight: 8,
  },
  accountChipActive: {
    backgroundColor: colors.primary,
  },
  accountChipText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  accountChipTextActive: {
    color: '#FFFFFF',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  dateInput: {
    backgroundColor: colors.background,
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    color: colors.text,
  },
  noteInput: {
    backgroundColor: colors.background,
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.primary,
    marginHorizontal: 20,
    marginTop: 30,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    ...{
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomSpacing: {
    height: 20,
  },
});
