import axios from 'axios'

// AI Description generation using Gemini API
export const generateFileDescriptions = async (req, res) => {
  try {
    const { files } = req.body
    
    if (!files || !Array.isArray(files)) {
      return res.status(400).json({ 
        error: 'Files array is required' 
      })
    }

    const descriptions = {}
    
    // Process files in batches to avoid rate limiting
    const batchSize = 5
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (file) => {
        try {
          const description = await generateSingleFileDescription(file)
          return { path: file.path, description }
        } catch (error) {
          console.error(`Error generating description for ${file.path}:`, error.message)
          return { path: file.path, description: getFallbackDescription(file) }
        }
      })
      
      const batchResults = await Promise.all(batchPromises)
      batchResults.forEach(result => {
        descriptions[result.path] = result.description
      })
      
      // Small delay between batches to respect rate limits
      if (i + batchSize < files.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    res.json({
      success: true,
      descriptions,
      totalProcessed: files.length
    })
    
  } catch (error) {
    console.error('Error generating file descriptions:', error)
    res.status(500).json({ 
      error: 'Failed to generate AI descriptions',
      details: error.message 
    })
  }
}

// Generate description for a single file
const generateSingleFileDescription = async (file) => {
  const geminiApiKey = process.env.VITE_GEMINI_API_KEY || 'AIzaSyBlY6dGU0u7iBlHle52xkat64VrNKKldL8'
  
  if (!geminiApiKey) {
    console.warn('Gemini API key not found, using fallback descriptions')
    return getFallbackDescription(file)
  }

  try {
    // Try to get file content for better analysis
    let fileContent = ''
    try {
      const fs = await import('fs').then(m => m.promises)
      const path = await import('path')
      
      // Construct file path - you might need to adjust this based on your setup
      const filePath = path.join(process.cwd(), '..', 'Frontend', file.path)
      if (await fs.access(filePath).then(() => true).catch(() => false)) {
        const content = await fs.readFile(filePath, 'utf8')
        // Limit content to first 500 characters to avoid token limits
        fileContent = content.substring(0, 500)
      }
    } catch (error) {
      console.log(`Could not read file content for ${file.path}:`, error.message)
    }

    const prompt = `Analyze this code file and provide a clear, simple description (2-3 sentences max) explaining what this file does.

File: ${file.name}
Type: ${file.type}
Path: ${file.path}
${fileContent ? `\nFile Content (first 500 chars):\n${fileContent}` : ''}

Write a simple, easy-to-understand description that explains:
1. What this file does in simple words
2. Why it's important in the project
3. What a developer would find inside

Use simple language, avoid technical jargon. Keep it under 80 words. Make it helpful for someone trying to understand the codebase quickly.`

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 150
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    )

    if (response.data && response.data.candidates && response.data.candidates[0]) {
      const generatedText = response.data.candidates[0].content.parts[0].text
      return generatedText.trim()
    } else {
      throw new Error('Invalid response from Gemini API')
    }
    
  } catch (error) {
    console.error(`Gemini API error for ${file.path}:`, error.message)
    
    // Try alternative AI service if Gemini fails
    if (error.response?.status === 429 || error.code === 'ECONNABORTED') {
      return await tryAlternativeAI(file)
    }
    
    throw error
  }
}

// Try alternative AI service (xAI Grok)
const tryAlternativeAI = async (file) => {
  const xaiApiKey = process.env.XAI_API_KEY || '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'
  
  if (!xaiApiKey) {
    return getFallbackDescription(file)
  }

  try {
    const prompt = `Analyze this code file and provide a clear, simple description (2-3 sentences max) explaining what this file does.

File: ${file.name}
Type: ${file.type}
Path: ${file.path}

Write a simple, easy-to-understand description that explains:
1. What this file does in simple words
2. Why it's important in the project
3. What a developer would find inside

Use simple language, avoid technical jargon. Keep it under 80 words. Make it helpful for someone trying to understand the codebase quickly.`

    const response = await axios.post(
      'https://api.x.ai/v1/chat/completions',
      {
        model: 'grok-beta',
        messages: [{
          role: 'user',
          content: prompt
        }],
        max_tokens: 150,
        temperature: 0.3
      },
      {
        headers: {
          'Authorization': `Bearer ${xaiApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    )

    if (response.data && response.data.choices && response.data.choices[0]) {
      return response.data.choices[0].message.content.trim()
    }
    
  } catch (error) {
    console.error(`xAI API error for ${file.path}:`, error.message)
  }
  
  return getFallbackDescription(file)
}

// Fallback description generator with more specific descriptions
const getFallbackDescription = (file) => {
  const fileName = file.name.toLowerCase()
  const fileType = file.type?.toLowerCase()
  const path = file.path?.toLowerCase() || ''
  
  // Smart fallback descriptions based on file patterns
  if (fileName.includes('app.jsx') || fileName.includes('app.js')) {
    return `Main app file that starts everything. This is where the whole application begins and connects all the different parts together.`
  }
  
  if (fileName.includes('index.jsx') || fileName.includes('index.js')) {
    return `Starting point of the app. This file tells the browser to show the main application and sets up everything needed to run.`
  }
  
  if (fileName.includes('navbar') || fileName.includes('nav')) {
    return `Navigation bar that shows menu links and helps users move around the website. Contains the main navigation buttons.`
  }
  
  if (fileName.includes('footer')) {
    return `Bottom section of the website with links and information. Usually contains contact details and additional navigation.`
  }
  
  if (fileName.includes('hero')) {
    return `Main banner section that shows the most important content. Usually the first thing visitors see with big text and images.`
  }
  
  if (fileName.includes('project')) {
    return `Shows project information and portfolio items. Displays work examples and project details in an organized way.`
  }
  
  if (fileName.includes('animation') || fileName.includes('effect')) {
    return `Adds cool visual effects and smooth movements to the website. Makes the interface more engaging and interactive.`
  }
  
  if (fileName.includes('loading') || fileName.includes('spinner')) {
    return `Shows a loading spinner or progress bar when the app is working. Gives users feedback that something is happening.`
  }
  
  if (fileName.includes('blur') || fileName.includes('background')) {
    return `Creates visual effects like blur or special backgrounds. Makes the website look more modern and polished.`
  }
  
  if (fileName.includes('controller') || path.includes('/controllers/')) {
    return `Controller file handling API endpoints and business logic. Manages data flow between frontend and backend services.`
  }
  
  if (fileName.includes('route') || path.includes('/routes/')) {
    return `Route definition file mapping URLs to controller functions. Defines API endpoints and their handlers.`
  }
  
  if (fileName.includes('model') || path.includes('/models/')) {
    return `Data model file defining database schema and data structures. Handles data validation and relationships.`
  }
  
  if (fileName.includes('component') || path.includes('/components/')) {
    return `React component file providing reusable UI elements. Encapsulates functionality and styling for user interface.`
  }
  
  if (fileName.includes('page') || path.includes('/pages/')) {
    return `Page component file defining a specific route in the application. Handles page-level logic and layout.`
  }
  
  if (fileName.includes('hook') || path.includes('/hooks/')) {
    return `Custom React hook file providing reusable stateful logic. Encapsulates component behavior for reuse.`
  }
  
  if (fileName.includes('util') || path.includes('/utils/')) {
    return `Utility file containing helper functions and common operations. Provides shared functionality across the application.`
  }
  
  if (fileName.includes('config') || fileName.includes('package.json')) {
    return `Configuration file defining project settings and dependencies. Manages build tools and environment setup.`
  }
  
  if (fileType === 'css' || fileType === 'scss') {
    return `Style file defining visual appearance and layout. Contains CSS rules for component styling and responsive design.`
  }
  
  if (fileType === 'javascript' || fileType === 'typescript') {
    return `JavaScript/TypeScript file containing application logic and functionality. Implements core features and business rules.`
  }
  
  if (fileType === 'json') {
    return `JSON configuration file storing structured data and settings. Used for configuration and data exchange.`
  }
  
  if (fileName.includes('test') || path.includes('/test/')) {
    return `Test file containing automated tests for application functionality. Ensures code quality and prevents regressions.`
  }
  
  if (fileName.includes('readme') || fileName.includes('md')) {
    return `Documentation file providing project information and usage instructions. Contains setup guides and API references.`
  }
  
  // Generic fallback
  return `Code file implementing specific functionality within the application architecture. Contains business logic and feature implementation.`
}

// Health check for AI services
export const checkAIServices = async (req, res) => {
  try {
    const services = {
      gemini: false,
      xai: false
    }
    
    // Check Gemini
    if (process.env.VITE_GEMINI_API_KEY) {
      try {
        await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.VITE_GEMINI_API_KEY}`,
          {
            contents: [{
              parts: [{ text: 'Hello' }]
            }]
          },
          { timeout: 5000 }
        )
        services.gemini = true
      } catch (error) {
        console.log('Gemini service unavailable:', error.message)
      }
    }
    
    // Check xAI
    const xaiKey = process.env.XAI_API_KEY || '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'
    if (xaiKey) {
      try {
        await axios.post(
          'https://api.x.ai/v1/chat/completions',
          {
            model: 'grok-beta',
            messages: [{ role: 'user', content: 'Hello' }],
            max_tokens: 10
          },
          {
            headers: { 'Authorization': `Bearer ${xaiKey}` },
            timeout: 5000
          }
        )
        services.xai = true
      } catch (error) {
        console.log('xAI service unavailable:', error.message)
      }
    }
    
    res.json({
      success: true,
      services,
      available: Object.values(services).some(Boolean)
    })
    
  } catch (error) {
    res.status(500).json({
      error: 'Failed to check AI services',
      details: error.message
    })
  }
}
