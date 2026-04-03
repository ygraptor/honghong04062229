import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { ChevronLeft, Clock, Calendar, BookOpen, ChevronRight } from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

interface BlogPost {
  id: number;
  title: string;
  summary: string;
  content: string;
  author: string;
  tags: string | null;
  read_time: string | null;
  created_at: string;
}

// 获取单篇文章
async function getPostById(id: number): Promise<BlogPost | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) {
    console.error('获取文章失败:', error);
    return null;
  }
  
  return data as BlogPost | null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await getPostById(parseInt(id));
  
  if (!post) {
    return {
      title: '文章未找到',
    };
  }

  return {
    title: `${post.title} - 恋爱攻略`,
    description: post.summary,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { id } = await params;
  const post = await getPostById(parseInt(id));

  if (!post) {
    notFound();
  }

  // 将文章内容按段落分割
  const paragraphs = post.content.split('\n\n').filter(p => p.trim());

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
        {/* 顶部导航 - 面包屑 */}
        <header className="bg-[#EDEDED] sticky top-0 z-20 border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/blog">
              <Button variant="ghost" size="sm" className="text-gray-600">
                <ChevronLeft className="w-4 h-4 mr-1" />
                返回列表
              </Button>
            </Link>
            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <Link href="/" className="hover:text-pink-500">首页</Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/blog" className="hover:text-pink-500">恋爱攻略</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-700 max-w-[100px] truncate">{post.title}</span>
            </div>
          </div>
        </header>

        {/* 文章内容 */}
        <article className="max-w-4xl mx-auto px-4 py-8">
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6 md:p-8">
              {/* 文章标题 */}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                {post.title}
              </h1>

              {/* 文章元信息 */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(post.created_at).toLocaleDateString('zh-CN')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>阅读 {post.read_time || '3分钟'}</span>
                </div>
              </div>

              {/* 标签 */}
              {post.tags && (
                <div className="flex gap-2 mb-6">
                  {post.tags.split(',').map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="bg-pink-50 text-pink-600"
                    >
                      {tag.trim()}
                    </Badge>
                  ))}
                </div>
              )}

              {/* 文章正文 */}
              <div className="prose prose-gray max-w-none">
                {paragraphs.map((paragraph, index) => {
                  // 检查是否是标题（以 ** 开头和结尾）
                  if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                    const title = paragraph.slice(2, -2);
                    return (
                      <h3 
                        key={index} 
                        className="text-lg font-bold text-gray-800 mt-6 mb-3 flex items-center gap-2"
                      >
                        <span className="w-1 h-5 bg-pink-500 rounded-full" />
                        {title}
                      </h3>
                    );
                  }
                  return (
                    <p 
                      key={index} 
                      className="text-gray-700 leading-relaxed mb-4 text-[15px]"
                    >
                      {paragraph}
                    </p>
                  );
                })}
              </div>

              {/* 底部操作 */}
              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                <Link href="/blog">
                  <Button variant="outline" className="gap-1">
                    <ChevronLeft className="w-4 h-4" />
                    查看更多攻略
                  </Button>
                </Link>
                <Link href="/">
                  <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
                    去哄哄TA
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </article>
      </div>
    </div>
  );
}
