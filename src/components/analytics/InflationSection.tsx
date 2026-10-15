import { useQuery } from '@rocicorp/zero/react'
import { ChevronDown } from 'lucide-react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { buildBasket, observedPrices, percentageChange } from '#/lib/priceHistory'
import { queries } from '#/lib/queries'

const money = (cents: number) => `€${(cents / 100).toFixed(2)}`
const date = (timestamp: number) =>
	new Date(timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
const percent = (value: number | null) => (value === null ? '—' : `${value > 0 ? '+' : ''}${value.toFixed(1)}%`)

function PriceChart({ points }: { points: { timestamp: number; priceCents: number }[] }) {
	return (
		<ResponsiveContainer width="100%" height={240}>
			<LineChart data={points} margin={{ top: 12, right: 20, left: 8, bottom: 8 }} accessibilityLayer>
				<CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
				<XAxis
					dataKey="timestamp"
					type="number"
					domain={['dataMin', 'dataMax']}
					tickFormatter={date}
					tick={{ fontSize: 11, fill: 'var(--sea-ink-soft)' }}
					minTickGap={50}
				/>
				<YAxis
					tickFormatter={money}
					domain={['auto', 'auto']}
					tick={{ fontSize: 11, fill: 'var(--sea-ink-soft)' }}
					width={75}
				/>
				<Tooltip
					labelFormatter={(value) => date(Number(value))}
					formatter={(value) => [money(Number(value)), 'Recorded price']}
					contentStyle={{
						background: 'var(--surface-strong)',
						borderColor: 'var(--line)',
						borderRadius: 12,
						color: 'var(--sea-ink)',
					}}
				/>
				<Line
					type="stepAfter"
					dataKey="priceCents"
					stroke="var(--lagoon)"
					strokeWidth={3}
					dot={{ r: 4 }}
					isAnimationActive={false}
				/>
			</LineChart>
		</ResponsiveContainer>
	)
}

export function InflationSection() {
	const [history, historyResult] = useQuery(queries.dishPriceHistory.all())
	const [dishes, dishesResult] = useQuery(queries.dishes.all())
	const [orders, ordersResult] = useQuery(queries.orders.withItems())

	if (historyResult.type !== 'complete' || dishesResult.type !== 'complete') {
		return (
			<p role="status" className="py-16 text-center text-[var(--sea-ink-soft)]">
				Loading price history…
			</p>
		)
	}
	if (!history.length) {
		return <p className="py-16 text-center text-[var(--sea-ink-soft)]">Menu price tracking hasn’t started yet.</p>
	}

	const basket = buildBasket(history)
	const initialBasket = basket[0]
	const currentBasket = basket.at(-1)
	const rows = dishes
		.map((dish) => {
			const entries = history
				.filter((entry) => entry.dishId === dish.id)
				.sort((a, b) => a.recordedAt - b.recordedAt || a.id - b.id)
			const initial = entries[0]
			const latest = entries.at(-1)
			const changes = entries.filter((entry, index) => index > 0 && entry.priceCents !== entries[index - 1].priceCents)
			return {
				dish,
				entries,
				initial,
				latest,
				lastChange: changes.at(-1),
				change: initial ? percentageChange(initial.priceCents, dish.priceCents) : null,
			}
		})
		.sort((a, b) => (b.change ?? -Infinity) - (a.change ?? -Infinity) || a.dish.name.localeCompare(b.dish.name))
	const lastChange = rows
		.flatMap((row) => (row.lastChange ? [row.lastChange] : []))
		.sort((a, b) => b.recordedAt - a.recordedAt)[0]
	const baselineCount = history.filter((entry) => entry.isBaseline).length
	const increased = rows.filter((row) => row.initial && row.dish.priceCents > row.initial.priceCents).length

	return (
		<section className="space-y-6 text-[var(--sea-ink)]">
			<div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-5 sm:p-8">
				<p className="text-xs font-bold tracking-[0.16em] text-[var(--kicker)] uppercase">The menu price index</p>
				<div className="mt-4 grid gap-6 sm:grid-cols-[1.3fr_1fr]">
					<div>
						<h2 className="font-['Syne',sans-serif] text-5xl font-bold tracking-tight text-[var(--lagoon)] sm:text-6xl">
							{initialBasket && currentBasket
								? percent(percentageChange(initialBasket.priceCents, currentBasket.priceCents))
								: '—'}
						</h2>
						<p className="mt-3 text-sm text-[var(--sea-ink-soft)]">
							Basket change since {initialBasket ? date(initialBasket.timestamp) : 'tracking began'}
						</p>
					</div>
					<dl className="space-y-3 text-sm">
						<div className="flex justify-between gap-4 border-b border-[var(--line)] pb-3">
							<dt>Original basket → latest</dt>
							<dd className="font-semibold tabular-nums">
								{initialBasket && currentBasket
									? `${money(initialBasket.priceCents)} → ${money(currentBasket.priceCents)}`
									: '—'}
							</dd>
						</div>
						<div className="flex justify-between gap-4">
							<dt>Dishes now more expensive</dt>
							<dd className="font-semibold">{increased}</dd>
						</div>
						<div className="flex justify-between gap-4">
							<dt>Last change recorded</dt>
							<dd className="font-semibold">{lastChange ? date(lastChange.recordedAt) : 'No changes yet'}</dd>
						</div>
					</dl>
				</div>
				<p className="mt-6 max-w-2xl text-sm leading-relaxed text-[var(--sea-ink-soft)]">
					One of each of the {baselineCount} original dishes, tracked at recorded menu prices. New dishes and ordering
					habits don’t change this basket. This measures our menu, not general inflation.
				</p>
				{basket.length > 1 ? (
					<div className="mt-6">
						<PriceChart points={basket} />
					</div>
				) : (
					<p className="mt-6 rounded-lg bg-[var(--lagoon-glow)] p-4 text-sm text-[var(--sea-ink-soft)]">
						Baseline recorded. The chart will appear after the first price change.
					</p>
				)}
			</div>

			<div>
				<h2 className="font-['Syne',sans-serif] text-xl font-bold">Dish by dish</h2>
				<p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
					Largest percentage increases first. Expand a dish for its recorded history and prices observed in orders.
				</p>
			</div>
			<div className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface-strong)]">
				<div
					className="hidden grid-cols-[2fr_1fr_1fr_1fr_1fr_1.3fr_20px] gap-3 border-b border-[var(--line)] px-5 py-3 text-xs font-semibold text-[var(--kicker)] md:grid"
					aria-hidden="true"
				>
					<span>Dish</span>
					<span>Initial</span>
					<span>Current</span>
					<span>Change</span>
					<span>Change %</span>
					<span>Last recorded change</span>
					<span />
				</div>
				{rows.map(({ dish, entries, initial, lastChange: dishLastChange, change }) => {
					const observations = observedPrices(orders, dish.id)
					const difference = initial ? dish.priceCents - initial.priceCents : null
					return (
						<details key={dish.id} className="group border-b border-[var(--line)] last:border-b-0">
							<summary className="grid cursor-pointer list-none grid-cols-[1fr_auto_20px] items-center gap-3 px-5 py-4 text-sm hover:bg-[var(--lagoon-glow)] md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1.3fr_20px]">
								<span className="font-semibold">
									{dish.name}
									{initial && !initial.isBaseline && (
										<span className="mt-1 block text-xs font-normal text-[var(--sea-ink-soft)]">
											Outside original basket
										</span>
									)}
								</span>
								<span className="hidden tabular-nums md:block">{initial ? money(initial.priceCents) : '—'}</span>
								<span className="tabular-nums">
									{money(dish.priceCents)}
									<span className="ml-2 text-xs text-[var(--sea-ink-soft)] md:hidden">({percent(change)})</span>
								</span>
								<span className="hidden tabular-nums md:block">
									{difference === null
										? '—'
										: `${difference > 0 ? '+' : difference < 0 ? '−' : ''}${money(Math.abs(difference))}`}
								</span>
								<span className="hidden font-semibold tabular-nums md:block">{percent(change)}</span>
								<span className="hidden text-xs text-[var(--sea-ink-soft)] md:block">
									{dishLastChange ? date(dishLastChange.recordedAt) : 'No changes yet'}
								</span>
								<ChevronDown size={16} className="transition-transform group-open:rotate-180" />
							</summary>
							<div className="border-t border-[var(--line)] px-5 py-5">
								{entries.length > 1 && (
									<PriceChart
										points={entries.map((entry) => ({ timestamp: entry.recordedAt, priceCents: entry.priceCents }))}
									/>
								)}
								<h3 className="text-sm font-bold">Recorded menu prices</h3>
								{!entries.length && (
									<p className="mt-2 text-sm text-[var(--sea-ink-soft)]">No menu history recorded for this dish yet.</p>
								)}
								<ul className="mt-3 space-y-3 text-sm">
									{[...entries].reverse().map((entry) => (
										<li key={entry.id} className="flex flex-wrap justify-between gap-2">
											<div>
												<span>
													{entry.isBaseline
														? 'Initial recorded price'
														: entry.effectiveFrom === null
															? `Recorded on ${date(entry.recordedAt)}`
															: `Effective from ${date(entry.effectiveFrom)}`}
												</span>
												<p className="text-xs text-[var(--sea-ink-soft)]">
													Recorded {date(entry.recordedAt)} · {entry.source}
												</p>
											</div>
											<strong className="tabular-nums">{money(entry.priceCents)}</strong>
										</li>
									))}
								</ul>
								<details className="mt-5 rounded-lg border border-[var(--line)] p-3">
									<summary className="cursor-pointer text-sm font-semibold">
										Prices observed in orders ({observations.length})
									</summary>
									<p className="mt-3 text-xs leading-relaxed text-[var(--sea-ink-soft)]">
										Saved item prices, grouped by order date and price. An order’s date does not establish when a menu
										price changed. These observations aren’t included in the menu index.
									</p>
									{ordersResult.type !== 'complete' ? (
										<p role="status" className="mt-3 text-sm">
											Loading orders…
										</p>
									) : observations.length === 0 ? (
										<p className="mt-3 text-sm">No dated orders for this dish.</p>
									) : (
										<ul className="mt-3 max-h-64 space-y-2 overflow-auto text-sm">
											{observations.map((observation) => (
												<li
													key={`${observation.timestamp}:${observation.priceCents}`}
													className="flex justify-between gap-4"
												>
													<span>Order dated {date(observation.timestamp)}</span>
													<strong className="tabular-nums">{money(observation.priceCents)}</strong>
												</li>
											))}
										</ul>
									)}
								</details>
							</div>
						</details>
					)
				})}
			</div>
		</section>
	)
}
