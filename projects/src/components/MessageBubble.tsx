'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { Message, Gender } from '@/lib/game/types';

interface MessageBubbleProps {
  message: Message;
  gender?: Gender;
  partnerAvatar?: string;
}

/**
 * 单条消息气泡组件（微信风格）
 */
export function MessageBubble({ message, gender, partnerAvatar }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex gap-2 items-end ${
        isUser ? 'flex-row-reverse' : ''
      }`}
    >
      {/* 头像 */}
      <Avatar className="w-9 h-9 rounded-full flex-shrink-0">
        {isUser ? (
          <>
            <AvatarImage src="" />
            <AvatarFallback className="bg-gray-300 text-gray-600">
              <User className="w-4 h-4" />
            </AvatarFallback>
          </>
        ) : (
          <>
            <AvatarImage src={partnerAvatar} />
            <AvatarFallback className={gender === 'boyfriend' ? 'bg-blue-300' : 'bg-pink-300'}>
              {gender === 'boyfriend' ? '他' : '她'}
            </AvatarFallback>
          </>
        )}
      </Avatar>
      
      {/* 消息气泡 + 小尾巴 */}
      <div className="relative max-w-[75%]">
        {/* 微信风格小尾巴 */}
        <div 
          className={`absolute bottom-2 w-0 h-0 ${
            isUser 
              ? 'right-0 translate-x-1 border-l-[6px] border-l-[#95EC69] border-y-[5px] border-y-transparent'
              : 'left-0 -translate-x-1 border-r-[6px] border-r-white border-y-[5px] border-y-transparent'
          }`}
        />
        <div
          className={`px-3 py-2 text-[15px] leading-relaxed ${
            isUser
              ? 'bg-[#95EC69] text-gray-800 rounded-lg rounded-tr-sm'
              : 'bg-white text-gray-800 rounded-lg rounded-tl-sm shadow-sm'
          }`}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}

interface LoadingBubbleProps {
  gender?: Gender;
  partnerAvatar?: string;
}

/**
 * 加载中气泡组件（三个跳动的点）
 */
export function LoadingBubble({ gender, partnerAvatar }: LoadingBubbleProps) {
  return (
    <div className="flex gap-2 items-end">
      <Avatar className="w-9 h-9 rounded-full">
        <AvatarImage src={partnerAvatar} />
        <AvatarFallback className={gender === 'boyfriend' ? 'bg-blue-300' : 'bg-pink-300'}>
          {gender === 'boyfriend' ? '他' : '她'}
        </AvatarFallback>
      </Avatar>
      <div className="relative">
        <div className="absolute bottom-2 left-0 -translate-x-1 border-r-[6px] border-r-white border-y-[5px] border-y-transparent" />
        <div className="px-3 py-2 bg-white rounded-lg rounded-tl-sm shadow-sm">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

interface MessageListProps {
  messages: Message[];
  gender?: Gender;
  partnerAvatar?: string;
  isLoading?: boolean;
}

/**
 * 消息列表组件
 */
export function MessageList({ messages, gender, partnerAvatar, isLoading }: MessageListProps) {
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
          <span className="text-3xl">💬</span>
        </div>
        <p>开始聊天吧</p>
        <p className="text-sm text-gray-300 mt-1">说点什么...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((msg, idx) => (
        <MessageBubble
          key={idx}
          message={msg}
          gender={gender}
          partnerAvatar={partnerAvatar}
        />
      ))}
      
      {/* 加载动画 */}
      {isLoading && (
        <LoadingBubble gender={gender} partnerAvatar={partnerAvatar} />
      )}
    </div>
  );
}
