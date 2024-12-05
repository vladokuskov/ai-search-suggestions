import mongoose, {Document, Schema} from 'mongoose';
import {TextTab} from '@/types/TextTab';

export interface IArticle extends Document {
  id: string;
  title: string;
  textTabs: TextTab[];
  embeddings?: number[];
}

const article = new Schema<IArticle>({
  id: {type: String, required: true},
  title: {type: String, required: true},
  textTabs: [
    {
      id: {type: String, unique: false},
      title: {type: String},
      text: {type: String},
    },
  ],
  embeddings: {type: Array<number>, required: false},
});

const Article = mongoose.model('articles', article);

export default Article;
