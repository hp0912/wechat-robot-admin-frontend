import Editor from '@monaco-editor/react';
import { Button, Popover, Space } from 'antd';
import React from 'react';
import { registerMonacoJsonSchema } from './monacoJsonSchema';
import { defaultTTSValue } from './utils';

interface IProps {
	value?: string;
	onChange?: (value?: string) => void;
}

const TTSettingsEditor = (props: IProps) => {
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
				height="250px"
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
						registerMonacoJsonSchema(monaco, model.uri.toString(), 'http://myserver/tts-settings-schema.json', {
							type: 'object',
							properties: {
								doubao: {
									type: 'object',
									properties: {
										request_body: {
											type: 'object',
											properties: {
												namespace: {
													type: 'string',
												},
												req_params: {
													type: 'object',
													properties: {
														audio_params: {
															type: 'object',
															properties: {
																format: {
																	type: 'string',
																	enum: ['mp3', 'wav'],
																},
																sample_rate: {
																	type: 'integer',
																},
															},
															required: ['format'],
														},
														model: {
															type: 'string',
														},
														speaker: {
															type: 'string',
														},
														text: {
															type: 'string',
														},
													},
													required: ['audio_params', 'speaker'],
												},
												user: {
													type: 'object',
													properties: {
														uid: {
															type: 'string',
														},
													},
												},
											},
											required: ['req_params', 'user'],
										},
										request_header: {
											type: 'object',
											properties: {
												'X-Api-Access-Key': {
													type: 'string',
												},
												'X-Api-App-Id': {
													type: 'string',
												},
												'X-Api-Request-Id': {
													type: 'string',
												},
												'X-Api-Resource-Id': {
													type: 'string',
												},
												'X-Control-Require-Usage-Tokens-Return': {
													type: 'string',
												},
											},
											required: ['X-Api-Access-Key', 'X-Api-App-Id', 'X-Api-Resource-Id'],
										},
										url: {
											type: 'string',
										},
									},
									required: ['request_body', 'request_header', 'url'],
									additionalProperties: {
										type: 'string',
										description: '其他自定义请求头',
									},
								},
								mimo: {
									type: 'object',
									properties: {
										base_url: {
											type: 'string',
											description: '小米语音接口地址，留空时使用聊天接口地址',
										},
										api_key: {
											type: 'string',
											description: '小米语音 API Key，留空时使用聊天接口 API Key',
										},
										voice: {
											type: 'string',
											description: '默认音色，可被上下文指定的音色覆盖',
										},
										audio_format: {
											type: 'string',
											description: '非流式音频格式，例如 wav、mp3；流式模式使用 pcm16 并封装为 wav',
										},
										stream: {
											type: 'boolean',
											description: '是否使用流式语音合成；音色设计和复刻当前在推理完成后以流式格式返回',
										},
										timeout: {
											type: 'number',
											exclusiveMinimum: 0,
											description: '语音合成请求超时时间，单位：秒',
										},
										auto_model: {
											type: 'boolean',
											description: '根据音色描述或复刻音频自动选择模型；引用语音时始终使用音色复刻模型',
										},
										voice_prompt: {
											type: 'string',
											description: '默认声线描述，可被上下文指定的描述覆盖',
										},
										style_prompt: {
											type: 'array',
											items: { type: 'string' },
											description: '默认风格提示，与上下文提供的风格提示合并',
										},
										context_texts: {
											type: 'array',
											items: { type: 'string' },
											description: '默认合成辅助信息，与上下文提供的辅助信息合并',
										},
										audio_tags: {
											type: 'array',
											items: { type: 'string' },
											description: '默认音频标签，可被上下文指定的标签覆盖',
										},
										emotion: {
											type: 'string',
											description: '默认情绪或整体风格',
										},
										speaking_rate: {
											type: 'string',
											description: '默认语速描述',
										},
										pitch: {
											type: 'string',
											description: '默认音高描述',
										},
										volume: {
											type: 'string',
											description: '默认音量或力度描述',
										},
										dialect: {
											type: 'string',
											description: '默认方言或口音',
										},
										voice_clone_audio: {
											type: 'string',
											description:
												'默认复刻音频，仅支持 MP3/WAV 的 Base64 或 data URL，Base64 不超过 10 MB；引用语音优先',
										},
										voice_clone_mime_type: {
											type: 'string',
											enum: ['audio/mpeg', 'audio/mp3', 'audio/wav'],
											description: '复刻音频的 MIME 类型；data URL 自带类型时忽略',
										},
									},
									required: ['base_url', 'api_key'],
									additionalProperties: false,
								},
							},
							required: ['doubao', 'mimo'],
						});
					}
				}}
			/>
			<div style={{ position: 'absolute', top: 4, right: 4, zIndex: 9999 }}>
				<Space>
					<Popover
						trigger="click"
						destroyOnHidden
						content={
							<div>
								使用默认中转站的话，小米语音的 base_url 和 api_key 可以配置成和 AI 聊天的一样(注意:
								中转站还不支持豆包语音)，中转站已经支持小米语音模型。
								<br />
							</div>
						}
					>
						<Button
							color="default"
							variant="filled"
						>
							配置说明
						</Button>
					</Popover>
					<Button
						color="default"
						variant="filled"
						onClick={() => {
							props.onChange?.(defaultTTSValue);
						}}
					>
						重置为默认值
					</Button>
				</Space>
			</div>
		</div>
	);
};

export default React.memo(TTSettingsEditor);
