import { AppMessageType, MessageType } from './types';

export const DefaultAvatar = 'https://img.houhoukang.com/robot-default-avatar.svg';

export const MessageTypeMap: Record<MessageType, string> = {
	[MessageType.Text]: '文本消息',
	[MessageType.Image]: '图片消息',
	[MessageType.Voice]: '语音消息',
	[MessageType.Verify]: '认证消息',
	[MessageType.PossibleFriend]: '好友推荐消息',
	[MessageType.ShareCard]: '名片消息',
	[MessageType.Video]: '视频消息',
	[MessageType.Emoticon]: '表情消息',
	[MessageType.Location]: '地理位置消息',
	[MessageType.App]: 'APP消息',
	[MessageType.Voip]: 'VOIP消息',
	[MessageType.Init]: '微信初始化消息',
	[MessageType.VoipNotify]: 'VOIP结束消息',
	[MessageType.VoipInvite]: 'VOIP邀请',
	[MessageType.MicroVideo]: '小视频消息',
	[MessageType.Unknow]: '未知消息',
	[MessageType.Sys]: '系统消息',
	[MessageType.Recalled]: '消息撤回',
};

export const AppMessageTypeMap: Record<AppMessageType, string> = {
	[AppMessageType.Text]: '文本消息',
	[AppMessageType.Image]: '图片消息',
	[AppMessageType.Voice]: '语音消息',
	[AppMessageType.Video]: '视频消息',
	[AppMessageType.Url]: '文章消息',
	[AppMessageType.Attach]: '附件消息',
	[AppMessageType.Open]: 'Open',
	[AppMessageType.Emoji]: '表情消息',
	[AppMessageType.VoiceRemind]: '语音提醒消息',
	[AppMessageType.ScanGood]: 'ScanGood',
	[AppMessageType.Good]: 'Good',
	[AppMessageType.Emotion]: 'Emotion',
	[AppMessageType.ShareCard]: '名片消息',
	[AppMessageType.RealtimeShareLocation]: '地理位置消息',
	[AppMessageType.AppMsgTypequote]: '引用消息',
	[AppMessageType.AttachUploading]: '附件上传中',
	[AppMessageType.Transfers]: '转账消息',
	[AppMessageType.RedEnvelopes]: '红包消息',
	[AppMessageType.AppMsgTypeReaderType]: '自定义的消息',
};
