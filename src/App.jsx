import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import CreateQuote from './pages/CreateQuote';
import FollowUp from './pages/FollowUp';
import Converted from './pages/Converted';
import Investigation from './pages/Investigation';
import Profile from './pages/Profile';
import OnBoardingPage from './pages/(Auth)/OnBoarding';
import SignUp from './pages/(Auth)/SignUp';
import NewLeadForm from './pages/NewLeadForm';

// Protected Route Component
const ProtectedRoute = ({ isAuthenticated, redirectPath = '/auth' }) => {
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }
  return <Outlet />;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true'
  );

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(localStorage.getItem('isAuthenticated') === 'true');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const renderWithLayout = (Component, title) => (
    <div className="flex h-screen flex-col">
      <Navbar title={title} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          {Component}
        </main>
      </div>
    </div>
  );

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          {/* Public Routes */}
          <Route path="/auth" element={<OnBoardingPage />} />
          <Route path="/signup" element={<SignUp />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
            <Route
              path="/"
              element={
                renderWithLayout(
                  <div className="bg-white rounded-lg shadow p-6">
                    <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
                    <p className="text-gray-600">Welcome to your dashboard!</p>
                  </div>,
                  "Dashboard"
                )
              }
            />
            <Route path="/new-lead" element={renderWithLayout(<NewLeadForm />, "New Lead")} />
            <Route path="/create-quote" element={renderWithLayout(<CreateQuote />, "Create Quote")} />
            <Route path="/follow-up" element={renderWithLayout(<FollowUp />, "Follow Up")} />
            <Route path="/converted" element={renderWithLayout(<Converted />, "Converted")} />
            <Route path="/investigation" element={renderWithLayout(<Investigation />, "Investigation")} />
            <Route path="/profile" element={renderWithLayout(<Profile />, "Profile")} />
          </Route>
          
          {/* Redirect to auth if no route matches */}
          <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/auth'} replace />} />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
  );
}

export default App;
