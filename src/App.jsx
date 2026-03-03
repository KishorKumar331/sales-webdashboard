import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import FollowUp from './pages/FollowUp';
import Investigation from './pages/Investigation';
import Profile from './pages/Profile';
import OnBoardingPage from './pages/(Auth)/OnBoarding';
import SignUp from './pages/(Auth)/SignUp';
import NewLeadForm from './pages/NewLeadForm';
import QuotationScreen from './pages/QuotationScreen';
import CreateQuote from "./pages/CreateQuote"
import Converted from './pages/Converted';
import PaymentPage from './pages/(Auth)/PaymentGateway/PaymentGateWay';
import Teams from './pages/Teams';
import InvoicePage from './pages/InvoicePage';
import { useAuth } from './hooks/useAuth';
import InvoiceTrackingDashboard from './components/Accounting/InvoiceTrackingDashboard';

// Protected Route Component - redirects to /auth if not authenticated
const ProtectedRoute = ({ isAuthenticated, isLoading, redirectPath = '/auth' }) => {
  // Don't redirect while loading - wait for auth check to complete
  if (isLoading || isAuthenticated === null) {
    return null;
  }
  
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }
  return <Outlet />;
};

// Public Route Component - redirects to / if already authenticated
const PublicRoute = ({ isAuthenticated, isLoading, redirectPath = '/' }) => {
  // Don't redirect while loading
  if (isLoading || isAuthenticated === null) {
    return null;
  }
  
  // If user is authenticated, redirect to home
  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }
  return <Outlet />;
};

const App = () => {
  const { isAuthenticated, isLoading,user } = useAuth();
  const renderWithLayout = (Component, title) => (
    <div className="flex h-screen flex-col">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-gray-50">
          <Navbar title={title} />
          {Component}
        </main>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          {/* Public Routes - redirect to / if already authenticated */}
          <Route
            element={
              <PublicRoute
                isAuthenticated={isAuthenticated}
                isLoading={isLoading}
              />
            }
          >
            <Route path="/auth" element={<OnBoardingPage />} />
            <Route path="/signup" element={<SignUp />} />
          </Route>

          {/* Protected Routes - redirect to /auth if not authenticated */}
          <Route
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                isLoading={isLoading}
              />
            }
          >
          <Route
            path="/"
            element={renderWithLayout(<CreateQuote />, "Create Quote")}
          />

          <Route
            path="/new-lead"
            element={renderWithLayout(<NewLeadForm />, "New Lead")}
          />

          <Route
            path="/create-quote"
            element={renderWithLayout(<CreateQuote />, "Create Quote")}
          />

          <Route
            path="/create-newquote"
            element={renderWithLayout(<QuotationScreen />, "Create Quote")}
          />

          <Route
            path="/follow-up"
            element={renderWithLayout(<FollowUp />, "Follow Up")}
          />
            <Route
            path="/accounting"
            element={renderWithLayout(<InvoiceTrackingDashboard />, "Accounting")}
          />
          <Route
            path="/invoices/create"
            element={renderWithLayout(<InvoicePage />, "Create Invoice")}
          />

          <Route
            path="/converted"
            element={renderWithLayout(<Converted />, "Converted")}
          />

          <Route
            path="/investigation"
            element={renderWithLayout(<Investigation />, "Investigation")}
          />

          <Route
            path="/teams"
            element={renderWithLayout(<Teams />, "Teams")}
          />

          <Route
            path="/profile"
            element={renderWithLayout(<Profile />, "Profile")}
          />

          <Route
            path="/payment"
            element={renderWithLayout(<PaymentPage />, "Payment")}
          />
        </Route>

        {/* Fallback */}
          <Route
            path="*"
            element={
              <Navigate to={isAuthenticated ? "/" : "/auth"} replace />
            }
          />
        </Routes>

        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
};


export default App;


// import React from 'react'
// import Carousel from './components/Carousel'

// const App = () => {
//   return (
//     <div><Carousel/></div>
//   )
// }

// export default App