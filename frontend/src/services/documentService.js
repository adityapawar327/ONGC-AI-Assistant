class DocumentService {
  constructor() {
    this.documents = [];
    this.chunks = [];
  }

  async processFile(file) {
    const text = await this.extractText(file);
    const chunks = this.chunkText(text, file.name);
    
    this.documents.push({
      name: file.name,
      type: this.getFileType(file.name),
      chunks: chunks.length,
      uploadedAt: new Date().toISOString()
    });

    this.chunks.push(...chunks);
    return chunks.length;
  }

  async extractText(file) {
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.txt')) {
      return await file.text();
    } else if (fileName.endsWith('.pdf')) {
      // For PDF, we'll use a simple text extraction
      // In production, you'd want to use pdf.js or similar
      return await file.text();
    } else if (fileName.endsWith('.csv')) {
      return await file.text();
    } else {
      throw new Error('Unsupported file type');
    }
  }

  chunkText(text, source, chunkSize = 1000, overlap = 200) {
    const chunks = [];
    const lines = text.split('\n');
    let currentChunk = '';
    
    for (const line of lines) {
      if (currentChunk.length + line.length > chunkSize && currentChunk.length > 0) {
        chunks.push({
          content: currentChunk.trim(),
          source: source,
          chunkId: chunks.length
        });
        
        // Keep overlap
        const words = currentChunk.split(' ');
        currentChunk = words.slice(-Math.floor(overlap / 5)).join(' ') + ' ' + line;
      } else {
        currentChunk += line + '\n';
      }
    }
    
    if (currentChunk.trim()) {
      chunks.push({
        content: currentChunk.trim(),
        source: source,
        chunkId: chunks.length
      });
    }
    
    return chunks;
  }

  getFileType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (ext === 'txt') return 'txt';
    if (['csv', 'xlsx', 'xls'].includes(ext)) return 'excel';
    return 'unknown';
  }

  searchChunks(query, topK = 4) {
    if (this.chunks.length === 0) return [];

    const queryLower = query.toLowerCase();
    const queryTerms = queryLower.split(/\s+/);

    // Simple keyword-based search with scoring
    const scored = this.chunks.map(chunk => {
      const contentLower = chunk.content.toLowerCase();
      let score = 0;

      // Exact phrase match
      if (contentLower.includes(queryLower)) {
        score += 10;
      }

      // Individual term matches
      queryTerms.forEach(term => {
        const termCount = (contentLower.match(new RegExp(term, 'g')) || []).length;
        score += termCount * 2;
      });

      // Boost for terms at the beginning
      if (contentLower.startsWith(queryLower.substring(0, 20))) {
        score += 5;
      }

      return { ...chunk, score };
    });

    // Sort by score and return top K
    return scored
      .filter(chunk => chunk.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(chunk => ({
        content: chunk.content,
        source: chunk.source,
        relevanceScore: Math.min(chunk.score / 20, 1).toFixed(3)
      }));
  }

  getDocuments() {
    return this.documents;
  }

  clearAll() {
    this.documents = [];
    this.chunks = [];
  }
}

export default new DocumentService();
