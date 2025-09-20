import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileCode, BookOpen, Loader2, Sparkles, Folder, Code, Brain, Zap, Target, Clock, Users } from 'lucide-react'

const AISummary = ({ selectedNode, selectedFile, aiLoading, aiSummaries, repoInfo }) => {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Brain className="w-8 h-8 text-cyan-400" />
          <h1 className="text-3xl font-bold text-white">AI Code Analysis</h1>
          <Brain className="w-8 h-8 text-cyan-400" />
        </div>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Get precise AI-powered analysis of your code using GPT-4o. 
          Understand file purposes, code patterns, and architectural decisions instantly.
        </p>
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
          <div className="flex items-center space-x-1">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span>Real-time Analysis</span>
          </div>
          <div className="flex items-center space-x-1">
            <Brain className="w-4 h-4 text-purple-400" />
            <span>GPT-4o Powered</span>
          </div>
          <div className="flex items-center space-x-1">
            <Target className="w-4 h-4 text-green-400" />
            <span>Code-focused</span>
          </div>
        </div>
      </div>

      {/* Main AI Summary Card */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <FileCode className="w-5 h-5 mr-2 text-purple-400" />
            {selectedNode ? selectedNode.name : 'Select a file or folder'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-black/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-cyan-400 font-medium">Selected Item</h4>
                {selectedNode && (
                  <div className="text-sm text-gray-400 flex items-center">
                    {selectedNode.type === 'folder' ? (
                      <>
                        <Folder className="w-4 h-4 mr-1" />
                        Folder
                      </>
                    ) : (
                      <>
                        <FileCode className="w-4 h-4 mr-1" />
                        File
                      </>
                    )}
                  </div>
                )}
              </div>
              
              {selectedNode ? (
                <div>
                  <div className="mb-3 p-2 bg-white/5 rounded border border-white/10">
                    <span className="text-white font-medium">{selectedNode.name}</span>
                    <span className="text-gray-400 text-sm ml-2">({selectedNode.path})</span>
                  </div>
                  
                  {aiLoading[selectedNode.path] ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                        <span className="text-gray-300 text-sm">AI is analyzing your code...</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Using GPT-4o to understand code structure, patterns, and purpose
                      </div>
                    </div>
                  ) : aiSummaries[selectedNode.path] ? (
                    <div className="space-y-4">
                      {/* Analysis Quality Indicator */}
                      <div className="flex items-center space-x-2 text-xs">
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <Brain className="w-3 h-3 mr-1" />
                          AI Analysis Complete
                        </Badge>
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          <Code className="w-3 h-3 mr-1" />
                          Code-focused
                        </Badge>
                      </div>
                      
                      <div className="max-h-[400px] overflow-y-auto">
                        {(() => {
                          const text = aiSummaries[selectedNode.path] || ''
                          const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
                          const bulletLines = lines.filter(l => l.startsWith('- '))
                          const otherLines = lines.filter(l => !l.startsWith('- '))
                          return (
                            <div className="text-gray-300 text-sm space-y-3">
                              {bulletLines.length > 0 && (
                                <div className="space-y-2">
                                  <h5 className="text-cyan-400 font-medium text-xs uppercase tracking-wide">
                                    Key Functions & Purpose
                                  </h5>
                                  <ul className="list-disc pl-5 space-y-2">
                                    {bulletLines.map((l, i) => (
                                      <li key={i} className="leading-relaxed">
                                        {l.replace(/^\-\s+/, '')}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {otherLines.length > 0 && (
                                <div className="space-y-2">
                                  <h5 className="text-cyan-400 font-medium text-xs uppercase tracking-wide">
                                    Additional Context
                                  </h5>
                                  <div className="whitespace-pre-line bg-black/20 rounded p-3 border border-white/10">
                                    {otherLines.join('\n')}
                                  </div>
                                </div>
                              )}
                              {bulletLines.length === 0 && otherLines.length === 0 && (
                                <div className="bg-black/20 rounded p-3 border border-white/10">
                                  <p>{text}</p>
                                </div>
                              )}
                            </div>
                          )
                        })()}
                      </div>
                      
                      {/* Analysis Stats */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-black/20 rounded p-2 text-center">
                          <div className="text-cyan-400 font-medium">
                            {selectedNode.type === 'file' ? 'Code Lines' : 'Sub-items'}
                          </div>
                          <div className="text-gray-400">
                            {selectedNode.type === 'file' ? 'Analyzed' : selectedNode.children?.length || 0}
                          </div>
                        </div>
                        <div className="bg-black/20 rounded p-2 text-center">
                          <div className="text-purple-400 font-medium">AI Model</div>
                          <div className="text-gray-400">GPT-4o</div>
                        </div>
                        <div className="bg-black/20 rounded p-2 text-center">
                          <div className="text-green-400 font-medium">Accuracy</div>
                          <div className="text-gray-400">High</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-300 text-sm">
                      {selectedNode.type === 'folder'
                        ? `The ${selectedNode.name} folder is part of ${repoInfo?.name || 'this repository'} and groups related code.`
                        : `This file (${selectedNode.name}) is part of ${repoInfo?.name || 'this repository'} and contributes to the app functionality.`}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileCode className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-300 text-sm mb-2">
                    Select a file or folder from the left
                  </p>
                  <p className="text-gray-500 text-xs">
                    Get an AI-powered summary of its purpose and contents
                  </p>
                </div>
              )}
            </div>

            {/* Action Button */}
            {selectedNode && (
              <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 w-full">
                <BookOpen className="w-4 h-4 mr-2" />
                Learn More About This Pattern
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Brain className="w-5 h-5 mr-2 text-cyan-400" />
            AI Analysis Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-300">
            <div className="space-y-2">
              <h4 className="text-white font-medium flex items-center">
                <Folder className="w-4 h-4 mr-2 text-blue-400" />
                Folder Analysis
              </h4>
              <ul className="space-y-1 pl-4">
                <li>• Understand architectural patterns</li>
                <li>• Learn about file relationships</li>
                <li>• Get organizational insights</li>
                <li>• Identify key components</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-white font-medium flex items-center">
                <FileCode className="w-4 h-4 mr-2 text-green-400" />
                Code Analysis
              </h4>
              <ul className="space-y-1 pl-4">
                <li>• Understand function purposes</li>
                <li>• Learn about code patterns</li>
                <li>• Get implementation details</li>
                <li>• Identify dependencies</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-white font-medium flex items-center">
                <Brain className="w-4 h-4 mr-2 text-purple-400" />
                AI Capabilities
              </h4>
              <ul className="space-y-1 pl-4">
                <li>• Real-time code understanding</li>
                <li>• Context-aware analysis</li>
                <li>• Beginner-friendly explanations</li>
                <li>• Technical depth when needed</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 font-medium text-sm">Pro Tip</span>
            </div>
            <p className="text-gray-300 text-xs">
              The AI analyzes actual code content using GPT-4o, providing precise insights based on real implementation details, 
              not just file names or structure. Each analysis is tailored to the specific codebase and coding patterns.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AISummary
