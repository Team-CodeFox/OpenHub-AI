'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  FileCode, 
  Folder, 
  GitBranch, 
  Database, 
  Server, 
  Globe, 
  Settings, 
  Users, 
  Lock, 
  Zap,
  ChevronRight,
  ChevronDown,
  Maximize2,
  Download,
  ThumbsUp,
  ThumbsDown,
  Plus,
  Minus,
  ArrowUp,
  ArrowDown,
  Bot,
  Code2,
  Layers,
  Workflow,
  X,
  List,

  Search,
  File,
  FolderOpen,
  FolderClosed,
  Sparkles

  Search

} from 'lucide-react'

export default function FlowchartView({ treeItems, repoInfo, detectedTechs, selectedFile, onFileSelect, repoFullName }) {
  const [expandedNodes, setExpandedNodes] = useState(new Set(['root']))
  const [selectedNode, setSelectedNode] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const [flowchartData, setFlowchartData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showFileDropdown, setShowFileDropdown] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)

  const [aiDescriptions, setAiDescriptions] = useState({})
  const [loadingDescriptions, setLoadingDescriptions] = useState(false)
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef(null)

  // Fetch AI descriptions for files
  const fetchAIDescriptions = async (files) => {
    setLoadingDescriptions(true)
    try {
      const response = await fetch('http://localhost:5001/api/ai/descriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ files })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setAiDescriptions(data.descriptions)
        }
      }
    } catch (error) {
      console.error('Error fetching AI descriptions:', error)
    } finally {
      setLoadingDescriptions(false)
    }
  }


  const containerRef = useRef(null)


  // Fetch flowchart data from backend
  useEffect(() => {
    if (!repoFullName) return

    const fetchFlowchartData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`http://localhost:5001/api/flowchart?full_name=${encodeURIComponent(repoFullName)}`, {
          credentials: 'include'
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.success) {
          setFlowchartData(data.data)

          // Fetch AI descriptions for files
          const files = data.data.nodes.filter(node => node.type === 'file').map(node => ({
            path: node.path,
            name: node.label,
            type: node.fileType
          }))
          if (files.length > 0) {
            fetchAIDescriptions(files)
          }

        } else {
          throw new Error(data.error || 'Failed to generate flowchart')
        }
      } catch (error) {
        console.error('Error fetching flowchart data:', error)
        // Don't set error state, just use fallback data
        console.log('Using fallback static flowchart data')
        setFlowchartData(generateStaticFlowchartData())
        setError(null) // Clear any previous errors
      } finally {
        setLoading(false)
      }
    }

    fetchFlowchartData()
  }, [repoFullName])

  // Generate static flowchart data as fallback
  const generateStaticFlowchartData = () => {
    const nodes = []
    const connections = []

    // Root node
    nodes.push({
      id: 'root',
      type: 'root',
      label: repoInfo?.name || 'OpenHub-AI',
      description: 'Main Repository',
      technologies: detectedTechs,
      position: { x: 400, y: 50 },
      size: { width: 200, height: 80 }
    })

    // Backend structure
    const backendNode = {
      id: 'backend',
      type: 'service',
      label: 'Backend',
      description: 'Node.js API Server',
      technologies: ['Node.js', 'Express'],
      position: { x: 150, y: 200 },
      size: { width: 150, height: 60 }
    }
    nodes.push(backendNode)
    connections.push({ from: 'root', to: 'backend', type: 'service' })

    // Frontend structure
    const frontendNode = {
      id: 'frontend',
      type: 'service',
      label: 'Frontend',
      description: 'Next.js Application',
      technologies: ['Next.js', 'React', 'TypeScript'],
      position: { x: 650, y: 200 },
      size: { width: 150, height: 60 }
    }
    nodes.push(frontendNode)
    connections.push({ from: 'root', to: 'frontend', type: 'service' })

    // Backend components
    const backendComponents = [
      { id: 'auth-controller', label: 'Auth Controller', description: 'User authentication & authorization', position: { x: 50, y: 320 } },
      { id: 'github-controller', label: 'GitHub Controller', description: 'GitHub API integration', position: { x: 150, y: 320 } },
      { id: 'learn-controller', label: 'Learn Controller', description: 'Learning resources & AI summaries', position: { x: 250, y: 320 } },
      { id: 'github-api', label: 'GitHub API Utils', description: 'GitHub API helper functions', position: { x: 50, y: 400 } },
      { id: 'issue-analyzer', label: 'Issue Analyzer', description: 'AI-powered issue analysis', position: { x: 150, y: 400 } },
      { id: 'tech-detect', label: 'Tech Detector', description: 'Technology stack detection', position: { x: 250, y: 400 } }
    ]

    backendComponents.forEach(comp => {
      nodes.push({
        ...comp,
        type: 'component',
        technologies: ['JavaScript'],
        size: { width: 120, height: 50 }
      })
      connections.push({ from: 'backend', to: comp.id, type: 'contains' })
    })

    // Frontend components
    const frontendComponents = [
      { id: 'app-layout', label: 'App Layout', description: 'Main application layout', position: { x: 550, y: 320 } },
      { id: 'explorer-page', label: 'Explorer Page', description: 'Code exploration interface', position: { x: 650, y: 320 } },
      { id: 'dashboard-page', label: 'Dashboard Page', description: 'User dashboard', position: { x: 750, y: 320 } },
      { id: 'auth-callback', label: 'Auth Callback', description: 'OAuth callback handler', position: { x: 550, y: 400 } },
      { id: 'ui-components', label: 'UI Components', description: 'Reusable UI components', position: { x: 650, y: 400 } },
      { id: 'hooks', label: 'Custom Hooks', description: 'React hooks & utilities', position: { x: 750, y: 400 } }
    ]

    frontendComponents.forEach(comp => {
      nodes.push({
        ...comp,
        type: 'component',
        technologies: ['React', 'TypeScript'],
        size: { width: 120, height: 50 }
      })
      connections.push({ from: 'frontend', to: comp.id, type: 'contains' })
    })

    // Data flow connections
    connections.push(
      { from: 'auth-controller', to: 'github-controller', type: 'data' },
      { from: 'github-controller', to: 'github-api', type: 'uses' },
      { from: 'github-controller', to: 'issue-analyzer', type: 'uses' },
      { from: 'learn-controller', to: 'tech-detect', type: 'uses' },
      { from: 'explorer-page', to: 'ui-components', type: 'uses' },
      { from: 'dashboard-page', to: 'ui-components', type: 'uses' },
      { from: 'auth-callback', to: 'auth-controller', type: 'api' },
      { from: 'explorer-page', to: 'github-controller', type: 'api' },
      { from: 'dashboard-page', to: 'learn-controller', type: 'api' }
    )

    return { nodes, connections }
  }

  const { nodes, connections } = flowchartData || generateStaticFlowchartData()

  // Get all files from tree structure for dropdown
  const getAllFiles = (items, parentPath = '') => {
    const files = []
    items.forEach(item => {
      if (item.type === 'file') {
        files.push({
          path: item.path,
          name: item.name,
          fullPath: parentPath ? `${parentPath}/${item.name}` : item.name
        })
      } else if (item.type === 'folder' && item.children) {
        files.push(...getAllFiles(item.children, item.path))
      }
    })
    return files
  }

  const allFiles = getAllFiles(treeItems)
  const filteredFiles = allFiles.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.path.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  // Handle scroll for flowchart navigation
  const handleScroll = (e) => {
    if (e.deltaY !== 0) {
      setPosition(prev => ({
        x: prev.x - e.deltaY * 0.5,
        y: prev.y
      }))
    }
  }

  // Handle horizontal scroll for flowchart navigation
  const handleWheel = (e) => {
    if (e.shiftKey && e.deltaY !== 0) {
      e.preventDefault()
      setPosition(prev => ({
        x: prev.x - e.deltaY * 0.5,
        y: prev.y
      }))
    }
  }


  // Handle mouse down for dragging
  const handleMouseDown = (e) => {
    if (e.target.tagName === 'svg' || e.target.tagName === 'rect') {
      setIsDraggingCanvas(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      })
      setLastPosition({ x: e.clientX, y: e.clientY })
    }
  }

  // Handle mouse move for dragging
  const handleMouseMove = (e) => {
    if (isDraggingCanvas) {
      const newX = e.clientX - dragStart.x
      const newY = e.clientY - dragStart.y
      setPosition({ x: newX, y: newY })
    }
  }

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setIsDraggingCanvas(false)
  }

  // Add cursor style based on drag state
  useEffect(() => {
    if (isDraggingCanvas) {
      document.body.style.cursor = 'grabbing'
    } else {
      document.body.style.cursor = 'default'
    }
    
    return () => {
      document.body.style.cursor = 'default'
    }
  }, [isDraggingCanvas])


  // Handle escape key for fullscreen
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }
    
    if (isFullscreen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isFullscreen])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showFileDropdown && !e.target.closest('.file-dropdown')) {
        setShowFileDropdown(false)
      }
    }
    
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showFileDropdown])


  const getNodeIcon = (type, isExpanded) => {
    switch (type) {
      case 'root': return <Layers className="w-5 h-5" />
      case 'directory': return isExpanded ? <FolderOpen className="w-5 h-5" /> : <FolderClosed className="w-5 h-5" />
      case 'file': return <File className="w-5 h-5" />

  const getNodeIcon = (type) => {
    switch (type) {
      case 'root': return <Layers className="w-5 h-5" />

      case 'service': return <Server className="w-5 h-5" />
      case 'component': return <Code2 className="w-5 h-5" />
      default: return <FileCode className="w-5 h-5" />
    }
  }

  const getNodeColor = (type) => {
    switch (type) {
      case 'root': return 'bg-gradient-to-r from-cyan-500 to-blue-500'

      case 'directory': return 'bg-gradient-to-r from-green-500 to-emerald-500'
      case 'file': return 'bg-gradient-to-r from-purple-500 to-pink-500'
      case 'service': return 'bg-gradient-to-r from-orange-500 to-red-500'
      case 'component': return 'bg-gradient-to-r from-indigo-500 to-purple-500'

      case 'service': return 'bg-gradient-to-r from-green-500 to-emerald-500'
      case 'component': return 'bg-gradient-to-r from-purple-500 to-pink-500'

      default: return 'bg-gradient-to-r from-gray-500 to-gray-600'
    }
  }


  // Build tree structure from nodes
  const buildTreeStructure = (nodes, connections) => {
    const nodeMap = new Map()
    const childrenMap = new Map()
    
    // Filter out App.js and Navbar files
    const filteredNodes = nodes.filter(node => {
      const fileName = node.label?.toLowerCase() || ''
      return !fileName.includes('app.js') && !fileName.includes('navbar')
    })
    
    // Create node map
    filteredNodes.forEach(node => {
      nodeMap.set(node.id, { ...node, children: [] })
    })
    
    // Build children relationships
    connections.forEach(conn => {
      if (conn.type === 'contains') {
        if (!childrenMap.has(conn.from)) {
          childrenMap.set(conn.from, [])
        }
        childrenMap.get(conn.from).push(conn.to)
      }
    })
    
    // Populate children
    childrenMap.forEach((childIds, parentId) => {
      const parent = nodeMap.get(parentId)
      if (parent) {
        parent.children = childIds.map(childId => nodeMap.get(childId)).filter(Boolean)
      }
    })
    
    return nodeMap.get('root') || null
  }

  // Calculate tree layout positions with fan/cone branching pattern
  const calculateTreeLayout = (node, level = 0, siblingIndex = 0, totalSiblings = 1, parentY = 50) => {
    if (!node) return null
    
    const nodeWidth = 280 // Bigger boxes
    const nodeHeight = 120 // Bigger boxes
    const levelSpacing = 450 // More horizontal spacing between levels
    const baseY = parentY
    
    // Calculate position based on level
    const x = level * levelSpacing + 50
    
    // Create fan/cone pattern for children with much better spacing
    let y = baseY
    if (totalSiblings > 1) {
      const fanSpread = Math.min(totalSiblings * 150, 600) // Much more fan spread
      const angleStep = fanSpread / (totalSiblings - 1)
      y = baseY - (fanSpread / 2) + (siblingIndex * angleStep)
    }
    
    return {
      ...node,
      position: {
        x: x,
        y: y
      },
      size: { width: nodeWidth, height: nodeHeight }
    }
  }

  // Build complete tree with positions
  const buildPositionedTree = (root, level = 0, siblingIndex = 0, totalSiblings = 1, parentY = 50) => {
    if (!root) return null
    
    const positionedNode = calculateTreeLayout(root, level, siblingIndex, totalSiblings, parentY)
    const hasChildren = root.children && root.children.length > 0
    
    if (hasChildren) {
      // Pass the parent's Y position to children for proper positioning
      positionedNode.children = root.children.map((child, index) => 
        buildPositionedTree(child, level + 1, index, root.children.length, positionedNode.position.y)
      )
    }
    
    return positionedNode
  }

  // Render tree node recursively with improved positioning
  const renderTreeNode = (node, level = 0, parentY = 50) => {
    if (!node) return null
    
    const isExpanded = expandedNodes.has(node.id)
    const hasChildren = node.children && node.children.length > 0
    const { x, y } = node.position
    const { width: nodeWidth, height: nodeHeight } = node.size
    
    const aiDescription = aiDescriptions[node.path] || node.description || getSmartDescription(node)
    
    return (
      <g key={node.id}>
        {/* Node */}
        <g
          className="cursor-pointer transition-all duration-200 hover:scale-105"
          onClick={(e) => {
            e.stopPropagation() // Prevent drag when clicking on nodes
            setSelectedNode(node)
            if (hasChildren) {
              toggleNode(node.id)
            }
          }}
          onMouseDown={(e) => e.stopPropagation()} // Prevent drag start on nodes
        >
          {/* Node background with gradient */}
          <defs>
            <linearGradient id={`gradient-${node.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={getGradientColor(node.type, 0)} />
              <stop offset="100%" stopColor={getGradientColor(node.type, 1)} />
            </linearGradient>
          </defs>
          
          <rect
            x={x}
            y={y}
            width={nodeWidth}
            height={nodeHeight}
            rx="12"
            ry="12"
            fill={`url(#gradient-${node.id})`}
            stroke={selectedNode?.id === node.id ? '#06b6d4' : 'rgba(255,255,255,0.2)'}
            strokeWidth={selectedNode?.id === node.id ? '3' : '1'}
            className="drop-shadow-lg"
          />
          
          {/* Node content */}
          <foreignObject x={x + 20} y={y + 20} width={nodeWidth - 40} height={nodeHeight - 40}>
            <div className="h-full flex flex-col justify-start text-white p-3">
              {/* Header with icon and name */}
              <div className="flex items-center space-x-3 mb-3">
                <div className="flex-shrink-0">
                  {getNodeIcon(node.type, isExpanded)}
                </div>
                <span className="font-bold text-base truncate flex-1">
                  {node.label}
                </span>
                {hasChildren && (
                  <div className="flex-shrink-0 ml-2">
                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </div>
                )}
              </div>
              
              {/* AI Description - Much more prominent and visible */}
              <div className="text-sm text-white/95 leading-relaxed mb-3 line-clamp-4 font-medium bg-black/30 rounded-lg p-3 border border-white/10" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                {aiDescription}
              </div>
              
              {/* Technologies */}
              {node.technologies && node.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-auto">
                  {node.technologies.slice(0, 3).map((tech) => (
                    <span key={tech} className="text-xs bg-white/40 px-3 py-1 rounded-full text-white font-medium">
                      {tech}
                    </span>
                  ))}
                  {node.technologies.length > 3 && (
                    <span className="text-xs bg-white/25 px-3 py-1 rounded-full text-white/90">
                      +{node.technologies.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </foreignObject>
        </g>
        
        {/* Connection to parent - Curved tree-like connection */}
        {level > 0 && (
          <g>
            <defs>
              <marker
                id={`arrowhead-${node.id}`}
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="#8b5cf6"
                />
              </marker>
            </defs>
            {/* Create curved connection from parent right edge to child left edge */}
            <path
              d={`M ${x - 450 + 280} ${parentY + 60} Q ${x - 225} ${parentY + 60} ${x} ${y + 60}`}
              stroke="#8b5cf6"
              strokeWidth="3"
              fill="none"
              markerEnd={`url(#arrowhead-${node.id})`}
              className="drop-shadow-sm"
              opacity="0.9"
            />
          </g>
        )}
        
        {/* Render children if expanded */}
        {isExpanded && hasChildren && (
          <>
            {node.children.map((child) => 
              renderTreeNode(child, level + 1, y)
            )}
          </>
        )}
      </g>
    )
  }

  // Get smart description for nodes
  const getSmartDescription = (node) => {
    const fileName = node.label?.toLowerCase() || ''
    const nodeType = node.type || ''
    
    // Directory descriptions
    if (nodeType === 'directory' || nodeType === 'folder') {
      if (fileName.includes('src')) return 'Main source code folder with all the important app files and components.'
      if (fileName.includes('components')) return 'Folder with reusable UI pieces that can be used throughout the app.'
      if (fileName.includes('assets')) return 'Storage folder for images, icons, and other files the app needs.'
      if (fileName.includes('styles')) return 'Folder containing all the CSS files that make the app look good.'
      if (fileName.includes('pages')) return 'Folder with different page components that users can visit.'
      if (fileName.includes('utils')) return 'Helper functions folder with useful code that can be reused.'
      if (fileName.includes('hooks')) return 'Custom React hooks folder with reusable logic for components.'
      return 'Folder containing related files and other folders.'
    }
    
    // File descriptions
    if (fileName.includes('app.jsx') || fileName.includes('app.js')) {
      return 'Main app file that starts everything. This is where the whole application begins and connects all the different parts together.'
    }
    if (fileName.includes('index.jsx') || fileName.includes('index.js')) {
      return 'Starting point of the app. This file tells the browser to show the main application and sets up everything needed to run.'
    }
    if (fileName.includes('navbar') || fileName.includes('nav')) {
      return 'Navigation bar that shows menu links and helps users move around the website. Contains the main navigation buttons.'
    }
    if (fileName.includes('footer')) {
      return 'Bottom section of the website with links and information. Usually contains contact details and additional navigation.'
    }
    if (fileName.includes('hero')) {
      return 'Main banner section that shows the most important content. Usually the first thing visitors see with big text and images.'
    }
    if (fileName.includes('project')) {
      return 'Shows project information and portfolio items. Displays work examples and project details in an organized way.'
    }
    if (fileName.includes('animation') || fileName.includes('effect')) {
      return 'Adds cool visual effects and smooth movements to the website. Makes the interface more engaging and interactive.'
    }
    if (fileName.includes('loading') || fileName.includes('spinner')) {
      return 'Shows a loading spinner or progress bar when the app is working. Gives users feedback that something is happening.'
    }
    if (fileName.includes('blur') || fileName.includes('background')) {
      return 'Creates visual effects like blur or special backgrounds. Makes the website look more modern and polished.'
    }
    if (fileName.includes('.css')) {
      return 'Stylesheet file defining visual appearance, layout, and responsive design rules.'
    }
    if (fileName.includes('.json')) {
      return 'JSON configuration file storing structured data, settings, and package information.'
    }
    if (fileName.includes('.md')) {
      return 'Markdown documentation file providing project information and usage instructions.'
    }
    
    return `${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} file implementing specific functionality within the application.`
  }

  // Get gradient colors for different node types
  const getGradientColor = (type, index) => {
    const gradients = {
      root: ['#06b6d4', '#3b82f6'], // cyan to blue
      directory: ['#10b981', '#059669'], // emerald
      file: ['#8b5cf6', '#a855f7'], // purple to violet
      service: ['#f97316', '#ea580c'], // orange to red
      component: ['#6366f1', '#8b5cf6'], // indigo to purple
    }
    
    const gradient = gradients[type] || ['#6b7280', '#4b5563']
    return gradient[index]
  }


  const getConnectionColor = (type) => {
    switch (type) {
      case 'service': return '#10b981'
      case 'contains': return '#8b5cf6'
      case 'data': return '#f59e0b'
      case 'uses': return '#06b6d4'
      case 'api': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getConnectionLabel = (type) => {
    switch (type) {
      case 'service': return 'Service'
      case 'contains': return 'Contains'
      case 'data': return 'Data Flow'
      case 'uses': return 'Uses'
      case 'api': return 'API Call'
      default: return type
    }
  }

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'h-full'} flex flex-col bg-black`}>
      {/* Fullscreen Close Button - Only visible in fullscreen mode */}
      {isFullscreen && (
        <div className="absolute top-4 left-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(false)}
            className="bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30 hover:border-red-500/70"
            title="Exit Fullscreen (ESC)"
          >
            <X className="w-4 h-4 mr-2" />
            Exit Fullscreen
          </Button>
        </div>
      )}
      
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-black/20 backdrop-blur-lg">

        <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          {/* Title Section */}
          <div className="flex items-center space-x-4 flex-1 min-w-0 pr-4">
            <div className="flex items-center space-x-3 min-w-0">
              <Workflow className="w-6 h-6 text-cyan-400 flex-shrink-0" />
              <h2 className="text-xl font-semibold text-white truncate">Code Architecture Flowchart</h2>
            </div>
            <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400 flex-shrink-0">

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Workflow className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-semibold text-white">Code Architecture Flowchart</h2>
            </div>
            <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400">

              <Bot className="w-3 h-3 mr-1" />
              AI Generated
            </Badge>
          </div>
          

          {/* Controls Section */}
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
            {/* File Dropdown */}

          {/* File Dropdown */}
          <div className="flex items-center space-x-2">

            <div className="relative file-dropdown">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFileDropdown(!showFileDropdown)}
                className="border-white/20 text-white min-w-[200px] justify-start"
              >
                <List className="w-4 h-4 mr-2" />
                {selectedFile ? selectedFile.split('/').pop() : 'Select File'}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
              
              {showFileDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-black/90 backdrop-blur-lg border border-white/20 rounded-lg shadow-xl z-50 max-h-64 overflow-hidden">
                  <div className="p-2 border-b border-white/10">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search files..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-3 py-1 bg-white/5 border border-white/20 rounded text-white text-sm placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                  <ScrollArea className="max-h-48">
                    <div className="py-1">
                      {filteredFiles.map((file, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            if (onFileSelect) {
                              onFileSelect(file.path)
                            }
                            setShowFileDropdown(false)
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 flex items-center space-x-2"
                        >
                          <FileCode className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{file.path}</span>
                        </button>
                      ))}
                      {filteredFiles.length === 0 && (
                        <div className="px-3 py-2 text-sm text-gray-400">No files found</div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
            

            {/* Control Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.min(zoom + 0.1, 2))}
                className="border-white/20 text-white"
                title="Zoom In"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.max(zoom - 0.1, 0.5))}
                className="border-white/20 text-white"
                title="Zoom Out"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPosition({ x: 0, y: 0 })}
                className="border-white/20 text-white"
                title="Reset View"
              >
                <ArrowUp className="w-4 h-4" />
              </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.min(zoom + 0.1, 2))}
              className="border-white/20 text-white"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.max(zoom - 0.1, 0.5))}
              className="border-white/20 text-white"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPosition({ x: 0, y: 0 })}
              className="border-white/20 text-white"
            >
              <ArrowUp className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="border-white/20 text-white"

              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <X className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
            </div>

            >
              {isFullscreen ? <X className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white"
            >
              <Download className="w-4 h-4" />
            </Button>

          </div>
        </div>
      </div>

      {/* Flowchart Canvas */}
      <div className="flex-1 relative overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white text-lg">Generating Flowchart...</p>
              <p className="text-gray-400 text-sm">Analyzing code structure</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-6 h-6 text-red-400" />
              </div>
              <p className="text-white text-lg mb-2">Using Static Flowchart</p>
              <p className="text-gray-400 text-sm mb-4">
                API unavailable, showing pre-generated structure
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    setError(null)
                    setLoading(true)
                    // Retry the API call
                    window.location.reload()
                  }}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white mr-2"
                >
                  Retry API
                </Button>
                <Button
                  onClick={() => setError(null)}
                  variant="outline"
                  size="sm"
                  className="border-cyan-400/50 text-cyan-400"
                >
                  Continue with Static
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="w-full h-full relative overflow-auto cursor-default"
            onWheel={handleWheel}
            style={{ background: 'radial-gradient(circle at 20% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)' }}
          >

            <div
              className="absolute inset-0"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                transformOrigin: '0 0'
              }}
            >
              {/* Tree Structure SVG */}
              <svg 
                className="w-full h-full pointer-events-auto" 
                style={{ overflow: 'visible', cursor: isDraggingCanvas ? 'grabbing' : 'grab' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3.5, 0 7"
                      fill="#8b5cf6"
                    />
                  </marker>
                </defs>
                
                {/* Render tree structure */}
                {(() => {
                  const { nodes, connections } = flowchartData || generateStaticFlowchartData()
                  const treeRoot = buildTreeStructure(nodes, connections)
                  const positionedTree = buildPositionedTree(treeRoot)
                  return positionedTree ? renderTreeNode(positionedTree) : null
                })()}
              </svg>
              
              {/* AI Loading indicator */}
              {loadingDescriptions && (
                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-lg border border-white/20 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span className="text-white text-sm">Generating AI descriptions...</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div
            className="absolute inset-0"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transformOrigin: '0 0'
            }}
          >
            {/* Connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
              {connections.map((conn, index) => {
                const fromNode = nodes.find(n => n.id === conn.from)
                const toNode = nodes.find(n => n.id === conn.to)
                if (!fromNode || !toNode) return null

                const fromX = fromNode.position.x + fromNode.size.width / 2
                const fromY = fromNode.position.y + fromNode.size.height
                const toX = toNode.position.x + toNode.size.width / 2
                const toY = toNode.position.y

                // Calculate better control points for smoother curves
                const deltaY = toY - fromY
                const deltaX = toX - fromX
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
                
                // Dynamic control points based on distance and direction
                const controlOffset = Math.min(50, distance * 0.3)
                const controlY1 = fromY + controlOffset
                const controlY2 = toY - controlOffset
                
                // Create a more natural curve
                const midX = (fromX + toX) / 2
                const midY = (fromY + toY) / 2

                return (
                  <g key={index}>
                    <defs>
                      <marker
                        id={`arrowhead-${index}`}
                        markerWidth="10"
                        markerHeight="7"
                        refX="9"
                        refY="3.5"
                        orient="auto"
                      >
                        <polygon
                          points="0 0, 10 3.5, 0 7"
                          fill={getConnectionColor(conn.type)}
                        />
                      </marker>
                    </defs>
                    <path
                      d={`M ${fromX} ${fromY} C ${fromX} ${controlY1} ${midX} ${midY} ${toX} ${toY}`}
                      stroke={getConnectionColor(conn.type)}
                      strokeWidth="2"
                      fill="none"
                      opacity="0.7"
                      markerEnd={`url(#arrowhead-${index})`}
                      className="drop-shadow-sm"
                    />
                    {/* Connection type label */}
                    <text
                      x={midX}
                      y={midY - 5}
                      textAnchor="middle"
                      className="text-xs fill-gray-400 pointer-events-none"
                      style={{ fontSize: '10px' }}
                    >
                      {getConnectionLabel(conn.type)}
                    </text>
                  </g>
                )
              })}
            </svg>

            {/* Nodes */}
            {nodes.map((node) => (
              <div
                key={node.id}
                className={`node absolute cursor-pointer transition-all duration-200 hover:scale-105 ${
                  selectedNode?.id === node.id ? 'ring-2 ring-cyan-400' : ''
                }`}
                style={{
                  left: node.position.x,
                  top: node.position.y,
                  width: node.size.width,
                  height: node.size.height
                }}
                onClick={() => {
                  setSelectedNode(node)
                  if (onFileSelect && node.type === 'component') {
                    onFileSelect(node.id)
                  }
                }}
              >
                <Card className={`h-full ${getNodeColor(node.type)} border-white/20 shadow-lg overflow-hidden`}>
                  <CardContent className="p-3 h-full flex flex-col justify-center min-h-0">
                    <div className="flex items-center space-x-2 mb-1 min-w-0">
                      {getNodeIcon(node.type)}
                      <span className="text-white font-medium text-sm truncate flex-1">
                        {node.label}
                      </span>
                    </div>
                    <p className="text-white/80 text-xs truncate mb-2">
                      {node.description}
                    </p>
                    {node.technologies && node.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-auto">
                        {node.technologies.slice(0, 2).map((tech) => (
                          <Badge
                            key={tech}
                            variant="secondary"
                            className="text-xs bg-white/20 text-white border-white/30 whitespace-nowrap"
                          >
                            {tech}
                          </Badge>
                        ))}
                        {node.technologies.length > 2 && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-white/10 text-white/70 border-white/20"
                          >
                            +{node.technologies.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        )}
      </div>

      {/* Node Details Panel */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 right-4 max-w-md">
          <Card className="bg-black/80 backdrop-blur-lg border-white/20">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm flex items-center">
                  {getNodeIcon(selectedNode.type)}
                  <span className="ml-2">{selectedNode.label}</span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedNode(null)}
                  className="text-white hover:bg-white/10"
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-gray-300 text-sm mb-3">{selectedNode.description}</p>
              {selectedNode.technologies && selectedNode.technologies.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-white text-xs font-medium">Technologies:</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedNode.technologies.map((tech) => (
                      <Badge
                        key={tech}
                        variant="secondary"
                        className="text-xs bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Connection Legend */}
      <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-lg border border-white/20 rounded-lg p-3">
        <h4 className="text-white text-sm font-medium mb-2">Connection Types</h4>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 bg-green-500"></div>
            <span className="text-xs text-gray-300">Service</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 bg-purple-500"></div>
            <span className="text-xs text-gray-300">Contains</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 bg-yellow-500"></div>
            <span className="text-xs text-gray-300">Data Flow</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 bg-cyan-500"></div>
            <span className="text-xs text-gray-300">Uses</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 bg-red-500"></div>
            <span className="text-xs text-gray-300">API Call</span>
          </div>
        </div>
      </div>

      {/* Feedback Buttons */}
      <div className="absolute bottom-4 right-4 flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          className="bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30"
        >
          <ThumbsUp className="w-4 h-4 mr-1" />
          Good
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
        >
          <ThumbsDown className="w-4 h-4 mr-1" />
          Bad
        </Button>
      </div>

      {/* Disclaimer */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <p className="text-xs text-gray-500 text-center">
          OpenHub AI can be inaccurate; please double-check its responses.
        </p>
      </div>
    </div>
  )
}
