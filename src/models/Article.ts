import mongoose, {Document, Schema} from 'mongoose';
import {Note} from '@/types/Note';

export interface IArticle extends Document {
  id: string;
  title: string;
  notes: Note[];
}

const article = new Schema<IArticle>({
  id: {type: String, required: true},
  title: {type: String, required: true},
  notes: [
    {
      id: {type: String, unique: false},
      title: {type: String},
      text: {type: String},
    },
  ],
});

const Article = mongoose.model('articles', article);

export default Article;
