import { Composition } from 'remotion'

import { MyComposition } from './Composition'

export const RemotionRoot = () => {
	return (
		<Composition id="SimpleDemo" component={MyComposition} durationInFrames={180} fps={30} width={1280} height={720} />
	)
}
