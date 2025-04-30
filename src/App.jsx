// src/App.jsx
import React from 'react';
import PasteArea from './components/PasteArea.jsx';
import './styles/components.css'; 
import { Analytics } from '@vercel/analytics/react'

function App() {
  return (
    <main>
      <PasteArea />
      <Analytics />

    </main>
  );
}

export default App;