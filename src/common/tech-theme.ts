import { css } from 'styled-components';

/**
 * 统一的「科技感 · 克制版」设计令牌。
 * 原则：白底为主、描边极淡、点缀克制（仅保留细青色滚动条与少量主色点缀）。
 */
export const theme = {
	// 主色
	cyan: '#22d3ee',
	blue: '#1677ff',
	blueDeep: '#0958d9',
	green: '#52c41a',
	pink: '#f759ab',
	teal: '#08979c',
	// 描边
	border: 'rgba(34, 211, 238, 0.18)',
	borderStrong: 'rgba(22, 119, 255, 0.2)',
	cyanSoft: 'rgba(34, 211, 238, 0.26)',
	cyanSofter: 'rgba(34, 211, 238, 0.14)',
	cyanGlow: 'rgba(34, 211, 238, 0.5)',
	// 文本
	title: 'rgba(0, 33, 64, 0.88)',
	label: 'rgba(0, 42, 76, 0.55)',
	value: 'rgba(0, 0, 0, 0.82)',
	// 背景
	surface: '#ffffff',
	surfaceSoft: 'rgba(247, 251, 255, 0.72)',
} as const;

/** 细青色滚动条 */
export const techScrollbar = css`
	scrollbar-width: thin;
	scrollbar-color: rgba(34, 211, 238, 0.36) transparent;

	&::-webkit-scrollbar {
		width: 6px;
		height: 6px;
	}

	&::-webkit-scrollbar-thumb {
		border-radius: 3px;
		background: rgba(34, 211, 238, 0.28);
	}

	&::-webkit-scrollbar-thumb:hover {
		background: rgba(34, 211, 238, 0.5);
	}
`;

/** 通用卡片底座：白底 + 极淡描边 + 柔和投影（克制版，无内部渐变叠加） */
export const techCard = css`
	position: relative;
	border: 1px solid ${theme.border};
	border-radius: 10px;
	background: ${theme.surface};
	box-shadow:
		0 1px 2px rgba(15, 23, 42, 0.04),
		0 6px 16px rgba(22, 119, 255, 0.04);
	transition:
		border-color 0.2s ease,
		box-shadow 0.2s ease;
`;

/** 卡片 hover 态：描边转青 + 投影略增 + 微青底色 */
export const techCardHover = css`
	border-color: ${theme.borderStrong};
	background: rgba(34, 211, 238, 0.06);
	box-shadow:
		0 1px 2px rgba(15, 23, 42, 0.05),
		0 10px 24px rgba(34, 211, 238, 0.10);
`;

/** 区块小标题：左侧细竖条 + 文本（克制版，无 HUD 装饰） */
export const techSectionTitle = css`
	display: inline-flex;
	align-items: center;
	gap: 8px;
	font-size: 12px;
	font-weight: 600;
	color: ${theme.blueDeep};
	letter-spacing: 0.3px;

	&::before {
		width: 3px;
		height: 12px;
		border-radius: 2px;
		background: linear-gradient(180deg, ${theme.cyan} 0%, ${theme.blue} 100%);
		content: '';
	}
`;
