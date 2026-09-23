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
      <main className="min-w-0 flex-1">
        <div className="flex h-16 items-center justify-between border-b border-[#e1e7ec] px-4 sm:h-[76px] sm:px-8 lg:px-10">
          <button className="grid h-9 w-9 place-items-center rounded-md border border-[#e1e7ec] bg-white text-[#536477] lg:hidden" onClick={() => setIsSidebarOpen(true)} aria-label="Open navigation">
            <Menu size={18} />
          </button>
          <div className="hidden items-center gap-2 text-xs text-[#9aa5b6] lg:flex"><span>Workspace</span><ChevronRight size={14} /><strong className="font-semibold text-[#536477]">{activeView}</strong></div>
          <button className="grid h-9 w-9 place-items-center rounded-md text-[#8d9bab] hover:bg-white" title="Help" aria-label="Help"><HelpCircle size={18} /></button>
        </div>
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
