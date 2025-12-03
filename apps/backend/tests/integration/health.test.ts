import { describe, it, expect } from 'vitest'
import type { components } from '@repo/api-types'
import { getTestAgent } from './setup.js'

type HealthResponse = components['schemas']['HealthResponse']

describe('GET /api/health', () => {
  it('should return 200 with status ok', async () => {
    const response = await getTestAgent()
      .get('/api/health')
      .expect(200)
      .expect('Content-Type', /json/)

    const body = response.body as HealthResponse
    expect(body.status).toBe('ok')
    expect(body.timestamp).toBeDefined()
  })

  it('should return valid ISO-8601 timestamp', async () => {
    const response = await getTestAgent()
      .get('/api/health')
      .expect(200)

    const body = response.body as HealthResponse
    const timestamp = new Date(body.timestamp)

    // Verify timestamp is valid ISO-8601 format
    expect(timestamp.toISOString()).toBe(body.timestamp)

    // Verify timestamp is not in the future
    expect(timestamp.getTime()).toBeLessThanOrEqual(Date.now())
  })
})
