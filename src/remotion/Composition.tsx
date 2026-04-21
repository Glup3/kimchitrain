import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'

const COLORS = {
	bg: '#08111f',
	bgGlow: '#12355b',
	mint: '#7bf1a8',
	cyan: '#73d9ff',
	text: '#f5fbff',
	textMuted: 'rgba(245, 251, 255, 0.72)',
}

const StatPill = ({ label, value, delay }: { label: string; value: string; delay: number }) => {
	const frame = useCurrentFrame()
	const { fps } = useVideoConfig()

	const progress = spring({
		fps,
		frame: frame - delay,
		config: {
			damping: 200,
			stiffness: 140,
			mass: 0.8,
		},
	})

	const opacity = interpolate(progress, [0, 1], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	})
	const translateY = interpolate(progress, [0, 1], [32, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	})

	return (
		<div
			style={{
				padding: '18px 22px',
				borderRadius: 24,
				background: 'rgba(255, 255, 255, 0.08)',
				border: '1px solid rgba(255, 255, 255, 0.12)',
				backdropFilter: 'blur(18px)',
				boxShadow: '0 18px 50px rgba(0, 0, 0, 0.25)',
				opacity,
				transform: `translateY(${translateY}px)`,
			}}
		>
			<div style={{ fontSize: 16, color: COLORS.textMuted, marginBottom: 8 }}>{label}</div>
			<div style={{ fontSize: 34, fontWeight: 700, color: COLORS.text }}>{value}</div>
		</div>
	)
}

export const MyComposition = () => {
	const frame = useCurrentFrame()
	const { fps } = useVideoConfig()

	const intro = interpolate(frame, [0, 1.4 * fps], [0, 1], {
		easing: Easing.bezier(0.16, 1, 0.3, 1),
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	})
	const outro = interpolate(frame, [4.7 * fps, 6 * fps], [0, 1], {
		easing: Easing.in(Easing.cubic),
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	})
	const sceneProgress = intro - outro

	const titleOpacity = interpolate(sceneProgress, [0, 1], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	})
	const titleY = interpolate(sceneProgress, [0, 1], [60, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	})
	const cardX = interpolate(sceneProgress, [0, 1], [120, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	})
	const orbit = interpolate(frame, [0, 6 * fps], [0, 1], {
		easing: Easing.linear,
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	})
	const pulse = 1 + 0.06 * Math.sin((frame / fps) * Math.PI * 2)

	return (
		<AbsoluteFill
			style={{
				background: `radial-gradient(circle at 20% 20%, ${COLORS.bgGlow}, transparent 32%), radial-gradient(circle at 80% 25%, rgba(115, 217, 255, 0.16), transparent 28%), linear-gradient(135deg, ${COLORS.bg} 10%, #0d1d34 55%, #081726 100%)`,
				fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
				color: COLORS.text,
				overflow: 'hidden',
			}}
		>
			<div
				style={{
					position: 'absolute',
					inset: -120,
					background: `conic-gradient(from ${orbit * 360}deg, rgba(123, 241, 168, 0.16), rgba(115, 217, 255, 0.08), transparent 35%, rgba(123, 241, 168, 0.12))`,
					filter: 'blur(80px)',
					opacity: 0.9,
					transform: `scale(${pulse})`,
				}}
			/>

			<div
				style={{
					display: 'flex',
					height: '100%',
					padding: '72px 84px',
					gap: 48,
					alignItems: 'center',
					justifyContent: 'space-between',
				}}
			>
				<div
					style={{
						flex: 1.1,
						opacity: titleOpacity,
						transform: `translateY(${titleY}px)`,
					}}
				>
					<div
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							gap: 10,
							padding: '10px 16px',
							borderRadius: 999,
							background: 'rgba(123, 241, 168, 0.12)',
							border: '1px solid rgba(123, 241, 168, 0.28)',
							fontSize: 18,
							letterSpacing: 1.5,
							textTransform: 'uppercase',
							color: COLORS.mint,
							marginBottom: 28,
						}}
					>
						<div style={{ width: 10, height: 10, borderRadius: 999, background: COLORS.mint }} />
						Remotion Demo
					</div>

					<div style={{ fontSize: 82, lineHeight: 0.95, fontWeight: 800, letterSpacing: -3, maxWidth: 580 }}>
						Animate ideas into motion
					</div>
					<div style={{ fontSize: 30, lineHeight: 1.35, color: COLORS.textMuted, marginTop: 24, maxWidth: 620 }}>
						A minimal scene with frame-driven motion, layered gradients, and smooth entrance timing.
					</div>
				</div>

				<div
					style={{
						flex: 0.9,
						display: 'grid',
						gap: 18,
						transform: `translateX(${cardX}px)`,
					}}
				>
					<div
						style={{
							padding: 28,
							borderRadius: 34,
							background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06))',
							border: '1px solid rgba(255, 255, 255, 0.12)',
							boxShadow: '0 24px 80px rgba(0, 0, 0, 0.28)',
							backdropFilter: 'blur(24px)',
						}}
					>
						<div style={{ fontSize: 22, color: COLORS.textMuted, marginBottom: 22 }}>Live motion preview</div>
						<div
							style={{
								height: 220,
								borderRadius: 28,
								background: 'rgba(8, 17, 31, 0.8)',
								position: 'relative',
								overflow: 'hidden',
							}}
						>
							<div
								style={{
									position: 'absolute',
									left: `${12 + orbit * 60}%`,
									top: 36,
									width: 110,
									height: 110,
									borderRadius: 999,
									background: `radial-gradient(circle at 30% 30%, #ffffff, ${COLORS.cyan} 38%, #2158ff 100%)`,
									boxShadow: '0 18px 50px rgba(115, 217, 255, 0.45)',
									transform: `translateX(-50%) scale(${pulse})`,
								}}
							/>
							<div
								style={{
									position: 'absolute',
									left: 30,
									right: 30,
									bottom: 32,
									height: 10,
									borderRadius: 999,
									background: 'rgba(255, 255, 255, 0.1)',
								}}
							>
								<div
									style={{
										height: '100%',
										width: `${22 + orbit * 58}%`,
										borderRadius: 999,
										background: `linear-gradient(90deg, ${COLORS.mint}, ${COLORS.cyan})`,
										boxShadow: '0 0 30px rgba(123, 241, 168, 0.35)',
									}}
								/>
							</div>
						</div>
					</div>

					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
						<StatPill label="Duration" value="6 sec" delay={22} />
						<StatPill label="Frame rate" value="30 fps" delay={28} />
					</div>
				</div>
			</div>
		</AbsoluteFill>
	)
}
