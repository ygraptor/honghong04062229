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

  // 发送消息
  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading || gameState?.gameStatus !== 'playing') return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    addUserMessage(userMessage);

    try {
      const response = await fetch('/api/game/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

      const data = await response.json();
      addAIMessage(data.message, data.angerChange, data.isRude);

      if (data.message) {
        synthesizeSpeech(data.message, gameState?.gender, gameState?.speakingStyle.ttsStyle);
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      addAIMessage('...（没有回应）', 5, false);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [input, isLoading, gameState, addUserMessage, addAIMessage]);

  // 语音合成
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
