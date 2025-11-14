import express from 'express';
import ragService from '../services/ragService.js';

const router = express.Router();

router.post('/query', async (req, res) => {
  try {
    const { question, conversationId, language, accuracyMode, contextWindow } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const result = await ragService.query(question, conversationId, language, accuracyMode, contextWindow);
    res.json(result);
  } catch (error) {
    console.error('Chat query error:', error);
    res.status(500).json({ error: 'Failed to process query' });
  }
});

router.post('/stream', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sources = await ragService.streamQuery(question, (chunk) => {
      res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
    });

    res.write(`data: ${JSON.stringify({ type: 'sources', content: sources })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Stream error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', content: 'Failed to process query' })}\n\n`);
    res.end();
  }
});

export default router;
