import OpenAI from 'openai';
import process from 'process';

class OpenAiService {
  openai: OpenAI;

  init() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  getOpenAi() {
    return this.openai;
  }
}

const openAiService = new OpenAiService();
export default openAiService;
