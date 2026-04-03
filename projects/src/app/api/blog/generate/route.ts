import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// LLM 自动生成恋爱沟通技巧文章
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const llmClient = new LLMClient(config, customHeaders);

    // 可选：用户指定主题
    const body = await request.json().catch(() => ({}));
    const { topic } = body;

    // 构建生成文章的提示词
    const systemPrompt = `你是一位恋爱关系专家，擅长用轻松幽默的口吻分享恋爱沟通技巧。

请生成一篇关于恋爱沟通技巧的文章，要求：
1. 标题：吸引眼球，可以用疑问句或数字开头
2. 字数：300-500字
3. 风格：轻松幽默，有网感，可以适度调侃
4. 结构：开头引入话题 → 分析问题 → 给出建议 → 结尾升华
5. 内容要有实用性，不能全是空话

请严格按照以下 JSON 格式输出（不要输出其他内容）：
{
  "title": "文章标题",
  "summary": "文章摘要（50-80字，要吸引人）",
  "content": "文章正文（用换行分隔段落）",
  "tags": "标签1,标签2,标签3",
  "read_time": "X分钟"
}`;

    const userPrompt = topic 
      ? `请写一篇关于"${topic}"的恋爱沟通技巧文章。`
      : `请随机选择一个恋爱沟通主题写一篇文章。可以选择的主题方向：
- 吵架后的修复技巧
- 如何表达爱意
- 异地恋相处之道
- 如何处理前任问题
- 节日礼物怎么选
- 如何应对对方的小情绪
- 恋爱中的边界感
- 如何处理伴侣的抱怨`;

    // 调用 LLM 生成文章
    const stream = llmClient.stream([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], {
      temperature: 0.9,
    });

    let fullResponse = '';
    for await (const chunk of stream) {
      if (chunk.content) {
        fullResponse += chunk.content.toString();
      }
    }

    // 解析 LLM 返回的 JSON
    // 尝试提取 JSON 内容
    let article;
    try {
      // 尝试直接解析
      article = JSON.parse(fullResponse);
    } catch {
      // 尝试提取 JSON 代码块
      const jsonMatch = fullResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        article = JSON.parse(jsonMatch[1].trim());
      } else {
        // 尝试提取花括号内容
        const braceMatch = fullResponse.match(/\{[\s\S]*\}/);
        if (braceMatch) {
          article = JSON.parse(braceMatch[0]);
        } else {
          throw new Error('无法解析 LLM 返回的内容');
        }
      }
    }

    // 验证必要字段
    if (!article.title || !article.summary || !article.content) {
      throw new Error('生成的文章缺少必要字段');
    }

    // 保存到数据库
    const { data, error } = await client
      .from('blog_posts')
      .insert({
        title: article.title,
        summary: article.summary,
        content: article.content,
        author: article.author || '恋爱研究所',
        tags: article.tags || null,
        read_time: article.read_time || '3分钟',
      })
      .select()
      .single();

    if (error) throw new Error(`保存失败: ${error.message}`);

    return NextResponse.json({ 
      success: true, 
      message: '文章生成成功',
      post: data 
    });
  } catch (error) {
    console.error('Generate blog error:', error);
    return NextResponse.json(
      { error: `生成文章失败: ${error instanceof Error ? error.message : '未知错误'}` },
      { status: 500 }
    );
  }
}
