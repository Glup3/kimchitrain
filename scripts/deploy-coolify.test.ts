import { execFile } from 'node:child_process'
import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { promisify } from 'node:util'

import { expect, it } from 'vitest'

const exec = promisify(execFile)

it.each(['finished', 'failed', 'unauthorized', 'missing UUID'] as const)(
	'handles the Coolify POST deployment API: %s',
	async (result) => {
		const requests: string[] = []
		const server = createServer((request, response) => {
			requests.push(`${request.method} ${request.url}`)
			response.setHeader('Content-Type', 'application/json')
			if (request.headers.authorization !== 'Bearer test-token') {
				response.writeHead(401).end('{}')
			} else if (request.url === '/api/v1/deploy?uuid=test-app') {
				if (request.method !== 'POST') {
					response.writeHead(405).end('{"message":"This endpoint has changed to a POST request."}')
				} else if (result === 'unauthorized') {
					response.writeHead(401).end('{"message":"Unauthenticated."}')
				} else {
					response.end(
						JSON.stringify({ deployments: result === 'missing UUID' ? [] : [{ deployment_uuid: 'test-deploy' }] }),
					)
				}
			} else if (request.url === '/api/v1/deployments/test-deploy') {
				response.end(JSON.stringify({ status: result }))
			} else {
				response.writeHead(404).end('{}')
			}
		})
		await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
		try {
			const deployment = exec('bash', ['scripts/deploy-coolify.sh'], {
				env: {
					...process.env,
					COOLIFY_URL: `http://127.0.0.1:${(server.address() as AddressInfo).port}/`,
					COOLIFY_TOKEN: 'test-token',
					COOLIFY_APP_UUID: 'test-app',
					TIMEOUT: '2',
					INTERVAL: '1',
				},
			})
			if (result === 'finished') {
				await expect(deployment).resolves.toMatchObject({ stdout: expect.stringContaining('Deploy succeeded') })
			} else {
				const message = {
					failed: 'Deploy failed',
					unauthorized: 'Failed to start deployment:',
					'missing UUID': 'Coolify did not return a deployment UUID',
				}[result]
				await expect(deployment).rejects.toMatchObject({
					code: 1,
					[result === 'failed' ? 'stdout' : 'stderr']: expect.stringContaining(message),
				})
			}
			expect(requests).toEqual([
				'POST /api/v1/deploy?uuid=test-app',
				...(result === 'finished' || result === 'failed' ? ['GET /api/v1/deployments/test-deploy'] : []),
			])
		} finally {
			await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())))
		}
	},
)
