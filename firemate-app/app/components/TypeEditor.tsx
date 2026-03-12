import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TransactionType } from '../../src/types';

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

interface TypeEditorProps {
  visible: boolean;
  onClose: () => void;
  onSave: (type: TransactionType) => Promise<void>;
  initialType: TransactionType;
  loading?: boolean;
}

const typeInfo: Record<TransactionType, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string; desc: string }> = {
  expense: {
    label: '支出',
    icon: 'arrow-down-circle',
    color: colors.danger,
    desc: '钱减少，用于消费支出',
  },
  income: {
    label: '收入',
    icon: 'arrow-up-circle',
    color: colors.success,
    desc: '钱增加，如工资、投资收益',
  },
  transfer: {
    label: '转账',
    icon: 'swap-horizontal',
    color: colors.secondary,
    desc: '账户间转移资金',
  },
};

export default function TypeEditor({
  visible,
  onClose,
  onSave,
  initialType,
  loading = false,
}: TypeEditorProps) {
  const [selectedType, setSelectedType] = useState<TransactionType>(initialType);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelectedType(initialType);
    }
  }, [visible, initialType]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(selectedType);
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

  const types: TransactionType[] = ['expense', 'income', 'transfer'];

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
            <Text style={styles.title}>选择类型</Text>
            <View style={styles.placeholder} />
          </View>

          {/* 类型选项 */}
          <View style={styles.typeContainer}>
            {types.map((type) => {
              const info = typeInfo[type];
              const isSelected = selectedType === type;

              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeOption,
                    isSelected && styles.typeOptionSelected,
                    isSelected && { borderColor: info.color },
                  ]}
                  onPress={() => setSelectedType(type)}
                >
                  <View style={[styles.typeIconContainer, { backgroundColor: info.color }]}>
                    <Ionicons name={info.icon} size={28} color={colors.card} />
                  </View>
                  <View style={styles.typeInfo}>
                    <Text style={[styles.typeLabel, isSelected && { color: info.color }]}>
                      {info.label}
                    </Text>
                    <Text style={styles.typeDesc}>{info.desc}</Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={24} color={info.color} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
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
  typeContainer: {
    gap: 12,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeOptionSelected: {
    backgroundColor: '#F5F5FF',
  },
  typeIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  typeInfo: {
    flex: 1,
  },
  typeLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  typeDesc: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
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
