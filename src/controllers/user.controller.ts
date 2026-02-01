import { Request, Response } from 'express'
import User from '../models/user.model'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import Problem from '../models/problem.model'
import { ObjectId } from 'mongodb'
import user from '../models/user.model'
import { UserService } from '../services/user.service'
import { randomInt } from 'crypto'
import { ApiError } from '../utils/ApiError'

export const checkToken = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (token) {
    try {
      const valid = await UserService.checkToken(token)
      res.status(200).json({ valid })
    } catch (err) {
      if (err instanceof ApiError) {
        console.error(err)
        res.status(err.statusCode || 500).json({
          message: err.message || 'Internal Server Error',
        })
      }
    }
  }
}
export const login = async (req: Request, res: Response) => {
  const { id, password } = req.body
  try {
    const token = await UserService.login(id, password)
    res.status(200).json({ token })
  } catch (err) {
    if (err instanceof ApiError) {
      console.error(err)
      res.status(err.statusCode || 500).json({
        message: err.message || 'Internal Server Error',
      })
    }
  }
}

export const register = async (req: Request, res: Response) => {
  const { id, password } = req.body
  try {
    const token = await UserService.register(id, password)
    res.status(200).json({ token })
  } catch (err) {
    if (err instanceof ApiError) {
      console.error(err)
      res.status(err.statusCode || 500).json({
        message: err.message || 'Internal Server Error',
      })
    }
  }
}

export const likeProblem = async (req: Request, res: Response) => {
  const user = await UserService.getUserByToken(req)
  const { problemId, title } = req.body
  if (user) {
    try {
      const userList = await UserService.toggleProblemStatus(
        user,
        problemId,
        title,
        'like'
      )
      res.status(200).json({
        likeProblemsIDs: userList,
      })
    } catch (err) {
      if (err instanceof ApiError) {
        console.error(err)
        res.status(err.statusCode || 500).json({
          message: err.message || 'Internal Server Error',
        })
      }
    }
  }
}

export const getLikedProblems = async (req: Request, res: Response) => {
  try {
    const user = await UserService.getUserByToken(req)
    res.status(200).json({
      likedProblemsIDs: user!.likedProblemsIDs,
    })
  } catch (err) {
    if (err instanceof ApiError) {
      console.error(err)
      res.status(err.statusCode || 500).json({
        message: err.message || 'Internal Server Error',
      })
    }
  }
}

export const completeProblem = async (req: Request, res: Response) => {
  const user = await UserService.getUserByToken(req)
  const { problemId, title } = req.body
  if (user) {
    try {
      const userList = await UserService.toggleProblemStatus(
        user,
        problemId,
        title,
        'complete'
      )
      res.status(200).json({
        completedProblemsIDs: userList,
      })
    } catch (err) {
      if (err instanceof ApiError) {
        console.error(err)
        res.status(err.statusCode || 500).json({
          message: err.message || 'Internal Server Error',
        })
      }
    }
  }
}

export const getCompletedProblems = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    res.status(400).json({ message: 'Token is required' })
  } else {
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)
      const userId = decoded.id
      const user = await User.findOne({ id: userId })
      if (!user) {
        res.status(404).json({ message: 'User not found' })
      } else {
        res.status(200).json({
          completedProblemsIDs: user.completedProblemsIDs,
        })
      }
    } catch (error) {
      if (error instanceof ApiError) {
        console.log(error)
        res.status(error.statusCode).json(error.message)
      }
    }
  }
}

export const getGoals = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    res.status(400).json({ message: 'Token is required' })
  } else {
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)
      const userId = decoded.id
      const user = await User.findOne({ id: userId })
      if (!user) {
        res.status(404).json({ message: 'User not found' })
      } else {
        res.status(200).json({
          goals: user.goals,
        })
      }
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: 'Server error' })
    }
  }
}

export const setGoal = async (req: Request, res: Response) => {
  const { goal } = req.body
  const user = await UserService.getUserByToken(req)
  if (user) {
    try {
      const goals = await UserService.setGoal(user, goal)
      res.status(200).json({
        goals,
      })
    } catch (err) {
      if (err instanceof ApiError) {
        console.error(err)
        res.status(err.statusCode || 500).json({
          message: err.message || 'Internal Server Error',
        })
      }
    }
  }
}

export const getRecommendation = async (req: Request, res: Response) => {
  const user = await UserService.getUserByToken(req)
  try {
    if (user == null) {
      res.status(404)
      return
    }
    const recommendedProblems =
      await UserService.generateTagNGoalBasedRecommendation(user)
    const random = randomInt(recommendedProblems.length)
    const recommendedProblem = recommendedProblems[random]
    res.status(200).json({
      recommendedProblem,
    })
  } catch (err) {
    if (err instanceof ApiError) {
      console.error(err)
      res.status(err.statusCode || 500).json({
        message: err.message || 'Internal Server Error',
      })
    }
  }
}
