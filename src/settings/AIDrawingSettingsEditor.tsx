import Editor from '@monaco-editor/react';
import { Button } from 'antd';
import React from 'react';
import { registerMonacoJsonSchema } from './monacoJsonSchema';
import { defaultAIDrawingValue } from './utils';

interface IProps {
	value?: string;
	onChange?: (value?: string) => void;
}

const AIDrawingSettingsEditor = (props: IProps) => {
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
						registerMonacoJsonSchema(monaco, model.uri.toString(), 'http://myserver/ai-drawing-schema.json', {
							type: 'object',
							properties: {
								'Z-Image': {
									type: 'object',
									properties: {
										enabled: {
											type: 'boolean',
											description: '是否启用',
										},
										base_url: {
											type: 'string',
										},
										model: {
											type: 'string',
										},
										api_key: {
											type: 'string',
										},
									},
									required: ['enabled', 'base_url', 'model', 'api_key'],
									description: '造像绘图',
								},
								GLM: {
									type: 'object',
									properties: {
										enabled: {
											type: 'boolean',
											description: '是否启用',
										},
									},
									required: ['enabled'],
									description: '智谱',
								},
								JiMeng: {
									type: 'object',
									properties: {
										base_url: {
											type: 'string',
										},
										model: {
											type: 'string',
										},
										sessionid: {
											type: 'array',
											items: {
												type: 'string',
											},
										},
										sample_strength: {
											type: 'number',
										},
										resolution: {
											type: 'string',
										},
										ratio: {
											type: 'string',
										},
										response_format: {
											type: 'string',
										},
										enabled: {
											type: 'boolean',
											description: '是否启用',
										},
									},
									required: ['base_url', 'model', 'sessionid', 'enabled'],
									description: '即梦绘图',
								},
								DouBao: {
									type: 'object',
									properties: {
										enabled: {
											type: 'boolean',
											description: '是否启用',
										},
										api_key: {
											type: 'string',
										},
										model: {
											type: 'string',
										},
										response_format: {
											type: 'string',
										},
										watermark: {
											type: 'boolean',
											description: '是否包含水印',
										},
										size: {
											type: 'string',
										},
									},
									required: ['enabled', 'api_key', 'model'],
									description: '豆包绘图',
								},
								OpenAI: {
									type: 'object',
									properties: {
										n: {
											type: 'integer',
											description: '一次生成多少张图片',
										},
										size: {
											type: 'string',
											enum: [
												'auto',
												'1024x1024',
												'1536x1024',
												'1024x1536',
												'2048x2048',
												'2048x1152',
												'3840x2160',
												'2160x3840',
											],
										},
										quality: {
											type: 'string',
											enum: ['auto', 'low', 'medium', 'high'],
										},
										background: {
											type: 'string',
											enum: ['auto', 'opaque'],
										},
										output_format: {
											type: 'string',
											enum: ['png', 'jpeg', 'webp'],
										},
									},
									required: ['n', 'size', 'quality', 'background', 'output_format'],
									description: 'OpenAI 绘图',
								},
							},
							required: ['JiMeng', 'DouBao', 'GLM', 'Z-Image', 'OpenAI'],
						});
					}
				}}
			/>
			<div style={{ position: 'absolute', top: 4, right: 4, zIndex: 9999 }}>
				<Button
					color="default"
					variant="filled"
					onClick={() => {
						props.onChange?.(defaultAIDrawingValue);
					}}
				>
					重置为默认值
				</Button>
			</div>
		</div>
	);
};

export default React.memo(AIDrawingSettingsEditor);
