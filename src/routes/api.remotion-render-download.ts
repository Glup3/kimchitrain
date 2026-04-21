import { spawn } from 'node:child_process'
import { readFile, unlink } from 'node:fs/promises'
import path from 'node:path'

import { createFileRoute } from '@tanstack/react-router'

const RENDER_SCRIPT = path.resolve(process.cwd(), 'scripts/render-remotion.mjs')

interface RenderScriptResult {
	filePath: string
	filename: string
}

function runRenderScript() {
	return new Promise<RenderScriptResult>((resolve, reject) => {
		const child = spawn(process.execPath, [RENDER_SCRIPT], {
			cwd: process.cwd(),
			env: process.env,
			stdio: ['ignore', 'pipe', 'pipe'],
		})

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

export const Route = createFileRoute('/api/remotion-render-download')({
	server: {
		handlers: {
			GET: async () => {
				const artifact = await runRenderScript()
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
