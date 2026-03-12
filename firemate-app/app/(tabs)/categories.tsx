import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCategoryStore } from '../../src/stores/categoryStore';
import { Category, CategoryType } from '../../src/types';

// 分类图标映射
const CATEGORY_ICONS: Record<string, string> = {
  // 支出分类
  '餐饮': '🍽️',
  '交通': '🚗',
  '购物': '🛍️',
  '居住': '🏠',
  '娱乐': '🎮',
  '医疗': '💊',
  '教育': '📚',
  '其他': '📦',
  // 收入分类
  '工资': '💰',
  '兼职': '💼',
  '投资': '📈',
  '其他收入': '💵',
};

export default function CategoriesPage() {
  const router = useRouter();
  const { categories, loading, fetchCategories, createCategory, updateCategory, deleteCategory } = useCategoryStore();
  const [activeTab, setActiveTab] = useState<CategoryType>('expense');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const expenseCategories = categories.filter(c => c.type === 'expense' && !c.parent_id);
  const incomeCategories = categories.filter(c => c.type === 'income' && !c.parent_id);

  const currentCategories = activeTab === 'expense' ? expenseCategories : incomeCategories;

  const handleAddCategory = () => {
    setEditingCategory(null);
    setNewName('');
    setNewIcon('📦');
    setModalVisible(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewName(category.name);
    setNewIcon(category.icon || '📦');
    setModalVisible(true);
  };

  const handleSaveCategory = async () => {
    if (!newName.trim()) {
      Alert.alert('提示', '请输入分类名称');
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: newName.trim(),
          icon: newIcon,
        });
      } else {
        await createCategory({
          name: newName.trim(),
          type: activeTab,
          icon: newIcon,
          is_default: false,
        });
      }
      setModalVisible(false);
      fetchCategories();
    } catch (error) {
      Alert.alert('错误', '保存分类失败');
    }
  };

  const handleDeleteCategory = (category: Category) => {
    if (category.is_default) {
      Alert.alert('提示', '默认分类不能删除');
      return;
    }

    Alert.alert('确认删除', `确定要删除分类"${category.name}"吗？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCategory(category.id);
            fetchCategories();
          } catch (error) {
            Alert.alert('错误', '删除分类失败');
          }
        },
      },
    ]);
  };

  const renderCategory = (category: Category) => (
    <View key={category.id} style={styles.categoryItem}>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryIcon}>{category.icon || CATEGORY_ICONS[category.name] || '📦'}</Text>
        <Text style={styles.categoryName}>{category.name}</Text>
        {category.is_default && <Text style={styles.defaultBadge}>默认</Text>}
      </View>
      <View style={styles.categoryActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditCategory(category)}
        >
          <Text style={styles.actionText}>编辑</Text>
        </TouchableOpacity>
        {!category.is_default && (
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteCategory(category)}
          >
            <Text style={[styles.actionText, styles.deleteText]}>删除</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 顶部导航 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.title}>分类管理</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tab 切换 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'expense' && styles.activeTab]}
          onPress={() => setActiveTab('expense')}
        >
          <Text style={[styles.tabText, activeTab === 'expense' && styles.activeTabText]}>
            支出分类
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'income' && styles.activeTab]}
          onPress={() => setActiveTab('income')}
        >
          <Text style={[styles.tabText, activeTab === 'income' && styles.activeTabText]}>
            收入分类
          </Text>
        </TouchableOpacity>
      </View>

      {/* 分类列表 */}
      <ScrollView style={styles.listContainer}>
        {currentCategories.map(renderCategory)}
      </ScrollView>

      {/* 添加按钮 */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddCategory}>
        <Text style={styles.addButtonText}>+ 添加分类</Text>
      </TouchableOpacity>

      {/* 编辑弹窗 */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingCategory ? '编辑分类' : '新建分类'}
            </Text>

            <Text style={styles.inputLabel}>分类名称</Text>
            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
              placeholder="请输入分类名称"
              placeholderTextColor="#999"
            />

            <Text style={styles.inputLabel}>选择图标</Text>
            <View style={styles.iconGrid}>
              {Object.entries(CATEGORY_ICONS).map(([name, icon]) => (
                <TouchableOpacity
                  key={name}
                  style={[styles.iconItem, newIcon === icon && styles.selectedIcon]}
                  onPress={() => setNewIcon(icon)}
                >
                  <Text style={styles.iconText}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveCategory}
              >
                <Text style={styles.saveButtonText}>保存</Text>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 60,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#E8F5E9',
  },
  tabText: {
    fontSize: 15,
    color: '#666',
  },
  activeTabText: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    color: '#333',
  },
  defaultBadge: {
    marginLeft: 8,
    fontSize: 12,
    color: '#999',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryActions: {
    flexDirection: 'row',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#007AFF',
  },
  deleteButton: {},
  deleteText: {
    color: '#FF3B30',
  },
  addButton: {
    backgroundColor: '#007AFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  iconItem: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    margin: 4,
  },
  selectedIcon: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  iconText: {
    fontSize: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    marginLeft: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
