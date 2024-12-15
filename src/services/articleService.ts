import ArticleNotesVector from '@/models/ArticleNotesVector';
import aiService from '@/services/aiService';

class ArticleService {
  async articleAiSearch(query: string) {
    const queryEmbeddings = await aiService.getEmbeddings(query);

    const pipeline: any[] = [
      {
        $vectorSearch: {
          queryVector: queryEmbeddings,
          path: 'vector',
          limit: 3,
          index: 'article_notes_vector',
          exact: true,
        },
      },
      {
        $project: {
          _id: 0,
          content: 1,
          score: {
            $meta: 'vectorSearchScore',
          },
        },
      },
    ];

    const result = await ArticleNotesVector.aggregate(pipeline);

    const content = [];

    for await (const doc of result) {
      if (doc.score >= 0.9) {
        content.push({content: doc.content});
      }
    }

    if (!content.length) return;

    const completionResponse = await aiService.getOpenAi().chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: {type: 'json_object'},
      messages: [
        {
          role: 'system',
          content: `
           1. You a search assistant.
           2. Formulate up to three questions or answers about the given text based on [query]. Ensure all results are distinct.
           3. Title should have the question or answer to [query]
           4. Your response should be in json format.`,
        },
        {
          role: 'assistant',
          content: `Your current knowledge base: [${JSON.stringify(content)}].`,
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
                    },
                    required: ['title'],
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
}

const articleService = new ArticleService();
export default articleService;
