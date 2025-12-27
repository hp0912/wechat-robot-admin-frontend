import { useBoolean } from 'ahooks';
import { App } from 'antd';
import { createStyles } from 'antd-style';
import streamSaver from 'streamsaver';

export const useAttachDownload = (type: string, robotId: number, messageId: number) => {
	const { message } = App.useApp();

	const [loading, setLoading] = useBoolean(false);

	const onAttachDownload = async () => {
		const controller = new AbortController();
		try {
			setLoading.setTrue();

			const url = `/api/v1/chat/${type}/download?id=${robotId}&message_id=${messageId}`;
			const resp = await fetch(url, { signal: controller.signal });
			if (!resp.ok) {
				resp.json().then(data => {
					if ('message' in data && typeof data.message === 'string') {
						message.error(data.message);
					}
				});
				return;
			}

			const disposition = resp.headers.get('Content-Disposition') || '';
			const fileName = /filename="?([^";]+)"?/.exec(disposition)?.[1] || 'file.bin';

			const fileStream = streamSaver.createWriteStream(fileName);
			const writer = fileStream.getWriter();

			writer.closed.catch(err => {
				if (err instanceof Error) {
					message.error(err.message);
				}
				controller.abort();
			});

			if (resp.body) {
				const reader = resp.body.getReader();
				while (true) {
					try {
						const { done, value } = await reader.read();
						if (done) break;
						await writer.write(value);
					} catch (err) {
						if (err instanceof Error) {
							message.error(err.message);
						}
						controller.abort();
						break;
					}
				}
				try {
					await writer.close();
				} catch {
					controller.abort();
				}
			}
		} catch (err) {
			if (err instanceof Error) {
				message.error(err.message);
			}
		} finally {
			setLoading.setFalse();
		}
	};

	return {
		loading,
		onAttachDownload,
	};
};

export const useStyle = createStyles(({ prefixCls, css }) => ({
	linearGradientButton: css`
		&.${prefixCls}-btn-primary:not([disabled]):not(.${prefixCls}-btn-dangerous) {
			> span {
				position: relative;
			}

			&::before {
				content: '';
				background: linear-gradient(135deg, #6253e1, #04befe);
				position: absolute;
				inset: -1px;
				opacity: 1;
				transition: all 0.3s;
				border-radius: inherit;
			}

			&:hover::before {
				opacity: 0;
			}
		}
	`,
}));
