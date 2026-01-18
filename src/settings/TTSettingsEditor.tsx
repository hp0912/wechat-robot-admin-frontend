import Editor from '@monaco-editor/react';
import { Button } from 'antd';
import React from 'react';

interface IProps {
	value?: string;
	onChange?: (value?: string) => void;
}

const defaultValue = `{
  "request_body": {
    "namespace": "",
    "req_params": {
      "audio_params": {
        "format": "mp3",
        "sample_rate": 24000
      },
      "model": "",
      "speaker": "zh_female_vv_uranus_bigtts",
      "text": ""
    },
    "user": {
      "uid": ""
    }
  },
  "request_header": {
    "X-Api-Access-Key": "",
    "X-Api-App-Id": "",
    "X-Api-Request-Id": "",
    "X-Api-Resource-Id": "seed-tts-2.0",
    "X-Control-Require-Usage-Tokens-Return": ""
  },
  "url": "https://openspeech.bytedance.com/api/v3/tts/unidirectional"
}`;

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
						monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
							validate: true,
							schemas: [
								{
									uri: 'http://myserver/webhook-headers-schema.json',
									fileMatch: [model.uri.toString()],
									schema: {
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
								},
							],
						});
					}
				}}
			/>
			<div style={{ position: 'absolute', top: -40, right: 0, zIndex: 9999 }}>
				<Button
					onClick={() => {
						props.onChange?.(defaultValue);
					}}
				>
					重置为默认值
				</Button>
			</div>
		</div>
	);
};

export default React.memo(TTSettingsEditor);
