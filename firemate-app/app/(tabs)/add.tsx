import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, SafeAreaView, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAccountStore } from '../../src/stores/accountStore';
import { useTransactionStore } from '../../src/stores/transactionStore';
import { validateForm, transactionSchema } from '../../src/lib/validation';
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

// 分类图标映射 - 将 emoji 映射到 Ionicons
const categoryIconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  // 支出分类
  '🍜': 'restaurant', '🥣': 'cafe', '🍱': 'restaurant', '🍲': 'restaurant', '🍪': 'ice-cream', '🚖': 'car',
  '🚗': 'car', '🚌': 'bus', '🚇': 'train', '🚕': 'taxi', '⛽': 'fuel', '🅿️': 'parking',
  '🛒': 'cart', '👕': 'shirt', '🧴': 'medical', '📱': 'phone-portrait',
  '🏠': 'home', '🏢': 'business', '💡': 'flash', 'build': 'construct',
  '🎬': 'film', '🎥': 'videocam', '🎮': 'game-controller', '✈️': 'airplane',
  '💊': 'medical', '🏥': 'hospital', '💉': 'medical', '📋': 'document-text',
  '📚': 'book', '🎓': 'school', '📖': 'book', '📝': 'document-text',
  '📦': 'cube',
  // 收入分类
  '💰': 'cash', '💼': 'briefcase', '📈': 'trending-up', '🎁': 'gift',
};

function CategoryIcon({ icon, selected }: { icon: string; selected: boolean }) {
  const ionIcon = categoryIconMap[icon];

  if (ionIcon) {
    return (
      <View style={[styles.categoryIconContainer, selected && styles.categoryIconActive]}>
        <Ionicons
          name={selected ? ionIcon : `${ionIcon}-outline` as keyof typeof Ionicons.glyphMap}
          size={22}
          color={selected ? '#FFFFFF' : colors.textSecondary}
        />
      </View>
    );
  }

  // 如果没有映射，回退到 emoji
  return (
    <View style={[styles.categoryIconContainer, selected && styles.categoryIconActive]}>
      <Text style={styles.categoryEmoji}>{icon}</Text>
    </View>
  );
}

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
  const [showDatePicker, setShowDatePicker] = useState(false);

  // 生成过去30天的日期选项
  const getDateOptions = () => {
    const options = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      options.push({
        value: d.toISOString().split('T')[0],
        label: i === 0 ? '今天' : i === 1 ? '昨天' : `${d.getMonth() + 1}月${d.getDate()}日`,
        fullLabel: `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
      });
    }
    return options;
  };

  const dateOptions = getDateOptions();

  const handleDateSelect = (selectedDate: string) => {
    setDate(selectedDate);
    setShowDatePicker(false);
  };

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (dateStr === today.toISOString().split('T')[0]) return '今天';
    if (dateStr === yesterday.toISOString().split('T')[0]) return '昨天';
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  };

  const expenseCategories = categoriesData.expense as any[];
  const incomeCategories = categoriesData.income as any[];

  const currentCategories = type === 'income' ? incomeCategories : expenseCategories;

  const handleSave = async () => {
    // 使用 zod 验证
    const validation = validateForm(transactionSchema, {
      type,
      amount: parseFloat(amount) || 0,
      category_id: categoryId,
      account_id: accountId,
      to_account_id: toAccountId,
      date,
      note
    });

    if (!validation.success) {
      Alert.alert('验证失败', validation.errors[0]);
      return;
    }

    try {
      await createTransaction({
        type: validation.data.type,
        amount: validation.data.amount,
        category_id: validation.data.category_id,
        account_id: validation.data.account_id,
        to_account_id: validation.data.to_account_id,
        date: validation.data.date,
        note: validation.data.note
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
                  <CategoryIcon icon={category.icon} selected={categoryId === category.id} />
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

        {/* 日期选择 - iOS Style Picker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>日期</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text style={styles.datePickerText}>{formatDisplayDate(date)}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* 日期选择弹窗 */}
        <Modal visible={showDatePicker} animationType="slide" transparent>
          <View style={styles.dateModalOverlay}>
            <TouchableOpacity style={styles.dateModalBackdrop} onPress={() => setShowDatePicker(false)} />
            <View style={styles.dateModalContent}>
              <View style={styles.dateModalHandle} />
              <View style={styles.dateModalHeader}>
                <Text style={styles.dateModalTitle}>选择日期</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.dateModalDone}>完成</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.dateModalList} showsVerticalScrollIndicator={false}>
                {dateOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.dateModalItem, date === option.value && styles.dateModalItemActive]}
                    onPress={() => handleDateSelect(option.value)}
                  >
                    <Text style={[styles.dateModalItemText, date === option.value && styles.dateModalItemTextActive]}>
                      {option.fullLabel}
                    </Text>
                    {date === option.value && (
                      <Ionicons name="checkmark" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

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
    gap: 10,
  },
  categoryItem: {
    width: '23%',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryItemActive: {
    backgroundColor: '#E3F2FD',
    borderColor: colors.primary,
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
  categoryEmoji: {
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
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 14,
    borderRadius: 10,
  },
  datePickerText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 10,
  },
  // 日期选择弹窗样式
  dateModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  dateModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  dateModalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: '60%',
  },
  dateModalHandle: {
    width: 36,
    height: 5,
    backgroundColor: colors.separator,
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  dateModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  dateModalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  dateModalDone: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.primary,
  },
  dateModalList: {
    paddingHorizontal: 20,
  },
  dateModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  dateModalItemActive: {
    backgroundColor: 'transparent',
  },
  dateModalItemText: {
    fontSize: 16,
    color: colors.text,
  },
  dateModalItemTextActive: {
    color: colors.primary,
    fontWeight: '500',
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
