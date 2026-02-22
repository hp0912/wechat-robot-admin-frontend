/**
 * 微信消息类型枚举
 */
export enum MessageType {
	/** 文本消息 */
	Text = 1,
	/** 图片消息 */
	Image = 3,
	/** 语音消息 */
	Voice = 34,
	/** 认证消息 */
	Verify = 37,
	/** 好友推荐消息 */
	PossibleFriend = 40,
	/** 名片消息 */
	ShareCard = 42,
	/** 视频消息 */
	Video = 43,
	/** 表情消息 */
	Emoticon = 47,
	/** 地理位置消息 */
	Location = 48,
	/** APP消息 */
	App = 49,
	/** VOIP消息 */
	Voip = 50,
	/** 微信初始化消息 */
	Init = 51,
	/** VOIP结束消息 */
	VoipNotify = 52,
	/** VOIP邀请 */
	VoipInvite = 53,
	/** 小视频消息 */
	MicroVideo = 62,
	/** 未知消息 */
	Unknow = 9999,
	/** 系统消息 */
	Sys = 10000,
	/** 消息撤回 */
	Sysmsg = 10002,
}

export enum AppMessageType {
	/** 文本消息 */
	Text = 1,
	/** 图片消息 */
	Image = 2,
	/** 语音消息 */
	Voice = 3,
	/** 视频消息 */
	Video = 4,
	/** 文章消息 */
	Url = 5,
	/** 附件消息 */
	Attach = 6,
	/** Open */
	Open = 7,
	/** 表情消息 */
	Emoji = 8,
	/** VoiceRemind */
	VoiceRemind = 9,
	/** ScanGood */
	ScanGood = 10,
	/** Good */
	Good = 13,
	/** Emotion */
	Emotion = 15,
	/** 名片消息 */
	ShareCard = 16,
	/** 地理位置消息 */
	RealtimeShareLocation = 17,
	/** 聊天记录消息 */
	ChatHistory = 19,
	/** 引用消息 */
	AppMsgTypequote = 57,
	/** 附件上传中 */
	AttachUploading = 74,
	/** 音乐消息 */
	Music = 76,
	/** 转账消息 */
	Transfers = 2000,
	/** 红包消息 */
	RedEnvelopes = 2001,
	/** 自定义的消息 */
	AppMsgTypeReaderType = 100001,
}
