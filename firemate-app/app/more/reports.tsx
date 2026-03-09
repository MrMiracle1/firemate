import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAccountStore } from '../../src/stores/accountStore';
import { useTransactionStore } from '../../src/stores/transactionStore';

type TabType = 'expense' | 'trend' | 'account';

const COLORS = ['#2DD4BF', '#F59E0B', '#EF4444', '#6366F1', '#EC4899', '#8B5CF6', '#14B8A6', '#F97316'];

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
                <Text style={styles.chartValue}>¥ {formatMoney(amount)}</Text>
              </View>
            </View>
          );
        })}

        {categories.length === 0 && (
          <View style={styles.emptyChart}>
            <Text style={styles.emptyText}>暂无支出数据</Text>
          </View>
        )}
      </View>
    );
  };

  const renderTrendChart = () => {
    return (
      <View>
        {sortedMonths.map((month, index) => {
          const data = monthlyData[month];
          const maxValue = Math.max(data.income, data.expense, 1);
          const incomeHeight = (data.income / maxValue) * 100;
          const expenseHeight = (data.expense / maxValue) * 100;

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
              <Text style={styles.trendMonth}>{month}</Text>
            </View>
          );
        })}

        {sortedMonths.length === 0 && (
          <View style={styles.emptyChart}>
            <Text style={styles.emptyText}>暂无趋势数据</Text>
          </View>
        )}

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendText}>收入</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendText}>支出</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderAccountChart = () => {
    return (
      <View>
        {accounts.map((account, index) => {
          const percent = (account.balance / (accounts.reduce((s, a) => s + Number(a.balance), 0) || 1)) * 100;
          return (
            <View key={account.id} style={styles.accountItem}>
              <View style={[styles.accountIcon, { backgroundColor: COLORS[index % COLORS.length] }]}>
                <Text style={styles.accountIconText}>
                  {account.type === 'cash' ? '💵' :
                   account.type === 'bank_card' ? '💳' :
                   account.type === 'third_party' ? '📱' :
                   account.type === 'investment' ? '📈' : '🏦'}
                </Text>
              </View>
              <View style={styles.accountInfo}>
                <Text style={styles.accountName}>{account.name}</Text>
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
            <Text style={styles.emptyText}>暂无账户数据</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>报表分析</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'expense' && styles.tabActive]}
          onPress={() => setActiveTab('expense')}
        >
          <Text style={[styles.tabText, activeTab === 'expense' && styles.tabTextActive]}>支出分类</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'trend' && styles.tabActive]}
          onPress={() => setActiveTab('trend')}
        >
          <Text style={[styles.tabText, activeTab === 'trend' && styles.tabTextActive]}>月度趋势</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'account' && styles.tabActive]}
          onPress={() => setActiveTab('account')}
        >
          <Text style={[styles.tabText, activeTab === 'account' && styles.tabTextActive]}>账户分布</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'expense' && renderExpenseChart()}
        {activeTab === 'trend' && renderTrendChart()}
        {activeTab === 'account' && renderAccountChart()}
      </ScrollView>
    </View>
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
    paddingBottom: 20,
    paddingHorizontal: 20
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 4,
    margin: 20,
    marginBottom: 0,
    borderRadius: 12
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10
  },
  tabActive: {
    backgroundColor: '#2DD4BF'
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280'
  },
  tabTextActive: {
    color: '#FFFFFF'
  },
  content: {
    flex: 1,
    padding: 20
  },
  chartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  chartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8
  },
  chartLabel: {
    fontSize: 14,
    color: '#6B7280'
  },
  chartRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginRight: 12
  },
  bar: {
    height: '100%',
    borderRadius: 4
  },
  chartValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    width: 80,
    textAlign: 'right'
  },
  trendItem: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
    flex: 1
  },
  trendBars: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
    marginRight: 12
  },
  trendBarWrapper: {
    width: 40,
    height: '100%',
    justifyContent: 'flex-end'
  },
  trendBar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4
  },
  incomeBar: {
    backgroundColor: '#10B981'
  },
  expenseBar: {
    backgroundColor: '#EF4444'
  },
  trendMonth: {
    fontSize: 12,
    color: '#9CA3AF',
    width: 50,
    textAlign: 'center'
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 20
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6
  },
  legendText: {
    fontSize: 14,
    color: '#6B7280'
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8
  },
  accountIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  accountIconText: {
    fontSize: 20
  },
  accountInfo: {
    flex: 1
  },
  accountName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937'
  },
  emptyChart: {
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF'
  }
});
