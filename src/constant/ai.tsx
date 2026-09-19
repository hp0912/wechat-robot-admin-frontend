import { DeepSeekFilled, ExclamationCircleOutlined, QwenFilled } from '@ant-design/icons';
import { Flex, Space, Tag } from 'antd';
import DoubaoFilled from '@/icons/DoubaoFilled';
import GlmFilled from '@/icons/GlmFilled';
import HyFilled from '@/icons/HyFilled';

export const AiModels: Array<{ label?: React.ReactNode; value: string }> = [
	{
		label: (
			<Flex
				justify="space-between"
				align="center"
			>
				<Space size={4}>
					<DeepSeekFilled />
					<span>deepseek-flash</span>
				</Space>
				<Tag
					color="warning"
					icon={<ExclamationCircleOutlined />}
					variant="filled"
				>
					不支持结构化输出
				</Tag>
			</Flex>
		),
		value: 'deepseek-flash',
	},
	{
		label: (
			<Flex
				justify="space-between"
				align="center"
			>
				<Space size={4}>
					<DoubaoFilled />
					<span>doubao-seed-2-1-pro-260915</span>
				</Space>
			</Flex>
		),
		value: 'doubao-seed-2-1-pro-260915',
	},
	{
		label: (
			<Flex
				justify="space-between"
				align="center"
			>
				<Space size={4}>
					<DoubaoFilled />
					<span>doubao-seed-2-1-turbo-260628</span>
				</Space>
			</Flex>
		),
		value: 'doubao-seed-2-1-turbo-260628',
	},
	{
		label: (
			<Flex
				justify="space-between"
				align="center"
			>
				<Space size={4}>
					<DoubaoFilled />
					<span>doubao-seed-2-0-pro-260215</span>
				</Space>
				<Tag
					color="warning"
					icon={<ExclamationCircleOutlined />}
					variant="filled"
				>
					不支持结构化输出
				</Tag>
			</Flex>
		),
		value: 'doubao-seed-2-0-pro-260215',
	},
	{
		label: (
			<Flex
				justify="space-between"
				align="center"
			>
				<Space size={4}>
					<DoubaoFilled />
					<span>doubao-seed-2-0-lite-260215</span>
				</Space>
			</Flex>
		),
		value: 'doubao-seed-2-0-lite-260215',
	},
	{
		label: (
			<Flex
				justify="space-between"
				align="center"
			>
				<Space size={4}>
					<DoubaoFilled />
					<span>doubao-seed-2-0-mini-260215</span>
				</Space>
			</Flex>
		),
		value: 'doubao-seed-2-0-mini-260215',
	},
	{
		label: (
			<Flex
				justify="space-between"
				align="center"
			>
				<Space size={4}>
					<QwenFilled />
					<span>qwen3.8-max</span>
				</Space>
			</Flex>
		),
		value: 'qwen3.8-max',
	},
	{
		label: (
			<Flex
				justify="space-between"
				align="center"
			>
				<Space size={4}>
					<QwenFilled />
					<span>qwen3.8-flash</span>
				</Space>
			</Flex>
		),
		value: 'qwen3.8-flash',
	},
	{
		label: (
			<Flex
				justify="space-between"
				align="center"
			>
				<Space size={4}>
					<QwenFilled />
					<span>qwen3.7-max</span>
				</Space>
			</Flex>
		),
		value: 'qwen3.7-max',
	},
	{
		label: (
			<Flex
				justify="space-between"
				align="center"
			>
				<Space size={4}>
					<QwenFilled />
					<span>qwen3.7-flash</span>
				</Space>
			</Flex>
		),
		value: 'qwen3.7-flash',
	},
	{
		label: (
			<Flex
				justify="space-between"
				align="center"
			>
				<Space size={4}>
					<GlmFilled />
					<span>glm-5.3</span>
				</Space>
				<Tag
					color="warning"
					icon={<ExclamationCircleOutlined />}
					variant="filled"
				>
					不支持结构化输出
				</Tag>
			</Flex>
		),
		value: 'glm-5.3',
	},
	{
		label: (
			<Flex
				justify="space-between"
				align="center"
			>
				<Space size={4}>
					<GlmFilled />
					<span>glm-5.3-flash</span>
				</Space>
				<Tag
					color="warning"
					icon={<ExclamationCircleOutlined />}
					variant="filled"
				>
					不支持结构化输出
				</Tag>
			</Flex>
		),
		value: 'glm-5.3-flash',
	},
	{
		label: (
			<Flex
				justify="space-between"
				align="center"
			>
				<Space size={4}>
					<HyFilled />
					<span>hy4-preview</span>
				</Space>
			</Flex>
		),
		value: 'hy4-preview',
	},
	{
		label: (
			<Flex
				justify="space-between"
				align="center"
			>
				<Space size={4}>
					<HyFilled />
					<span>hy3</span>
				</Space>
			</Flex>
		),
		value: 'hy3',
	},
];

export const ReasoningEffortOptions: Array<{ value: string }> = [
	{ value: 'none' },
	{ value: 'minimal' },
	{ value: 'low' },
	{ value: 'medium' },
	{ value: 'high' },
	{ value: 'xhigh' },
	{ value: 'max' },
];

export const TextEmbeddingModels: Array<{ value: string }> = [
	{ value: 'text-embedding-3-small' },
	{ value: 'text-embedding-3-large' },
	{ value: 'text-embedding-ada-002' },
	{ value: 'text-embedding-v4' },
];

export const TextEmbeddingDimensions: Array<{ label: string; value: number; text: string }> = [
	{ label: '1024', value: 1024, text: '1024' },
	{ label: '1536', value: 1536, text: '1536' },
	{ label: '2048', value: 2048, text: '2048' },
	{ label: '3072', value: 3072, text: '3072' },
	{ label: '4096', value: 4096, text: '4096' },
	{ label: '8192', value: 8192, text: '8192' },
];

export const ImageEmbeddingModels: Array<{ value: string }> = [];
