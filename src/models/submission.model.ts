import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface ISubmission extends Document {
  userId: Types.ObjectId
  problemId: Types.ObjectId
  code: string
  lang: string
  timestamp: Date
  embedding?: number[]
}

const submissionSchema = new Schema<ISubmission>({
  userId: { type: Schema.Types.ObjectId, required: true },
  problemId: { type: Schema.Types.ObjectId, required: true },
  code: { type: String },
  lang: { type: String },
  timestamp: { type: Date, default: Date.now },
  embedding: { type: [Number] },
})

const Submission: Model<ISubmission> = mongoose.model<ISubmission>(
  'Submission',
  submissionSchema,
)

export default Submission
