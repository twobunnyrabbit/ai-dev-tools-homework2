import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import { readFileSync } from 'fs'
import { load } from 'js-yaml'
import { resolve } from 'path'
import apiRoutes from './routes/api.routes.js'
import { errorHandler } from './middleware/error.middleware.js'

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Load OpenAPI spec
const openapiPath = resolve(process.cwd(), 'openapi.yaml')
const openapiDoc = load(readFileSync(openapiPath, 'utf8'))

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiDoc as any))

// Routes
app.use('/api', apiRoutes)

// Error handling
app.use(errorHandler)

export default app
