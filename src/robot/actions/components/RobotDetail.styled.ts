import styled from 'styled-components';
import { techScrollbar } from '@/common/tech-theme';

export const DrawerHeaderTitle = styled.div`
	min-width: 0;
	display: flex;
	align-items: center;
	gap: 10px;

	.robot-detail-title-avatar {
		flex: 0 0 auto;
		box-shadow:
			0 0 0 2px var(--ant-color-bg-container),
			var(--app-shadow-icon-accent);
	}

	.robot-detail-title-copy {
		min-width: 0;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.robot-detail-title-name {
		min-width: 0;
		color: var(--ant-color-primary);
		font-size: 14px;
		font-weight: 650;
		line-height: 22px;
	}

	.robot-detail-title-status.ant-tag {
		margin-inline-end: 0;
		border: 1px solid var(--ant-color-border);
		border-radius: 6px;
		background: var(--ant-color-fill-quaternary);
		color: var(--ant-color-text-secondary);
		font-weight: 600;
	}

	.robot-detail-title-status.status-online.ant-tag {
		border-color: var(--ant-color-success-border);
		background: var(--ant-color-success-bg);
		color: var(--ant-color-success-text);
	}
`;

export const DrawerHeaderActions = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
`;

/** 左侧 Tabs 区域：统一科技感标签栏（配色走 Tabs 组件 Token，这里只补结构性点缀） */
export const LeftPanel = styled.div`
	position: relative;
	height: 100%;

	.tech-tabs-header {
		border-bottom: 1px solid var(--ant-color-border-secondary);
		background: linear-gradient(180deg, var(--ant-color-bg-container) 0%, var(--ant-color-fill-content) 100%);
	}

	.tech-tabs-item {
		position: relative;
		border-radius: var(--ant-border-radius-sm);
		transition:
			color 0.2s ease;

		&::before {
			position: absolute;
			inset: 4px 0;
			border-radius: var(--ant-border-radius-sm);
			background: transparent;
			content: '';
			transition: background 0.2s ease;
		}

		&:hover {
			background: transparent;
		}

		&:hover::before {
			background: var(--ant-color-primary-bg);
		}

		.ant-tabs-tab-btn {
			position: relative;
			z-index: 1;
		}

		.anticon {
			position: relative;
			z-index: 1;
			opacity: 0.85;
			transition:
				color 0.2s ease,
				opacity 0.2s ease;
		}
	}

	.tech-tabs-indicator {
		height: 2px;
		border-radius: 2px;
		background: var(--ant-color-primary);
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
	background: linear-gradient(180deg, var(--ant-color-fill-content) 0%, var(--ant-color-bg-container) 100%);

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
		border: 1px solid var(--ant-color-primary-border);
		border-radius: 8px;
		background: linear-gradient(
			135deg,
			var(--ant-color-fill-content) 0%,
			var(--ant-color-bg-container) 58%,
			var(--app-color-surface-tint) 100%
		);
		box-shadow: var(--ant-box-shadow-tertiary);
		color: var(--ant-color-text-heading);
		font-size: 14px;
		font-weight: 650;
	}

	.title::before {
		width: 4px;
		height: 16px;
		border-radius: 2px;
		background: linear-gradient(180deg, var(--ant-color-primary) 0%, var(--ant-color-info) 100%);
		content: '';
	}

	.base-info-header {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px 14px;
		border: 1px solid var(--ant-color-info-border);
		border-radius: 8px;
		background: linear-gradient(
			135deg,
			var(--ant-color-fill-content-hover) 0%,
			var(--ant-color-bg-container) 56%,
			var(--app-color-surface-tint) 100%
		);
		box-shadow: var(--ant-box-shadow-secondary);
		transition:
			border-color 0.2s ease,
			box-shadow 0.2s ease;
	}

	.base-info-header:hover {
		border-color: var(--ant-color-primary-border-hover);
		box-shadow: var(--ant-box-shadow-secondary);
	}

	.base-info-header .ant-avatar {
		box-shadow:
			0 0 0 2px var(--ant-color-bg-container),
			var(--app-shadow-icon-accent) !important;
	}

	.base-info-profile {
		min-width: 0;
	}

	.base-info-name {
		color: var(--ant-color-text-heading);
		font-size: 15px;
		font-weight: 650;
		line-height: 22px;
	}

	.base-info-status-tag.ant-tag,
	.base-info-value .ant-tag {
		margin-inline-end: 0;
		border: 1px solid var(--ant-color-border);
		border-radius: 6px;
		background: var(--ant-color-fill-quaternary);
		color: var(--ant-color-text-secondary);
		font-weight: 600;
	}

	.base-info-status-tag.status-online.ant-tag {
		border-color: var(--ant-color-success-border);
		background: var(--ant-color-success-bg);
		color: var(--ant-color-success-text);
	}

	.base-info-card {
		padding: 14px 14px 12px;
		border: 1px solid var(--ant-color-primary-border);
		border-radius: 8px;
		background: linear-gradient(180deg, var(--ant-color-bg-container) 0%, var(--ant-color-fill-content) 100%);
		box-shadow: var(--ant-box-shadow-tertiary);
		transition:
			border-color 0.2s ease,
			box-shadow 0.2s ease,
			background 0.2s ease;
	}

	.base-info-card:hover {
		border-color: var(--ant-color-primary-border-hover);
		background: linear-gradient(180deg, var(--ant-color-bg-container) 0%, var(--ant-color-fill-content-hover) 100%);
		box-shadow: var(--ant-box-shadow-secondary);
	}

	.base-info-card-title {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 10px;
		color: var(--ant-color-primary);
		font-size: 12px;
		font-weight: 650;
		letter-spacing: 0.2px;
	}

	.base-info-card-title::before {
		width: 3px;
		height: 12px;
		border-radius: 2px;
		background: linear-gradient(180deg, var(--ant-color-primary) 0%, var(--ant-color-info) 100%);
		content: '';
	}

	.base-info-row {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 7px 0;
	}

	.base-info-row + .base-info-row {
		border-top: 1px solid var(--ant-color-border-secondary);
	}

	.base-info-label {
		display: flex;
		align-items: center;
		gap: 6px;
		flex: 0 0 92px;
		font-size: 12px;
		color: var(--ant-color-text-secondary);
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
		background: var(--ant-color-primary-bg);
		color: var(--ant-color-primary);
		font-size: 13px;
	}

	.base-info-value {
		flex: 1 1 auto;
		font-size: 13px;
		color: var(--ant-color-text-heading);
		font-weight: 600;
		line-height: 20px;
		word-break: break-all;
		min-width: 0;
	}
`;
