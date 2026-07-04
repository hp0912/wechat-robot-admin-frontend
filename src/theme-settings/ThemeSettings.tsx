import { CheckOutlined, UndoOutlined } from '@ant-design/icons';
import { useMemoizedFn } from 'ahooks';
import { App, Drawer, Tooltip } from 'antd';
import React from 'react';
import {
	colorPresetOptions,
	densityOptionsWithLabel,
	disabledColorPresetOptions,
	disabledDensityOptions,
	fontFamilyOptions,
	radiusOptionsWithLabel,
	themeModeOptions,
} from './options';
import type { ThemeColorPreset, ThemeDensity, ThemeFontFamily, ThemeMode, ThemeRadius } from './preferences';
import {
	CheckBadge,
	ColorSwatch,
	DensityPreview,
	DrawerFooter,
	DrawerIntro,
	FontPreview,
	ModeGrid,
	ModePreview,
	OptionCard,
	OptionGrid,
	OptionGroup,
	OptionLabel,
	RadiusPreview,
	ResetButton,
	Section,
	SectionHeader,
	SectionTitle,
} from './styled';
import { useThemeSettings } from './ThemeSettingsProvider';

interface IProps {
	className?: string;
	style?: React.CSSProperties;
	open: boolean;
	onClose: () => void;
}

const renderCheckBadge = (active: boolean) =>
	active ? (
		<CheckBadge>
			<CheckOutlined />
		</CheckBadge>
	) : null;

const ThemeSettings = (props: IProps) => {
	const { className = '', style = {} } = props;
	const { message } = App.useApp();

	const { preferences, resetThemePreferences, updateThemePreference } = useThemeSettings();

	const onThemeModeChange = useMemoizedFn((value: ThemeMode) => {
		updateThemePreference('themeMode', value);
	});

	const onColorPresetChange = useMemoizedFn((value: ThemeColorPreset) => {
		updateThemePreference('colorPreset', value);
	});

	const onFontFamilyChange = useMemoizedFn((value: ThemeFontFamily) => {
		updateThemePreference('fontFamily', value);
	});

	const onRadiusChange = useMemoizedFn((value: ThemeRadius) => {
		updateThemePreference('radius', value);
	});

	const onDensityChange = useMemoizedFn((value: ThemeDensity) => {
		updateThemePreference('density', value);
	});

	const onReset = useMemoizedFn(() => {
		resetThemePreferences();
		message.success('主题设置已重置');
	});

	return (
		<Drawer
			className={className}
			style={style}
			title="主题设置"
			size="min(92vw, 520px)"
			open={props.open}
			onClose={props.onClose}
			footer={
				<DrawerFooter>
					<ResetButton
						danger
						icon={<UndoOutlined />}
						onClick={onReset}
					>
						重置
					</ResetButton>
				</DrawerFooter>
			}
		>
			<DrawerIntro>调整外观和布局以适应您的偏好。</DrawerIntro>
			<Section>
				<SectionHeader>
					<SectionTitle>主题</SectionTitle>
				</SectionHeader>
				<ModeGrid $columns={3}>
					{themeModeOptions.map(item => {
						const active = preferences.themeMode === item.value;

						return (
							<OptionGroup key={item.value}>
								<OptionCard
									type="button"
									$active={active}
									aria-label={`切换为${item.label}主题`}
									aria-pressed={active}
									onClick={() => {
										onThemeModeChange(item.value);
									}}
								>
									<ModePreview $mode={item.value}>
										<div className="preview-side">
											<div className="preview-dot" />
											<div className="preview-line" />
											<div
												className="preview-line"
												style={{ width: '78%' }}
											/>
										</div>
										<div className="preview-main">
											<span
												className="preview-bar"
												style={{ height: 15 }}
											/>
											<span
												className="preview-bar"
												style={{ height: 21 }}
											/>
											<span
												className="preview-bar"
												style={{ height: 28 }}
											/>
											<div className="preview-pie" />
											<div className="preview-panel" />
										</div>
									</ModePreview>
									{renderCheckBadge(active)}
								</OptionCard>
								<OptionLabel>{item.label}</OptionLabel>
							</OptionGroup>
						);
					})}
				</ModeGrid>
			</Section>
			<Section>
				<SectionHeader>
					<SectionTitle>颜色预设</SectionTitle>
				</SectionHeader>
				<OptionGrid $columns={3}>
					{colorPresetOptions.map(item => {
						const active = preferences.colorPreset === item.value;

						return (
							<OptionGroup key={item.value}>
								<OptionCard
									type="button"
									$active={active}
									aria-label={`切换为${item.label}颜色预设`}
									aria-pressed={active}
									onClick={() => {
										onColorPresetChange(item.value);
									}}
								>
									<ColorSwatch $swatch={item.swatch} />
									{renderCheckBadge(active)}
								</OptionCard>
								<OptionLabel>{item.label}</OptionLabel>
							</OptionGroup>
						);
					})}
					{disabledColorPresetOptions.map(item => (
						<OptionGroup key={item.label}>
							<Tooltip title={item.reason}>
								<span>
									<OptionCard
										type="button"
										$disabled
										disabled
										aria-label={`${item.label}暂不支持`}
									>
										<ColorSwatch $swatch={item.swatch} />
									</OptionCard>
								</span>
							</Tooltip>
							<OptionLabel>{item.label}</OptionLabel>
						</OptionGroup>
					))}
				</OptionGrid>
			</Section>
			<Section>
				<SectionHeader>
					<SectionTitle>字体</SectionTitle>
				</SectionHeader>
				<OptionGrid $columns={3}>
					{fontFamilyOptions.map(item => {
						const active = preferences.fontFamily === item.value;

						return (
							<OptionGroup key={item.value}>
								<OptionCard
									type="button"
									$active={active}
									aria-label={`切换为${item.label}字体`}
									aria-pressed={active}
									onClick={() => {
										onFontFamilyChange(item.value);
									}}
								>
									<FontPreview $font={item.value}>Aa</FontPreview>
									{renderCheckBadge(active)}
								</OptionCard>
								<OptionLabel>{item.label}</OptionLabel>
							</OptionGroup>
						);
					})}
				</OptionGrid>
			</Section>
			<Section>
				<SectionHeader>
					<SectionTitle>圆角</SectionTitle>
				</SectionHeader>
				<OptionGrid $columns={6}>
					{radiusOptionsWithLabel.map(item => {
						const active = preferences.radius === item.value;

						return (
							<OptionGroup key={item.value}>
								<OptionCard
									type="button"
									$active={active}
									aria-label={`切换为${item.label}圆角`}
									aria-pressed={active}
									onClick={() => {
										onRadiusChange(item.value);
									}}
								>
									<RadiusPreview $radius={item.value}>
										<div className="corner" />
									</RadiusPreview>
									{renderCheckBadge(active)}
								</OptionCard>
								<OptionLabel>{item.label}</OptionLabel>
							</OptionGroup>
						);
					})}
				</OptionGrid>
			</Section>
			<Section>
				<SectionHeader>
					<SectionTitle>密度</SectionTitle>
				</SectionHeader>
				<OptionGrid $columns={4}>
					{densityOptionsWithLabel.map(item => {
						const active = preferences.density === item.value;

						return (
							<OptionGroup key={item.value}>
								<OptionCard
									type="button"
									$active={active}
									aria-label={`切换为${item.label}密度`}
									aria-pressed={active}
									onClick={() => {
										onDensityChange(item.value);
									}}
								>
									<DensityPreview $level={item.value}>
										<div
											className="line"
											style={{ width: '74%' }}
										/>
										<div
											className="line"
											style={{ width: '66%' }}
										/>
										<div
											className="line"
											style={{ width: '54%' }}
										/>
									</DensityPreview>
									{renderCheckBadge(active)}
								</OptionCard>
								<OptionLabel>{item.label}</OptionLabel>
							</OptionGroup>
						);
					})}
					{disabledDensityOptions.map(item => (
						<OptionGroup key={item.label}>
							<Tooltip title={item.reason}>
								<span>
									<OptionCard
										type="button"
										$disabled
										disabled
										aria-label={`${item.label}密度暂不支持`}
									>
										<DensityPreview $level="oversized">
											<div
												className="line"
												style={{ width: '76%' }}
											/>
										</DensityPreview>
									</OptionCard>
								</span>
							</Tooltip>
							<OptionLabel>{item.label}</OptionLabel>
						</OptionGroup>
					))}
				</OptionGrid>
			</Section>
		</Drawer>
	);
};

export default React.memo(ThemeSettings);
