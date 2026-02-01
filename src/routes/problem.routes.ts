import express from 'express'
import {
  getNextProblemID,
  getPaginatedProblems,
  getProblem,
} from '../controllers/problem.controller'

const router = express.Router()

router.get('/problems', getPaginatedProblems)
router.get('/problem', getProblem)
router.post('/next',getNextProblemID)

export default router
