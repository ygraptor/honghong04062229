/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

type GenerateResponse =
  | {
      success: true;
      message: string;
      post: {
        id?: number;
        title?: string;
        summary?: string;
      };
    }
  | { error: string };

export default function BlogSecretGenerateButton() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState<string>('');

  useEffect(() => {
    // “秘密开关”：按下 Alt+G 显示/隐藏生成按钮
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'g') {
        setVisible(v => !v);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const onGenerate = async () => {
    if (loading) return;
    setLoading(true);
    setResultText('');

    try {
      const res = await fetch('/api/blog/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // API 里会容错 request.json() 失败，所以这里也可以不传 topic
        body: JSON.stringify({}),
      });

      const data = (await res.json()) as GenerateResponse;
      if ('success' in data && data.success) {
        setResultText(
          `${data.message} | 标题：${data.post?.title ?? '-'} | 摘要：${
            data.post?.summary ?? '-'
          }`,
        );
      } else {
        setResultText('生成失败：' + (data as { error?: string }).error);
      }
    } catch (e) {
      setResultText('生成请求失败：' + (e instanceof Error ? e.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end">
      <Button
        className="shadow-lg"
        onClick={onGenerate}
        disabled={loading}
        variant="default"
      >
        {loading ? '生成中...' : '秘密生成博客'}
      </Button>
      {resultText ? (
        <div className="max-w-[320px] rounded-lg border bg-background p-3 text-xs text-foreground/90 shadow">
          {resultText}
        </div>
      ) : null}
    </div>
  );
}

