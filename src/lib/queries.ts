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
		withItemsAndDishes: defineQuery(() => zql.orders.related('items', (q) => q.related('dish'))),
		byIdWithItemsAndDishes: defineQuery(z.string(), ({ args: id }) =>
			zql.orders.where('id', id).related('items', (q) => q.related('dish')),
		),
	},
	orderItems: {
		all: defineQuery(() => zql.orderItems),
	},
})
