import { lazy, Suspense } from "react";
import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { LoadingProvider } from "./context/LoadingProvider";
import ErrorBoundary from "./components/ErrorBoundary";
import PageTransition from "./components/PageTransition";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";
import "./styles/page-transitions.css";

const MainContainer = lazy(() => import("./components/MainContainer.jsx"));
const ContactPage = lazy(() => import("./pages/Contact/ContactPage.jsx"));
const Login = lazy(() => import("./pages/Auth/Login.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard.jsx"));
const PlaceOrder = lazy(() => import("./pages/Dashboard/PlaceOrder.jsx"));
const ProjectDetail = lazy(() => import("./pages/Dashboard/ProjectDetail.jsx"));
const AdminDashboard = lazy(() => import("./pages/Admin/AdminDashboard.jsx"));
const AdminProjectDetail = lazy(() => import("./pages/Admin/AdminProjectDetail.jsx"));
const NotFound = lazy(() => import("./pages/NotFound/NotFound.jsx"));

const Spinner = () => (
  <div className="dash-loading">
    <div className="dash-spinner"></div>
  </div>
);

const Home = () => (
  <LoadingProvider>
    <Suspense fallback={<Spinner />}>
      <MainContainer />
    </Suspense>
  </LoadingProvider>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <Home />
            </PageTransition>
          }
        />
        <Route
          path="/contact"
          element={
            <PageTransition>
              <ContactPage />
            </PageTransition>
          }
        />
        <Route
          path="/login"
          element={
            <PageTransition>
              <Login />
            </PageTransition>
          }
        />

        {/* Client Dashboard Routes (Protected) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <PageTransition>
                <Dashboard />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/order"
          element={
            <ProtectedRoute>
              <PageTransition>
                <PlaceOrder />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/projects/:id"
          element={
            <ProtectedRoute>
              <PageTransition>
                <ProjectDetail />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <PageTransition>
                <AdminDashboard />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/projects/:id"
          element={
            <ProtectedRoute adminOnly>
              <PageTransition>
                <AdminProjectDetail />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route
          path="*"
          element={
            <PageTransition>
              <NotFound />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <HashRouter>
      <ErrorBoundary>
        <AuthProvider>
          <ToastProvider>
            <Suspense fallback={<Spinner />}>
              <AnimatedRoutes />
            </Suspense>
          </ToastProvider>
        </AuthProvider>
      </ErrorBoundary>
    </HashRouter>
  );
};

export default App;
