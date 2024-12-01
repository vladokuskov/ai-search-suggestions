import {VectorStoreIndex} from 'llamaindex';
import vectorSearchService from '@/services/vectorSearchService';
import openAiService from '@/services/openAiService';
import ArticleVector from '@/models/ArticleVector';

class AiService {
  async articleSearchSuggestions(query: string) {
    const searchInstance = await vectorSearchService.getVectorSearchInstance(
      ArticleVector.collection.name,
      `${ArticleVector.collection.name}_index`,
    );

    const index = await VectorStoreIndex.fromVectorStore(searchInstance);
    const retriever = index.asRetriever({similarityTopK: 10});

    const queryEngine = index.asQueryEngine({retriever});
    const {sourceNodes} = await queryEngine.query({query});
    let contextKnowledge: any[] = []; // Context that only have query match will be selected. e.g. all article with query match
    if (sourceNodes) {
      contextKnowledge = sourceNodes
        .filter((match) => match.score && match.score > 0.9)
        .map((match) => JSON.stringify(match.node.metadata));
    }

    const completionResponse = await openAiService.getOpenAi().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Behave like you search assistant for application articles. Provide response only in raw text format, without any markdown formatting. Use commas as separators. You have the knowledge of only the following articles that are relevant to the user right now: [${JSON.stringify(
            contextKnowledge,
          )}].`,
        },
        {
          role: 'user',
          content: 'Generate 3 questions based on articles', // Just an example
        },
      ],
    });

    return completionResponse.choices[0].message.content;
  }
}

const aiService = new AiService();
export default aiService;
