import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTransactionStore } from '../../src/stores/transactionStore';
import { useAccountStore } from '../../src/stores/accountStore';
import AddModal from '../add-modal';
import { Transaction } from '../../src/types';

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

function getCategoryIcon(icon: string) {
  return categoryIconMap[icon] || 'help-circle';
}

function formatAmount(amount: number, type: string): string {
  const prefix = type === 'expense' ? '-' : type === 'income' ? '+' : '';
  return `${prefix}¥${amount.toFixed(2)}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const dateStrOnly = dateStr.split('T')[0];
  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (dateStrOnly === todayStr) return '今天';
  if (dateStrOnly === yesterdayStr) return '昨天';
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

export default function LedgerScreen() {
  const router = useRouter();
  const { transactions, fetchTransactions, loading } = useTransactionStore();
  const { fetchAccounts } = useAccountStore();
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    // 同时加载账户和交易数据
    Promise.all([
      fetchTransactions(true),
      fetchAccounts(true)
    ]);
  }, []);

  const renderItem = ({ item }: { item: Transaction }) => {
    const categoryIcon = item.category?.icon ? getCategoryIcon(item.category.icon) : 'help-circle';
    const isExpense = item.type === 'expense';
    const isIncome = item.type === 'income';

    return (
      <TouchableOpacity
        style={styles.transactionItem}
        onPress={() => router.push(`/transaction/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          {item.category ? (
            <Ionicons
              name={categoryIcon as keyof typeof Ionicons.glyphMap}
              size={24}
              color={colors.primary}
            />
          ) : (
            <Ionicons
              name="swap-horizontal"
              size={24}
              color={colors.secondary}
            />
          )}
        </View>

        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>
            {item.category?.name || (item.type === 'transfer' ? '转账' : '未知')}
          </Text>
          <Text style={styles.transactionSubtitle}>
            {item.account?.name || '未知账户'}
            {item.type === 'transfer' && item.to_account && ` → ${item.to_account.name}`}
          </Text>
        </View>

        <View style={styles.amountContainer}>
          <Text style={[
            styles.amount,
            isExpense && styles.expenseAmount,
            isIncome && styles.incomeAmount,
            item.type === 'transfer' && styles.transferAmount
          ]}>
            {formatAmount(item.amount, item.type)}
          </Text>
          <Text style={styles.dateText}>{formatDate(item.date)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={64} color={colors.textTertiary} />
      <Text style={styles.emptyText}>暂无交易记录</Text>
      <Text style={styles.emptySubtext}>点击下方"记一笔"添加您的第一笔交易</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>账本</Text>
          <Text style={styles.headerSubtitle}>{transactions.length} 笔交易</Text>
        </View>

        {/* 交易列表 */}
        <FlatList
          data={transactions}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => fetchTransactions(true)}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={renderEmpty}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />

        {/* 记一笔按钮 */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
          <Text style={styles.addButtonText}>记一笔</Text>
        </TouchableOpacity>

        {/* 添加交易弹窗 */}
        <AddModal
          visible={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchTransactions(true);
          }}
        />
      </View>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: colors.background,
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 14,
    marginVertical: 4,
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 14,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  transactionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  expenseAmount: {
    color: colors.danger,
  },
  incomeAmount: {
    color: colors.success,
  },
  transferAmount: {
    color: colors.secondary,
  },
  dateText: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 4,
  },
  separator: {
    height: 0,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 8,
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 32,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    ...{
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
  },
  addButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});
