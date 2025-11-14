import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  constructor() {
    this.genAI = null;
    this.model = null;
  }

  initialize(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  }

  async generateResponse(prompt, context = '') {
    if (!this.model) {
      throw new Error('Gemini API not initialized. Please provide API key.');
    }

    const fullPrompt = context 
      ? `Context: ${context}\n\nQuestion: ${prompt}\n\nPlease provide a detailed answer based on the context above.`
      : prompt;

    const result = await this.model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  }

  async chat(messages) {
    if (!this.model) {
      throw new Error('Gemini API not initialized. Please provide API key.');
    }

    const chat = this.model.startChat({
      history: messages.slice(0, -1).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }))
    });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const response = await result.response;
    return response.text();
  }
}

export default new GeminiService();
