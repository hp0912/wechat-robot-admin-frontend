export enum EMessageType {
	Text = 'text',
	Image = 'image',
	Video = 'video',
	Voice = 'voice',
	AITTS = 'aitts',
	File = 'file',
}

export interface StoredUploadMeta {
	completed: boolean;
	clientAppDataId: string;
	lastChunk: number; // 已成功上传的最后一个 chunk 下标
	totalChunks: number;
	fileName: string;
	fileSize: number;
	updatedAt: number;
}
