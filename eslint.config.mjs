import pluginJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import pluginReact from 'eslint-plugin-react';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
	{
		ignores: ['node_modules', 'dist', 'public', 'src/api', 'scripts'],
	},
	{
		files: ['**/*.{js,mjs,cjs,ts,jsx,tsx,less}'],
	},
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node },
		},
	},
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
	pluginReact.configs.flat.recommended,
	eslintConfigPrettier,
	{
		rules: {
			'react/react-in-jsx-scope': ['off'],
			'@typescript-eslint/consistent-type-imports': ['warn'],
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					varsIgnorePattern: '^_',
					argsIgnorePattern: '^_',
				},
			],
		},
	},
];
