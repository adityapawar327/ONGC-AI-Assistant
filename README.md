# ONGC AI Assistant

An intelligent RAG (Retrieval-Augmented Generation) chatbot for Oil and Natural Gas Corporation Limited, powered by Google Gemini 2.0 Flash.

## Features

- 📄 **Document Upload**: Support for PDF, Excel, CSV, and TXT files
- 🤖 **AI-Powered Responses**: Context-aware answers using Google Gemini
- 🌐 **Bilingual Support**: English and Hindi interface
- 🎯 **Accuracy Modes**: Very Accurate, Moderate, and Creative modes
- 📊 **Source Citations**: Transparent answers with document references
- 🎨 **Modern UI**: Beautiful, responsive design with ONGC branding
- 📋 **Copy Answers**: Easy copy-to-clipboard functionality
- �  **Real-time Processing**: Instant document indexing and querying

## Tech Stack

### Frontend
- React.js
- Axios for API calls
- React Markdown for formatted responses
- Custom CSS with ONGC theme

### Backend
- Node.js + Express
- LangChain for RAG implementation
- Google Gemini AI (Gemini 2.0 Flash)
- Vector Store for document embeddings
- Multer for file uploads

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google Gemini API Key

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/adityapawar327/ONGC-AI-Assistant.git
cd ONGC-AI-Assistant
```

### 2. Setup Backend

```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Add your Google Gemini API key to .env
# GOOGLE_API_KEY=your_api_key_here
```

### 3. Setup Frontend

```bash
cd frontend
npm install

# Create .env file (optional for local development)
cp .env.example .env
```

## Running Locally

### Start Backend (Terminal 1)

```bash
cd backend
node server.js
```

Backend will run on `http://localhost:5000`

### Start Frontend (Terminal 2)

```bash
cd frontend
npm start
```

Frontend will run on `http://localhost:3000`

## Usage

1. **Open the application** in your browser at `http://localhost:3000`
2. **Click the sidebar menu** (☰) to configure settings
3. **Upload documents** using the attach button (📎)
4. **Ask questions** about your uploaded documents
5. **Get AI-powered answers** with source citations
6. **Copy answers** using the copy button

## Configuration

### Accuracy Modes

- **Very Accurate**: Strict responses only from uploaded documents
- **Moderate**: Balanced approach with mostly document-based answers
- **Creative**: Flexible responses with general knowledge

### Context Window

- **Short**: 4 chunks - Quick answers
- **Medium**: 8 chunks - Balanced (default)
- **High**: 15 chunks - Comprehensive answers

## Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

### Quick Deploy

See [QUICK_DEPLOY.md]

### Change Chunk Size
Edit `backend/services/vectorStore.js`:
```javascript
chunkSize: 1200,      // Tokens per chunk
chunkOverlap: 300,    // Overlap for context
```

## 🔧 Advanced Setup

See [SETUP.md](SETUP.md) for detailed configuration, troubleshooting, and performance tuning.

## 📦 Tech Stack

- **Backend**: Node.js, Express, LangChain
- **AI Model**: Google Gemini 2.0 Flash
- **Vector DB**: FAISS (Facebook AI Similarity Search)
- **Frontend**: React.js, Axios
- **Document Processing**: pdf-parse, LangChain text splitters

## 🛡️ Security

- ✅ API key stored in `.env` (gitignored)
- ✅ CORS configured for localhost
- ✅ Content safety filters active
- ✅ No external database dependencies
- ✅ Local vector storage only

## 📈 Performance

- **Fast Retrieval**: FAISS provides sub-millisecond similarity search
- **Efficient Chunking**: Optimized for context preservation
- **Smart Caching**: Conversation history reduces redundant processing
- **Streaming Ready**: Supports streaming responses (implemented)

## 🤝 Contributing

Feel free to enhance the chatbot with:
- Additional document formats (DOCX, CSV, etc.)
- Query expansion integration
- Advanced re-ranking algorithms
- Multi-language support
- Authentication system

## 📄 License

MIT License - feel free to use for commercial projects!

---

**Ready to chat?** Run `npm run dev` and start asking questions! 🚀
