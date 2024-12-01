import mongoose, {Document} from 'mongoose';

export interface IArticleVector extends Document {
  title: string;
  content: string;
}

const articleVectorSchema = new mongoose.Schema<IArticleVector>({
  title: {type: String, required: true},
  content: {type: String, required: true},
});

const ArticleVector = mongoose.model('articles_vectors', articleVectorSchema);

export default ArticleVector;
