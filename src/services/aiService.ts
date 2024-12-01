import {VectorStoreIndex} from 'llamaindex';
import vectorSearchService from '@/services/vectorSearchService';
import ArticleVector from '@/schemas/ArticleVectorSchema';
import openAiService from '@/services/openAiService';

class AiService {
  async articleSearchSuggestions(query: string) {
    console.log('START GENERATE SUGGESTIONS');
    console.log('QUERY: ', query);

    const query_test = 'Write me all article titles';
    const searchInstance = await vectorSearchService.getVectorSearchInstance(
      ArticleVector.collection.name,
      `${ArticleVector.collection.name}_index`,
    );

    const index = await VectorStoreIndex.fromVectorStore(searchInstance);
    const retriever = index.asRetriever({similarityTopK: 10});

    const queryEngine = index.asQueryEngine({retriever});
    const {sourceNodes} = await queryEngine.query({query: query_test});
    let contextKnowledge: any[] = [];
    if (sourceNodes) {
      contextKnowledge = sourceNodes
        .filter((match) => match.score && match.score > 0.9)
        .map((match) => JSON.stringify(match.node.metadata));
    }

    const completionResponse = await openAiService.getOpenAi().chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Behave like you search assistant for application articles.`,
        },
        {
          role: 'assistant',
          content: `You have the knowledge of only the following articles that are relevant to the user right now: [${JSON.stringify(
            contextKnowledge,
          )}].`,
        },
        {
          role: 'user',
          content: query_test,
        },
      ],
    });

    return completionResponse.choices[0].message.content;
  }
}

const aiService = new AiService();
export default aiService;
