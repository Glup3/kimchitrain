import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface SpendingDataPoint {
	date: string
	spending: number
	label: string
}

interface Props {
	data: SpendingDataPoint[]
}

function ChartTooltip({
	active,
	payload,
	label,
}: {
	active?: boolean
	payload?: Array<{ value?: number }>
	label?: string
}) {
	if (!active || !payload?.length) return null
	return (
		<div
			className="rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-xs shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-[4px]"
			style={{ pointerEvents: 'none' }}
		>
			<p className="font-semibold text-[var(--sea-ink)]">{label}</p>
			<p className="font-medium text-[var(--palm)]">&euro;{payload[0]!.value?.toFixed(2)}</p>
		</div>
	)
}

export function SpendingChart({ data }: Props) {
	return (
		<div
			className="animate-[rise-in_700ms_cubic-bezier(0.16,1,0.3,1)_both] rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-[4px]"
			style={{ animationDelay: '420ms' }}
		>
			<h3 className="mb-5 text-[0.69rem] font-bold tracking-[0.16em] text-[var(--kicker)] uppercase">
				Spending Over Time
			</h3>
			<ResponsiveContainer width="100%" height={300}>
				<AreaChart data={data} margin={{ left: 8, right: 16, top: 8, bottom: 0 }}>
					<defs>
						<linearGradient id="spendingFill" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="var(--lagoon)" stopOpacity={0.28} />
							<stop offset="100%" stopColor="var(--lagoon)" stopOpacity={0.02} />
						</linearGradient>
					</defs>
					<CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
					<XAxis
						dataKey="label"
						tick={{ fontSize: 11, fill: 'var(--sea-ink-soft)' }}
						axisLine={false}
						tickLine={false}
					/>
					<YAxis
						tick={{ fontSize: 11, fill: 'var(--sea-ink-soft)' }}
						axisLine={false}
						tickLine={false}
						tickFormatter={(v: number) => `€${v}`}
					/>
					<Tooltip content={<ChartTooltip />} />
					<Area
						type="monotone"
						dataKey="spending"
						stroke="var(--lagoon)"
						strokeWidth={2.5}
						fill="url(#spendingFill)"
						dot={{ r: 3.5, fill: 'var(--lagoon)', stroke: 'var(--surface-strong)', strokeWidth: 2 }}
						activeDot={{ r: 5, fill: 'var(--lagoon)', stroke: 'var(--surface-strong)', strokeWidth: 2 }}
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	)
}
