import mongoose, {Document, Schema} from 'mongoose';

export interface IArticle extends Document {
  title: string;
  content: string;
}

const article = new Schema<IArticle>({
  title: {type: String, required: true},
  content: {type: String, required: true},
});

const Article = mongoose.model('articles', article);

export default Article;
