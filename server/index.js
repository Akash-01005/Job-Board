import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './src/routes/auth.js';
import jobRoutes from './src/routes/jobs.js';
import parserRoutes from './src/routes/parser.js';
import matchingRoutes from './src/routes/matching.js';
import adminRoutes from './src/routes/admin.js';
import { errorHandler } from './src/middlewares/errorHandler.js';
import connectDB from './src/libs/dbConnections.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: ['http://localhost:5000', 'http://localhost:5001'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/parser', parserRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});