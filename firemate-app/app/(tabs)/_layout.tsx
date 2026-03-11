import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function TabIcon({ name, focused, iconName }: { name: string; focused: boolean; iconName: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.tabIconContainer}>
      <Ionicons
        name={focused ? iconName : `${iconName}-outline` as keyof typeof Ionicons.glyphMap}
        size={24}
        color={focused ? '#007AFF' : '#8E8E93'}
      />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} iconName="home" />
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '记账',
          tabBarIcon: ({ focused }) => <TabIcon name="add" focused={focused} iconName="create" />
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: '账户',
          tabBarIcon: ({ focused }) => <TabIcon name="accounts" focused={focused} iconName="wallet" />
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: '更多',
          tabBarIcon: ({ focused }) => <TabIcon name="more" focused={focused} iconName="menu" />
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
    height: Platform.OS === 'ios' ? 88 : 65,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
