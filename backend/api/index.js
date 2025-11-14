import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from '../routes/chat.js';
import documentRoutes from '../routes/documents.js';
import vectorStoreService from '../services/vectorStore.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://frontend-jg85q9qtf-aditya-pawars-projects-eddc51c8.vercel.app',
    'https://frontend-aditya-pawars-projects-eddc51c8.vercel.app',
    /\.vercel\.app$/
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize vector store
vectorStoreService.initialize();

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/documents', documentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'RAG Chatbot API is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'ONGC AI Assistant API', status: 'running' });
});

export default app;
