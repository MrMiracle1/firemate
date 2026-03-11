import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBudgetStore } from '../../src/stores/budgetStore';

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
    if (percent <= 70) return colors.success;
    if (percent <= 90) return colors.warning;
    return colors.danger;
  };

  const currentMonthLabel = currentMonth.slice(0, 7).replace('-', '年') + '月';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* Budget Display Card */}
          <View style={styles.budgetCard}>
            <Text style={styles.cardLabel}>本月预算</Text>
            {budget ? (
              <>
                <Text style={styles.budgetAmount}>¥ {budget.amount.toLocaleString()}</Text>
                <View style={styles.budgetInfo}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoValue}>{budget.modified_count}/1</Text>
                    <Text style={styles.infoLabel}>修改次数</Text>
                  </View>
                </View>
              </>
            ) : (
              <Text style={styles.noBudget}>未设置</Text>
            )}
          </View>

          {/* Input Card */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>
              {budget ? '修改预算' : '设置预算'}
            </Text>
            <View style={styles.inputRow}>
              <Text style={styles.currencySymbol}>¥</Text>
              <TextInput
                style={styles.input}
                placeholder="请输入金额"
                placeholderTextColor={colors.textTertiary}
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            {budget && budget.modified_count >= 1 && (
              <View style={styles.warningCard}>
                <Text style={styles.warningText}>
                  本月已修改过一次预算，无法再次修改
                </Text>
              </View>
            )}

            {(!budget || budget.modified_count < 1) && (
              <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
                <Text style={styles.saveButtonText}>保存</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Tips Card */}
          <View style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <Ionicons name="bulb-outline" size={20} color={colors.warning} style={{ marginRight: 8 }} />
              <Text style={styles.tipTitle}>预算小贴士</Text>
            </View>
            <View style={styles.tipContent}>
              <View style={styles.tipRow}>
                <View style={[styles.tipDot, { backgroundColor: colors.success }]} />
                <Text style={styles.tipText}>绿色：支出在 70% 以下</Text>
              </View>
              <View style={styles.tipRow}>
                <View style={[styles.tipDot, { backgroundColor: colors.warning }]} />
                <Text style={styles.tipText}>橙色：支出在 70%-90%</Text>
              </View>
              <View style={styles.tipRow}>
                <View style={[styles.tipDot, { backgroundColor: colors.danger }]} />
                <Text style={styles.tipText}>红色：支出超过 90%</Text>
              </View>
              <View style={styles.tipRow}>
                <View style={[styles.tipDot, { backgroundColor: colors.primary }]} />
                <Text style={styles.tipText}>每月只能修改 1 次预算</Text>
              </View>
            </View>
          </View>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  budgetCard: {
    backgroundColor: colors.card,
    padding: 28,
    borderRadius: 20,
    alignItems: 'center',
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 5,
    },
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  budgetAmount: {
    fontSize: 42,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -1,
  },
  budgetInfo: {
    flexDirection: 'row',
    marginTop: 16,
  },
  infoItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  infoValue: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.primary,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  noBudget: {
    fontSize: 24,
    color: colors.textTertiary,
    marginTop: 8,
  },
  inputCard: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 20,
    marginTop: 16,
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 24,
    color: colors.textSecondary,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 24,
    paddingVertical: 16,
    color: colors.text,
    fontWeight: '600',
  },
  warningCard: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  warningText: {
    color: colors.warning,
    fontSize: 14,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
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
  tipCard: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 20,
    marginTop: 16,
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  tipContent: {
    gap: 10,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  tipText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
