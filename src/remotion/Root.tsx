import { Composition } from 'remotion'

import { MyComposition } from './Composition'
import {
	calculateOrderSummaryMetadata,
	defaultOrderSummaryVideoProps,
	OrderSummaryVideo,
	OrderSummaryVideoSchema,
} from './OrderSummaryVideo'

export const RemotionRoot = () => {
	return (
		<>
			<Composition
				id="SimpleDemo"
				component={MyComposition}
				durationInFrames={180}
				fps={30}
				width={1280}
				height={720}
			/>
			<Composition
				id="OrderSummaryVideo"
				component={OrderSummaryVideo}
				durationInFrames={180}
				fps={30}
				width={1280}
				height={720}
				defaultProps={defaultOrderSummaryVideoProps}
				schema={OrderSummaryVideoSchema}
				calculateMetadata={calculateOrderSummaryMetadata}
			/>
		</>
	)
}
