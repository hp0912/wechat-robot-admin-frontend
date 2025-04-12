import type { DefaultOptionType } from 'antd/es/select';

export const filterOption = (input: string, option?: DefaultOptionType) => {
	if (!input) {
		return true;
	}
	if (!option?.text) {
		return false;
	}
	if ((option.text as string).toLowerCase().includes(input.trim().toLowerCase())) {
		return true;
	}
	return false;
};
