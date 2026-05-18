import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ManagePitches from './pages/ManagePitches';
import ManageBookings from './pages/ManageBookings';
import Users from './pages/Users';
import Notifications from './pages/Notifications';

function App() {
  // Simple auth check placeholder
  const isAuthenticated = !!localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/pitches"
          element={isAuthenticated ? <ManagePitches /> : <Navigate to="/login" />}
        />
        <Route
          path="/bookings"
          element={isAuthenticated ? <ManageBookings /> : <Navigate to="/login" />}
        />
        <Route
          path="/notifications"
          element={isAuthenticated ? <Notifications /> : <Navigate to="/login" />}
        />

        {/* Admin only */}
        <Route
          path="/users"
          element={isAuthenticated && userRole === 'admin' ? <Users /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
