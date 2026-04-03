/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Clock, Calendar, BookOpen } from 'lucide-react';

type BlogPost = {
  id: number;
  title: string;
  summary: string;
  author: string;
  tags: string | null;
  read_time: string | null;
  created_at: string;
};

export default function BlogPostsSearch({ posts }: { posts: BlogPost[] }) {
  const [keyword, setKeyword] = useState('');

  const filteredPosts = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return posts;

    return posts.filter((p) => {
      const title = (p.title ?? '').toLowerCase();
      const summary = (p.summary ?? '').toLowerCase();
      return title.includes(q) || summary.includes(q);
    });
  }, [posts, keyword]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => {
            // 实时过滤已经在 onChange 完成，这里保留 Enter 触发点位（不额外请求）
            if (e.key === 'Enter') e.preventDefault();
          }}
          placeholder="搜索标题或摘要..."
          className="max-w-[360px]"
        />
        {keyword.trim() ? (
          <div className="text-xs text-gray-500">
            匹配：{filteredPosts.length} / {posts.length}
          </div>
        ) : null}
      </div>

      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-400">没有匹配结果</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
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
    </div>
  );
}

