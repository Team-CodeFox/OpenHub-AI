import express from 'express'
import {
  getLocalTree,
  getResources,
  streamChanges,
  compressSelection,
  getStatus,
  getContextualResources,
  getRepoTreeFromGitHub,
  getGitHubContextualResources,
  getYoutubeVideos,
  learnRateLimiter
} from '../controllers/learnController.js'

const router = express.Router()

router.get('/tree', getLocalTree)
router.get('/github-tree', getRepoTreeFromGitHub)
router.get('/resources', getResources)
router.get('/status', getStatus)
router.get('/stream', streamChanges)
router.post('/compress', compressSelection)
router.get('/contextual', learnRateLimiter, getContextualResources)
router.get('/github-contextual', learnRateLimiter, getGitHubContextualResources)
router.get('/youtube-videos', learnRateLimiter, getYoutubeVideos)

export default router


