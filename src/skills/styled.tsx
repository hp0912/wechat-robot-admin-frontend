import { Button, Tag } from 'antd';
import styled from 'styled-components';

const STATUS_TAG_COLORS = {
	success: {
		background: 'var(--app-color-status-success-bg)',
		border: 'var(--app-color-status-success-border)',
		color: 'var(--app-color-status-success-text)',
	},
	info: {
		background: 'var(--app-color-status-info-bg)',
		border: 'var(--app-color-status-info-border)',
		color: 'var(--app-color-status-info-text)',
	},
	neutral: {
		background: 'var(--app-color-status-neutral-bg)',
		border: 'var(--app-color-status-neutral-border)',
		color: 'var(--app-color-status-neutral-text)',
	},
};

type StatusTone = keyof typeof STATUS_TAG_COLORS;

export const SkillsToolbar = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	margin-bottom: 16px;
	padding: 10px 12px;
	border: 1px solid var(--app-color-border-primary-soft);
	border-radius: 8px;
	background: linear-gradient(
		135deg,
		var(--app-color-surface-soft) 0%,
		var(--app-color-surface) 58%,
		var(--app-color-surface-tint) 100%
	);
	box-shadow: var(--app-shadow-surface-soft);
`;

export const SkillsToolbarInfo = styled.div`
	min-width: 0;
	display: flex;
	align-items: center;
	gap: 10px;
	color: var(--app-color-text-secondary);
	font-size: 13px;
	line-height: 20px;
`;

export const SkillsToolbarIcon = styled.span`
	flex: 0 0 26px;
	width: 26px;
	height: 26px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border: 1px solid var(--app-color-border-primary);
	border-radius: 7px;
	background: var(--app-color-surface-primary-soft);
	color: var(--app-color-primary);
`;

export const SkillsToolbarText = styled.span`
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

export const SkillsMarketLink = styled.a`
	color: var(--app-color-brand);
	font-weight: 650;
	text-decoration: none;

	&:hover {
		color: var(--app-color-brand-hover);
		text-decoration: underline;
		text-underline-offset: 3px;
	}
`;

export const SkillsToolbarButton = styled(Button)`
	&& {
		flex: 0 0 auto;
		border-radius: 7px;
		box-shadow: var(--app-shadow-action-primary);
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

export const SkillTitle = styled.div`
	min-width: 0;
	display: flex;
	align-items: center;
	gap: 10px;
`;

export const SkillName = styled.span`
	min-width: 0;
	overflow: hidden;
	color: var(--app-color-text-primary);
	font-weight: 650;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

export const SkillMetaGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
	gap: 8px;
	margin: 12px 0;

	@media (max-width: 960px) {
		grid-template-columns: 1fr;
	}
`;

export const SkillMetaItem = styled.div`
	min-width: 0;
	display: flex;
	align-items: flex-start;
	gap: 8px;
	padding: 8px 10px;
	border: 1px solid var(--app-color-border-primary-soft);
	border-radius: 8px;
	background: linear-gradient(180deg, var(--app-color-surface) 0%, var(--app-color-surface-soft) 100%);
`;

export const SkillMetaIcon = styled.span`
	flex: 0 0 22px;
	width: 22px;
	height: 22px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	margin-top: 1px;
	border-radius: 6px;
	background: var(--app-color-surface-brand-soft);
	color: var(--app-color-brand);
`;

export const SkillMetaContent = styled.div`
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 2px;
`;

export const SkillMetaLabel = styled.span`
	color: var(--app-color-text-muted);
	font-size: 12px;
	line-height: 16px;
`;

export const SkillMetaValue = styled.span`
	min-width: 0;
	overflow: hidden;
	color: var(--app-color-text-primary);
	font-size: 12px;
	font-weight: 600;
	line-height: 18px;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

export const SkillMetaLink = styled.a`
	min-width: 0;
	overflow: hidden;
	color: var(--app-color-brand);
	font-size: 12px;
	font-weight: 600;
	line-height: 18px;
	text-overflow: ellipsis;
	text-decoration: none;
	white-space: nowrap;

	&:hover {
		color: var(--app-color-brand-hover);
		text-decoration: underline;
		text-underline-offset: 3px;
	}
`;

export const SkillFooter = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	padding-top: 10px;
	border-top: 1px solid var(--app-color-border-soft);
`;

export const SkillStatusGroup = styled.div`
	min-width: 0;
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 6px;
`;

export const SkillStatusTag = styled(Tag)<{ $tone: StatusTone }>`
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
