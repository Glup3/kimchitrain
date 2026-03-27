import { defineMutator, defineMutators } from '@rocicorp/zero'
import { ulid } from 'ulid'
import { z } from 'zod'

export const mutators = defineMutators({
	orders: {
		create: defineMutator(async ({ tx }) => {
			await tx.mutate.orders.insert({
				id: ulid(),
				createdAt: Date.now(),
			})
		}),
		createWithId: defineMutator(
			z.object({ id: z.string() }),
			async ({ tx, args }) => {
				await tx.mutate.orders.insert({
					id: args.id,
					createdAt: Date.now(),
				})
			},
		),
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
				})
			},
		),
		updateOrderer: defineMutator(
			z.object({ id: z.string(), orderer: z.string() }),
			async ({ tx, args }) => {
				await tx.mutate.orderItems.update({
					id: args.id,
					orderer: args.orderer,
				})
			},
		),
		remove: defineMutator(
			z.object({ id: z.string() }),
			async ({ tx, args }) => {
				await tx.mutate.orderItems.delete({
					id: args.id,
				})
			},
		),
	},
})
