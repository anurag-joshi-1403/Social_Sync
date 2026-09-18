import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login.jsx';
import Register from './components/auth/Register.jsx';
import Layout from './components/common/Layout.jsx';
import PrivateRoute from './components/common/PrivateRoute.jsx';
import NotFound from './components/common/NotFound.jsx';
import Dashboard from './components/dashboard/Dashboard.jsx';
import PostEditor from './components/editor/PostEditor.jsx';
import Schedule from './components/schedule/Schedule.jsx';
import Analytics from './components/analytics/Analytics.jsx';
import Accounts from './components/accounts/Accounts.jsx';
import { useAuth } from './context/AuthContext.jsx';

function App() {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

      {/* Protected */}
      <Route
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/editor" element={<PostEditor />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/accounts" element={<Accounts />} />
      </Route>

      {/* Fallbacks */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;