import { css } from 'styled-components';

export const theme = {
	cyan: '#22d3ee',
	cyanSoft: 'rgba(34, 211, 238, 0.32)',
	cyanSofter: 'rgba(34, 211, 238, 0.18)',
	cyanGlow: 'rgba(34, 211, 238, 0.58)',
	blue: '#1677ff',
	blueDeep: '#0958d9',
	green: '#52c41a',
	pink: '#f759ab',
	teal: '#08979c',
	label: 'rgba(0, 42, 76, 0.58)',
	value: 'rgba(0, 0, 0, 0.78)',
	surface: 'rgba(255, 255, 255, 0.92)',
} as const;

/** 顶部彩色霓虹分隔线，用于卡片顶边点缀 */
export const techAccentLine = css`
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 2px;
	background: linear-gradient(
		90deg,
		rgba(34, 211, 238, 0.92) 0%,
		rgba(82, 196, 26, 0.68) 38%,
		rgba(22, 119, 255, 0.72) 70%,
		rgba(247, 89, 171, 0.78) 100%
	);
	content: '';
`;

/** 卡片右上角的 HUD 折角装饰 */
export const techCornerBracket = css`
	position: absolute;
	top: 8px;
	right: 8px;
	width: 26px;
	height: 13px;
	border-top: 1px solid rgba(34, 211, 238, 0.62);
	border-right: 1px solid rgba(34, 211, 238, 0.62);
	content: '';
	pointer-events: none;
`;

/** 通用科技感卡片底座（白底 + 青色描边 + 柔和投影） */
export const techCard = css`
	position: relative;
	border: 1px solid ${theme.cyanSoft};
	border-radius: 10px;
	background: linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(247, 252, 255, 0.9) 100%),
		linear-gradient(135deg, rgba(34, 211, 238, 0.12) 0%, rgba(82, 196, 26, 0.08) 45%, rgba(247, 89, 171, 0.08) 100%);
	box-shadow:
		0 10px 26px rgba(22, 119, 255, 0.08),
		0 0 0 1px rgba(255, 255, 255, 0.75) inset;
	overflow: hidden;
`;

/** 细青色滚动条 */
export const techScrollbar = css`
	scrollbar-width: thin;
	scrollbar-color: rgba(34, 211, 238, 0.4) transparent;

	&::-webkit-scrollbar {
		width: 6px;
		height: 6px;
	}

	&::-webkit-scrollbar-thumb {
		border-radius: 3px;
		background: rgba(34, 211, 238, 0.32);
	}

	&::-webkit-scrollbar-thumb:hover {
		background: rgba(34, 211, 238, 0.55);
	}
`;
