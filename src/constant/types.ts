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
	Recalled = 10002,
}
