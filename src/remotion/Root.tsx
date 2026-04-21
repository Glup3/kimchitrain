import { Composition } from 'remotion'

import {
	calculateOrderSummaryMetadata,
	defaultOrderSummaryVideoProps,
	OrderSummaryVideo,
	OrderSummaryVideoSchema,
} from './OrderSummaryVideo'

export const RemotionRoot = () => {
	return (
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
	)
}
