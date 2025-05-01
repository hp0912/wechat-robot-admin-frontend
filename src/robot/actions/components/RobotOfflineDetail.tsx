import { useRequest } from 'ahooks';
import { App, Drawer, Form, Input, Spin } from 'antd';
import dayjs from 'dayjs';
import React from 'react';

interface IProps {
	robotId: number;
	open: boolean;
	onClose: () => void;
}

const RobotOfflineDetail = (props: IProps) => {
	const { message } = App.useApp();

	const { open, onClose } = props;

	const [form] = Form.useForm();

	const { data, loading } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.api.v1RobotViewList({
				id: props.robotId,
			});
			return resp.data?.data;
		},
		{
			manual: false,
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	return (
		<Drawer
			title="机器人元数据"
			open={open}
			onClose={onClose}
			width={600}
			footer={null}
		>
			<Spin spinning={loading}>
				<Form
					form={form}
					labelCol={{ flex: '0 0 115px' }}
					wrapperCol={{ flex: '1 1 auto' }}
					autoComplete="off"
				>
					<Form.Item label="机器人ID">
						<Input
							disabled
							value={data?.id || '-'}
						/>
					</Form.Item>
					<Form.Item label="机器人编码">
						<Input
							disabled
							value={data?.robot_code || '-'}
						/>
					</Form.Item>
					<Form.Item label="归属人">
						<Input
							disabled
							value={data?.owner || '-'}
						/>
					</Form.Item>
					<Form.Item label="设备ID">
						<Input
							disabled
							value={data?.device_id || '-'}
						/>
					</Form.Item>
					<Form.Item label="设备名称">
						<Input
							disabled
							value={data?.device_name || '-'}
						/>
					</Form.Item>
					<Form.Item label="微信ID">
						<Input
							disabled
							value={data?.wechat_id || '-'}
						/>
					</Form.Item>
					<Form.Item label="微信昵称">
						<Input
							disabled
							value={data?.nickname || '-'}
						/>
					</Form.Item>
					<Form.Item label="RDS">
						<Input
							disabled
							value={data?.redis_db || '-'}
						/>
					</Form.Item>
					<Form.Item label="错误信息">
						<Input.TextArea
							rows={3}
							disabled
							value={data?.error_message || '-'}
						/>
					</Form.Item>
					<Form.Item label="上一次登陆时间">
						<Input
							disabled
							value={data?.last_login_at ? dayjs(data.last_login_at * 1000).format('YYYY-MM-DD HH:mm:ss') : '-'}
						/>
					</Form.Item>
					<Form.Item label="创建时间">
						<Input
							disabled
							value={data?.created_at ? dayjs(data.created_at * 1000).format('YYYY-MM-DD HH:mm:ss') : '-'}
						/>
					</Form.Item>
				</Form>
			</Spin>
		</Drawer>
	);
};

export default React.memo(RobotOfflineDetail);
