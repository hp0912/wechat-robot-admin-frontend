import Editor from '@monaco-editor/react';
import React from 'react';
import { registerMonacoJsonSchema } from '@/settings/monacoJsonSchema';

interface IProps {
	value?: string;
	onChange?: (value?: string) => void;
}

const EnvEditor = (props: IProps) => {
	return (
		<div
			style={{
				position: 'relative',
				border: '1px solid #d9d9d9',
				borderRadius: 6,
				padding: '8px 2px',
			}}
		>
			<Editor
				width="100%"
				height="450px"
				language="json"
				options={{
					minimap: { enabled: false },
					scrollBeyondLastLine: false,
					tabSize: 2,
					insertSpaces: true,
					fixedOverflowWidgets: true,
					scrollbar: { alwaysConsumeMouseWheel: false },
				}}
				value={props.value}
				onChange={props.onChange}
				onMount={(editor, monaco) => {
					const model = editor.getModel();
					if (model) {
						registerMonacoJsonSchema(monaco, model.uri.toString(), 'http://myserver/skill-env-schema.json', {
							type: 'array',
							items: {
								type: 'object',
								properties: {
									key: {
										type: 'string',
									},
									value: {
										type: 'string',
									},
									description: {
										type: 'string',
									},
								},
								required: ['key', 'value'],
							},
						});
					}
				}}
			/>
		</div>
	);
};

export default React.memo(EnvEditor);
