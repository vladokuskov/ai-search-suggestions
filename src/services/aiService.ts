import openAiService from '@/services/openAiService';
import Article from '@/models/Article';

class AiService {
  async articleSearchSuggestions(query: string) {
    const queryEmbeddings = await aiService.getEmbeddings(query);

    const pipeline: any[] = [
      {
        $vectorSearch: {
          index: 'vector_index',
          queryVector: queryEmbeddings,
          path: 'embeddings',
          exact: true,
          limit: 3,
        },
      },
      {
        $project: {
          _id: 0,
          'textTabs.text': 1,
          score: {
            $meta: 'vectorSearchScore',
          },
        },
      },
    ];

    const result = await Article.aggregate(pipeline);

    const arrayOfQueryDocs = [];

    for await (const doc of result) {
      arrayOfQueryDocs.push(doc);
    }

    return arrayOfQueryDocs;

    // const completionResponse = await openAiService.getOpenAi().chat.completions.create({
    //   model: 'gpt-4o-mini',
    //   messages: [
    //     {
    //       role: 'system',
    //       content: `Behave like you search assistant for application articles. Provide response only in raw text format, without any markdown formatting. Use commas as separators. You have the knowledge of only the following articles that are relevant to the user right now: [${JSON.stringify(
    //         contextKnowledge,
    //       )}].`,
    //     },
    //     {
    //       role: 'user',
    //       content: 'Generate 3 questions based on articles', // Just an example
    //     },
    //   ],
    // });

    // return completionResponse.choices[0].message.content;
  }

  async getEmbeddings(data: string) {
    if (!data) {
      throw new Error('Data for embedding cannot be empty');
    }

    try {
      const ai = openAiService.getOpenAi();
      const embedding = await ai.embeddings.create({
        model: 'text-embedding-3-small',
        dimensions: 1024,
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
