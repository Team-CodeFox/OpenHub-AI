import express from 'express'
import { generateFlowchart, testFlowchart } from '../controllers/flowchartController.js'

const router = express.Router()

// Debug middleware
router.use((req, res, next) => {
  console.log(`Flowchart route hit: ${req.method} ${req.path}`)
  next()
})

// Test endpoint
router.get('/test', testFlowchart)

// Generate flowchart data for a repository
router.get('/', generateFlowchart)

export default router
