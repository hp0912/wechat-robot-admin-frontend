import { Card, Tag } from 'antd';
import styled from 'styled-components';

export const StyledCard = styled(Card)<{
	$accent: string;
	$heroStart: string;
	$heroEnd: string;
}>`
	position: relative;
	overflow: hidden;
	width: 100%;
	border: 1px solid var(--ant-color-border-secondary);
	border-radius: var(--ant-border-radius);
	background: var(--ant-color-bg-container);
	box-shadow: var(--ant-box-shadow-tertiary);
	transition:
		box-shadow 0.24s ease,
		border-color 0.24s ease;

	&::before {
		content: '';
		position: absolute;
		inset: 0 0 auto;
		height: 90px;
		background: linear-gradient(135deg, ${({ $heroStart }) => $heroStart}, ${({ $heroEnd }) => $heroEnd});
		opacity: 0.78;
		pointer-events: none;
	}

	&:hover {
		border-color: ${({ $accent }) => $accent};
		box-shadow: var(--ant-box-shadow-secondary);
	}

	.ant-card-body {
		position: relative;
		padding: 0;
	}

	.ant-card-actions {
		position: relative;
		margin: 0;
		padding: 8px 10px 10px;
		border-top: 1px solid var(--ant-color-border-secondary);
		background: linear-gradient(180deg, var(--ant-color-bg-container) 0%, var(--ant-color-fill-quaternary) 100%);
	}

	.ant-card-actions > li {
		margin: 0;
	}

	.ant-card-actions > li:not(:last-child) {
		border-inline-end: 1px solid var(--ant-color-border-secondary);
	}

	.ant-card-actions > li > span {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 32px;
		border-radius: var(--ant-border-radius-sm);
		color: var(--ant-color-text-secondary);
		transition:
			background 0.2s ease,
			color 0.2s ease;
	}

	.ant-card-actions > li > span:hover {
		background: var(--ant-color-primary-bg);
		color: ${({ $accent }) => $accent};
	}
`;

export const CardContent = styled.div`
	position: relative;
	padding: 14px 16px 12px;
`;

export const Hero = styled.div`
	position: relative;
	padding-top: 6px;
`;

export const AvatarShell = styled.div`
	position: relative;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 3px;
	border-radius: var(--ant-border-radius);
	background: var(--ant-color-bg-container);
	box-shadow: var(--app-shadow-icon-accent);
`;

export const TitleText = styled.div`
	min-width: 0;
	flex: 1 1 auto;
	display: block;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	color: var(--ant-color-text-heading);
	font-size: 16px;
	font-weight: 650;
	line-height: 22px;
`;

export const InfoGrid = styled.div`
	display: grid;
	margin-top: 14px;
	padding-top: 10px;
	border-top: 1px solid var(--ant-color-border-secondary);
`;

export const InfoItem = styled.div`
	display: grid;
	grid-template-columns: 84px minmax(0, 1fr);
	align-items: center;
	gap: 10px;
	min-width: 0;
	padding: 7px 0;

	& + & {
		border-top: 1px solid var(--ant-color-split);
	}
`;

export const InfoLabel = styled.div`
	color: var(--ant-color-text-secondary);
	font-size: 12px;
	font-weight: 600;
	line-height: 16px;
`;

export const InfoValue = styled.div`
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	color: var(--ant-color-text-heading);
	font-size: 13px;
	font-weight: 600;
	line-height: 18px;
`;

export const RobotTitleRow = styled.div`
	min-width: 0;
	display: flex;
	align-items: center;
	gap: 8px;
`;

export const StatusTag = styled(Tag)<{
	$bg: string;
	$border: string;
	$color: string;
}>`
	&& {
		flex: 0 0 auto;
		margin-inline-end: 0;
		border: 1px solid ${({ $border }) => $border};
		border-radius: var(--ant-border-radius-sm);
		background: ${({ $bg }) => $bg};
		color: ${({ $color }) => $color};
		font-size: 12px;
		font-weight: 650;
	}
`;

export const ActionSlot = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
`;

export const RobotListHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	padding: 10px 12px;
	border: 1px solid var(--ant-color-primary-border);
	border-radius: var(--ant-border-radius);
	background: linear-gradient(
		135deg,
		var(--ant-color-fill-content) 0%,
		var(--ant-color-bg-container) 58%,
		var(--app-color-surface-tint) 100%
	);
	box-shadow: var(--ant-box-shadow-tertiary);
`;

export const RobotListTitle = styled.span`
	color: var(--ant-color-text-heading);
	font-size: 16px;
	font-weight: 650;
`;

export const RobotListFilter = styled.div`
	margin: 14px 0;
	padding: 10px 12px;
	border: 1px solid var(--ant-color-border-secondary);
	border-radius: var(--ant-border-radius);
	background: var(--ant-color-bg-container);
	box-shadow: var(--ant-box-shadow-tertiary);
`;

export const RobotListContent = styled.div`
	height: calc(100vh - 282px);
	overflow: hidden auto;
	padding: 2px;
`;

export const RobotCardsContainer = styled.div`
	display: grid;
	gap: 16px;

	@media (max-width: 599px) {
		grid-template-columns: repeat(1, 1fr);
	}

	@media (min-width: 600px) and (max-width: 959px) {
		grid-template-columns: repeat(2, 1fr);
	}

	@media (min-width: 960px) and (max-width: 1279px) {
		grid-template-columns: repeat(3, 1fr);
	}

	@media (min-width: 1280px) {
		grid-template-columns: repeat(4, 1fr);
	}

	@media (min-width: 1680px) {
		grid-template-columns: repeat(5, 1fr);
	}
`;

export const RobotListPagination = styled.div`
	margin-top: 14px;
	padding: 8px 12px;
	border: 1px solid var(--ant-color-border-secondary);
	border-radius: var(--ant-border-radius);
	background: var(--ant-color-bg-container);
	box-shadow: var(--ant-box-shadow-tertiary);
`;
