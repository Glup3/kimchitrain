import { forwardRef, useMemo } from 'react'
import { createPortal } from 'react-dom'

import type { EnrichedOrderItem } from '#/components/OrderSummary'

interface OrderShareCardProps {
	items: readonly EnrichedOrderItem[]
	createdAt: number | null
}

export const OrderShareCard = forwardRef<HTMLDivElement, OrderShareCardProps>(function OrderShareCard(
	{ items, createdAt },
	ref,
) {
	const grouped = useMemo(() => {
		const map = new Map<string, { name: string; qty: number; lineTotal: number }>()
		for (const item of items) {
			const name = item.dish?.name ?? 'Unknown'
			const entry = map.get(name) ?? { name, qty: 0, lineTotal: 0 }
			entry.qty += 1
			entry.lineTotal += item.priceCents
			map.set(name, entry)
		}
		return [...map.values()]
	}, [items])

	const perPerson = useMemo(() => {
		const map = new Map<string, number>()
		for (const item of items) {
			const name = item.orderer.trim() || 'Unassigned'
			map.set(name, (map.get(name) ?? 0) + item.priceCents)
		}
		return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
	}, [items])

	const totalCents = items.reduce((sum, item) => sum + item.priceCents, 0)

	const dateStr =
		createdAt != null
			? new Date(createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
			: ''

	return createPortal(
		<div
			ref={ref}
			style={{
				width: 400,
				padding: 28,
				backgroundColor: '#faf9f7',
				borderRadius: 16,
				fontFamily: "'Outfit', system-ui, sans-serif",
				color: '#1c1917',
				position: 'fixed',
				left: -9999,
				top: 0,
				zIndex: -1,
			}}
		>
			<div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
				<div
					style={{
						width: 36,
						height: 36,
						borderRadius: 10,
						backgroundColor: '#dc2626',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						color: '#fff',
						fontSize: 18,
						fontWeight: 700,
					}}
				>
					K
				</div>
				<div>
					<div
						style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.3, fontFamily: "'Syne', 'Outfit', sans-serif" }}
					>
						Kimchi Train
					</div>
					{dateStr && <div style={{ fontSize: 12, color: '#78716c' }}>{dateStr}</div>}
				</div>
			</div>

			<div style={{ borderTop: '1px solid rgba(28,25,23,0.08)', paddingTop: 16 }}>
				{grouped.map((g) => (
					<div
						key={g.name}
						style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}
					>
						<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
							<span style={{ fontSize: 15, fontWeight: 700, color: '#dc2626', width: 28, textAlign: 'center' }}>
								{g.qty}x
							</span>
							<span style={{ fontSize: 14, fontWeight: 600 }}>{g.name}</span>
						</div>
						<span style={{ fontSize: 14, color: '#d97706', fontVariantNumeric: 'tabular-nums' }}>
							€{(g.lineTotal / 100).toFixed(2)}
						</span>
					</div>
				))}
			</div>

			{perPerson.length >= 2 && (
				<div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px dashed rgba(28,25,23,0.08)' }}>
					<div
						style={{
							fontSize: 10,
							fontWeight: 700,
							textTransform: 'uppercase',
							letterSpacing: 0.5,
							color: '#78716c',
							marginBottom: 8,
						}}
					>
						Per person
					</div>
					{perPerson.map(([name, cents]) => (
						<div key={name} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
							<span style={{ fontSize: 13, color: '#1c1917' }}>{name}</span>
							<span style={{ fontSize: 13, fontWeight: 600, color: '#d97706', fontVariantNumeric: 'tabular-nums' }}>
								€{(cents / 100).toFixed(2)}
							</span>
						</div>
					))}
				</div>
			)}

			<div
				style={{
					marginTop: 16,
					paddingTop: 12,
					borderTop: '2px solid #dc2626',
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
				}}
			>
				<span style={{ fontSize: 14, fontWeight: 700 }}>Total</span>
				<span style={{ fontSize: 18, fontWeight: 800, color: '#d97706', fontVariantNumeric: 'tabular-nums' }}>
					€{(totalCents / 100).toFixed(2)}
				</span>
			</div>
		</div>,
		document.body,
	)
})
