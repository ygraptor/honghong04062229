import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 获取当前登录用户信息
 * 
 * 验证逻辑：
 * 1. 只检查 user_id Cookie（HttpOnly，安全性高）
 * 2. 使用 user_id 从数据库查询用户信息
 * 3. 不再依赖 username Cookie（避免跨域问题）
 */
export async function GET(request: NextRequest) {
  try {
    console.log('=== [用户API] 开始获取用户信息 ===');
    
    // 只检查 user_id Cookie
    const userId = request.cookies.get('user_id')?.value;
    console.log('[用户API] user_id Cookie:', userId);

    if (!userId) {
      console.log('[用户API] 结果: 未登录 (user_id Cookie缺失)');
      return NextResponse.json({
        isLoggedIn: false,
        user: null,
      });
    }

    // 从数据库查询用户信息
    const client = getSupabaseClient();
    const { data: user, error } = await client
      .from('users')
      .select('id, username, created_at')
      .eq('id', parseInt(userId))
      .single();

    if (error || !user) {
      console.log('[用户API] 查询用户失败:', error?.message || '用户不存在');
      return NextResponse.json({
        isLoggedIn: false,
        user: null,
      });
    }

    console.log('[用户API] 结果: 已登录, 用户:', user.username);
    return NextResponse.json({
      isLoggedIn: true,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error('[用户API] 错误:', error);
    return NextResponse.json({
      isLoggedIn: false,
      user: null,
    });
  }
}
