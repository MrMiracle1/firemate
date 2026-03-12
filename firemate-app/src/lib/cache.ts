import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'firemate_cache_';
const CACHE_EXPIRY = 1000 * 60 * 30; // 30 分钟缓存过期

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

class CacheService {
  // 设置缓存
  async set<T>(key: string, data: T): Promise<void> {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
    };
    try {
      await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  // 获取缓存
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(CACHE_PREFIX + key);
      if (!cached) return null;

      const cacheItem: CacheItem<T> = JSON.parse(cached);

      // 检查是否过期
      if (Date.now() - cacheItem.timestamp > CACHE_EXPIRY) {
        await this.remove(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  // 移除缓存
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(CACHE_PREFIX + key);
    } catch (error) {
      console.error('Cache remove error:', error);
    }
  }

  // 清除所有缓存
  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      // 逐个删除
      for (const key of cacheKeys) {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }
}

export const cacheService = new CacheService();

// 缓存键常量
export const CACHE_KEYS = {
  ACCOUNTS: 'accounts',
  TRANSACTIONS: 'transactions',
  BUDGET: 'budget',
  GOALS: 'goals',
  TOTAL_SUMMARY: 'total_summary',
  CATEGORIES: 'categories',
};
