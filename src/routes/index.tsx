import { useQuery } from '@rocicorp/zero/react'
import { createFileRoute } from '@tanstack/react-router'

import { queries } from '#/lib/queries'

export const Route = createFileRoute('/')({ component: App })

function App() {
	const [dishes] = useQuery(queries.dishes())
	return (
		<main>
			<h1>Kimchi Train</h1>
			<ul>
				{dishes.map((dish) => (
					<li key={dish.id}>{dish.name}</li>
				))}
			</ul>
		</main>
	)
}
