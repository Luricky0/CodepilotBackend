import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcryptjs'
import { Types } from 'mongoose'

export interface IProblemRecord {
  problemId: Types.ObjectId
  timestamp: number
  title: string
}
export interface IGoalRecord {
  goal: string
  timestamp: number
}
export interface Iuser extends Document {
  _id: Types.ObjectId
  id: string
  password: string
  comparePassword(candidatePassword: string): Promise<boolean>
  isModified(path: string): boolean
  likedProblemsIDs: IProblemRecord[]
  completedProblemsIDs: IProblemRecord[]
  goals: IGoalRecord[]
}

const userSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  likedProblemsIDs: {
    type: [
      {
        problemId: { type: Schema.Types.ObjectId },
        timestamp: { type: Number, default: Date.now },
        title: { type: String, default: '' },
      },
    ],
    default: [],
  },
  completedProblemsIDs: {
    type: [
      {
        problemId: { type: Schema.Types.ObjectId },
        timestamp: { type: Number, default: Date.now },
        title: { type: String, default: '' },
      },
    ],
    default: [],
  },
  goals: {
    type: [
      {
        goal: { type: String },
        timestamp: { type: Number, default: Date.now },
      },
    ],
  },
})

userSchema.pre('save', async function (this: Iuser) {
  if (!this.isModified('password')) return
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

userSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  return await bcrypt.compare(candidatePassword, this.password)
}

const user = mongoose.model<Iuser>('user', userSchema)

export default user
