import styled from 'styled-components';
import { techCard, techCardHover, techScrollbar, techSectionTitle, theme } from '@/common/tech-theme';

/** 左侧 Tabs 区域：统一科技感标签栏（配色走 Tabs 组件 Token，这里只补结构性点缀） */
export const LeftPanel = styled.div`
	position: relative;
	height: 100%;

	.tech-tabs-item {
		.anticon {
			opacity: 0.85;
			transition: filter 0.2s ease;
		}
	}

	.tech-tabs-indicator {
		height: 2px;
		border-radius: 2px;
		background: linear-gradient(90deg, ${theme.cyan} 0%, ${theme.blue} 100%);
	}

	.tech-tabs-content {
		${techScrollbar}
	}
`;

/** 右侧「基本信息」面板（克制版） */
export const BaseContainer = styled.div`
	display: flex;
	flex-direction: column;
	height: 100%;
	background: ${theme.surfaceSoft};

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
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 14px;
		border: 1px solid ${theme.border};
		border-radius: 10px;
		background: ${theme.surface};
		box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
		color: ${theme.title};
		font-size: 14px;
		font-weight: 600;
		letter-spacing: 0.3px;
	}

	.title::before {
		width: 4px;
		height: 16px;
		border-radius: 2px;
		background: linear-gradient(180deg, ${theme.cyan} 0%, ${theme.blue} 100%);
		content: '';
	}

	.base-info-header {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px 14px;
		${techCard}
	}

	.base-info-header:hover {
		${techCardHover}
	}

	.base-info-profile {
		min-width: 0;
	}

	.base-info-name {
		color: ${theme.title};
		font-size: 15px;
		font-weight: 600;
		line-height: 22px;
	}

	.base-info-card {
		padding: 14px 14px 12px;
		${techCard}
	}

	.base-info-card:hover {
		${techCardHover}
	}

	.base-info-card-title {
		margin-bottom: 10px;
		${techSectionTitle}
	}

	.base-info-row {
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
		opacity: 0.7;
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
