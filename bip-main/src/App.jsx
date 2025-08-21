import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Branches from './pages/Branches/Branches';
import Reports from './pages/Reports/Reports';
import Simulation from './pages/Simulation/Simulation';
import BipChat from './pages/BipChat/BipChat';
import Help from './pages/Help/Help';
import Logs from './pages/Logs/Logs';
import './App.css';

// Protected route wrapper that uses Supabase auth
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/branches" element={
          <ProtectedRoute>
            <Layout>
              <Branches />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Add more protected routes for other pages */}
        <Route path="/simulation" element={
          <ProtectedRoute>
            <Layout>
              <Simulation />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/reports" element={
          <ProtectedRoute>
            <Layout>
              <Reports />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/logs" element={
          <ProtectedRoute>
            <Layout>
              <Logs />
            </Layout>
          </ProtectedRoute>
        } />
        

        
        <Route path="/help" element={
          <ProtectedRoute>
            <Layout>
              <Help />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/bip-chat" element={
          <ProtectedRoute>
            <Layout>
              <BipChat />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/logout" element={<Navigate to="/" replace />} />
      </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;