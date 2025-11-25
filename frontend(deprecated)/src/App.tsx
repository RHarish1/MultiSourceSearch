import { BrowserRouter, Routes, Route } from "react-router-dom";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ManageDrives from "./pages/ManageDrives";
import ImageSearch from "./pages/ImageSearch";

import ProtectedRoute from "./components/ProtectedRoute";
import PreventAuth from "./components/PreventAuth"; // NEW

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public route but blocked if logged in */}
        <Route
          path="/"
          element={
            <PreventAuth>
              <Auth />
            </PreventAuth>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manageDrives"
          element={
            <ProtectedRoute>
              <ManageDrives />
            </ProtectedRoute>
          }
        />

        <Route
          path="/imageSearch"
          element={
            <ProtectedRoute>
              <ImageSearch />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}
