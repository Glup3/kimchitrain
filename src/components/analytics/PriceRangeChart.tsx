import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface PriceData {
	range: string
	count: number
}

interface Props {
	data: PriceData[]
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
			<p className="font-medium text-[var(--lagoon)]">
				{payload[0]!.value} item{payload[0]!.value !== 1 ? 's' : ''}
			</p>
		</div>
	)
}

export function PriceRangeChart({ data }: Props) {
	return (
		<div
			className="animate-[rise-in_700ms_cubic-bezier(0.16,1,0.3,1)_both] rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-[4px]"
			style={{ animationDelay: '700ms' }}
		>
			<h3 className="mb-5 text-[0.69rem] font-bold tracking-[0.16em] text-[var(--kicker)] uppercase">
				Price Range Distribution
			</h3>
			<ResponsiveContainer width="100%" height={300}>
				<BarChart data={data} margin={{ left: 8, right: 16, top: 8, bottom: 0 }}>
					<CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
					<XAxis dataKey="range" tick={{ fontSize: 11, fill: 'var(--sea-ink)' }} axisLine={false} tickLine={false} />
					<YAxis
						tick={{ fontSize: 11, fill: 'var(--sea-ink-soft)' }}
						axisLine={false}
						tickLine={false}
						allowDecimals={false}
					/>
					<Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--line)' }} />
					<Bar dataKey="count" fill="#e8924a" radius={[6, 6, 0, 0]} barSize={28} />
				</BarChart>
			</ResponsiveContainer>
		</div>
	)
}
