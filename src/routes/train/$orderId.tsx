import { useQuery, useZero } from '@rocicorp/zero/react'
import { createFileRoute, notFound } from '@tanstack/react-router'
import { useCallback, useState } from 'react'

import { DishMenu } from '#/components/DishMenu'
import { MobileOrderSheet } from '#/components/MobileOrderSheet'
import { OrderNav } from '#/components/OrderNav'
import { OrderSummary } from '#/components/OrderSummary'
import { useOrderTour } from '#/hooks/useOrderTour'
import { mutators } from '#/lib/mutators'
import { queries } from '#/lib/queries'

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
	const [defaultName, setDefaultName] = useState(getDefaultName)
	const [copied, setCopied] = useState(false)

	const { Tour, restartTour } = useOrderTour()

	const handleCopyLink = useCallback(() => {
		navigator.clipboard.writeText(window.location.href).then(() => {
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		})
	}, [])

	const order = orderRows[0]

	if (!order && orderResult.type !== 'complete') return null

	if (!order) throw notFound()

	function handleToggleCompleted() {
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

	const isCompleted = order.completed
	const currentOrderItems = order.items
	const totalCents = currentOrderItems.reduce((sum, item) => sum + item.priceCents, 0)

	const summaryProps = {
		items: currentOrderItems,
		onRemoveItem: handleRemoveItem,
		onUpdateOrderer: handleUpdateOrderer,
		readOnly: isCompleted,
	}

	return (
		<>
			{Tour}
			<OrderNav
				orderId={orderId}
				createdAt={order.createdAt}
				isCompleted={isCompleted}
				copied={copied}
				onToggleCompleted={handleToggleCompleted}
				onCopyLink={handleCopyLink}
				onRestartTour={restartTour}
				defaultName={defaultName}
				onNameChange={saveDefaultName}
			/>

			<div className="mx-auto w-[min(1080px,calc(100%-2rem))] py-8 pb-28 lg:pb-8">
				<div className="flex flex-col gap-8 lg:flex-row">
					<DishMenu dishes={dishesWithGroup} disabled={isCompleted} onAddDish={handleAddDish} />

					<aside className="hidden w-80 shrink-0 lg:block">
						<div data-tour="order-summary" className="sticky top-20">
							<OrderSummary {...summaryProps} />
						</div>
					</aside>
				</div>

				<MobileOrderSheet {...summaryProps} totalCents={totalCents} />
			</div>
		</>
	)
}
