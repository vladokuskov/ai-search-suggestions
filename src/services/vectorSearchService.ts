import {MongoDBAtlasVectorSearch} from 'llamaindex';
import dbService from '@/services/dbService';

class VectorSearchService {
  private dbService;

  constructor() {
    this.dbService = dbService;
  }

  async getVectorSearchInstance(collectionName: string, indexName: string) {
    const client = this.dbService.getClient();
    return new MongoDBAtlasVectorSearch({
      mongodbClient: client,
      dbName: this.dbService.getDbName(),
      collectionName,
      indexName,
    });
  }
}

export default new VectorSearchService();
