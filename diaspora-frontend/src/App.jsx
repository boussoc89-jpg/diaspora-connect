import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projets from './pages/Projets';
import Partenaires from './pages/Partenaires';
import Financements from './pages/Financements';
import Utilisateurs from './pages/Utilisateurs';
import Cotisations from './pages/Cotisations';
import Depenses from './pages/Depenses';
import Layout from './components/Layout';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/projets" element={<ProtectedRoute><Projets /></ProtectedRoute>} />
          <Route path="/partenaires" element={<ProtectedRoute><Partenaires /></ProtectedRoute>} />
          <Route path="/financements" element={<ProtectedRoute><Financements /></ProtectedRoute>} />
          <Route path="/utilisateurs" element={<ProtectedRoute><Utilisateurs /></ProtectedRoute>} />
          <Route path="/cotisations" element={<ProtectedRoute><Cotisations /></ProtectedRoute>} />
          <Route path="/depenses" element={<ProtectedRoute><Depenses /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;