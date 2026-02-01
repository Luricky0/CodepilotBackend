// src/index.ts
import express from 'express'
import connectDB from './config/db'
import problemRoutes from './routes/problem.routes'
import userRoutes from './routes/user.routes'
import aiRoutes from './routes/ai.routes'
import cors from 'cors'
import dotenv from 'dotenv'
import { protect } from './middleware/protect'
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: { message: 'Too many login attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});


dotenv.config()
const app = express()
const PORT = process.env.PORT || 5000
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL 
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS Not Allowed by Railway'));
      }
    },
    credentials: true,
  })
);
app.use(express.json())
connectDB()

app.get('/', (req, res) => {
  res.send('API is running...')
})
app.use('/api', userRoutes)
// app.use('/api/users/login', loginLimiter);
app.use('/api', protect, problemRoutes)
app.use('/api', protect, aiRoutes)


app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
