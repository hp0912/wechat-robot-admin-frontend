import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

type MonacoEnv = {
	getWorker?: (moduleId: string, label: string) => Worker;
};

const globalWindow = globalThis as unknown as { MonacoEnvironment?: MonacoEnv };

function ensureTrailingSlash(value: string): string {
	return value.endsWith('/') ? value : `${value}/`;
}

function getRuntimeAssetBaseUrl(): string {
	if (typeof document !== 'undefined') {
		const scripts = Array.from(document.getElementsByTagName('script')).reverse();
		for (const script of scripts) {
			const src = script.src;
			if (!src) continue;
			try {
				const href = new URL(src, document.baseURI).toString();
				const marker = '/static/js/';
				const markerIndex = href.indexOf(marker);
				if (markerIndex >= 0) {
					return href.slice(0, markerIndex + 1);
				}
			} catch {
				// ignore
			}
		}

		if (document.baseURI) {
			try {
				return ensureTrailingSlash(new URL('.', document.baseURI).toString());
			} catch {
				return ensureTrailingSlash(document.baseURI);
			}
		}
	}

	if (typeof location !== 'undefined') {
		try {
			return ensureTrailingSlash(new URL('.', location.href).toString());
		} catch {
			// ignore
		}
	}

	return '/';
}

function getMonacoWorkerUrl(fileName: string): URL {
	return new URL(fileName, getRuntimeAssetBaseUrl());
}

function createClassicWorker(url: URL): Worker {
	const resolved = typeof location !== 'undefined' ? new URL(url.toString(), location.href) : url;

	try {
		return new Worker(resolved);
	} catch {
		const bootstrap = `importScripts(${JSON.stringify(resolved.toString())});`;
		const blob = new Blob([bootstrap], { type: 'text/javascript' });
		const blobUrl = URL.createObjectURL(blob);
		try {
			return new Worker(blobUrl);
		} finally {
			URL.revokeObjectURL(blobUrl);
		}
	}
}

globalWindow.MonacoEnvironment = {
	...(globalWindow.MonacoEnvironment ?? {}),
	getWorker(_moduleId, label) {
		if (label === 'json') {
			return createClassicWorker(getMonacoWorkerUrl('json.worker.js'));
		}
		if (label === 'css' || label === 'scss' || label === 'less') {
			return createClassicWorker(getMonacoWorkerUrl('css.worker.js'));
		}
		if (label === 'html' || label === 'handlebars' || label === 'razor') {
			return createClassicWorker(getMonacoWorkerUrl('html.worker.js'));
		}
		if (label === 'typescript' || label === 'javascript') {
			return createClassicWorker(getMonacoWorkerUrl('ts.worker.js'));
		}
		return createClassicWorker(getMonacoWorkerUrl('editor.worker.js'));
	},
};

loader.config({ monaco });
