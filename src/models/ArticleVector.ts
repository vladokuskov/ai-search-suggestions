import mongoose, {Document, Schema} from 'mongoose';

export interface IArticleVector extends Document {
  title: string;
  content: string;
  embedding: number[];
  metadata?: Record<string, any>;
}

const articleVector = new Schema<IArticleVector>({
  title: {type: String, required: true},
  content: {type: String, required: true},
  embedding: {type: [Number], required: true},
  metadata: {type: Schema.Types.Mixed},
});

const ArticleVector = mongoose.model('articles_vectors', articleVector);

export default ArticleVector;
