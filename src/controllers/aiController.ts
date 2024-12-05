import express, {Request, Response} from 'express';
import aiService from '@/services/aiService';

const aiController = express.Router();

const getAiSearchSuggestions = async (req: Request, res: Response) => {
  const query = req.params.q;

  if (!query) {
    res.status(404).send({error: 'No query provided'});
    return;
  }

  const responseText = await aiService.articleSearchSuggestions(query);

  if (!responseText) {
    res.status(422).send({error: 'No results found for query'});
    return;
  }

  res.status(200).send({data: JSON.parse(responseText)});
};

aiController.get('/search/article/suggestions/:q', getAiSearchSuggestions);

export default aiController;
