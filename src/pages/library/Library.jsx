import { useState } from "react";
import { BookOpen, FileText, Search, SlidersHorizontal, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { selectPaper, usePaperStore } from "../../store/paperStore";

function Library() {
  const navigate = useNavigate();
  const { papers } = usePaperStore();
  const [query, setQuery] = useState("");
  const filtered = papers.filter((paper) => `${paper.name || ""} ${paper.title || ""} ${paper.author || ""} ${(paper.tags || []).join(" ")}`.toLowerCase().includes(query.toLowerCase()));

  return <section className="px-4 pb-10 sm:px-8 lg:px-10"><div className="py-8 sm:py-10"><div className="mb-7"><p className="text-[10px] font-extrabold tracking-[1.4px] text-[#64a9b0]">YOUR RESEARCH COLLECTION</p><h1 className="mt-2 text-3xl font-bold text-[#173c5d]">My library</h1><p className="mt-2 text-sm text-[#788598]">Browse and revisit every paper in your workspace.</p></div><div className="mb-5 flex gap-3"><div className="flex flex-1 items-center gap-2 border border-[#dbe3e8] bg-white px-3 text-[#9aa7b6]"><Search size={17} /><input className="w-full bg-transparent py-3 text-sm outline-none" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search papers, authors, or topics" /></div><button type="button" className="inline-flex items-center gap-2 border border-[#dbe3e8] bg-white px-4 text-xs font-bold text-[#536477]"><SlidersHorizontal size={15} /> Filters</button><button type="button" onClick={() => navigate("/upload")} className="hidden items-center gap-2 bg-[#173c5d] px-4 text-xs font-bold text-white sm:inline-flex"><Upload size={15} /> Upload</button></div><div className="grid gap-3 md:grid-cols-2">{filtered.map((paper) => <button key={paper.id} type="button" className="group flex items-start gap-4 border border-[#e1e7ec] bg-white p-5 text-left hover:border-[#9fc7cd]" onClick={() => { selectPaper(paper); navigate("/paper-analysis"); }}><div className="grid h-11 w-10 shrink-0 place-items-center bg-[#e7f3f8] text-[#3988ad]"><FileText size={20} /></div><div className="min-w-0"><h2 className="truncate text-sm font-bold text-[#405369]">{paper.title || paper.name}</h2><p className="mt-1 text-xs text-[#8997a6]">{paper.author || "Uploaded paper"} · {paper.year || "Recently added"}</p><div className="mt-4 flex flex-wrap gap-1.5">{(paper.tags || []).map((tag) => <span key={tag} className="bg-[#f0f5f6] px-2 py-1 text-[10px] text-[#718397]">{tag}</span>)}{!(paper.tags || []).length ? <span className="bg-[#f0f5f6] px-2 py-1 text-[10px] text-[#718397]">PDF</span> : null}</div></div></button>)}</div>{!filtered.length ? <div className="py-14 text-center"><BookOpen className="mx-auto text-[#9aa7b6]" size={25} /><p className="mt-3 text-sm font-bold text-[#536477]">{papers.length ? "No papers found" : "Your library is empty"}</p><p className="mt-1 text-xs text-[#8997a6]">Upload a PDF to add it to your library.</p></div> : null}</div></section>;
}

export default Library;
