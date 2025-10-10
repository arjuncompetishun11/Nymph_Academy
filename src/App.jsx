import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import EnrollmentForm from './pages/EnrollmentForm'
import PaymentPage from './pages/PaymentPage'
import ConfirmationPage from './pages/ConfirmationPage'

function App() {
  // Set basename for GitHub Pages
  const basename = '/Nymph_Academy';
  
  return (
    <Router basename={basename}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/enrollment" element={<EnrollmentForm />} />
        <Route path="/payment/:studentId" element={<PaymentPage />} />
        <Route path="/confirmation/:studentId" element={<ConfirmationPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App
