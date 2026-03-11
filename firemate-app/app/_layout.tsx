import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

// 自定义返回按钮组件
function BackButton() {
  const router = useRouter();
  return (
    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
      <Ionicons name="chevron-back" size={24} color="#007AFF" />
      <Text style={styles.backText}>返回</Text>
    </TouchableOpacity>
  );
}

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#F2F2F7' },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="auth"
          options={{
            headerShown: true,
            headerTitle: '登录/注册',
            headerTransparent: false,
            headerStyle: { backgroundColor: '#F2F2F7' },
            headerTitleStyle: { fontSize: 17, fontWeight: '600', color: '#000' },
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="more/reports"
          options={{
            headerShown: true,
            headerTitle: '报表分析',
            headerTransparent: false,
            headerStyle: { backgroundColor: '#F2F2F7' },
            headerTitleStyle: { fontSize: 17, fontWeight: '600', color: '#000' },
            headerLeft: () => <BackButton />,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="more/budget"
          options={{
            headerShown: true,
            headerTitle: '预算管理',
            headerTransparent: false,
            headerStyle: { backgroundColor: '#F2F2F7' },
            headerTitleStyle: { fontSize: 17, fontWeight: '600', color: '#000' },
            headerLeft: () => <BackButton />,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="more/goals"
          options={{
            headerShown: true,
            headerTitle: '储蓄目标',
            headerTransparent: false,
            headerStyle: { backgroundColor: '#F2F2F7' },
            headerTitleStyle: { fontSize: 17, fontWeight: '600', color: '#000' },
            headerLeft: () => <BackButton />,
            presentation: 'card',
          }}
        />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
  },
  backText: {
    fontSize: 17,
    color: '#007AFF',
  },
});
