import express from 'express'
import {
  checkToken,
  completeProblem,
  getCompletedProblems,
  getGoals,
  getLikedProblems,
  getRecommendation,
  likeProblem,
  login,
  register,
  setGoal,
} from '../controllers/user.controller'
import { validateCaptcha } from '../middleware/captcha'
import { protect } from '../middleware/protect'

const router = express.Router()

router.get('/checktoken', checkToken)
router.post('/login', validateCaptcha, login)
// router.post('/register', validateCaptcha, register)
router.post('/like', protect, likeProblem)
router.get('/liked', protect,getLikedProblems)
router.post('/complete', protect, completeProblem)
router.get('/completed', protect, getCompletedProblems)
router.get('/goals', protect, getGoals)
router.post('/setgoal', protect, setGoal)
router.get('/recommendation', protect, getRecommendation)
export default router
