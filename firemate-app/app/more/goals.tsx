import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { useGoalStore } from '../../src/stores/goalStore';
import { useAccountStore } from '../../src/stores/accountStore';

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
    if (progress >= 100) return '#10B981';
    if (progress >= 70) return '#F59E0B';
    return '#2DD4BF';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>储蓄目标</Text>
      </View>

      <ScrollView style={styles.content}>
        {goals.map((goal) => (
          <View key={goal.id} style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <View>
                <Text style={styles.goalName}>{goal.name}</Text>
                <Text style={styles.goalTarget}>
                  目标：¥ {goal.target_amount.toLocaleString()}
                </Text>
              </View>
              <TouchableOpacity onPress={() => deleteGoal(goal.id)}>
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
              <Text style={styles.progressText}>
                {Math.min(goal.progress || 0, 100).toFixed(1)}%
              </Text>
            </View>

            <Text style={[
              styles.goalStatus,
              goal.status === 'achieved' && styles.achievedStatus
            ]}>
              {goal.status === 'achieved' ? '🎉 已达成' : '进行中'}
            </Text>
          </View>
        ))}

        {goals.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>暂无储蓄目标</Text>
            <Text style={styles.emptySubtext}>设置目标，帮助你养成存钱习惯</Text>
          </View>
        )}
      </ScrollView>

      {/* 添加按钮 */}
      <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
        <Text style={styles.addButtonText}>+ 添加目标</Text>
      </TouchableOpacity>

      {/* 添加弹窗 */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>添加储蓄目标</Text>

            <Text style={styles.inputLabel}>目标名称</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="例如：买房首付、买车"
            />

            <Text style={styles.inputLabel}>目标金额</Text>
            <TextInput
              style={styles.input}
              value={targetAmount}
              onChangeText={setTargetAmount}
              keyboardType="decimal-pad"
              placeholder="请输入金额"
            />

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
                  >
                    <Text style={styles.accountChipText}>{account.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => { setShowModal(false); resetForm(); }}>
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleCreate}>
                <Text style={styles.confirmButtonText}>创建</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  content: {
    flex: 1,
    padding: 20
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16
  },
  goalName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937'
  },
  goalTarget: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4
  },
  deleteBtn: {
    fontSize: 14,
    color: '#EF4444'
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginRight: 12
  },
  progressFill: {
    height: '100%',
    borderRadius: 4
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    width: 50,
    textAlign: 'right'
  },
  goalStatus: {
    fontSize: 14,
    color: '#2DD4BF',
    fontWeight: '500'
  },
  achievedStatus: {
    color: '#10B981'
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyText: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 8
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF'
  },
  addButton: {
    backgroundColor: '#2DD4BF',
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center'
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
    marginTop: 12
  },
  input: {
    backgroundColor: '#F3F4F6',
    padding: 14,
    borderRadius: 10,
    fontSize: 16
  },
  accountRow: {
    flexDirection: 'row',
    gap: 8
  },
  accountChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8
  },
  accountChipActive: {
    backgroundColor: '#2DD4BF'
  },
  accountChipText: {
    fontSize: 14,
    color: '#6B7280'
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center'
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280'
  },
  confirmButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#2DD4BF',
    alignItems: 'center'
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF'
  }
});
