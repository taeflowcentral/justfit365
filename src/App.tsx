import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Nutricion from './pages/Nutricion';
import Rutina from './pages/Rutina';
import BioCoach from './pages/BioCoach';
import Suscripcion from './pages/Suscripcion';
import GymDashboard from './pages/GymDashboard';
import GymConfig from './pages/GymConfig';
import Perfil from './pages/Perfil';
import Progreso from './pages/Progreso';
import AnalisisMedico from './pages/AnalisisMedico';
import AdminPanel from './pages/AdminPanel';
import GymClientes from './pages/GymClientes';
import Registro from './pages/Registro';
import RecuperarPassword from './pages/RecuperarPassword';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/registro" element={isAuthenticated ? <Navigate to="/" replace /> : <Registro />} />
      <Route path="/recuperar" element={isAuthenticated ? <Navigate to="/" replace /> : <RecuperarPassword />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={user?.role === 'gimnasio' ? <GymDashboard /> : <Dashboard />} />
        <Route path="nutricion" element={<Nutricion />} />
        <Route path="rutina" element={<Rutina />} />
        <Route path="bio-coach" element={<BioCoach />} />
        <Route path="progreso" element={<Progreso />} />
        <Route path="analisis" element={<AnalisisMedico />} />
        <Route path="perfil" element={<Perfil />} />
        <Route path="suscripcion" element={<Suscripcion />} />
        <Route path="miembros" element={<GymDashboard />} />
        <Route path="clientes" element={<GymClientes />} />
        <Route path="config-gym" element={<GymConfig />} />
        <Route path="admin" element={<AdminPanel />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
