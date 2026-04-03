import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { Gender, SpeakingStyle } from '@/lib/game/types';

interface ChatRequest {
  message: string;
  speakingStyle: SpeakingStyle;
  angerReason: string;
  angerLevel: number;
  currentRound: number;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  gender?: Gender;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, speakingStyle, angerReason, angerLevel, currentRound, messages, gender = 'girlfriend' } = body;

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // 根据性别构建角色设定
    const genderRole = gender === 'boyfriend' ? '男朋友' : '女朋友';

    // 构建系统提示
    const systemPrompt = `你是一个正在生气的${genderRole}。

【你的说话风格】
风格名称：${speakingStyle.name}
风格特点：${speakingStyle.description}
说话示例：${speakingStyle.example}

【当前情况】
你生气的原因：${angerReason}
当前愤怒值：${angerLevel}%（0%表示完全消气，100%表示极度愤怒）

【游戏规则】
1. 用户需要通过安慰来降低你的愤怒值
2. 如果用户说话真诚、感人、有道理，你会适当消气（愤怒值下降）
3. 如果用户敷衍、找借口、或者激怒你，你的愤怒值会增加
4. 如果用户使用粗口、无理取闹，直接判定失败
5. 你的回复必须严格符合你的说话风格设定

【回复格式要求】（必须严格遵守，分三行输出）：
第一行：你的对话内容（纯文字，不要带任何括号、数字、标记）
第二行：【愤怒值变化】数字（例如：【愤怒值变化】-15 或 【愤怒值变化】+10）
第三行：【是否粗口】是 或 否

【正确回复示例】
哼～一句对不起就想打发人家嘛～人家盼了好久的生日呜呜呜
【愤怒值变化】-5
【是否粗口】否

【重要提醒】
1. 第一行必须是你对用户说的话，不要包含任何其他内容
2. 愤怒值变化范围：-20到+20
3. 只有用户真正无理或使用粗口时才判定为"是"`;

    // 构建对话历史
    const conversationMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: message },
    ];

    // 调用LLM
    const stream = client.stream(conversationMessages, {
      temperature: 0.85,
    });

    let fullResponse = '';
    for await (const chunk of stream) {
      if (chunk.content) {
        fullResponse += chunk.content.toString();
      }
    }

    // 解析回复 - 清理所有可能的格式标记
    let messageContent = fullResponse;
    
    // 移除【愤怒值变化】相关标记（支持多种格式）
    messageContent = messageContent.replace(/【愤怒值变化】[+-]?\d+/g, '');
    messageContent = messageContent.replace(/愤怒值变化[：:]*[+-]?\d+/g, '');
    messageContent = messageContent.replace(/[+-]\d+\/\d*(是|否)?/g, ''); // 匹配 -15/20否 这种格式
    
    // 移除【是否粗口】相关标记
    messageContent = messageContent.replace(/【是否粗口】(是|否)/g, '');
    messageContent = messageContent.replace(/是否粗口[：:]*(是|否)/g, '');
    
    // 移除其他【】标记
    messageContent = messageContent.replace(/【.*?】/g, '');
    
    // 清理多余空白和换行
    messageContent = messageContent.split('\n').filter(line => {
      const trimmed = line.trim();
      // 过滤掉纯数字行或纯标记行
      return trimmed && !/^[+-]?\d+$/.test(trimmed) && !/^(是|否)$/.test(trimmed);
    }).join('\n').trim();
    
    // 解析愤怒值变化
    let angerChange = 0;
    const angerMatch = fullResponse.match(/【愤怒值变化】([+-]?\d+)/);
    if (angerMatch) {
      angerChange = parseInt(angerMatch[1]);
    }

    // 解析是否粗口
    let isRude = false;
    const rudeMatch = fullResponse.match(/【是否粗口】(是|否)/);
    if (rudeMatch) {
      isRude = rudeMatch[1] === '是';
    }

    // 额外检查用户输入是否包含粗口
    const rudeWords = ['傻逼', '操你', '妈的', '草泥马', '滚', '滚蛋', '闭嘴', '烦人', '神经病', '脑残'];
    const userMessage = message.toLowerCase();
    if (rudeWords.some(word => userMessage.includes(word))) {
      isRude = true;
    }

    return NextResponse.json({
      message: messageContent,
      angerChange,
      isRude,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: '对话失败，请重试' },
      { status: 500 }
    );
  }
}
