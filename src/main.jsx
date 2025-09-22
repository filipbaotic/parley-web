import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import HomePage from './pages/HomePage.jsx'
import ConferenceDetailPage from './pages/ConferenceDetailPage.jsx'
import AdminPage from './pages/admin/AdminPage.jsx'
import ConferenceManagementPage from './pages/admin/ConferenceManagementPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/conference/:id" element={<ConferenceDetailPage />} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin>
              <AdminPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/conference/:id" element={
            <ProtectedRoute requireAdmin>
              <ConferenceManagementPage />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
