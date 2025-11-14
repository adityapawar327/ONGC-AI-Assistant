import React, { useState } from 'react';
import './ApiKeyModal.css';

function ApiKeyModal({ onSave, onClose }) {
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
      onSave(apiKey.trim());
    }
  };

  return (
    <div className="api-key-overlay">
      <div className="api-key-modal">
        <h2>🔑 Google Gemini API Key Required</h2>
        <p>To use the ONGC AI Assistant, you need a Google Gemini API key.</p>
        
        <div className="api-key-steps">
          <div className="step">
            <span className="step-number">1</span>
            <span>Visit <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a></span>
          </div>
          <div className="step">
            <span className="step-number">2</span>
            <span>Create or select an API key</span>
          </div>
          <div className="step">
            <span className="step-number">3</span>
            <span>Paste it below</span>
          </div>
        </div>

        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your Gemini API key..."
          className="api-key-input"
        />

        <div className="api-key-actions">
          <button onClick={handleSave} className="save-btn" disabled={!apiKey.trim()}>
            Save & Continue
          </button>
        </div>

        <p className="api-key-note">
          ℹ️ Your API key is stored locally in your browser and never sent to any server except Google's API.
        </p>
      </div>
    </div>
  );
}

export default ApiKeyModal;
