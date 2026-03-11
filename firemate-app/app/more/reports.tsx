import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAccountStore } from '../../src/stores/accountStore';
import { useTransactionStore } from '../../src/stores/transactionStore';

// Apple Design Color Palette
const colors = {
  primary: '#007AFF',        // iOS Blue
  secondary: '#5856D6',      // iOS Purple
  success: '#34C759',        // iOS Green
  danger: '#FF3B30',         // iOS Red
  warning: '#FF9500',        // iOS Orange
  background: '#F2F2F7',  // iOS Light Gray
  card: '#FFFFFF',
  text: '#000000',
  textSecondary: '#8E8E93',
  textTertiary: '#C7C7CC',
  separator: '#E5E5EA',
};

type TabType = 'expense' | 'trend' | 'account';

const COLORS = ['#007AFF', '#FF9500', '#FF3B30', '#5856D6', '#FF2D55', '#AF52DE', '#34C759', '#5AC8FA'];

export default function ReportsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('expense');
  const { accounts, fetchAccounts } = useAccountStore();
  const { transactions, fetchTransactions } = useTransactionStore();

  useEffect(() => {
    fetchAccounts();
    fetchTransactions(true);
  }, []);

  // 按分类统计支出
  const expenseByCategory: Record<string, number> = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const catName = t.category?.name || '其他';
      expenseByCategory[catName] = (expenseByCategory[catName] || 0) + Number(t.amount);
    });

  const totalExpense = Object.values(expenseByCategory).reduce((a, b) => a + b, 0);

  // 按月统计趋势
  const monthlyData: Record<string, { income: number; expense: number }> = {};
  transactions.forEach(t => {
    const month = t.date.slice(0, 7);
    if (!monthlyData[month]) {
      monthlyData[month] = { income: 0, expense: 0 };
    }
    if (t.type === 'income') {
      monthlyData[month].income += Number(t.amount);
    } else if (t.type === 'expense') {
      monthlyData[month].expense += Number(t.amount);
    }
  });

  const sortedMonths = Object.keys(monthlyData).sort().slice(-6);

  const formatMoney = (amount: number) => {
    return amount.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const renderExpenseChart = () => {
    const categories = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1]);

    return (
      <View>
        {categories.map(([cat, amount], index) => {
          const percent = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
          return (
            <View key={cat} style={styles.chartItem}>
              <View style={styles.chartLeft}>
                <View style={[styles.colorDot, { backgroundColor: COLORS[index % COLORS.length] }]} />
                <Text style={styles.chartLabel}>{cat}</Text>
              </View>
              <View style={styles.chartRight}>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      { width: `${percent}%`, backgroundColor: COLORS[index % COLORS.length] }
                    ]}
                  />
                </View>
                <View style={styles.chartValueContainer}>
                  <Text style={styles.chartPercent}>{percent.toFixed(1)}%</Text>
                  <Text style={styles.chartValue}>¥ {formatMoney(amount)}</Text>
                </View>
              </View>
            </View>
          );
        })}

        {categories.length === 0 && (
          <View style={styles.emptyChart}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="pie-chart-outline" size={32} color={colors.textTertiary} />
            </View>
            <Text style={styles.emptyText}>暂无支出数据</Text>
            <Text style={styles.emptySubtext}>开始记账后即可查看分析</Text>
          </View>
        )}
      </View>
    );
  };

  const renderTrendChart = () => {
    const maxMonth = sortedMonths.length > 0 ? Math.max(
      ...sortedMonths.map(m => Math.max(monthlyData[m].income, monthlyData[m].expense))
    ) : 1;

    return (
      <View>
        <View style={styles.trendChart}>
          {sortedMonths.map((month, index) => {
            const data = monthlyData[month];
            const incomeHeight = (data.income / maxMonth) * 100;
            const expenseHeight = (data.expense / maxMonth) * 100;

            return (
              <View key={month} style={styles.trendItem}>
                <View style={styles.trendBars}>
                  <View style={styles.trendBarWrapper}>
                    <View style={[styles.trendBar, styles.incomeBar, { height: `${incomeHeight}%` }]} />
                  </View>
                  <View style={styles.trendBarWrapper}>
                    <View style={[styles.trendBar, styles.expenseBar, { height: `${expenseHeight}%` }]} />
                  </View>
                </View>
                <Text style={styles.trendMonth}>{month.slice(5)}月</Text>
              </View>
            );
          })}
        </View>

        {sortedMonths.length === 0 && (
          <View style={styles.emptyChart}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="trending-up-outline" size={32} color={colors.textTertiary} />
            </View>
            <Text style={styles.emptyText}>暂无趋势数据</Text>
            <Text style={styles.emptySubtext}>开始记账后即可查看月度趋势</Text>
          </View>
        )}

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
            <Text style={styles.legendText}>收入</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.danger }]} />
            <Text style={styles.legendText}>支出</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderAccountChart = () => {
    const totalBalance = accounts.reduce((s, a) => s + Number(a.balance), 0);

    return (
      <View>
        {accounts.map((account, index) => {
          const percent = totalBalance > 0 ? (account.balance / totalBalance) * 100 : 0;
          return (
            <View key={account.id} style={styles.accountItem}>
              <View style={[styles.accountIcon, { backgroundColor: COLORS[index % COLORS.length] + '20' }]}>
                <Ionicons
                  name={account.type === 'cash' ? 'cash' :
                        account.type === 'bank_card' ? 'card' :
                        account.type === 'third_party' ? 'phone-portrait' :
                        account.type === 'investment' ? 'trending-up' : 'business'}
                  size={22}
                  color={COLORS[index % COLORS.length]}
                />
              </View>
              <View style={styles.accountInfo}>
                <View style={styles.accountNameRow}>
                  <Text style={styles.accountName}>{account.name}</Text>
                  <Text style={styles.accountPercent}>{percent.toFixed(1)}%</Text>
                </View>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      { width: `${percent}%`, backgroundColor: COLORS[index % COLORS.length] }
                    ]}
                  />
                </View>
              </View>
              <Text style={styles.accountBalance}>¥ {formatMoney(account.balance)}</Text>
            </View>
          );
        })}

        {accounts.length === 0 && (
          <View style={styles.emptyChart}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="wallet-outline" size={32} color={colors.textTertiary} />
            </View>
            <Text style={styles.emptyText}>暂无账户数据</Text>
            <Text style={styles.emptySubtext}>添加账户后即可查看分布</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Tab Bar - iOS Segmented Control */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'expense' && styles.tabActive]}
            onPress={() => setActiveTab('expense')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'expense' && styles.tabTextActive]}>支出分类</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'trend' && styles.tabActive]}
            onPress={() => setActiveTab('trend')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'trend' && styles.tabTextActive]}>月度趋势</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'account' && styles.tabActive]}
            onPress={() => setActiveTab('account')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'account' && styles.tabTextActive]}>账户分布</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {activeTab === 'expense' && renderExpenseChart()}
          {activeTab === 'trend' && renderTrendChart()}
          {activeTab === 'account' && renderAccountChart()}
        </ScrollView>
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    marginHorizontal: 20,
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
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  chartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: colors.card,
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
  chartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 90,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  chartLabel: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  chartRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
  chartValueContainer: {
    alignItems: 'flex-end',
    width: 80,
  },
  chartPercent: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  chartValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  trendChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 16,
    height: 200,
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
  },
  trendItem: {
    flex: 1,
    alignItems: 'center',
  },
  trendBars: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: '100%',
    gap: 4,
  },
  trendBarWrapper: {
    flex: 1,
    maxWidth: 20,
    height: '100%',
    justifyContent: 'flex-end',
  },
  trendBar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  incomeBar: {
    backgroundColor: colors.success,
  },
  expenseBar: {
    backgroundColor: colors.danger,
  },
  trendMonth: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  accountInfo: {
    flex: 1,
  },
  accountNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  accountName: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  accountPercent: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 12,
  },
  emptyChart: {
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: colors.card,
    borderRadius: 20,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.background,
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
});
