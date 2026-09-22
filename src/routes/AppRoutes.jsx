import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../pages/dashboard/Dashboard";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import PaperAnalysis from "../pages/paper-analysis/PaperAnalysis";
import Profile from "../pages/profile/Profile";
import UploadPapers from "../pages/upload/UploadPapers";
import Chat from "../pages/chat/Chat";
import Comparison from "../pages/comparison/Comparison";
import KnowledgeGraph from "../pages/knowledge-graph/KnowledgeGraph";
import Library from "../pages/library/Library";
import ResearchGaps from "../pages/research-gaps/ResearchGaps";
import Settings from "../pages/settings/Settings";
import DashboardLayout from "../layout/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<UploadPapers />} />
            <Route path="/paper-analysis" element={<PaperAnalysis />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/comparison" element={<Comparison />} />
            <Route path="/research-gaps" element={<ResearchGaps />} />
            <Route path="/knowledge-graph" element={<KnowledgeGraph />} />
            <Route path="/library" element={<Library />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;