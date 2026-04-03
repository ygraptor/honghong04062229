'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useGameState } from './useGameState';
import { Gender, Message, LeaderboardEntry, AVATARS } from '@/lib/game/types';

interface UseGameLogicReturn {
  // 游戏状态
  gameState: ReturnType<typeof useGameState>['gameState'];
  
  // UI 状态
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  showResult: boolean;
  setShowResult: (value: boolean) => void;
  showLeaderboard: boolean;
  setShowLeaderboard: (value: boolean) => void;
  showGenderSelect: boolean;
  leaderboard: LeaderboardEntry[];
  nickname: string;
  setNickname: (value: string) => void;
  
  // Refs
  scrollRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  
  // 游戏操作
  selectGender: (gender: Gender) => void;
  sendMessage: () => Promise<void>;
  restartGame: () => void;
  submitToLeaderboard: () => Promise<void>;
  loadLeaderboard: () => Promise<void>;
  
  // 辅助函数
  getAngerColor: (anger: number) => string;
  getPartnerLabel: (gender?: Gender) => string;
  getPartnerAvatar: (gender?: Gender) => string;
}

export function useGameLogic(): UseGameLogicReturn {
  const { gameState, initGame, addUserMessage, addAIMessage, resetGame } = useGameState();
  
  // UI 状态
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showGenderSelect, setShowGenderSelect] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [nickname, setNickname] = useState('');
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  
  // Refs
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [gameState?.messages]);

  // 游戏结束时显示结果
  useEffect(() => {
    if (gameState?.gameStatus !== 'playing' && gameState !== null) {
      setShowResult(true);
    }
  }, [gameState?.gameStatus]);

  // 选择性别并开始游戏
  const selectGender = useCallback((gender: Gender) => {
    setShowGenderSelect(false);
    initGame(gender);
  }, [initGame]);

  /** 把 AI 回复文字交给 /api/game/tts，拿到音频地址后用 new Audio 播放（与聊天接口分离）。须放在 sendMessage 之前，供外挂分支与普通分支共用。 */
  const synthesizeSpeech = useCallback(async (text: string, gender?: Gender, ttsStyle?: string) => {
    try {
      const response = await fetch('/api/game/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, gender, ttsStyle }),
      });

      const data = await response.json();

      if (data.audioUri) {
        if (currentAudio) {
          currentAudio.pause();
        }
        const audio = new Audio(data.audioUri);
        setCurrentAudio(audio);
        audio.play().catch(e => console.log('音频播放失败:', e));
      }
    } catch (error) {
      console.error('语音合成失败:', error);
    }
  }, [currentAudio]);

  /**
   * 发送一条用户消息 → 调后端 /api/game/chat → 把 AI 回复和怒气变化写进状态。
   *
   * 流程（大白话）：
   * 1. 先把输入框清空、锁住 loading，避免连点重复提交。
   * 2. addUserMessage：立刻在本地把「用户说的话」塞进消息列表（并增加回合数），不等网络。
   * 2.5（物理外挂）若命中关键词，跳过 fetch，本地直接 addAIMessage（含固定怒气变化 -50）。
   * 3. fetch POST：把「当前用户这句 + 整局游戏上下文」打成 JSON 发给同域 API，浏览器会自动带上当前页面的 origin（例如 localhost:5000）。
   * 4. 后端返回的是普通 JSON（不是流式给前端）：{ message, angerChange, isRude }。
   * 5. addAIMessage：用这三个字段更新「AI 气泡」和愤怒值/胜负（具体逻辑在 useGameState 里）。
   * 6. 若有回复文字，再调 TTS 接口播语音（和聊天请求是两次独立的 HTTP）。
   */
  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading || gameState?.gameStatus !== 'playing') return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    addUserMessage(userMessage);

    // ---------- 物理外挂：命中关键词则不走大模型，本地直接结算 ----------
    const hitBagCheat =
      userMessage.includes('买包') || userMessage.includes('清空购物车');
    if (hitBagCheat) {
      const cheatReply =
        '哼，看在包包的份上，这次就先原谅你一半。下次再犯，十个包都哄不好！';
      // 与后端约定一致：angerChange 为负数表示消气；useGameState 内为 prev.angerLevel + angerChange
      addAIMessage(cheatReply, -50, false);
      synthesizeSpeech(cheatReply, gameState?.gender, gameState?.speakingStyle.ttsStyle);
      setIsLoading(false);
      inputRef.current?.focus();
      return;
    }

    try {
      // 同域 API：路径以 / 开头，浏览器会发到当前页面所在域名（开发时一般是 http://localhost:5000/api/game/chat）
      const response = await fetch('/api/game/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // 后端需要「整局上下文」才能续写对话：除了当前这句 message，还要带上历史 messages、说话风格、生气原因、当前怒气等
        body: JSON.stringify({
          message: userMessage,
          speakingStyle: gameState?.speakingStyle,
          angerReason: gameState?.angerReason,
          angerLevel: gameState?.angerLevel,
          currentRound: gameState?.currentRound,
          messages: gameState?.messages,
          gender: gameState?.gender,
        }),
      });

      // 注意：这里用的是 response.json()，说明后端把流式拼完后一次性返回；前端不负责「拼流」
      const data = await response.json();
      // angerChange / isRude 会进 useGameState.addAIMessage，在那里和旧 angerLevel 做加减并判定胜负
      addAIMessage(data.message, data.angerChange, data.isRude);

      if (data.message) {
        // TTS 用当前局的 gender 和风格；若闭包里的 gameState 有滞后，一般仍与本轮一致
        synthesizeSpeech(data.message, gameState?.gender, gameState?.speakingStyle.ttsStyle);
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      addAIMessage('...（没有回应）', 5, false);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [input, isLoading, gameState, addUserMessage, addAIMessage, synthesizeSpeech]);

  // 加载排行榜
  const loadLeaderboard = useCallback(async () => {
    try {
      const response = await fetch('/api/game/leaderboard');
      const data = await response.json();
      setLeaderboard(data.leaderboard);
    } catch (error) {
      console.error('加载排行榜失败:', error);
    }
  }, []);

  // 提交到排行榜
  const submitToLeaderboard = useCallback(async () => {
    if (!nickname.trim() || !gameState) return;

    try {
      await fetch('/api/game/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: nickname.trim(),
          rounds: gameState.currentRound,
          result: gameState.gameStatus,
        }),
      });

      setShowResult(false);
      loadLeaderboard();
      setShowLeaderboard(true);
    } catch (error) {
      console.error('提交排行榜失败:', error);
    }
  }, [nickname, gameState, loadLeaderboard]);

  // 重新开始游戏
  const restartGame = useCallback(() => {
    resetGame();
    setShowResult(false);
    setNickname('');
    setShowGenderSelect(true);
  }, [resetGame]);

  // 获取愤怒值颜色
  const getAngerColor = useCallback((anger: number) => {
    if (anger <= 30) return 'text-green-500';
    if (anger <= 60) return 'text-yellow-500';
    return 'text-red-500';
  }, []);

  // 获取性别称谓
  const getPartnerLabel = useCallback((gender?: Gender) => {
    return gender === 'boyfriend' ? '男朋友' : '女朋友';
  }, []);

  // 获取对方头像
  const getPartnerAvatar = useCallback((gender?: Gender) => {
    return gender === 'boyfriend' ? AVATARS.boyfriend : AVATARS.girlfriend;
  }, []);

  return {
    // 游戏状态
    gameState,
    
    // UI 状态
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
    
    // Refs
    scrollRef,
    inputRef,
    
    // 游戏操作
    selectGender,
    sendMessage,
    restartGame,
    submitToLeaderboard,
    loadLeaderboard,
    
    // 辅助函数
    getAngerColor,
    getPartnerLabel,
    getPartnerAvatar,
  };
}
