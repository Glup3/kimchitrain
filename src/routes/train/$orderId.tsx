import { useQuery, useZero } from '@rocicorp/zero/react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Check, CheckCircle2, ChevronUp, Circle, Flame, HelpCircle, Link2, User } from 'lucide-react'
import { useCallback, useState } from 'react'

import { DishCard } from '#/components/DishCard'
import { OrderSummary } from '#/components/OrderSummary'
import { useOrderTour } from '#/hooks/useOrderTour'
import { formatOrderDate } from '#/lib/format'
import { mutators } from '#/lib/mutators'
import { queries } from '#/lib/queries'
import { cn } from '#/lib/utils'

const NAME_KEY = 'kimchi-train:name'

function getDefaultName(): string {
	try {
		return localStorage.getItem(NAME_KEY) ?? ''
	} catch {
		return ''
	}
}

export const Route = createFileRoute('/train/$orderId')({
	component: OrderPage,
})

function OrderPage() {
	const { orderId } = Route.useParams()
	const zero = useZero()
	const [dishesWithGroup] = useQuery(queries.dishes.withGroup())
	const [orderRows, orderResult] = useQuery(queries.orders.byIdWithItemsAndDishes(orderId))
	const [mobileSheetOpen, setMobileSheetOpen] = useState(false)
	const [defaultName, setDefaultName] = useState(getDefaultName)
	const [copied, setCopied] = useState(false)

	const { Tour, restartTour } = useOrderTour()

	const handleCopyLink = useCallback(() => {
		navigator.clipboard.writeText(window.location.href).then(() => {
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		})
	}, [])

	function handleRestartTour() {
		restartTour()
	}

	function handleToggleCompleted() {
		if (!order) return
		zero.mutate(
			mutators.orders.setCompleted({
				id: orderId,
				completed: !order.completed,
			}),
		)
	}

	function saveDefaultName(name: string) {
		setDefaultName(name)
		try {
			localStorage.setItem(NAME_KEY, name)
		} catch {}
	}

	const grouped = dishesWithGroup.reduce<Map<number, typeof dishesWithGroup>>((acc, d) => {
		const list = acc.get(d.groupId) ?? []
		list.push(d)
		acc.set(d.groupId, list)
		return acc
	}, new Map())

	const order = orderRows[0]
	const isCompleted = order?.completed ?? false
	const currentOrderItems = order?.items ?? []
	const totalCents = currentOrderItems.reduce((sum, item) => sum + item.priceCents, 0)

	function handleAddDish(dishId: number, priceCents: number) {
		zero.mutate(
			mutators.orderItems.add({
				dishId,
				orderId,
				priceCents,
				orderer: defaultName,
			}),
		)
	}

	function handleRemoveItem(id: string) {
		zero.mutate(mutators.orderItems.remove({ id }))
	}

	function handleUpdateOrderer(id: string, orderer: string) {
		zero.mutate(mutators.orderItems.updateOrderer({ id, orderer }))
	}

	const summaryProps = {
		items: currentOrderItems,
		onRemoveItem: handleRemoveItem,
		onUpdateOrderer: handleUpdateOrderer,
		readOnly: isCompleted,
	}

	if (!order) {
		if (orderResult.type !== 'complete') return null
		return (
			<div className="mx-auto w-[min(1080px,calc(100%-2rem))] py-8">
				<Link to="/" className="flex items-center gap-1.5 text-sm text-(--lagoon-deep) no-underline">
					<ArrowLeft size={16} />
					Back to orders
				</Link>
				<p className="mt-4 text-base text-(--sea-ink-soft)">Order not found</p>
			</div>
		)
	}

	return (
		<>
			{Tour}
			<nav className="sticky top-0 z-40 border-b border-(--line) bg-(--surface-strong) backdrop-blur-md">
				<div className="mx-auto flex h-14 w-[min(1080px,calc(100%-2rem))] items-center gap-3">
					<Link
						to="/"
						className="flex items-center gap-1.5 text-sm text-(--sea-ink-soft) no-underline hover:text-(--sea-ink)"
					>
						<ArrowLeft size={16} />
						Orders
					</Link>
					<span className="text-(--line)">/</span>
					<span className="text-sm font-medium text-(--sea-ink)">
						Order {orderId.slice(-8)}
					</span>
					{order.createdAt != null && (
						<span className="text-xs text-(--sea-ink-soft) opacity-60">{formatOrderDate(order.createdAt)}</span>
					)}
					<div className="ml-auto flex items-center gap-1.5">
						<button
							type="button"
							onClick={handleToggleCompleted}
							data-tour="complete-btn"
							className={cn(
								'flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md border cursor-pointer transition-colors',
								isCompleted
									? 'border-(--lagoon) bg-(--lagoon)/10 text-(--lagoon) hover:bg-(--lagoon)/20'
									: 'border-(--line) bg-transparent text-(--sea-ink-soft) hover:text-(--sea-ink) hover:border-(--sea-ink-soft)',
							)}
						>
							{isCompleted ? <CheckCircle2 size={13} /> : <Circle size={13} />}
							{isCompleted ? 'Completed' : 'Complete'}
						</button>
						<button
							type="button"
							onClick={handleCopyLink}
							data-tour="share-btn"
							className="flex cursor-pointer items-center gap-1.5 rounded-md border border-(--line) bg-transparent px-2.5 py-1.5 text-xs font-medium text-(--sea-ink-soft) transition-colors hover:border-(--sea-ink-soft) hover:text-(--sea-ink)"
						>
							{copied ? <Check size={13} /> : <Link2 size={13} />}
							{copied ? 'Copied!' : 'Share'}
						</button>
						<button
							type="button"
							onClick={handleRestartTour}
							className="flex cursor-pointer items-center justify-center rounded-md text-(--sea-ink-soft) transition-colors hover:text-(--sea-ink)"
							title="Restart tour"
						>
							<HelpCircle size={16} />
						</button>
						<div data-tour="name-input" className="flex items-center gap-1.5">
							<User size={14} className="text-(--sea-ink-soft)" />
							<input
								type="text"
								value={defaultName}
								onChange={(e) => saveDefaultName(e.target.value)}
								placeholder="Your name"
								className="w-28 border-b border-(--line) bg-transparent py-1 text-sm text-(--sea-ink) outline-none placeholder:text-(--sea-ink-soft) placeholder:opacity-50 focus:border-(--lagoon)"
							/>
						</div>
					</div>
				</div>
			</nav>

			<div className="mx-auto w-[min(1080px,calc(100%-2rem))] py-8 pb-28 lg:pb-8">
				<div className="flex flex-col gap-8 lg:flex-row">
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
											disabled={isCompleted}
											onAdd={() => handleAddDish(dish.id, dish.priceCents)}
										/>
									))}
								</div>
							</div>
						))}
					</section>

					<aside className="hidden w-80 shrink-0 lg:block">
						<div data-tour="order-summary" className="sticky top-20">
							<OrderSummary {...summaryProps} />
						</div>
					</aside>
				</div>

				{currentOrderItems.length > 0 && (
					<div className="fixed inset-x-0 bottom-0 z-50 animate-[rise-in_400ms_cubic-bezier(0.16,1,0.3,1)_both] lg:hidden">
						{mobileSheetOpen && (
							<div className="max-h-[55vh] overflow-y-auto rounded-t-xl">
								<OrderSummary {...summaryProps} />
							</div>
						)}
						<button
							type="button"
							onClick={() => setMobileSheetOpen((v) => !v)}
							className="flex w-full items-center justify-between rounded-none border border-t border-(--line) bg-(--surface-strong) px-5 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-xs"
						>
							<span className="text-sm font-medium text-(--sea-ink)">
								{currentOrderItems.length} {currentOrderItems.length === 1 ? 'item' : 'items'}
							</span>
							<div className="flex items-center gap-3">
								<span className="text-sm font-bold text-(--palm) tabular-nums">€{(totalCents / 100).toFixed(2)}</span>
								<ChevronUp
									size={18}
									className={cn('text-(--sea-ink-soft) transition-transform', mobileSheetOpen && 'rotate-180')}
								/>
							</div>
						</button>
					</div>
				)}
			</div>
		</>
	)
}
