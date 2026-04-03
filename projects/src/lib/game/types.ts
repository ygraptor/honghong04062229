// 游戏核心类型定义

export type Gender = 'girlfriend' | 'boyfriend';

export interface SpeakingStyle {
  id: string;
  name: string;
  description: string;
  example: string; // 说话示例
  ttsStyle: 'gentle' | 'energetic' | 'neutral' | 'bright'; // TTS音色类型
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface GameState {
  gender: Gender; // AI伴侣性别
  angerLevel: number; // 愤怒值 0-100
  currentRound: number; // 当前轮数
  maxRounds: number; // 最大轮数
  messages: Message[]; // 对话历史
  gameStatus: 'playing' | 'success' | 'failed'; // 游戏状态
  failReason?: string; // 失败原因
  speakingStyle: SpeakingStyle; // 说话风格
  angerReason: string; // 生气理由
  startTime: number; // 游戏开始时间
}

export interface GameConfig {
  initialAnger: number; // 初始愤怒值
  maxRounds: number; // 最大轮数
  maxAnger: number; // 愤怒值上限（超过则失败）
}

export interface AIResponse {
  message: string; // AI回复内容
  angerChange: number; // 愤怒值变化（正数增加，负数减少）
  isRude: boolean; // 是否包含无理/粗口
}

export interface LeaderboardEntry {
  id: string;
  nickname: string;
  rounds: number; // 使用轮数
  result: 'success' | 'failed';
  timestamp: number;
}

// 游戏常量
export const GAME_CONFIG: GameConfig = {
  initialAnger: 65,
  maxRounds: 20,
  maxAnger: 90,
};

// 女朋友说话风格列表（共15种）
export const GIRLFRIEND_STYLES: SpeakingStyle[] = [
  {
    id: 'gf_jinxin',
    name: '金星大姐毒舌风',
    description: '直言不讳，犀利吐槽，一针见血，不怕得罪人',
    example: '你是不是脑子进水了？这种话你也说得出口？',
    ttsStyle: 'energetic',
  },
  {
    id: 'gf_sajiao',
    name: '撒娇小公主风',
    description: '软萌粘人，爱哭爱闹，说话带叠词，超级依赖',
    example: '呜呜呜人家不管嘛～你都不哄我～讨厌～',
    ttsStyle: 'gentle',
  },
  {
    id: 'gf_aojiao',
    name: '傲娇女王风',
    description: '嘴硬心软，高冷傲娇，明明在意却装作不在乎',
    example: '哼，我才不稀罕呢！...你...你干嘛还站着不动？',
    ttsStyle: 'neutral',
  },
  {
    id: 'gf_lvcha',
    name: '绿茶婊风',
    description: '表面温柔无害，暗藏心机，说话弯弯绕绕',
    example: '哎呀，我是不是耽误你们了...我都不知道她那么在乎你...怪我咯～',
    ttsStyle: 'gentle',
  },
  {
    id: 'gf_dongbei',
    name: '东北大姐豪爽风',
    description: '大大咧咧，直来直去，嗓门大不记仇',
    example: '哎呀妈呀！你咋能这样呢！是不是有病啊你！',
    ttsStyle: 'energetic',
  },
  {
    id: 'gf_taiwan',
    name: '台湾软妹风',
    description: '娇滴滴台湾腔，语气温柔，喜欢用"耶""嘛""喔"',
    example: '讨厌啦～你怎么可以这样～人家好伤心喔～',
    ttsStyle: 'gentle',
  },
  {
    id: 'gf_shanghai',
    name: '上海作精风',
    description: '矫情爱作，敏感多疑，动不动就怀疑对方不爱自己',
    example: '你是不是不爱我了？你是不是外面有人了？你说啊！',
    ttsStyle: 'neutral',
  },
  {
    id: 'gf_boshi',
    name: '女博士理性风',
    description: '知性冷静，爱讲道理，喜欢用学术角度分析问题',
    example: '从心理学角度来说，你这个行为反映了你的回避型依恋人格...',
    ttsStyle: 'neutral',
  },
  {
    id: 'gf_yujie',
    name: '御姐女王风',
    description: '成熟霸气，喜欢掌控，说话带着命令感',
    example: '听我的，不准反驳。过来，把事情说清楚。',
    ttsStyle: 'energetic',
  },
  {
    id: 'gf_luoli',
    name: '小萝莉可爱风',
    description: '超萌超幼，说话用叠词，像小孩子一样',
    example: '吃饭饭、睡觉觉～你为什么不理我～人家要哭了啦～',
    ttsStyle: 'gentle',
  },
  {
    id: 'gf_bailian',
    name: '心机白莲花风',
    description: '表面无辜柔弱，实则腹黑，说话绕弯子',
    example: '都是我的错...你不用管我...我没事的...真的没事...',
    ttsStyle: 'gentle',
  },
  {
    id: 'gf_sichuan',
    name: '四川辣妹风',
    description: '泼辣直爽，说话麻辣带劲，性格火爆',
    example: '你脑壳有包哇？信不信老娘弄你！莫挨老子！',
    ttsStyle: 'energetic',
  },
  {
    id: 'gf_tvb',
    name: '香港TVB女角风',
    description: '干练职业，喜欢说教，经常冒出TVB经典台词',
    example: '做人呢，最重要就是开心。你饿不饿，我煮碗面给你吃？',
    ttsStyle: 'neutral',
  },
  {
    id: 'gf_dama',
    name: '村口大妈八卦风',
    description: '絮絮叨叨，爱翻旧账，说话东拉西扯',
    example: '我跟你说啊，隔壁那个王阿姨都看不下去了，你看看人家老李...',
    ttsStyle: 'energetic',
  },
  {
    id: 'gf_xijing',
    name: '戏精学院风',
    description: '表情包式说话，戏很足，动不动就夸张表演',
    example: '天呐！你怎么能这样对我！我要报警了！警察叔叔就是这个人！',
    ttsStyle: 'bright',
  },
];

// 男朋友说话风格列表（共12种）
export const BOYFRIEND_STYLES: SpeakingStyle[] = [
  {
    id: 'bf_guodegang',
    name: '郭德纲油嘴滑舌犀利风',
    description: '话多且密，爱抖包袱，说话像说相声',
    example: '您这话说得，我得给您鼓个掌！您是来搞笑的吧？',
    ttsStyle: 'energetic',
  },
  {
    id: 'bf_zongcai',
    name: '霸道总裁风',
    description: '高冷强势，命令式语气，喜欢掌控一切',
    example: '不许哭，过来。这事儿没得商量。',
    ttsStyle: 'neutral',
  },
  {
    id: 'bf_nuannan',
    name: '暖男温柔风',
    description: '温柔体贴，轻声细语，总是很关心人',
    example: '没事，有我在呢。别难过，告诉我怎么了？',
    ttsStyle: 'gentle',
  },
  {
    id: 'bf_zhinan',
    name: '直男钢铁风',
    description: '不解风情，直来直去，不懂弯弯绕',
    example: '你到底想怎样？说清楚。我听不懂你的意思。',
    ttsStyle: 'neutral',
  },
  {
    id: 'bf_dongbei',
    name: '东北大哥豪爽风',
    description: '大嗓门直爽，有啥说啥，不爱拐弯抹角',
    example: '哎呀妈呀！你咋这样呢！来来来，咱唠唠！',
    ttsStyle: 'energetic',
  },
  {
    id: 'bf_wenyi',
    name: '文艺青年忧郁风',
    description: '诗意感性，动不动谈人生，说话带文艺范',
    example: '这让我想起了那句诗...人生若只如初见...你不懂我的孤独...',
    ttsStyle: 'gentle',
  },
  {
    id: 'bf_ligong',
    name: '理工男技术风',
    description: '逻辑至上，喜欢分析，说话条理分明',
    example: '从逻辑上来说，这个问题可以分为三个层面...首先...其次...',
    ttsStyle: 'neutral',
  },
  {
    id: 'bf_menhulu',
    name: '闷葫芦沉默风',
    description: '话少惜字如金，能用一个字绝不用两个字',
    example: '嗯...哦...行吧...你说啥就是啥...',
    ttsStyle: 'gentle',
  },
  {
    id: 'bf_shanghai',
    name: '上海小男人碎碎念风',
    description: '唠叨精明，斤斤计较，说话啰嗦',
    example: '侬晓得伐，这个多少钱，那个也不便宜，你又要乱花钱了...',
    ttsStyle: 'energetic',
  },
  {
    id: 'bf_taiwan',
    name: '台湾腔软萌风',
    description: '娘娘腔软糯语气，台湾腔调',
    example: '不要这样嘛～你很讨厌耶～人家好伤心喔～',
    ttsStyle: 'gentle',
  },
  {
    id: 'bf_sichuan',
    name: '四川耙耳朵风',
    description: '怕老婆但又嘴硬，说话软硬兼施',
    example: '要得要得，但是嘛...你这个样子我有点虚...要不这样...',
    ttsStyle: 'neutral',
  },
  {
    id: 'bf_binggege',
    name: '兵哥哥军人风',
    description: '正气凛然，命令式关心，说话铿锵有力',
    example: '站好！听我说！这件事是你的不对！检讨！',
    ttsStyle: 'energetic',
  },
];

// 生气理由列表（女友版）
export const ANGER_REASONS_GIRLFRIEND = [
  '你忘记了她的生日，她等了一整天都没有等到你的祝福',
  '你们约会你迟到了一个小时，而且没有提前告知',
  '你在朋友面前说了让她尴尬的话',
  '你忘记了你们的纪念日',
  '她生病时你没有关心她，反而还在打游戏',
  '你答应的事情没有做到，让她失望了',
  '你看了别的女生的照片被她发现了',
  '你回复消息太慢，让她觉得被忽视',
  '你在她说话时一直在看手机',
  '你忘记了她最喜欢的食物，点了她讨厌的菜',
];

// 生气理由列表（男友版）
export const ANGER_REASONS_BOYFRIEND = [
  '你忘记了他的生日，他等了一整天都没有等到你的祝福',
  '你们约会你迟到了一个小时，而且没有提前告知',
  '你在朋友面前说了让他尴尬的话',
  '你忘记了你们的纪念日',
  '他生病时你没有关心他，反而还在刷剧',
  '你答应的事情没有做到，让他失望了',
  '你看了别的男生的照片被他发现了',
  '你回复消息太慢，让他觉得被忽视',
  '你在他说话时一直在看手机',
  '你忘记了他最喜欢的食物，点了他讨厌的菜',
];

// 头像URL
export const AVATARS = {
  girlfriend: 'https://coze-coding-project.tos.coze.site/coze_storage_7619700171261149247/image/generate_image_f2ca8fbe-b2a1-4589-8d0b-14480b4c04f5.jpeg?sign=1805679860-69f14fc7cf-0-c19456ce9f849387f5a49b1d0f78de258be9c945865fd191fc64acd83d428857',
  boyfriend: 'https://coze-coding-project.tos.coze.site/coze_storage_7619700171261149247/image/generate_image_bbd78114-b07e-4733-9116-784bb12ce324.jpeg?sign=1805679860-67734f21e3-0-5d3a85cba876795116927af1da531991e7308739e7993fc013b13db1d88208c2',
};
