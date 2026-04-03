import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabaseClient } from '@/storage/database/supabase-client';

interface User {
  id: number;
  username: string;
  password: string;
  created_at: string;
}

// 登录
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { username, password } = body;

    // 参数校验
    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名和密码不能为空' },
        { status: 400 }
      );
    }

    // 查询用户
    const { data: user, error: queryError } = await client
      .from('users')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (queryError) {
      return NextResponse.json(
        { error: '服务器错误' },
        { status: 500 }
      );
    }

    if (!user) {
      console.log('[登录API] 用户不存在:', username);
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 400 }
      );
    }

    console.log('[登录API] 找到用户:', username, 'ID:', user.id);
    console.log('[登录API] 数据库密码哈希:', (user as User).password?.substring(0, 20) + '...');
    console.log('[登录API] 输入密码:', password);

    // 验证密码
    const isValid = await bcrypt.compare(password, (user as User).password);
    
    console.log('[登录API] 密码验证结果:', isValid);

    if (!isValid) {
      console.log('[登录API] 密码验证失败');
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 400 }
      );
    }

    // 创建响应并设置 cookie
    const response = NextResponse.json({
      success: true,
      message: '登录成功',
      user: {
        id: user.id,
        username: user.username,
      },
    });

    console.log('=== [登录API] 准备设置Cookie ===');
    console.log('[登录API] 用户ID:', user.id);
    console.log('[登录API] 用户名:', user.username);

    // 设置登录状态 cookie（有效期 7 天）
    // 使用 SameSite=None; Secure 确保跨域 iframe 环境下 Cookie 能正常传递
    // 注意：SameSite=None 必须配合 Secure 使用
    response.cookies.set('user_id', String(user.id), {
      httpOnly: true,
      secure: true,  // 必须为 true 才能使用 SameSite=None
      sameSite: 'none',  // 允许跨域传递
      maxAge: 60 * 60 * 24 * 7, // 7 天
      path: '/',
    });

    // 移除 username Cookie，不再需要
    // 用户信息通过 user_id 从数据库查询，更安全

    console.log('[登录API] Cookie已设置完成 (user_id only, SameSite=none, Secure)');

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: '登录失败' },
      { status: 500 }
    );
  }
}

// 登出
export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: '已退出登录',
  });

  // 清除 cookie
  response.cookies.delete('user_id');

  return response;
}
