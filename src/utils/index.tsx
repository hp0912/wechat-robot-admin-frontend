import type { AxiosResponse } from 'axios';
import type { AnyType } from '@/common/types';

export const formatDuration = (seconds: number): string => {
	// 取整确保为非负整数
	seconds = Math.floor(Math.max(0, seconds));

	const day = Math.floor(seconds / 86400);
	const hour = Math.floor((seconds % 86400) / 3600);
	const minute = Math.floor((seconds % 3600) / 60);
	const sec = seconds % 60;

	if (seconds < 60) {
		return `${sec}秒`;
	} else if (seconds < 3600) {
		return `${minute}分${sec}秒`;
	} else if (seconds < 86400) {
		return `${hour}小时${minute}分${sec}秒`;
	} else {
		return `${day}天${hour}小时${minute}分${sec}秒`;
	}
};

export const convertUrlsToLinks = (input: string): string => {
	// Regular expression to match URLs
	const urlRegex = /(https?:\/\/[^\s]+)/g;

	// Replace the URLs with <a> tags
	const result = input.replace(urlRegex, url => {
		return `<a href="${url}" target="_blank" rel="noreferrer">${url}</a>`;
	});

	return result;
};

export const onAttachDownload = (resp: AxiosResponse<AnyType, AnyType>, attachId: string | number) => {
	// 从响应头中获取推荐的文件名
	const contentDisposition = resp.headers['content-disposition'];
	let serverFilename = '';
	if (contentDisposition) {
		const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
		const matches = filenameRegex.exec(contentDisposition);
		if (matches != null && matches[1]) {
			serverFilename = matches[1].replace(/['"]/g, '');
		}
	}
	// 使用提供的文件名，或从服务器获取的文件名，或使用默认文件名
	const downloadFilename = serverFilename || `attachment-${attachId}`;
	// 创建blob URL
	const blob = new Blob([resp.data], { type: resp.headers['content-type'] });
	const url = window.URL.createObjectURL(blob);
	// 创建一个临时链接元素并触发下载
	const link = document.createElement('a');
	link.href = url;
	link.setAttribute('download', downloadFilename);
	document.body.appendChild(link);
	link.click();
	// 清理
	link.remove();
	window.URL.revokeObjectURL(url);
};
