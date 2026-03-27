function pad(n: number): string {
	return String(n).padStart(2, '0')
}

export function formatOrderDate(ts: number): string {
	const d = new Date(ts)
	const now = new Date()
	const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`

	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
	const target = new Date(d.getFullYear(), d.getMonth(), d.getDate())
	const diffDays = (today.getTime() - target.getTime()) / 86_400_000

	if (diffDays < 1) return `Today, ${time}`
	if (diffDays < 2) return `Yesterday, ${time}`

	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
	const monthDay = `${months[d.getMonth()]} ${d.getDate()}`

	if (d.getFullYear() === now.getFullYear()) return `${monthDay}, ${time}`
	return `${monthDay} ${d.getFullYear()}, ${time}`
}
