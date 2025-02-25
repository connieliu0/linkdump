// src/App.jsx
import React from 'react';
import PasteArea from './components/PasteArea.jsx';
import './styles/components.css'; 

function App() {
  return (
    <main className="min-h-screen bg-slate-50">
      <PasteArea />
    </main>
  );
}

export default App;