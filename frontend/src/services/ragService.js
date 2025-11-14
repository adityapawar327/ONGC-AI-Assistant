import geminiService from './geminiService';
import documentService from './documentService';
import ongcKnowledge from './ongcKnowledge';

class RAGService {
  async query(question, options = {}) {
    const {
      language = 'english',
      accuracyMode = 'moderate',
      contextWindow = 'medium'
    } = options;

    // Determine context window size
    const contextSizes = {
      short: 2,
      medium: 4,
      high: 8
    };
    const topK = contextSizes[contextWindow] || 4;

    // Search for relevant document chunks
    const relevantChunks = documentService.searchChunks(question, topK);

    // Build context
    let context = '';
    const sources = [];

    if (relevantChunks.length > 0) {
      context = relevantChunks.map((chunk, idx) => 
        `[Document ${idx + 1}] ${chunk.content}`
      ).join('\n\n');

      sources.push(...relevantChunks.map(chunk => ({
        content: chunk.content,
        preview: chunk.content.substring(0, 200) + '...',
        metadata: {
          source: chunk.source,
          relevanceScore: chunk.relevanceScore
        }
      })));
    }

    // Add ONGC knowledge base
    const ongcContext = ongcKnowledge.getContext();

    // Build prompt based on accuracy mode
    let systemPrompt = '';
    let hasContext = relevantChunks.length > 0;

    switch (accuracyMode) {
      case 'very_accurate':
        if (!hasContext) {
          return {
            answer: language === 'english' 
              ? "I don't have enough information in the uploaded documents to answer this question accurately. Please upload relevant documents first."
              : "मेरे पास इस प्रश्न का सटीक उत्तर देने के लिए अपलोड किए गए दस्तावेज़ों में पर्याप्त जानकारी नहीं है। कृपया पहले प्रासंगिक दस्तावेज़ अपलोड करें।",
            sources: [],
            context: false,
            confidence: 0
          };
        }
        systemPrompt = `You are an ONGC AI Assistant. Answer STRICTLY based on the provided documents. If the answer is not in the documents, say you don't have that information.

Context from documents:
${context}

ONGC Background:
${ongcContext}`;
        break;

      case 'moderate':
        systemPrompt = `You are an ONGC AI Assistant. Primarily use the provided documents, but you can supplement with general ONGC knowledge if needed.

${hasContext ? `Context from documents:\n${context}\n\n` : ''}ONGC Background:
${ongcContext}`;
        break;

      case 'creative':
        systemPrompt = `You are an ONGC AI Assistant with comprehensive knowledge. Use the provided context as a starting point, but feel free to provide additional relevant information.

${hasContext ? `Context from documents:\n${context}\n\n` : ''}ONGC Background:
${ongcContext}`;
        break;
    }

    // Add language instruction
    const languageInstruction = language === 'hindi'
      ? '\n\nIMPORTANT: Respond in Hindi (हिंदी में उत्तर दें).'
      : '\n\nIMPORTANT: Respond in English.';

    const fullPrompt = `${systemPrompt}${languageInstruction}\n\nQuestion: ${question}\n\nAnswer:`;

    try {
      const answer = await geminiService.generateResponse(fullPrompt);

      return {
        answer,
        sources,
        context: hasContext,
        confidence: hasContext ? 0.85 : 0.6
      };
    } catch (error) {
      console.error('RAG query error:', error);
      throw error;
    }
  }
}

export default new RAGService();
