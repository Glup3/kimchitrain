import { spawn } from 'node:child_process'
import { readFile, unlink } from 'node:fs/promises'
import path from 'node:path'

import { createFileRoute } from '@tanstack/react-router'

import { getOrderSummaryVideoProps } from '#/remotion/getOrderSummaryVideoProps'
import type { OrderSummaryVideoProps } from '#/remotion/OrderSummaryVideo'

const RENDER_SCRIPT = path.resolve(process.cwd(), 'scripts/render-remotion.mjs')

interface RenderScriptResult {
	filePath: string
	filename: string
}

function numberParam(value: string | null, fallback: number) {
	if (!value) return fallback
	const parsed = Number(value)
	return Number.isFinite(parsed) ? parsed : fallback
}

function booleanParam(value: string | null, fallback: boolean) {
	if (value == null) return fallback
	return value === 'true'
}

function runRenderScript(inputProps: OrderSummaryVideoProps) {
	return new Promise<RenderScriptResult>((resolve, reject) => {
		const child = spawn(
			process.execPath,
			[RENDER_SCRIPT, JSON.stringify({ compositionId: 'OrderSummaryVideo', inputProps })],
			{
				cwd: process.cwd(),
				env: process.env,
				stdio: ['ignore', 'pipe', 'pipe'],
			},
		)

		let stdout = ''
		let stderr = ''

		child.stdout.on('data', (chunk) => {
			stdout += chunk.toString()
		})

		child.stderr.on('data', (chunk) => {
			stderr += chunk.toString()
		})

		child.on('error', (error) => {
			reject(error)
		})

		child.on('close', (code) => {
			if (code !== 0) {
				reject(new Error(stderr || `Render process exited with code ${code ?? 'unknown'}`))
				return
			}

			try {
				resolve(JSON.parse(stdout) as RenderScriptResult)
			} catch {
				reject(new Error(`Failed to parse render output: ${stdout || stderr}`))
			}
		})
	})
}

export const Route = createFileRoute('/api/orders/$orderId/summary-video')({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const url = new URL(request.url)
				const pathParts = url.pathname.split('/').filter(Boolean)
				const orderId = pathParts[pathParts.length - 2]

				if (!orderId) {
					return new Response('Missing order ID', { status: 400 })
				}

				const inputProps = await getOrderSummaryVideoProps(orderId, {
					title: url.searchParams.get('title') ?? undefined,
					animation: {
						introFrames: numberParam(url.searchParams.get('introFrames'), 24),
						itemStaggerFrames: numberParam(url.searchParams.get('itemStaggerFrames'), 6),
						personStaggerFrames: numberParam(url.searchParams.get('personStaggerFrames'), 8),
						highlightPerson: url.searchParams.get('highlightPerson') ?? undefined,
						showSettled: booleanParam(url.searchParams.get('showSettled'), true),
					},
					theme: {
						accent: url.searchParams.get('accent') ?? undefined,
						accentSecondary: url.searchParams.get('accentSecondary') ?? undefined,
						background: url.searchParams.get('background') ?? undefined,
						surface: url.searchParams.get('surface') ?? undefined,
						foreground: url.searchParams.get('foreground') ?? undefined,
						muted: url.searchParams.get('muted') ?? undefined,
					},
				})
				const artifact = await runRenderScript(inputProps)
				const bytes = await readFile(artifact.filePath).catch(() => null)

				if (!bytes) {
					return new Response('Rendered file is missing', { status: 404 })
				}

				await unlink(artifact.filePath).catch(() => {})

				return new Response(bytes, {
					status: 200,
					headers: {
						'Content-Type': 'video/mp4',
						'Content-Disposition': `attachment; filename="${artifact.filename}"`,
						'Cache-Control': 'no-store',
					},
				})
			},
		},
	},
})
