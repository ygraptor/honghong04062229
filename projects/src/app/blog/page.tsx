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

// 服务端获取文章列表，支持按关键词搜索
async function getPosts(keyword?: string): Promise<BlogPost[]> {
  const client = getSupabaseClient();
  const baseSelect =
    'id, title, summary, author, tags, read_time, created_at';

  // 无关键词：直接按时间倒序返回全部
  if (!keyword || !keyword.trim()) {
    const { data, error } = await client
      .from('blog_posts')
      .select(baseSelect)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取文章列表失败:', error);
      return [];
    }
    return (data as BlogPost[]) || [];
  }

  const q = keyword.trim();
  const pattern = `%${q}%`;

  // 兼容性考虑：分别按 title / summary 做 ilike，再在服务端合并去重
  const [byTitle, bySummary] = await Promise.all([
    client
      .from('blog_posts')
      .select(baseSelect)
      .ilike('title', pattern),
    client
      .from('blog_posts')
      .select(baseSelect)
      .ilike('summary', pattern),
  ]);

  if (byTitle.error || bySummary.error) {
    console.error('获取文章列表失败:', {
      titleError: byTitle.error,
      summaryError: bySummary.error,
    });
    return [];
  }

  const map = new Map<number, BlogPost>();
  (byTitle.data as BlogPost[] | null)?.forEach((p) => {
    map.set(p.id, p);
  });
  (bySummary.data as BlogPost[] | null)?.forEach((p) => {
    map.set(p.id, p);
  });

  const merged = Array.from(map.values());
  // 按 created_at 倒序
  merged.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return merged;
}

export default async function BlogPage({
  searchParams,
}: {
  // Next.js 16 在某些运行模式下可能把 searchParams 包成 Promise
  // 所以这里兼容两种情况：searchParams 是对象 或 Promise<对象>
  searchParams?:
    | { [key: string]: string | string[] | undefined }
    | Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const qParam = sp?.q;
  const keyword = Array.isArray(qParam) ? qParam[0] : qParam;
  const posts = await getPosts(keyword);

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

          {/* 页面标题 + 搜索框 */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-2">
              恋爱攻略
            </h1>
            <p className="text-gray-600">专业的恋爱沟通技巧，助你成为哄人高手</p>
          </div>

            <div className="mb-6">
              <BlogPostsSearch />
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
            <div className="space-y-4">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.id}`}>
                  <Card className="bg-white/85 backdrop-blur-sm hover:bg-white/95 transition-all hover:shadow-lg cursor-pointer border-0 shadow-md">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-4">
                        <CardTitle className="text-lg text-gray-800 hover:text-pink-500 transition-colors">
                          {post.title}
                        </CardTitle>
                        <div className="flex items-center gap-1 text-gray-400 text-sm flex-shrink-0">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{post.read_time || '3分钟'}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-2">
                        {post.summary}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {post.tags?.split(',').map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="bg-pink-50 text-pink-600 hover:bg-pink-100"
                            >
                              {tag.trim()}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-1 text-gray-400 text-xs">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(post.created_at).toLocaleDateString('zh-CN')}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
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
