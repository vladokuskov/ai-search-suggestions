import mongoose from 'mongoose';
import process from 'process';
import {MongoDBAtlasVectorSearch} from 'llamaindex';

class DatabaseService {
  connection = null;
  private readonly dbName: string;

  constructor() {
    this.connection = null;
    this.dbName = 'ai_search_suggestions_db';
  }

  async connect() {
    try {
      this.connection = await mongoose.connect(process.env.MONGODB_DSN, {
        dbName: this.dbName,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      // await this.createIndexes(); // TODO: Handle case when indexes exist
      console.log('Connected to MongoDB via Mongoose');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw error;
    }
  }

  public articlesVectorSearch() {
    const client = mongoose.connection.getClient();
    return new MongoDBAtlasVectorSearch({
      mongodbClient: client,
      dbName: this.dbName,
      indexName: 'articles_vectors_index',
      collectionName: 'articles_vectors',
    });
  }

  getDbName() {
    return this.dbName;
  }

  getClient() {
    return mongoose.connection.getClient();
  }
}

const databaseService = new DatabaseService();
export default databaseService;
