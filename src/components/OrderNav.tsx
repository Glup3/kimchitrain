import { Link } from '@tanstack/react-router'
import { Check, CheckCircle2, Circle, HelpCircle, Link2, User } from 'lucide-react'
import type { RefObject } from 'react'

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
	nameRequired: boolean
	nameInputRef: RefObject<HTMLInputElement | null>
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
	nameRequired,
	nameInputRef,
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
					<div data-tour="name-input" className="flex flex-1 flex-col gap-1 lg:flex-initial">
						<div
							className={cn(
								'flex items-center gap-1.5 rounded-md transition-[box-shadow,border-color,background-color]',
								nameRequired && 'bg-red-500/5 ring-2 ring-red-500/20',
							)}
						>
							<User size={14} className={cn('text-(--sea-ink-soft)', nameRequired && 'text-red-600')} />
							<input
								ref={nameInputRef}
								type="text"
								value={defaultName}
								onChange={(e) => onNameChange(e.target.value)}
								placeholder="Your name"
								aria-invalid={nameRequired}
								className={cn(
									'w-full border-b bg-transparent py-1 text-sm text-(--sea-ink) outline-none placeholder:text-(--sea-ink-soft) placeholder:opacity-50 focus:border-(--lagoon) lg:w-28',
									nameRequired
										? 'border-red-500 text-red-700 placeholder:text-red-400 focus:border-red-500'
										: 'border-(--line)',
								)}
							/>
						</div>
						{nameRequired && <p className="text-xs font-medium text-red-600">Enter your name</p>}
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
						<span className="hidden lg:inline">{isCompleted ? 'Completed' : 'Order'}</span>
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
