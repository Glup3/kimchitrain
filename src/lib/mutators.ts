import { defineMutator, defineMutators } from '@rocicorp/zero'
import { ulid } from 'ulid'

export const mutators = defineMutators({
	orders: {
		create: defineMutator(async ({ tx }) => {
			await tx.mutate.orders.insert({
				id: ulid(),
				createdAt: Date.now(),
			})
		}),
	},
})
