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

/**
 * 游戏聊天 API：接收前端 POST 的 JSON，调用 Coze SDK 的大模型，再把「展示用语 + 怒气变化 + 是否粗口」打包成 JSON 返回。
 *
 * 「强制」模型同时返回聊天和数字的方式：没有编译器约束模型，靠的是 **system 提示词里写死输出格式**（三行），
 * 服务端再 **用正则从整段文本里抠出** 【愤怒值变化】和【是否粗口】。模型若没按格式写，解析会失败或得到默认值。
 */
export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, speakingStyle, angerReason, angerLevel, currentRound, messages, gender = 'girlfriend' } = body;

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // 根据性别构建角色设定
    const genderRole = gender === 'boyfriend' ? '男朋友' : '女朋友';

    /**
     * systemPrompt：给模型的「总剧本」——人设、当前怒气、规则，以及 **必须遵守的输出格式**。
     * 模型被要求分三行输出：①台词 ②【愤怒值变化】±数字 ③【是否粗口】是/否。
     * 这样同一次回复里既有玩家看到的对话，又有程序可解析的结构化信息（靠格式约定，不是 JSON schema 强校验）。
     */
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

    // system + 历史多轮 + 本轮用户输入，顺序和 ChatGPT 类接口一致
    const conversationMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: message },
    ];

    /**
     * Coze SDK 的 stream：底层仍是一段段 chunk，但本路由在服务端 **for await 全部拼成 fullResponse 字符串**，
     * 再统一解析；返回给浏览器的是普通 JSON，不是 SSE 流。
     */
    const stream = client.stream(conversationMessages, {
      temperature: 0.85,
    });

    let fullResponse = '';
    for await (const chunk of stream) {
      if (chunk.content) {
        fullResponse += chunk.content.toString();
      }
    }

    /**
     * 下面分两条线处理同一段 fullResponse：
     * ① messageContent：把玩家要看的「台词」留下来，去掉第二、三行里的标记和多余【】，避免气泡里露出【愤怒值变化】等。
     * ② angerChange / isRude：仍用原始 fullResponse 做正则匹配（必须在清洗前或从原文匹配），否则数字可能被删掉。
     */
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
    
    // 从原文匹配「【愤怒值变化】-5」这种格式；匹配不到则 angerChange 保持 0（前端会当成怒气不变）
    let angerChange = 0;
    const angerMatch = fullResponse.match(/【愤怒值变化】([+-]?\d+)/);
    if (angerMatch) {
      angerChange = parseInt(angerMatch[1]);
    }

    let isRude = false;
    const rudeMatch = fullResponse.match(/【是否粗口】(是|否)/);
    if (rudeMatch) {
      isRude = rudeMatch[1] === '是';
    }

    // 服务端再扫一遍用户原文，防止模型漏标「粗口」
    const rudeWords = ['傻逼', '操你', '妈的', '草泥马', '滚', '滚蛋', '闭嘴', '烦人', '神经病', '脑残'];
    const userMessage = message.toLowerCase();
    if (rudeWords.some(word => userMessage.includes(word))) {
      isRude = true;
    }

    // 前端 useGameLogic 只认这三个字段；怒气加减在 useGameState.addAIMessage 里做
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
