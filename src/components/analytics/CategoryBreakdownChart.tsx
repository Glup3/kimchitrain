import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

interface CategoryData {
	name: string
	value: number
}

interface Props {
	data: CategoryData[]
}

const COLORS = [
	'var(--lagoon)',
	'var(--palm)',
	'var(--lagoon-deep)',
	'#e8924a',
	'#c74375',
	'#7c6fcd',
]

function ChartTooltip({
	active,
	payload,
}: {
	active?: boolean
	payload?: Array<{ payload: CategoryData; value?: number }>
	total?: number
}) {
	if (!active || !payload?.length) return null
	const d = payload[0]!.payload
	return (
		<div
			className="rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-xs shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-[4px]"
			style={{ pointerEvents: 'none' }}
		>
			<p className="font-semibold text-[var(--sea-ink)]">{d.name}</p>
			<p className="font-medium text-[var(--palm)]">&euro;{(d.value / 100).toFixed(2)}</p>
		</div>
	)
}

export function CategoryBreakdownChart({ data }: Props) {
	return (
		<div
			className="animate-[rise-in_700ms_cubic-bezier(0.16,1,0.3,1)_both] rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-[4px]"
			style={{ animationDelay: '490ms' }}
		>
			<h3 className="mb-5 text-[0.69rem] font-bold tracking-[0.16em] text-[var(--kicker)] uppercase">
				Spending by Category
			</h3>
			<ResponsiveContainer width="100%" height={340}>
				<PieChart>
					<Pie
						data={data}
						dataKey="value"
						nameKey="name"
						innerRadius={72}
						outerRadius={110}
						paddingAngle={3}
						strokeWidth={0}
						label={({ cx, cy, midAngle, outerRadius: or, name, value }) => {
							const RAD = Math.PI / 180
							const angle = midAngle ?? 0
							const x = cx + (or + 18) * Math.cos(-angle * RAD)
							const y = cy + (or + 18) * Math.sin(-angle * RAD)
							return (
								<text x={x} y={y} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-[11px] fill-[var(--sea-ink)]">
									{name} · €{(value / 100).toFixed(2)}
								</text>
							)
						}}
					>
						{data.map((_, i) => (
							<Cell key={i} fill={COLORS[i % COLORS.length]} />
						))}
					</Pie>
					<Tooltip content={<ChartTooltip />} />
				</PieChart>
			</ResponsiveContainer>
		</div>
	)
}
