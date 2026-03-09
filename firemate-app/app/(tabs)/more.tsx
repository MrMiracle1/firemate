import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const menuItems = [
  { id: 'reports', icon: '📊', title: '报表分析', desc: '查看收支趋势' },
  { id: 'budget', icon: '📝', title: '预算管理', desc: '设置月度预算' },
  { id: 'goals', icon: '🎯', title: '储蓄目标', desc: '规划存钱计划' },
  { id: 'categories', icon: '🏷️', title: '分类管理', desc: '自定义分类' },
  { id: 'export', icon: '📤', title: '数据导出', desc: '导出账单数据' },
  { id: 'settings', icon: '⚙️', title: '设置', desc: 'App 偏好设置' }
];

export default function MoreScreen() {
  const router = useRouter();

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
      default:
        break;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>更多</Text>
      </View>

      <ScrollView style={styles.content}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => handlePress(item.id)}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuDesc}>{item.desc}</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>火伴记账 v1.0.0</Text>
          <Text style={styles.footerSubtext}>让财务管理更简单</Text>
        </View>
      </ScrollView>
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
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 14
  },
  menuInfo: {
    flex: 1
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937'
  },
  menuDesc: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2
  },
  menuArrow: {
    fontSize: 24,
    color: '#D1D5DB'
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40
  },
  footerText: {
    fontSize: 14,
    color: '#9CA3AF'
  },
  footerSubtext: {
    fontSize: 12,
    color: '#D1D5DB',
    marginTop: 4
  }
});
