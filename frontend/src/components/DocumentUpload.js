import React, { useState } from 'react';
import axios from 'axios';
import './DocumentUpload.css';

const API_URL = 'http://localhost:5000/api';

function DocumentUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [indexing, setIndexing] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMessage('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setMessage('');

    try {
      const response = await axios.post(`${API_URL}/documents/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage(`✅ ${response.data.message}`);
      setFile(null);
      document.getElementById('file-input').value = '';
    } catch (error) {
      setMessage(`❌ Error: ${error.response?.data?.error || 'Upload failed'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleIndexAll = async () => {
    setIndexing(true);
    setMessage('');

    try {
      const response = await axios.post(`${API_URL}/documents/index`);
      setMessage(`✅ ${response.data.message}`);
    } catch (error) {
      setMessage(`❌ Error: ${error.response?.data?.error || 'Indexing failed'}`);
    } finally {
      setIndexing(false);
    }
  };

  return (
    <div className="document-upload">
      <div className="upload-section">
        <h2>📤 Upload Documents</h2>
        <p>Upload PDF or TXT files to enhance the chatbot's knowledge base</p>

        <div className="file-input-wrapper">
          <input
            id="file-input"
            type="file"
            accept=".pdf,.txt"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <label htmlFor="file-input" className="file-label">
            {file ? file.name : 'Choose a file...'}
          </label>
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="upload-button"
        >
          {uploading ? '⏳ Uploading...' : '📤 Upload & Process'}
        </button>
      </div>

      <div className="divider">OR</div>

      <div className="index-section">
        <h3>📚 Index All Documents</h3>
        <p>Process all documents in the backend/data/documents folder</p>
        
        <button
          onClick={handleIndexAll}
          disabled={indexing}
          className="index-button"
        >
          {indexing ? '⏳ Indexing...' : '🔄 Index All Documents'}
        </button>
      </div>

      {message && (
        <div className={`message ${message.startsWith('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="info-section">
        <h3>ℹ️ Supported Formats</h3>
        <ul>
          <li>📄 PDF files (.pdf)</li>
          <li>📝 Text files (.txt)</li>
        </ul>
        
        <h3>💡 Tips</h3>
        <ul>
          <li>Upload documents relevant to your domain</li>
          <li>Larger documents will be automatically chunked</li>
          <li>Re-indexing will update the knowledge base</li>
        </ul>
      </div>
    </div>
  );
}

export default DocumentUpload;
