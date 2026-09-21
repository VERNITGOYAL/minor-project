import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={<div>Dashboard</div>} />
        <Route path="/upload" element={<div>Upload Papers</div>} />
        <Route path="/chat" element={<div>Chat Assistant</div>} />
        <Route path="/comparison" element={<div>Paper Comparison</div>} />
        <Route
          path="/research-gaps"
          element={<div>Research Gap Analysis</div>}
        />
        <Route
          path="/knowledge-graph"
          element={<div>Knowledge Graph</div>}
        />
        <Route path="/library" element={<div>My Library</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;