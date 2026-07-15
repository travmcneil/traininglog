import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import AdminPage from "./pages/AdminPage";
import ProtectedRoute from "./auth/ProtectedRoute";
import Layout from "./components/Layout";
import TrainingPlansPage from "./pages/TrainingPlansPage";
import ShoesPage from "./pages/ShoesPage";
import WorkoutsPage from "./pages/WorkoutsPage";
import RacesPage from "./pages/RacesPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <Layout>
              <AdminPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/plans"
        element={
          <ProtectedRoute>
            <Layout>
              <TrainingPlansPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/shoes"
        element={
          <ProtectedRoute>
            <Layout>
              <ShoesPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/workouts"
        element={
          <ProtectedRoute>
            <Layout>
              <WorkoutsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/races"
        element={
          <ProtectedRoute>
            <Layout>
              <RacesPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
