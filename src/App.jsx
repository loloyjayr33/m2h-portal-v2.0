import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import SADashboard from "./pages/SADashboard";
import TreasurerDashboard from "./pages/TreasurerDashboard";
import OccupantDashboard from "./pages/OccupantDashboard";
import Register from "./pages/Register";
import RoomsOccupants from "./pages/RoomsOccupants";
import Reports from "./pages/Reports";
import FinancialOverview from "./pages/FinancialOverview";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";

function ProtectedRoute({ children, allowedRoles }) {
  const role = localStorage.getItem("role"); // store role after login
  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />; // kick back to login
  }
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        {/* Dashboards */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sa"
          element={
            <ProtectedRoute allowedRoles={["SA"]}>
              <SADashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/treasurer"
          element={
            <ProtectedRoute allowedRoles={["treasurer"]}>
              <TreasurerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/occupant"
          element={
            <ProtectedRoute allowedRoles={["occupant"]}>
              <OccupantDashboard />
            </ProtectedRoute>
          }
        />

        {/* Register page (only Admin + SA can access) */}
        <Route
          path="/register"
          element={
            <ProtectedRoute allowedRoles={["admin", "SA"]}>
              <Register />
            </ProtectedRoute>
          }
        />

        {/* Rooms & Occupants page (only Admin + SA can access) */}
        <Route
          path="/rooms-occupants"
          element={
            <ProtectedRoute allowedRoles={["admin", "SA"]}>
              <RoomsOccupants />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={["admin", "SA"]}>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute allowedRoles={["admin", "SA"]}>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance"
          element={
            <ProtectedRoute allowedRoles={["admin", "treasurer"]}>
              <FinancialOverview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={["admin", "SA", "treasurer"]}>
              <Settings />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
