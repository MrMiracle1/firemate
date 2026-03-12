import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import accountsRouter from './routes/accounts';
import transactionsRouter from './routes/transactions';
import budgetsRouter from './routes/budgets';
import goalsRouter from './routes/goals';
import categoriesRouter from './routes/categories';
import { authMiddleware } from './middleware/auth';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Public Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Firemate API is running', version: '1.0.0' });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// API Routes - 需要认证
app.use('/api/accounts', authMiddleware, accountsRouter);
app.use('/api/transactions', authMiddleware, transactionsRouter);
app.use('/api/budgets', authMiddleware, budgetsRouter);
app.use('/api/goals', authMiddleware, goalsRouter);
app.use('/api/categories', authMiddleware, categoriesRouter);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🔥 Firemate API server running on port ${PORT}`);
});

export default app;
