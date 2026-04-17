import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Terminal from './components/Terminal';
import ToS from './components/ToS';
import BootScreen from './components/BootScreen';

function App() {
  const [booted, setBooted] = useState(false);

  return (
    <Router>
      <div className="App">
        {!booted && <BootScreen onComplete={() => setBooted(true)} />}
        <Routes>
          <Route path="/tos" element={<ToS />} />
          <Route path="*" element={<Terminal />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
