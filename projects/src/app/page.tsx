'use client';

import Link from 'next/link';
import { useGameLogic } from '@/hooks/useGameLogic';
import { Gender, AVATARS } from '@/lib/game/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  AlertCircle, 
  Trophy, 
  Flame, 
  Repeat, 
  Gamepad2,
  User,
  Sparkles,
  ChevronLeft,
  MoreVertical,
  Mic,
  Smile,
  BookOpen
} from 'lucide-react';
import { MessageList } from '@/components/MessageBubble';

export default function GamePage() {
  const {
    gameState,
    input,
    setInput,
    isLoading,
    showResult,
    setShowResult,
    showLeaderboard,
    setShowLeaderboard,
    showGenderSelect,
    leaderboard,
    nickname,
    setNickname,
    scrollRef,
    inputRef,
    selectGender,
    sendMessage,
    restartGame,
    submitToLeaderboard,
    loadLeaderboard,
    getAngerColor,
    getPartnerLabel,
    getPartnerAvatar,
  } = useGameLogic();

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
        {/* 性别选择页面 */}
        {showGenderSelect && (
          <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-white/85 backdrop-blur-sm shadow-xl border-0">
              <CardHeader className="text-center pb-2">
                <div className="flex justify-center mb-3">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-lg">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                  AI伴侣哄哄乐
                </CardTitle>
                <p className="text-gray-500 mt-1 text-sm">选择你想哄的对象</p>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                <Button
                  className="w-full h-16 text-lg bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-md transition-all hover:shadow-lg"
                  onClick={() => selectGender('girlfriend' as Gender)}
                >
                  <Avatar className="w-9 h-9 mr-3 ring-2 ring-white/50">
                    <AvatarImage src={AVATARS.girlfriend} alt="女朋友" />
                    <AvatarFallback className="bg-pink-300">女</AvatarFallback>
                  </Avatar>
                  哄女朋友
                </Button>
                <Button
                  className="w-full h-16 text-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-md transition-all hover:shadow-lg"
                  onClick={() => selectGender('boyfriend' as Gender)}
                >
                  <Avatar className="w-9 h-9 mr-3 ring-2 ring-white/50">
                    <AvatarImage src={AVATARS.boyfriend} alt="男朋友" />
                    <AvatarFallback className="bg-blue-300">男</AvatarFallback>
                  </Avatar>
                  哄男朋友
                </Button>
                
                {/* 恋爱攻略入口 */}
                <Link href="/blog" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full h-12 text-base bg-white/60 hover:bg-white/80 border-pink-200 text-pink-600 hover:text-pink-700 transition-all"
                  >
                    <BookOpen className="w-5 h-5 mr-2" />
                    恋爱攻略
                  </Button>
                </Link>
                
                {/* 排行榜入口 */}
                <Link href="/leaderboard" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full h-12 text-base bg-white/60 hover:bg-white/80 border-yellow-200 text-yellow-600 hover:text-yellow-700 transition-all"
                  >
                    <Trophy className="w-5 h-5 mr-2" />
                    排行榜
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 游戏主页面 */}
        {!showGenderSelect && gameState && (
          <>
            {/* 微信风格顶部导航栏 */}
            <header className="bg-[#EDEDED] sticky top-0 z-20 border-b border-gray-200">
              <div className="max-w-4xl mx-auto px-2 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-gray-600"
                    onClick={restartGame}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={getPartnerAvatar(gameState.gender)} />
                      <AvatarFallback className={gameState.gender === 'boyfriend' ? 'bg-blue-300' : 'bg-pink-300'}>
                        {gameState.gender === 'boyfriend' ? '他' : '她'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium text-gray-800">
                        {gameState.gender === 'boyfriend' ? '男朋友' : '女朋友'}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${gameState.gameStatus === 'playing' ? 'bg-green-500' : 'bg-gray-400'}`} />
                        {gameState.gameStatus === 'playing' ? '在线' : '已离开'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-600"
                    onClick={() => {
                      loadLeaderboard();
                      setShowLeaderboard(true);
                    }}
                  >
                    <Trophy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-600"
                    onClick={() => {
                      loadLeaderboard();
                      setShowLeaderboard(true);
                    }}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </header>

            {/* 游戏状态栏 */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100">
              <div className="max-w-4xl mx-auto px-4 py-3">
                {/* 状态数据行 */}
                <div className="flex items-center justify-between gap-4">
                  {/* 愤怒值 */}
                  <div className="flex items-center gap-2 flex-1">
                    <Flame className={`w-5 h-5 ${gameState.angerLevel > 60 ? 'text-red-500 animate-pulse' : 'text-orange-500'}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">愤怒值</span>
                        <span className={`text-sm font-bold ${getAngerColor(gameState.angerLevel)}`}>
                          {gameState.angerLevel}%
                        </span>
                      </div>
                      <Progress 
                        value={gameState.angerLevel} 
                        className="h-1.5"
                      />
                    </div>
                  </div>
                  
                  {/* 分隔线 */}
                  <div className="w-px h-8 bg-gray-200" />
                  
                  {/* 轮数 */}
                  <div className="flex items-center gap-1.5">
                    <Repeat className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-gray-600">
                      <span className="font-medium text-purple-500">{gameState.currentRound}</span>
                      <span className="text-gray-400">/{gameState.maxRounds}</span>
                    </span>
                  </div>
                  
                  {/* 分隔线 */}
                  <div className="w-px h-8 bg-gray-200" />
                  
                  {/* 状态 */}
                  <div className="flex items-center gap-1.5">
                    <Gamepad2 className="w-4 h-4 text-blue-500" />
                    <span className={`text-sm font-medium ${
                      gameState.gameStatus === 'success' ? 'text-green-500' :
                      gameState.gameStatus === 'failed' ? 'text-red-500' :
                      'text-blue-500'
                    }`}>
                      {gameState.gameStatus === 'playing' ? '进行中' :
                       gameState.gameStatus === 'success' ? '成功' : '失败'}
                    </span>
                  </div>
                </div>

                {/* 说话风格 & 生气原因 */}
                {gameState.gameStatus === 'playing' && (
                  <div className="mt-2 pt-2 border-t border-gray-100 flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200 gap-1">
                      <Sparkles className="w-3 h-3" />
                      {gameState.speakingStyle.name}
                    </Badge>
                    <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {gameState.angerReason}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* 对话区域 */}
            <div className="bg-[#EDEDED] min-h-[calc(100vh-200px)] pb-24">
              <ScrollArea className="h-[calc(100vh-200px)]" ref={scrollRef}>
                <div className="max-w-4xl mx-auto p-4">
                  <MessageList
                    messages={gameState.messages}
                    gender={gameState.gender}
                    partnerAvatar={getPartnerAvatar(gameState.gender)}
                    isLoading={isLoading}
                  />
                </div>
              </ScrollArea>
            </div>

            {/* 输入区域 */}
            {gameState.gameStatus === 'playing' && (
              <div className="fixed bottom-0 left-0 right-0 bg-[#F7F7F7] border-t border-gray-200 px-2 py-2 z-20">
                <div className="max-w-4xl mx-auto flex gap-2 items-center">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 text-gray-500 flex-shrink-0"
                  >
                    <Mic className="w-5 h-5" />
                  </Button>
                  
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="说点什么..."
                    disabled={isLoading}
                    className="flex-1 bg-white rounded-lg border-gray-200 px-3 py-2 text-[15px] min-h-[36px]"
                  />
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 text-gray-500 flex-shrink-0"
                  >
                    <Smile className="w-5 h-5" />
                  </Button>
                  
                  <Button 
                    onClick={sendMessage} 
                    disabled={isLoading || !input.trim()}
                    className={`h-9 px-4 rounded-lg text-sm font-medium transition-all ${
                      input.trim() 
                        ? 'bg-[#07C160] hover:bg-[#06AD56] text-white' 
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    发送
                  </Button>
                </div>
              </div>
            )}

            {/* 游戏结果弹窗 */}
            <Dialog open={showResult} onOpenChange={setShowResult}>
              <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-sm">
                <DialogHeader>
                  <DialogTitle className="text-center text-xl">
                    {gameState.gameStatus === 'success' ? (
                      <span className="text-green-500">恭喜哄成功了！</span>
                    ) : (
                      <span className="text-red-500">游戏结束</span>
                    )}
                  </DialogTitle>
                </DialogHeader>
                <div className="text-center py-4">
                  {gameState.gameStatus === 'success' ? (
                    <div>
                      <div className="text-5xl mb-3">💕</div>
                      <p className="text-gray-600">
                        用了 <span className="font-bold text-purple-500">{gameState.currentRound}</span> 轮成功哄好{getPartnerLabel(gameState.gender)}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="text-5xl mb-3">💔</div>
                      <p className="text-gray-600 mb-1">{gameState.failReason}</p>
                      <p className="text-sm text-gray-500">
                        使用了 {gameState.currentRound} 轮
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Input
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="输入昵称提交到排行榜"
                    maxLength={20}
                    className="bg-white"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={restartGame}
                    >
                      再来一局
                    </Button>
                    <Button
                      className="flex-1 bg-[#07C160] hover:bg-[#06AD56]"
                      onClick={submitToLeaderboard}
                      disabled={!nickname.trim()}
                    >
                      提交排行榜
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* 排行榜弹窗 */}
            <Dialog open={showLeaderboard} onOpenChange={setShowLeaderboard}>
              <DialogContent className="sm:max-w-md max-h-[70vh] overflow-hidden flex flex-col bg-white/95 backdrop-blur-sm">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-lg">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    排行榜
                  </DialogTitle>
                </DialogHeader>
                <ScrollArea className="flex-1 -mx-6">
                  <div className="px-6">
                    {leaderboard.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        暂无记录
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {leaderboard.map((entry, idx) => (
                          <div
                            key={entry.id}
                            className={`flex items-center gap-3 p-3 rounded-lg ${
                              idx < 3 ? 'bg-yellow-50' : 'bg-gray-50'
                            }`}
                          >
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm ${
                              idx === 0 ? 'bg-yellow-400 text-white' :
                              idx === 1 ? 'bg-gray-300 text-white' :
                              idx === 2 ? 'bg-orange-400 text-white' :
                              'bg-gray-200 text-gray-600'
                            }`}>
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{entry.nickname}</div>
                              <div className="text-xs text-gray-500">
                                {entry.result === 'success' ? (
                                  <span className="text-green-500">成功</span>
                                ) : (
                                  <span className="text-red-500">失败</span>
                                )}
                                {' · '}{entry.rounds}轮
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </div>
  );
}
