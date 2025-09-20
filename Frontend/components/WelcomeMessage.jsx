'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Sparkles, 
  Workflow, 
  FileCode, 
  Bot, 
  ArrowRight, 
  Github,
  Code2,
  Layers,
  Zap
} from 'lucide-react'

export default function WelcomeMessage({ repoInfo, detectedTechs }) {
  return (
    <Card className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-400/30 backdrop-blur-xl">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-3">
              <h2 className="text-xl font-semibold text-white">
                {repoInfo?.name || 'Repository Overview'}
              </h2>
              <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                <Zap className="w-3 h-3 mr-1" />
                AI Active
              </Badge>
            </div>
            
            <p className="text-gray-300 text-base leading-relaxed mb-4">
              You're about to explore an amazing open-source project that makes onboarding and contributing to codebases 
              accessible for developers of all levels! This interactive codebase explorer is your gateway to understanding 
              how modern web applications are structured and built.
            </p>

            <div className="mb-4">
              <p className="text-gray-300 text-base leading-relaxed mb-3">
                The <strong className="text-cyan-400">flowchart you see</strong> is a visual map of the entire project's architecture, 
                showing how different files and folders are connected. It's like having a GPS for your code journey! 
                For example, you can see how <code className="bg-white/10 px-2 py-1 rounded text-cyan-300">Frontend/app/layout.jsx</code> serves as the main entry point 
                and connects to other core modules, like the <code className="bg-white/10 px-2 py-1 rounded text-cyan-300">backend/controllers/authController.js</code> 
                which handles user authentication, or the <code className="bg-white/10 px-2 py-1 rounded text-cyan-300">Frontend/components</code> directory 
                that contains all the reusable UI components.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Workflow className="w-4 h-4 text-purple-400" />
                <span>Interactive Flowchart</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <FileCode className="w-4 h-4 text-green-400" />
                <span>Live Code Explorer</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Bot className="w-4 h-4 text-cyan-400" />
                <span>AI-Powered Insights</span>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center space-x-2 mb-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <h3 className="text-white font-medium">Quick Start Guide</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span>Click on different files and folders in the explorer to see detailed AI-generated summaries</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Use the Flowchart tab to visualize the project's architecture and data flow</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Explore the Issues tab to find your first contribution opportunity</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>Ask the AI assistant questions about any part of the codebase</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Github className="w-4 h-4" />
                <span>Built with {detectedTechs?.slice(0, 3).join(', ')} and more</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10"
                onClick={() => {
                  // Scroll to flowchart tab
                  const flowchartTab = document.querySelector('[data-state="inactive"][value="flowchart"]')
                  if (flowchartTab) {
                    flowchartTab.click()
                  }
                }}
              >
                <Workflow className="w-4 h-4 mr-2" />
                Explore Flowchart
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
