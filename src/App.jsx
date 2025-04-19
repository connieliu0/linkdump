// src/App.jsx
import React from 'react';
import PasteArea from './components/PasteArea';
import AnimatedBackground from './components/AnimatedBackground';
import './styles/components.css';

function App() {
  return (
    <main>
      <AnimatedBackground />
      <PasteArea />
    </main>
  );
}

export default App;