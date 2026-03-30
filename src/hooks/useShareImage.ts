import { toPng } from 'html-to-image'
import { useCallback, useRef, useState } from 'react'

export function useShareImage() {
	const shareRef = useRef<HTMLDivElement>(null)
	const [copied, setCopied] = useState(false)

	const copyImage = useCallback(async () => {
		const el = shareRef.current
		if (!el) return

		el.style.position = 'fixed'
		el.style.left = '0'
		el.style.top = '0'
		el.style.zIndex = '-1'

		await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))

		try {
			const dataUrl = await toPng(el, {
				pixelRatio: 2,
				backgroundColor: '#faf9f7',
			})

			const res = await fetch(dataUrl)
			const blob = await res.blob()

			await navigator.clipboard.write([
				new ClipboardItem({
					'image/png': blob,
				}),
			])

			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		} finally {
			el.style.position = 'fixed'
			el.style.left = '-9999px'
			el.style.top = '0'
			el.style.zIndex = '-1'
		}
	}, [])

	return { shareRef, copyImage, copied }
}
