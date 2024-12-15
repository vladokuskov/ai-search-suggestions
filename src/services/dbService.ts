import mongoose from 'mongoose';
import process from 'process';
import ArticleNotesVector from '@/models/ArticleNotesVector';

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

      await this.setupIndexes();

      console.log('Connected to MongoDB via Mongoose');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw error;
    }
  }

  async createSearchIndexes(collectionName, indexes) {
    try {
      const collection = mongoose.connection.collection(collectionName);

      const existingIndexes = await collection.listSearchIndexes().toArray();

      for (const index of indexes) {
        const indexExists = existingIndexes.some((idx) => idx.name === index.name);

        if (!indexExists) {
          await collection.createSearchIndex(index);
          console.log(`Index '${index.name}' created for collection '${collectionName}'.`);
        } else {
          console.log(`Index '${index.name}' already exists in collection '${collectionName}'.`);
        }
      }
    } catch (err) {
      console.error(`Failed to create search indexes for collection '${collectionName}':`, err.message);
    }
  }

  async setupIndexes() {
    await this.createSearchIndexes(ArticleNotesVector.collection.name, [
      {
        name: 'article_notes_vector',
        type: 'vectorSearch',
        definition: {
          fields: [
            {
              type: 'vector',
              numDimensions: 1536,
              path: 'vector',
              similarity: 'cosine',
            },
          ],
        },
      },
    ]);
  }
}

const databaseService = new DatabaseService();
export default databaseService;
