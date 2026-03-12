import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rwuszzdciisktpbumvgo.supabase.co';
const supabaseAnonKey = 'sb_publishable_GtwCsNokqvEXq6MI5p_Myg_JIy17klE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// API 配置 - 远程服务器
export const API_BASE_URL = 'http://111.229.145.143:3000';

// 测试用户 ID（开发阶段使用）
export const TEST_USER_ID = 'a6014467-09cb-42df-ab33-ed903b9c4160';
