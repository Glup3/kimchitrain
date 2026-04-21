import { mkdir } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { bundle } from '@remotion/bundler'
import { renderMedia, selectComposition } from '@remotion/renderer'

const ENTRY_POINT = path.resolve(process.cwd(), 'src/remotion/index.ts')
const RENDER_DIR = path.join(os.tmpdir(), 'kimchitrain-remotion-renders')

async function main() {
	await mkdir(RENDER_DIR, { recursive: true })

	const payload = JSON.parse(process.argv[2] ?? '{}')
	const compositionId = payload.compositionId ?? 'SimpleDemo'
	const inputProps = payload.inputProps ?? {}
	const filenamePrefix =
		compositionId === 'OrderSummaryVideo' ? `${inputProps.order?.id ?? 'order'}-summary` : 'simple-demo'
	const filename = `${filenamePrefix}-${Date.now()}.mp4`
	const outputLocation = path.join(RENDER_DIR, filename)
	const serveUrl = await bundle({
		entryPoint: ENTRY_POINT,
	})
	const composition = await selectComposition({
		serveUrl,
		id: compositionId,
		inputProps,
		logLevel: 'error',
	})

	await renderMedia({
		serveUrl,
		composition,
		codec: 'h264',
		outputLocation,
		overwrite: true,
		inputProps,
		logLevel: 'error',
	})

	process.stdout.write(
		JSON.stringify({
			filePath: outputLocation,
			filename,
		}),
	)
}

main().catch((error) => {
	const message = error instanceof Error ? (error.stack ?? error.message) : String(error)
	process.stderr.write(message)
	process.exit(1)
})
