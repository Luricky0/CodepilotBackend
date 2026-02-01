// src/config/db.ts
import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL!!, {
      dbName: 'codepilot',
    })
    console.log(`✅ MongoDB connected: ${conn.connection.host}`)
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    process.exit(1)
  }
}

export default connectDB
