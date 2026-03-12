import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTransactionStore } from '../../src/stores/transactionStore';
import { useAccountStore } from '../../src/stores/accountStore';
import { Transaction, TransactionType } from '../../src/types';

// 编辑弹窗组件
import AmountEditor from '../components/AmountEditor';
import CategoryEditor from '../components/CategoryEditor';
import AccountEditor from '../components/AccountEditor';
import DateEditor from '../components/DateEditor';
import NoteEditor from '../components/NoteEditor';
import TypeEditor from '../components/TypeEditor';

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

function getCategoryIcon(icon: string): keyof typeof Ionicons.glyphMap {
  return categoryIconMap[icon] || 'help-circle';
}

function formatFullDate(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}年${month}月${day}日 ${hours}:${minutes}`;
}

function formatAmount(amount: number, type: string): { text: string; color: string } {
  switch (type) {
    case 'expense':
      return { text: `-¥${amount.toFixed(2)}`, color: colors.danger };
    case 'income':
      return { text: `+¥${amount.toFixed(2)}`, color: colors.success };
    case 'transfer':
      return { text: `¥${amount.toFixed(2)}`, color: colors.text };
    default:
      return { text: `¥${amount.toFixed(2)}`, color: colors.text };
  }
}

function getTypeLabel(type: string): string {
  switch (type) {
    case 'expense':
      return '支出';
    case 'income':
      return '收入';
    case 'transfer':
      return '转账';
    default:
      return type;
  }
}

function getTypeColor(type: string): string {
  switch (type) {
    case 'expense':
      return colors.danger;
    case 'income':
      return colors.success;
    case 'transfer':
      return colors.secondary;
    default:
      return colors.text;
  }
}

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { transactions, deleteTransaction, updateTransaction, loading, fetchTransactions } = useTransactionStore();
  const { fetchAccounts } = useAccountStore();

  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [accountsLoaded, setAccountsLoaded] = useState(false);

  // 编辑弹窗状态
  const [showAmountEditor, setShowAmountEditor] = useState(false);
  const [showCategoryEditor, setShowCategoryEditor] = useState(false);
  const [showAccountEditor, setShowAccountEditor] = useState(false);
  const [showDateEditor, setShowDateEditor] = useState(false);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [showTypeEditor, setShowTypeEditor] = useState(false);
  const [savingField, setSavingField] = useState(false);

  // 加载交易和账户数据
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchTransactions(true),
        fetchAccounts(true)
      ]);
      setAccountsLoaded(true);
    };
    loadData();
  }, []);

  // 从交易列表中获取当前交易
  useEffect(() => {
    if (id && transactions.length > 0) {
      const transaction = transactions.find(t => t.id === id);
      if (transaction) {
        setCurrentTransaction(transaction);
      }
    }
  }, [id, transactions]);

  // 字段更新处理函数
  const handleAmountUpdate = async (amount: number, type: TransactionType) => {
    if (!currentTransaction) return;
    setSavingField(true);
    try {
      await updateTransaction(currentTransaction.id, { amount, type });
    } catch (error) {
      throw error;
    } finally {
      setSavingField(false);
    }
  };

  const handleCategoryUpdate = async (categoryId: string) => {
    if (!currentTransaction) return;
    setSavingField(true);
    try {
      await updateTransaction(currentTransaction.id, { category_id: categoryId });
    } catch (error) {
      throw error;
    } finally {
      setSavingField(false);
    }
  };

  const handleAccountUpdate = async (accountId: string, toAccountId?: string) => {
    if (!currentTransaction) return;
    setSavingField(true);
    try {
      await updateTransaction(currentTransaction.id, {
        account_id: accountId,
        to_account_id: toAccountId,
      });
    } catch (error) {
      throw error;
    } finally {
      setSavingField(false);
    }
  };

  const handleDateUpdate = async (date: string) => {
    if (!currentTransaction) return;
    setSavingField(true);
    try {
      await updateTransaction(currentTransaction.id, { date });
    } catch (error) {
      throw error;
    } finally {
      setSavingField(false);
    }
  };

  const handleNoteUpdate = async (note: string) => {
    if (!currentTransaction) return;
    setSavingField(true);
    try {
      await updateTransaction(currentTransaction.id, { note });
    } catch (error) {
      throw error;
    } finally {
      setSavingField(false);
    }
  };

  const handleTypeUpdate = async (type: TransactionType) => {
    if (!currentTransaction) return;
    setSavingField(true);
    try {
      await updateTransaction(currentTransaction.id, { type });
    } catch (error) {
      throw error;
    } finally {
      setSavingField(false);
    }
  };

  // 处理删除 - 直接删除不弹确认框
  const handleDelete = async () => {
    if (!currentTransaction) {
      return;
    }

    setDeleting(true);
    try {
      await deleteTransaction(currentTransaction.id);
      // 删除后刷新账户余额
      await fetchAccounts(true);
      // 跳转回列表
      router.back();
    } catch (error) {
      Alert.alert('删除失败', '无法删除该交易，请重试。');
    } finally {
      setDeleting(false);
    }
  };

  if (!currentTransaction) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: '交易详情',
            headerStyle: { backgroundColor: colors.card },
            headerTintColor: colors.primary,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const amountInfo = formatAmount(currentTransaction.amount, currentTransaction.type);
  const categoryIcon = currentTransaction.category?.icon
    ? getCategoryIcon(currentTransaction.category.icon)
    : 'help-circle';

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '交易详情',
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.primary,
          headerShadowVisible: false,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 金额卡片（可点击编辑） */}
        <TouchableOpacity
          style={styles.amountCard}
          onPress={() => setShowAmountEditor(true)}
          activeOpacity={0.7}
        >
          <View style={styles.typeTag}>
            <Text style={[styles.typeTagText, { color: getTypeColor(currentTransaction.type) }]}>
              {getTypeLabel(currentTransaction.type)}
            </Text>
          </View>
          <Text style={[styles.amountText, { color: amountInfo.color }]}>
            {amountInfo.text}
          </Text>
          <View style={styles.editHint}>
            <Ionicons name="pencil" size={14} color={colors.textTertiary} />
            <Text style={styles.editHintText}>点击编辑</Text>
          </View>
        </TouchableOpacity>

        {/* 详情列表 */}
        <View style={styles.detailCard}>
          {/* 分类（可点击编辑） */}
          {currentTransaction.type !== 'transfer' && (
            <TouchableOpacity
              style={styles.detailRow}
              onPress={() => setShowCategoryEditor(true)}
              activeOpacity={0.7}
            >
              <View style={styles.detailIcon}>
                <Ionicons
                  name={categoryIcon as keyof typeof Ionicons.glyphMap}
                  size={22}
                  color={colors.primary}
                />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>分类</Text>
                <Text style={styles.detailValue}>
                  {currentTransaction.category?.name || '未分类'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          )}

          {/* 账户（可点击编辑） */}
          <TouchableOpacity
            style={styles.detailRow}
            onPress={() => setShowAccountEditor(true)}
            activeOpacity={0.7}
          >
            <View style={styles.detailIcon}>
              <Ionicons name="wallet-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>
                {currentTransaction.type === 'transfer' ? '转出账户' : '支付账户'}
              </Text>
              <Text style={styles.detailValue}>
                {currentTransaction.account?.name || '未知账户'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          {/* 转入账户（转账时） */}
          {currentTransaction.type === 'transfer' && (
            <TouchableOpacity
              style={styles.detailRow}
              onPress={() => setShowAccountEditor(true)}
              activeOpacity={0.7}
            >
              <View style={styles.detailIcon}>
                <Ionicons name="wallet" size={22} color={colors.secondary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>转入账户</Text>
                <Text style={styles.detailValue}>
                  {currentTransaction.to_account?.name || '请选择'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          )}

          {/* 时间（可点击编辑） */}
          <TouchableOpacity
            style={[styles.detailRow, styles.lastRow]}
            onPress={() => setShowDateEditor(true)}
            activeOpacity={0.7}
          >
            <View style={styles.detailIcon}>
              <Ionicons name="time-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>时间</Text>
              <Text style={styles.detailValue}>
                {formatFullDate(currentTransaction.date)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* 备注卡片（可点击编辑） */}
        <TouchableOpacity
          style={styles.noteCard}
          onPress={() => setShowNoteEditor(true)}
          activeOpacity={0.7}
        >
          <View style={styles.noteHeader}>
            <Ionicons name="document-text-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.noteLabel}>备注</Text>
            <Ionicons name="pencil" size={16} color={colors.textTertiary} style={{ marginLeft: 'auto' }} />
          </View>
          <Text style={styles.noteText}>{currentTransaction.note || '点击添加备注'}</Text>
        </TouchableOpacity>

        {/* 操作按钮 */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
            activeOpacity={0.7}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator size="small" color={colors.danger} />
            ) : (
              <>
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
                <Text style={styles.deleteButtonText}>删除交易</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 编辑弹窗组件 */}
      <AmountEditor
        visible={showAmountEditor}
        onClose={() => setShowAmountEditor(false)}
        onSave={handleAmountUpdate}
        initialAmount={currentTransaction.amount}
        initialType={currentTransaction.type}
        loading={savingField}
      />

      <CategoryEditor
        visible={showCategoryEditor}
        onClose={() => setShowCategoryEditor(false)}
        onSave={handleCategoryUpdate}
        initialCategoryId={currentTransaction.category_id}
        transactionType={currentTransaction.type}
        loading={savingField}
      />

      <AccountEditor
        visible={showAccountEditor}
        onClose={() => setShowAccountEditor(false)}
        onSave={handleAccountUpdate}
        initialAccountId={currentTransaction.account_id}
        initialToAccountId={currentTransaction.to_account_id}
        isTransfer={currentTransaction.type === 'transfer'}
        loading={savingField}
      />

      <DateEditor
        visible={showDateEditor}
        onClose={() => setShowDateEditor(false)}
        onSave={handleDateUpdate}
        initialDate={currentTransaction.date}
        loading={savingField}
      />

      <NoteEditor
        visible={showNoteEditor}
        onClose={() => setShowNoteEditor(false)}
        onSave={handleNoteUpdate}
        initialNote={currentTransaction.note || ''}
        loading={savingField}
      />

      <TypeEditor
        visible={showTypeEditor}
        onClose={() => setShowTypeEditor(false)}
        onSave={handleTypeUpdate}
        initialType={currentTransaction.type}
        loading={savingField}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: colors.textSecondary,
  },
  amountCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  typeTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.background,
    marginBottom: 12,
  },
  typeTagText: {
    fontSize: 14,
    fontWeight: '600',
  },
  amountText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  editHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 4,
  },
  editHintText: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  detailCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  noteCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  noteLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  noteText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  editButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  deleteButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.danger,
  },
});
