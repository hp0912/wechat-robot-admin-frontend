import { Button } from 'antd';
import styled, { css } from 'styled-components';

export const HeaderTheme = styled.span`
	display: inline-flex;
	align-items: center;
	line-height: 1;

	.theme-settings-button {
		width: 36px;
		height: 36px;
		color: rgba(255, 255, 255, 0.86);
		border: 1px solid rgba(255, 255, 255, 0.12);
		background: rgba(255, 255, 255, 0.08);
		box-shadow: none;
		cursor: pointer;
		transition:
			border-color 0.2s ease,
			background 0.2s ease,
			color 0.2s ease;
	}

	.theme-settings-button:hover,
	.theme-settings-button:focus-visible {
		color: #ffffff !important;
		border-color: rgba(255, 255, 255, 0.28) !important;
		background: rgba(255, 255, 255, 0.16) !important;
	}
`;

export const DrawerIntro = styled.div`
	margin: -4px 0 24px;
	color: var(--ant-color-text-secondary);
	font-size: 14px;
	line-height: 1.6;
`;

export const Section = styled.section`
	margin-bottom: 28px;

	&:last-child {
		margin-bottom: 0;
	}
`;

export const SectionHeader = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 12px;
`;

export const SectionTitle = styled.h3`
	margin: 0;
	color: var(--ant-color-text-heading);
	font-size: 16px;
	font-weight: 700;
	line-height: 1.4;
`;

export const OptionGrid = styled.div<{ $columns: number }>`
	display: grid;
	grid-template-columns: repeat(${props => props.$columns}, minmax(0, 1fr));
	gap: 14px 12px;

	@media (max-width: 520px) {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
`;

export const ModeGrid = styled(OptionGrid)`
	@media (max-width: 520px) {
		grid-template-columns: 1fr;
	}
`;

export const OptionGroup = styled.div`
	min-width: 0;
`;

export const OptionLabel = styled.div`
	margin-top: 8px;
	color: var(--ant-color-text);
	font-size: 13px;
	font-weight: 600;
	line-height: 1.3;
	text-align: center;
	white-space: nowrap;
`;

const activeCardStyle = css`
	border-color: var(--ant-color-primary);
	box-shadow:
		0 0 0 1px var(--ant-color-primary),
		0 10px 24px rgba(15, 116, 144, 0.12);
`;

const radiusPreviewMap: Record<string, string> = {
	auto: '18px',
	'0': '0',
	'0.3': '6px',
	'0.5': '10px',
	'0.75': '14px',
	'1.0': '18px',
};

export const OptionCard = styled.button<{ $active?: boolean; $disabled?: boolean }>`
	position: relative;
	width: 100%;
	min-height: 74px;
	padding: 0;
	overflow: hidden;
	border: 1px solid var(--ant-color-primary-border);
	border-radius: var(--ant-border-radius);
	background: var(--ant-color-bg-container);
	cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
	opacity: ${props => (props.$disabled ? 0.48 : 1)};
	transition:
		border-color 0.2s ease,
		box-shadow 0.2s ease,
		background 0.2s ease;

	${props => (props.$active ? activeCardStyle : '')}

	&:hover {
		${props => (props.$disabled ? '' : activeCardStyle)}
	}

	&:focus-visible {
		outline: 2px solid var(--ant-color-primary);
		outline-offset: 3px;
	}
`;

export const ModePreview = styled.div<{ $mode: 'system' | 'light' | 'dark' }>`
	display: grid;
	grid-template-columns: 30% 1fr;
	height: 100%;
	min-height: 74px;
	background: ${props => {
		if (props.$mode === 'dark') {
			return '#111c2f';
		}
		if (props.$mode === 'light') {
			return '#f8fafc';
		}
		return 'linear-gradient(90deg, #dbeafe 0%, #dbeafe 48%, #f8fafc 48%, #f8fafc 100%)';
	}};

	.preview-side {
		padding: 12px 8px;
		background: ${props => (props.$mode === 'dark' ? '#17253a' : 'rgba(15, 116, 144, 0.14)')};
	}

	.preview-main {
		position: relative;
		padding: 14px 12px;
	}

	.preview-dot,
	.preview-line,
	.preview-bar,
	.preview-panel,
	.preview-pie {
		border-radius: 999px;
		background: ${props => (props.$mode === 'dark' ? '#325792' : '#9bb7f1')};
	}

	.preview-dot {
		width: 16px;
		height: 16px;
		margin-bottom: 8px;
	}

	.preview-line {
		width: 62%;
		height: 5px;
		margin-bottom: 7px;
	}

	.preview-bar {
		display: inline-block;
		width: 8px;
		margin-right: 5px;
		vertical-align: bottom;
	}

	.preview-panel {
		position: absolute;
		right: 14px;
		bottom: 12px;
		left: 42%;
		height: 22px;
		border-radius: 5px;
	}

	.preview-pie {
		position: absolute;
		top: 15px;
		right: 14px;
		width: 30px;
		height: 30px;
	}
`;

export const ColorSwatch = styled.div<{ $swatch: string }>`
	position: absolute;
	inset: 0;
	border-radius: max(0px, calc(var(--ant-border-radius) - 1px));
	background: ${props => props.$swatch};
`;

export const FontPreview = styled.div<{ $font: 'auto' | 'sans' | 'serif' }>`
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 74px;
	color: var(--ant-color-text-heading);
	font-family: ${props => {
		if (props.$font === 'serif') {
			return 'Georgia, "Times New Roman", "Songti SC", serif';
		}
		if (props.$font === 'sans') {
			return '"Avenir Next", "PingFang SC", "Microsoft YaHei", sans-serif';
		}
		return 'inherit';
	}};
	font-size: 28px;
	font-weight: 700;
`;

export const RadiusPreview = styled.div<{ $radius: string }>`
	display: flex;
	align-items: flex-start;
	min-height: 74px;
	padding: 18px 20px;

	.corner {
		width: 30px;
		height: 30px;
		border-top: 3px solid var(--ant-color-text-secondary);
		border-left: 3px solid var(--ant-color-text-secondary);
		border-top-left-radius: ${props => radiusPreviewMap[props.$radius] || radiusPreviewMap.auto};
	}
`;

export const DensityPreview = styled.div<{ $level: 'compact' | 'default' | 'spacious' | 'oversized' }>`
	display: flex;
	flex-direction: column;
	justify-content: center;
	min-height: 74px;
	padding: 16px 18px;
	gap: ${props => {
		if (props.$level === 'compact') {
			return '4px';
		}
		if (props.$level === 'spacious') {
			return '11px';
		}
		if (props.$level === 'oversized') {
			return '18px';
		}
		return '7px';
	}};

	.line {
		height: 3px;
		border-radius: 999px;
		background: var(--ant-color-text-secondary);
	}
`;

export const CheckBadge = styled.span`
	position: absolute;
	top: -1px;
	right: -1px;
	z-index: 1;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 24px;
	height: 24px;
	border-radius: 999px;
	color: #ffffff;
	background: var(--ant-color-primary);
	font-size: 13px;
`;

export const DrawerFooter = styled.div`
	display: flex;
	justify-content: flex-end;
`;

export const ResetButton = styled(Button)`
	font-weight: 700;
`;
