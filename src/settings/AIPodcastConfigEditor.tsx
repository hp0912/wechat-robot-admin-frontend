import Editor from '@monaco-editor/react';
import { Button } from 'antd';
import React from 'react';
import { registerMonacoJsonSchema } from './monacoJsonSchema';
import { defaultAIPodcastValue } from './utils';

interface IProps {
	value?: string;
	onChange?: (value?: string) => void;
}

const AIPodcastConfigEditor = (props: IProps) => {
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
				height="150px"
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
						registerMonacoJsonSchema(monaco, model.uri.toString(), 'http://myserver/ai-podcast-schema.json', {
							type: 'object',
							properties: {
								DouBao: {
									type: 'object',
									properties: {
										app_id: {
											type: 'string',
										},
										access_key: {
											type: 'string',
										},
										resource_id: {
											type: 'string',
										},
									},
									required: ['app_id', 'access_key', 'resource_id'],
									description: '豆包 AI 播客',
								},
							},
							required: ['DouBao'],
						});
					}
				}}
			/>
			<div style={{ position: 'absolute', top: 4, right: 4, zIndex: 9999 }}>
				<Button
					color="default"
					variant="filled"
					onClick={() => {
						props.onChange?.(defaultAIPodcastValue);
					}}
				>
					重置为默认值
				</Button>
			</div>
		</div>
	);
};

export default React.memo(AIPodcastConfigEditor);
