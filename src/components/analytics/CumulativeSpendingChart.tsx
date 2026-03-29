import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface CumulativeDataPoint {
	label: string
	cumulative: number
}

interface Props {
	data: CumulativeDataPoint[]
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
			<p className="font-medium text-[var(--lagoon-deep)]">&euro;{payload[0]!.value?.toFixed(2)}</p>
		</div>
	)
}

export function CumulativeSpendingChart({ data }: Props) {
	return (
		<div
			className="animate-[rise-in_700ms_cubic-bezier(0.16,1,0.3,1)_both] rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-[4px]"
			style={{ animationDelay: '770ms' }}
		>
			<h3 className="mb-5 text-[0.69rem] font-bold tracking-[0.16em] text-[var(--kicker)] uppercase">
				Cumulative Spending
			</h3>
			<ResponsiveContainer width="100%" height={300}>
				<LineChart data={data} margin={{ left: 8, right: 16, top: 8, bottom: 0 }}>
					<defs>
						<linearGradient id="cumulStroke" x1="0" y1="0" x2="1" y2="0">
							<stop offset="0%" stopColor="var(--lagoon-deep)" />
							<stop offset="100%" stopColor="#7c6fcd" />
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
					<Line
						type="monotone"
						dataKey="cumulative"
						stroke="url(#cumulStroke)"
						strokeWidth={2.5}
						dot={false}
						activeDot={{ r: 4, fill: 'var(--lagoon-deep)', stroke: 'var(--surface-strong)', strokeWidth: 2 }}
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	)
}
