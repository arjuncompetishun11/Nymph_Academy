import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import EnrollmentForm from './pages/EnrollmentForm'
import PaymentPage from './pages/PaymentPage'
import ConfirmationPage from './pages/ConfirmationPage'
import Dashboard from './pages/admin/Dashboard'
import StudentsPage from './pages/admin/StudentsPage'
import StudentDetailPage from './pages/admin/StudentDetailPage'
import WebsiteSettings from './pages/admin/WebsiteSettings'
import LoginPage from './pages/admin/LoginPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext'

function App() {
  // Set basename for GitHub Pages
  const basename = '/Nymph_Academy';
  
  return (
    <AuthProvider>
      <Router basename={basename}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/enrollment" element={<EnrollmentForm />} />
          <Route path="/payment/:studentId" element={<PaymentPage />} />
          <Route path="/confirmation/:studentId" element={<ConfirmationPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/students" element={
            <ProtectedRoute>
              <StudentsPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute>
              <WebsiteSettings />
            </ProtectedRoute>
          } />
          <Route path="/admin/students/:id" element={
            <ProtectedRoute>
              <StudentDetailPage />
            </ProtectedRoute>
          } />
          
          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App
