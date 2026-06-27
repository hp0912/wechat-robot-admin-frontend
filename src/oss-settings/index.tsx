import { useRequest } from 'ahooks';
import { Alert, App, Button, Form, Input, Select, Spin, Switch } from 'antd';
import React from 'react';
import type * as Api from '@/api/wechat-robot/wechat-robot';
import { filterOption } from '@/common/filter-option';
import type { AnyType } from '@/common/types';
import ParamsGroup from '@/components/ParamsGroup';
import { AliyunOSSConfig, CloudflareR2Config, TencentCloudOSSConfig, VolcengineTOSConfig } from '@/constant/oss';

interface IProps {
	robotId: number;
}

type IFormValues = Api.OssSettings.OssSettingsCreate.RequestBody;

const OSSSettings = (props: IProps) => {
	const { message } = App.useApp();

	const [form] = Form.useForm<IFormValues>();

	const { loading, refresh } = useRequest(
		async () => {
			const resp = await window.wechatRobotClient.ossSettings.ossSettingsList({
				id: props.robotId,
			});
			return resp.data?.data;
		},
		{
			manual: false,
			onSuccess: data => {
				if (data?.id) {
					if (data.aliyun_oss_settings) {
						try {
							(data as AnyType).aliyun_oss_settings = JSON.stringify(data.aliyun_oss_settings, null, 2);
						} catch {
							//
						}
					}
					if (data.tencent_cloud_oss_settings) {
						try {
							(data as AnyType).tencent_cloud_oss_settings = JSON.stringify(data.tencent_cloud_oss_settings, null, 2);
						} catch {
							//
						}
					}
					if (data.volcengine_tos_settings) {
						try {
							(data as AnyType).volcengine_tos_settings = JSON.stringify(data.volcengine_tos_settings, null, 2);
						} catch {
							//
						}
					}
					if (data.cloudflare_r2_settings) {
						try {
							(data as AnyType).cloudflare_r2_settings = JSON.stringify(data.cloudflare_r2_settings, null, 2);
						} catch {
							//
						}
					}
					form.setFieldsValue(data);
				}
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const { runAsync: onSave, loading: saveLoading } = useRequest(
		async (data: Api.OssSettings.OssSettingsCreate.RequestBody) => {
			const resp = await window.wechatRobotClient.ossSettings.ossSettingsCreate(
				{
					id: props.robotId,
				},
				data,
			);
			return resp.data?.data;
		},
		{
			manual: true,
			onSuccess: () => {
				message.success('保存成功');
				refresh();
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const onOk = async () => {
		const values = await form.validateFields();
		if (values.aliyun_oss_settings) {
			try {
				values.aliyun_oss_settings = JSON.parse(values.aliyun_oss_settings as unknown as string);
			} catch {
				values.aliyun_oss_settings = {};
			}
		} else {
			values.aliyun_oss_settings = {};
		}
		if (values.tencent_cloud_oss_settings) {
			try {
				values.tencent_cloud_oss_settings = JSON.parse(values.tencent_cloud_oss_settings as unknown as string);
			} catch {
				values.tencent_cloud_oss_settings = {};
			}
		} else {
			values.tencent_cloud_oss_settings = {};
		}
		if (values.volcengine_tos_settings) {
			try {
				values.volcengine_tos_settings = JSON.parse(values.volcengine_tos_settings as unknown as string);
			} catch {
				values.volcengine_tos_settings = {};
			}
		} else {
			values.volcengine_tos_settings = {};
		}
		if (values.cloudflare_r2_settings) {
			try {
				values.cloudflare_r2_settings = JSON.parse(values.cloudflare_r2_settings as unknown as string);
			} catch {
				values.cloudflare_r2_settings = {};
			}
		} else {
			values.cloudflare_r2_settings = {};
		}
		onSave(values);
	};

	return (
		<Spin spinning={loading}>
			<ParamsGroup
				title="OSS 设置"
				style={{ marginTop: 10 }}
			>
				<div style={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}>
					<Alert
						type="info"
						showIcon
						closable
						style={{ marginBottom: 24, marginTop: 8 }}
						title="考虑到刚登录的时候可能历史图片消息较多，因此登录一分钟内不会自动上传图片。"
					/>
					<Form
						layout="vertical"
						form={form}
						autoComplete="off"
						scrollToFirstError={{ behavior: 'instant', block: 'end', focus: true }}
					>
						<Form.Item
							name="id"
							hidden
						>
							<Input />
						</Form.Item>
						<Form.Item
							layout="horizontal"
							name="auto_upload_image"
							label="自动上传图片"
							valuePropName="checked"
							initialValue={false}
						>
							<Switch
								unCheckedChildren="关闭"
								checkedChildren="开启"
							/>
						</Form.Item>
						<Form.Item
							name="auto_upload_image_mode"
							label="图片上传模式"
							rules={[{ required: true, message: '图片上传模式不能为空' }]}
							initialValue="ai_only"
						>
							<Select
								style={{ width: '100%' }}
								placeholder="请选择图片上传模式"
								showSearch={{
									filterOption,
								}}
								allowClear
								options={[
									{ label: '上传所有图片', value: 'all', text: '上传所有图片' },
									{ label: '仅上传被AI引用的图片', value: 'ai_only', text: '仅上传被AI引用的图片' },
								]}
							/>
						</Form.Item>
						<Form.Item
							layout="horizontal"
							name="auto_upload_video"
							label="自动上传视频"
							valuePropName="checked"
							initialValue={false}
						>
							<Switch
								unCheckedChildren="关闭"
								checkedChildren="开启"
							/>
						</Form.Item>
						<Form.Item
							name="auto_upload_video_mode"
							label="视频上传模式"
							rules={[{ required: true, message: '视频上传模式不能为空' }]}
							initialValue="ai_only"
						>
							<Select
								style={{ width: '100%' }}
								placeholder="请选择视频上传模式"
								showSearch={{
									filterOption,
								}}
								allowClear
								options={[
									{ label: '上传所有视频', value: 'all', text: '上传所有视频', disabled: true },
									{ label: '仅上传被AI引用的视频', value: 'ai_only', text: '仅上传被AI引用的视频' },
								]}
							/>
						</Form.Item>
						<Form.Item
							layout="horizontal"
							name="auto_upload_voice"
							label="自动上传语音"
							valuePropName="checked"
							initialValue={false}
						>
							<Switch
								unCheckedChildren="关闭"
								checkedChildren="开启"
							/>
						</Form.Item>
						<Form.Item
							name="auto_upload_voice_mode"
							label="语音上传模式"
							rules={[{ required: true, message: '语音上传模式不能为空' }]}
							initialValue="ai_only"
						>
							<Select
								style={{ width: '100%' }}
								placeholder="请选择语音上传模式"
								showSearch={{
									filterOption,
								}}
								allowClear
								options={[
									{ label: '上传所有语音', value: 'all', text: '上传所有语音', disabled: true },
									{ label: '仅上传被AI引用的语音', value: 'ai_only', text: '仅上传被AI引用的语音' },
								]}
							/>
						</Form.Item>
						<Form.Item
							layout="horizontal"
							name="auto_upload_file"
							label="自动上传文件"
							valuePropName="checked"
							initialValue={false}
						>
							<Switch
								unCheckedChildren="关闭"
								checkedChildren="开启"
							/>
						</Form.Item>
						<Form.Item
							name="auto_upload_file_mode"
							label="文件上传模式"
							rules={[{ required: true, message: '文件上传模式不能为空' }]}
							initialValue="ai_only"
						>
							<Select
								style={{ width: '100%' }}
								placeholder="请选择文件上传模式"
								showSearch={{
									filterOption,
								}}
								allowClear
								options={[
									{ label: '上传所有文件', value: 'all', disabled: true, text: '上传所有文件' },
									{ label: '仅上传被AI引用的文件', value: 'ai_only', text: '仅上传被AI引用的文件' },
								]}
							/>
						</Form.Item>
						<Form.Item
							name="oss_provider"
							label="云存储供应商"
							rules={[{ required: true, message: '云存储供应商不能为空' }]}
							initialValue="aliyun"
						>
							<Select
								style={{ width: '100%' }}
								placeholder="请选择云存储供应商"
								showSearch={{
									filterOption,
								}}
								allowClear
								options={[
									{ label: '阿里云', value: 'aliyun', text: '阿里云 aliyun' },
									{ label: '腾讯云', value: 'tencent_cloud', text: '腾讯云 tencent_cloud' },
									{ label: '火山云', value: 'volcengine', text: '火山云 volcengine' },
									{ label: 'Cloudflare R2', value: 'cloudflare', text: 'Cloudflare R2 cloudflare' },
								]}
							/>
						</Form.Item>
						<Form.Item
							name="aliyun_oss_settings"
							label="阿里云 OSS 设置"
							initialValue={JSON.stringify(AliyunOSSConfig, null, 2)}
							tooltip={
								<>
									<pre>{JSON.stringify(AliyunOSSConfig, null, 2)}</pre>
								</>
							}
						>
							<Input.TextArea
								placeholder="请输入阿里云 OSS 设置"
								rows={8}
								allowClear
							/>
						</Form.Item>
						<Form.Item
							name="tencent_cloud_oss_settings"
							label="腾讯云 OSS 设置"
							initialValue={JSON.stringify(TencentCloudOSSConfig, null, 2)}
							tooltip={
								<>
									<pre>{JSON.stringify(TencentCloudOSSConfig, null, 2)}</pre>
								</>
							}
						>
							<Input.TextArea
								placeholder="请输入腾讯云 OSS 设置"
								rows={8}
								allowClear
							/>
						</Form.Item>
						<Form.Item
							name="volcengine_tos_settings"
							label="火山云 TOS 设置"
							initialValue={JSON.stringify(VolcengineTOSConfig, null, 2)}
							tooltip={
								<>
									<pre>{JSON.stringify(VolcengineTOSConfig, null, 2)}</pre>
								</>
							}
						>
							<Input.TextArea
								placeholder="请输入火山云 TOS 设置"
								rows={9}
								allowClear
							/>
						</Form.Item>
						<Form.Item
							name="cloudflare_r2_settings"
							label="Cloudflare R2 设置"
							initialValue={JSON.stringify(CloudflareR2Config, null, 2)}
							tooltip={
								<>
									<pre>{JSON.stringify(CloudflareR2Config, null, 2)}</pre>
								</>
							}
						>
							<Input.TextArea
								placeholder="请输入 Cloudflare R2 设置"
								rows={8}
								allowClear
							/>
						</Form.Item>
					</Form>
				</div>
			</ParamsGroup>
			<div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px' }}>
				<Button
					type="primary"
					loading={saveLoading}
					onClick={onOk}
				>
					保存
				</Button>
			</div>
		</Spin>
	);
};

export default React.memo(OSSSettings);
