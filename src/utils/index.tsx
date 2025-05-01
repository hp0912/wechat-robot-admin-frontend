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
