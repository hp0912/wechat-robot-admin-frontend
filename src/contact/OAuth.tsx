import { useRequest } from 'ahooks';
import { App, Button, Tooltip } from 'antd';
import axios from 'axios';
import React from 'react';
import type { Api } from '@/api/wechat-robot/wechat-robot';
import PhoneOutlined from '@/icons/PhoneOutlined';

type ClipboardWithRead = Clipboard & {
	read?: () => Promise<ClipboardItem[]>;
};

interface IProps {
	robotId: number;
	robot: Api.V1RobotViewList.ResponseBody['data'];
}

const OAuth = (props: IProps) => {
	const { message } = App.useApp();

	const { runAsync, loading } = useRequest(
		async () => {
			const clipboard = navigator.clipboard as ClipboardWithRead;

			if (!clipboard || !clipboard.read) {
				throw new Error('当前浏览器暂不支持读取剪切板图片，请升级浏览器或手动上传');
			}

			let imageBlob: Blob | null = null;
			try {
				// 尝试读取剪切板中的所有项目
				const clipboardItems: ClipboardItem[] = await clipboard.read();

				for (const item of clipboardItems) {
					// 遍历剪切板项目的所有 MIME 类型，查找以 image/ 开头的类型
					for (const type of item.types) {
						if (type.startsWith('image/')) {
							imageBlob = await item.getType(type);
							break;
						}
					}

					if (imageBlob) break;
				}
			} catch (err) {
				const error = err as Error;
				// 捕获因权限或其他原因导致的异常
				throw new Error(error?.message || '读取剪切板失败，请检查浏览器权限设置');
			}

			if (!imageBlob) {
				throw new Error('剪切板中未检测到图片，请复制二维码图片后重试');
			}

			const formData = new FormData();
			// 以 qrcode 字段名上传
			formData.append('qrcode', imageBlob, 'qrcode.png');

			const resp = await axios.post(`/api/v1/wxapp/qrcode-auth-login?id=${props.robotId}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});
			if (resp.data.code !== 200) {
				throw new Error(resp.data.message || '授权登录请求失败');
			}
		},
		{
			manual: true,
			onError: reason => {
				message.error(reason.message);
			},
			onSuccess: () => {
				message.success('授权登录请求已发送');
			},
		},
	);

	return (
		<div style={{ display: 'inline-block' }}>
			<Tooltip
				title={
					<>
						授权APP登录，点击会读取剪切板中的二维码图片，进行授权登录。需要配合
						<a
							href="https://txapp.houhoukang.com/"
							target="_blank"
							rel="noopener noreferrer"
						>
							腾讯APP登录神器
						</a>
						使用
					</>
				}
			>
				<Button
					type="primary"
					ghost
					icon={<PhoneOutlined />}
					loading={loading}
					onClick={runAsync}
				/>
			</Tooltip>
		</div>
	);
};

export default React.memo(OAuth);
