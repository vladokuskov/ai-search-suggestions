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
      id: {type: String, index: false, unique: false},
      title: {type: String, index: false},
      text: {type: String, index: true},
    },
  ],
  embeddings: {type: Array<number>, required: false, index: true},
});

const Article = mongoose.model('articles', article);

export default Article;
