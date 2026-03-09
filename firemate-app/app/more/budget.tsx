import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useBudgetStore } from '../../src/stores/budgetStore';

export default function BudgetScreen() {
  const { budget, fetchBudget, setBudget } = useBudgetStore();
  const [amount, setAmount] = useState('');
  const [currentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  });

  useEffect(() => {
    fetchBudget(currentMonth);
  }, []);

  const handleSave = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      Alert.alert('提示', '请输入有效的预算金额');
      return;
    }

    try {
      await setBudget(currentMonth, numAmount);
      Alert.alert('成功', '预算设置成功');
    } catch (error: any) {
      Alert.alert('错误', error.message || '设置失败');
    }
  };

  const getProgressColor = (percent: number) => {
    if (percent <= 70) return '#10B981';
    if (percent <= 90) return '#F59E0B';
    return '#EF4444';
  };

  const currentMonthLabel = currentMonth.slice(0, 7).replace('-', '年') + '月';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>预算管理</Text>
        <Text style={styles.headerSubtitle}>{currentMonthLabel}</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>本月预算</Text>
          {budget ? (
            <>
              <Text style={styles.budgetAmount}>¥ {budget.amount.toLocaleString()}</Text>
              <Text style={styles.modifyInfo}>
                已修改 {budget.modified_count}/1 次
              </Text>
            </>
          ) : (
            <Text style={styles.noBudget}>未设置</Text>
          )}
        </View>

        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>
            {budget ? '修改预算' : '设置预算'}
          </Text>
          <View style={styles.inputRow}>
            <Text style={styles.currencySymbol}>¥</Text>
            <TextInput
              style={styles.input}
              placeholder="请输入金额"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          {budget && budget.modified_count >= 1 && (
            <Text style={styles.warningText}>
              本月已修改过一次预算，无法再次修改
            </Text>
          )}

          {(!budget || budget.modified_count < 1) && (
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>保存</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 预算小贴士</Text>
          <Text style={styles.tipText}>• 绿色：支出在 70% 以下</Text>
          <Text style={styles.tipText}>• 橙色：支出在 70%-90%</Text>
          <Text style={styles.tipText}>• 红色：支出超过 90%</Text>
          <Text style={styles.tipText}>• 每月只能修改 1 次预算</Text>
        </View>
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
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4
  },
  content: {
    flex: 1,
    padding: 20
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20
  },
  cardLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8
  },
  budgetAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1F2937'
  },
  modifyInfo: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8
  },
  noBudget: {
    fontSize: 24,
    color: '#9CA3AF'
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 12
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 16
  },
  currencySymbol: {
    fontSize: 20,
    color: '#6B7280',
    marginRight: 8
  },
  input: {
    flex: 1,
    fontSize: 20,
    paddingVertical: 14,
    color: '#1F2937'
  },
  warningText: {
    color: '#F59E0B',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center'
  },
  saveButton: {
    backgroundColor: '#2DD4BF',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  tipCard: {
    backgroundColor: '#ECFDF5',
    padding: 16,
    borderRadius: 12
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 8
  },
  tipText: {
    fontSize: 13,
    color: '#059669',
    lineHeight: 22
  }
});
