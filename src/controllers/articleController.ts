import express, {Request, Response} from 'express';
import Article from '@/models/Article';
import aiService from '@/services/aiService';
import {TextTab} from '@/types/TextTab';

const articleController = express.Router();

const createArticle = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    const textTabs = req.body.textTabs as TextTab[];
    const content = textTabs.map((textTab: TextTab) => textTab.text);

    const embeddings = await aiService.getEmbeddings(content.join('') || '');

    const article = new Article({
      ...data,
      embeddings,
    });

    await article.save();
    res.status(200).send('Article created and indexed successfully');
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).send('Internal Server Error');
  }
};

articleController.post('/', createArticle);

export default articleController;
