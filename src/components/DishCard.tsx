import { Flame, Plus } from 'lucide-react'

import type { Dish } from '#/db/zero-schema'
import { cn } from '#/lib/utils'

interface DishCardProps {
	dish: Dish
	onAdd: () => void
	disabled?: boolean
}

export function DishCard({ dish, onAdd, disabled }: DishCardProps) {
	return (
		<div className="py-4">
			<div className="flex items-center justify-between gap-4">
				<div className="flex min-w-0 items-center gap-2">
					<h3 className="truncate text-base leading-tight font-semibold text-[var(--sea-ink)]">{dish.name}</h3>
					{dish.isPopular && <Flame size={14} className="shrink-0 text-orange-500" />}
					<span className="shrink-0 text-sm font-medium text-[var(--palm)] tabular-nums">
						€{(dish.priceCents / 100).toFixed(2)}
					</span>
				</div>
				<button
					type="button"
					onClick={onAdd}
					disabled={disabled}
					className={cn(
						'shrink-0 w-8 h-8 rounded-full text-white flex items-center justify-center border-0 cursor-pointer transition-transform hover:scale-110 hover:shadow-[0_4px_14px_rgba(220,38,38,0.3)] active:scale-95',
						disabled ? 'bg-[var(--line)] cursor-not-allowed opacity-40' : 'bg-[var(--lagoon)] cursor-pointer',
					)}
				>
					<Plus size={16} strokeWidth={2.5} />
				</button>
			</div>
			<p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[var(--sea-ink-soft)]">{dish.description}</p>
		</div>
	)
}
