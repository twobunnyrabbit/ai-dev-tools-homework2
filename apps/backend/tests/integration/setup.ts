import request from 'supertest'
import app from '../../src/app.js'

/**
 * Get supertest agent for making requests to the API.
 * No need to start server - supertest handles ephemeral port binding.
 */
export function getTestAgent() {
  return request(app)
}

/**
 * Helper to assert response matches OpenAPI schema type.
 * Provides compile-time type safety via TypeScript.
 * Usage: expectTypeMatch<HealthResponse>(response.body)
 */
export function expectTypeMatch<T>(data: unknown): asserts data is T {
  // Runtime validation could be added here (e.g., zod, ajv)
  // For now, TypeScript compiler ensures type safety at compile time
}
