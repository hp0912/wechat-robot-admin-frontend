import { App as AntdApp, ConfigProvider } from 'antd';
import type { ThemeConfig } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.less';

dayjs.locale('zh-cn');
const root = document.getElementById('root')!;

const themeConfig: ThemeConfig = {
	cssVar: {
		key: 'wechat-robot-admin',
	},
	token: {
		colorPrimary: '#0f7490',
		colorPrimaryHover: '#0e5f76',
		colorPrimaryActive: '#0b4f62',
		colorPrimaryText: '#0f7490',
		colorPrimaryTextHover: '#0e5f76',
		colorPrimaryBg: '#eef7ff',
		colorPrimaryBgHover: '#eff6ff',
		colorPrimaryBorder: '#bfdbfe',
		colorPrimaryBorderHover: '#bae6fd',
		colorInfo: '#1d4ed8',
		colorInfoBg: '#eff6ff',
		colorInfoBorder: '#bfdbfe',
		colorInfoText: '#1d4ed8',
		colorSuccess: '#047857',
		colorSuccessBg: '#ecfdf5',
		colorSuccessBorder: '#bbf7d0',
		colorSuccessText: '#047857',
		colorWarning: '#b45309',
		colorWarningBg: '#fff7ed',
		colorWarningBorder: '#fed7aa',
		colorWarningText: '#b45309',
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
		borderRadius: 8,
		borderRadiusSM: 6,
		boxShadowSecondary: '0 12px 32px rgba(14, 116, 144, 0.08)',
		boxShadowTertiary: '0 8px 22px rgba(14, 116, 144, 0.05)',
	},
	components: {
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
	},
};

const bootEl = document.getElementById('boot-root');
if (bootEl) {
	bootEl.remove();
}

ReactDOM.createRoot(root).render(
	<ConfigProvider
		locale={zhCN}
		theme={themeConfig}
	>
		<AntdApp>
			<div className="skin" />
			<App />
		</AntdApp>
	</ConfigProvider>,
);
