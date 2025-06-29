import dotenv from 'dotenv';
dotenv.config();

import mongoose from "mongoose";
import cloudinary from "cloudinary"; // ✅ Add this
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT;

mongoose.connect(process.env.DB)

import bodyParser from 'body-parser'

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

app.use(cors({
  origin: 'snap-pdf-frontend-eight.vercel.app',
  credentials: true, 
}));

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieParser()); // ✅ Enable cookie parsing


//User Routes
import UserRouter from './routes/user.routes.js';
app.use('/api/user', UserRouter)

//Chat Routes
import chatRoutes from './routes/chatRoutes.js';
app.use('/api/chat', chatRoutes);

//storage router
import storageRouter from './routes/storage.routes.js';
app.use("/api/storage", storageRouter)

//plan router
import planRouter from './routes/plan.routes.js';
app.use('/api/plan', planRouter);

// Start the server
app.listen(PORT, () => {
  console.log(`AI Chat Service running on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.send("Backend is working!");
});
