import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import githubRoutes from './routes/github.js'
import learnRoutes from './routes/learn.js'
import { generateFlowchart, testFlowchart } from './controllers/flowchartController.js'

// Load environment variables
dotenv.config()

const app = express()

// CORS configuration - allow both localhost:3000 and localhost:3001
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5001', process.env.FRONTEND_URL].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(cookieParser())
app.use(express.json())

// Debug middleware
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.path}`)
  next()
})

// Flowchart routes (register first)
app.get('/api/flowchart/test', testFlowchart)
app.get('/api/flowchart', generateFlowchart)
app.get('/api/flowchart/simple', (req, res) => {
  res.json({ message: 'Simple flowchart test works!' })
})

app.use('/auth', authRoutes)
app.use('/api/github', githubRoutes)
app.use('/api/learn', learnRoutes)

// Debug: Log all routes
console.log('Registered routes:')
console.log('- /auth')
console.log('- /api/github')
console.log('- /api/learn')
console.log('- /api/flowchart/test')
console.log('- /api/flowchart')

// Test endpoint to verify frontend connectivity
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Backend is working!', 
    timestamp: new Date().toISOString(),
    aiStatus: 'OpenRouter GPT-4o integration active'
  })
})

// Simple flowchart test
app.get('/api/flowchart/simple', (req, res) => {
  res.json({ 
    message: 'Flowchart API is working!', 
    timestamp: new Date().toISOString()
  })
})

const PORT = process.env.PORT || 5001
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
})