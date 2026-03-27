import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface TopDishData {
	name: string
	count: number
	revenue: number
}

interface Props {
	data: TopDishData[]
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: TopDishData }> }) {
	if (!active || !payload?.length) return null
	const d = payload[0]!.payload
	return (
		<div className="island-shell rounded-lg px-3 py-2 text-xs" style={{ pointerEvents: 'none' }}>
			<p className="font-semibold text-[var(--sea-ink)]">{d.name}</p>
			<p className="text-[var(--sea-ink-soft)]">
				{d.count} order{d.count !== 1 ? 's' : ''} &middot; &euro;{(d.revenue / 100).toFixed(2)}
			</p>
		</div>
	)
}

export function TopDishesChart({ data }: Props) {
	const height = Math.min(340, Math.max(200, data.length * 38 + 24))
	return (
		<div className="rise-in island-shell rounded-xl p-5" style={{ animationDelay: '350ms' }}>
			<h3 className="island-kicker mb-5">Popular Dishes</h3>
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
