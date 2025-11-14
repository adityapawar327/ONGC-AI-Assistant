import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import documentProcessor from '../services/documentProcessor.js';
import vectorStoreService from '../services/vectorStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../data/documents'),
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.txt', '.pdf', '.xlsx', '.xls', '.csv'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only .txt, .pdf, .xlsx, .xls, and .csv files are allowed'));
    }
  }
});

// Support multiple file uploads
router.post('/upload', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    let totalChunks = 0;
    const processedFiles = [];

    for (const file of req.files) {
      try {
        const documents = await documentProcessor.processFile(
          file.path,
          file.originalname
        );

        const chunksAdded = await vectorStoreService.addDocuments(documents);
        totalChunks += chunksAdded;

        processedFiles.push({
          filename: file.originalname,
          chunksAdded,
          success: true
        });
      } catch (error) {
        console.error(`Error processing ${file.originalname}:`, error);
        processedFiles.push({
          filename: file.originalname,
          error: error.message,
          success: false
        });
      }
    }

    res.json({
      message: `Processed ${processedFiles.filter(f => f.success).length} of ${req.files.length} files`,
      files: processedFiles,
      totalChunks
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process documents' });
  }
});

// Get list of uploaded documents
router.get('/list', async (req, res) => {
  try {
    const documents = vectorStoreService.getDocumentList();
    res.json({ documents });
  } catch (error) {
    console.error('List error:', error);
    res.status(500).json({ error: 'Failed to get document list' });
  }
});

router.post('/index', async (req, res) => {
  try {
    const documentsPath = path.join(__dirname, '../data/documents');
    const documents = await documentProcessor.loadDocumentsFromDirectory(documentsPath);

    if (documents.length === 0) {
      return res.json({ message: 'No documents found to index' });
    }

    const chunksAdded = await vectorStoreService.addDocuments(documents);

    res.json({
      message: 'Documents indexed successfully',
      documentsProcessed: documents.length,
      chunksAdded
    });
  } catch (error) {
    console.error('Indexing error:', error);
    res.status(500).json({ error: 'Failed to index documents' });
  }
});

// Clear all documents endpoint
router.post('/clear', async (req, res) => {
  try {
    // Clear vector store
    await vectorStoreService.clearAll();
    
    // Delete physical files
    const documentsPath = path.join(__dirname, '../data/documents');
    const fs = await import('fs/promises');
    
    try {
      const files = await fs.readdir(documentsPath);
      for (const file of files) {
        const filePath = path.join(documentsPath, file);
        const stat = await fs.stat(filePath);
        if (stat.isFile()) {
          await fs.unlink(filePath);
        }
      }
      console.log('🗑️  Deleted all physical document files');
    } catch (fsError) {
      console.error('Error deleting files:', fsError);
      // Don't fail the request if file deletion fails
    }
    
    res.json({ 
      success: true, 
      message: 'All documents cleared from vector store and files deleted' 
    });
  } catch (error) {
    console.error('Error clearing documents:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to clear documents',
      details: error.message
    });
  }
});

export default router;
