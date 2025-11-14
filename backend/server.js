import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chat.js';
import documentRoutes from './routes/documents.js';
import vectorStoreService from './services/vectorStore.js';
import documentProcessor from './services/documentProcessor.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://frontend-2iwep2k46-aditya-pawars-projects-eddc51c8.vercel.app',
    'https://frontend-aditya-pawars-projects-eddc51c8.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize vector store on server start (fresh/empty)
vectorStoreService.initialize();

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/documents', documentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'RAG Chatbot API is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🛢️  ONGC AI Assistant API ready at http://localhost:${PORT}`);
  console.log(`💬 Frontend at http://localhost:3000`);
  console.log(`💡 Upload ONGC documents using the 📎 button in the chat interface`);
  console.log(`📝 Starting with fresh vector store - upload documents to begin`);
  console.log(`🧠 ONGC knowledge base integrated for contextual responses`);
});
