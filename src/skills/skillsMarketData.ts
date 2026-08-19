export type SkillMarketCategory = '内容理解' | '效率工具' | '会话能力' | '信息查询' | '智能创作';

export interface ISkillMarketItem {
	name: string;
	title: string;
	description: string;
	category: SkillMarketCategory;
}

export const SKILL_MARKET_BASE_URL = 'https://git.houhoukang.com/houhou/wechat-robot-skills/src/branch/main/skills';

export const SKILL_MARKET_ITEMS: ISkillMarketItem[] = [
	{
		name: 'beauty',
		title: '随机美女图片',
		description: '收到“999”后获取一张美女图片，并直接发送到当前微信会话。',
		category: '会话能力',
	},
	{
		name: 'create-scheduled-task',
		title: '群聊提醒与定时任务',
		description: '创建一次性、每日、每周或法定工作日提醒，支持在群聊中 @成员和 @所有人。',
		category: '效率工具',
	},
	{
		name: 'docx',
		title: 'Word 文档处理',
		description: '创建、读取、编辑和转换 Word 文档，支持批注、接受修订、文字识别、校验与逐页渲染。',
		category: '效率工具',
	},
	{
		name: 'doubao-video-understanding',
		title: '豆包视频理解',
		description: '解析视频链接，获取视频的详细描述、内容总结和关键信息。',
		category: '内容理解',
	},
	{
		name: 'export-chat-history',
		title: '导出群聊记录',
		description: '将当前群聊指定日期或时间范围内的聊天记录导出为 Excel，并自动发送到当前群聊。',
		category: '效率工具',
	},
	{
		name: 'find-recent-chat-media',
		title: '查找近期聊天媒体',
		description: '查找当前用户近十分钟发送的图片、视频或语音，并转换为可供 AI 使用的链接。',
		category: '会话能力',
	},
	{
		name: 'image-recognition',
		title: '图片识别',
		description: '识别和描述图片内容，提取图片文字，并回答与画面相关的问题。',
		category: '内容理解',
	},
	{
		name: 'image-to-image',
		title: '图片编辑与创作',
		description: '根据原图和文字要求进行风格转换、内容修改、图片混合与创意合成。',
		category: '智能创作',
	},
	{
		name: 'kfc',
		title: '肯德基疯狂星期四文案',
		description: '识别“肯德基”“KFC”等关键词，自动获取并回复一条疯狂星期四文案。',
		category: '会话能力',
	},
	{
		name: 'pdf',
		title: 'PDF 文档处理',
		description: '读取、总结、生成和编辑 PDF，支持文本与表格提取、页面渲染、合并、拆分及旋转。',
		category: '效率工具',
	},
	{
		name: 'ping',
		title: '示例技能',
		description: '用于验证技能安装和调用流程是否正常，收到指定关键词后返回 pong。',
		category: '效率工具',
	},
	{
		name: 'pptx',
		title: 'PowerPoint 演示文稿处理',
		description: '创建、读取、编辑和转换演示文稿，支持页面复制与重排、文字识别、校验和逐页渲染。',
		category: '效率工具',
	},
	{
		name: 'send-emoji',
		title: '发送微信表情',
		description: '根据聊天语境发送合适的微信表情，让机器人回复更自然、更有互动感。',
		category: '会话能力',
	},
	{
		name: 'send-file',
		title: '发送文件',
		description: '将机器人本地文件或网络文件发送到当前微信会话，支持一次发送一个或多个文件。',
		category: '会话能力',
	},
	{
		name: 'send-image',
		title: '发送图片',
		description: '将机器人本地图片或网络图片发送到当前微信会话，支持一次发送一张或多张图片。',
		category: '会话能力',
	},
	{
		name: 'send-mention-message',
		title: '群聊 @ 提醒',
		description: '在微信群中发送真正的 @成员或 @所有人消息，并可附带通知正文。',
		category: '会话能力',
	},
	{
		name: 'stocks',
		title: '今日 A 股行情',
		description: '识别“今日大盘”等提问，查询并回复当天 A 股市场的涨跌情况。',
		category: '信息查询',
	},
	{
		name: 'text-to-image',
		title: 'AI 文生图',
		description: '理解文字描述并生成合适的绘图提示词，调用模型创作并返回图片。',
		category: '智能创作',
	},
	{
		name: 'video-generation',
		title: 'AI 视频生成',
		description: '支持文生视频、图生视频，以及使用首帧和尾帧图片生成视频。',
		category: '智能创作',
	},
	{
		name: 'voice-message',
		title: '语音消息生成',
		description: '把文字转换成指定音色、情绪、语速或方言的语音，并发送到当前会话。',
		category: '智能创作',
	},
	{
		name: 'web-page',
		title: '网页读取与操作',
		description: '读取网页内容、点击和填写页面控件、等待页面变化，并支持网页截图。',
		category: '内容理解',
	},
	{
		name: 'web-search',
		title: '联网搜索',
		description: '搜索最新网页信息，并根据搜索结果整理和总结用户需要的答案。',
		category: '信息查询',
	},
	{
		name: 'xlsx',
		title: 'Excel 工作簿处理',
		description: '创建、读取、编辑和转换 Excel 工作簿，支持公式重算、图表与样式处理、校验和逐页渲染。',
		category: '效率工具',
	},
];
