import OpenAI from 'openai';
import process from 'process';

class AiService {
  openai: OpenAI;

  init() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  getOpenAi() {
    return this.openai;
  }

  public async getEmbeddings(data: string, model = 'text-embedding-ada-002') {
    if (!data) {
      throw new Error('Data for embedding cannot be empty');
    }

    try {
      const ai = this.getOpenAi();
      const embedding = await ai.embeddings.create({
        model,
        input: data,
      });

      if (embedding.data && embedding.data.length > 0) {
        return embedding.data[0].embedding;
      }

      throw new Error('Failed to generate embeddings');
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw error;
    }
  }
}

const aiService = new AiService();
export default aiService;
