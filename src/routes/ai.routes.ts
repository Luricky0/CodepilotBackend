import express from 'express'
import { evaluateCode, getAnalyzation, getAnswer } from '../controllers/ai.controller'
const router = express.Router()

router.post('/evaluate', evaluateCode)
router.post('/answer', getAnswer)
router.post('/analyze',getAnalyzation)

export default router
