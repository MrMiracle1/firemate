import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category, TransactionType } from '../../src/types';
import { useCategoryStore } from '../../src/stores/categoryStore';
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

// 分类图标映射
const categoryIconMap: Record<string, string> = {
  '🍜': 'restaurant', '🥣': 'cafe', '🍱': 'restaurant', '🍲': 'restaurant', '🍪': 'ice-cream',
  '🚖': 'car', '🚗': 'car', '🚌': 'bus', '🚇': 'train', '🚕': 'taxi', '⛽': 'fuel',
  '🅿️': 'parking', '🛒': 'cart', '👕': 'shirt', '🧴': 'medical', '📱': 'phone-portrait',
  '🏠': 'home', '🏢': 'business', '💡': 'flash', '🔧': 'construct', '🎬': 'film',
  '🎥': 'videocam', '🎮': 'game-controller', '✈️': 'airplane', '💊': 'medical',
  '🏥': 'hospital', '💉': 'medical', '📋': 'document-text', '📚': 'book', '🎓': 'school',
  '📖': 'book', '📝': 'document-text', '📦': 'cube', '💰': 'cash', '💼': 'briefcase',
  '📈': 'trending-up', '🎁': 'gift',
};

function getCategoryIconName(icon?: string): string {
  if (!icon) return 'help-circle';
  return categoryIconMap[icon] || 'help-circle';
}

interface CategoryEditorProps {
  visible: boolean;
  onClose: () => void;
  onSave: (categoryId: string) => Promise<void>;
  initialCategoryId?: string;
  transactionType: TransactionType;
  loading?: boolean;
}

export default function CategoryEditor({
  visible,
  onClose,
  onSave,
  initialCategoryId,
  transactionType,
  loading = false,
}: CategoryEditorProps) {
  const { categories, fetchCategories } = useCategoryStore();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(initialCategoryId);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchCategories(transactionType);
      setSelectedCategoryId(initialCategoryId);
      setError(null);
    }
  }, [visible, transactionType]);

  // 根据交易类型过滤分类
  const filteredCategories = categories.filter((c) => c.type === transactionType);

  const handleSave = async () => {
    if (!selectedCategoryId && transactionType !== 'transfer') {
      setError(VALIDATION_MESSAGES.CATEGORY_REQUIRED);
      return;
    }

    setSaving(true);
    try {
      await onSave(selectedCategoryId || '');
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

  const renderCategory = ({ item }: { item: Category }) => {
    const isSelected = selectedCategoryId === item.id;
    const iconName = getCategoryIconName(item.icon);

    return (
      <TouchableOpacity
        style={[styles.categoryItem, isSelected && styles.categoryItemSelected]}
        onPress={() => {
          setSelectedCategoryId(item.id);
          setError(null);
        }}
      >
        <View style={[styles.categoryIcon, isSelected && styles.categoryIconSelected]}>
          <Ionicons
            name={iconName as any}
            size={22}
            color={isSelected ? colors.card : colors.primary}
          />
        </View>
        <Text style={[styles.categoryName, isSelected && styles.categoryNameSelected]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  if (transactionType === 'transfer') {
    return null; // 转账不需要分类
  }

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
            <Text style={styles.title}>选择分类</Text>
            <View style={styles.placeholder} />
          </View>

          {/* 分类列表 */}
          <FlatList
            data={filteredCategories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            numColumns={4}
            contentContainerStyle={styles.categoryList}
            showsVerticalScrollIndicator={false}
          />

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
    maxHeight: '70%',
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
  categoryList: {
    paddingVertical: 8,
  },
  categoryItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    margin: 4,
    borderRadius: 12,
    backgroundColor: colors.background,
    maxWidth: '25%',
  },
  categoryItemSelected: {
    backgroundColor: colors.primary,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  categoryIconSelected: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  categoryName: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
  },
  categoryNameSelected: {
    color: colors.card,
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
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
