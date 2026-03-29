import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface LoyaltyData {
	name: string
	loyalty: number
}

interface Props {
	data: LoyaltyData[]
	totalOrders: number
}

const BAR_COLOR = 'var(--lagoon)'

function ChartTooltip({
	active,
	payload,
	totalOrders,
}: {
	active?: boolean
	payload?: Array<{ payload: LoyaltyData }>
	totalOrders: number
}) {
	if (!active || !payload?.length) return null
	const d = payload[0]!.payload
	return (
		<div
			className="rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-xs shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-[4px]"
			style={{ pointerEvents: 'none' }}
		>
			<p className="font-semibold text-[var(--sea-ink)]">{d.name}</p>
			<p className="text-[var(--sea-ink-soft)]">
				{d.loyalty}% of {totalOrders} order{totalOrders !== 1 ? 's' : ''}
			</p>
		</div>
	)
}

export function DishLoyaltyChart({ data, totalOrders }: Props) {
	const height = Math.min(340, Math.max(200, data.length * 38 + 24))
	return (
		<div
			className="animate-[rise-in_700ms_cubic-bezier(0.16,1,0.3,1)_both] rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-[4px]"
			style={{ animationDelay: '840ms' }}
		>
			<h3 className="mb-1 text-[0.69rem] font-bold tracking-[0.16em] text-[var(--kicker)] uppercase">Dish Loyalty</h3>
			<p className="mb-4 text-[0.7rem] text-[var(--sea-ink-soft)]">% of orders containing each dish</p>
			<ResponsiveContainer width="100%" height={height}>
				<BarChart data={data} layout="vertical" margin={{ left: 8, right: 32, top: 0, bottom: 0 }}>
					<CartesianGrid strokeDasharray="3 3" stroke="var(--line)" horizontal={false} />
					<XAxis
						type="number"
						domain={[0, 100]}
						tick={{ fontSize: 11, fill: 'var(--sea-ink-soft)' }}
						axisLine={false}
						tickLine={false}
						tickFormatter={(v: number) => `${v}%`}
					/>
					<YAxis
						type="category"
						dataKey="name"
						width={100}
						tick={{ fontSize: 12, fill: 'var(--sea-ink)' }}
						axisLine={false}
						tickLine={false}
					/>
					<Tooltip content={<ChartTooltip totalOrders={totalOrders} />} cursor={{ fill: 'var(--line)' }} />
					<Bar dataKey="loyalty" radius={[0, 6, 6, 0]} barSize={18}>
						{data.map((entry, i) => (
							<Cell key={i} fill={BAR_COLOR} fillOpacity={0.4 + (entry.loyalty / 100) * 0.6} />
						))}
					</Bar>
				</BarChart>
			</ResponsiveContainer>
		</div>
	)
}
