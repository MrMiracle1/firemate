import { Router, Request, Response } from 'express';
import { transactionService } from '../services/transactionService';

const router = Router();

// 获取所有流水
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { limit = 20, offset = 0 } = req.query;
    const transactions = await transactionService.getAll(userId, {
      limit: Number(limit),
      offset: Number(offset)
    });
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// 创建流水
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    console.log('Creating transaction:', JSON.stringify(req.body));
    const transaction = await transactionService.create(userId, req.body);
    res.status(201).json(transaction);
  } catch (error: any) {
    console.error('Error creating transaction:', error.message);
    res.status(500).json({ error: error.message || 'Failed to create transaction' });
  }
});

// 删除流水
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    await transactionService.delete(userId, id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

// 更新流水
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const transaction = await transactionService.update(userId, id, req.body);
    res.json(transaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

export default router;
