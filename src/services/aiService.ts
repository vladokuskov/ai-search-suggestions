import openAiService from '@/services/openAiService';
import Article from '@/models/Article';

class AiService {
  async articleSearch(query: string) {
    const queryEmbeddings = await aiService.getEmbeddings(query);

    const pipeline: any[] = [
      {
        $vectorSearch: {
          queryVector: queryEmbeddings,
          path: 'embeddings',
          limit: 3,
          index: 'article_text',
          exact: true,
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

    const arrayOfText = [];

    for await (const doc of result) {
      if (doc.score >= 0.87) {
        const text = doc.textTabs.map((note) => note.text).join('');
        arrayOfText.push({text});
      }
    }

    if (!arrayOfText.length) return;

    const completionResponse = await openAiService.getOpenAi().chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: {type: 'json_object'},
      messages: [
        {
          role: 'system',
          content: `
           1. You a search assistant.
           2. Formulate up to three questions or answers about the given text based on [query] and provide the context that you used. Ensure all results are distinct.
           3. Title should have the question or answer to [query]
           4. Your response should be in json format.`,
        },
        {
          role: 'assistant',
          content: `Your current knowledge base: [${JSON.stringify(arrayOfText)}].`,
        },
        {
          role: 'user',
          content: `My query: ${query}`,
        },
      ],

      tools: [
        {
          type: 'function',
          function: {
            name: 'search_and_context',
            parameters: {
              type: 'object',
              properties: {
                results: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      title: {type: 'string'},
                      context: {type: 'string'},
                    },
                    required: ['title', 'context'],
                  },
                },
              },
              required: ['results'],
            },
          },
          strict: true,
        },
      ],

      tool_choice: {type: 'function', function: {name: 'search_and_context'}},
    });

    return completionResponse.choices[0].message.tool_calls[0].function.arguments;
  }

  async getEmbeddings(data: string, model = 'text-embedding-ada-002') {
    if (!data) {
      throw new Error('Data for embedding cannot be empty');
    }

    try {
      const ai = openAiService.getOpenAi();
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
