import { useRequest } from 'ahooks';
import { App, Form, Input, Modal } from 'antd';
import React from 'react';
import type { SnsObject } from '@/api/wechat-robot/wechat-robot';

interface IProps {
	open: boolean;
	robotId: number;
	momentId: string;
	replyCommnetId?: number;
	onRefresh: (snsObject: SnsObject) => void;
	onClose: () => void;
}

const CommentMoment = (props: IProps) => {
	const { message } = App.useApp();

	const [form] = Form.useForm<{ content: string }>();

	const { runAsync, loading } = useRequest(
		async (content: string) => {
			const resp = await window.wechatRobotClient.api.v1MomentsCommentCreate(
				{
					id: props.robotId,
				},
				{
					id: props.robotId,
					MomentId: props.momentId,
					Type: 2,
					ReplyCommnetId: props.replyCommnetId!,
					Content: content,
				},
			);
			return resp.data?.data;
		},
		{
			manual: true,
			onSuccess: resp => {
				message.success('评论成功');
				props.onRefresh(resp);
				props.onClose();
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	return (
		<Modal
			title="评论朋友圈"
			open={props.open}
			width={376}
			confirmLoading={loading}
			onOk={async () => {
				const values = await form.validateFields();
				runAsync(values.content);
			}}
			onCancel={props.onClose}
		>
			<Form
				form={form}
				autoComplete="off"
			>
				<Form.Item
					name="content"
					rules={[
						{ required: true, message: '请输入评论' },
						{ max: 100, message: '评论不能超过1000个字符' },
					]}
				>
					<Input.TextArea
						rows={5}
						placeholder="说点什么吧"
						allowClear
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default React.memo(CommentMoment);
