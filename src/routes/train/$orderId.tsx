import { useQuery, useZero } from '@rocicorp/zero/react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Check, CheckCircle2, ChevronUp, Circle, Flame, HelpCircle, Link2, User } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useJoyride, STATUS } from 'react-joyride'
import type { Status as StatusType } from 'react-joyride'

import { DishCard } from '#/components/DishCard'
import { OrderSummary } from '#/components/OrderSummary'
import { formatOrderDate } from '#/lib/format'
import { mutators } from '#/lib/mutators'
import { queries } from '#/lib/queries'
import { cn } from '#/lib/utils'

const NAME_KEY = 'kimchi-train:name'
const TOUR_COMPLETED_KEY = 'kimchi-train:tour-completed'

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

	const [runTour, setRunTour] = useState(() => {
		try {
			return !localStorage.getItem(TOUR_COMPLETED_KEY)
		} catch {
			return true
		}
	})

	const { Tour, controls } = useJoyride({
		continuous: true,
		run: runTour,
		options: {
			primaryColor: '#f87171',
			backgroundColor: '#292524',
			textColor: '#fafaf9',
			arrowColor: '#292524',
			buttons: ['back', 'close', 'primary', 'skip'],
			skipBeacon: true,
			closeButtonAction: 'skip',
		},
		steps: [
			{
				target: '[data-tour="name-input"]',
				content: 'Enter your name here so everyone knows which items are yours. This is saved for next time!',
				title: 'Step 1 — Set your name',
				placement: 'bottom',
			},
			{
				target: '[data-tour="dish-menu-1"]',
				content: 'Browse the menu and tap any dish to add it to your order.',
				title: 'Step 2 — Pick your dishes',
				placement: 'right',
			},
			{
				target: '[data-tour="order-summary"]',
				content: 'Your selected items appear here with the running total.',
				title: 'Step 3 — Review your order',
				placement: 'left',
				targetWaitTimeout: 0,
			},
			{
				target: '[data-tour="complete-btn"]',
				content: 'Mark the order as complete when everyone has placed their orders.',
				title: 'Step 4 — Complete the order',
				placement: 'bottom',
			},
			{
				target: '[data-tour="share-btn"]',
				content: 'Share this link with others so they can add their orders too.',
				title: 'Step 5 — Share with friends',
				placement: 'bottom',
			},
		],
		onEvent: (data) => {
			if (([STATUS.FINISHED, STATUS.SKIPPED] as unknown as StatusType).includes(data.status)) {
				setRunTour(false)
				try {
					localStorage.setItem(TOUR_COMPLETED_KEY, '1')
				} catch {}
			}
		},
	})

	const handleCopyLink = useCallback(() => {
		navigator.clipboard.writeText(window.location.href).then(() => {
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		})
	}, [])

	function handleRestartTour() {
		controls.reset(true)
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
	const currentOrderItems = orderItems.filter((item) => item.orderId === orderId)
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
		dishes,
		onRemoveItem: handleRemoveItem,
		onUpdateOrderer: handleUpdateOrderer,
		readOnly: isCompleted,
	}

	if (!order) {
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
						{orderNum != null ? `Order #${orderNum}` : `Order ${orderId.slice(-5)}`}
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
									{groupMap.get(groupId) ?? 'Other'}
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
