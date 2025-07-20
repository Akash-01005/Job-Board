import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Jobs from './pages/Jobs.jsx';
import JobDetail from './pages/JobDetail.jsx';
import PostJob from './pages/PostJob.jsx';
import Profile from './pages/Profile.jsx';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes with navbar and footer */}
            <Route path="/" element={
              <Layout>
                <Home />
              </Layout>
            } />
            <Route path="/jobs" element={
              <Layout>
                <Jobs />
              </Layout>
            } />
            <Route path="/jobs/:id" element={
              <Layout>
                <JobDetail />
              </Layout>
            } />
            
            {/* Auth routes without navbar and footer */}
            <Route path="/login" element={
              <Layout showNavbar={false} showFooter={false}>
                <Login />
              </Layout>
            } />
            <Route path="/signup" element={
              <Layout showNavbar={false} showFooter={false}>
                <Signup />
              </Layout>
            } />
            
            {/* Protected routes with navbar and footer */}
            <Route path="/dashboard" element={
              <Layout>
                <Dashboard />
              </Layout>
            } />
            <Route path="/post-job" element={
              <Layout>
                <PostJob />
              </Layout>
            } />
            <Route path="/profile" element={
              <Layout>
                <Profile />
              </Layout>
            } />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;