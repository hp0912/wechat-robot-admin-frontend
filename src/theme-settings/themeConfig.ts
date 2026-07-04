import { theme as antdTheme } from 'antd';
import type { ThemeConfig } from 'antd';
import { colorPresetOptions } from './options';
import type { ResolvedThemeMode, ThemeFontFamily, ThemePreferences, ThemeRadius } from './preferences';

const fontFamilyMap: Record<ThemeFontFamily, string | undefined> = {
	auto: undefined,
	sans: '"Avenir Next", "PingFang SC", "Microsoft YaHei", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
	serif: 'Georgia, "Times New Roman", "Songti SC", "Noto Serif CJK SC", serif',
};

const radiusMap: Record<ThemeRadius, number> = {
	auto: 8,
	'0': 0,
	'0.3': 4,
	'0.5': 8,
	'0.75': 12,
	'1.0': 16,
};

const baseComponentConfig: ThemeConfig['components'] = {
	Button: {
		defaultBg: 'var(--ant-color-bg-container)',
		defaultColor: 'var(--ant-color-primary)',
		defaultBorderColor: 'var(--ant-color-primary-border)',
		defaultHoverBg: 'var(--ant-color-primary-bg)',
		defaultHoverColor: 'var(--ant-color-primary-hover)',
		defaultHoverBorderColor: 'var(--ant-color-primary-border-hover)',
		defaultActiveBg: 'var(--ant-color-primary-bg-hover)',
		defaultActiveColor: 'var(--ant-color-primary-active)',
		defaultActiveBorderColor: 'var(--ant-color-primary-border-hover)',
		defaultShadow: 'none',
		primaryShadow: 'var(--ant-box-shadow-tertiary)',
		dangerShadow: 'none',
		fontWeight: 600,
		iconGap: 6,
	},
	Card: {
		headerBg: 'var(--ant-color-bg-container)',
		bodyPadding: 16,
		headerPadding: 16,
		extraColor: 'var(--ant-color-text-secondary)',
		tabsMarginBottom: 0,
	},
	Drawer: {
		footerPaddingBlock: 12,
		footerPaddingInline: 16,
	},
	List: {
		colorBorder: 'var(--ant-color-border-secondary)',
	},
	Radio: {
		buttonBg: 'var(--ant-color-bg-container)',
		buttonCheckedBg: 'var(--ant-color-primary-bg)',
		buttonColor: 'var(--ant-color-text-secondary)',
		buttonPaddingInline: 14,
		buttonSolidCheckedBg: 'var(--ant-color-primary)',
		buttonSolidCheckedHoverBg: 'var(--ant-color-primary-hover)',
		buttonSolidCheckedActiveBg: 'var(--ant-color-primary-active)',
		buttonSolidCheckedColor: 'var(--ant-color-bg-container)',
	},
	Segmented: {
		itemColor: 'var(--ant-color-text-secondary)',
		itemHoverColor: 'var(--ant-color-primary)',
		itemHoverBg: 'var(--ant-color-primary-bg)',
		itemSelectedBg: 'var(--ant-color-primary)',
		itemSelectedColor: 'var(--ant-color-bg-container)',
		trackBg: 'var(--ant-color-fill-content)',
		trackPadding: 3,
	},
	Tabs: {
		inkBarColor: 'var(--ant-color-primary)',
		itemColor: 'var(--ant-color-text-secondary)',
		itemHoverColor: 'var(--ant-color-primary-hover)',
		itemSelectedColor: 'var(--ant-color-primary)',
		itemActiveColor: 'var(--ant-color-primary)',
		horizontalItemGutter: 8,
		horizontalItemPadding: '12px 10px',
		titleFontSize: 13,
	},
	Tag: {
		defaultBg: 'var(--ant-color-fill-quaternary)',
		defaultColor: 'var(--ant-color-text-secondary)',
	},
};

const getModeToken = (
	preferences: ThemePreferences,
	resolvedThemeMode: ResolvedThemeMode,
): NonNullable<ThemeConfig['token']> => {
	const colorPreset = colorPresetOptions.find(item => item.value === preferences.colorPreset) || colorPresetOptions[0];
	const fontFamily = fontFamilyMap[preferences.fontFamily];
	const borderRadius = radiusMap[preferences.radius];
	const sharedToken: NonNullable<ThemeConfig['token']> = {
		colorPrimary: colorPreset.primary,
		colorInfo: colorPreset.info,
		colorSuccess: colorPreset.success,
		colorWarning: colorPreset.warning,
		borderRadius,
		borderRadiusSM: Math.max(0, borderRadius - 2),
		boxShadowSecondary: `0 12px 32px ${colorPreset.primary}14`,
		boxShadowTertiary: `0 8px 22px ${colorPreset.primary}0f`,
	};

	if (fontFamily) {
		sharedToken.fontFamily = fontFamily;
	}

	if (resolvedThemeMode === 'dark') {
		return {
			...sharedToken,
			colorBgBase: '#070b14',
			colorBgLayout: '#090f1d',
			colorBgContainer: '#101827',
			colorBgElevated: '#172033',
			colorFillAlter: '#172033',
			colorFillContent: '#152033',
			colorFillContentHover: '#1d2a42',
			colorFillQuaternary: '#111b2c',
			colorBorder: '#26364f',
			colorBorderSecondary: '#213049',
			colorSplit: '#213049',
			colorText: '#dbeafe',
			colorTextHeading: '#f8fafc',
			colorTextSecondary: '#93a4ba',
			colorTextDescription: '#93a4ba',
			colorPrimaryBg: '#13253a',
			colorPrimaryBgHover: '#19324e',
			colorPrimaryBorder: `${colorPreset.primary}66`,
			colorPrimaryBorderHover: `${colorPreset.primary}99`,
			colorPrimaryText: '#dbeafe',
			colorPrimaryTextHover: '#f8fafc',
		};
	}

	return {
		...sharedToken,
		colorPrimaryText: colorPreset.primary,
		colorPrimaryTextHover: colorPreset.primary,
		colorPrimaryBg: colorPreset.lightTint,
		colorPrimaryBgHover: colorPreset.lightTint,
		colorPrimaryBorder: colorPreset.border,
		colorPrimaryBorderHover: colorPreset.border,
		colorInfoBg: '#eff6ff',
		colorInfoBorder: '#bfdbfe',
		colorInfoText: colorPreset.info,
		colorSuccessBg: '#ecfdf5',
		colorSuccessBorder: '#bbf7d0',
		colorSuccessText: colorPreset.success,
		colorWarningBg: '#fff7ed',
		colorWarningBorder: '#fed7aa',
		colorWarningText: colorPreset.warning,
		colorBgLayout: '#f0f2f5',
		colorBgContainer: '#ffffff',
		colorBgElevated: '#ffffff',
		colorFillAlter: '#f8fafc',
		colorFillContent: '#f8fbff',
		colorFillContentHover: '#f6fdff',
		colorFillQuaternary: '#f8fafc',
		colorBorder: '#dbeafe',
		colorBorderSecondary: '#e5eefc',
		colorSplit: '#e5eefc',
		colorText: '#334155',
		colorTextHeading: '#0f172a',
		colorTextSecondary: '#64748b',
		colorTextDescription: '#64748b',
	};
};

export const buildThemeConfig = (preferences: ThemePreferences, resolvedThemeMode: ResolvedThemeMode): ThemeConfig => {
	return {
		cssVar: {
			key: `wechat-robot-${resolvedThemeMode}`,
		},
		algorithm: resolvedThemeMode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
		token: getModeToken(preferences, resolvedThemeMode),
		components: baseComponentConfig,
	};
};
