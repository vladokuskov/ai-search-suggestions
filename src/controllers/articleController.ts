import express, {Request, Response} from 'express';
import {Document, VectorStoreIndex, storageContextFromDefaults} from 'llamaindex';
import vectorSearchService from '@/services/vectorSearchService';
import ArticleVector from '@/models/ArticleVector';
import Article from '@/models/Article';

const articleController = express.Router();

const createArticle = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    const article = new Article(data);

    await article.save();

    const document = new Document({
      text: article.title,
      metadata: JSON.parse(JSON.stringify(article)),
    });

    const searchInstance = await vectorSearchService.getVectorSearchInstance(
      ArticleVector.collection.name,
      `${ArticleVector.collection.name}_index`,
    );
    const storageContext = await storageContextFromDefaults({vectorStore: searchInstance});
    await VectorStoreIndex.fromDocuments([document], {storageContext});

    res.status(200).send('Articles created and indexed successfully');
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).send('Internal Server Error');
  }
};

articleController.post('/', createArticle);

export default articleController;
