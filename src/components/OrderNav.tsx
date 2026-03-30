import { Link } from '@tanstack/react-router'
import { Check, CheckCircle2, Circle, HelpCircle, Link2, User } from 'lucide-react'

import { formatOrderDate } from '#/lib/format'
import { cn } from '#/lib/utils'

interface OrderNavProps {
	orderId: string
	createdAt: number | null
	isCompleted: boolean
	copied: boolean
	onToggleCompleted: () => void
	onCopyLink: () => void
	onRestartTour: () => void
	defaultName: string
	onNameChange: (name: string) => void
}

export function OrderNav({
	orderId,
	createdAt,
	isCompleted,
	copied,
	onToggleCompleted,
	onCopyLink,
	onRestartTour,
	defaultName,
	onNameChange,
}: OrderNavProps) {
	return (
		<nav className="sticky top-0 z-40 border-b border-(--line) bg-(--surface-strong) backdrop-blur-md">
			<div className="mx-auto flex w-[min(1080px,calc(100%-2rem))] flex-col gap-2 py-2 lg:h-14 lg:flex-row lg:items-center lg:gap-3 lg:py-0">
				<div className="flex items-center gap-3">
					<Link
						to="/"
						className="flex items-center gap-1.5 text-sm text-(--sea-ink-soft) no-underline hover:text-(--sea-ink)"
					>
						Back to orders
					</Link>
					<span className="text-(--line)">/</span>
					<span className="text-sm font-medium text-(--sea-ink)">Order {orderId.slice(-8)}</span>
					{createdAt != null && (
						<span className="text-xs text-(--sea-ink-soft) opacity-60">{formatOrderDate(createdAt)}</span>
					)}
				</div>
				<div className="flex items-center gap-1.5 lg:ml-auto">
					<div data-tour="name-input" className="flex flex-1 items-center gap-1.5 lg:flex-initial">
						<User size={14} className="text-(--sea-ink-soft)" />
						<input
							type="text"
							value={defaultName}
							onChange={(e) => onNameChange(e.target.value)}
							placeholder="Your name"
							className="w-full border-b border-(--line) bg-transparent py-1 text-sm text-(--sea-ink) outline-none placeholder:text-(--sea-ink-soft) placeholder:opacity-50 focus:border-(--lagoon) lg:w-28"
						/>
					</div>
					<button
						type="button"
						onClick={onToggleCompleted}
						data-tour="complete-btn"
						className={cn(
							'flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer',
							isCompleted
								? 'border-(--lagoon) bg-(--lagoon)/10 text-(--lagoon) hover:bg-(--lagoon)/20'
								: 'border-(--line) bg-transparent text-(--sea-ink-soft) hover:text-(--sea-ink) hover:border-(--sea-ink-soft)',
						)}
					>
						{isCompleted ? <CheckCircle2 size={13} /> : <Circle size={13} />}
						<span className="hidden lg:inline">{isCompleted ? 'Completed' : 'Complete'}</span>
					</button>
					<button
						type="button"
						onClick={onCopyLink}
						data-tour="share-btn"
						className="flex cursor-pointer items-center gap-1.5 rounded-md border border-(--line) bg-transparent px-2.5 py-1.5 text-xs font-medium text-(--sea-ink-soft) transition-colors hover:border-(--sea-ink-soft) hover:text-(--sea-ink)"
					>
						{copied ? <Check size={13} /> : <Link2 size={13} />}
						<span className="hidden lg:inline">{copied ? 'Copied!' : 'Share'}</span>
					</button>
					<button
						type="button"
						onClick={onRestartTour}
						className="flex cursor-pointer items-center justify-center rounded-md text-(--sea-ink-soft) transition-colors hover:text-(--sea-ink)"
						title="Restart tour"
					>
						<HelpCircle size={16} />
					</button>
				</div>
			</div>
		</nav>
	)
}
