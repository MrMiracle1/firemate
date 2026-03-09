import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rwuszzdciisktpbumvgo.supabase.co';
const supabaseAnonKey = 'sb_publishable_GtwCsNokqvEXq6MI5p_Myg_JIy17klE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// API 配置 - 本地测试用 localhost
export const API_BASE_URL = 'http://localhost:3000';

// 测试用户 ID（开发阶段使用）
export const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';
