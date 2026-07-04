import styled from 'styled-components';
import { techScrollbar, theme } from '@/common/tech-theme';

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
	background: linear-gradient(180deg, var(--app-color-surface-soft) 0%, var(--app-color-surface) 100%);

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
		padding: 11px 12px;
		border: 1px solid var(--app-color-border-primary-soft);
		border-radius: 8px;
		background: linear-gradient(
			135deg,
			var(--app-color-surface-soft) 0%,
			var(--app-color-surface) 58%,
			var(--app-color-surface-tint) 100%
		);
		box-shadow: var(--app-shadow-surface-soft);
		color: var(--app-color-text-primary);
		font-size: 14px;
		font-weight: 650;
	}

	.title::before {
		width: 4px;
		height: 16px;
		border-radius: 2px;
		background: linear-gradient(180deg, var(--app-color-brand) 0%, var(--app-color-primary) 100%);
		content: '';
	}

	.base-info-header {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px 14px;
		border: 1px solid var(--app-color-border-accent);
		border-radius: 8px;
		background: linear-gradient(
			135deg,
			var(--app-color-surface-active) 0%,
			var(--app-color-surface) 56%,
			var(--app-color-surface-tint) 100%
		);
		box-shadow: var(--app-shadow-surface-accent);
		transition:
			border-color 0.2s ease,
			box-shadow 0.2s ease;
	}

	.base-info-header:hover {
		border-color: var(--app-color-border-primary);
		box-shadow: 0 14px 34px rgba(14, 116, 144, 0.1);
	}

	.base-info-header .ant-avatar {
		box-shadow:
			0 0 0 2px var(--app-color-surface),
			var(--app-shadow-icon-accent) !important;
	}

	.base-info-profile {
		min-width: 0;
	}

	.base-info-name {
		color: var(--app-color-text-primary);
		font-size: 15px;
		font-weight: 650;
		line-height: 22px;
	}

	.base-info-status-tag.ant-tag,
	.base-info-value .ant-tag {
		margin-inline-end: 0;
		border: 1px solid var(--app-color-status-neutral-border);
		border-radius: 6px;
		background: var(--app-color-status-neutral-bg);
		color: var(--app-color-status-neutral-text);
		font-weight: 600;
	}

	.base-info-status-tag.status-online.ant-tag {
		border-color: var(--app-color-status-success-border);
		background: var(--app-color-status-success-bg);
		color: var(--app-color-status-success-text);
	}

	.base-info-card {
		padding: 14px 14px 12px;
		border: 1px solid var(--app-color-border-primary-soft);
		border-radius: 8px;
		background: linear-gradient(180deg, var(--app-color-surface) 0%, var(--app-color-surface-soft) 100%);
		box-shadow: var(--app-shadow-surface-soft);
		transition:
			border-color 0.2s ease,
			box-shadow 0.2s ease,
			background 0.2s ease;
	}

	.base-info-card:hover {
		border-color: var(--app-color-border-primary);
		background: linear-gradient(180deg, var(--app-color-surface) 0%, var(--app-color-surface-active) 100%);
		box-shadow: var(--app-shadow-surface-accent);
	}

	.base-info-card-title {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 10px;
		color: var(--app-color-brand);
		font-size: 12px;
		font-weight: 650;
		letter-spacing: 0.2px;
	}

	.base-info-card-title::before {
		width: 3px;
		height: 12px;
		border-radius: 2px;
		background: linear-gradient(180deg, var(--app-color-brand) 0%, var(--app-color-primary) 100%);
		content: '';
	}

	.base-info-row {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 7px 0;
	}

	.base-info-row + .base-info-row {
		border-top: 1px solid var(--app-color-border-soft);
	}

	.base-info-label {
		display: flex;
		align-items: center;
		gap: 6px;
		flex: 0 0 92px;
		font-size: 12px;
		color: var(--app-color-text-muted);
		white-space: nowrap;
	}

	.base-info-label .anticon {
		width: 22px;
		height: 22px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex: 0 0 22px;
		border-radius: 6px;
		background: var(--app-color-surface-brand-soft);
		color: var(--app-color-brand);
		font-size: 13px;
	}

	.base-info-value {
		flex: 1 1 auto;
		font-size: 13px;
		color: var(--app-color-text-primary);
		font-weight: 600;
		line-height: 20px;
		word-break: break-all;
		min-width: 0;
	}
`;
