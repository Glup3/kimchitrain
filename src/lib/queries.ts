import { defineQueries, defineQuery } from '@rocicorp/zero'

import { zql } from '#/db/zero-schema'

export const queries = defineQueries({
	dishes: {
		all: defineQuery(() => zql.dishes),
	},
	dishGroups: {
		all: defineQuery(() => zql.dishGroups),
	},
	orders: {
		all: defineQuery(() => zql.orders),
	},
	orderItems: {
		all: defineQuery(() => zql.orderItems),
	},
})
