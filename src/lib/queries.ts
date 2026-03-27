import { defineQueries, defineQuery } from '@rocicorp/zero'

import { zql } from '#/db/zero-schema'

export const queries = defineQueries({
	dishes: defineQuery(() => zql.dishes),
	orders: defineQuery(() => zql.orders),
	orderItems: defineQuery(() => zql.orderItems),
})
