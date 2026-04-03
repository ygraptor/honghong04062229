import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Clock, Calendar, BookOpen } from 'lucide-react';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import BlogSecretGenerateButton from '@/components/BlogSecretGenerateButton';
import BlogPostsSearch from '@/components/BlogPostsSearch';

export const metadata: Metadata = {
  title: '恋爱攻略 - AI伴侣哄哄乐',
  description: '专业的恋爱沟通技巧，助你成为哄人高手',
};

interface BlogPost {
  id: number;
  title: string;
  summary: string;
  author: string;
  tags: string | null;
  read_time: string | null;
  created_at: string;
}

// 服务端获取文章列表
async function getPosts(): Promise<BlogPost[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('blog_posts')
    .select('id, title, summary, author, tags, read_time, created_at')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('获取文章列表失败:', error);
    return [];
  }
  
  return (data as BlogPost[]) || [];
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 背景图片 */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/background.png)' }}
      />
      {/* 轻透遮罩层 */}
      <div className="absolute inset-0 bg-white/40" />
      
      {/* 内容区域 */}
      <div className="relative z-10">
        {/* 顶部导航 */}
        <header className="bg-[#EDEDED] sticky top-0 z-20 border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-600">
                <ChevronLeft className="w-4 h-4 mr-1" />
                返回首页
              </Button>
            </Link>
            <div className="flex items-center gap-2 text-gray-600">
              <BookOpen className="w-4 h-4" />
              <span className="text-sm font-medium">恋爱攻略</span>
            </div>
          </div>
        </header>

        {/* 页面标题 */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-2">
              恋爱攻略
            </h1>
            <p className="text-gray-600">专业的恋爱沟通技巧，助你成为哄人高手</p>
          </div>

          {/* 文章列表（支持搜索过滤） */}
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-400">暂无文章</p>
            </div>
          ) : (
            <BlogPostsSearch posts={posts} />
          )}

          {/* 底部提示 */}
          <div className="mt-8 text-center text-gray-400 text-sm">
            更多攻略持续更新中...
          </div>

          {/* 秘密功能：默认隐藏，通过快捷键 Alt+G 临时显示，用于调用 /api/blog/generate */}
          <BlogSecretGenerateButton />
        </div>
      </div>
    </div>
  );
}
