import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

class VectorStoreService {
  constructor() {
    this.vectorStore = null;
    this.documents = []; // Store documents for persistence
    this.uploadedFiles = new Set(); // Track uploaded file names
    this.embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY,
      modelName: 'embedding-001'
    });
  }

  async initialize() {
    // Start fresh - don't load from storage
    console.log('📦 Vector store initialized (empty)');
    this.documents = [];
    this.vectorStore = null;
    this.uploadedFiles = new Set();
    return false;
  }

  async clearAll() {
    // Clear all documents and reset vector store
    this.documents = [];
    this.vectorStore = null;
    this.uploadedFiles = new Set();
    console.log('🗑️  Vector store cleared');
    return true;
  }

  async addDocuments(documents) {
    // Advanced chunking strategy with semantic awareness
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ['\n\n', '\n', '. ', ' ', ''],
      keepSeparator: true
    });

    const splits = await textSplitter.splitDocuments(documents);
    
    // Enrich chunks with metadata
    const enrichedSplits = splits.map((split, idx) => ({
      ...split,
      metadata: {
        ...split.metadata,
        chunkId: idx,
        chunkCount: splits.length,
        timestamp: new Date().toISOString()
      }
    }));
    
    // Add to documents array for persistence
    this.documents.push(...enrichedSplits);
    
    if (!this.vectorStore) {
      this.vectorStore = await MemoryVectorStore.fromDocuments(
        enrichedSplits,
        this.embeddings
      );
    } else {
      await this.vectorStore.addDocuments(enrichedSplits);
    }

    await this.save();
    console.log(`✅ Added ${splits.length} chunks to vector store`);
    return splits.length;
  }

  async similaritySearch(query, k = 4) {
    if (!this.vectorStore) {
      console.log('⚠️  No documents in vector store yet');
      return [];
    }
    
    try {
      // Use similarity search with score for better ranking
      const results = await this.vectorStore.similaritySearchWithScore(query, k);
      
      // Return documents with relevance scores
      return results.map(([doc, score]) => ({
        ...doc,
        metadata: {
          ...doc.metadata,
          relevanceScore: Math.max(0, (1 - score)).toFixed(3) // Convert distance to similarity
        }
      }));
    } catch (error) {
      console.error('Search error:', error.message);
      return [];
    }
  }

  async hybridSearch(query, k = 4) {
    // Combine semantic and keyword search for better results
    const semanticResults = await this.similaritySearch(query, k * 2);
    
    if (semanticResults.length === 0) return [];
    
    // Simple keyword filtering
    const queryTerms = query.toLowerCase().split(/\s+/);
    const filtered = semanticResults.filter(doc => {
      const content = doc.pageContent.toLowerCase();
      return queryTerms.some(term => content.includes(term));
    });
    
    const results = filtered.length > 0 ? filtered : semanticResults;
    return results.slice(0, k);
  }

  async save() {
    // Track unique file names
    this.documents.forEach(doc => {
      if (doc.metadata && doc.metadata.source) {
        this.uploadedFiles.add(doc.metadata.source);
      }
    });
    console.log(`💾 Vector store updated (${this.documents.length} chunks from ${this.uploadedFiles.size} files)`);
  }

  getDocumentList() {
    const fileStats = {};
    
    this.documents.forEach(doc => {
      const source = doc.metadata?.source || 'Unknown';
      if (!fileStats[source]) {
        fileStats[source] = {
          name: source,
          type: doc.metadata?.type || 'unknown',
          chunks: 0,
          uploadedAt: doc.metadata?.timestamp || new Date().toISOString()
        };
      }
      fileStats[source].chunks++;
    });

    return Object.values(fileStats);
  }
}

export default new VectorStoreService();
