import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import Navbar from '@/components/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'AI伴侣哄哄乐',
    template: '%s | AI伴侣哄哄乐',
  },
  description:
    'AI伴侣哄哄乐是一款模拟恋爱沟通的网页游戏。当你的AI伴侣生气时，用温暖的话语安抚TA，将愤怒值降到0%即可获胜。支持男女双性别，最多20轮对话挑战！',
  keywords: [
    'AI伴侣',
    '哄哄游戏',
    '恋爱模拟',
    '沟通游戏',
    '情感互动',
    'AI游戏',
    '休闲游戏',
    '对话游戏',
    '情侣互动',
  ],
  authors: [{ name: 'AI伴侣哄哄乐' }],
  openGraph: {
    title: 'AI伴侣哄哄乐 | 用爱化解愤怒',
    description:
      '你的AI伴侣生气了！用温暖的话语安抚TA，将愤怒值降到0%即可获胜。支持男女双性别，最多20轮对话挑战。',
    locale: 'zh_CN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    <html lang="zh-CN">
      <body className={`antialiased`}>
        {isDev && <Inspector />}
        <Navbar />
        {children}
      </body>
    </html>
  );
}
