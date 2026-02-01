import { Request, Response } from 'express'

import User, { IGoalRecord, IProblemRecord, Iuser } from '../models/user.model'
import jwt from 'jsonwebtoken'
import user from '../models/user.model'
import problem from '../models/problem.model'
import Problem from '../models/problem.model'
import { wrap } from 'module'
import { Types } from 'mongoose'
import { ApiError } from '../utils/ApiError'

const checkToken = async (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!)
    return true
  } catch (err) {
    return false
  }
}
const getUserByToken = async (req: Request): Promise<Iuser | null> => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    console.log('No token found in headers')
    throw new ApiError(404, 'No token found in headers')
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)
    const userid = decoded.id
    const user = await User.findOne({ id: userid })
    return user
  } catch (error) {
    console.error('Token verification failed:', error)
    throw new ApiError(404, 'Token Unvalid')
  }
}

const countTag = async (problemsIDs: IProblemRecord[]) => {
  const now = Date.now() // 当前时间的毫秒数
  const days180Ago = now - 180 * 24 * 60 * 60 * 1000

  const tagCount: Record<string, number> = {}
  for (const r of problemsIDs) {
    if (r.timestamp > days180Ago) {
      const problem = await Problem.findById(r.problemId).lean()
      if (problem) {
        for (const tag of problem.topicTags) {
          tagCount[tag.name]
            ? (tagCount[tag.name] += 1)
            : (tagCount[tag.name] = 1)
        }
      }
    }
  }
  return tagCount
}

const allTagNames = [
  'Array',
  'String',
  'Hash Table',
  'Math',
  'Dynamic Programming',
  'Greedy',
  'Depth-First Search',
  'Breadth-First Search',
  'Binary Search',
  'Divide and Conquer',
  'Backtracking',
  'Stack',
  'Heap (Priority Queue)',
  'Graph',
  'Two Pointers',
  'Sliding Window',
  'Union Find',
  'Bit Manipulation',
  'Tree',
  'Trie',
  'Design',
  'Topological Sort',
  'Segment Tree',
  'Binary Indexed Tree',
  'Recursion',
  'Memoization',
  'Counting',
  'Matrix',
  'Simulation',
  'Geometry',
  'Game Theory',
  'Number Theory',
  'Linked List',
  'Monotonic Stack',
  'Monotonic Queue',
  'Shortest Path',
  'Minimum Spanning Tree',
  'Reservoir Sampling',
  'Randomized',
  'Rolling Hash',
  'Hash Function',
  'String Matching',
  'Combinatorics',
  'Probability and Statistics',
  'Prefix Sum',
  'Suffix Array',
  'Bitmask',
  'Greedy Algorithms',
  'Sliding Window Maximum',
  'Binary Search Tree',
  'Fenwick Tree',
  'Sparse Table',
  'Line Sweep',
  'Scanline',
  'Bucket Sort',
  'Radix Sort',
  'Counting Sort',
  'Shell Sort',
  'Quickselect',
  'Reservoir Sampling',
  'Floyd-Warshall',
  'Dijkstra',
  'Bellman-Ford',
  'A* Search',
  'Eulerian Path',
  'Hamiltonian Path',
  'Disjoint Set Union',
  'Heavy-Light Decomposition',
  'Centroid Decomposition',
  "Mo's Algorithm",
  'Suffix Automaton',
  'Z-Algorithm',
  "Manacher's Algorithm",
  'KMP Algorithm',
  'Rabin-Karp Algorithm',
  'Trie Tree',
  'Suffix Tree',
  'Suffix Trie',
  'Palindromic Tree',
  'Link-Cut Tree',
  'Persistent Segment Tree',
  'Persistent Trie',
  'Persistent Union Find',
  'Persistent Stack',
  'Persistent Queue',
  'Persistent Deque',
  'Persistent Heap',
  'Persistent BST',
  'Persistent AVL Tree',
  'Persistent Treap',
  'Persistent Splay Tree',
  'Persistent Red-Black Tree',
  'Persistent B-Tree',
  'Persistent B+ Tree',
  'Persistent B* Tree',
  'Persistent B-Tree',
  'Persistent B+ Tree',
  'Persistent B* Tree',
  'Persistent Segment Tree',
  'Persistent Trie',
  'Persistent Union Find',
  'Persistent Stack',
  'Persistent Queue',
  'Persistent Deque',
  'Persistent Heap',
  'Persistent BST',
  'Persistent AVL Tree',
  'Persistent Treap',
  'Persistent Splay Tree',
  'Persistent Red-Black Tree',
  'Persistent B-Tree',
  'Persistent B+ Tree',
  'Persistent B* Tree',
  'Persistent B-Tree',
  'Persistent B+ Tree',
  'Persistent B* Tree',
]
const countGoal = async (goals: IGoalRecord[]) => {
  const now = Date.now()
  const days30Ago = now - 30 * 24 * 60 * 60 * 1000
  const tagCount: Record<string, number> = {}

  for (const g of goals) {
    if (g.timestamp > days30Ago) {
      const cleaned = g.goal.toLowerCase().replace(/[^a-z0-9\s]/g, '')
      const words = cleaned.split(/\s+/).filter(Boolean)

      const matchedTags = words.flatMap((w) =>
        allTagNames.filter((tag) => {
          const tagWords = tag.toLowerCase().split(/\s+/)
          return tagWords.includes(w)
        }),
      )
      for (const t of matchedTags) {
        tagCount[t] ? (tagCount[t] += 1) : (tagCount[t] = 1)
      }
    }
  }
  return tagCount
}

const generateTagNGoalBasedRecommendation = async (user: Iuser) => {
  const goalTags = await countGoal(user.goals)
  const completedTags = await countTag(user.completedProblemsIDs)
  const likedTags = await countTag(user.likedProblemsIDs)

  const scoredTags: Record<string, number> = {}
  for (const r in goalTags) {
    scoredTags[r] = goalTags[r] * 4
  }
  for (const r in likedTags) {
    scoredTags[r] = (scoredTags[r] || 0) + 2
  }
  for (const r in completedTags) {
    scoredTags[r] = (scoredTags[r] || 0) - 2
  }
  const completedIds = user.completedProblemsIDs.map((r) =>
    r.problemId.toString(),
  )
  const likedOnly = user.likedProblemsIDs.filter(
    (r) => !completedIds.includes(r.problemId.toString()),
  )
  const likedUnfinishedIds = likedOnly.map((r) => r.problemId)
  const likedProblems = await Problem.find({
    _id: { $in: likedUnfinishedIds },
  }).lean()

  const scoredLiked = likedProblems.map((p) => {
    const score = p.topicTags.reduce(
      (sum, tag) => sum + (scoredTags[tag.name] || 0),
      0,
    )
    return { problem: p, score }
  })

  scoredLiked.sort((a, b) => b.score - a.score)
  const finalRecommendations: any[] = scoredLiked.map((e) => e.problem)

  if (finalRecommendations.length < 10) {
    const excludeIds = new Set([
      ...completedIds,
      ...likedUnfinishedIds.map((id) => id.toString()),
    ])

    const topTags = Object.entries(scoredTags)
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag)
      .slice(0, 5)

    const extraProblems = await Problem.find({
      _id: { $nin: Array.from(excludeIds) },
      topicTags: { $elemMatch: { name: { $in: topTags } } },
    }).lean()

    const scoredExtra = extraProblems
      .map((p) => {
        const score = p.topicTags.reduce(
          (sum, tag) => sum + (scoredTags[tag.name] || 0),
          0,
        )
        return { problem: p, score }
      })
      .sort((a, b) => b.score - a.score)

    for (const rec of scoredExtra) {
      if (finalRecommendations.length >= 10) break
      finalRecommendations.push(rec.problem)
    }
  }

  return finalRecommendations
}

const toggleProblemStatus = async (
  user: Iuser,
  problemId: string,
  title: string,
  type: 'complete' | 'like',
) => {
  const problem = await Problem.findById(problemId)
  if (!problem) {
    throw new ApiError(404, 'Problem not found')
  }
  const timestamp = Date.now()
  const targetListName =
    type === 'complete' ? 'completedProblemsIDs' : 'likedProblemsIDs'
  const userList = user[targetListName] as IProblemRecord[]

  const existingIndex = userList.findIndex(
    (p) => p.problemId.toString() === problemId,
  )

  if (existingIndex !== -1) {
    userList.splice(existingIndex, 1)
  } else {
    const problemObjectId = new Types.ObjectId(problemId)
    userList.push({ problemId: problemObjectId, title, timestamp })
  }

  await user.save()
  return userList
}

const login = async (id: string, password: string) => {
  const user = await User.findOne({ id: String(id) })
  if (!user) {
    throw new ApiError(404, 'Invalid credentials')
  } else {
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      throw new ApiError(404, ' ID or password incorrec')
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
      expiresIn: '7d',
    })
    return token
  }
}

const register = async (id: string, password: string) => {
  const user = await User.findOne({ id })
  if (user) {
    throw new ApiError(404, 'user existed')
  }

  const newUser = new User({ id, password })
  await newUser.save()
  const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET!, {
    expiresIn: '7d',
  })
  return token
}

const setGoal = async (user: Iuser, goal: string) => {
  const currentTime = Date.now()
  user.goals.push({
    goal,
    timestamp: currentTime,
  })
  if (user.goals.length > 100) {
    user.goals = user.goals.slice(-100)
  }
  await user.save()
  return user.goals
}
export const UserService = {
  checkToken,
  getUserByToken,
  generateTagNGoalBasedRecommendation,
  toggleProblemStatus,
  login,
  register,
  setGoal,
}
