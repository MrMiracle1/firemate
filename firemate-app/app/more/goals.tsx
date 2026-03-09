import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, SafeAreaView } from 'react-native';
import { useGoalStore } from '../../src/stores/goalStore';
import { useAccountStore } from '../../src/stores/accountStore';

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

export default function GoalsScreen() {
  const { goals, fetchGoals, createGoal, deleteGoal } = useGoalStore();
  const { accounts, fetchAccounts } = useAccountStore();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [linkedAccountId, setLinkedAccountId] = useState('');

  useEffect(() => {
    fetchGoals();
    fetchAccounts();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('提示', '请输入目标名称');
      return;
    }
    const amount = parseFloat(targetAmount);
    if (!amount || amount <= 0) {
      Alert.alert('提示', '请输入有效的目标金额');
      return;
    }
    if (!linkedAccountId) {
      Alert.alert('提示', '请选择关联账户');
      return;
    }

    await createGoal({
      name: name.trim(),
      target_amount: amount,
      linked_account_id: linkedAccountId
    });

    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setTargetAmount('');
    setLinkedAccountId('');
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return colors.success;
    if (progress >= 70) return colors.warning;
    return colors.primary;
  };

  const formatMoney = (amount: number) => {
    return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>储蓄目标</Text>
          <Text style={styles.headerSubtitle}>设定目标，养成存钱习惯</Text>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {goals.map((goal) => (
            <View key={goal.id} style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <View>
                  <Text style={styles.goalName}>{goal.name}</Text>
                  <Text style={styles.goalTarget}>
                    目标：¥ {formatMoney(goal.target_amount)}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => deleteGoal(goal.id)} activeOpacity={0.7}>
                  <Text style={styles.deleteBtn}>删除</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.progressSection}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(goal.progress || 0, 100)}%`,
                        backgroundColor: getProgressColor(goal.progress || 0)
                      }
                    ]}
                  />
                </View>
                <Text style={[styles.progressText, { color: getProgressColor(goal.progress || 0) }]}>
                  {Math.min(goal.progress || 0, 100).toFixed(1)}%
                </Text>
              </View>

              <View style={styles.statusRow}>
                <View style={[
                  styles.statusBadge,
                  goal.status === 'achieved' && styles.achievedBadge
                ]}>
                  <Text style={[
                    styles.statusText,
                    goal.status === 'achieved' && styles.achievedText
                  ]}>
                    {goal.status === 'achieved' ? '🎉 已达成' : '进行中'}
                  </Text>
                </View>
              </View>
            </View>
          ))}

          {goals.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Text style={styles.emptyIcon}>🎯</Text>
              </View>
              <Text style={styles.emptyText}>暂无储蓄目标</Text>
              <Text style={styles.emptySubtext}>设置目标，帮助你养成存钱习惯</Text>
            </View>
          )}
        </ScrollView>

        {/* 添加按钮 - iOS Floating Button */}
        <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)} activeOpacity={0.8}>
          <Text style={styles.addButtonText}>+ 添加目标</Text>
        </TouchableOpacity>

        {/* 添加弹窗 - iOS Sheet */}
        <Modal visible={showModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <TouchableOpacity style={styles.modalBackdrop} onPress={() => { setShowModal(false); resetForm(); }} />
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>添加储蓄目标</Text>

              <Text style={styles.inputLabel}>目标名称</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="例如：买房首付、买车"
                placeholderTextColor={colors.textTertiary}
              />

              <Text style={styles.inputLabel}>目标金额</Text>
              <View style={styles.amountInputRow}>
                <Text style={styles.currencySymbol}>¥</Text>
                <TextInput
                  style={styles.amountInput}
                  value={targetAmount}
                  onChangeText={setTargetAmount}
                  keyboardType="decimal-pad"
                  placeholder="请输入金额"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>

              <Text style={styles.inputLabel}>关联账户</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.accountRow}>
                  {accounts.map((account) => (
                    <TouchableOpacity
                      key={account.id}
                      style={[
                        styles.accountChip,
                        linkedAccountId === account.id && styles.accountChipActive
                      ]}
                      onPress={() => setLinkedAccountId(account.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.accountChipText,
                        linkedAccountId === account.id && styles.accountChipTextActive
                      ]}>
                        {account.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => { setShowModal(false); resetForm(); }} activeOpacity={0.7}>
                  <Text style={styles.cancelButtonText}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmButton} onPress={handleCreate} activeOpacity={0.8}>
                  <Text style={styles.confirmButtonText}>创建</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  goalCard: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 20,
    marginBottom: 12,
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 5,
    },
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  goalName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  goalTarget: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  deleteBtn: {
    fontSize: 14,
    color: colors.danger,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: colors.background,
    borderRadius: 5,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    width: 60,
    textAlign: 'right',
  },
  statusRow: {
    flexDirection: 'row',
  },
  statusBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  achievedBadge: {
    backgroundColor: '#E8F5E9',
  },
  statusText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
  achievedText: {
    color: colors.success,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    backgroundColor: colors.card,
    borderRadius: 20,
    marginTop: 20,
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 32,
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
  addButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: colors.primary,
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
  addButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 36,
    height: 5,
    backgroundColor: colors.separator,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: colors.background,
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    color: colors.text,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  currencySymbol: {
    fontSize: 18,
    color: colors.textSecondary,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 14,
    color: colors.text,
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
  modalButtons: {
    flexDirection: 'row',
    marginTop: 28,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  confirmButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
