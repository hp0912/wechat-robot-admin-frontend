import styled from 'styled-components';
import { techAccentLine, techCard, techCornerBracket, techScrollbar, theme } from '@/common/tech-theme';

/** 左侧 Tabs 区域：统一科技感标签栏（配色走 Tabs 组件 Token，这里只补结构性点缀） */
export const LeftPanel = styled.div`
	position: relative;
	height: 100%;

	.tech-tabs-header {
		margin-bottom: 12px;
		padding-top: 4px;
		background: linear-gradient(180deg, rgba(240, 250, 255, 0.78) 0%, rgba(247, 252, 255, 0) 100%);
	}

	.tech-tabs-item {
		border-radius: 8px 8px 0 0;
		transition:
			color 0.2s ease,
			background 0.2s ease;

		.anticon {
			opacity: 0.85;
			transition: filter 0.2s ease;
		}
	}

	.tech-tabs-indicator {
		height: 3px;
		border-radius: 3px;
		background: linear-gradient(90deg, ${theme.cyan} 0%, ${theme.blue} 100%);
		box-shadow: 0 0 10px ${theme.cyanGlow};
	}

	.tech-tabs-content {
		${techScrollbar}
	}
`;

/** 右侧「基本信息」面板 */
export const BaseContainer = styled.div`
	display: flex;
	flex-direction: column;
	height: 100%;
	background: linear-gradient(
			180deg,
			rgba(247, 252, 255, 0.96) 0%,
			rgba(242, 249, 255, 0.96) 52%,
			rgba(250, 255, 252, 0.96) 100%
		),
		repeating-linear-gradient(
			90deg,
			rgba(22, 119, 255, 0.04) 0,
			rgba(22, 119, 255, 0.04) 1px,
			transparent 1px,
			transparent 18px
		);

	.base-info-scroll {
		display: flex;
		flex: 1 1 auto;
		flex-direction: column;
		gap: 12px;
		padding: 14px 12px;
		overflow: hidden auto;
		${techScrollbar}
	}

	.title {
		position: relative;
		padding: 11px 14px 11px 24px;
		border: 1px solid rgba(34, 211, 238, 0.28);
		border-radius: 10px;
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.94), rgba(245, 252, 255, 0.88));
		box-shadow:
			0 8px 22px rgba(22, 119, 255, 0.08),
			inset 0 0 18px rgba(34, 211, 238, 0.08);
		color: ${theme.blueDeep};
		font-size: 14px;
		font-weight: 600;
		letter-spacing: 0.3px;
		overflow: hidden;
	}

	.title::before {
		position: absolute;
		top: 50%;
		left: 11px;
		width: 4px;
		height: 16px;
		border-radius: 2px;
		background: ${theme.cyan};
		box-shadow: 0 0 10px ${theme.cyanGlow};
		transform: translateY(-50%);
		content: '';
	}

	.base-info-header {
		position: relative;
		isolation: isolate;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px 14px;
		border: 1px solid ${theme.cyanSoft};
		border-radius: 10px;
		background: linear-gradient(
				135deg,
				rgba(238, 251, 255, 0.94) 0%,
				rgba(240, 246, 255, 0.9) 58%,
				rgba(249, 255, 246, 0.9) 100%
			),
			repeating-linear-gradient(
				135deg,
				rgba(34, 211, 238, 0.11) 0,
				rgba(34, 211, 238, 0.11) 1px,
				transparent 1px,
				transparent 12px
			);
		box-shadow:
			0 14px 34px rgba(22, 119, 255, 0.12),
			inset 0 1px 0 rgba(255, 255, 255, 0.8);
		overflow: hidden;
	}

	.base-info-beam {
		z-index: 3;
		padding: 2px;
		border-radius: 10px;
	}

	.base-info-beam::before {
		width: 140px;
		animation-duration: 4.8s;
	}

	.base-info-header::before {
		position: absolute;
		top: 0;
		right: 0;
		width: 96px;
		height: 100%;
		background: linear-gradient(90deg, transparent 0%, rgba(34, 211, 238, 0.16) 48%, rgba(82, 196, 26, 0.12) 100%);
		clip-path: polygon(32% 0, 100% 0, 100% 100%, 0 100%);
		content: '';
		pointer-events: none;
		z-index: 0;
	}

	.base-info-profile {
		position: relative;
		z-index: 2;
		min-width: 0;
	}

	.base-info-name {
		font-size: 15px;
		font-weight: 600;
		line-height: 22px;
	}

	.base-info-card {
		${techCard}
		padding: 14px 14px 12px;
	}

	.base-info-card:hover {
		box-shadow:
			0 16px 36px rgba(22, 119, 255, 0.12),
			0 0 0 1px rgba(34, 211, 238, 0.28) inset;
	}

	.base-info-card::before {
		${techAccentLine}
	}

	.base-info-card::after {
		${techCornerBracket}
	}

	.base-info-card-title {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		margin-bottom: 10px;
		font-size: 12px;
		font-weight: 600;
		color: ${theme.blueDeep};
		letter-spacing: 0.5px;
	}

	.base-info-card-title::before {
		width: 6px;
		height: 6px;
		border: 1px solid ${theme.cyan};
		background: #e6fffb;
		box-shadow: 0 0 8px rgba(34, 211, 238, 0.72);
		content: '';
	}

	.base-info-row {
		position: relative;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 7px 0;
	}

	.base-info-row + .base-info-row {
		border-top: 1px solid ${theme.cyanSofter};
	}

	.base-info-label {
		display: flex;
		align-items: center;
		gap: 6px;
		flex: 0 0 84px;
		font-size: 12px;
		color: ${theme.label};
		white-space: nowrap;
	}

	.base-info-label .anticon {
		font-size: 13px;
		color: ${theme.teal};
		filter: drop-shadow(0 0 6px rgba(34, 211, 238, 0.36));
		opacity: 0.78;
	}

	.base-info-value {
		flex: 1 1 auto;
		font-size: 13px;
		color: ${theme.value};
		line-height: 20px;
		word-break: break-all;
		min-width: 0;
	}
`;
