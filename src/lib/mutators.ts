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
	orderItems: {
		add: defineMutator<
			{ dishId: number; orderId: string; priceCents: number }
		>(async ({ tx, args }) => {
			await tx.mutate.orderItems.insert({
				id: ulid(),
				orderer: '',
				dishId: args.dishId,
				orderId: args.orderId,
				priceCents: args.priceCents,
			})
		}),
		updateOrderer: defineMutator<{ id: string; orderer: string }>(
			async ({ tx, args }) => {
				await tx.mutate.orderItems.update({
					id: args.id,
					orderer: args.orderer,
				})
			},
		),
		remove: defineMutator<{ id: string }>(async ({ tx, args }) => {
			await tx.mutate.orderItems.delete({
				id: args.id,
			})
		}),
	},
})
