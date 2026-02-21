import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { BookOpen, RefreshCw, Trophy } from 'lucide-react';
import Learning from './pages/Learning';
import Quiz from './pages/Quiz';
import Review from './pages/Review';

const Home = () => (
  <div className="container animate-fade-in">
    <div className="animate-float" style={{ textAlign: 'center' }}>
      <h1 className="title-main">Mathez</h1>
      <p className="subtitle">재미있는 수학 탐험을 떠나요!</p>
    </div>

    <div className="menu-list">
      <Link to="/learning" className="glass-btn menu-link secondary-bg">
        <BookOpen size={28} /> 학습 모드
      </Link>
      <Link to="/review" className="glass-btn menu-link accent-bg">
        <RefreshCw size={28} /> 복습 모드
      </Link>
      <Link to="/quiz" className="glass-btn menu-link primary-bg">
        <Trophy size={28} /> 퀴즈 모드
      </Link>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/learning" element={<Learning />} />
        <Route path="/review" element={<Review />} />
        <Route path="/quiz" element={<Quiz />} />
      </Routes>
    </Router>
  );
}

export default App;
