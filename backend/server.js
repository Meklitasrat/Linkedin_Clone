import express from 'express';
import dotenv from 'dotenv'
import authRouter from './routes/auth.route.js';
import { connectDB } from './lib/db.js';

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(express.json()) // To Parse request bodies as Json

app.use('/api/v1/auth', authRouter);

app.listen(PORT, ()=>{
    console.log(`Server listening on port ${PORT}`)
    connectDB()
})