import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

import { AnalyticsSection } from '#/components/analytics/AnalyticsSection'
import { InflationSection } from '#/components/analytics/InflationSection'

export const Route = createFileRoute('/analytics')({
	validateSearch: (search: Record<string, unknown>): { tab?: 'inflation' } => ({
		tab: search.tab === 'inflation' ? 'inflation' : undefined,
	}),
	component: AnalyticsPage,
})

function AnalyticsPage() {
	const { tab } = Route.useSearch()
	return (
		<>
			<nav className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--surface-strong)] backdrop-blur-md">
				<div className="mx-auto flex h-14 w-[min(1080px,calc(100%-2rem))] items-center justify-between">
					<Link
						to="/"
						className="flex items-center gap-2 text-sm font-medium text-[var(--sea-ink)] no-underline hover:text-[var(--lagoon)]"
					>
						<ArrowLeft size={16} />
						Back to Orders
					</Link>
					<h1 className="font-['Syne',sans-serif] text-lg font-bold tracking-tight text-[var(--sea-ink)]">Analytics</h1>
				</div>
			</nav>

			<div className="mx-auto w-[min(1080px,calc(100%-2rem))] py-8">
				<nav aria-label="Analytics views" className="mb-6 flex gap-2 border-b border-[var(--line)] pb-3">
					{(['orders', 'inflation'] as const).map((view) => (
						<Link
							key={view}
							to="/analytics"
							search={{ tab: view === 'inflation' ? 'inflation' : undefined }}
							aria-current={(tab ?? 'orders') === view ? 'page' : undefined}
							className={`rounded-lg px-4 py-2 text-sm font-semibold no-underline ${(tab ?? 'orders') === view ? 'bg-[var(--lagoon)] text-white' : 'text-[var(--sea-ink-soft)] hover:bg-[var(--lagoon-glow)]'}`}
						>
							{view === 'orders' ? 'Orders' : 'Inflation'}
						</Link>
					))}
				</nav>
				{tab === 'inflation' ? <InflationSection /> : <AnalyticsSection />}
			</div>
		</>
	)
}
