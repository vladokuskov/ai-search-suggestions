import mongoose, {Document, Schema} from 'mongoose';

export interface IArticleNotesVector extends Document {
  id: string;
  content: string;
  vector: number[];
  metadata: Record<string, any>;
}

const articleNotesVector = new Schema<IArticleNotesVector>({
  id: {type: String},
  content: {type: String},
  vector: {type: [Number]},
  metadata: {type: Object},
});

const ArticleNotesVector = mongoose.model('article_notes_vector', articleNotesVector);

export default ArticleNotesVector;
