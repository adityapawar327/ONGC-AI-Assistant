import { getGeminiModel } from '../config/gemini.js';

class QueryExpansionService {
  constructor() {
    this.model = getGeminiModel();
  }

  async expandQuery(originalQuery) {
    try {
      const prompt = `Given the user query, generate 2-3 semantically similar alternative phrasings that would help retrieve relevant information. Keep them concise.

Original Query: "${originalQuery}"

Generate alternative queries (one per line):`;

      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 200
        }
      });

      const response = result.response.text();
      const alternatives = response
        .split('\n')
        .filter(line => line.trim() && !line.includes(':'))
        .map(line => line.replace(/^[-*•]\s*/, '').trim())
        .slice(0, 3);

      return [originalQuery, ...alternatives];
    } catch (error) {
      console.error('Query expansion error:', error);
      return [originalQuery];
    }
  }

  async extractKeywords(query) {
    try {
      const prompt = `Extract 3-5 key terms or concepts from this query that would be useful for document search:

Query: "${query}"

Key terms (comma-separated):`;

      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 100
        }
      });

      const response = result.response.text();
      return response
        .split(',')
        .map(term => term.trim())
        .filter(term => term.length > 0);
    } catch (error) {
      console.error('Keyword extraction error:', error);
      return query.split(/\s+/);
    }
  }
}

export default new QueryExpansionService();
