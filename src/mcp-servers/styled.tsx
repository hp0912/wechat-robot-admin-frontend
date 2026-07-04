import { Button, Tag } from 'antd';
import styled from 'styled-components';

const STATUS_TAG_COLORS = {
	success: {
		background: '#ecfdf5',
		border: '#bbf7d0',
		color: '#047857',
	},
	warning: {
		background: '#fff7ed',
		border: '#fed7aa',
		color: '#b45309',
	},
	info: {
		background: '#eff6ff',
		border: '#bfdbfe',
		color: '#1d4ed8',
	},
	neutral: {
		background: '#f8fafc',
		border: '#e2e8f0',
		color: '#475569',
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
	border: 1px solid #dbeafe;
	border-radius: 8px;
	background: linear-gradient(135deg, #f8fbff 0%, #ffffff 58%, #f0fdfa 100%);
	box-shadow: 0 8px 22px rgba(14, 116, 144, 0.05);
`;

export const MCPToolbarInfo = styled.div`
	min-width: 0;
	display: flex;
	align-items: center;
	gap: 10px;
	color: #334155;
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
	border: 1px solid #bfdbfe;
	border-radius: 7px;
	background: #eff6ff;
	color: #1d4ed8;
`;

export const MCPToolbarText = styled.span`
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

export const MCPMarketLink = styled.a`
	color: #0f7490;
	font-weight: 650;
	text-decoration: none;

	&:hover {
		color: #0e5f76;
		text-decoration: underline;
		text-underline-offset: 3px;
	}
`;

export const MCPToolbarButton = styled(Button)`
	&& {
		flex: 0 0 auto;
		border-radius: 7px;
		box-shadow: 0 6px 14px rgba(22, 119, 255, 0.14);
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
	color: #0f172a;
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
	border: 1px solid #dbeafe;
	border-radius: 8px;
	background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
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
	background: #eef7ff;
	color: #0f7490;
`;

export const ServerMetaContent = styled.div`
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 2px;
`;

export const ServerMetaLabel = styled.span`
	color: #64748b;
	font-size: 12px;
	line-height: 16px;
`;

export const ServerMetaValue = styled.span`
	min-width: 0;
	overflow: hidden;
	color: #0f172a;
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
	border-top: 1px solid #e5eefc;
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
