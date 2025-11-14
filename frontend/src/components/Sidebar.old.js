import React from 'react';
import './Sidebar.css';
import { Toast, ConfirmDialog } from './Toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Sidebar({ language, onLanguageChange, accuracyMode, onAccuracyChange, contextWindow, onContextWindowChange, isOpen, onToggle }) {
  const [documents, setDocuments] = React.useState([]);
  const [loadingDocs, setLoadingDocs] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const [confirmDialog, setConfirmDialog] = React.useState(null);
  const fileInputRef = React.useRef(null);

  const loadDocuments = async () => {
    setLoadingDocs(true);
    try {
      const response = await fetch(`${API_URL}/documents/list`);
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoadingDocs(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      loadDocuments();
    }
  }, [isOpen]);

  // Expose refresh function globally
  React.useEffect(() => {
    window.refreshDocumentList = loadDocuments;
    return () => {
      delete window.refreshDocumentList;
    };
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    try {
      const response = await fetch(`${API_URL}/documents/upload`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        await loadDocuments();
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        showToast(
          language === 'english' 
            ? `Successfully uploaded ${files.length} file(s)!` 
            : `${files.length} फ़ाइल(ें) सफलतापूर्वक अपलोड की गईं!`,
          'success'
        );
      } else {
        const error = await response.json();
        console.error('Upload failed:', error);
        showToast(
          language === 'english' ? 'Upload failed. Please try again.' : 'अपलोड विफल। कृपया पुनः प्रयास करें।',
          'error'
        );
      }
    } catch (error) {
      console.error('Upload failed:', error);
      showToast(
        language === 'english' ? 'Upload failed. Please try again.' : 'अपलोड विफल। कृपया पुनः प्रयास करें।',
        'error'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleClearDocuments = () => {
    setConfirmDialog({
      message: language === 'english' 
        ? 'Clear all documents? This will remove all uploaded files and their data.' 
        : 'सभी दस्तावेज़ हटाएं? यह सभी अपलोड की गई फ़ाइलों और उनके डेटा को हटा देगा।',
      confirmText: language === 'english' ? 'Clear All' : 'सभी हटाएं',
      cancelText: language === 'english' ? 'Cancel' : 'रद्द करें',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          const response = await fetch(`${API_URL}/documents/clear`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          const result = await response.json();

          if (response.ok && result.success) {
            setDocuments([]);
            showToast(
              language === 'english' ? 'All documents cleared successfully!' : 'सभी दस्तावेज़ सफलतापूर्वक हटा दिए गए!',
              'success'
            );
          } else {
            throw new Error(result.error || 'Failed to clear documents');
          }
        } catch (error) {
          console.error('Failed to clear documents:', error);
          showToast(
            language === 'english' ? 'Failed to clear documents. Please try again.' : 'दस्तावेज़ हटाने में विफल। कृपया पुनः प्रयास करें।',
            'error'
          );
        }
      },
      onCancel: () => setConfirmDialog(null)
    });
  };

  const translations = {
    english: {
      settings: 'Settings',
      language: 'Language',
      accuracy: 'Accuracy Mode',
      veryAccurate: 'Very Accurate',
      veryAccurateDesc: 'Strict - Only from documents',
      moderate: 'Moderate',
      moderateDesc: 'Balanced - Mostly documents',
      creative: 'Creative',
      creativeDesc: 'Flexible - General knowledge',
      contextWindow: 'Context Window',
      short: 'Short',
      shortDesc: '4 chunks - Quick answers',
      medium: 'Medium',
      mediumDesc: '8 chunks - Balanced',
      high: 'High',
      highDesc: '15 chunks - Comprehensive',
      documents: 'Uploaded Documents',
      noDocuments: 'No documents uploaded',
      chunks: 'chunks',
      footer: 'ONGC AI Assistant',
      uploadDocs: 'Upload Documents',
      clearAll: 'Clear All'
    },
    hindi: {
      settings: 'सेटिंग्स',
      language: 'भाषा',
      accuracy: 'सटीकता मोड',
      veryAccurate: 'बहुत सटीक',
      veryAccurateDesc: 'सख्त - केवल दस्तावेज़ों से',
      moderate: 'मध्यम',
      moderateDesc: 'संतुलित - ज्यादातर दस्तावेज़',
      creative: 'रचनात्मक',
      creativeDesc: 'लचीला - सामान्य ज्ञान',
      contextWindow: 'संदर्भ विंडो',
      short: 'छोटा',
      shortDesc: '4 खंड - त्वरित उत्तर',
      medium: 'मध्यम',
      mediumDesc: '8 खंड - संतुलित',
      high: 'उच्च',
      highDesc: '15 खंड - व्यापक',
      documents: 'अपलोड किए गए दस्तावेज़',
      noDocuments: 'कोई दस्तावेज़ अपलोड नहीं किया गया',
      chunks: 'खंड',
      footer: 'ONGC AI सहायक',
      uploadDocs: 'दस्तावेज़ अपलोड करें',
      clearAll: 'सभी हटाएं'
    }
  };

  const t = translations[language];

  return (
    <>
      <button className="sidebar-toggle" onClick={onToggle}>
        {isOpen ? '✕' : '☰'}
      </button>
      
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>{t.settings}</h3>
        </div>
        
        <div className="sidebar-section">
          <h4>{t.language}</h4>
          <div className="language-options">
            <button
              className={`language-btn ${language === 'english' ? 'active' : ''}`}
              onClick={() => onLanguageChange('english')}
            >
              <svg className="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <span>English</span>
            </button>
            <button
              className={`language-btn ${language === 'hindi' ? 'active' : ''}`}
              onClick={() => onLanguageChange('hindi')}
            >
              <svg className="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <span>हिंदी (Hindi)</span>
            </button>
          </div>
        </div>

        <div className="sidebar-section">
          <h4>{t.accuracy}</h4>
          <div className="accuracy-options">
            <button
              className={`accuracy-btn ${accuracyMode === 'very_accurate' ? 'active' : ''}`}
              onClick={() => onAccuracyChange('very_accurate')}
            >
              <svg className="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="6"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
              <div className="accuracy-text">
                <div className="accuracy-title">{t.veryAccurate}</div>
                <div className="accuracy-desc">{t.veryAccurateDesc}</div>
              </div>
            </button>
            <button
              className={`accuracy-btn ${accuracyMode === 'moderate' ? 'active' : ''}`}
              onClick={() => onAccuracyChange('moderate')}
            >
              <svg className="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3v18M3 12h18"/>
                <circle cx="12" cy="12" r="9"/>
              </svg>
              <div className="accuracy-text">
                <div className="accuracy-title">{t.moderate}</div>
                <div className="accuracy-desc">{t.moderateDesc}</div>
              </div>
            </button>
            <button
              className={`accuracy-btn ${accuracyMode === 'creative' ? 'active' : ''}`}
              onClick={() => onAccuracyChange('creative')}
            >
              <svg className="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <div className="accuracy-text">
                <div className="accuracy-title">{t.creative}</div>
                <div className="accuracy-desc">{t.creativeDesc}</div>
              </div>
            </button>
          </div>
        </div>

        <div className="sidebar-section">
          <h4>{t.contextWindow}</h4>
          <div className="context-options">
            <button
              className={`context-btn ${contextWindow === 'short' ? 'active' : ''}`}
              onClick={() => onContextWindowChange('short')}
            >
              <svg className="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <div className="context-text">
                <div className="context-title">{t.short}</div>
                <div className="context-desc">{t.shortDesc}</div>
              </div>
            </button>
            <button
              className={`context-btn ${contextWindow === 'medium' ? 'active' : ''}`}
              onClick={() => onContextWindowChange('medium')}
            >
              <svg className="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
              <div className="context-text">
                <div className="context-title">{t.medium}</div>
                <div className="context-desc">{t.mediumDesc}</div>
              </div>
            </button>
            <button
              className={`context-btn ${contextWindow === 'high' ? 'active' : ''}`}
              onClick={() => onContextWindowChange('high')}
            >
              <svg className="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              <div className="context-text">
                <div className="context-title">{t.high}</div>
                <div className="context-desc">{t.highDesc}</div>
              </div>
            </button>
          </div>
        </div>

        <div className="sidebar-section">
          <h4>{language === 'english' ? 'How to Use' : 'उपयोग कैसे करें'}</h4>
          <div className="how-to-use">
            <div className="how-to-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <div className="step-title">{language === 'english' ? 'Upload Documents' : 'दस्तावेज़ अपलोड करें'}</div>
                <div className="step-desc">{language === 'english' ? 'Click attach button to upload PDF, Excel, CSV, or TXT files (multiple files supported)' : 'अटैच बटन पर क्लिक करें और PDF, Excel, CSV या TXT फ़ाइलें अपलोड करें'}</div>
              </div>
            </div>
            <div className="how-to-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <div className="step-title">{language === 'english' ? 'Choose Settings' : 'सेटिंग्स चुनें'}</div>
                <div className="step-desc">{language === 'english' ? 'Select language, accuracy mode, and context window from sidebar' : 'साइडबार से भाषा, सटीकता मोड और संदर्भ विंडो चुनें'}</div>
              </div>
            </div>
            <div className="how-to-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <div className="step-title">{language === 'english' ? 'Ask Questions' : 'प्रश्न पूछें'}</div>
                <div className="step-desc">{language === 'english' ? 'Type your questions about uploaded documents and get AI-powered answers' : 'अपलोड किए गए दस्तावेज़ों के बारे में प्रश्न पूछें और AI उत्तर प्राप्त करें'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="sidebar-section">
          <h4>{t.documents}</h4>
          
          <div className="document-actions">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.txt,.xlsx,.xls,.csv"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <button 
              className="doc-action-btn upload-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span>{uploading ? (language === 'english' ? 'Uploading...' : 'अपलोड हो रहा है...') : t.uploadDocs}</span>
            </button>
            
            {documents.length > 0 && (
              <button 
                className="doc-action-btn clear-btn"
                onClick={handleClearDocuments}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  <line x1="10" y1="11" x2="10" y2="17"/>
                  <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
                <span>{t.clearAll}</span>
              </button>
            )}
          </div>

          <div className="documents-list">
            {loadingDocs ? (
              <div className="loading-docs">Loading...</div>
            ) : documents.length === 0 ? (
              <div className="no-documents">{t.noDocuments}</div>
            ) : (
              documents.map((doc, index) => (
                <div key={index} className="document-item">
                  <div className="doc-icon">
                    {doc.type === 'pdf' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                      </svg>
                    )}
                    {doc.type === 'txt' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                      </svg>
                    )}
                    {(doc.type === 'excel' || doc.type === 'csv') && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                      </svg>
                    )}
                  </div>
                  <div className="doc-info">
                    <div className="doc-name">{doc.name}</div>
                    <div className="doc-meta">{doc.chunks} {t.chunks}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="sidebar-footer">
          <p>{t.footer}</p>
          <p className="version">v2.0.0</p>
        </div>
      </div>
      
      {isOpen && <div className="sidebar-overlay" onClick={onToggle}></div>}
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      {confirmDialog && (
        <ConfirmDialog
          message={confirmDialog.message}
          confirmText={confirmDialog.confirmText}
          cancelText={confirmDialog.cancelText}
          onConfirm={confirmDialog.onConfirm}
          onCancel={confirmDialog.onCancel}
        />
      )}
    </>
  );
}

export default Sidebar;
