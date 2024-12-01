import express, {Request, Response} from 'express';
import aiService from '@/services/aiService';

const aiController = express.Router();

const getAiSearchSuggestions = async (req: Request, res: Response) => {
  const query = req.params.q;

  if (!query) {
    res.status(404).send({error: 'No search query provided.'});
    return;
  }

  await aiService.articleSearchSuggestions(query);

  res.status(200).send('AI Search suggestions');
};

aiController.get('/search/article/suggestions/:q', getAiSearchSuggestions);

export default aiController;