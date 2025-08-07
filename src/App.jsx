// src/App.jsx
import React from 'react';
import PasteArea from './components/PasteArea.jsx';
import './styles/components.css'; 
import { Analytics } from "@vercel/analytics/react"
import { CanvasProvider } from './context/CanvasContext.jsx';

function App() {
  return (
    <CanvasProvider>
      <main>
        <PasteArea />
        <Analytics />
      </main>
    </CanvasProvider>
  );
}

export default App;