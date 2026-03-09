import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAccountStore } from '../../src/stores/accountStore';
import { useTransactionStore } from '../../src/stores/transactionStore';

export default function HomeScreen() {
  const router = useRouter();
  const { accounts, totalSummary, fetchAccounts, fetchTotalSummary } = useAccountStore();
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
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2DD4BF" />}
    >
      {/* 顶部背景 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>我的财务</Text>

        {/* 总资产卡片 */}
        <View style={styles.assetCard}>
          <Text style={styles.assetLabel}>总资产</Text>
          <Text style={styles.assetAmount}>¥ {formatMoney(totalSummary?.total || 0)}</Text>
        </View>

        {/* 本月收支 */}
        <View style={styles.monthlyRow}>
          <View style={styles.monthlyItem}>
            <Text style={styles.monthlyLabel}>收入</Text>
            <Text style={[styles.monthlyAmount, styles.incomeColor]}>+{formatMoney(monthIncome)}</Text>
          </View>
          <View style={styles.monthlyItem}>
            <Text style={styles.monthlyLabel}>支出</Text>
            <Text style={[styles.monthlyAmount, styles.expenseColor]}>-{formatMoney(monthExpense)}</Text>
          </View>
          <View style={styles.monthlyItem}>
            <Text style={styles.monthlyLabel}>结余</Text>
            <Text style={[styles.monthlyAmount, monthIncome - monthExpense >= 0 ? styles.incomeColor : styles.expenseColor]}>
              {formatMoney(monthIncome - monthExpense)}
            </Text>
          </View>
        </View>
      </View>

      {/* 最近流水 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>最近流水</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/add')}>
            <Text style={styles.sectionAction}>记一笔</Text>
          </TouchableOpacity>
        </View>

        {transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>暂无流水记录</Text>
            <Text style={styles.emptySubtext}>点击下方"记一笔"开始记账</Text>
          </View>
        ) : (
          transactions.slice(0, 10).map((item) => (
            <View key={item.id} style={styles.transactionItem}>
              <View style={styles.transactionLeft}>
                <Text style={styles.transactionIcon}>
                  {item.type === 'income' ? '💰' : item.type === 'expense' ? '💸' : '🔄'}
                </Text>
                <View>
                  <Text style={styles.transactionTitle}>
                    {item.category?.name || (item.type === 'transfer' ? '转账' : '未知')}
                  </Text>
                  <Text style={styles.transactionDate}>{item.date}</Text>
                </View>
              </View>
              <Text style={[
                styles.transactionAmount,
                item.type === 'income' ? styles.incomeColor :
                item.type === 'expense' ? styles.expenseColor : styles.transferColor
              ]}>
                {item.type === 'income' ? '+' : item.type === 'expense' ? '-' : ''}
                {formatMoney(Number(item.amount))}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* 快捷入口 */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickButton} onPress={() => router.push('/(tabs)/accounts')}>
          <Text style={styles.quickIcon}>💳</Text>
          <Text style={styles.quickText}>账户</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickButton} onPress={() => router.push('/(tabs)/add')}>
          <Text style={styles.quickIcon}>✏️</Text>
          <Text style={styles.quickText}>记账</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickButton} onPress={() => router.push('/more/reports')}>
          <Text style={styles.quickIcon}>📊</Text>
          <Text style={styles.quickText}>报表</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickButton} onPress={() => router.push('/more/budget')}>
          <Text style={styles.quickIcon}>📝</Text>
          <Text style={styles.quickText}>预算</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6'
  },
  header: {
    backgroundColor: '#2DD4BF',
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 20
  },
  assetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20
  },
  assetLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8
  },
  assetAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937'
  },
  monthlyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  monthlyItem: {
    alignItems: 'center'
  },
  monthlyLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4
  },
  monthlyAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  incomeColor: {
    color: '#10B981'
  },
  expenseColor: {
    color: '#EF4444'
  },
  transferColor: {
    color: '#6366F1'
  },
  section: {
    padding: 20
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937'
  },
  sectionAction: {
    fontSize: 14,
    color: '#2DD4BF',
    fontWeight: '500'
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF'
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  transactionIcon: {
    fontSize: 24,
    marginRight: 12
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937'
  },
  transactionDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600'
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    paddingTop: 0
  },
  quickButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    width: 72,
    height: 72,
    justifyContent: 'center'
  },
  quickIcon: {
    fontSize: 24,
    marginBottom: 4
  },
  quickText: {
    fontSize: 12,
    color: '#6B7280'
  }
});
