import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { EditorProvider } from './components/Editor/EditorContext';
import Editor from './components/Editor/Editor';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Home from './pages/Home';
import Register from './pages/Register';
import RegisterSuccess from './pages/RegisterSuccess';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function PublicRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (user && location.pathname === '/') {
    return <Navigate to="/editor" replace />;
  }

  if (user && location.pathname === '/login') {
    return <Navigate to="/editor" replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <EditorProvider>
        <Router>
          <Routes>
            <Route 
              path="/" 
              element={
                <PublicRoute>
                  <Home />
                </PublicRoute>
              } 
            />
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route path="/register" element={<Register />} />
            <Route path="/register-success" element={<RegisterSuccess />} />
            <Route 
              path="/editor" 
              element={
                <ProtectedRoute>
                  <Editor />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/templates" 
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Router>
      </EditorProvider>
    </AuthProvider>
  );
}

export default App;
