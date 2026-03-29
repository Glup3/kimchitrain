import { Flame } from 'lucide-react'

import { DishCard } from '#/components/DishCard'
import type { Dish } from '#/db/zero-schema'

interface DishWithGroup extends Dish {
	group: { readonly id: number; readonly name: string } | undefined
}

interface DishMenuProps {
	dishes: readonly DishWithGroup[]
	disabled: boolean
	onAddDish: (dishId: number, priceCents: number) => void
}

export function DishMenu({ dishes, disabled, onAddDish }: DishMenuProps) {
	const grouped = dishes.reduce<Map<number, readonly DishWithGroup[]>>((acc, d) => {
		const list = acc.get(d.groupId) ?? []
		acc.set(d.groupId, [...list, d])
		return acc
	}, new Map())

	return (
		<section className="min-w-0 flex-1 self-start">
			<div className="mb-4 flex items-center gap-1.5 text-xs text-(--sea-ink-soft)">
				<Flame size={13} className="text-orange-500" />
				<span>Popular</span>
			</div>
			{[...grouped.entries()].map(([groupId, groupDishes]) => (
				<div key={groupId} className="mb-6" data-tour={`dish-menu-${groupId}`}>
					<h2 className="mb-2 text-[0.69rem] font-bold tracking-[0.16em] text-(--kicker) uppercase">
						{groupDishes[0]?.group?.name ?? 'Other'}
					</h2>
					<div className="divide-y divide-(--line)">
						{groupDishes.map((dish) => (
							<DishCard
								key={dish.id}
								dish={dish}
								disabled={disabled}
								onAdd={() => onAddDish(dish.id, dish.priceCents)}
							/>
						))}
					</div>
				</div>
			))}
		</section>
	)
}
