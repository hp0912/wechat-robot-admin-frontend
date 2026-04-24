export const AiModels: Array<{ value: string }> = [
	{ value: 'deepseek-v4-pro' },
	{ value: 'deepseek-v4-flash' },
	{ value: 'doubao-seed-2-0-pro-260215' },
	{ value: 'doubao-seed-2-0-lite-260215' },
	{ value: 'doubao-seed-2-0-mini-260215' },
	{ value: 'qwen3.6-plus' },
	{ value: 'qwen3.5-plus' },
	{ value: 'glm-5.1' },
	{ value: 'glm-5' },
	{ value: 'glm-4.6v' },
	{ value: 'gpt-4o-mini' },
	{ value: 'gpt-4o' },
	{ value: 'gpt-4.1' },
	{ value: 'gemini-3-pro-preview' },
	{ value: 'gemini-3.1-pro-preview' },
	{ value: 'SparkDesk-v4.0' },
	{ value: 'ERNIE-4.0-Turbo-8K' },
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
