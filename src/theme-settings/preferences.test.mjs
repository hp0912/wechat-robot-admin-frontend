import assert from 'node:assert/strict';
import test from 'node:test';
import {
	defaultThemePreferences,
	getComponentSizeByDensity,
	parseThemePreferences,
	resolveThemeMode,
} from './preferences.ts';

test('parseThemePreferences keeps valid options and fills invalid values with defaults', () => {
	const preferences = parseThemePreferences({
		colorPreset: 'ocean',
		density: 'spacious',
		fontFamily: 'serif',
		radius: '0.75',
		themeMode: 'dark',
	});

	assert.deepEqual(preferences, {
		colorPreset: 'ocean',
		density: 'spacious',
		fontFamily: 'serif',
		radius: '0.75',
		themeMode: 'dark',
	});

	assert.deepEqual(
		parseThemePreferences({
			colorPreset: 'unsupported',
			density: 'oversized',
			fontFamily: 'mono',
			radius: '2',
			themeMode: 'solarized',
		}),
		defaultThemePreferences,
	);
});

test('resolveThemeMode follows system preference only when theme mode is system', () => {
	assert.equal(resolveThemeMode('system', true), 'dark');
	assert.equal(resolveThemeMode('system', false), 'light');
	assert.equal(resolveThemeMode('light', true), 'light');
	assert.equal(resolveThemeMode('dark', false), 'dark');
});

test('getComponentSizeByDensity maps supported density to antd component size', () => {
	assert.equal(getComponentSizeByDensity('compact'), 'small');
	assert.equal(getComponentSizeByDensity('default'), 'medium');
	assert.equal(getComponentSizeByDensity('spacious'), 'large');
});
