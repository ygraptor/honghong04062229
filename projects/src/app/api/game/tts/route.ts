import { NextRequest, NextResponse } from 'next/server';
import { TTSClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { Gender } from '@/lib/game/types';

// TTS音色映射
const TTS_SPEAKERS = {
  girlfriend: {
    gentle: 'zh_female_meilinvyou_saturn_bigtts', // 魅力女友 - 温柔、撒娇、小萝莉、白莲花
    energetic: 'saturn_zh_female_tiaopigongzhu_tob', // 调皮公主 - 毒舌、豪爽、辣妹
    neutral: 'zh_female_vv_uranus_bigtts', // Vivi - 傲娇、理性、女王
    bright: 'saturn_zh_female_keainvsheng_tob', // 可爱女生 - 戏精、活泼
  },
  boyfriend: {
    gentle: 'zh_male_dayi_saturn_bigtts', // 大毅 - 暖男、文艺、闷葫芦
    energetic: 'zh_male_m191_uranus_bigtts', // 云舟 - 郭德纲、东北、兵哥哥
    neutral: 'zh_male_taocheng_uranus_bigtts', // 小天 - 霸道总裁、直男、理工男
    bright: 'saturn_zh_male_shuanglangshaonian_tob', // 爽朗少年 - 台湾腔、耙耳朵
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, gender = 'girlfriend', ttsStyle = 'neutral' } = body as { 
      text: string; 
      gender?: Gender;
      ttsStyle?: 'gentle' | 'energetic' | 'neutral' | 'bright';
    };

    if (!text) {
      return NextResponse.json({ error: '缺少文本内容' }, { status: 400 });
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new TTSClient(config, customHeaders);

    // 根据性别和风格选择音色
    const speaker = TTS_SPEAKERS[gender][ttsStyle] || TTS_SPEAKERS[gender].neutral;

    const response = await client.synthesize({
      uid: 'game_user',
      text,
      speaker,
      audioFormat: 'mp3',
      sampleRate: 24000,
      speechRate: 0, // 正常语速
      loudnessRate: 0, // 正常音量
    });

    return NextResponse.json({
      audioUri: response.audioUri,
      audioSize: response.audioSize,
    });
  } catch (error) {
    console.error('TTS API error:', error);
    return NextResponse.json(
      { error: '语音合成失败' },
      { status: 500 }
    );
  }
}
