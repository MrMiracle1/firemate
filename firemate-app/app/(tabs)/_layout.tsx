import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    home: '🏠',
    add: '✏️',
    accounts: '💳',
    more: '📋'
  };

  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.icon, focused && styles.iconFocused]}>
        {icons[name] || '•'}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2DD4BF',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        headerShown: false
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '记账',
          tabBarIcon: ({ focused }) => <TabIcon name="add" focused={focused} />
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: '账户',
          tabBarIcon: ({ focused }) => <TabIcon name="accounts" focused={focused} />
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: '更多',
          tabBarIcon: ({ focused }) => <TabIcon name="more" focused={focused} />
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    height: 80,
    paddingTop: 8,
    paddingBottom: 20
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500'
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  icon: {
    fontSize: 24,
    opacity: 0.6
  },
  iconFocused: {
    opacity: 1
  }
});
