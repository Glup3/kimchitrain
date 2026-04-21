import {
	AbsoluteFill,
	interpolate,
	spring,
	type CalculateMetadataFunction,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion'
import { z } from 'zod'

const FPS = 30
const VIDEO_WIDTH = 1280
const TRAIN_PADDING = 180
const TRAIN_SPEED = 5.4
const LOCO_WIDTH = 280
const CARRIAGE_WIDTH = 250
const CARRIAGE_GAP = 20

const COLORS = {
	seaInk: '#1c1917',
	seaInkSoft: '#78716c',
	lagoon: '#dc2626',
	lagoonDeep: '#b91c1c',
	palm: '#d97706',
	sand: '#f5f5f4',
	foam: '#fafaf9',
	surface: 'rgba(255, 255, 255, 0.78)',
	surfaceStrong: 'rgba(255, 255, 255, 0.92)',
	line: 'rgba(28, 25, 23, 0.08)',
	dot: 'rgba(28, 25, 23, 0.04)',
}

export const OrderSummaryVideoSchema = z.object({
	title: z.string(),
	totalCents: z.number(),
	orderers: z.array(
		z.object({
			name: z.string(),
			items: z.array(z.string()),
			totalCents: z.number(),
		}),
	),
})

export type OrderSummaryVideoProps = z.infer<typeof OrderSummaryVideoSchema>

export const defaultOrderSummaryVideoProps: OrderSummaryVideoProps = {
	title: 'Kimchi Train',
	totalCents: 4850,
	orderers: [
		{
			name: 'Maja',
			items: ['Kimchi Fried Rice', 'Bibimbap', 'Yuzu Soda'],
			totalCents: 1975,
		},
		{
			name: 'Ditto',
			items: ['Tteokbokki', 'Kimchi Fried Rice'],
			totalCents: 1700,
		},
		{
			name: 'Noah',
			items: ['Bibimbap', 'Tteokbokki'],
			totalCents: 1175,
		},
	],
}

export const calculateOrderSummaryMetadata: CalculateMetadataFunction<OrderSummaryVideoProps> = async ({ props }) => {
	const durationInFrames = getAnimationEndFrame(props.orderers.length)

	return {
		durationInFrames,
		defaultOutName: 'kimchitrain-summary',
	}
}

function getTrainWidth(ordererCount: number) {
	return LOCO_WIDTH + Math.max(ordererCount, 1) * CARRIAGE_WIDTH + Math.max(ordererCount - 1, 0) * CARRIAGE_GAP
}

function getTrainMotion(frame: number, width: number, ordererCount: number) {
	const trainWidth = getTrainWidth(ordererCount)
	const carriageBlockWidth = trainWidth - LOCO_WIDTH
	const locomotiveLeadInset = 28
	const startX = locomotiveLeadInset - carriageBlockWidth
	const endX = width + TRAIN_PADDING
	const lastCarriageLeftAtTrigger = width * 0.33 - CARRIAGE_WIDTH / 2
	const triggerFrame = Math.max(0, Math.ceil((lastCarriageLeftAtTrigger - startX) / TRAIN_SPEED))
	const triggerX = startX + triggerFrame * TRAIN_SPEED
	const exitFrames = Math.max(frame - triggerFrame, 0)
	const exitBoost = interpolate(frame, [triggerFrame, triggerFrame + 10], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	})

	const trainX =
		frame <= triggerFrame
			? startX + frame * TRAIN_SPEED
			: Math.min(endX, triggerX + exitFrames * TRAIN_SPEED * (1 + 4.8 * exitBoost))

	return { trainX }
}

function getAnimationEndFrame(ordererCount: number) {
	const trainWidth = getTrainWidth(ordererCount)
	const maxFrames = Math.max(90, Math.ceil((VIDEO_WIDTH + trainWidth + TRAIN_PADDING * 2) / TRAIN_SPEED))

	for (let frame = 1; frame <= maxFrames; frame++) {
		const { trainX } = getTrainMotion(frame, VIDEO_WIDTH, ordererCount)
		if (trainX >= VIDEO_WIDTH) {
			return frame + 1
		}
	}

	return maxFrames
}

function money(cents: number) {
	return new Intl.NumberFormat('de-DE', {
		style: 'currency',
		currency: 'EUR',
	}).format(cents / 100)
}

function getCarriageCopyScale(name: string, items: string[]) {
	const longestItem = items.reduce((max, item) => Math.max(max, item.length), 0)
	const loadFactor = Math.max(items.length - 3, 0) * 0.05 + Math.max(longestItem - 16, 0) * 0.008
	const scale = Math.max(0.84, 1 - loadFactor)

	return {
		nameSize: Math.max(28, Math.round((name.length > 12 ? 32 : 36) * scale)),
		itemSize: Math.max(16, Math.round(20 * scale)),
		totalSize: Math.max(23, Math.round(28 * scale)),
		gap: Math.max(10, Math.round(14 * scale)),
	}
}

function estimateWrappedLines(text: string, charsPerLine: number) {
	return Math.max(1, Math.ceil(text.length / charsPerLine))
}

function getCarriageHeight(name: string, items: string[]) {
	const copy = getCarriageCopyScale(name, items)
	const nameLines = estimateWrappedLines(name, 11)
	const nameHeight = Math.ceil(nameLines * copy.nameSize * 0.96)
	const itemHeights = items.reduce((sum, item) => {
		const itemLines = Math.min(3, estimateWrappedLines(item, 20))
		return sum + Math.max(40, Math.ceil(itemLines * copy.itemSize * 1.16) + 16)
	}, 0)
	const itemsGap = Math.max(items.length - 1, 0) * 8
	const contentHeight = 18 + nameHeight + copy.gap + itemHeights + itemsGap + 18

	return Math.max(250, 56 + contentHeight + 60)
}

function Wheel({ x, y, radius, frame }: { x: number; y: number; radius: number; frame: number }) {
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				width: radius * 2,
				height: radius * 2,
				borderRadius: '50%',
				background: COLORS.seaInk,
				boxShadow: 'inset 0 0 0 8px rgba(255,255,255,0.14)',
			}}
		>
			<div
				style={{
					position: 'absolute',
					left: '50%',
					top: '50%',
					width: radius * 0.78,
					height: 4,
					marginLeft: -(radius * 0.39),
					marginTop: -2,
					background: 'rgba(255,255,255,0.42)',
					transform: `rotate(${frame * 12}deg)`,
					transformOrigin: 'center center',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: '50%',
					top: '50%',
					width: 4,
					height: radius * 0.78,
					marginLeft: -2,
					marginTop: -(radius * 0.39),
					background: 'rgba(255,255,255,0.42)',
					transform: `rotate(${frame * 12}deg)`,
					transformOrigin: 'center center',
				}}
			/>
		</div>
	)
}

function Track({ frame }: { frame: number }) {
	return (
		<>
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					bottom: 0,
					height: 176,
					background:
						'linear-gradient(180deg, rgba(245,245,244,0) 0%, rgba(245,245,244,0.55) 34%, rgba(255,255,255,0.95) 100%)',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					bottom: 108,
					height: 6,
					background: COLORS.seaInk,
					opacity: 0.52,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					bottom: 70,
					height: 6,
					background: COLORS.seaInk,
					opacity: 0.52,
				}}
			/>
			{Array.from({ length: 18 }).map((_, index) => (
				<div
					key={index}
					style={{
						position: 'absolute',
						left: -30 + index * 78 + ((frame * 12) % 78),
						bottom: 78,
						width: 56,
						height: 20,
						borderRadius: 8,
						background: COLORS.seaInk,
						opacity: 0.24,
					}}
				/>
			))}
		</>
	)
}

function Locomotive({ frame }: { frame: number }) {
	const bob = Math.sin(frame / 8) * 2.5

	return (
		<div
			style={{
				position: 'relative',
				width: LOCO_WIDTH,
				height: 300,
				transform: `translateY(${bob}px) scaleX(-1)`,
			}}
		>
			<div
				style={{
					position: 'absolute',
					left: 28,
					top: 134,
					width: 154,
					height: 88,
					borderRadius: 24,
					background: COLORS.lagoon,
					boxShadow: '0 10px 24px rgba(220, 38, 38, 0.16)',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: 122,
					top: 100,
					width: 118,
					height: 122,
					borderRadius: '28px 32px 22px 22px',
					background: COLORS.surfaceStrong,
					border: `1px solid ${COLORS.line}`,
				}}
			>
				<div
					style={{
						position: 'absolute',
						left: 18,
						top: 18,
						width: 34,
						height: 34,
						borderRadius: 12,
						background: 'rgba(220, 38, 38, 0.14)',
					}}
				/>
			</div>
			<div
				style={{
					position: 'absolute',
					left: 196,
					top: 142,
					width: 62,
					height: 62,
					borderRadius: '50%',
					background: COLORS.palm,
					boxShadow: '0 0 0 10px rgba(217, 119, 6, 0.12)',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: 38,
					top: 88,
					width: 42,
					height: 74,
					borderRadius: 14,
					background: COLORS.seaInk,
					opacity: 0.18,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: 18,
					top: 216,
					width: 230,
					height: 20,
					borderRadius: 999,
					background: COLORS.seaInk,
					opacity: 0.88,
				}}
			/>
			<Wheel x={34} y={208} radius={30} frame={frame} />
			<Wheel x={146} y={208} radius={30} frame={frame} />
		</div>
	)
}

function Carriage({
	orderer,
	index,
	frame,
}: {
	orderer: OrderSummaryVideoProps['orderers'][number]
	index: number
	frame: number
}) {
	const bob = Math.sin(frame / 8 + index * 0.65) * 2
	const enter = spring({
		fps: FPS,
		frame: frame - index * 3,
		config: { damping: 200, stiffness: 160 },
		durationInFrames: 20,
	})
	const copy = getCarriageCopyScale(orderer.name, orderer.items)
	const carriageHeight = getCarriageHeight(orderer.name, orderer.items)
	const wheelY = carriageHeight - 70
	const axleY = carriageHeight - 62
	const bodyTop = 56
	const bodyBottomOffset = 60
	const bodyHeight = carriageHeight - bodyTop - bodyBottomOffset
	const couplerY = bodyTop + bodyHeight - 64

	return (
		<div
			style={{
				position: 'relative',
				width: CARRIAGE_WIDTH,
				height: carriageHeight,
				transform: `translateY(${bob + interpolate(enter, [0, 1], [14, 0])}px)`,
				opacity: enter,
			}}
		>
			<div
				style={{
					position: 'absolute',
					left: 16,
					right: 16,
					top: 0,
					display: 'flex',
					justifyContent: 'center',
					zIndex: 2,
				}}
			>
				<div
					style={{
						fontSize: copy.nameSize,
						lineHeight: 0.96,
						fontWeight: 700,
						letterSpacing: -1.5,
						color: COLORS.seaInk,
						wordBreak: 'break-word',
						textAlign: 'center',
					}}
				>
					{orderer.name}
				</div>
			</div>
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: bodyTop,
					bottom: bodyBottomOffset,
					borderRadius: 24,
					background: COLORS.surfaceStrong,
					border: `1px solid ${COLORS.line}`,
					boxShadow: '0 16px 30px rgba(28, 25, 23, 0.06)',
					overflow: 'hidden',
				}}
			>
				<div
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						top: 0,
						height: 6,
						background: index % 2 === 0 ? COLORS.lagoon : COLORS.palm,
					}}
				/>
				<div
					style={{
						position: 'absolute',
						left: 20,
						right: 20,
						top: 18,
						bottom: 18,
						display: 'flex',
						flexDirection: 'column',
						gap: copy.gap,
					}}
				>
					<div
						style={{
							fontSize: copy.totalSize,
							fontWeight: 700,
							letterSpacing: -0.8,
							color: COLORS.palm,
							textAlign: 'center',
						}}
					>
						{money(orderer.totalCents)}
					</div>

					<div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minHeight: 0 }}>
						{orderer.items.map((item, itemIndex) => (
							<div
								key={`${orderer.name}-${item}-${itemIndex}`}
								style={{
									display: 'flex',
									gap: 10,
									alignItems: 'flex-start',
									padding: '8px 10px',
									borderRadius: 14,
									background: COLORS.surface,
									border: `1px solid ${COLORS.line}`,
								}}
							>
								<div
									style={{
										width: 6,
										height: 6,
										marginTop: 8,
										borderRadius: '50%',
										background: index % 2 === 0 ? COLORS.lagoon : COLORS.palm,
										flexShrink: 0,
									}}
								/>
								<div
									style={{
										fontSize: copy.itemSize,
										lineHeight: 1.16,
										fontWeight: 500,
										color: COLORS.seaInk,
										overflow: 'hidden',
										display: '-webkit-box',
										WebkitLineClamp: 2,
										WebkitBoxOrient: 'vertical',
										wordBreak: 'break-word',
									}}
								>
									{item}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
			<div
				style={{
					position: 'absolute',
					left: -12,
					top: couplerY,
					width: 18,
					height: 10,
					borderRadius: 999,
					background: COLORS.seaInk,
					opacity: 0.2,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					right: -12,
					top: couplerY,
					width: 18,
					height: 10,
					borderRadius: 999,
					background: COLORS.seaInk,
					opacity: 0.2,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: 18,
					right: 18,
					top: axleY,
					height: 14,
					borderRadius: 999,
					background: COLORS.seaInk,
					opacity: 0.88,
				}}
			/>
			<Wheel x={28} y={wheelY} radius={24} frame={frame} />
			<Wheel x={154} y={wheelY} radius={24} frame={frame} />
		</div>
	)
}

function Background({ totalCents }: { totalCents: number }) {
	return (
		<>
			<div style={{ position: 'absolute', inset: 0, background: COLORS.foam }} />
			<div
				style={{
					position: 'absolute',
					inset: 0,
					backgroundImage: `radial-gradient(${COLORS.dot} 1px, transparent 1px)`,
					backgroundSize: '20px 20px',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: 40,
					right: 40,
					top: 34,
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					gap: 24,
				}}
			>
				<div>
					<div style={{ fontSize: 64, fontWeight: 800, color: COLORS.seaInk, letterSpacing: -2.4, lineHeight: 0.92 }}>
						Kimchi Train
					</div>
				</div>
				<div
					style={{
						position: 'relative',
						width: 192,
						height: 192,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					{Array.from({ length: 12 }).map((_, index) => {
						const angle = (360 / 12) * index
						return (
							<div
								key={angle}
								style={{
									position: 'absolute',
									left: '50%',
									top: '50%',
									width: 22,
									height: 54,
									marginLeft: -11,
									marginTop: -96,
									background: '#fbbf24',
									clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
									transform: `rotate(${angle}deg)`,
									transformOrigin: 'center 96px',
									opacity: 0.95,
								}}
							/>
						)
					})}
					<div
						style={{
							position: 'absolute',
							width: 148,
							height: 148,
							borderRadius: '50%',
							background: 'radial-gradient(circle at 35% 35%, #fef9c3 0%, #fde68a 26%, #fbbf24 62%, #f59e0b 100%)',
							boxShadow: '0 0 0 12px rgba(251, 191, 36, 0.18), 0 20px 40px rgba(217, 119, 6, 0.18)',
						}}
					/>
					<div
						style={{
							position: 'absolute',
							width: 116,
							height: 116,
							borderRadius: '50%',
							background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.32), rgba(255,255,255,0) 48%)',
						}}
					/>
					<div style={{ position: 'relative', textAlign: 'center', color: '#7c2d12', zIndex: 1 }}>
						<div
							style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.1, textTransform: 'uppercase', opacity: 0.8 }}
						>
							Total
						</div>
						<div style={{ fontSize: 34, fontWeight: 800, letterSpacing: -1.4, lineHeight: 0.95, marginTop: 4 }}>
							{money(totalCents)}
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export function OrderSummaryVideo(props: OrderSummaryVideoProps) {
	const frame = useCurrentFrame()
	const { width } = useVideoConfig()
	const { trainX } = getTrainMotion(frame, width, props.orderers.length)
	const carriageReveal = interpolate(frame, [0, 16], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	})

	return (
		<AbsoluteFill
			style={{
				fontFamily: 'Outfit, ui-sans-serif, system-ui, sans-serif',
				overflow: 'hidden',
				color: COLORS.seaInk,
			}}
		>
			<Background totalCents={props.totalCents} />
			<Track frame={frame} />

			<div
				style={{
					position: 'absolute',
					left: trainX,
					bottom: 78,
				}}
			>
				<div
					style={{
						display: 'flex',
						alignItems: 'flex-end',
						gap: CARRIAGE_GAP,
					}}
				>
					<div
						style={{
							display: 'flex',
							alignItems: 'flex-end',
							gap: CARRIAGE_GAP,
							opacity: carriageReveal,
							transform: `translateX(${interpolate(carriageReveal, [0, 1], [-28, 0])}px)`,
						}}
					>
						{[...props.orderers].reverse().map((orderer, index) => (
							<Carriage key={`${orderer.name}-${index}`} orderer={orderer} index={index} frame={frame} />
						))}
					</div>
					<Locomotive frame={frame} />
				</div>
			</div>
		</AbsoluteFill>
	)
}
