import mongoose, { Schema, Document } from 'mongoose'

interface TopicTag {
  name: string;
  slug: string;
}
const topicTagSchema = new Schema<TopicTag>({
  name: { type: String, required: true },
  slug: { type: String, required: true }
});

interface Iproblem extends Document {
  problemId: string;
  title: string;
  content: string;
  difficulty: string;
  likes: number;
  dislikes: number;
  exampleTestcases: string;
  codeSnippets: { lang: string, code: string }[];
  topicTags: TopicTag[];
  stats: {
    totalAccepted: string;
    totalSubmission: string;
    totalAcceptedRaw: number;
    totalSubmissionRaw: number;
    acRate: string;
  };
  hints: string[];
}

const problemSchema = new Schema<Iproblem>({
  problemId: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  difficulty: { type: String, required: true },
  likes: { type: Number, required: true },
  dislikes: { type: Number, required: true },
  exampleTestcases: { type: String, required: true },
  topicTags: { type: [topicTagSchema], required: true },
  codeSnippets: [{
    lang: { type: String, required: true },
    code: { type: String, required: true }
  }],
  stats: {
    totalAccepted: { type: String, required: true },
    totalSubmission: { type: String, required: true },
    totalAcceptedRaw: { type: Number, required: true },
    totalSubmissionRaw: { type: Number, required: true },
    acRate: { type: String, required: true }
  },
  hints: { type: [String], required: true }
});


const Problem = mongoose.model<Iproblem>('problem', problemSchema)

export default Problem
