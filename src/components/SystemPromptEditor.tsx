import Editor from '@monaco-editor/react';
import { useRequest } from 'ahooks';
import { App, Select } from 'antd';
import React from 'react';
import type { CSSProperties } from 'react';
import type * as Api from '@/api/wechat-robot/wechat-robot';
import { filterOption } from '@/common/filter-option';

interface IProps {
	className?: string;
	style?: CSSProperties;
	robotId: number;
	value?: string;
	onChange?: (value?: string) => void;
}

type ISystemPrompt = NonNullable<Api.SystemPrompts.SystemPromptsList.ResponseBody['data']>[number];

const SystemPromptEditor = (props: IProps) => {
	const { className = '', style = {} } = props;

	const { message } = App.useApp();

	const { data: prompts = [], loading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.systemPrompts.systemPromptsList({
				id: props.robotId,
			});
			return resp.data?.data || [];
		},
		{
			manual: false,
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const onPromptSelect = (promptId: number) => {
		const prompt = prompts.find((item: ISystemPrompt) => item.id === promptId);
		if (!prompt) {
			return;
		}
		props.onChange?.(prompt.content);
	};

	return (
		<div
			className={className}
			style={{
				position: 'relative',
				border: '1px solid #d9d9d9',
				borderRadius: 6,
				padding: '8px 2px',
				...style,
			}}
		>
			<Editor
				width="100%"
				height="450px"
				language="text"
				options={{
					minimap: { enabled: false },
					scrollBeyondLastLine: false,
					tabSize: 2,
					insertSpaces: true,
					fixedOverflowWidgets: true,
					wordWrap: 'on',
					scrollbar: { alwaysConsumeMouseWheel: false },
				}}
				value={props.value}
				onChange={props.onChange}
			/>
			<div style={{ position: 'absolute', top: 4, right: 4, zIndex: 9999 }}>
				<Select
					style={{ width: 200 }}
					variant="filled"
					placeholder="快速填充人设"
					showSearch={{
						filterOption,
					}}
					allowClear
					loading={loading}
					onSelect={onPromptSelect}
					options={prompts.map(item => {
						return {
							label: item.title,
							value: item.id,
							text: `${item.title}\n\n${item.content}`,
						};
					})}
				/>
			</div>
		</div>
	);
};

export default React.memo(SystemPromptEditor);
