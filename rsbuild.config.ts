import { defineConfig, rspack } from '@rsbuild/core';
import type { RsbuildConfig } from '@rsbuild/core';
import { pluginNodePolyfill } from '@rsbuild/plugin-node-polyfill';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginStyledComponents } from '@rsbuild/plugin-styled-components';
import { pluginTypeCheck } from '@rsbuild/plugin-type-check';
import ReactRefreshPlugin from '@rspack/plugin-react-refresh';
import path from 'path';
import { pluginLess } from '@rsbuild/plugin-less';

const isDev = process.env.NODE_ENV === 'development';

const config: RsbuildConfig = {
	output: {
		assetPrefix: '/',
	},
	tools: {
		rspack: {
			plugins: [
				new rspack.ProgressPlugin({
					prefix: 'Rspack已开始构建, 吼吼～ ',
				}),
				// 生产模式会自动禁用
				new ReactRefreshPlugin(),
			],
		},
	},
	plugins: [
		pluginReact(),
		pluginNodePolyfill(),
		pluginTypeCheck({ enable: isDev }),
		pluginStyledComponents(),
		pluginLess({ exclude: /node_modules/ }),
	],
	html: {
		template: path.resolve(__dirname, './public/index.html'),
		favicon: path.resolve(__dirname, './public/logo.svg'),
	},
	source: {
		alias: {
			src: path.resolve(__dirname, './src'),
			'@': path.resolve(__dirname, './src'),
		},
	},
};

if (isDev) {
	config.server = {
		port: 9100,
		htmlFallback: false,
		historyApiFallback: {
			index: '/index.html',
		},
		proxy: [
			{
				context: ['/v1/**'],
				changeOrigin: true,
				target: 'http://127.0.0.1:9001',
				secure: false,
				cookieDomainRewrite: '',
			},
		],
	};
} else {
	config.output!.filename = {
		js: '[name].[contenthash].js',
	};
	config.performance = {
		chunkSplit: {
			strategy: 'custom',
			splitChunks: {
				chunks: 'all',
				cacheGroups: {
					'react-dom': {
						name: 'react-dom',
						test: /[\\/]node_modules[\\/]react-dom[\\/]/,
						chunks: 'all',
						priority: 10,
					},
					'rc-components': {
						name: 'rc-components',
						test: /rc-[a-zA-Z]/,
						chunks: 'all',
						enforce: true,
						priority: 10,
					},
					lodash: {
						name: 'lodash',
						test: /[\\/]node_modules[\\/]lodash[\\/]/,
						chunks: 'all',
						priority: 10,
					},
				},
			},
		},
	};
}

export default defineConfig(config);
