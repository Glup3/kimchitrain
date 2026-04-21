import {
	AbsoluteFill,
	Easing,
	interpolate,
	type CalculateMetadataFunction,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion'
import { z } from 'zod'

export const OrderSummaryVideoSchema = z.object({
	title: z.string(),
	order: z.object({
		id: z.string(),
		createdAtLabel: z.string(),
		totalCents: z.number(),
		outstandingCents: z.number(),
		completed: z.boolean(),
		itemCount: z.number(),
		groupedItems: z.array(
			z.object({
				name: z.string(),
				qty: z.number(),
				lineTotal: z.number(),
				orderers: z.array(z.string()),
			}),
		),
		people: z.array(
			z.object({
				name: z.string(),
				totalCents: z.number(),
				settledCents: z.number(),
				itemCount: z.number(),
			}),
		),
	}),
	animation: z.object({
		introFrames: z.number(),
		itemStaggerFrames: z.number(),
		personStaggerFrames: z.number(),
		highlightPerson: z.string().optional(),
		showSettled: z.boolean(),
	}),
	theme: z.object({
		background: z.string(),
		surface: z.string(),
		accent: z.string(),
		accentSecondary: z.string(),
		foreground: z.string(),
		muted: z.string(),
	}),
})

export type OrderSummaryVideoProps = z.infer<typeof OrderSummaryVideoSchema>

export const defaultOrderSummaryVideoProps: OrderSummaryVideoProps = {
	title: 'Order summary',
	order: {
		id: 'demo-order',
		createdAtLabel: 'Today, 19:30',
		totalCents: 4850,
		outstandingCents: 1275,
		completed: true,
		itemCount: 6,
		groupedItems: [
			{ name: 'Kimchi Fried Rice', qty: 2, lineTotal: 2500, orderers: ['Ditto', 'Maja'] },
			{ name: 'Bibimbap', qty: 2, lineTotal: 1450, orderers: ['Noah', 'Maja'] },
			{ name: 'Tteokbokki', qty: 2, lineTotal: 900, orderers: ['Ditto', 'Noah'] },
		],
		people: [
			{ name: 'Ditto', totalCents: 1700, settledCents: 1700, itemCount: 2 },
			{ name: 'Maja', totalCents: 1975, settledCents: 700, itemCount: 2 },
			{ name: 'Noah', totalCents: 1175, settledCents: 1175, itemCount: 2 },
		],
	},
	animation: {
		introFrames: 24,
		itemStaggerFrames: 6,
		personStaggerFrames: 8,
		highlightPerson: 'Maja',
		showSettled: true,
	},
	theme: {
		background: '#07131f',
		surface: 'rgba(11, 24, 38, 0.76)',
		accent: '#4fb8b2',
		accentSecondary: '#7bf1a8',
		foreground: '#f4fbff',
		muted: 'rgba(244, 251, 255, 0.65)',
	},
}

export const calculateOrderSummaryMetadata: CalculateMetadataFunction<OrderSummaryVideoProps> = async ({ props }) => {
	const durationInFrames = Math.max(
		180,
		props.animation.introFrames + props.order.groupedItems.length * props.animation.itemStaggerFrames + 90,
		props.animation.introFrames + props.order.people.length * props.animation.personStaggerFrames + 110,
	)

	return {
		durationInFrames,
		defaultOutName: `${props.order.id}-summary`,
	}
}

function money(cents: number) {
	return `€${(cents / 100).toFixed(2)}`
}

function clampProgress(frame: number, start: number, end: number, easing = Easing.bezier(0.16, 1, 0.3, 1)) {
	return interpolate(frame, [start, end], [0, 1], {
		easing,
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	})
}

function ItemCard({
	index,
	item,
	accent,
	muted,
	foreground,
	stagger,
	introFrames,
}: {
	index: number
	item: OrderSummaryVideoProps['order']['groupedItems'][number]
	accent: string
	muted: string
	foreground: string
	stagger: number
	introFrames: number
}) {
	const frame = useCurrentFrame()
	const start = introFrames + index * stagger
	const enter = clampProgress(frame, start, start + 14)
	const opacity = interpolate(enter, [0, 1], [0, 1])
	const translateY = interpolate(enter, [0, 1], [28, 0])

	return (
		<div
			style={{
				padding: '18px 20px',
				borderRadius: 22,
				background: 'rgba(255,255,255,0.06)',
				border: '1px solid rgba(255,255,255,0.08)',
				opacity,
				transform: `translateY(${translateY}px)`,
			}}
		>
			<div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
				<div style={{ display: 'flex', gap: 14, alignItems: 'baseline', minWidth: 0 }}>
					<div style={{ fontSize: 24, fontWeight: 800, color: accent, minWidth: 34 }}>{item.qty}x</div>
					<div style={{ minWidth: 0 }}>
						<div
							style={{
								fontSize: 24,
								fontWeight: 700,
								color: foreground,
								whiteSpace: 'nowrap',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
							}}
						>
							{item.name}
						</div>
						<div style={{ fontSize: 15, color: muted, marginTop: 6 }}>{item.orderers.join(' • ')}</div>
					</div>
				</div>
				<div style={{ fontSize: 24, fontWeight: 700, color: foreground }}>{money(item.lineTotal)}</div>
			</div>
		</div>
	)
}

function PersonCard({
	index,
	person,
	highlightPerson,
	showSettled,
	accent,
	accentSecondary,
	foreground,
	muted,
	stagger,
	introFrames,
}: {
	index: number
	person: OrderSummaryVideoProps['order']['people'][number]
	highlightPerson?: string
	showSettled: boolean
	accent: string
	accentSecondary: string
	foreground: string
	muted: string
	stagger: number
	introFrames: number
}) {
	const frame = useCurrentFrame()
	const start = introFrames + 18 + index * stagger
	const enter = clampProgress(frame, start, start + 14)
	const highlighted = highlightPerson?.trim().toLowerCase() === person.name.trim().toLowerCase()
	const unsettledCents = person.totalCents - person.settledCents

	return (
		<div
			style={{
				padding: '16px 18px',
				borderRadius: 20,
				background: highlighted
					? `linear-gradient(135deg, ${accent}22, ${accentSecondary}16)`
					: 'rgba(255,255,255,0.05)',
				border: highlighted ? `1px solid ${accent}66` : '1px solid rgba(255,255,255,0.08)',
				opacity: enter,
				transform: `translateY(${interpolate(enter, [0, 1], [24, 0])}px)`,
			}}
		>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
				<div>
					<div style={{ fontSize: 22, fontWeight: 700, color: foreground }}>{person.name}</div>
					<div style={{ fontSize: 14, color: muted, marginTop: 4 }}>{person.itemCount} items</div>
				</div>
				<div style={{ textAlign: 'right' }}>
					<div style={{ fontSize: 22, fontWeight: 700, color: foreground }}>{money(person.totalCents)}</div>
					{showSettled && (
						<div style={{ fontSize: 14, color: unsettledCents === 0 ? accentSecondary : muted, marginTop: 4 }}>
							{unsettledCents === 0 ? 'Settled' : `${money(unsettledCents)} open`}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export function OrderSummaryVideo(props: OrderSummaryVideoProps) {
	const frame = useCurrentFrame()
	const { durationInFrames } = useVideoConfig()
	const intro = clampProgress(frame, 0, props.animation.introFrames)
	const outro = clampProgress(frame, durationInFrames - 18, durationInFrames)
	const scene = intro - outro
	const heroY = interpolate(scene, [0, 1], [36, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
	const heroOpacity = interpolate(scene, [0, 1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
	const glow = 1 + 0.04 * Math.sin(frame / 14)
	const settledPeople = props.order.people.filter((person) => person.totalCents === person.settledCents).length

	return (
		<AbsoluteFill
			style={{
				background: `radial-gradient(circle at 20% 10%, ${props.theme.accent}20, transparent 26%), radial-gradient(circle at 85% 18%, ${props.theme.accentSecondary}18, transparent 28%), ${props.theme.background}`,
				fontFamily: 'Outfit, ui-sans-serif, system-ui, sans-serif',
				color: props.theme.foreground,
			}}
		>
			<div
				style={{
					position: 'absolute',
					inset: -120,
					background: `conic-gradient(from ${frame * 1.8}deg, ${props.theme.accent}20, transparent 30%, ${props.theme.accentSecondary}16)`,
					filter: 'blur(90px)',
					transform: `scale(${glow})`,
					opacity: 0.9,
				}}
			/>
			<div style={{ padding: '66px 72px', display: 'flex', flexDirection: 'column', height: '100%' }}>
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						gap: 40,
						opacity: heroOpacity,
						transform: `translateY(${heroY}px)`,
					}}
				>
					<div style={{ flex: 1 }}>
						<div
							style={{
								display: 'inline-flex',
								gap: 10,
								alignItems: 'center',
								padding: '10px 16px',
								borderRadius: 999,
								background: `${props.theme.accent}18`,
								border: `1px solid ${props.theme.accent}55`,
								fontSize: 16,
								letterSpacing: 1.4,
								textTransform: 'uppercase',
								color: props.theme.accentSecondary,
							}}
						>
							<div style={{ width: 8, height: 8, borderRadius: 999, background: props.theme.accentSecondary }} />
							Kimchi Train
						</div>
						<div
							style={{
								fontFamily: 'Syne, Outfit, sans-serif',
								fontSize: 68,
								lineHeight: 0.95,
								fontWeight: 800,
								marginTop: 22,
								letterSpacing: -2.5,
							}}
						>
							{props.title}
						</div>
						<div style={{ marginTop: 18, fontSize: 22, color: props.theme.muted }}>
							{props.order.createdAtLabel} · {props.order.itemCount} items
						</div>
					</div>
					<div
						style={{
							width: 350,
							padding: 26,
							borderRadius: 30,
							background: props.theme.surface,
							border: '1px solid rgba(255,255,255,0.08)',
							boxShadow: '0 20px 70px rgba(0,0,0,0.3)',
							backdropFilter: 'blur(20px)',
						}}
					>
						<div style={{ color: props.theme.muted, fontSize: 15, textTransform: 'uppercase', letterSpacing: 1.2 }}>
							Total
						</div>
						<div style={{ fontSize: 56, fontWeight: 800, marginTop: 10 }}>{money(props.order.totalCents)}</div>
						<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 18 }}>
							<div style={{ padding: '14px 16px', borderRadius: 18, background: 'rgba(255,255,255,0.05)' }}>
								<div style={{ fontSize: 13, color: props.theme.muted }}>People</div>
								<div style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>{props.order.people.length}</div>
							</div>
							<div style={{ padding: '14px 16px', borderRadius: 18, background: 'rgba(255,255,255,0.05)' }}>
								<div style={{ fontSize: 13, color: props.theme.muted }}>Settled</div>
								<div style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>{settledPeople}</div>
							</div>
						</div>
						{props.animation.showSettled && (
							<div
								style={{
									marginTop: 16,
									color: props.order.outstandingCents === 0 ? props.theme.accentSecondary : props.theme.muted,
									fontSize: 16,
								}}
							>
								{props.order.outstandingCents === 0
									? 'All settled up'
									: `${money(props.order.outstandingCents)} still open`}
							</div>
						)}
					</div>
				</div>

				<div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.88fr', gap: 26, marginTop: 34, flex: 1 }}>
					<div
						style={{
							background: props.theme.surface,
							borderRadius: 34,
							padding: 28,
							border: '1px solid rgba(255,255,255,0.08)',
							display: 'flex',
							flexDirection: 'column',
							gap: 14,
						}}
					>
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
							<div style={{ fontSize: 28, fontWeight: 700 }}>Items ordered</div>
							<div style={{ color: props.theme.muted, fontSize: 16 }}>{props.order.id}</div>
						</div>
						{props.order.groupedItems.map((item, index) => (
							<ItemCard
								key={`${item.name}-${index}`}
								index={index}
								item={item}
								accent={props.theme.accent}
								muted={props.theme.muted}
								foreground={props.theme.foreground}
								stagger={props.animation.itemStaggerFrames}
								introFrames={props.animation.introFrames}
							/>
						))}
					</div>
					<div
						style={{
							background: props.theme.surface,
							borderRadius: 34,
							padding: 28,
							border: '1px solid rgba(255,255,255,0.08)',
							display: 'flex',
							flexDirection: 'column',
							gap: 12,
						}}
					>
						<div style={{ fontSize: 28, fontWeight: 700 }}>Per person</div>
						{props.order.people.map((person, index) => (
							<PersonCard
								key={person.name}
								index={index}
								person={person}
								highlightPerson={props.animation.highlightPerson}
								showSettled={props.animation.showSettled}
								accent={props.theme.accent}
								accentSecondary={props.theme.accentSecondary}
								foreground={props.theme.foreground}
								muted={props.theme.muted}
								stagger={props.animation.personStaggerFrames}
								introFrames={props.animation.introFrames}
							/>
						))}
					</div>
				</div>
			</div>
		</AbsoluteFill>
	)
}
