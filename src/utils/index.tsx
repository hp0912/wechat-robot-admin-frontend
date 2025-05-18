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

export const toCronExpression = (hour: number, minute: number): string => {
	if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
		throw new Error('Hour must be an integer between 0 and 23');
	}
	if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
		throw new Error('Minute must be an integer between 0 and 59');
	}
	return `${minute} ${hour} * * *`;
};

export const fromCronExpression = (cronExpression: string): { hour: number; minute: number } => {
	const cronRegex = /^(\d+|\*)\s+(\d+|\*)\s+\*\s+\*\s+\*$/;
	const match = cronExpression.trim().match(cronRegex);

	if (!match) {
		throw new Error('Invalid cron expression format. Expected "minute hour * * *"');
	}

	const minuteStr = match[1];
	const hourStr = match[2];

	if (minuteStr === '*' || hourStr === '*') {
		throw new Error('Cannot extract specific time from cron expression with wildcards in minute or hour');
	}

	const minute = parseInt(minuteStr, 10);
	const hour = parseInt(hourStr, 10);

	if (isNaN(minute) || minute < 0 || minute > 59) {
		throw new Error('Minute must be between 0 and 59');
	}

	if (isNaN(hour) || hour < 0 || hour > 23) {
		throw new Error('Hour must be between 0 and 23');
	}

	return { hour, minute };
};

export const generateMondayCronExpression = (hour: number, minute: number): string => {
	// 验证输入参数
	if (hour < 0 || hour > 23 || !Number.isInteger(hour)) {
		throw new Error('小时必须是 0-23 之间的整数');
	}

	if (minute < 0 || minute > 59 || !Number.isInteger(minute)) {
		throw new Error('分钟必须是 0-59 之间的整数');
	}

	// cron 表达式格式: 分钟 小时 日期 月份 星期几
	// 1 表示周一 (0 表示周日, 1-6 表示周一到周六)
	return `${minute} ${hour} * * 1`;
};

export const parseMondayCronExpression = (cronExpression: string): { hour: number; minute: number } => {
	// 验证输入并分割表达式
	const parts = cronExpression.trim().split(/\s+/);

	if (parts.length !== 5) {
		throw new Error('无效的 cron 表达式格式，应为"分钟 小时 * * 1"');
	}

	// 检查是否是每周一的表达式
	if (parts[2] !== '*' || parts[3] !== '*' || parts[4] !== '1') {
		throw new Error('该表达式不是每周一的定时任务表达式');
	}

	// 解析分钟和小时
	const minute = parseInt(parts[0], 10);
	const hour = parseInt(parts[1], 10);

	// 验证解析结果
	if (isNaN(minute) || minute < 0 || minute > 59) {
		throw new Error('无效的分钟值，应为 0-59 之间的整数');
	}

	if (isNaN(hour) || hour < 0 || hour > 23) {
		throw new Error('无效的小时值，应为 0-23 之间的整数');
	}

	return { hour, minute };
};

export const generateMonthlyCronExpression = (hour: number, minute: number): string => {
	// Input validation
	if (hour < 0 || hour > 23) {
		throw new Error('Hour must be between 0 and 23');
	}

	if (minute < 0 || minute > 59) {
		throw new Error('Minute must be between 0 and 59');
	}

	// Format: minute hour day-of-month month day-of-week
	// For first day of each month at specified time: minute hour 1 * *
	return `${minute} ${hour} 1 * *`;
};

export const parseMonthlyCronExpression = (cronExpression: string): { hour: number; minute: number } => {
	// Remove any extra whitespace and split
	const parts = cronExpression.trim().split(/\s+/);

	// Validate basic cron expression format
	if (parts.length !== 5) {
		throw new Error('Invalid cron expression format. Expected 5 space-separated values.');
	}

	// Validate it's a monthly expression for the 1st day
	if (parts[2] !== '1' || parts[3] !== '*' || parts[4] !== '*') {
		throw new Error('Not a valid monthly cron expression for the 1st day of each month.');
	}

	const minute = parseInt(parts[0], 10);
	const hour = parseInt(parts[1], 10);

	// Validate numeric values
	if (isNaN(minute) || minute < 0 || minute > 59) {
		throw new Error('Invalid minute value. Must be between 0 and 59.');
	}

	if (isNaN(hour) || hour < 0 || hour > 23) {
		throw new Error('Invalid hour value. Must be between 0 and 23.');
	}

	return { hour, minute };
};
