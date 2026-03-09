import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { useAccountStore } from '../../src/stores/accountStore';
import { Account, AccountType } from '../../src/types';

const accountTypeLabels: Record<AccountType, { name: string; icon: string }> = {
  cash: { name: '现金', icon: '💵' },
  bank_card: { name: '银行卡', icon: '💳' },
  third_party: { name: '第三方支付', icon: '📱' },
  investment: { name: '投资', icon: '📈' },
  savings: { name: '储蓄', icon: '🏦' }
};

export default function AccountsScreen() {
  const { accounts, fetchAccounts, createAccount, updateAccount, deleteAccount } = useAccountStore();
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('cash');
  const [balance, setBalance] = useState('0');
  const [color, setColor] = useState('#2DD4BF');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('提示', '请输入账户名称');
      return;
    }

    const accountData = {
      name: name.trim(),
      type,
      balance: parseFloat(balance) || 0,
      color
    };

    if (editingAccount) {
      await updateAccount(editingAccount.id, accountData);
    } else {
      await createAccount(accountData);
    }

    resetModal();
  };

  const handleDelete = (account: Account) => {
    Alert.alert('确认删除', `确定要删除账户"${account.name}"吗？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => deleteAccount(account.id)
      }
    ]);
  };

  const resetModal = () => {
    setShowModal(false);
    setEditingAccount(null);
    setName('');
    setType('cash');
    setBalance('0');
    setColor('#2DD4BF');
  };

  const openEditModal = (account: Account) => {
    setEditingAccount(account);
    setName(account.name);
    setType(account.type);
    setBalance(account.balance.toString());
    setColor(account.color || '#2DD4BF');
    setShowModal(true);
  };

  // 按类型分组
  const groupedAccounts = accounts.reduce((groups, account) => {
    const typeInfo = accountTypeLabels[account.type];
    const key = typeInfo?.name || account.type;
    if (!groups[key]) groups[key] = [];
    groups[key].push(account);
    return groups;
  }, {} as Record<string, Account[]>);

  const formatMoney = (amount: number) => {
    return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>账户</Text>
      </View>

      <ScrollView style={styles.content}>
        {Object.entries(groupedAccounts).map(([typeName, typeAccounts]) => (
          <View key={typeName} style={styles.group}>
            <Text style={styles.groupTitle}>{typeName}</Text>
            {typeAccounts.map((account) => (
              <TouchableOpacity
                key={account.id}
                style={styles.accountCard}
                onPress={() => openEditModal(account)}
                onLongPress={() => handleDelete(account)}
              >
                <View style={[styles.accountIcon, { backgroundColor: account.color || '#2DD4BF' }]}>
                  <Text style={styles.accountIconText}>
                    {accountTypeLabels[account.type]?.icon || '💰'}
                  </Text>
                </View>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountName}>{account.name}</Text>
                </View>
                <Text style={styles.accountBalance}>¥ {formatMoney(account.balance)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {accounts.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>暂无账户</Text>
            <Text style={styles.emptySubtext}>点击下方按钮添加第一个账户</Text>
          </View>
        )}
      </ScrollView>

      {/* 添加按钮 */}
      <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
        <Text style={styles.addButtonText}>+ 添加账户</Text>
      </TouchableOpacity>

      {/* 添加/编辑弹窗 */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingAccount ? '编辑账户' : '添加账户'}
            </Text>

            <Text style={styles.inputLabel}>账户名称</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="例如：工商银行、微信钱包"
            />

            <Text style={styles.inputLabel}>账户类型</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeRow}>
              {Object.entries(accountTypeLabels).map(([key, val]) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.typeChip, type === key && styles.typeChipActive]}
                  onPress={() => setType(key as AccountType)}
                >
                  <Text style={styles.typeChipText}>{val.icon} {val.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.inputLabel}>初始余额</Text>
            <TextInput
              style={styles.input}
              value={balance}
              onChangeText={setBalance}
              keyboardType="decimal-pad"
              placeholder="0.00"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={resetModal}>
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleSave}>
                <Text style={styles.confirmButtonText}>保存</Text>
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
  group: {
    marginBottom: 20
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 12
  },
  accountCard: {
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
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937'
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937'
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
  typeRow: {
    flexDirection: 'row'
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8
  },
  typeChipActive: {
    backgroundColor: '#2DD4BF'
  },
  typeChipText: {
    fontSize: 13,
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
