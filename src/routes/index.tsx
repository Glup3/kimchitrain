import { useQuery, useZero } from '@rocicorp/zero/react'
import { createFileRoute } from '@tanstack/react-router'

import { mutators } from '#/lib/mutators'
import { queries } from '#/lib/queries'

export const Route = createFileRoute('/')({ component: App })

function App() {
	const zero = useZero()
	const [dishes] = useQuery(queries.dishes())
	const [orders] = useQuery(queries.orders())

	return (
		<main>
			<h1>Kimchi Train</h1>
			<div>
				<h2>Dishes</h2>
				<ul>
					{dishes.map((dish) => (
						<li key={dish.id}>{dish.name}</li>
					))}
				</ul>
			</div>

			<div>
				<h2>Orders</h2>
				<button
					type="button"
					onClick={async () => {
						const result = zero.mutate(mutators.orders.create())
						const clientResult = await result.client

						if (clientResult.type === 'error') {
							console.error('Failed to create order', clientResult.error.message)
						} else {
							console.log('Order created!')
						}
					}}
				>
					Create
				</button>
				<ul>
					{orders.map((order) => (
						<li key={order.id}>{order.id}</li>
					))}
				</ul>
			</div>
		</main>
	)
}
