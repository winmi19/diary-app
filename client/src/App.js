import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TimelinePage from './pages/TimelinePage';
import EditorPage from './pages/EditorPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TimelinePage />} />
        <Route path="/write/:date" element={<EditorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
