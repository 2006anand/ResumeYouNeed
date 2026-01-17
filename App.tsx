import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import JobMatcher from './pages/JobMatcher';
import ResumeComparator from './pages/ResumeComparator';
import ResumeBuilder from './pages/ResumeBuilder';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/match" element={<JobMatcher />} />
          <Route path="/compare" element={<ResumeComparator />} />
          <Route path="/build" element={<ResumeBuilder />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
