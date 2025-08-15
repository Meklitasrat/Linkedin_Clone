import express from 'express';
import dotenv from 'dotenv'
import authRouter from './routes/auth.route.js';
import userRouter from './routes/user.route.js';
import postRouter from './routes/post.route.js';
import notificationRouter from './routes/notification.route.js';
import connectionRequestRouter from './routes/connection.route.js';
import { connectDB } from './lib/db.js';
import { protectRoute } from './middleware/auth.middleware.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.resolve(__filename);

if(process.env.NODE_ENV !== "production"){
    app.use(cors({
        origin: 'http://localhost:5173',
        credentials: true
    }))
}

app.use(express.json({limit: '5mb'}))  // To Parse request bodies as Json and will limit payload data.
app.use(cookieParser());

app.use('/api/v1/auth', authRouter);
app.use(protectRoute);
app.use('/api/v1/users', userRouter)
app.use('/api/v1/posts', postRouter)
app.use('/api/v1/notifications', notificationRouter)
app.use('/api/v1/connections', connectionRequestRouter)

// if we are on production we want to use the dist (static file)

if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(frontendPath));

  app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });

  app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

app.listen(PORT, ()=>{
    console.log(`Server listening on port ${PORT}`)
    connectDB()
});
