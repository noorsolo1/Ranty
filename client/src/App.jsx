import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RecordPage from './pages/RecordPage';
import RantLogPage from './pages/RantLogPage';
import RantDetailPage from './pages/RantDetailPage';
import DashboardPage from './pages/DashboardPage';

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/record"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <RecordPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/rants"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <RantLogPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/rants/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <RantDetailPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DashboardPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/rants" replace />} />
          <Route path="*" element={<Navigate to="/rants" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
