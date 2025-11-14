import { getGeminiModel } from '../config/gemini.js';
import vectorStoreService from './vectorStore.js';
import ongcKnowledge from './ongcKnowledge.js';

class RAGService {
  constructor() {
    // Use Gemini 2.0 Flash with advanced configuration
    this.model = getGeminiModel('gemini-2.0-flash-exp');
    this.conversationHistory = new Map();
    
    // Load ONGC knowledge base
    ongcKnowledge.loadKnowledge();
  }

  async query(question, conversationId = 'default', language = 'english', accuracyMode = 'moderate', contextWindow = 'medium') {
    try {
      // Advanced semantic retrieval with re-ranking
      const relevantDocs = await this.advancedRetrieval(question, contextWindow);
      
      // Build structured context with metadata
      let context = this.buildStructuredContext(relevantDocs);
      
      // Add ONGC knowledge if no documents or in creative/moderate mode
      if (accuracyMode !== 'very_accurate' || relevantDocs.length === 0) {
        const ongcContext = ongcKnowledge.getContextualKnowledge(question);
        if (ongcContext) {
          context += ongcContext;
        }
      }
      
      // If no documents found and very accurate mode, provide strict response
      if (relevantDocs.length === 0 && accuracyMode === 'very_accurate') {
        return {
          answer: "I don't have any documents uploaded yet to answer your question. Please upload ONGC documents using the 📎 button below for accurate, document-based answers.",
          sources: [],
          context: false,
          confidence: 0
        };
      }

      // Get conversation history for context continuity
      const history = this.conversationHistory.get(conversationId) || [];

      // Create advanced prompt with grounding
      const prompt = this.buildAdvancedPrompt(question, context, history, language, accuracyMode, contextWindow);

      // Adjust generation parameters based on accuracy mode and context window
      const generationConfig = this.getGenerationConfig(accuracyMode, contextWindow);

      // Generate response with advanced parameters
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      });

      const response = result.response.text();

      // Update conversation history
      history.push(
        { role: 'user', content: question },
        { role: 'assistant', content: response }
      );
      if (history.length > 10) history.splice(0, 2);
      this.conversationHistory.set(conversationId, history);

      // Extract and enrich sources
      const sources = this.enrichSources(relevantDocs);

      return {
        answer: response,
        sources,
        context: relevantDocs.length > 0,
        confidence: this.calculateConfidence(relevantDocs, question)
      };
    } catch (error) {
      console.error('RAG query error:', error);
      
      // Check for API key issues
      if (error.message.includes('API key') || error.message.includes('403')) {
        throw new Error('API key issue detected. Please update your GOOGLE_API_KEY in backend/.env file with a new key from https://makersuite.google.com/app/apikey');
      }
      
      throw new Error('Failed to process query: ' + error.message);
    }
  }

  async advancedRetrieval(question, contextWindow = 'medium') {
    // Determine k based on context window size - increased for more context
    const kMap = {
      'short': 4,      // Increased from 3
      'medium': 8,     // Increased from 6
      'high': 15       // Increased from 10
    };
    const k = kMap[contextWindow] || 8;
    
    console.log(`📊 Context Window: ${contextWindow} - Retrieving ${k} chunks`);
    
    // Use hybrid search for better results - retrieve more candidates
    const candidates = await vectorStoreService.hybridSearch(question, k * 3);
    
    // Re-rank based on relevance and diversity
    const reranked = this.rerankDocuments(candidates, question);
    
    // Return top k after re-ranking
    return reranked.slice(0, k);
  }

  rerankDocuments(documents, query) {
    // Simple re-ranking based on keyword overlap and diversity
    const queryTerms = query.toLowerCase().split(/\s+/);
    
    return documents
      .map(doc => {
        const content = doc.pageContent.toLowerCase();
        const score = queryTerms.reduce((acc, term) => {
          return acc + (content.includes(term) ? 1 : 0);
        }, 0);
        return { doc, score };
      })
      .sort((a, b) => b.score - a.score)
      .map(item => item.doc);
  }

  buildStructuredContext(documents) {
    return documents
      .map((doc, idx) => {
        const source = doc.metadata.source || 'Unknown';
        const type = doc.metadata.type || 'document';
        return `[Document ${idx + 1}] (Source: ${source}, Type: ${type})
${doc.pageContent}
---`;
      })
      .join('\n\n');
  }

  buildAdvancedPrompt(question, context, history, language = 'english', accuracyMode = 'moderate', contextWindow = 'medium') {
    const historyText = history.length > 0
      ? `\nConversation History:\n${history.map(h => `${h.role}: ${h.content}`).join('\n')}\n`
      : '';

    const languageInstruction = language === 'hindi' 
      ? '\n\nIMPORTANT: Respond in Hindi (हिंदी में उत्तर दें). Use Devanagari script.'
      : '\n\nIMPORTANT: Respond in English.';

    // Accuracy mode instructions with context window guidance
    let accuracyInstruction = '';
    let lengthGuidance = '';
    
    // Add length guidance based on context window
    if (contextWindow === 'short') {
      lengthGuidance = '\n\nRESPONSE LENGTH: Keep your answer concise and focused (2-3 paragraphs maximum).';
    } else if (contextWindow === 'medium') {
      lengthGuidance = '\n\nRESPONSE LENGTH: Provide a balanced answer with good detail (3-5 paragraphs).';
    } else if (contextWindow === 'high') {
      lengthGuidance = '\n\nRESPONSE LENGTH: Provide a comprehensive, detailed answer. Use all available context to give thorough explanations (5-8 paragraphs or more if needed).';
    }
    
    if (accuracyMode === 'very_accurate') {
      accuracyInstruction = '\n\nACCURACY MODE: VERY ACCURATE (STRICT)\n- Answer ONLY based on the provided documents\n- If information is not in the documents, clearly state "This information is not available in the uploaded documents"\n- Do NOT use general knowledge or make assumptions\n- Be extremely precise and cite specific documents\n- If unsure, say you don\'t have enough information';
    } else if (accuracyMode === 'moderate') {
      accuracyInstruction = '\n\nACCURACY MODE: MODERATE (BALANCED)\n- Primarily base answers on the provided documents\n- You may supplement with relevant general knowledge when helpful\n- Clearly distinguish between document-based info and general knowledge\n- Cite documents when using their information\n- Be accurate but helpful';
    } else if (accuracyMode === 'creative') {
      accuracyInstruction = '\n\nACCURACY MODE: CREATIVE (FLEXIBLE)\n- Use documents as a foundation but feel free to expand\n- Apply general knowledge and reasoning\n- Provide comprehensive answers with context\n- Still cite documents when using their specific information\n- Be helpful and informative';
    }
    
    accuracyInstruction += lengthGuidance;

    if (!context || context.trim() === '') {
      if (accuracyMode === 'very_accurate') {
        return `You are a helpful AI assistant for ONGC (Oil and Natural Gas Corporation Limited). The user asked: "${question}"

Since no relevant documents are available in the knowledge base, you must respond: "I don't have any documents uploaded yet to answer this question. Please upload ONGC documents to get accurate, document-based answers."${languageInstruction}

Answer:`;
      }
      
      // Add ONGC general knowledge for non-strict modes
      const ongcGeneralContext = ongcKnowledge.getFullContext();
      
      return `You are a helpful AI assistant for ONGC (Oil and Natural Gas Corporation Limited), India's largest oil and gas exploration and production company. The user asked: "${question}"

${ongcGeneralContext}

Use the above ONGC information to provide a helpful response. Be professional and mention that users can upload specific ONGC documents for more detailed, document-based answers.${languageInstruction}${accuracyInstruction}

Answer:`;
    }

    return `You are an advanced AI assistant for ONGC (Oil and Natural Gas Corporation Limited), India's largest oil and gas exploration and production company. You have expertise in analyzing and synthesizing information from ONGC documents, reports, and technical materials. You have access to a curated knowledge base and should provide accurate, well-reasoned answers.${languageInstruction}${accuracyInstruction}

${historyText}
Knowledge Base Context:
${context}

Current Question: ${question}

Advanced Instructions:
1. GROUNDING: Base your answer primarily on the provided context documents
2. CITATION: Reference specific documents when making claims (e.g., "According to Document 1...")
3. SYNTHESIS: Combine information from multiple sources when relevant
4. ACCURACY: If the context doesn't fully answer the question, provide what you can and note any limitations
5. REASONING: Explain your reasoning process when drawing conclusions
6. COMPLETENESS: Provide comprehensive answers while staying concise
7. CONTEXT AWARENESS: Consider the conversation history for continuity
8. BE HELPFUL: If the question is unclear or seems like a typo, try to understand the intent and provide a useful response

Response Format:
- Start with a direct answer to the question
- Support with evidence from the documents
- Cite sources explicitly when available
- If information is limited, acknowledge it but still be helpful

Answer:`;
  }

  enrichSources(documents) {
    return documents.map((doc, idx) => ({
      id: idx + 1,
      content: doc.pageContent.substring(0, 300) + (doc.pageContent.length > 300 ? '...' : ''),
      metadata: {
        source: doc.metadata.source || 'Unknown',
        type: doc.metadata.type || 'document',
        pages: doc.metadata.pages,
        relevance: 'high'
      },
      preview: this.generatePreview(doc.pageContent)
    }));
  }

  generatePreview(content) {
    // Extract first meaningful sentence
    const sentences = content.split(/[.!?]+/);
    return sentences[0]?.trim() || content.substring(0, 100);
  }

  calculateConfidence(documents, question) {
    if (documents.length === 0) return 0;
    
    // Simple confidence calculation based on document count and relevance
    const baseConfidence = Math.min(documents.length / 4, 1);
    const queryTerms = question.toLowerCase().split(/\s+/);
    
    const avgRelevance = documents.reduce((acc, doc) => {
      const content = doc.pageContent.toLowerCase();
      const matches = queryTerms.filter(term => content.includes(term)).length;
      return acc + (matches / queryTerms.length);
    }, 0) / documents.length;
    
    return Math.round((baseConfidence * 0.5 + avgRelevance * 0.5) * 100);
  }

  async streamQuery(question, onChunk, language = 'english', accuracyMode = 'moderate', contextWindow = 'medium') {
    const relevantDocs = await this.advancedRetrieval(question, contextWindow);
    const context = this.buildStructuredContext(relevantDocs);
    const prompt = this.buildAdvancedPrompt(question, context, [], language, accuracyMode, contextWindow);
    const generationConfig = this.getGenerationConfig(accuracyMode, contextWindow);

    const result = await this.model.generateContentStream({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig
    });

    for await (const chunk of result.stream) {
      const text = chunk.text();
      onChunk(text);
    }

    return this.enrichSources(relevantDocs);
  }

  getGenerationConfig(accuracyMode, contextWindow) {
    // Base configuration based on accuracy mode
    let config = {};
    
    switch (accuracyMode) {
      case 'very_accurate':
        config = {
          temperature: 0.2,  // Very low for strict accuracy
          topK: 20,
          topP: 0.8,
        };
        break;
      case 'moderate':
        config = {
          temperature: 0.6,  // Moderate for balanced responses
          topK: 40,
          topP: 0.9,
        };
        break;
      case 'creative':
        config = {
          temperature: 1.0,  // High for creative responses
          topK: 60,
          topP: 0.95,
        };
        break;
      default:
        config = {
          temperature: 0.6,
          topK: 40,
          topP: 0.9,
        };
    }
    
    // Adjust maxOutputTokens based on context window
    const tokenMap = {
      'short': 1024,      // Short answers
      'medium': 2048,     // Medium answers
      'high': 4096        // Long, comprehensive answers
    };
    
    config.maxOutputTokens = tokenMap[contextWindow] || 2048;
    config.candidateCount = 1;
    
    console.log(`🎯 Accuracy: ${accuracyMode}, Temperature: ${config.temperature}`);
    console.log(`📝 Max tokens: ${config.maxOutputTokens} (${contextWindow} context)`);
    
    return config;
  }

  clearHistory(conversationId) {
    this.conversationHistory.delete(conversationId);
  }
}

export default new RAGService();
