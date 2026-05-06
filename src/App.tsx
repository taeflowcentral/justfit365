import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// Eager (criticos para primer render: auth + dashboard inicial)
import Login from './pages/Login';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import GymDashboard from './pages/GymDashboard';

// Lazy (resto - se cargan bajo demanda)
const Nutricion = lazy(() => import('./pages/Nutricion'));
const Rutina = lazy(() => import('./pages/Rutina'));
const BioCoach = lazy(() => import('./pages/BioCoach'));
const Suscripcion = lazy(() => import('./pages/Suscripcion'));
const GymConfig = lazy(() => import('./pages/GymConfig'));
const Perfil = lazy(() => import('./pages/Perfil'));
const Progreso = lazy(() => import('./pages/Progreso'));
const AnalisisMedico = lazy(() => import('./pages/AnalisisMedico'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const GymClientes = lazy(() => import('./pages/GymClientes'));
const Registro = lazy(() => import('./pages/Registro'));
const RecuperarPassword = lazy(() => import('./pages/RecuperarPassword'));
const WorkoutTimer = lazy(() => import('./pages/WorkoutTimer'));
const GymCobranzas = lazy(() => import('./pages/GymCobranzas'));
const CompletarPerfil = lazy(() => import('./pages/CompletarPerfil'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-10 h-10 border-2 border-electric/30 border-t-electric rounded-full animate-spin" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, pendingGoogle } = useAuth();
  if (pendingGoogle && !isAuthenticated) return <Navigate to="/completar-perfil" replace />;
  return isAuthenticated ? <>{children}</> : <Navigate to="/landing" />;
}

function AppRoutes() {
  const { isAuthenticated, pendingGoogle, user } = useAuth();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/landing" element={isAuthenticated ? <Navigate to="/" replace /> : pendingGoogle ? <Navigate to="/completar-perfil" replace /> : <Landing />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : pendingGoogle ? <Navigate to="/completar-perfil" replace /> : <Login />} />
        <Route path="/registro" element={isAuthenticated ? <Navigate to="/" replace /> : pendingGoogle ? <Navigate to="/completar-perfil" replace /> : <Registro />} />
        <Route path="/recuperar" element={isAuthenticated ? <Navigate to="/" replace /> : <RecuperarPassword />} />
        <Route path="/completar-perfil" element={isAuthenticated ? <Navigate to="/" replace /> : pendingGoogle ? <CompletarPerfil /> : <Navigate to="/login" replace />} />
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
          <Route path="cobranzas" element={<GymCobranzas />} />
          <Route path="config-gym" element={<GymConfig />} />
          <Route path="timer" element={<WorkoutTimer />} />
          <Route path="admin" element={<AdminPanel />} />
        </Route>
      </Routes>
    </Suspense>
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
