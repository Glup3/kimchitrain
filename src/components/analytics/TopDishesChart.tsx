import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface TopDishData {
	name: string
	count: number
	cost: number
}

interface Props {
	data: TopDishData[]
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: TopDishData }> }) {
	if (!active || !payload?.length) return null
	const d = payload[0]!.payload
	return (
		<div
			className="rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-xs shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-[4px]"
			style={{ pointerEvents: 'none' }}
		>
			<p className="font-semibold text-[var(--sea-ink)]">{d.name}</p>
			<p className="text-[var(--sea-ink-soft)]">
				{d.count} order{d.count !== 1 ? 's' : ''} &middot; &euro;{(d.cost / 100).toFixed(2)}
			</p>
		</div>
	)
}

export function TopDishesChart({ data }: Props) {
	const height = Math.min(340, Math.max(200, data.length * 38 + 24))
	return (
		<div
			className="animate-[rise-in_700ms_cubic-bezier(0.16,1,0.3,1)_both] rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-[4px]"
			style={{ animationDelay: '350ms' }}
		>
			<h3 className="mb-5 text-[0.69rem] font-bold tracking-[0.16em] text-[var(--kicker)] uppercase">Popular Dishes</h3>
			<ResponsiveContainer width="100%" height={height}>
				<BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 0, bottom: 0 }}>
					<CartesianGrid strokeDasharray="3 3" stroke="var(--line)" horizontal={false} />
					<XAxis
						type="number"
						tick={{ fontSize: 11, fill: 'var(--sea-ink-soft)' }}
						axisLine={false}
						tickLine={false}
						allowDecimals={false}
					/>
					<YAxis
						type="category"
						dataKey="name"
						width={100}
						tick={{ fontSize: 12, fill: 'var(--sea-ink)' }}
						axisLine={false}
						tickLine={false}
					/>
					<Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--line)' }} />
					<Bar dataKey="count" fill="var(--lagoon)" radius={[0, 6, 6, 0]} barSize={18} />
				</BarChart>
			</ResponsiveContainer>
		</div>
	)
}
