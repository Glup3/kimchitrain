import { describe, expect, it } from 'vitest'

import { buildBasket, observedPrices, percentageChange, type PriceRecord } from './priceHistory'

const record = (
	id: number,
	dishId: number,
	priceCents: number,
	recordedAt: number,
	isBaseline = false,
): PriceRecord => ({
	id,
	dishId,
	priceCents,
	recordedAt,
	isBaseline,
	effectiveFrom: null,
	source: 'test',
})

describe('menu inflation', () => {
	it('keeps a fixed basket, includes decreases, and combines a batch into one point', () => {
		expect(
			buildBasket([
				record(5, 2, 150, 20),
				record(1, 1, 100, 10, true),
				record(2, 2, 200, 10, true),
				record(3, 3, 900, 15),
				record(4, 1, 200, 20),
				record(6, 1, 150, 30),
			]),
		).toEqual([
			{ timestamp: 10, priceCents: 300 },
			{ timestamp: 20, priceCents: 350 },
			{ timestamp: 30, priceCents: 300 },
		])
	})
	it('preserves the baseline when migrations share a transaction timestamp', () => {
		expect(buildBasket([record(1, 1, 100, 10, true), record(2, 1, 150, 10)])).toEqual([
			{ timestamp: 10, priceCents: 100 },
			{ timestamp: 10, priceCents: 150 },
		])
	})
	it('handles absent baselines and zero prices without inventing percentages', () => {
		expect(buildBasket([record(1, 1, 100, 10)])).toEqual([])
		expect(percentageChange(0, 100)).toBeNull()
		expect(percentageChange(100, 125)).toBe(25)
		expect(percentageChange(100, 75)).toBe(-25)
	})
	it('retains distinct saved prices in an order and excludes undated observations', () => {
		expect(
			observedPrices(
				[
					{
						createdAt: 10,
						items: [
							{ dishId: 1, priceCents: 100 },
							{ dishId: 1, priceCents: 100 },
							{ dishId: 1, priceCents: 125 },
							{ dishId: 2, priceCents: 999 },
						],
					},
					{ createdAt: null, items: [{ dishId: 1, priceCents: 1 }] },
				],
				1,
			),
		).toEqual([
			{ timestamp: 10, priceCents: 100 },
			{ timestamp: 10, priceCents: 125 },
		])
	})
})
