import { useEffect, useState } from "react";
import { ChevronRight, HelpCircle, Menu } from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";
import WorkspaceSidebar from "../components/layout/WorkspaceSidebar";
import { useAuthStore } from "../store/authStore";
import { loadPapers } from "../store/paperStore";

const viewNames = {
  "/dashboard": "Home",
  "/upload": "Upload papers",
  "/paper-analysis": "Paper analysis",
  "/chat": "Chat assistant",
  "/comparison": "Paper comparison",
  "/research-gaps": "Research gap analysis",
  "/knowledge-graph": "Knowledge graph",
  "/library": "My library",
  "/settings": "Settings",
};

function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const { user } = useAuthStore();
  const activeView = viewNames[pathname] || "Workspace";

  useEffect(() => {
    loadPapers().catch(() => {});
  }, [user?.id]);

  return (
    <div className="flex min-h-screen bg-[#f6f8fa]">
      <WorkspaceSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} activeView={activeView} user={user} />
      <main className="min-w-0 flex-1 lg:ml-[236px]">
          <button className="grid h-9 w-9 place-items-center rounded-md border border-[#e1e7ec] bg-white text-[#536477] lg:hidden" onClick={() => setIsSidebarOpen(true)} aria-label="Open navigation">
            <Menu size={18} />
          </button>
          <div className="hidden items-center gap-2 text-xs text-[#9aa5b6] lg:flex"></div>
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
