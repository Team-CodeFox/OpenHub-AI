import express from 'express'
import { getUser, getRepos, getRepoInfo, getRepoTree, getFileContent, getRepoIssues, getAISummary, analyzeIssue, createIssueBranch, analyzeRepo, starRepository, unstarRepository, checkStarStatus } from '../controllers/githubController.js'

const router = express.Router()

router.get('/user', getUser)
router.get('/repos', getRepos)
router.get('/repo', getRepoInfo)
router.get('/tree', getRepoTree)
router.get('/file', getFileContent)
router.get('/issues', getRepoIssues)
router.post('/ai-summary', getAISummary)
router.post('/analyze-issue', analyzeIssue)
router.post('/analyze-repo', analyzeRepo)
router.post('/create-issue-branch', createIssueBranch)
router.post('/star', starRepository)
router.delete('/star', unstarRepository)
router.get('/star-status', checkStarStatus)

export default router