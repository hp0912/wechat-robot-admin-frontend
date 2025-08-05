import type { FormInstance } from 'antd';
import type { AnyType } from '@/common/types';

export const onTTSEnabledChange = (form: FormInstance<AnyType>, checked: boolean) => {
	if (checked) {
		if (!form.getFieldValue('tts_settings')) {
			form.setFieldsValue({
				tts_settings: JSON.stringify(
					{
						access_token: '',
						app: {
							appid: '',
							cluster: 'volcano_tts',
							token: '',
						},
						audio: {
							compression_rate: 1,
							emotion: 'radio',
							encoding: 'mp3',
							language: 'cn',
							pitch_ratio: 1,
							rate: 24000,
							speed_ratio: 1,
							voice_type: 'BV412_streaming',
							volume_ratio: 1,
						},
						base_url: 'https://openspeech.bytedance.com/api/v1/tts',
						request: {
							frontend_type: 'unitTson',
							operation: 'query',
							pure_english_opt: '1',
							silence_duration: '125',
							text_type: 'plain',
							with_frontend: '1',
						},
					},
					null,
					2,
				) as unknown as object,
			});
		}
		if (!form.getFieldValue('ltts_settings')) {
			form.setFieldsValue({
				ltts_settings: JSON.stringify(
					{
						access_token: '',
						appid: '',
						base_url: 'https://openspeech.bytedance.com/api/v1/tts_async/submit',
						callback_url: '',
						enable_subtitle: 0,
						format: 'mp3',
						language: '',
						pitch: 1,
						sample_rate: 24000,
						sentence_interval: 0,
						speed: 1,
						style: '',
						voice: '',
						voice_type: 'BV406_V2_streaming',
						volume: 1,
					},
					null,
					2,
				) as unknown as object,
			});
		}
	}
};

export const ObjectToString = <T extends { image_ai_settings: object; tts_settings: object; ltts_settings: object }>(
	data: T,
) => {
	if (data.image_ai_settings && typeof data.image_ai_settings === 'object') {
		data.image_ai_settings = JSON.stringify(data.image_ai_settings, null, 2) as unknown as object;
	}
	if (data.tts_settings && typeof data.tts_settings === 'object') {
		data.tts_settings = JSON.stringify(data.tts_settings, null, 2) as unknown as object;
	}
	if (data.ltts_settings && typeof data.ltts_settings === 'object') {
		data.ltts_settings = JSON.stringify(data.ltts_settings, null, 2) as unknown as object;
	}
};

export const chatBaseURLTips = (
	<>
		示例:{' '}
		<a
			href="https://ai-api.houhoukang.com/"
			target="_blank"
			rel="noreferrer"
		>
			https://ai-api.houhoukang.com/
		</a>
		，或者 https://ai-api.houhoukang.com/v1 或者
		https://ai-api.houhoukang.com/v2，如果不是以版本号结尾，会自动补全一个/v1
	</>
);

export const workflowModelTips = (
	<>
		<p>工作流模型是用来识别用户聊天意图的。</p>
		<p>工作流模型必须支持JSON Schema结构化输出，性能不用太好，要求速度快，推荐使用gpt-4o-mini或者gpt-4.1-mini。</p>
	</>
);

export const imageRecognitionModelTips = (
	<>
		<p>图像识别模型是用来识别用户上传的图片内容的。</p>
		<p>解决某些大模型文字输出效果很好，但是不支持图像识别的问题</p>
	</>
);
