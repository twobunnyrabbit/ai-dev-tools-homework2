import dotenv from 'dotenv'
import { createServer } from 'http'
import app from './app.js'
import { initializeSocket } from './socket/index.js'

dotenv.config()

const PORT = process.env.PORT || 3000

// Create HTTP server
const httpServer = createServer(app)

// Initialize Socket.io
const io = initializeSocket(httpServer)

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`Socket.io server initialized`)
})
