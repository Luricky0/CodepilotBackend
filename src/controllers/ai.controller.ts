import { Request, Response, NextFunction } from 'express'
import AIService from '../services/ai.service'
import { ApiError } from '../utils/ApiError'
import { UserService } from '../services/user.service'
import { Types } from 'mongoose'
import { hash } from '../utils/hash'
import { redis } from '../utils/reddis'
import { SubmissionService } from '../services/submission.service'

const checkRateLimit = async (id: string) => {
  const today = new Date().toISOString().slice(0, 10)
  const key = `ratelimit:createChat:${id}:${today}`
  const DAILY_LIMIT = 50

  const currentCount = await redis.incr(key)
  if (currentCount === 1) {
    await redis.expire(key, 86400)
  }

  if (currentCount > DAILY_LIMIT) {
    throw new ApiError(429, 'Request Limit')
  }
  return currentCount
}

export const evaluateCode = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { title, code, model, problemId } = req.body
  try {
    const user = await UserService.getUserByToken(req)
    if (!user) throw new ApiError(401, 'Invalid Token')

    await checkRateLimit(user.id)

    await SubmissionService.addOneSubmission(
      user._id,
      new Types.ObjectId(problemId),
      code,
      model,
    )

    const embedding = await SubmissionService.getEmbedding(user._id, problemId)
    console.log(embedding)
    const aiRes = await AIService.evaluateCode(
      title,
      code,
      model,
      embedding ?? undefined,
    )

    return res.status(200).json({ message: aiRes })
  } catch (error) {
    handleControllerError(error, res)
  }
}

export const getAnswer = async (req: Request, res: Response) => {
  const { title, content, lang, model } = req.body
  const cacheKey = `llm:answer:${title}:${lang}:${model || 'default'}:${hash(content)}`

  try {
    const user = await UserService.getUserByToken(req)
    if (!user) throw new ApiError(401, 'Invalid Token')

    await checkRateLimit(user.id)

    const cached = await redis.get(cacheKey)
    if (cached) {
      return res.status(200).json({ message: cached, source: 'cache' })
    }

    const aiRes = await AIService.getAnswer(title, content, lang, model)

    if (aiRes) {
      await redis.set(cacheKey, aiRes, 'EX', 3600)
    }

    return res.status(200).json({ message: aiRes })
  } catch (error) {
    handleControllerError(error, res)
  }
}

export const getAnalyzation = async (req: Request, res: Response) => {
  const { title, content, model } = req.body
  const cacheKey = `llm:analyzation:${title}:${model || 'default'}:${hash(content)}`

  try {
    const user = await UserService.getUserByToken(req)
    if (!user) throw new ApiError(401, 'Invalid Token')
    await checkRateLimit(user.id)

    const cache = await redis.get(cacheKey)
    if (cache) {
      return res.status(200).json({ message: cache, source: 'cache' })
    }

    const aiRes = await AIService.analyzeProblem(title, content, model)

    if (aiRes) {
      await redis.set(cacheKey, aiRes, 'EX', 3600)
    }

    return res.status(200).json({ message: aiRes })
  } catch (error) {
    handleControllerError(error, res)
  }
}

const handleControllerError = (error: any, res: Response) => {
  console.error(error)
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({ error: error.message })
  } else {
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
