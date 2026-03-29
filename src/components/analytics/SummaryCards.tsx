import { CheckCircle2, Coins, Receipt, TrendingUp } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface SummaryCardsProps {
	totalOrders: number
	totalRevenueCents: number
	avgOrderCents: number
	completionRate: number
}

const CARDS: { label: string; icon: LucideIcon; accent: string }[] = [
	{ label: 'Total Orders', icon: Receipt, accent: 'var(--lagoon)' },
	{ label: 'Revenue', icon: Coins, accent: 'var(--palm)' },
	{ label: 'Avg. Order', icon: TrendingUp, accent: 'var(--lagoon-deep)' },
	{ label: 'Completed', icon: CheckCircle2, accent: 'var(--palm)' },
]

export function SummaryCards({ totalOrders, totalRevenueCents, avgOrderCents, completionRate }: SummaryCardsProps) {
	const values = [
		totalOrders.toLocaleString(),
		`€${(totalRevenueCents / 100).toFixed(2)}`,
		`€${(avgOrderCents / 100).toFixed(2)}`,
		`${Math.round(completionRate)}%`,
	]

	return (
		<div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
			{CARDS.map((card, i) => {
				const Icon = card.icon
				return (
					<div
						key={card.label}
						className="group animate-[rise-in_700ms_cubic-bezier(0.16,1,0.3,1)_both] overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-[4px] transition-transform duration-200 hover:-translate-y-0.5"
						style={{ animationDelay: `${i * 80}ms` }}
					>
						<div
							className="h-[3px] opacity-75 transition-opacity duration-200 group-hover:opacity-100"
							style={{ backgroundColor: card.accent }}
						/>
						<div className="p-4 sm:p-5">
							<div className="mb-3 flex items-center gap-2.5">
								<div
									className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
									style={{ backgroundColor: `color-mix(in srgb, ${card.accent} 12%, transparent)` }}
								>
									<Icon size={14} strokeWidth={2.5} style={{ color: card.accent }} />
								</div>
								<span className="text-[0.62rem] font-bold tracking-[0.16em] text-[var(--kicker)] uppercase">
									{card.label}
								</span>
							</div>
							<div
								className="font-['Syne',sans-serif] text-2xl font-bold tabular-nums sm:text-3xl"
								style={{ color: card.accent }}
							>
								{values[i]}
							</div>
						</div>
					</div>
				)
			})}
		</div>
	)
}
