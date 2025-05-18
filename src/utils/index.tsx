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
