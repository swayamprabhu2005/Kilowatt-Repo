import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { apiRouter } from './routes.js';
import { requestLogger } from './middleware/logger.js';
import { errorHandler } from './middleware/error-handler.js';

export const app = express();

app.use(cors({
  origin: true, // Allow frontend dev server and local origins
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Mount API routes
app.use('/api', apiRouter);

// Centralized error handling
app.use(errorHandler);
