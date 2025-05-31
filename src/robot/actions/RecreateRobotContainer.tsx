import { DockerOutlined, DownOutlined } from '@ant-design/icons';
import { useMemoizedFn, useSetState } from 'ahooks';
import { App, Button, Dropdown, Modal } from 'antd';
import React from 'react';

interface IProps {
	robotId: number;
	onRefresh: () => void;
}

interface ImagePullProgress {
	image: string;
	status: string;
	progress: string;
	error?: string;
}

interface ImagePullRender {
	image: string;
	detail: string[];
	progress: string;
}

interface ImagePullState {
	open?: boolean;
	loading: boolean;
	eventSource: EventSource | null;
	progress: ImagePullRender[];
}

const Progress = (props: { open?: boolean; progress: ImagePullRender[] }) => {
	return (
		<Modal
			open={props.open}
			closable={false}
			maskClosable={false}
			title="更新机器人镜像"
			footer={null}
			width={900}
		>
			{(props.progress || []).map(item => {
				return (
					<div key={item.image}>
						{!!item.image && (
							<p>
								<b style={{ marginRight: 3 }}>镜像:</b>
								<span>{item.image}</span>
							</p>
						)}
						{!!item.detail?.length && <pre style={{ margin: 0 }}>{item.detail.join('\n')}</pre>}
						{!!item.progress && (
							<p>
								<b style={{ marginRight: 3 }}>进度:</b>
								<span>{item.progress}</span>
							</p>
						)}
					</div>
				);
			})}
		</Modal>
	);
};

const RecreateRobotContainer = (props: IProps) => {
	const { modal } = App.useApp();

	const [imagePullState, setImagePullState] = useSetState<ImagePullState>({
		loading: false,
		eventSource: null,
		progress: [],
	});

	const pullDockerImages = useMemoizedFn(() => {
		const eventSource = new EventSource('/api/v1/robot/docker/image/pull?id=' + props.robotId);

		setImagePullState({ open: true, loading: true, eventSource });

		eventSource.addEventListener('progress', event => {
			const progress = JSON.parse(event.data) as ImagePullProgress;
			if (progress.image) {
				setImagePullState(prev => {
					const prevProgress = prev.progress || [];
					const existingIndex = prevProgress.findIndex(item => item.image === progress.image);
					if (existingIndex !== -1) {
						prevProgress[existingIndex].progress = progress.progress || '0%';
						if (progress.status) {
							prevProgress[existingIndex].detail.push(progress.status);
						}
						if (progress.error) {
							prevProgress[existingIndex].detail.push(progress.error);
						}
					} else {
						const newItem: ImagePullRender = {
							image: progress.image,
							detail: [],
							progress: progress.progress || '0%',
						};
						if (progress.status) {
							newItem.detail.push(progress.status);
						}
						if (progress.error) {
							newItem.detail.push(progress.error);
						}
						prevProgress.push(newItem);
					}
					return { ...prev, progress: [...prevProgress] };
				});
			}
		});

		eventSource.addEventListener('complete', () => {
			eventSource.close();
			setImagePullState({ open: true, loading: false, eventSource: null, progress: [] });
		});

		eventSource.addEventListener('error', () => {
			eventSource.close();
			setImagePullState({ open: false, loading: false, eventSource: null, progress: [] });
		});
	});

	return (
		<div style={{ display: 'inline-block' }}>
			<Dropdown.Button
				type="primary"
				menu={{ items: [] }}
				buttonsRender={() => {
					return [
						<Button
							key="left"
							type="primary"
							loading={imagePullState.loading}
							icon={<DockerOutlined />}
							onClick={() => {
								modal.confirm({
									title: '更新机器人镜像',
									content: (
										<>
											确定要更新这个机器人的<b>镜像</b>吗？
										</>
									),
									okText: '更新',
									cancelText: '取消',
									onOk: pullDockerImages,
								});
							}}
						>
							更新镜像
						</Button>,
						<Button
							key="right"
							type="primary"
							icon={<DownOutlined />}
						/>,
					];
				}}
			/>
			<Progress
				open={imagePullState.open}
				progress={imagePullState.progress}
			/>
		</div>
	);
};

export default React.memo(RecreateRobotContainer);
