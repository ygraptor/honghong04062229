'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Medal, Award, ArrowLeft, Crown } from 'lucide-react';

interface LeaderboardEntry {
  id: number;
  nickname: string;
  rounds: number;
  result: string;
  created_at: string;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/game/leaderboard');
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      } catch (error) {
        console.error('加载排行榜失败:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  // 获取排名图标
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-orange-400" />;
      default:
        return <span className="text-gray-500 font-bold">{rank}</span>;
    }
  };

  // 获取排名样式
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200';
      default:
        return 'bg-white border-gray-100';
    }
  };

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
      <div className="relative z-10 min-h-screen p-4">
        <div className="max-w-2xl mx-auto">
          {/* 标题区域 */}
          <div className="flex items-center gap-4 mb-6">
            <Link href="/">
              <Button variant="ghost" size="icon" className="bg-white/80 hover:bg-white">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                排行榜
              </h1>
            </div>
          </div>

          {/* 排行榜卡片 */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-gray-700 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                哄人高手榜
              </CardTitle>
              <p className="text-sm text-gray-500">成功哄好伴侣的玩家排名</p>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                      <div className="w-8 h-8 bg-gray-200 rounded-full" />
                      <div className="flex-1 h-4 bg-gray-200 rounded" />
                      <div className="w-16 h-4 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>暂无记录</p>
                  <p className="text-sm mt-1">成为第一个上榜的哄人高手吧！</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((entry, index) => {
                    const rank = index + 1;
                    return (
                      <div
                        key={entry.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:shadow-md ${getRankStyle(rank)}`}
                      >
                        {/* 排名 */}
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                          {getRankIcon(rank)}
                        </div>

                        {/* 用户信息 */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className={`text-xs ${
                                rank === 1 ? 'bg-yellow-400 text-white' :
                                rank === 2 ? 'bg-gray-400 text-white' :
                                rank === 3 ? 'bg-orange-400 text-white' :
                                'bg-gray-200 text-gray-600'
                              }`}>
                                {entry.nickname.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-gray-800">{entry.nickname}</span>
                          </div>
                        </div>

                        {/* 成绩 */}
                        <div className="text-right">
                          <div className="text-sm font-bold text-gray-800">
                            {entry.rounds} 轮
                          </div>
                          <div className="text-xs text-gray-500">
                            {entry.result === 'success' ? '成功' : '失败'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 返回按钮 */}
          <div className="mt-6 text-center">
            <Link href="/">
              <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white">
                开始游戏
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
