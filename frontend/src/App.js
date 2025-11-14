import React, { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import Sidebar from './components/Sidebar';
import './App.css';

function App() {
  const [language, setLanguage] = useState('english');
  const [accuracyMode, setAccuracyMode] = useState('moderate');
  const [contextWindow, setContextWindow] = useState('medium');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Frontend-only version - no backend needed

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
  };

  const handleAccuracyChange = (newMode) => {
    setAccuracyMode(newMode);
  };

  const handleContextWindowChange = (newWindow) => {
    setContextWindow(newWindow);
  };

  const translations = {
    english: {
      subtitle: 'Oil and Natural Gas Corporation Limited',
    },
    hindi: {
      subtitle: 'तेल और प्राकृतिक गैस निगम लिमिटेड',
    }
  };

  const t = translations[language];

  return (
    <div className="App">
      <Sidebar
        language={language}
        onLanguageChange={handleLanguageChange}
        accuracyMode={accuracyMode}
        onAccuracyChange={handleAccuracyChange}
        contextWindow={contextWindow}
        onContextWindowChange={handleContextWindowChange}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="app-container">
        <header className="app-header">
          <div className="header-logo">
            <img src="/ongc-logo.png" alt="ONGC Logo" className="ongc-logo" />
          </div>
          <h1>ONGC AI Assistant</h1>
          <p>{t.subtitle}</p>
        </header>

        <main className="app-main">
          <ChatInterface language={language} accuracyMode={accuracyMode} contextWindow={contextWindow} />
        </main>
      </div>
    </div>
  );
}

export default App;
