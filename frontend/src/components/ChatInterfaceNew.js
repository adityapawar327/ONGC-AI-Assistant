import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './ChatInterface.css';
import geminiService from '../services/geminiService';
import documentService from '../services/documentService';
import ragService from '../services/ragService';
import ApiKeyModal from './ApiKeyModal';

function ChatInterface({ language = 'english', accuracyMode = 'moderate', contextWindow = 'medium' }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Check for API key on mount
  useEffect(() => {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (apiKey) {
      geminiService.initialize(apiKey);
    } else {
      setShowApiKeyModal(true);
    }
  }, []);

  const handleApiKeySave = (apiKey) => {
    geminiService.initialize(apiKey);
    setShowApiKeyModal(false);
  };

  const translations = {
    english: {
      welcome: 'Welcome to ONGC AI Assistant',
      description: 'Your intelligent document assistant for Oil and Natural Gas Corporation Limited',
      placeholder: 'Ask a question or upload a document...',
      uploading: 'Uploading and processing',
      uploadSuccess: 'Successfully processed',
      uploadFail: 'Failed to process',
      chunksAdded: 'chunks added. You can now ask questions about it!',
      tryAgain: 'Please try again.',
      sources: 'Sources',
      relevance: 'Relevance',
      copy: 'Copy',
      copied: 'Copied!'
    },
    hindi: {
      welcome: 'ONGC AI सहायक में आपका स्वागत है',
      description: 'तेल और प्राकृतिक गैस निगम लिमिटेड के लिए आपका बुद्धिमान दस्तावेज़ सहायक',
      placeholder: 'एक प्रश्न पूछें या दस्तावेज़ अपलोड करें...',
      uploading: 'अपलोड और प्रसंस्करण',
      uploadSuccess: 'सफलतापूर्वक संसाधित',
      uploadFail: 'प्रसंस्करण विफल',
      chunksAdded: 'खंड जोड़े गए। अब आप इसके बारे में प्रश्न पूछ सकते हैं!',
      tryAgain: 'कृपया पुनः प्रयास करें।',
      sources: 'स्रोत',
      relevance: 'प्रासंगिकता',
      copy: 'कॉपी करें',
      copied: 'कॉपी हो गया!'
    }
  };

  const t = translations[language];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCopyMessage = async (content, index) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const fileNames = files.map(f => f.name).join(', ');
    
    setMessages(prev => [...prev, {
      role: 'system',
      content: `${t.uploading} ${files.length} file(s): ${fileNames}...`
    }]);

    try {
      let totalChunks = 0;
      const processedFiles = [];

      for (const file of files) {
        try {
          const chunks = await documentService.processFile(file);
          totalChunks += chunks;
          processedFiles.push({
            filename: file.name,
            chunksAdded: chunks,
            success: true
          });
        } catch (error) {
          console.error(`Error processing ${file.name}:`, error);
          processedFiles.push({
            filename: file.name,
            error: error.message,
            success: false
          });
        }
      }

      const successCount = processedFiles.filter(f => f.success).length;
      const failCount = processedFiles.length - successCount;

      let resultMessage = `${t.uploadSuccess} ${successCount} file(s) (${totalChunks} ${t.chunksAdded}`;
      if (failCount > 0) {
        resultMessage += `\nWarning: ${failCount} file(s) failed to process`;
      }

      setMessages(prev => [...prev, {
        role: 'system',
        content: resultMessage,
        success: true
      }]);

      // Refresh document list in sidebar
      if (window.refreshDocumentList) {
        window.refreshDocumentList();
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'system',
        content: `Error: ${t.uploadFail}. ${error.message || t.tryAgain}`,
        error: true
      }]);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // Check if API key is set
    if (!localStorage.getItem('gemini_api_key')) {
      setShowApiKeyModal(true);
      return;
    }

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await ragService.query(input, {
        language,
        accuracyMode,
        contextWindow
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.answer,
        sources: response.sources,
        hasContext: response.context,
        confidence: response.confidence
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: language === 'english' 
          ? 'Sorry, I encountered an error processing your request. Please check your API key and try again.'
          : 'क्षमा करें, आपके अनुरोध को संसाधित करते समय मुझे एक त्रुटि का सामना करना पड़ा। कृपया अपनी API कुंजी जांचें और पुनः प्रयास करें।',
        error: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-interface">
      {showApiKeyModal && (
        <ApiKeyModal
          onSave={handleApiKeySave}
          onClose={() => setShowApiKeyModal(false)}
        />
      )}

      <div className="messages-container">
        {messages.length === 0 && (
          <div className="welcome-message">
            <h2>{t.welcome}</h2>
            <p>{t.description}</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div className="message-avatar">
              {message.role === 'user' ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              ) : message.role === 'system' ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-3 12H7c-.55 0-1-.45-1-1s.45-1 1-1h10c.55 0 1 .45 1 1s-.45 1-1 1zm0-3H7c-.55 0-1-.45-1-1s.45-1 1-1h10c.55 0 1 .45 1 1s-.45 1-1 1zm0-3H7c-.55 0-1-.45-1-1s.45-1 1-1h10c.55 0 1 .45 1 1s-.45 1-1 1z"/>
                </svg>
              )}
            </div>
            <div className="message-content">
              <div className="message-text">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
              
              {message.role === 'assistant' && !message.error && (
                <button
                  className="copy-button"
                  onClick={() => handleCopyMessage(message.content, index)}
                  title={copiedIndex === index ? t.copied : t.copy}
                >
                  {copiedIndex === index ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                  )}
                  <span className="copy-text">{copiedIndex === index ? t.copied : t.copy}</span>
                </button>
              )}
              
              {message.sources && message.sources.length > 0 && (
                <div className="sources">
                  <details>
                    <summary>{t.sources} ({message.sources.length})</summary>
                    {message.sources.map((source, idx) => (
                      <div key={idx} className="source-item">
                        <div className="source-header">
                          <strong>📄 {source.metadata.source}</strong>
                          {source.metadata.relevanceScore && (
                            <span className="relevance-score">
                              {t.relevance}: {(source.metadata.relevanceScore * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                        <p className="source-preview">{source.preview || source.content}</p>
                        {source.content !== source.preview && (
                          <details className="source-full">
                            <summary>Show more</summary>
                            <p>{source.content}</p>
                          </details>
                        )}
                      </div>
                    ))}
                  </details>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message assistant">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".pdf,.txt,.xlsx,.xls,.csv"
          multiple
          style={{ display: 'none' }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="attach-button"
          title="Upload document"
        >
          {uploading ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" opacity="0.25"/>
              <path d="M12 2 A10 10 0 0 1 22 12" strokeLinecap="round">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
              </path>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
            </svg>
          )}
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.placeholder}
          disabled={loading || uploading}
          className="message-input"
        />
        <button type="submit" disabled={loading || uploading || !input.trim()} className="send-button">
          {loading ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" opacity="0.25"/>
              <path d="M12 2 A10 10 0 0 1 22 12" strokeLinecap="round">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
              </path>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          )}
        </button>
      </form>
    </div>
  );
}

export default ChatInterface;
