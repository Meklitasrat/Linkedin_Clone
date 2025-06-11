import express from 'express';
import dotenv from 'dotenv'
import authRouter from './routes/auth.route.js';
import userRouter from './routes/user.route.js';
import postRouter from './routes/post.route.js';
import { connectDB } from './lib/db.js';
import { protectRoute } from './middleware/auth.middleware.js';
import cookieParser from 'cookie-parser';

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(express.json()) // To Parse request bodies as Json
app.use(cookieParser);

app.use('/api/v1/auth', authRouter);
app.use(protectRoute);
app.use('/api/v1/user', userRouter)
app.use('/api/v1/posts', postRouter)
app.listen(PORT, ()=>{
    console.log(`Server listening on port ${PORT}`)
    connectDB()
});
