import { NavLink } from "react-router-dom";
import {
  Bot,
  ChevronRight,
  FileText,
  GitCompare,
  GraduationCap,
  LayoutDashboard,
  Library,
  Network,
  Search,
  Settings,
  Upload,
  X,
} from "lucide-react";

const navigation = [
  { label: "Home", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Upload papers", icon: Upload, path: "/upload" },
  { label: "Paper analysis", icon: FileText, path: "/paper-analysis" },
  { label: "Chat assistant", icon: Bot, path: "/chat" },
  { label: "Paper comparison", icon: GitCompare, path: "/comparison" },
  { label: "Research gap analysis", icon: Search, path: "/research-gaps" },
  { label: "Knowledge graph", icon: Network, path: "/knowledge-graph" },
  { label: "My library", icon: Library, path: "/library" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

function WorkspaceSidebar({ isOpen, onClose, activeView }) {
  return (
    <>
      {isOpen ? <button className="fixed inset-0 z-30 bg-[#102c3d]/40 lg:hidden" aria-label="Close navigation" onClick={onClose} /> : null}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-[#e1e7ec] bg-white px-3.5 py-7 shadow-xl transition-transform duration-200 lg:static lg:z-auto lg:w-[236px] lg:translate-x-0 lg:shadow-none ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-3 pb-8"><NavLink to="/dashboard" onClick={onClose} className="flex items-center gap-2.5 text-[19px] font-extrabold tracking-[-.5px] text-[#173c5d]"><span className="grid h-8 w-8 place-items-center rounded-[9px] bg-[#173c5d] text-white"><GraduationCap size={19} /></span><span>Research<span className="text-[#2d98a6]">AI</span></span></NavLink><button className="grid h-8 w-8 place-items-center rounded-md text-[#788598] hover:bg-[#f2f7f9] lg:hidden" onClick={onClose} aria-label="Close navigation"><X size={18} /></button></div>
        <p className="px-3 pb-2 text-[10px] font-extrabold tracking-[1.25px] text-[#9aa7b6]">WORKSPACE</p>
        <nav className="grid gap-1" aria-label="Workspace navigation">{navigation.map(({ label, icon: Icon, path }) => <NavLink key={label} to={path} onClick={onClose} className={({ isActive }) => `group flex min-h-10 items-center gap-3 rounded-[7px] px-3 text-[13px] font-semibold transition-colors ${isActive || label === activeView ? "bg-[#eaf5f7] text-[#126b91]" : "text-[#7a899a] hover:bg-[#f2f7f9] hover:text-[#173c5d]"}`}><Icon size={16} strokeWidth={1.8} /><span>{label}</span></NavLink>)}</nav>
        <NavLink to="/profile" onClick={onClose} className="mt-auto flex items-center gap-2 rounded-lg border-t border-[#e1e7ec] px-2 pt-3 text-left hover:bg-[#f2f7f9]"><div className="grid h-8 w-8 place-items-center rounded-full bg-[#dff1f0] text-[10px] font-extrabold text-[#2a8290]">JD</div><div className="grid min-w-0 flex-1 gap-0.5"><strong className="truncate text-xs text-[#233044]">John Doe</strong><span className="text-[10px] text-[#a0aab7]">Student account</span></div><ChevronRight size={15} className="text-[#a0aab7]" /></NavLink>
      </aside>
    </>
  );
}

export default WorkspaceSidebar;
