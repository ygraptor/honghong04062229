import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 博客文章接口
export interface BlogPost {
  id: number;
  title: string;
  summary: string;
  content: string;
  author: string;
  tags: string | null;
  read_time: string | null;
  created_at: string;
}

// 获取文章列表
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // 获取单篇文章
    if (id) {
      const { data, error } = await client
        .from('blog_posts')
        .select('*')
        .eq('id', parseInt(id))
        .maybeSingle();
      
      if (error) throw new Error(`查询失败: ${error.message}`);
      
      if (!data) {
        return NextResponse.json({ error: '文章不存在' }, { status: 404 });
      }
      
      return NextResponse.json({ post: data as BlogPost });
    }

    // 获取文章列表
    const { data, error } = await client
      .from('blog_posts')
      .select('id, title, summary, author, tags, read_time, created_at')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`查询失败: ${error.message}`);
    
    return NextResponse.json({ 
      posts: data as BlogPost[],
      total: data?.length || 0 
    });
  } catch (error) {
    console.error('Blog API error:', error);
    return NextResponse.json(
      { error: '获取文章失败' },
      { status: 500 }
    );
  }
}

// 创建新文章
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { title, summary, content, author, tags, read_time } = body;

    if (!title || !summary || !content) {
      return NextResponse.json(
        { error: '标题、摘要和内容不能为空' },
        { status: 400 }
      );
    }

    const { data, error } = await client
      .from('blog_posts')
      .insert({
        title,
        summary,
        content,
        author: author || '恋爱研究所',
        tags: tags || null,
        read_time: read_time || '3分钟',
      })
      .select()
      .single();

    if (error) throw new Error(`创建失败: ${error.message}`);

    return NextResponse.json({ 
      success: true, 
      post: data as BlogPost 
    });
  } catch (error) {
    console.error('Create blog error:', error);
    return NextResponse.json(
      { error: '创建文章失败' },
      { status: 500 }
    );
  }
}
