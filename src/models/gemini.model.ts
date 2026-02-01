import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
import { ApiError } from '../utils/ApiError'
import { Agent } from 'undici';
dotenv.config()
const directAgent = new Agent({
  connect: {
    timeout: 30000,
  }
});

const apiKey = (process.env.GEMINI_API_KEY || '').trim();
const genAI = new GoogleGenerativeAI(apiKey);

export const createChat = async (prompt: string) => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash' 
    }, {
      baseUrl: "https://generativelanguage.googleapis.com",
    });

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err: any) {
    console.error("Gemini Error Detail:", err);
    throw err;
  }
};
const getEmbedding = async (text: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' })
    const result = await model.embedContent(text)
    const embedding = result.embedding
    return embedding.values
  } catch (err: any) {
    throw new ApiError(500, `Embedding Error: ${err.message}`)
  }
}

const gemini = {
  createChat,
  getEmbedding,
}

export default gemini
