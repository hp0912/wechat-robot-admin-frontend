import type { SizeType } from 'antd/es/config-provider/SizeContext';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedThemeMode = 'light' | 'dark';
export type ThemeColorPreset =
	| 'default'
	| 'anthropic'
	| 'midnight'
	| 'rose'
	| 'lake'
	| 'sunset'
	| 'forest'
	| 'ocean'
	| 'wisteria';
export type ThemeFontFamily = 'auto' | 'sans' | 'serif';
export type ThemeRadius = 'auto' | '0' | '0.3' | '0.5' | '0.75' | '1.0';
export type ThemeDensity = 'compact' | 'default' | 'spacious';

export interface ThemePreferences {
	themeMode: ThemeMode;
	colorPreset: ThemeColorPreset;
	fontFamily: ThemeFontFamily;
	radius: ThemeRadius;
	density: ThemeDensity;
}

export const themeStorageKey = 'theme-preferences';

export const defaultThemePreferences: ThemePreferences = {
	themeMode: 'system',
	colorPreset: 'default',
	fontFamily: 'auto',
	radius: 'auto',
	density: 'default',
};

export const themeModes: ThemeMode[] = ['system', 'light', 'dark'];
export const colorPresets: ThemeColorPreset[] = [
	'default',
	'anthropic',
	'midnight',
	'rose',
	'lake',
	'sunset',
	'forest',
	'ocean',
	'wisteria',
];
export const fontFamilies: ThemeFontFamily[] = ['auto', 'sans', 'serif'];
export const radiusOptions: ThemeRadius[] = ['auto', '0', '0.3', '0.5', '0.75', '1.0'];
export const densityOptions: ThemeDensity[] = ['compact', 'default', 'spacious'];

const isRecord = (value: unknown): value is Record<string, unknown> => {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const isOneOf = <T extends string>(value: unknown, options: T[]): value is T => {
	return typeof value === 'string' && options.includes(value as T);
};

export const parseThemePreferences = (value: unknown): ThemePreferences => {
	if (!isRecord(value)) {
		return defaultThemePreferences;
	}

	return {
		themeMode: isOneOf(value.themeMode, themeModes) ? value.themeMode : defaultThemePreferences.themeMode,
		colorPreset: isOneOf(value.colorPreset, colorPresets) ? value.colorPreset : defaultThemePreferences.colorPreset,
		fontFamily: isOneOf(value.fontFamily, fontFamilies) ? value.fontFamily : defaultThemePreferences.fontFamily,
		radius: isOneOf(value.radius, radiusOptions) ? value.radius : defaultThemePreferences.radius,
		density: isOneOf(value.density, densityOptions) ? value.density : defaultThemePreferences.density,
	};
};

export const parseStoredThemePreferences = (rawValue: string | null): ThemePreferences => {
	if (!rawValue) {
		return defaultThemePreferences;
	}

	try {
		return parseThemePreferences(JSON.parse(rawValue));
	} catch (_error) {
		return defaultThemePreferences;
	}
};

export const resolveThemeMode = (themeMode: ThemeMode, systemIsDark: boolean): ResolvedThemeMode => {
	if (themeMode === 'system') {
		return systemIsDark ? 'dark' : 'light';
	}

	return themeMode;
};

export const getComponentSizeByDensity = (density: ThemeDensity): SizeType => {
	if (density === 'compact') {
		return 'small';
	}

	if (density === 'spacious') {
		return 'large';
	}

	return 'medium';
};
