import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { BookOpen, RefreshCw, Trophy, ArrowLeft } from 'lucide-react';

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

const PageLayout = ({ title, children }) => (
  <div className="container animate-fade-in" style={{ justifyContent: 'flex-start', paddingTop: '3rem' }}>
    <h2 className="page-header">{title}</h2>
    <div className="glass-panel" style={{ flex: 1, width: '100%', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </div>
    <Link to="/" className="glass-btn back-btn" style={{ gap: '0.5rem', alignSelf: 'center' }}>
      <ArrowLeft size={20} /> 홈으로
    </Link>
  </div>
);

const Learning = () => <PageLayout title="학습 모드">준비 중이에요!</PageLayout>;
const Review = () => <PageLayout title="복습 모드">준비 중이에요!</PageLayout>;
const Quiz = () => <PageLayout title="퀴즈 모드">준비 중이에요!</PageLayout>;

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
