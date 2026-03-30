import { defineMutator, defineMutators } from '@rocicorp/zero'
import { ulid } from 'ulid'
import { z } from 'zod'

export const mutators = defineMutators({
	orders: {
		createWithId: defineMutator(z.object({ id: z.string() }), async ({ tx, args }) => {
			await tx.mutate.orders.insert({
				id: args.id,
				completed: false,
				createdAt: Date.now(),
			})
		}),
		setCompleted: defineMutator(z.object({ id: z.string(), completed: z.boolean() }), async ({ tx, args }) => {
			await tx.mutate.orders.update({
				id: args.id,
				completed: args.completed,
			})
		}),
	},
	orderItems: {
		add: defineMutator(
			z.object({
				dishId: z.number(),
				orderId: z.string(),
				priceCents: z.number(),
				orderer: z.string(),
			}),
			async ({ tx, args }) => {
				await tx.mutate.orderItems.insert({
					id: ulid(),
					orderer: args.orderer,
					dishId: args.dishId,
					orderId: args.orderId,
					priceCents: args.priceCents,
					settled: false,
				})
			},
		),
		updateOrderer: defineMutator(z.object({ id: z.string(), orderer: z.string() }), async ({ tx, args }) => {
			await tx.mutate.orderItems.update({
				id: args.id,
				orderer: args.orderer,
			})
		}),
		setSettled: defineMutator(z.object({ id: z.string(), settled: z.boolean() }), async ({ tx, args }) => {
			await tx.mutate.orderItems.update({
				id: args.id,
				settled: args.settled,
			})
		}),
		remove: defineMutator(z.object({ id: z.string() }), async ({ tx, args }) => {
			await tx.mutate.orderItems.delete({
				id: args.id,
			})
		}),
	},
})
