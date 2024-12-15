import express from 'express';
import articleController from '@/controllers/articleController';

const router = express.Router();

router.use('/article', articleController);

export default router;
