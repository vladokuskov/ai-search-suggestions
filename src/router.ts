import express from 'express';
import aiController from '@/controllers/aiController';
import articleController from '@/controllers/articleController';

const router = express.Router();

router.use('/ai', aiController);
router.use('/article', articleController);

export default router;
