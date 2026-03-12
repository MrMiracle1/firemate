import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAccountStore } from '../../src/stores/accountStore';
import { validateForm, accountSchema } from '../../src/lib/validation';
import { Account, AccountType } from '../../src/types';

// Apple Design Color Palette
const colors = {
  primary: '#007AFF',        // iOS Blue
  secondary: '#5856D6',     // iOS Purple
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

const accountTypeLabels: Record<AccountType, { name: string; icon: keyof typeof Ionicons.glyphMap }> = {
  cash: { name: '现金', icon: 'cash' },
  bank_card: { name: '银行卡', icon: 'card' },
  third_party: { name: '第三方支付', icon: 'phone-portrait' },
  investment: { name: '投资', icon: 'trending-up' },
  savings: { name: '储蓄', icon: 'business' }
};

export default function AccountsScreen() {
  const { accounts, fetchAccounts, createAccount, updateAccount, deleteAccount } = useAccountStore();
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('cash');
  const [balance, setBalance] = useState('0');
  const [color, setColor] = useState('#007AFF');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSave = async () => {
    // 使用 zod 验证
    const validation = validateForm(accountSchema, {
      name: name.trim(),
      type,
      balance: parseFloat(balance) || 0,
      color
    });

    if (!validation.success) {
      Alert.alert('验证失败', validation.errors[0]);
      return;
    }

    const accountData = validation.data;

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
    setColor('#007AFF');
  };

  const openEditModal = (account: Account) => {
    setEditingAccount(account);
    setName(account.name);
    setType(account.type);
    setBalance(account.balance.toString());
    setColor(account.color || '#007AFF');
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

  // 计算总资产
  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>账户</Text>
          <Text style={styles.headerSubtitle}>总资产 ¥ {formatMoney(totalBalance)}</Text>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {Object.entries(groupedAccounts).map(([typeName, typeAccounts]) => (
            <View key={typeName} style={styles.group}>
              <Text style={styles.groupTitle}>{typeName}</Text>
              {typeAccounts.map((account) => (
                <TouchableOpacity
                  key={account.id}
                  style={styles.accountCard}
                  onPress={() => openEditModal(account)}
                  onLongPress={() => handleDelete(account)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.accountIcon, { backgroundColor: account.color || '#E3F2FD' }]}>
                    <Ionicons
                      name={accountTypeLabels[account.type]?.icon || 'cash'}
                      size={24}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.accountInfo}>
                    <Text style={styles.accountName}>{account.name}</Text>
                  </View>
                  <Text style={styles.accountBalance}>¥ {formatMoney(account.balance)}</Text>
                  {/* Web 端删除按钮 */}
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleDelete(account);
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          {accounts.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="wallet-outline" size={36} color={colors.textTertiary} />
              </View>
              <Text style={styles.emptyText}>暂无账户</Text>
              <Text style={styles.emptySubtext}>点击下方按钮添加第一个账户</Text>
            </View>
          )}
        </ScrollView>

        {/* 添加按钮 - iOS Floating Button */}
        <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)} activeOpacity={0.8}>
          <Text style={styles.addButtonText}>+ 添加账户</Text>
        </TouchableOpacity>

        {/* 添加/编辑弹窗 - iOS Sheet */}
        <Modal visible={showModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <TouchableOpacity style={styles.modalBackdrop} onPress={resetModal} />
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>
                {editingAccount ? '编辑账户' : '添加账户'}
              </Text>

              <Text style={styles.inputLabel}>账户名称</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="例如：工商银行、微信钱包"
                placeholderTextColor={colors.textTertiary}
              />

              <Text style={styles.inputLabel}>账户类型</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeRow}>
                {Object.entries(accountTypeLabels).map(([key, val]) => (
                  <TouchableOpacity
                    key={key}
                    style={[styles.typeChip, type === key && styles.typeChipActive]}
                    onPress={() => setType(key as AccountType)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={type === key ? val.icon : `${val.icon}-outline` as keyof typeof Ionicons.glyphMap}
                      size={18}
                      color={type === key ? '#FFFFFF' : colors.textSecondary}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={[styles.typeChipText, type === key && styles.typeChipTextActive]}>
                      {val.name}
                    </Text>
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
                placeholderTextColor={colors.textTertiary}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={resetModal} activeOpacity={0.7}>
                  <Text style={styles.cancelButtonText}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmButton} onPress={handleSave} activeOpacity={0.8}>
                  <Text style={styles.confirmButtonText}>保存</Text>
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
  group: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  accountCard: {
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
  accountName: {
    fontSize: 17,
    fontWeight: '500',
    color: colors.text,
  },
  accountBalance: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginRight: 8,
  },
  deleteButton: {
    padding: 4,
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
  typeRow: {
    flexDirection: 'row',
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.background,
    marginRight: 8,
  },
  typeChipActive: {
    backgroundColor: colors.primary,
  },
  typeChipText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  typeChipTextActive: {
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
