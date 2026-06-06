import styled from 'styled-components';
import { techAccentLine, techCard, techScrollbar, theme } from '@/common/tech-theme';

/** 联系人列表外层容器：与「基本信息」一致的科技感卡片底座 */
export const Container = styled.div`
	${techCard}
	margin-right: 2px;
	border-radius: 10px;

	&::before {
		${techAccentLine}
	}

	.tech-list-scroll {
		max-height: calc(100vh - 235px);
		overflow-y: auto;
		${techScrollbar}
	}

	.tech-list-item {
		position: relative;
		padding-inline: 4px;
		border-block-end: 1px solid ${theme.cyanSofter};
		transition: background 0.2s ease;
	}

	.tech-list-item::before {
		position: absolute;
		top: 50%;
		left: 0;
		width: 3px;
		height: 0;
		border-radius: 0 3px 3px 0;
		background: linear-gradient(180deg, ${theme.cyan} 0%, ${theme.blue} 100%);
		box-shadow: 0 0 8px ${theme.cyanGlow};
		transform: translateY(-50%);
		transition: height 0.2s ease;
		content: '';
	}

	.tech-list-item:hover {
		background: rgba(34, 211, 238, 0.06);
	}

	.tech-list-item:hover::before {
		height: 60%;
	}
`;
