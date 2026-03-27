import { useCallback, useState } from 'react'
import { useQuery, useZero } from '@rocicorp/zero/react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Check, CheckCircle2, ChevronUp, Circle, Flame, Link2, User } from 'lucide-react'

import { formatOrderDate } from '#/lib/format'
import { mutators } from '#/lib/mutators'
import { queries } from '#/lib/queries'
import { cn } from '#/lib/utils'
import { DishCard } from '#/components/DishCard'
import { OrderSummary } from '#/components/OrderSummary'

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
	const [dishes] = useQuery(queries.dishes.all())
	const [dishGroups] = useQuery(queries.dishGroups.all())
	const [orders] = useQuery(queries.orders.all())
	const [orderItems] = useQuery(queries.orderItems.all())
	const [mobileSheetOpen, setMobileSheetOpen] = useState(false)
	const [defaultName, setDefaultName] = useState(getDefaultName)
	const [copied, setCopied] = useState(false)

	const handleCopyLink = useCallback(() => {
		navigator.clipboard.writeText(window.location.href).then(() => {
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		})
	}, [])

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

	const reversedOrders = [...orders].reverse()
	const orderIndex = reversedOrders.findIndex((o) => o.id === orderId)
	const orderNum = orderIndex >= 0 ? reversedOrders.length - orderIndex : null

	const groupMap = new Map(dishGroups.map((g) => [g.id, g.name]))
	const grouped = dishes.reduce<Map<number, typeof dishes>>((acc, d) => {
		const list = acc.get(d.groupId) ?? []
		list.push(d)
		acc.set(d.groupId, list)
		return acc
	}, new Map())

	const order = orders.find((o) => o.id === orderId)
	const isCompleted = order?.completed ?? false
	const currentOrderItems = orderItems.filter(
		(item) => item.orderId === orderId,
	)
	const totalCents = currentOrderItems.reduce(
		(sum, item) => sum + item.priceCents,
		0,
	)

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
		dishes,
		onRemoveItem: handleRemoveItem,
		onUpdateOrderer: handleUpdateOrderer,
		readOnly: isCompleted,
	}

	if (!order) {
		return (
			<div className="page-wrap py-8">
				<Link
					to="/"
					className="flex items-center gap-1.5 text-sm text-[var(--lagoon-deep)] no-underline"
				>
					<ArrowLeft size={16} />
					Back to orders
				</Link>
				<p className="text-base text-[var(--sea-ink-soft)] mt-4">
					Order not found
				</p>
			</div>
		)
	}

	return (
		<>
			<nav className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--surface-strong)] backdrop-blur-md">
				<div className="page-wrap flex items-center gap-3 h-14">
					<Link
						to="/"
						className="flex items-center gap-1.5 text-sm text-[var(--sea-ink-soft)] no-underline hover:text-[var(--sea-ink)]"
					>
						<ArrowLeft size={16} />
						Orders
					</Link>
					<span className="text-[var(--line)]">/</span>
					<span className="text-sm font-medium text-[var(--sea-ink)]">
						{orderNum != null ? `Order #${orderNum}` : `Order ${orderId.slice(-5)}`}
					</span>
					{order.createdAt != null && (
						<span className="text-xs text-[var(--sea-ink-soft)] opacity-60">
							{formatOrderDate(order.createdAt)}
						</span>
					)}
					<div className="ml-auto flex items-center gap-1.5">
						<button
							type="button"
							onClick={handleToggleCompleted}
							className={cn(
								'flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md border cursor-pointer transition-colors',
								isCompleted
									? 'border-[var(--lagoon)] bg-[var(--lagoon)]/10 text-[var(--lagoon)] hover:bg-[var(--lagoon)]/20'
									: 'border-[var(--line)] bg-transparent text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] hover:border-[var(--sea-ink-soft)]',
							)}
						>
							{isCompleted ? <CheckCircle2 size={13} /> : <Circle size={13} />}
							{isCompleted ? 'Completed' : 'Complete'}
						</button>
						<button
							type="button"
							onClick={handleCopyLink}
							className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md border border-[var(--line)] bg-transparent text-[var(--sea-ink-soft)] cursor-pointer hover:text-[var(--sea-ink)] hover:border-[var(--sea-ink-soft)] transition-colors"
						>
							{copied ? <Check size={13} /> : <Link2 size={13} />}
							{copied ? 'Copied!' : 'Share'}
						</button>
						<User size={14} className="text-[var(--sea-ink-soft)]" />
						<input
							type="text"
							value={defaultName}
							onChange={(e) => saveDefaultName(e.target.value)}
							placeholder="Your name"
							className="text-sm bg-transparent border-b border-[var(--line)] text-[var(--sea-ink)] outline-none w-28 py-1 placeholder:text-[var(--sea-ink-soft)] placeholder:opacity-50 focus:border-[var(--lagoon)]"
						/>
					</div>
				</div>
			</nav>

			<div className="page-wrap py-8 pb-28 lg:pb-8">
				<div className="flex flex-col lg:flex-row gap-8">
					<section className="flex-1 min-w-0 self-start">
						<div className="flex items-center gap-1.5 mb-4 text-xs text-[var(--sea-ink-soft)]">
							<Flame size={13} className="text-orange-500" />
							<span>Popular</span>
						</div>
						{[...grouped.entries()].map(([groupId, groupDishes]) => (
							<div key={groupId} className="mb-6">
								<h2 className="island-kicker mb-2">
									{groupMap.get(groupId) ?? 'Other'}
								</h2>
								<div className="divide-y divide-[var(--line)]">
									{groupDishes.map((dish) => (
										<DishCard
											key={dish.id}
											dish={dish}
											disabled={isCompleted}
											onAdd={() =>
												handleAddDish(dish.id, dish.priceCents)
											}
										/>
									))}
								</div>
							</div>
						))}
					</section>

					<aside className="hidden lg:block w-80 shrink-0">
						<div className="sticky top-20">
							<OrderSummary {...summaryProps} />
						</div>
					</aside>
				</div>

				{currentOrderItems.length > 0 && (
					<div className="lg:hidden fixed bottom-0 inset-x-0 z-50 mobile-summary-bar">
						{mobileSheetOpen && (
							<div className="max-h-[55vh] overflow-y-auto rounded-t-xl">
								<OrderSummary {...summaryProps} />
							</div>
						)}
						<button
							type="button"
							onClick={() => setMobileSheetOpen((v) => !v)}
							className="w-full flex items-center justify-between px-5 py-3 island-shell border-t border-[var(--line)] rounded-none"
						>
							<span className="text-sm font-medium text-[var(--sea-ink)]">
								{currentOrderItems.length}{' '}
								{currentOrderItems.length === 1 ? 'item' : 'items'}
							</span>
							<div className="flex items-center gap-3">
								<span className="text-sm font-bold text-[var(--palm)] tabular-nums">
									€{(totalCents / 100).toFixed(2)}
								</span>
								<ChevronUp
									size={18}
									className={cn(
										'text-[var(--sea-ink-soft)] transition-transform',
										mobileSheetOpen && 'rotate-180',
									)}
								/>
							</div>
						</button>
					</div>
				)}
			</div>
		</>
	)
}
