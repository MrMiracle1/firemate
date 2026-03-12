import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Account } from '../../src/types';
import { useAccountStore } from '../../src/stores/accountStore';
import { VALIDATION_MESSAGES } from '../../src/lib/validation';

const colors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  danger: '#FF3B30',
  warning: '#FF9500',
  background: '#F2F2F7',
  card: '#FFFFFF',
  text: '#000000',
  textSecondary: '#8E8E93',
  textTertiary: '#C7C7CC',
  separator: '#E5E5EA',
};

// 账户图标映射
const accountIconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  cash: 'cash',
  bank_card: 'card',
  third_party: 'phone-portrait',
  investment: 'trending-up',
  savings: 'wallet',
};

interface AccountEditorProps {
  visible: boolean;
  onClose: () => void;
  onSave: (accountId: string, toAccountId?: string) => Promise<void>;
  initialAccountId?: string;
  initialToAccountId?: string;
  isTransfer?: boolean;
  loading?: boolean;
}

export default function AccountEditor({
  visible,
  onClose,
  onSave,
  initialAccountId,
  initialToAccountId,
  isTransfer = false,
  loading = false,
}: AccountEditorProps) {
  const { accounts, fetchAccounts } = useAccountStore();
  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>(initialAccountId);
  const [selectedToAccountId, setSelectedToAccountId] = useState<string | undefined>(initialToAccountId);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchAccounts(true);
      setSelectedAccountId(initialAccountId);
      setSelectedToAccountId(initialToAccountId);
      setError(null);
    }
  }, [visible, initialAccountId, initialToAccountId]);

  const handleSave = async () => {
    if (!selectedAccountId) {
      setError(VALIDATION_MESSAGES.ACCOUNT_REQUIRED);
      return;
    }

    if (isTransfer && !selectedToAccountId) {
      setError(VALIDATION_MESSAGES.TO_ACCOUNT_REQUIRED);
      return;
    }

    if (isTransfer && selectedToAccountId === selectedAccountId) {
      setError(VALIDATION_MESSAGES.TO_ACCOUNT_SAME);
      return;
    }

    setSaving(true);
    try {
      await onSave(selectedAccountId, selectedToAccountId);
      onClose();
    } catch (err) {
      Alert.alert('保存失败', '是否重试？', [
        { text: '取消', style: 'cancel' },
        { text: '重试', onPress: handleSave },
      ]);
    } finally {
      setSaving(false);
    }
  };

  const renderAccount = (account: Account, isToAccount: boolean = false) => {
    const selectedId = isToAccount ? selectedToAccountId : selectedAccountId;
    const isSelected = selectedId === account.id;
    const iconName = accountIconMap[account.type] || 'wallet';

    return (
      <TouchableOpacity
        key={account.id}
        style={[styles.accountItem, isSelected && styles.accountItemSelected]}
        onPress={() => {
          if (isToAccount) {
            setSelectedToAccountId(account.id);
          } else {
            setSelectedAccountId(account.id);
          }
          setError(null);
        }}
      >
        <View style={[styles.accountIcon, { backgroundColor: account.color || colors.primary }]}>
          <Ionicons name={iconName} size={20} color={colors.card} />
        </View>
        <View style={styles.accountInfo}>
          <Text style={[styles.accountName, isSelected && styles.accountNameSelected]}>
            {account.name}
          </Text>
          <Text style={styles.accountBalance}>
            ¥{Number(account.balance).toFixed(2)}
          </Text>
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* 头部 */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.title}>
              {isTransfer ? '选择账户' : '选择账户'}
            </Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* 转出账户 */}
            <Text style={styles.sectionTitle}>
              {isTransfer ? '转出账户' : '支付账户'}
            </Text>
            <View style={styles.accountList}>
              {accounts.map((account) => renderAccount(account, false))}
            </View>

            {/* 转入账户（转账时） */}
            {isTransfer && (
              <>
                <Text style={styles.sectionTitle}>转入账户</Text>
                <View style={styles.accountList}>
                  {accounts
                    .filter((a) => a.id !== selectedAccountId)
                    .map((account) => renderAccount(account, true))}
                </View>
              </>
            )}
          </ScrollView>

          {/* 错误提示 */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* 保存按钮 */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              saving && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? '保存中...' : '保存'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '75%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
    marginTop: 8,
  },
  accountList: {
    gap: 8,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  accountItemSelected: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  accountNameSelected: {
    color: colors.primary,
  },
  accountBalance: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonDisabled: {
    backgroundColor: colors.textTertiary,
  },
  saveButtonText: {
    color: colors.card,
    fontSize: 17,
    fontWeight: '600',
  },
});
