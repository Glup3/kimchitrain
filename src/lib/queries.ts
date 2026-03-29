import { defineQueries, defineQuery } from '@rocicorp/zero'
import { z } from 'zod'

import { zql } from '#/db/zero-schema'

export const queries = defineQueries({
	dishes: {
		all: defineQuery(() => zql.dishes),
		withGroup: defineQuery(() => zql.dishes.related('group')),
	},
	dishGroups: {
		all: defineQuery(() => zql.dishGroups),
	},
	orders: {
		all: defineQuery(() => zql.orders),
		withItems: defineQuery(() => zql.orders.related('items')),
		openWithItems: defineQuery(() =>
			zql.orders.where('completed', false).orderBy('createdAt', 'desc').related('items'),
		),
		recentCompletedWithItems: defineQuery(() =>
			zql.orders.where('completed', true).orderBy('createdAt', 'desc').limit(5).related('items'),
		),
		completedWithItems: defineQuery(() =>
			zql.orders.where('completed', true).orderBy('createdAt', 'desc').related('items'),
		),
		withItemsAndDishes: defineQuery(() => zql.orders.related('items', (q) => q.related('dish'))),
		withItemsDishesAndGroups: defineQuery(() =>
			zql.orders.related('items', (q) => q.related('dish', (q) => q.related('group'))),
		),
		byIdWithItemsAndDishes: defineQuery(z.string(), ({ args: id }) =>
			zql.orders.where('id', id).related('items', (q) => q.related('dish')),
		),
	},
	orderItems: {
		all: defineQuery(() => zql.orderItems),
	},
})
