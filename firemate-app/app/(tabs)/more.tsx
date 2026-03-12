import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/lib/auth';

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

const menuItems = [
  { id: 'reports', icon: 'bar-chart' as const, title: '报表分析', desc: '查看收支趋势', color: '#E3F2FD', iconColor: colors.primary },
  { id: 'budget', icon: 'document-text' as const, title: '预算管理', desc: '设置月度预算', color: '#E8F5E9', iconColor: colors.success },
  { id: 'goals', icon: 'flag' as const, title: '储蓄目标', desc: '规划存钱计划', color: '#FFF3E0', iconColor: colors.warning },
  { id: 'categories', icon: 'pricetags' as const, title: '分类管理', desc: '自定义分类', color: '#F3E5F5', iconColor: colors.secondary },
  { id: 'export', icon: 'share-social' as const, title: '数据导出', desc: '导出账单数据', color: '#E0F7FA', iconColor: '#00BCD4' },
  { id: 'settings', icon: 'settings' as const, title: '设置', desc: 'App 偏好设置', color: '#F5F5F5', iconColor: colors.textSecondary }
];

export default function MoreScreen() {
  const router = useRouter();
  const { signOut } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      '退出登录',
      '确定要退出登录吗？',
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '退出登录',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/auth');
          },
        },
      ]
    );
  };

  const handlePress = (id: string) => {
    switch (id) {
      case 'reports':
        router.push('/more/reports');
        break;
      case 'budget':
        router.push('/more/budget');
        break;
      case 'goals':
        router.push('/more/goals');
        break;
      case 'categories':
        router.push('/(tabs)/categories');
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>更多</Text>
          <Text style={styles.headerSubtitle}>个性化设置</Text>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={styles.menuList}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => handlePress(item.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: item.color }]}>
                  <Ionicons name={item.icon} size={22} color={item.iconColor} />
                </View>
                <View style={styles.menuInfo}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuDesc}>{item.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>

          {/* App Info Card */}
          <View style={styles.appInfoCard}>
            <Text style={styles.appName}>火伴记账</Text>
            <Text style={styles.appVersion}>v1.0.0</Text>
            <Text style={styles.appTagline}>让财务管理更简单</Text>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Text style={styles.logoutText}>退出登录</Text>
          </TouchableOpacity>
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
  menuList: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuInfo: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: colors.text,
  },
  menuDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  appInfoCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  appName: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  appVersion: {
    fontSize: 13,
    color: colors.textTertiary,
    marginTop: 4,
  },
  appTagline: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 8,
  },
  logoutButton: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
  },
  logoutText: {
    fontSize: 17,
    color: colors.danger,
    fontWeight: '400',
  },
});
