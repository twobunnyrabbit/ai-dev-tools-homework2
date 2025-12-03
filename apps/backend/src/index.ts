import dotenv from 'dotenv'
import { createServer } from 'http'
import app from './app.js'
import { initializeSocket } from './socket/index.js'
import { sessionCleanupService } from './services/session-cleanup.service.js'

dotenv.config()

const PORT = process.env.PORT || 3000

// Create HTTP server
const httpServer = createServer(app)

// Initialize Socket.io
const io = initializeSocket(httpServer)

// Start session cleanup service
sessionCleanupService.start()

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`Socket.io server initialized`)
  console.log(`Session cleanup service started`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...')
  sessionCleanupService.stop()
  httpServer.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...')
  sessionCleanupService.stop()
  httpServer.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})
