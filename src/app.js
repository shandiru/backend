import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';

const app = express();

app.use(cors({ origin: 'https://admin-two-xi-55.vercel.app', credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);

export default app;