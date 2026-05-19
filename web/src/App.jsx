import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminFields from './pages/admin/Fields';
import AdminBookings from './pages/admin/Bookings';

import OwnerDashboard from './pages/owner/Dashboard';
import OwnerFields from './pages/owner/Fields';
import OwnerBookings from './pages/owner/Bookings';
import EditField from './pages/owner/EditField';
import AddField from './pages/owner/AddField';
import FieldSlots from './pages/owner/FieldSlots';
import Notifications from './pages/Notifications';

import Layout from './components/Layout';

// Component bảo vệ Route
const ProtectedRoute = ({ children, allowedRole }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));

  // Lắng nghe thay đổi của localStorage (trong trường hợp mở nhiều tab hoặc login/logout)
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'));
      setRole(localStorage.getItem('role'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return <Layout role={role}>{children}</Layout>;
};

// Điều hướng trang chủ
const HomeRedirect = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) return <Navigate to="/login" replace />;

  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'owner') return <Navigate to="/owner/dashboard" replace />;

  // Nếu là user thường, không cho vào web quản trị
  localStorage.clear();
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Auth Required Routes */}
        <Route path="/" element={<HomeRedirect />} />

        {/* Admin Section */}
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRole="admin"><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/fields" element={<ProtectedRoute allowedRole="admin"><AdminFields /></ProtectedRoute>} />
        <Route path="/admin/bookings" element={<ProtectedRoute allowedRole="admin"><AdminBookings /></ProtectedRoute>} />

        {/* Owner Section */}
        <Route path="/owner/dashboard" element={<ProtectedRoute allowedRole="owner"><OwnerDashboard /></ProtectedRoute>} />
        <Route path="/owner/fields" element={<ProtectedRoute allowedRole="owner"><OwnerFields /></ProtectedRoute>} />
        <Route path="/owner/fields/add" element={<ProtectedRoute allowedRole="owner"><AddField /></ProtectedRoute>} />
        <Route path="/owner/fields/edit/:id" element={<ProtectedRoute allowedRole="owner"><EditField /></ProtectedRoute>} />
        <Route path="/owner/fields/:id/slots" element={<ProtectedRoute allowedRole="owner"><FieldSlots /></ProtectedRoute>} />
        <Route path="/owner/bookings" element={<ProtectedRoute allowedRole="owner"><OwnerBookings /></ProtectedRoute>} />

        {/* Common */}
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
