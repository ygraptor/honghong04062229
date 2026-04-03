'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

export default function BlogPostsSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(() => searchParams.get('q') ?? '');
  const [isPending, startTransition] = useTransition();

  // 当 URL 中的 q 变化时，同步到输入框（支持浏览器前进/后退）
  useEffect(() => {
    setKeyword(searchParams.get('q') ?? '');
  }, [searchParams]);

  const applySearch = (value: string) => {
    const q = value.trim();
    const params = new URLSearchParams(searchParams.toString());
    if (q) {
      params.set('q', q);
    } else {
      params.delete('q');
    }
    const queryString = params.toString();
    startTransition(() => {
      router.replace(queryString ? `?${queryString}` : '?', { scroll: false });
    });
  };

  return (
    <form
      className="flex items-center gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        applySearch(keyword);
      }}
    >
      <Input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="搜索标题或摘要..."
        className="max-w-[360px]"
      />
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? '搜索中...' : '搜索'}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => {
          setKeyword('');
          applySearch('');
        }}
      >
        清空
      </Button>
      {!keyword.trim() && !searchParams.get('q') ? (
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <BookOpen className="w-3 h-3" />
          <span>输入关键词后按回车或点搜索</span>
        </div>
      ) : null}
    </form>
  );
}

