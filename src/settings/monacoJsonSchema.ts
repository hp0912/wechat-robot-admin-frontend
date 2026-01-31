import type { EditorProps } from '@monaco-editor/react';

type Monaco = Parameters<NonNullable<EditorProps['onMount']>>[1];

type MonacoJsonSchema = {
	uri: string;
	fileMatch: string[];
	schema: object;
};

const jsonSchemaRegistry = new Map<string, MonacoJsonSchema>();

export const registerMonacoJsonSchema = (monaco: Monaco, modelUri: string, schemaUri: string, schema: object) => {
	jsonSchemaRegistry.set(schemaUri, {
		uri: schemaUri,
		fileMatch: [modelUri],
		schema,
	});

	monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
		validate: true,
		schemas: Array.from(jsonSchemaRegistry.values()),
	});
};
