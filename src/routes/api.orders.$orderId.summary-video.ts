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

function formatDuration(durationMs: number) {
	if (durationMs < 1000) {
		return `${durationMs}ms`
	}

	const seconds = durationMs / 1000
	if (seconds < 60) {
		return `${seconds.toFixed(1)}s`
	}

	const minutes = Math.floor(seconds / 60)
	const remainingSeconds = seconds % 60
	return `${minutes}m ${remainingSeconds.toFixed(1)}s`
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
			POST: async ({ params }) => {
				const orderId = params.orderId
				const startedAt = Date.now()

				console.log(`[summary-video] render started for order ${orderId}`)

				try {
					const inputProps = await getOrderSummaryVideoProps(orderId)
					const artifact = await runRenderScript(inputProps)
					const bytes = await readFile(artifact.filePath).catch(() => null)

					if (!bytes) {
						console.log(
							`[summary-video] render finished for order ${orderId} in ${formatDuration(Date.now() - startedAt)}, but file was missing`,
						)
						return new Response('Rendered file is missing', { status: 404 })
					}

					await unlink(artifact.filePath).catch(() => {})

					console.log(
						`[summary-video] render finished for order ${orderId} in ${formatDuration(Date.now() - startedAt)}`,
					)

					return new Response(bytes, {
						status: 200,
						headers: {
							'Content-Type': 'video/mp4',
							'Content-Disposition': `attachment; filename="${artifact.filename}"`,
							'Cache-Control': 'no-store',
						},
					})
				} catch (error) {
					console.error(
						`[summary-video] render failed for order ${orderId} after ${formatDuration(Date.now() - startedAt)}`,
						error,
					)
					throw error
				}
			},
		},
	},
})
