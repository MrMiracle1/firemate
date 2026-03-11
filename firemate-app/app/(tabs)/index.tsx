import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAccountStore } from '../../src/stores/accountStore';
import { useTransactionStore } from '../../src/stores/transactionStore';
import { OfflineIndicator, ErrorMessage, Loading } from '../../src/components/common/Loading';

// Apple Design Color Palette
const colors = {
  primary: '#007AFF',        // iOS Blue
  secondary: '#5856D6',       // iOS Purple
  success: '#34C759',         // iOS Green
  danger: '#FF3B30',          // iOS Red
  warning: '#FF9500',         // iOS Orange
  background: '#F2F2F7',     // iOS Light Gray
  card: '#FFFFFF',
  text: '#000000',
  textSecondary: '#8E8E93',
  textTertiary: '#C7C7CC',
  separator: '#E5E5EA',
  gradient: ['#007AFF', '#5856D6'],
};

export default function HomeScreen() {
  const router = useRouter();
  const { accounts, totalSummary, loading, error, isOffline, fetchAccounts, fetchTotalSummary } = useAccountStore();
  const { transactions, fetchTransactions } = useTransactionStore();
  const [refreshing, setRefreshing] = useState(false);
  const [currentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      fetchAccounts(),
      fetchTotalSummary(),
      fetchTransactions(true)
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // 计算本月收支
  const monthlyData = transactions.filter(t => t.date.startsWith(currentMonth));
  const monthIncome = monthlyData.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
  const monthExpense = monthlyData.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);

  const formatMoney = (amount: number) => {
    return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>财务</Text>
          <Text style={styles.headerSubtitle}>今天 是美好的一天</Text>
          <OfflineIndicator visible={isOffline} />
        </View>

        {/* Total Assets Card - Apple Style */}
        <View style={styles.assetCardContainer}>
          <View style={styles.assetCard}>
            <View style={styles.assetCardHeader}>
              <Text style={styles.assetLabel}>总资产</Text>
              <View style={styles.assetIcon}>
                <Ionicons name="wallet" size={20} color="#FF9500" />
              </View>
            </View>
            <Text style={styles.assetAmount}>¥ {formatMoney(totalSummary?.total || 0)}</Text>
            <View style={styles.assetTrend}>
              <Ionicons name="trending-up" size={14} color={colors.success} />
              <Text style={styles.assetTrendText}>较昨日 +0.00</Text>
            </View>
          </View>
        </View>

        {/* Monthly Summary - iOS Cards */}
        <View style={styles.monthlyContainer}>
          <View style={styles.monthlyCard}>
            <View style={[styles.monthlyIconContainer, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="arrow-up-circle" size={22} color={colors.success} />
            </View>
            <View style={styles.monthlyContent}>
              <Text style={styles.monthlyLabel}>本月收入</Text>
              <Text style={[styles.monthlyAmount, styles.incomeColor]}>
                +{formatMoney(monthIncome)}
              </Text>
            </View>
          </View>

          <View style={styles.monthlyCard}>
            <View style={[styles.monthlyIconContainer, { backgroundColor: '#FFEBEE' }]}>
              <Ionicons name="arrow-down-circle" size={22} color={colors.danger} />
            </View>
            <View style={styles.monthlyContent}>
              <Text style={styles.monthlyLabel}>本月支出</Text>
              <Text style={[styles.monthlyAmount, styles.expenseColor]}>
                -{formatMoney(monthExpense)}
              </Text>
            </View>
          </View>

          <View style={styles.monthlyCard}>
            <View style={[styles.monthlyIconContainer, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="cash" size={22} color={colors.primary} />
            </View>
            <View style={styles.monthlyContent}>
              <Text style={styles.monthlyLabel}>本月结余</Text>
              <Text style={[styles.monthlyAmount, monthIncome - monthExpense >= 0 ? styles.incomeColor : styles.expenseColor]}>
                {formatMoney(monthIncome - monthExpense)}
              </Text>
            </View>
          </View>
        </View>

        {/* Recent Transactions - Apple List Style */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>最近交易</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/(tabs)/add')}
              activeOpacity={0.7}
            >
              <Text style={styles.addButtonText}>+ 记一笔</Text>
            </TouchableOpacity>
          </View>

          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="document-text-outline" size={32} color={colors.textTertiary} />
              </View>
              <Text style={styles.emptyText}>暂无交易记录</Text>
              <Text style={styles.emptySubtext}>点击上方"记一笔"开始记录</Text>
            </View>
          ) : (
            <View style={styles.transactionList}>
              {transactions.slice(0, 8).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.transactionItem}
                  activeOpacity={0.7}
                >
                  <View style={styles.transactionLeft}>
                    <View style={[
                      styles.transactionIconContainer,
                      item.type === 'income' && styles.iconIncome,
                      item.type === 'expense' && styles.iconExpense,
                      item.type === 'transfer' && styles.iconTransfer,
                    ]}>
                      <Ionicons
                        name={item.type === 'income' ? 'arrow-up-circle' : item.type === 'expense' ? 'arrow-down-circle' : 'swap-horizontal'}
                        size={22}
                        color={item.type === 'income' ? colors.success : item.type === 'expense' ? colors.danger : colors.secondary}
                      />
                    </View>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionTitle}>
                        {item.category?.name || (item.type === 'transfer' ? '转账' : '其他')}
                      </Text>
                      <Text style={styles.transactionDate}>{item.date}</Text>
                    </View>
                  </View>
                  <Text style={[
                    styles.transactionAmount,
                    item.type === 'income' && styles.incomeColor,
                    item.type === 'expense' && styles.expenseColor,
                    item.type === 'transfer' && styles.transferColor
                  ]}>
                    {item.type === 'income' ? '+' : item.type === 'expense' ? '-' : ''}
                    {formatMoney(Number(item.amount))}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Quick Actions - iOS Grid */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>快捷操作</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => router.push('/(tabs)/accounts')}
              activeOpacity={0.7}
            >
              <View style={[styles.quickIconContainer, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="wallet-outline" size={24} color={colors.primary} />
              </View>
              <Text style={styles.quickText}>账户</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => router.push('/(tabs)/add')}
              activeOpacity={0.7}
            >
              <View style={[styles.quickIconContainer, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="create-outline" size={24} color={colors.success} />
              </View>
              <Text style={styles.quickText}>记账</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => router.push('/more/reports')}
              activeOpacity={0.7}
            >
              <View style={[styles.quickIconContainer, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="bar-chart-outline" size={24} color={colors.warning} />
              </View>
              <Text style={styles.quickText}>报表</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => router.push('/more/budget')}
              activeOpacity={0.7}
            >
              <View style={[styles.quickIconContainer, { backgroundColor: '#F3E5F5' }]}>
                <Ionicons name="flag-outline" size={24} color={colors.secondary} />
              </View>
              <Text style={styles.quickText}>预算</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Spacing */}
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
  assetCardContainer: {
    paddingHorizontal: 16,
  },
  assetCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  assetCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  assetLabel: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  assetIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF9E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assetAmount: {
    fontSize: 42,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -1,
  },
  assetTrend: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  assetTrendText: {
    fontSize: 13,
    color: colors.success,
    marginLeft: 4,
  },
  monthlyContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  monthlyCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  monthlyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  monthlyContent: {
    flex: 1,
  },
  monthlyLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  monthlyAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  incomeColor: {
    color: colors.success,
  },
  expenseColor: {
    color: colors.danger,
  },
  transferColor: {
    color: colors.secondary,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 0.38,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    backgroundColor: colors.card,
    borderRadius: 16,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  transactionList: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconIncome: {
    backgroundColor: '#E8F5E9',
  },
  iconExpense: {
    backgroundColor: '#FFEBEE',
  },
  iconTransfer: {
    backgroundColor: '#E3F2FD',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  transactionAmount: {
    fontSize: 17,
    fontWeight: '600',
  },
  quickActionsContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
  },
  quickButton: {
    alignItems: 'center',
    flex: 1,
  },
  quickIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 20,
  },
});
