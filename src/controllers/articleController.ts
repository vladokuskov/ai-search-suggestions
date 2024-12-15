import express, {Request, Response} from 'express';
import Article from '@/models/Article';
import {Note} from '@/types/Note';
import aiService from '@/services/aiService';
import {RecursiveCharacterTextSplitter} from 'langchain/text_splitter';
import ArticleNotesVector from '@/models/ArticleNotesVector';
import articleService from '@/services/articleService';

const articleController = express.Router();

const aiSearchSuggestions = async (req: Request, res: Response) => {
  const query = req.params.q;

  if (!query) {
    res.status(404).send({error: 'No query provided'});
    return;
  }

  const responseText = await articleService.articleAiSearch(query);

  if (!responseText) {
    res.status(422).send({error: 'No results found for query'});
    return;
  }

  res.status(200).send({data: JSON.parse(responseText)});
};

const createArticle = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    const notes = req.body.notes as Note[];
    if (!notes) throw new Error('Notes not found in request body.');

    const notesContent = notes.map((note: Note) => note.text).join('');

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 600,
      chunkOverlap: 100,
    });

    const article = new Article(data);

    const chunks = await splitter.splitText(notesContent);

    const vectorPromises = chunks.map(async (chunk) => {
      const vector = await aiService.getEmbeddings(chunk);
      return {vector, content: chunk};
    });

    const vectors = await Promise.all(vectorPromises);

    const createdVectors = vectors.map(
      (vector) => new ArticleNotesVector({...vector, metadata: {articleId: article.id}}),
    );

    await ArticleNotesVector.insertMany(createdVectors);
    await article.save();

    res.status(200).send('Article created and vectors created successfully');
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
};

articleController.post('/', createArticle);
articleController.get('/search/ai/suggestions/:q', aiSearchSuggestions);

export default articleController;
