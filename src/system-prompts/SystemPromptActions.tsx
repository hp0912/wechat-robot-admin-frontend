import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useBoolean, useRequest } from 'ahooks';
import { App, Button, Space, Tooltip } from 'antd';
import React from 'react';
import type { DtoSystemPrompt as SystemPrompt } from '@/api/wechat-robot/wechat-robot';
import SystemPromptEditor from './SystemPromptEditor';

interface IProps {
	className?: string;
	style?: React.CSSProperties;
	robotId: number;
	dataSource: SystemPrompt;
	onRefresh: () => void;
}

const SystemPromptActions = (props: IProps) => {
	const { className = '', style = {} } = props;

	const { message, modal } = App.useApp();

	const [onEditOpen, setOnEditOpen] = useBoolean(false);

	const { runAsync: onRemove, loading: removeLoading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.systemPrompts.systemPromptsDelete(
				{
					id: props.robotId,
				},
				{
					id: props.dataSource.id || 0,
				},
			);
			return resp.data?.data;
		},
		{
			manual: true,
			onSuccess: () => {
				message.success('删除成功');
				props.onRefresh();
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	return (
		<Space
			className={className}
			style={style}
			size={8}
		>
			<Tooltip title="编辑">
				<Button
					type="primary"
					ghost
					size="small"
					icon={<EditOutlined />}
					onClick={setOnEditOpen.setTrue}
				/>
			</Tooltip>
			<Tooltip title="删除">
				<Button
					type="primary"
					danger
					ghost
					size="small"
					loading={removeLoading}
					icon={<DeleteOutlined />}
					onClick={() => {
						modal.confirm({
							title: '删除人设',
							content: (
								<>
									确认删除人设 <b>{props.dataSource.title}</b> 吗？
								</>
							),
							width: 350,
							okText: '删除',
							okButtonProps: { danger: true },
							onOk: async () => {
								await onRemove();
							},
						});
					}}
				/>
			</Tooltip>
			{onEditOpen && (
				<SystemPromptEditor
					open={onEditOpen}
					robotId={props.robotId}
					dataSource={props.dataSource}
					onClose={setOnEditOpen.setFalse}
					onRefresh={props.onRefresh}
				/>
			)}
		</Space>
	);
};

export default React.memo(SystemPromptActions);
