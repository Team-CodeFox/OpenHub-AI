import express from 'express'
import { generateFileDescriptions, checkAIServices } from '../controllers/aiController.js'

const router = express.Router()

// Generate AI descriptions for files
router.post('/descriptions', generateFileDescriptions)

// Check AI services health
router.get('/health', checkAIServices)

export default router
