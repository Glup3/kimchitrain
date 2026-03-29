import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

import { AnalyticsSection } from '#/components/analytics/AnalyticsSection'

export const Route = createFileRoute('/analytics')({ component: AnalyticsPage })

function AnalyticsPage() {
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
				<AnalyticsSection />
			</div>
		</>
	)
}
