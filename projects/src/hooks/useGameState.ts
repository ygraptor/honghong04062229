'use client';

import { useState, useCallback } from 'react';
import { GameState, Message, Gender, SpeakingStyle, GAME_CONFIG, GIRLFRIEND_STYLES, BOYFRIEND_STYLES, ANGER_REASONS_GIRLFRIEND, ANGER_REASONS_BOYFRIEND } from '@/lib/game/types';

export function useGameState() {
  const [gameState, setGameState] = useState<GameState | null>(null);

  // 初始化游戏
  const initGame = useCallback((gender: Gender) => {
    // 根据性别选择风格列表
    const styles = gender === 'boyfriend' ? BOYFRIEND_STYLES : GIRLFRIEND_STYLES;
    const speakingStyle = styles[Math.floor(Math.random() * styles.length)];
    
    // 根据性别选择生气理由列表
    const angerReasons = gender === 'boyfriend' ? ANGER_REASONS_BOYFRIEND : ANGER_REASONS_GIRLFRIEND;
    const angerReason = angerReasons[Math.floor(Math.random() * angerReasons.length)];

    const newGame: GameState = {
      gender,
      angerLevel: GAME_CONFIG.initialAnger,
      currentRound: 0,
      maxRounds: GAME_CONFIG.maxRounds,
      messages: [],
      gameStatus: 'playing',
      speakingStyle,
      angerReason,
      startTime: Date.now(),
    };

    setGameState(newGame);
    return newGame;
  }, []);

  // 添加用户消息
  const addUserMessage = useCallback((content: string) => {
    setGameState(prev => {
      if (!prev || prev.gameStatus !== 'playing') return prev;

      const newMessage: Message = {
        role: 'user',
        content,
        timestamp: Date.now(),
      };

      return {
        ...prev,
        currentRound: prev.currentRound + 1,
        messages: [...prev.messages, newMessage],
      };
    });
  }, []);

  // 添加AI回复并更新愤怒值
  const addAIMessage = useCallback((content: string, angerChange: number, isRude: boolean) => {
    setGameState(prev => {
      if (!prev || prev.gameStatus !== 'playing') return prev;

      const newMessage: Message = {
        role: 'assistant',
        content,
        timestamp: Date.now(),
      };

      let newAngerLevel = prev.angerLevel + angerChange;
      let gameStatus: 'playing' | 'success' | 'failed' = 'playing';
      let failReason: string | undefined;

      const pronoun = prev.gender === 'boyfriend' ? '他' : '她';

      // 检查是否失败
      if (isRude) {
        gameStatus = 'failed';
        failReason = `你的话太伤人了，${pronoun}决定离开你...`;
        newAngerLevel = 100;
      } else if (newAngerLevel >= GAME_CONFIG.maxAnger) {
        gameStatus = 'failed';
        failReason = `${pronoun}的愤怒值爆表了，你哄不好${pronoun}了...`;
        newAngerLevel = Math.min(newAngerLevel, 100);
      } else if (newAngerLevel <= 0) {
        gameStatus = 'success';
        newAngerLevel = 0;
      } else if (prev.currentRound >= GAME_CONFIG.maxRounds) {
        gameStatus = 'failed';
        failReason = `你已经用了${GAME_CONFIG.maxRounds}轮，但还是没有哄好${pronoun}...`;
      }

      return {
        ...prev,
        angerLevel: Math.max(0, Math.min(100, newAngerLevel)),
        messages: [...prev.messages, newMessage],
        gameStatus,
        failReason,
      };
    });
  }, []);

  // 重置游戏
  const resetGame = useCallback(() => {
    setGameState(null);
  }, []);

  return {
    gameState,
    initGame,
    addUserMessage,
    addAIMessage,
    resetGame,
  };
}
