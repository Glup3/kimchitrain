import { createFileRoute } from '@tanstack/react-router'
import { Film, LoaderCircle } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/remotion-export')({ component: RemotionExportPage })

function RemotionExportPage() {
	const [isRendering, setIsRendering] = useState(false)

	function handleDownload() {
		setIsRendering(true)
		window.location.href = '/api/remotion-render-download'
		window.setTimeout(() => {
			setIsRendering(false)
		}, 1500)
	}

	return (
		<div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,rgba(79,184,178,0.2),transparent_28%),linear-gradient(135deg,#07131f_0%,#0b1826_55%,#071019_100%)] px-6 py-16 text-white">
			<div className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:36px_36px] [background-position:center] opacity-40" />
			<div className="relative w-full max-w-xl rounded-[32px] border border-white/10 bg-white/8 p-8 text-center shadow-[0_32px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl md:p-12">
				<div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(123,241,168,0.16)] text-[var(--palm)] shadow-[0_0_40px_rgba(123,241,168,0.22)]">
					<Film size={28} strokeWidth={2.2} />
				</div>
				<p className="text-xs font-semibold tracking-[0.35em] text-white/55 uppercase">Remotion Render</p>
				<h1 className="mt-4 font-['Syne',sans-serif] text-4xl font-bold tracking-tight text-white md:text-5xl">
					Export the demo animation
				</h1>
				<p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/72 md:text-base">
					Click once to render the <span className="font-semibold text-white">SimpleDemo</span> composition on the
					server and download it as an MP4.
				</p>
				<button
					type="button"
					onClick={handleDownload}
					disabled={isRendering}
					className="mt-8 inline-flex min-w-64 cursor-pointer items-center justify-center gap-3 rounded-full border-0 bg-[linear-gradient(135deg,var(--lagoon),var(--palm))] px-6 py-4 text-base font-semibold text-slate-950 shadow-[0_18px_45px_rgba(79,184,178,0.35)] transition hover:scale-[1.02] hover:brightness-110 disabled:cursor-wait disabled:opacity-80 disabled:hover:scale-100"
				>
					{isRendering ? <LoaderCircle className="animate-spin" size={18} /> : <Film size={18} />}
					{isRendering ? 'Starting download…' : 'Render & download MP4'}
				</button>
				<p className="mt-4 text-xs tracking-wide text-white/45 uppercase">Usually takes a few seconds</p>
			</div>
		</div>
	)
}
