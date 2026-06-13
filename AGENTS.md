### 项目技术栈

- React 19

- antd 6

- typescript 5

### React 组件风格约束

```tsx
import React from 'react';

interface IProps {
	className?: string;
	style?: React.CSSProperties;
	onInsert?: (value: string) => void;
}

const ComponentExample = (props: IProps) => {
	const { className = '', style = {} } = props;

	return (
		<div
			className={className}
			style={style}
		></div>
	);
};

export default React.memo(ComponentExample);
```

- 使用 React.memo 包裹组件，组件参数这样写: `(props: IProps)`，不要使用解构的写法

- props 上面的属性，className 和 style 使用解构，其他的直接从 props 上面获取，就是这样`props.xxx`，不需要解构出来

- 如果有 styled 组件，如果单个组件内容在 10 行以内且只有一个 styled 组件，可以放在同一个文件，否则放在单独的文件里面。相同逻辑的 styled 组件放一起，放在同一个文件。

- 上游传递下来的属性，尽量保持稳定，比如传递函数的时候，使用 `useMemoizedFn` 包裹

- 单个组件原则上不超过 300 行，但是也不要刻意拆组件，比如拆出来的组件内容太少只有 30 行，又没有其他地方复用

## 接口请求约束

- 现在的接口都是根据 `scripts/swagger/wechat-robot.swagger.json` 自动生成的，最终挂载在 window 对象上，示例: `window.wechatRobotClient.api.v1ChatRoomMembersSyncCreate`，如果你找不到接口那就是 swagger 没更新或者没跑脚本自动生成，这个时候你要及时反馈，不要自己瞎编接口

## 导入依赖约束

- 假如从同一个地方导入了值依赖和类型依赖，应该分开导入，使用 `import type` 来导入类型依赖

## antd 组件样式覆盖约束

- 当前版本 antd6 支持语义化的 className 和 style，也支持主题变量。进行个性化样式定制的时候，尽量使用语义化的 className，而不是通过 css 权重强行覆盖，除非 antd 语义化满足不了。antd 官方的`Semantic DOM` 和 `Design Token`。

## 其它约束

- 每次改完要执行 `pnpm lint` 检查
