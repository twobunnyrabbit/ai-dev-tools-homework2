# API Integration Test Patterns

This directory contains integration tests for the backend API endpoints using Vitest + supertest.

## Running Tests

```bash
# Run all tests
pnpm test

# Watch mode (re-runs on file changes)
pnpm test:watch

# Coverage report
pnpm test:coverage

# From root directory
pnpm test:backend
```

## Test Patterns

### Basic GET Request

```typescript
import { getTestAgent } from './setup.js'
import type { components } from '@repo/api-types'

type MyResponse = components['schemas']['MyResponse']

describe('GET /api/resource', () => {
  it('should return resource', async () => {
    const response = await getTestAgent()
      .get('/api/resource')
      .expect(200)
      .expect('Content-Type', /json/)

    const body = response.body as MyResponse
    expect(body.id).toBeDefined()
    expect(body.name).toBe('expected name')
  })
})
```

### POST with Body

```typescript
it('should create resource', async () => {
  const payload = {
    name: 'test',
    description: 'test description'
  }

  const response = await getTestAgent()
    .post('/api/resources')
    .send(payload)
    .set('Content-Type', 'application/json')
    .expect(201)

  const body = response.body as CreateResourceResponse
  expect(body.id).toBeDefined()
  expect(body.name).toBe(payload.name)
})
```

### PUT/PATCH Updates

```typescript
it('should update resource', async () => {
  const resourceId = 'abc123'
  const updates = { name: 'updated name' }

  await getTestAgent()
    .put(`/api/resources/${resourceId}`)
    .send(updates)
    .expect(200)

  // Verify update
  const response = await getTestAgent()
    .get(`/api/resources/${resourceId}`)
    .expect(200)

  expect(response.body.name).toBe(updates.name)
})
```

### DELETE Requests

```typescript
it('should delete resource', async () => {
  const resourceId = 'abc123'

  await getTestAgent()
    .delete(`/api/resources/${resourceId}`)
    .expect(204)

  // Verify deletion
  await getTestAgent()
    .get(`/api/resources/${resourceId}`)
    .expect(404)
})
```

### Error Handling

```typescript
describe('Error scenarios', () => {
  it('should return 404 for missing resource', async () => {
    await getTestAgent()
      .get('/api/resources/nonexistent')
      .expect(404)
  })

  it('should return 400 for invalid input', async () => {
    const invalidPayload = { name: '' } // empty name

    const response = await getTestAgent()
      .post('/api/resources')
      .send(invalidPayload)
      .expect(400)

    expect(response.body.error).toBeDefined()
  })

  it('should return 401 for unauthenticated request', async () => {
    await getTestAgent()
      .get('/api/protected')
      .expect(401)
  })

  it('should return 403 for unauthorized access', async () => {
    await getTestAgent()
      .get('/api/admin/users')
      .set('Authorization', 'Bearer user-token')
      .expect(403)
  })
})
```

### Testing Headers

```typescript
describe('Authentication', () => {
  const validToken = 'Bearer eyJhbGciOi...'

  it('should require authorization header', async () => {
    await getTestAgent()
      .get('/api/protected')
      .expect(401)
  })

  it('should accept valid token', async () => {
    const response = await getTestAgent()
      .get('/api/protected')
      .set('Authorization', validToken)
      .expect(200)

    expect(response.body.data).toBeDefined()
  })

  it('should return custom headers', async () => {
    const response = await getTestAgent()
      .get('/api/resource')
      .expect(200)

    expect(response.headers['x-rate-limit-remaining']).toBeDefined()
  })
})
```

### Query Parameters

```typescript
it('should filter by query params', async () => {
  const response = await getTestAgent()
    .get('/api/resources')
    .query({ status: 'active', limit: 10, offset: 0 })
    .expect(200)

  const body = response.body as PaginatedResponse
  expect(body.items).toHaveLength(10)
  expect(body.items.every(item => item.status === 'active')).toBe(true)
})

it('should handle complex query params', async () => {
  await getTestAgent()
    .get('/api/search')
    .query({
      q: 'test query',
      tags: ['typescript', 'testing'],
      sort: 'date:desc'
    })
    .expect(200)
})
```

### Testing with Type Safety

```typescript
import type { components, operations } from '@repo/api-types'

// Extract request/response types from OpenAPI spec
type GetResourceParams = operations['getResource']['parameters']['path']
type GetResourceResponse = operations['getResource']['responses']['200']['content']['application/json']

it('should return typed response', async () => {
  const params: GetResourceParams = { id: 'abc123' }

  const response = await getTestAgent()
    .get(`/api/resources/${params.id}`)
    .expect(200)

  const body = response.body as GetResourceResponse
  // TypeScript now provides autocomplete and type checking
  expect(body.id).toBe(params.id)
  expect(body.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}/)
})
```

### Testing File Uploads

```typescript
import { resolve } from 'path'

it('should upload file', async () => {
  const filePath = resolve(__dirname, '../fixtures/test-file.pdf')

  const response = await getTestAgent()
    .post('/api/upload')
    .attach('file', filePath)
    .field('description', 'Test upload')
    .expect(201)

  expect(response.body.fileUrl).toBeDefined()
})
```

### Testing Pagination

```typescript
describe('Pagination', () => {
  it('should return paginated results', async () => {
    const response = await getTestAgent()
      .get('/api/resources')
      .query({ page: 1, limit: 20 })
      .expect(200)

    const body = response.body as PaginatedResponse
    expect(body.items).toHaveLength(20)
    expect(body.pagination.page).toBe(1)
    expect(body.pagination.total).toBeGreaterThan(0)
    expect(body.pagination.hasNext).toBeDefined()
  })
})
```

### Setup and Teardown

```typescript
import { beforeEach, afterEach, beforeAll, afterAll } from 'vitest'

describe('Resource API', () => {
  let testResourceId: string

  beforeAll(async () => {
    // One-time setup before all tests
    // e.g., seed database, start services
  })

  afterAll(async () => {
    // One-time cleanup after all tests
    // e.g., close connections, clean database
  })

  beforeEach(async () => {
    // Setup before each test
    const response = await getTestAgent()
      .post('/api/resources')
      .send({ name: 'test' })

    testResourceId = response.body.id
  })

  afterEach(async () => {
    // Cleanup after each test
    await getTestAgent()
      .delete(`/api/resources/${testResourceId}`)
  })

  it('should use test resource', async () => {
    const response = await getTestAgent()
      .get(`/api/resources/${testResourceId}`)
      .expect(200)

    expect(response.body.name).toBe('test')
  })
})
```

## Best Practices

1. **Use type-safe responses**: Always import types from `@repo/api-types` for compile-time safety
2. **Test error cases**: Don't just test happy paths - verify error handling
3. **Isolate tests**: Each test should be independent and not rely on other tests
4. **Use descriptive names**: Test names should clearly describe what they're testing
5. **Keep tests focused**: One assertion per test when possible
6. **Clean up resources**: Use afterEach/afterAll to clean up test data
7. **Use fixtures**: Store reusable test data in `tests/fixtures/`
8. **Mock external services**: Don't make real API calls to external services in tests
