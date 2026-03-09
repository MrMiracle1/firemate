import { Router, Request, Response } from 'express';
import { budgetService } from '../services/budgetService';

const router = Router();

// 获取预算
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { month } = req.query;
    const budget = await budgetService.getByMonth(userId, month as string);
    res.json(budget);
  } catch (error) {
    console.error('Error fetching budget:', error);
    res.status(500).json({ error: 'Failed to fetch budget' });
  }
});

// 创建/更新预算
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const budget = await budgetService.upsert(userId, req.body);
    res.json(budget);
  } catch (error) {
    console.error('Error upserting budget:', error);
    res.status(500).json({ error: 'Failed to upsert budget' });
  }
});

export default router;
