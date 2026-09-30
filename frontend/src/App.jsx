import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { db } from "./firebase";

// Context Providers
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { CivicDataProvider } from "./context/CivicDataContext";

// Route Guards
import ProtectedRoute from "./components/common/ProtectedRoute";

// Layouts
import CitizenLayout from "./components/layout/CitizenLayout";
import AuthorityLayout from "./components/layout/AuthorityLayout";

// Public Pages
import LandingPage from "./pages/public/LandingPage";
import LoginPage from "./pages/public/LoginPage";
import RegisterPage from "./pages/public/RegisterPage";

// Citizen Pages
import CitizenDashboard from "./pages/citizen/CitizenDashboard";
import ReportProblemPage from "./pages/citizen/ReportProblemPage";
import MyComplaintsPage from "./pages/citizen/MyComplaintsPage";
import ComplaintDetailsPage from "./pages/citizen/ComplaintDetailsPage";
import CitizenInsightsPage from "./pages/citizen/CitizenInsightsPage";
import CitizenProfilePage from "./pages/citizen/CitizenProfilePage";

// Authority Pages
import AuthorityOverview from "./pages/authority/AuthorityOverview";
import AuthorityComplaintsPage from "./pages/authority/AuthorityComplaintsPage";
import CivicMapPage from "./pages/authority/CivicMapPage";
import CivicHotspotsPage from "./pages/authority/CivicHotspotsPage";
import CivicAnalyticsPage from "./pages/authority/CivicAnalyticsPage";
import AIInsightsPage from "./pages/authority/AIInsightsPage";
import CivicReportsPage from "./pages/authority/CivicReportsPage";
import AuthoritySettingsPage from "./pages/authority/AuthoritySettingsPage";

function App() {
  useEffect(() => {
    try {
      console.log("CivicAI Firebase ready:", db.app.name);
    } catch (err) {
      console.warn("Firebase initialization warning:", err);
    }
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <CivicDataProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Citizen Application Routes - Protected */}
              <Route element={<ProtectedRoute allowedRoles={["citizen"]} />}>
                <Route path="/citizen" element={<CitizenLayout />}>
                  <Route index element={<CitizenDashboard />} />
                  <Route path="report" element={<ReportProblemPage />} />
                  <Route path="complaints" element={<MyComplaintsPage />} />
                  <Route path="complaints/:id" element={<ComplaintDetailsPage />} />
                  <Route path="insights" element={<CitizenInsightsPage />} />
                  <Route path="profile" element={<CitizenProfilePage />} />
                </Route>
              </Route>

              {/* Authority Application Routes - Protected */}
              <Route element={<ProtectedRoute allowedRoles={["authority"]} />}>
                <Route path="/authority" element={<AuthorityLayout />}>
                  <Route index element={<AuthorityOverview />} />
                  <Route path="complaints" element={<AuthorityComplaintsPage />} />
                  <Route path="map" element={<CivicMapPage />} />
                  <Route path="hotspots" element={<CivicHotspotsPage />} />
                  <Route path="analytics" element={<CivicAnalyticsPage />} />
                  <Route path="insights" element={<AIInsightsPage />} />
                  <Route path="reports" element={<CivicReportsPage />} />
                  <Route path="settings" element={<AuthoritySettingsPage />} />
                </Route>
              </Route>

              {/* Catch-all redirect to public home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </CivicDataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;