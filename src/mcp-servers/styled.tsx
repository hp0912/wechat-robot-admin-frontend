import { Button, Tag } from 'antd';
import styled from 'styled-components';

const STATUS_TAG_COLORS = {
	success: {
		background: 'var(--ant-color-success-bg)',
		border: 'var(--ant-color-success-border)',
		color: 'var(--ant-color-success-text)',
	},
	warning: {
		background: 'var(--ant-color-warning-bg)',
		border: 'var(--ant-color-warning-border)',
		color: 'var(--ant-color-warning-text)',
	},
	info: {
		background: 'var(--ant-color-info-bg)',
		border: 'var(--ant-color-info-border)',
		color: 'var(--ant-color-info-text)',
	},
	neutral: {
		background: 'var(--ant-color-fill-quaternary)',
		border: 'var(--ant-color-border)',
		color: 'var(--ant-color-text-secondary)',
	},
};

type StatusTone = keyof typeof STATUS_TAG_COLORS;

export const MCPToolbar = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	margin-bottom: 16px;
	padding: 10px 12px;
	border: 1px solid var(--ant-color-primary-border);
	border-radius: 8px;
	background: linear-gradient(
		135deg,
		var(--ant-color-fill-content) 0%,
		var(--ant-color-bg-container) 58%,
		var(--app-color-surface-tint) 100%
	);
	box-shadow: var(--ant-box-shadow-tertiary);
`;

export const MCPToolbarInfo = styled.div`
	min-width: 0;
	display: flex;
	align-items: center;
	gap: 10px;
	color: var(--ant-color-text);
	font-size: 13px;
	line-height: 20px;
`;

export const MCPToolbarIcon = styled.span`
	flex: 0 0 26px;
	width: 26px;
	height: 26px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border: 1px solid var(--ant-color-primary-border-hover);
	border-radius: 7px;
	background: var(--ant-color-primary-bg);
	color: var(--ant-color-info);
`;

export const MCPToolbarText = styled.span`
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

export const MCPMarketLink = styled.a`
	color: var(--ant-color-primary);
	font-weight: 650;
	text-decoration: none;

	&:hover {
		color: var(--ant-color-primary-hover);
		text-decoration: underline;
		text-underline-offset: 3px;
	}
`;

export const MCPToolbarButton = styled(Button)`
	&& {
		flex: 0 0 auto;
		border-radius: 7px;
		box-shadow: var(--ant-box-shadow-tertiary);
	}
`;

export const CardsContainer = styled.div`
	height: calc(100vh - 245px);
	overflow: hidden auto;
	display: grid;
	align-content: start;
	gap: 16px;

	@media (min-width: 1280px) {
		grid-template-columns: repeat(1, 1fr);
	}

	@media (min-width: 1680px) {
		grid-template-columns: repeat(2, 1fr);
	}
`;

export const ServerTitle = styled.div`
	min-width: 0;
	display: flex;
	align-items: center;
	gap: 10px;
`;

export const ServerName = styled.span`
	min-width: 0;
	overflow: hidden;
	color: var(--ant-color-text-heading);
	font-weight: 650;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

export const ServerMetaGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
	gap: 8px;
	margin: 12px 0;

	@media (max-width: 960px) {
		grid-template-columns: 1fr;
	}
`;

export const ServerMetaItem = styled.div<{ $wide?: boolean }>`
	min-width: 0;
	display: flex;
	align-items: flex-start;
	gap: 8px;
	padding: 8px 10px;
	border: 1px solid var(--ant-color-primary-border);
	border-radius: 8px;
	background: linear-gradient(180deg, var(--ant-color-bg-container) 0%, var(--ant-color-fill-content) 100%);
	${props => (props.$wide ? 'grid-column: 1 / -1;' : '')}
`;

export const ServerMetaIcon = styled.span`
	flex: 0 0 22px;
	width: 22px;
	height: 22px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	margin-top: 1px;
	border-radius: 6px;
	background: var(--ant-color-primary-bg);
	color: var(--ant-color-primary);
`;

export const ServerMetaContent = styled.div`
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 2px;
`;

export const ServerMetaLabel = styled.span`
	color: var(--ant-color-text-secondary);
	font-size: 12px;
	line-height: 16px;
`;

export const ServerMetaValue = styled.span`
	min-width: 0;
	overflow: hidden;
	color: var(--ant-color-text-heading);
	font-size: 12px;
	font-weight: 600;
	line-height: 18px;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

export const ServerFooter = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	padding-top: 10px;
	border-top: 1px solid var(--ant-color-border-secondary);
`;

export const ServerStatusGroup = styled.div`
	min-width: 0;
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 6px;
`;

export const StatusTag = styled(Tag)<{ $tone: StatusTone }>`
	&& {
		height: 22px;
		display: inline-flex;
		align-items: center;
		column-gap: 2px;
		margin-inline-end: 0;
		padding: 0 7px;
		border: 1px solid ${props => STATUS_TAG_COLORS[props.$tone].border};
		border-radius: 6px;
		background: ${props => STATUS_TAG_COLORS[props.$tone].background};
		color: ${props => STATUS_TAG_COLORS[props.$tone].color};
		font-size: 12px;
		font-weight: 650;
		line-height: 20px;
	}

	&& .anticon {
		margin-inline-end: 0;
	}
`;
