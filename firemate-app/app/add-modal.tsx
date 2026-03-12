import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAccountStore } from '../src/stores/accountStore';
import { useTransactionStore } from '../src/stores/transactionStore';
import { validateForm, transactionSchema, formatAmountInput, validateAmount } from '../src/lib/validation';
import categoriesData from '../src/data/categories.json';
import { Transaction } from '../src/types';

// Apple Design Color Palette
const colors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  danger: '#FF3B30',
  warning: '#FF9500',
  background: '#F2F2F7',
  card: '#FFFFFF',
  text: '#000000',
  textSecondary: '#8E8E93',
  textTertiary: '#C7C7CC',
  separator: '#E5E5EA',
};

type TransactionType = 'expense' | 'income' | 'transfer';

interface AddModalProps {
  visible: boolean;
  onClose: () => void;
  editTransaction?: Transaction;
  onSuccess?: () => void;
}

// 分类图标映射
const categoryIconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  '🍜': 'restaurant', '🥣': 'cafe', '🍱': 'restaurant', '🍲': 'restaurant', '🍪': 'ice-cream',
  '🚖': 'car', '🚗': 'car', '🚌': 'bus', '🚇': 'train', '🚕': 'taxi', '⛽': 'fuel',
  '🅿️': 'parking', '🛒': 'cart', '👕': 'shirt', '🧴': 'medical', '📱': 'phone-portrait',
  '🏠': 'home', '🏢': 'business', '💡': 'flash', '🔧': 'construct', '🎬': 'film',
  '🎥': 'videocam', '🎮': 'game-controller', '✈️': 'airplane', '💊': 'medical',
  '🏥': 'hospital', '💉': 'medical', '📋': 'document-text', '📚': 'book', '🎓': 'school',
  '📖': 'book', '📝': 'document-text', '📦': 'cube', '💰': 'cash', '💼': 'briefcase',
  '📈': 'trending-up', '🎁': 'gift',
};

function CategoryIcon({ icon, selected }: { icon: string; selected: boolean }) {
  const ionIcon = categoryIconMap[icon];

  if (ionIcon) {
    return (
      <View style={[styles.categoryIconContainer, selected && styles.categoryIconActive]}>
        <Ionicons
          name={selected ? ionIcon : `${ionIcon}-outline` as keyof typeof Ionicons.glyphMap}
          size={20}
          color={selected ? '#FFFFFF' : colors.textSecondary}
        />
      </View>
    );
  }

  return (
    <View style={[styles.categoryIconContainer, selected && styles.categoryIconActive]}>
      <Text style={styles.categoryEmoji}>{icon}</Text>
    </View>
  );
}

export default function AddModal({ visible, onClose, editTransaction, onSuccess }: AddModalProps) {
  const router = useRouter();
  const isEditMode = !!editTransaction;
  const { accounts, fetchAccounts } = useAccountStore();
  const { createTransaction, updateTransaction, loading } = useTransactionStore();
  const insets = useSafeAreaInsets();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [selectedParentCategory, setSelectedParentCategory] = useState<any>(null);
  const [accountId, setAccountId] = useState<string | undefined>();
  const [toAccountId, setToAccountId] = useState<string | undefined>();
  const [note, setNote] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // 获取当前显示的分类列表
  const getCurrentCategories = () => {
    if (selectedParentCategory && selectedParentCategory.children) {
      return selectedParentCategory.children;
    }
    return type === 'income' ? categoriesData.income : categoriesData.expense;
  };

  // 查找分类的父级
  const findParentCategory = (categoryId: string, categories: any[]): any => {
    for (const category of categories) {
      if (category.children) {
        const child = category.children.find((c: any) => c.id === categoryId);
        if (child) {
          return category;
        }
        const nestedParent = findParentCategory(categoryId, category.children);
        if (nestedParent) {
          return nestedParent;
        }
      }
    }
    return null;
  };

  // 处理分类点击
  const handleCategoryPress = (category: any) => {
    // 如果有子分类，进入子分类列表
    if (category.children && category.children.length > 0) {
      setSelectedParentCategory(category);
    } else {
      // 选择该分类
      setCategoryId(category.id);
    }
  };

  // 返回上级分类
  const handleGoBack = () => {
    setSelectedParentCategory(null);
  };

  // 加载账户数据
  useEffect(() => {
    if (visible) {
      setIsInitialized(false);
      fetchAccounts(true).then(() => {
        setIsInitialized(true);
      });
    }
  }, [visible]);

  // 空账户引导
  useEffect(() => {
    if (visible && isInitialized && !editTransaction) {
      // 新增模式：检查是否有账户
      if (accounts.length === 0) {
        Alert.alert(
          '请先创建账户',
          '记账需要至少一个账户，请先创建账户。',
          [
            {
              text: '取消',
              style: 'cancel',
              onPress: () => onClose(),
            },
            {
              text: '去创建',
              onPress: () => {
                onClose();
                // 跳转到账户页面
                router.push('/(tabs)/accounts');
              },
            },
          ]
        );
      }
    }
  }, [visible, isInitialized, accounts.length, editTransaction]);

  // 初始化和重置表单
  useEffect(() => {
    if (visible && isInitialized) {
      if (editTransaction) {
        // 编辑模式：填充已有数据，验证账户有效性
        const validAccount = accounts.find(a => a.id === editTransaction.account_id);
        setType(editTransaction.type);
        setAmount(editTransaction.amount.toString());
        setCategoryId(editTransaction.category_id);

        // 查找父分类（用于显示子分类列表）
        if (editTransaction.category_id) {
          const categories = type === 'income' ? categoriesData.income : categoriesData.expense;
          const parent = findParentCategory(editTransaction.category_id, categories);
          setSelectedParentCategory(parent);
        }

        setAccountId(validAccount ? editTransaction.account_id : accounts[0]?.id);
        setToAccountId(editTransaction.to_account_id);
        setNote(editTransaction.note || '');
        setDate(editTransaction.date);
      } else {
        // 新增模式：重置表单
        setType('expense');
        setAmount('');
        setAmountError(null);
        setCategoryId(undefined);
        setSelectedParentCategory(null);
        setAccountId(accounts[0]?.id);
        setToAccountId(undefined);
        setNote('');
        setDate(new Date().toISOString().split('T')[0]);
      }
    }
  }, [visible, editTransaction, isInitialized, accounts.length]);

  // 生成日期选项
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

  // 获取当前类型的分类ID（编辑模式下保持原分类）
  const getCategoryId = () => {
    if (editTransaction && editTransaction.category_id) {
      return editTransaction.category_id;
    }
    return categoryId;
  };

  const handleSave = async () => {
    // 先校验金额
    if (!amount || parseFloat(amount) <= 0) {
      setAmountError('请输入有效金额');
      return;
    }

    if (amountError) {
      Alert.alert('请检查输入', amountError);
      return;
    }

    const currentCategoryId = type !== 'transfer' ? getCategoryId() : undefined;

    const validation = validateForm(transactionSchema, {
      type,
      amount: parseFloat(amount) || 0,
      category_id: currentCategoryId,
      account_id: accountId,
      to_account_id: type === 'transfer' ? toAccountId : undefined,
      date,
      note
    });

    if (!validation.success) {
      Alert.alert('请检查输入', validation.errors.join('\n'));
      return;
    }

    setSubmitting(true);
    try {
      const data = {
        type: validation.data.type,
        amount: validation.data.amount,
        category_id: currentCategoryId,
        account_id: validation.data.account_id,
        to_account_id: validation.data.to_account_id,
        date: validation.data.date,
        note: validation.data.note
      };

      if (isEditMode && editTransaction) {
        await updateTransaction(editTransaction.id, data);
      } else {
        await createTransaction(data);
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('保存失败:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.modalContent}>
            {/* 拖动把手 */}
            <View style={styles.modalHandle} />

            {/* Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleClose} disabled={submitting}>
                <Text style={styles.cancelText}>取消</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {isEditMode ? '编辑记账' : '记一笔'}
              </Text>
              <View style={styles.placeholder} />
            </View>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* 类型切换 */}
              <View style={styles.typeSwitch}>
                <TouchableOpacity
                  style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]}
                  onPress={() => { setType('expense'); setCategoryId(undefined); setSelectedParentCategory(null); }}
                  disabled={submitting}
                >
                  <Text style={[styles.typeText, type === 'expense' && styles.typeTextActive]}>支出</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, type === 'income' && styles.typeButtonActive]}
                  onPress={() => { setType('income'); setCategoryId(undefined); setSelectedParentCategory(null); }}
                  disabled={submitting}
                >
                  <Text style={[styles.typeText, type === 'income' && styles.typeTextActive]}>收入</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, type === 'transfer' && styles.typeButtonActive]}
                  onPress={() => { setType('transfer'); setCategoryId(undefined); setSelectedParentCategory(null); }}
                  disabled={submitting}
                >
                  <Text style={[styles.typeText, type === 'transfer' && styles.typeTextActive]}>转账</Text>
                </TouchableOpacity>
              </View>

              {/* 金额输入 */}
              <View style={styles.amountCard}>
                <Text style={styles.amountLabel}>
                  {type === 'expense' ? '支出金额' : type === 'income' ? '收入金额' : '转账金额'}
                </Text>
                <View style={styles.amountSection}>
                  <Text style={styles.currencySymbol}>¥</Text>
                  <TextInput
                    style={[styles.amountInput, amountError && styles.amountInputError]}
                    placeholder="0.00"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="decimal-pad"
                    value={amount}
                    onChangeText={(text) => {
                      const formatted = formatAmountInput(text);
                      setAmount(formatted);
                      // 实时校验
                      if (formatted) {
                        const validation = validateAmount(parseFloat(formatted));
                        setAmountError(validation.valid ? null : validation.error || null);
                      } else {
                        setAmountError(null);
                      }
                    }}
                    editable={!submitting}
                  />
                </View>
                {/* 金额错误提示 */}
                {amountError && (
                  <Text style={styles.errorText}>{amountError}</Text>
                )}
              </View>

              {/* 分类选择（非转账） */}
              {type !== 'transfer' && (
                <View style={styles.section}>
                  <View style={styles.categoryHeader}>
                    {selectedParentCategory ? (
                      <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={20} color={colors.primary} />
                        <Text style={styles.backButtonText}>{selectedParentCategory.name}</Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={styles.sectionTitle}>选择分类</Text>
                    )}
                  </View>
                  <View style={styles.categoryGrid}>
                    {getCurrentCategories().map((category: any) => (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.categoryItem,
                          getCategoryId() === category.id && styles.categoryItemActive
                        ]}
                        onPress={() => handleCategoryPress(category)}
                        activeOpacity={0.7}
                        disabled={submitting}
                      >
                        <CategoryIcon
                          icon={category.icon}
                          selected={getCategoryId() === category.id}
                        />
                        <Text
                          style={[
                            styles.categoryName,
                            getCategoryId() === category.id && styles.categoryNameActive
                          ]}
                          numberOfLines={1}
                        >
                          {category.name}
                        </Text>
                        {category.children && category.children.length > 0 && (
                          <Ionicons name="chevron-forward" size={14} color={colors.textTertiary} style={styles.categoryArrow} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* 账户选择 */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {type === 'transfer' ? '转出账户' : '支付账户'}
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.accountScrollContent}
                >
                  {accounts.map((account) => (
                    <TouchableOpacity
                      key={account.id}
                      style={[
                        styles.accountChip,
                        accountId === account.id && styles.accountChipActive
                      ]}
                      onPress={() => setAccountId(account.id)}
                      activeOpacity={0.7}
                      disabled={submitting}
                    >
                      <Text
                        style={[
                          styles.accountChipText,
                          accountId === account.id && styles.accountChipTextActive
                        ]}
                      >
                        {account.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {accounts.length === 0 && (
                    <Text style={styles.emptyText}>暂无账户</Text>
                  )}
                </ScrollView>
              </View>

              {/* 转入账户（转账时） */}
              {type === 'transfer' && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>转入账户</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.accountScrollContent}
                  >
                    {accounts.filter(a => a.id !== accountId).map((account) => (
                      <TouchableOpacity
                        key={account.id}
                        style={[
                          styles.accountChip,
                          toAccountId === account.id && styles.accountChipActive
                        ]}
                        onPress={() => setToAccountId(account.id)}
                        activeOpacity={0.7}
                        disabled={submitting}
                      >
                        <Text
                          style={[
                            styles.accountChipText,
                            toAccountId === account.id && styles.accountChipTextActive
                          ]}
                        >
                          {account.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    {accounts.filter(a => a.id !== accountId).length === 0 && (
                      <Text style={styles.emptyText}>暂无其他账户</Text>
                    )}
                  </ScrollView>
                </View>
              )}

              {/* 日期选择 */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>日期</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => !submitting && setShowDatePicker(true)}
                  activeOpacity={0.7}
                  disabled={submitting}
                >
                  <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                  <Text style={styles.datePickerText}>{formatDisplayDate(date)}</Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>

              {/* 日期选择弹窗 */}
              <Modal visible={showDatePicker} animationType="slide" transparent>
                <View style={styles.dateModalOverlay}>
                  <TouchableOpacity
                    style={styles.dateModalBackdrop}
                    onPress={() => setShowDatePicker(false)}
                  />
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
                          style={[
                            styles.dateModalItem,
                            date === option.value && styles.dateModalItemActive
                          ]}
                          onPress={() => handleDateSelect(option.value)}
                        >
                          <Text
                            style={[
                              styles.dateModalItemText,
                              date === option.value && styles.dateModalItemTextActive
                            ]}
                          >
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

              {/* 备注 */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>备注（可选）</Text>
                <TextInput
                  style={styles.noteInput}
                  placeholder="添加备注..."
                  placeholderTextColor={colors.textTertiary}
                  value={note}
                  onChangeText={setNote}
                  multiline
                  editable={!submitting}
                />
              </View>

              {/* 保存按钮 */}
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (submitting || loading) && styles.saveButtonDisabled
                ]}
                onPress={handleSave}
                activeOpacity={0.8}
                disabled={submitting || loading}
              >
                {submitting || loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {isEditMode ? '保存修改' : '保存'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  keyboardView: {
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '65%',
  },
  modalHandle: {
    width: 36,
    height: 5,
    backgroundColor: colors.separator,
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  cancelText: {
    fontSize: 17,
    color: colors.primary,
  },
  placeholder: {
    width: 50,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  typeSwitch: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 3,
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
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    padding: 16,
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
  amountInputError: {
    color: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  section: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
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
    paddingVertical: 8,
  },
  categoryItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    margin: 4,
    borderRadius: 12,
    backgroundColor: colors.background,
    maxWidth: '25%',
  },
  categoryItemActive: {
    backgroundColor: colors.primary,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 17,
    color: colors.primary,
    fontWeight: '500',
  },
  categoryArrow: {
    position: 'absolute',
    right: 4,
    top: '50%',
    marginTop: -7,
  },
  categoryIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  categoryIconActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  categoryEmoji: {
    fontSize: 20,
  },
  categoryName: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
  },
  categoryNameActive: {
    color: colors.card,
    fontWeight: '500',
  },
  accountScrollContent: {
    paddingRight: 16,
  },
  accountChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.background,
    marginRight: 8,
  },
  accountChipActive: {
    backgroundColor: colors.primary,
  },
  accountChipText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  accountChipTextActive: {
    color: '#FFFFFF',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textTertiary,
    alignSelf: 'center',
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
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    ...{
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
  },
  saveButtonDisabled: {
    backgroundColor: colors.textTertiary,
    shadowOpacity: 0,
    elevation: 0,
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
