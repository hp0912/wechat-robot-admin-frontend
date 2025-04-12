import type { AnyType } from '@/common/types';
import { IconGenerator } from './IconGenerator';

const SVG = (props: AnyType) => (
	<svg
		width="1em"
		height="1em"
		fill="currentColor"
		viewBox="0 0 1024 1024"
		{...props}
	>
		<path
			d="M891.2896 136.73813333C731.68213333 118.6816 611.60106667 75.50293333 534.39146667 8.36266667l-20.30933334-17.64693334-21.9136 15.63306667C371.16586667 92.74026667 251.4944 136.53333333 136.53333333 136.53333333h-34.13333333v477.86666667c0 146.50026667 129.16053333 279.38133333 394.88853333 406.25493333l13.96053334 6.656 14.2336-6.10986666C788.34346667 908.288 921.6 771.44746667 921.6 614.4V140.1856l-30.3104-3.44746667zM853.33333333 614.4c0 124.58666667-114.55146667 238.25066667-340.61653333 337.92C285.73013333 841.6256 170.66666667 727.9616 170.66666667 614.4V203.70773333c111.65013333-7.23626667 225.6896-49.80053333 339.72906666-126.8736C592.24746667 139.22986667 707.3792 180.8384 853.33333333 200.8064V614.4z"
			fill="currentColor"
		></path>
		<path
			d="M349.62773333 465.78346667a34.13333333 34.13333333 0 1 0-51.16586666 45.22666666L428.37333333 658.0224c13.44853333 15.18933333 32.18773333 23.00586667 51.0976 23.00586667a68.67626667 68.67626667 0 0 0 53.00906667-25.088l210.77333333-258.90133334a34.13333333 34.13333333 0 0 0-52.9408-43.1104l-210.77333333 258.8672-129.91146667-147.01226666z"
			fill="currentColor"
		></path>
	</svg>
);

export default IconGenerator('SafeOutlined', SVG);
