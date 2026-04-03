import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabaseClient } from '@/storage/database/supabase-client';

interface User {
  id: number;
  username: string;
  password: string;
  created_at: string;
}

// 注册
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { action, username, password } = body;

    // 参数校验
    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名和密码不能为空' },
        { status: 400 }
      );
    }

    if (username.length < 2 || username.length > 20) {
      return NextResponse.json(
        { error: '用户名长度需要在 2-20 个字符之间' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少 6 个字符' },
        { status: 400 }
      );
    }

    // 检查用户名是否已存在
    const { data: existingUser, error: checkError } = await client
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (checkError) {
      return NextResponse.json(
        { error: '服务器错误' },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { error: '用户名已存在' },
        { status: 400 }
      );
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const { data: newUser, error: insertError } = await client
      .from('users')
      .insert({
        username,
        password: hashedPassword,
      })
      .select('id, username, created_at')
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: '注册失败，请重试' },
        { status: 500 }
      );
    }

    // 创建响应并设置 cookie
    const response = NextResponse.json({
      success: true,
      message: '注册成功',
      user: {
        id: newUser.id,
        username: newUser.username,
      },
    });

    console.log('=== [注册API] 准备设置Cookie ===');
    console.log('[注册API] 用户ID:', newUser.id);
    console.log('[注册API] 用户名:', newUser.username);

    // 设置登录状态 cookie（有效期 7 天）
    // 使用 SameSite=None; Secure 确保跨域 iframe 环境下 Cookie 能正常传递
    response.cookies.set('user_id', String(newUser.id), {
      httpOnly: true,
      secure: true,  // 必须为 true 才能使用 SameSite=None
      sameSite: 'none',  // 允许跨域传递
      maxAge: 60 * 60 * 24 * 7, // 7 天
      path: '/',
    });

    // 移除 username Cookie，不再需要
    // 用户信息通过 user_id 从数据库查询，更安全

    console.log('[注册API] Cookie已设置完成 (user_id only, SameSite=none, Secure)');

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: '注册失败' },
      { status: 500 }
    );
  }
}
