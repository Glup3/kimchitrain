import { zeroDrizzle } from '@rocicorp/zero/server/adapters/drizzle'
import { drizzle } from 'drizzle-orm/node-postgres'

import { env } from '#/env.ts'

import * as drizzleSchema from './schema.ts'
import { schema } from './zero-schema.ts'

export const db = drizzle(env.ZERO_UPSTREAM_DB, { schema: drizzleSchema })

export const dbProvider = zeroDrizzle(schema, db)

declare module '@rocicorp/zero' {
	interface DefaultTypes {
		dbProvider: typeof dbProvider
	}
}
