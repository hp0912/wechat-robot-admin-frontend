import type {
	ThemeColorPreset,
	ThemeDensity,
	ThemeFontFamily,
	ThemeMode,
	ThemeRadius,
} from './preferences';

export interface ThemeOption<T extends string> {
	value: T;
	label: string;
}

export interface ColorPresetOption extends ThemeOption<ThemeColorPreset> {
	primary: string;
	info: string;
	success: string;
	warning: string;
	swatch: string;
	lightTint: string;
	border: string;
}

export interface DisabledThemeOption {
	label: string;
	swatch: string;
	reason: string;
}

export const themeModeOptions: ThemeOption<ThemeMode>[] = [
	{ value: 'system', label: '系统' },
	{ value: 'light', label: '浅色' },
	{ value: 'dark', label: '深色' },
];

export const colorPresetOptions: ColorPresetOption[] = [
	{
		value: 'default',
		label: '默认',
		primary: '#0f7490',
		info: '#1d4ed8',
		success: '#047857',
		warning: '#b45309',
		swatch: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 44%, #0f172a 100%)',
		lightTint: '#eef7ff',
		border: '#bfdbfe',
	},
	{
		value: 'anthropic',
		label: 'Anthropic',
		primary: '#c96442',
		info: '#b45309',
		success: '#64748b',
		warning: '#d97706',
		swatch: 'linear-gradient(135deg, #fae7dc 0%, #f6a78f 52%, #f0785f 100%)',
		lightTint: '#fff1eb',
		border: '#fed7aa',
	},
	{
		value: 'midnight',
		label: '暗夜',
		primary: '#4657ff',
		info: '#4f46e5',
		success: '#0f766e',
		warning: '#d97706',
		swatch: 'linear-gradient(135deg, #101828 0%, #64748b 55%, #f8fafc 100%)',
		lightTint: '#eef2ff',
		border: '#c7d2fe',
	},
	{
		value: 'rose',
		label: '玫瑰花园',
		primary: '#e83e74',
		info: '#be185d',
		success: '#047857',
		warning: '#f97316',
		swatch: 'linear-gradient(135deg, #f72565 0%, #f8719d 100%)',
		lightTint: '#fff1f2',
		border: '#fecdd3',
	},
	{
		value: 'lake',
		label: '湖光',
		primary: '#0f9f8a',
		info: '#0e7490',
		success: '#059669',
		warning: '#ca8a04',
		swatch: 'linear-gradient(135deg, #10c99a 0%, #048d83 100%)',
		lightTint: '#ecfdf5',
		border: '#99f6e4',
	},
	{
		value: 'sunset',
		label: '日落霞光',
		primary: '#e65f4a',
		info: '#ea580c',
		success: '#15803d',
		warning: '#d97706',
		swatch: 'linear-gradient(135deg, #dc493f 0%, #ff8f69 100%)',
		lightTint: '#fff7ed',
		border: '#fed7aa',
	},
	{
		value: 'forest',
		label: '森林低语',
		primary: '#267a74',
		info: '#2563eb',
		success: '#047857',
		warning: '#a16207',
		swatch: 'linear-gradient(135deg, #008e83 0%, #475c7a 100%)',
		lightTint: '#f0fdfa',
		border: '#99f6e4',
	},
	{
		value: 'ocean',
		label: '海风',
		primary: '#3264e8',
		info: '#2563eb',
		success: '#059669',
		warning: '#d97706',
		swatch: 'linear-gradient(135deg, #3168f4 0%, #5961ee 100%)',
		lightTint: '#eff6ff',
		border: '#bfdbfe',
	},
	{
		value: 'wisteria',
		label: '薰衣草梦',
		primary: '#8b6bd6',
		info: '#7c3aed',
		success: '#0f766e',
		warning: '#c2410c',
		swatch: 'linear-gradient(135deg, #9a72d6 0%, #93d6d8 100%)',
		lightTint: '#f5f3ff',
		border: '#ddd6fe',
	},
];

export const disabledColorPresetOptions: DisabledThemeOption[] = [
	{
		label: '超大字体简易',
		swatch: 'linear-gradient(135deg, #111827 0%, #737373 55%, #f8fafc 100%)',
		reason: '这属于专项无障碍排版，不只是颜色预设；当前先不做半成品。',
	},
];

export const fontFamilyOptions: ThemeOption<ThemeFontFamily>[] = [
	{ value: 'auto', label: 'Auto' },
	{ value: 'sans', label: 'Sans' },
	{ value: 'serif', label: 'Serif' },
];

export const radiusOptionsWithLabel: ThemeOption<ThemeRadius>[] = [
	{ value: 'auto', label: 'Auto' },
	{ value: '0', label: '0' },
	{ value: '0.3', label: '0.3' },
	{ value: '0.5', label: '0.5' },
	{ value: '0.75', label: '0.75' },
	{ value: '1.0', label: '1.0' },
];

export const densityOptionsWithLabel: ThemeOption<ThemeDensity>[] = [
	{ value: 'compact', label: '紧凑' },
	{ value: 'default', label: '默认' },
	{ value: 'spacious', label: '宽松' },
];

export const disabledDensityOptions: DisabledThemeOption[] = [
	{
		label: '超大',
		swatch: '',
		reason: 'antd 的全局 size 只有 small、medium、large，超大需要额外业务组件规范。',
	},
];
