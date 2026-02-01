import { ObjectId } from 'mongoose'
import Problem from '../models/problem.model'
import { Iuser } from '../models/user.model'
import { ApiError } from '../utils/ApiError'

const escapeRegex = (text: string): string => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
}

const getPage = async (
  page: number,
  limit: number,
  skip: number,
  searchQuery: string | undefined,
  difficultyFilter: string | undefined,
  likedOnly: boolean,
  completedOnly: boolean,
  user: Iuser | null
) => {
  const query: any = {}

  if (searchQuery && typeof searchQuery === 'string') {
    const fuzzy = searchQuery
      .split('')
      .map((c) => escapeRegex(c))
      .join('.*')
    query.title = { $regex: fuzzy, $options: 'i' }
  }

  if (difficultyFilter && difficultyFilter !== 'All') {
    query.difficulty = difficultyFilter
  }

  if (likedOnly) {
    if (!user) {
      throw new ApiError(400, 'No user')
    } else {
      const likedIds = user?.likedProblemsIDs.map((p) => p.problemId)
      query._id = { $in: likedIds }
    }
  }

  if (completedOnly) {
    if (!user) {
      throw new ApiError(400, 'No user')
    } else {
      const completedIds = user?.completedProblemsIDs.map((p) => p.problemId)
      query._id = { $in: completedIds }
    }
  }

  const [problems, totalproblems] = await Promise.all([
    Problem.find(query).skip(skip).limit(limit),
    Problem.countDocuments(query),
  ])
  return {
    page,
    totalPages: Math.ceil(totalproblems / limit),
    totalproblems,
    problems,
  }
}

const getProblemByID = async (id: string) => {
  const problem = await Problem.findById(id)
  if (!problem) throw new ApiError(404, 'No such problem')
  return problem
}

const ProblemService = {
  getPage,
  getProblemByID,
}
export default ProblemService
