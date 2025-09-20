import axios from 'axios'

export const testFlowchart = async (req, res) => {
  res.json({ 
    message: 'Flowchart API is working!', 
    timestamp: new Date().toISOString(),
    cookies: req.cookies
  })
}

export const generateFlowchart = async (req, res) => {
  try {
    const { full_name, path } = req.query
    
    if (!full_name) {
      return res.status(400).json({ error: 'Repository full name is required' })
    }

    const token = req.cookies.github_token
    if (!token) {
      console.warn('[generateFlowchart] Missing github_token cookie')
      return res.status(401).json({ error: 'Not authenticated: missing token cookie' })
    }

    // Get repository tree
    const treeResponse = await axios.get(`https://api.github.com/repos/${full_name}/git/trees/HEAD?recursive=1`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })

    const tree = treeResponse.data.tree
    const flowchartData = analyzeCodeStructure(tree, full_name)

    res.json({
      success: true,
      data: flowchartData
    })
  } catch (error) {
    const status = error.response?.status || 500
    const ghMessage = error.response?.data?.message
    console.error('Flowchart generation error:', status, ghMessage || error.message)
    res.status(status).json({ 
      error: 'Failed to generate flowchart',
      details: ghMessage || error.message 
    })
  }
}

const analyzeCodeStructure = (tree, repoName) => {
  const nodes = []
  const connections = []
  let nodeId = 0

  // Helper function to generate unique ID
  const generateId = () => `node_${++nodeId}`

  // Helper function to detect file type
  const getFileType = (path) => {
    if (!path || typeof path !== 'string') return 'file'
    const ext = path.split('.').pop()?.toLowerCase()
    const name = path.split('/').pop()?.toLowerCase()
    
    if (name === 'package.json') return 'config'
    if (name === 'readme.md') return 'documentation'
    if (ext === 'js' || ext === 'jsx') return 'javascript'
    if (ext === 'ts' || ext === 'tsx') return 'typescript'
    if (ext === 'css' || ext === 'scss') return 'style'
    if (ext === 'json') return 'config'
    if (ext === 'md') return 'documentation'
    if (ext === 'html') return 'markup'
    if (ext === 'py') return 'python'
    if (ext === 'java') return 'java'
    if (ext === 'go') return 'go'
    if (ext === 'rs') return 'rust'
    return 'file'
  }

  // Helper function to detect component type
  const getComponentType = (path, fileType) => {
    if (path.includes('/controllers/') || path.includes('/controller/')) return 'controller'
    if (path.includes('/routes/') || path.includes('/route/')) return 'route'
    if (path.includes('/models/') || path.includes('/model/')) return 'model'
    if (path.includes('/services/') || path.includes('/service/')) return 'service'
    if (path.includes('/utils/') || path.includes('/util/')) return 'utility'
    if (path.includes('/components/') || path.includes('/component/')) return 'component'
    if (path.includes('/pages/') || path.includes('/page/')) return 'page'
    if (path.includes('/hooks/') || path.includes('/hook/')) return 'hook'
    if (path.includes('/api/')) return 'api'
    if (path.includes('/middleware/')) return 'middleware'
    if (fileType === 'config') return 'configuration'
    if (fileType === 'documentation') return 'documentation'
    return 'file'
  }

  // Helper function to get technology stack
  const getTechnologies = (path, fileType) => {
    const techs = new Set()
    const lowerPath = path.toLowerCase()
    
    if (fileType === 'javascript' || fileType === 'jsx') {
      techs.add('JavaScript')
      if (lowerPath.includes('react') || lowerPath.includes('jsx')) techs.add('React')
      if (lowerPath.includes('next')) techs.add('Next.js')
      if (lowerPath.includes('node')) techs.add('Node.js')
    }
    if (fileType === 'typescript' || fileType === 'tsx') {
      techs.add('TypeScript')
      if (lowerPath.includes('react') || lowerPath.includes('tsx')) techs.add('React')
      if (lowerPath.includes('next')) techs.add('Next.js')
    }
    if (fileType === 'style') {
      if (lowerPath.includes('scss') || lowerPath.includes('sass')) techs.add('Sass')
      else techs.add('CSS')
    }
    if (lowerPath.includes('package.json')) techs.add('Node.js')
    if (lowerPath.includes('tailwind')) techs.add('TailwindCSS')
    if (lowerPath.includes('vite')) techs.add('Vite')
    if (lowerPath.includes('webpack')) techs.add('Webpack')
    
    return Array.from(techs)
  }

  // Create root node
  const rootNode = {
    id: 'root',
    type: 'root',
    label: repoName.split('/')[1] || 'Repository',
    description: 'Main Repository',
    path: '',
    technologies: [],
    position: { x: 400, y: 50 },
    size: { width: 200, height: 80 },
    level: 0
  }
  nodes.push(rootNode)

  // Validate tree data
  if (!Array.isArray(tree)) {
    console.error('Invalid tree data received from GitHub API')
    return { nodes: [], connections: [], metadata: { error: 'Invalid tree data' } }
  }

  // Group files by directory structure
  const directoryMap = new Map()
  const fileMap = new Map()

  tree.forEach(item => {
    if (!item || !item.path) return // Skip invalid items
    
    if (item.type === 'blob') {
      const pathParts = item.path.split('/')
      const fileName = pathParts.pop()
      const directory = pathParts.join('/')
      
      const fileType = getFileType(item.path)
      const componentType = getComponentType(item.path, fileType)
      const technologies = getTechnologies(item.path, fileType)
      
      const fileNode = {
        id: generateId(),
        type: 'file',
        label: fileName,
        description: `${componentType.charAt(0).toUpperCase() + componentType.slice(1)} file`,
        path: item.path,
        fileType,
        componentType,
        technologies,
        size: { width: 120, height: 50 },
        level: pathParts.length + 1
      }
      
      nodes.push(fileNode)
      fileMap.set(item.path, fileNode)
      
      // Track directory
      if (directory) {
        if (!directoryMap.has(directory)) {
          directoryMap.set(directory, [])
        }
        directoryMap.get(directory).push(fileNode)
      }
    }
  })

  // Create directory nodes and connections
  const processedDirs = new Set()
  
  directoryMap.forEach((files, dirPath) => {
    const pathParts = dirPath.split('/')
    const dirName = pathParts.pop()
    const parentDir = pathParts.join('/')
    
    const dirNode = {
      id: generateId(),
      type: 'directory',
      label: dirName,
      description: `${files.length} files`,
      path: dirPath,
      technologies: [...new Set(files.flatMap(f => f.technologies))],
      size: { width: 150, height: 60 },
      level: pathParts.length + 1
    }
    
    nodes.push(dirNode)
    processedDirs.add(dirPath)
    
    // Connect to parent directory or root
    if (parentDir && processedDirs.has(parentDir)) {
      const parentNode = nodes.find(n => n.path === parentDir && n.type === 'directory')
      if (parentNode) {
        connections.push({
          from: parentNode.id,
          to: dirNode.id,
          type: 'contains'
        })
      }
    } else {
      connections.push({
        from: 'root',
        to: dirNode.id,
        type: 'contains'
      })
    }
    
    // Connect files to directory
    files.forEach(file => {
      connections.push({
        from: dirNode.id,
        to: file.id,
        type: 'contains'
      })
    })
  })

  // Create service-level connections based on file relationships
  const serviceConnections = createServiceConnections(nodes, fileMap)
  connections.push(...serviceConnections)

  // Position nodes using a simple layout algorithm
  positionNodes(nodes, connections)

  return {
    nodes,
    connections,
    metadata: {
      totalFiles: fileMap.size,
      totalDirectories: processedDirs.size,
      technologies: [...new Set(nodes.flatMap(n => n.technologies))],
      generatedAt: new Date().toISOString()
    }
  }
}

const createServiceConnections = (nodes, fileMap) => {
  const connections = []
  
  // Find main entry points
  const entryPoints = nodes.filter(node => 
    node.path.includes('index.js') || 
    node.path.includes('main.js') || 
    node.path.includes('app.js') ||
    node.path.includes('server.js') ||
    node.path.includes('layout.jsx') ||
    node.path.includes('page.jsx')
  )
  
  // Find API endpoints
  const apiFiles = nodes.filter(node => 
    node.path.includes('/api/') || 
    node.path.includes('/routes/') ||
    node.path.includes('/controllers/')
  )
  
  // Find UI components
  const uiComponents = nodes.filter(node => 
    node.path.includes('/components/') ||
    node.path.includes('/ui/')
  )
  
  // Connect entry points to API files
  entryPoints.forEach(entry => {
    apiFiles.forEach(api => {
      if (entry.path !== api.path) {
        connections.push({
          from: entry.id,
          to: api.id,
          type: 'api'
        })
      }
    })
  })
  
  // Connect API files to UI components
  apiFiles.forEach(api => {
    uiComponents.forEach(ui => {
      connections.push({
        from: api.id,
        to: ui.id,
        type: 'data'
      })
    })
  })
  
  return connections
}

const positionNodes = (nodes, connections) => {
  const levels = new Map()
  
  // Group nodes by level
  nodes.forEach(node => {
    if (!levels.has(node.level)) {
      levels.set(node.level, [])
    }
    levels.get(node.level).push(node)
  })
  
  // Position nodes level by level
  let yOffset = 100
  const levelSpacing = 150
  
  for (let level = 0; level <= Math.max(...levels.keys()); level++) {
    const levelNodes = levels.get(level) || []
    const nodeSpacing = Math.max(200, 800 / levelNodes.length)
    let xOffset = 50
    
    levelNodes.forEach((node, index) => {
      node.position = {
        x: xOffset + (index * nodeSpacing),
        y: yOffset
      }
    })
    
    yOffset += levelSpacing
  }
}
