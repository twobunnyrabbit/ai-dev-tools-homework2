import { Router } from 'express'
import { getHealth } from '../controllers/health.controller.js'
import sessionRoutes from './session.routes.js'

const router = Router()

router.get('/health', getHealth)
router.use('/sessions', sessionRoutes)

export default router
