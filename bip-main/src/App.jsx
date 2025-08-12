import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Simulate login
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  // Protected route wrapper
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login onLogin={handleLogin} />} />
        
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
    </Router>
  );
}

export default App;