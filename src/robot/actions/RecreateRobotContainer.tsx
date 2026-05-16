import {
	CloseCircleOutlined,
	DeleteOutlined,
	DockerOutlined,
	DownOutlined,
	FundProjectionScreenOutlined,
	PlayCircleOutlined,
	PlaySquareOutlined,
} from '@ant-design/icons';
import { useMemoizedFn, useRequest, useSetState } from 'ahooks';
import { App, Button, Dropdown, Modal, Space, theme } from 'antd';
import type { MenuProps } from 'antd';
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

interface PprofSamplingPayload {
	mutex?: boolean;
	block?: boolean;
}

interface PprofSamplingState {
	mutex_enabled: boolean;
	block_enabled: boolean;
	mutex_fraction: number;
	block_rate: number;
}

const Progress = (props: { open?: boolean; progress: ImagePullRender[] }) => {
	return (
		<Modal
			open={props.open}
			closable={false}
			mask={{
				closable: false,
			}}
			title="更新机器人镜像"
			footer={null}
			width="min(900px, calc(100vw - 32px))"
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
						{!!item.detail?.length && (
							<pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{item.detail.join('\n')}</pre>
						)}
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
	const { token } = theme.useToken();
	const { message, modal } = App.useApp();

	const [imagePullState, setImagePullState] = useSetState<ImagePullState>({
		loading: false,
		eventSource: null,
		progress: [],
	});

	const { runAsync: removeClientContainer, loading: removeClientLoading } = useRequest(
		async () => {
			await window.wechatRobotClient.api.v1RobotDockerContainerClientRemoveDelete({ id: props.robotId });
		},
		{
			manual: true,
			onSuccess: () => {
				message.success('删除客户端容器成功');
				props.onRefresh();
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const { runAsync: removeServerContainer, loading: removeServerLoading } = useRequest(
		async () => {
			await window.wechatRobotClient.api.v1RobotDockerContainerServerRemoveDelete({ id: props.robotId });
		},
		{
			manual: true,
			onSuccess: () => {
				message.success('删除服务端容器成功');
				props.onRefresh();
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const { runAsync: createClientContainer, loading: createClientLoading } = useRequest(
		async () => {
			await window.wechatRobotClient.api.v1RobotDockerContainerClientStartCreate({ id: props.robotId });
		},
		{
			manual: true,
			onSuccess: () => {
				message.success('创建客户端容器成功');
				props.onRefresh();
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const { runAsync: createServerContainer, loading: createServerLoading } = useRequest(
		async () => {
			await window.wechatRobotClient.api.v1RobotDockerContainerServerStartCreate(
				{ id: props.robotId },
				{ id: props.robotId },
			);
		},
		{
			manual: true,
			onSuccess: () => {
				message.success('创建服务端容器成功');
				props.onRefresh();
			},
			onError: reason => {
				message.error(reason.message);
			},
		},
	);

	const getPprofUrl = useMemoizedFn((path = '') => {
		const [profilePath, rawQuery = ''] = path.split('?');
		const params = new URLSearchParams(rawQuery);
		params.set('id', String(props.robotId));
		params.set('v', String(Date.now()));
		const suffix = profilePath ? `/${profilePath}` : '/';
		return `/api/v1/pprof/debug/pprof${suffix}?${params.toString()}`;
	});

	const updatePprofSampling = useMemoizedFn(async (payload: PprofSamplingPayload, successText: string) => {
		const response = await fetch(getPprofUrl('sampling'), {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(payload),
		});
		if (!response.ok) {
			throw new Error(await response.text());
		}
		const state = (await response.json()) as PprofSamplingState;
		message.success(
			`${successText}，阻塞采样: ${state.block_enabled ? '开启' : '关闭'}，锁竞争采样: ${state.mutex_enabled ? '开启' : '关闭'}`,
		);
	});

	const handlePprofSampling = useMemoizedFn(async (payload: PprofSamplingPayload, successText: string) => {
		try {
			await updatePprofSampling(payload, successText);
		} catch (error) {
			message.error(error instanceof Error ? error.message : '设置性能采样失败');
		}
	});

	const openPerformanceSampling = useMemoizedFn(() => {
		modal.info({
			title: '性能采样',
			content: (
				<Space
					orientation="vertical"
					size={8}
				>
					<a href={getPprofUrl()}>pprof 首页</a>
					<a href={getPprofUrl('profile?seconds=30')}>CPU 采样</a>
					<a href={getPprofUrl('heap')}>堆内存</a>
					<a href={getPprofUrl('allocs')}>内存分配</a>
					<a href={getPprofUrl('goroutine?debug=1')}>Goroutine</a>
					<Space wrap>
						<Button onClick={() => handlePprofSampling({ block: true }, '已开启阻塞采样')}>开启阻塞采样</Button>
						<Button onClick={() => handlePprofSampling({ block: false }, '已关闭阻塞采样')}>关闭阻塞采样</Button>
						<a href={getPprofUrl('block')}>查看阻塞数据</a>
					</Space>
					<Space wrap>
						<Button onClick={() => handlePprofSampling({ mutex: true }, '已开启锁竞争采样')}>开启锁竞争采样</Button>
						<Button onClick={() => handlePprofSampling({ mutex: false }, '已关闭锁竞争采样')}>关闭锁竞争采样</Button>
						<a href={getPprofUrl('mutex')}>查看锁竞争数据</a>
					</Space>
				</Space>
			),
		});
	});

	const items: MenuProps['items'] = [
		{
			label: '删除客户端容器',
			key: 'remove-client',
			icon: <CloseCircleOutlined style={{ color: token.colorError }} />,
			onClick: () => {
				if (removeClientLoading) {
					message.warning('正在删除容器，请稍后再试');
					return;
				}
				modal.confirm({
					title: '删除机器人客户端容器',
					content: (
						<>
							确定要删除这个机器人的<b>客户端容器</b>吗？
						</>
					),
					okText: '删除',
					cancelText: '取消',
					onOk: async () => {
						await removeClientContainer();
					},
				});
			},
		},
		{
			label: '删除服务端容器',
			key: 'remove-server',
			icon: <DeleteOutlined style={{ color: token.colorError }} />,
			onClick: () => {
				if (removeServerLoading) {
					message.warning('正在删除容器，请稍后再试');
					return;
				}
				modal.confirm({
					title: '删除机器人服务端容器',
					content: (
						<>
							确定要删除这个机器人的<b>服务端容器</b>吗？
						</>
					),
					okText: '删除',
					cancelText: '取消',
					onOk: async () => {
						await removeServerContainer();
					},
				});
			},
		},
		{
			label: '创建客户端容器',
			key: 'create-client',
			icon: <PlayCircleOutlined style={{ color: token.colorPrimary }} />,
			onClick: () => {
				if (createClientLoading) {
					message.warning('正在创建容器，请稍后再试');
					return;
				}
				modal.confirm({
					title: '创建机器人客户端容器',
					content: (
						<>
							确定要创建这个机器人的<b>客户端容器</b>吗？
						</>
					),
					okText: '创建',
					cancelText: '取消',
					onOk: async () => {
						await createClientContainer();
					},
				});
			},
		},
		{
			label: '创建服务端容器',
			key: 'create-server',
			icon: <PlaySquareOutlined style={{ color: token.colorPrimary }} />,
			onClick: () => {
				if (createServerLoading) {
					message.warning('正在创建容器，请稍后再试');
					return;
				}
				modal.confirm({
					title: '创建机器人服务端容器',
					content: (
						<>
							确定要创建这个机器人的<b>服务端容器</b>吗？
						</>
					),
					okText: '创建',
					cancelText: '取消',
					onOk: async () => {
						await createServerContainer();
					},
				});
			},
		},
		{
			label: '性能采样',
			key: 'performance-sampling',
			icon: <FundProjectionScreenOutlined style={{ color: token.colorPrimary }} />,
			onClick: openPerformanceSampling,
		},
	];

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
						if (progress.progress) {
							prevProgress[existingIndex].progress = progress.progress;
						}
						if (progress.status) {
							const detail = prevProgress[existingIndex].detail;
							const lastDetailItem = detail[detail.length - 1];
							// 去除一些重复的日志
							if (lastDetailItem && lastDetailItem !== progress.status) {
								detail.push(progress.status);
							}
							if (progress.status === 'complete') {
								prevProgress[existingIndex].progress = '100%';
							}
						}
						if (progress.error) {
							prevProgress[existingIndex].detail.push(progress.error);
						}
					} else {
						const newItem: ImagePullRender = {
							image: progress.image,
							detail: [],
							progress: progress.progress,
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
			setImagePullState({ open: false, loading: false, eventSource: null, progress: [] });
		});

		eventSource.addEventListener('error', () => {
			eventSource.close();
			setImagePullState({ open: false, loading: false, eventSource: null, progress: [] });
		});
	});

	return (
		<div style={{ display: 'inline-block' }}>
			<Space.Compact>
				<Button
					color="primary"
					variant="filled"
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
				</Button>
				<Dropdown
					menu={{ items }}
					placement="bottomRight"
				>
					<Button
						color="primary"
						variant="filled"
						icon={<DownOutlined />}
					/>
				</Dropdown>
			</Space.Compact>
			<Progress
				open={imagePullState.open}
				progress={imagePullState.progress}
			/>
		</div>
	);
};

export default React.memo(RecreateRobotContainer);
