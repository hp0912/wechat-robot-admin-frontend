import type { FormInstance } from 'antd';
import type { AnyType } from '@/common/types';

export const defaultTTSValue = `{
  "request_body": {
    "namespace": "",
    "req_params": {
      "audio_params": {
        "format": "mp3",
        "sample_rate": 24000
      },
      "model": "",
      "speaker": "zh_female_vv_uranus_bigtts",
      "text": ""
    },
    "user": {
      "uid": ""
    }
  },
  "request_header": {
    "X-Api-Access-Key": "",
    "X-Api-App-Id": "",
    "X-Api-Request-Id": "",
    "X-Api-Resource-Id": "seed-tts-2.0",
    "X-Control-Require-Usage-Tokens-Return": ""
  },
  "url": "https://openspeech.bytedance.com/api/v3/tts/unidirectional"
}`;

export const defaultAIDrawingValue = `{
	"JiMeng": {
		"enabled": true,
		"base_url": "http://jimeng-api:9000",
		"model": "jimeng-4.1",
		"sessionid": ["xxxxxx"],
		"sample_strength": 0.5,
		"resolution": "2k",
		"ratio": "16:9",
		"response_format": "url"
	},
	"DouBao": {
		"enabled": true,
		"api_key": "xxxxxxx",
		"model": "doubao-seedream-4-0-250828",
		"size": "2K",
		"response_format": "url",
		"watermark": false
	},
	"GLM": {
		"enabled": true
	},
	"Z-Image": {
		"enabled": true,
		"base_url": "https://api-inference.modelscope.cn/",
		"api_key": "xxxxxxx",
		"model": "Tongyi-MAI/Z-Image-Turbo"
	}
}`;

export const onTTSEnabledChange = (form: FormInstance<AnyType>, checked: boolean) => {
	if (checked) {
		if (!form.getFieldValue('tts_settings')) {
			form.setFieldsValue({
				tts_settings: defaultTTSValue as unknown as object,
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

export const imageRecognitionModelTips = (
	<>
		<p>图像识别模型是用来识别用户上传的图片内容的。</p>
		<p>解决某些大模型文字输出效果很好，但是不支持图像识别的问题</p>
	</>
);
