import { useState } from "react";
import { BookOpen, FileText, Search, SlidersHorizontal, Upload, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { selectPaper, usePaperStore } from "../../store/paperStore";

function Library() {
  const navigate = useNavigate();
  const { papers } = usePaperStore();
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [authorFilter, setAuthorFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [dateOrder, setDateOrder] = useState("newest");
  const [draftAuthor, setDraftAuthor] = useState("all");
  const [draftMonth, setDraftMonth] = useState("all");
  const [draftDateOrder, setDraftDateOrder] = useState("newest");

  const authors = [...new Set(papers.map((paper) => paper.author || "Uploaded paper"))].sort();
  const months = [...new Set(papers.filter((paper) => paper.created_at).map((paper) => paper.created_at.slice(0, 7)))].sort().reverse();
  const monthLabel = (value) => {
    if (value === "all") return "All months";
    return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date(`${value}-01T00:00:00`));
  };

  const filtered = papers
    .filter((paper) => {
      const searchable = `${paper.name || ""} ${paper.title || ""} ${paper.author || "Uploaded paper"} ${(paper.tags || []).join(" ")}`.toLowerCase();
      const authorMatches = authorFilter === "all" || (paper.author || "Uploaded paper") === authorFilter;
      const monthMatches = monthFilter === "all" || paper.created_at?.slice(0, 7) === monthFilter;
      return searchable.includes(query.toLowerCase()) && authorMatches && monthMatches;
    })
    .sort((first, second) => {
      const firstDate = new Date(first.created_at || 0).getTime();
      const secondDate = new Date(second.created_at || 0).getTime();
      return dateOrder === "newest" ? secondDate - firstDate : firstDate - secondDate;
    });

  function formatDate(value) {
    if (!value) return "Date unavailable";
    return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
  }

  function openFilters() {
    setDraftAuthor(authorFilter);
    setDraftMonth(monthFilter);
    setDraftDateOrder(dateOrder);
    setFiltersOpen(true);
  }

  function applyFilters() {
    setAuthorFilter(draftAuthor);
    setMonthFilter(draftMonth);
    setDateOrder(draftDateOrder);
    setFiltersOpen(false);
  }

  function clearFilters() {
    setDraftAuthor("all");
    setDraftMonth("all");
    setDraftDateOrder("newest");
    setAuthorFilter("all");
    setMonthFilter("all");
    setDateOrder("newest");
  }

  return (
    <section className="px-4 pb-10 sm:px-8 lg:px-10">
      <div className="py-8 sm:py-10">
        <div className="mb-7"><p className="text-[10px] font-extrabold tracking-[1.4px] text-[#64a9b0]">YOUR RESEARCH COLLECTION</p><h1 className="mt-2 text-3xl font-bold text-[#173c5d]">My library</h1><p className="mt-2 text-sm text-[#788598]">Browse and revisit every paper in your workspace.</p></div>
        <div className="mb-5 flex gap-3"><div className="flex min-w-0 flex-1 items-center gap-2 border border-[#dbe3e8] bg-white px-3 text-[#9aa7b6]"><Search size={17} /><input className="w-full bg-transparent py-3 text-sm outline-none" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search papers, authors, or topics" /></div><button type="button" onClick={openFilters} className="inline-flex items-center gap-2 border border-[#dbe3e8] bg-white px-4 text-xs font-bold text-[#536477]"><SlidersHorizontal size={15} /> Filters</button><button type="button" onClick={() => navigate("/upload")} className="hidden items-center gap-2 bg-[#173c5d] px-4 text-xs font-bold text-white sm:inline-flex"><Upload size={15} /> Upload</button></div>
        <p className="mb-3 text-xs text-[#8997a6]">Showing {filtered.length} of {papers.length} papers</p>
        <div className="grid gap-3 md:grid-cols-2">{filtered.map((paper) => <button key={paper.id} type="button" className="group flex items-start gap-4 border border-[#e1e7ec] bg-white p-5 text-left hover:border-[#9fc7cd]" onClick={() => { selectPaper(paper); navigate("/paper-analysis"); }}><div className="grid h-11 w-10 shrink-0 place-items-center bg-[#e7f3f8] text-[#3988ad]"><FileText size={20} /></div><div className="min-w-0"><h2 className="truncate text-sm font-bold text-[#405369]">{paper.title || paper.name}</h2><p className="mt-1 text-xs text-[#8997a6]">{paper.author || "Uploaded paper"} · {formatDate(paper.created_at)}</p><div className="mt-4 flex flex-wrap gap-1.5">{(paper.tags || []).map((tag) => <span key={tag} className="bg-[#f0f5f6] px-2 py-1 text-[10px] text-[#718397]">{tag}</span>)}{!(paper.tags || []).length ? <span className="bg-[#f0f5f6] px-2 py-1 text-[10px] text-[#718397]">PDF</span> : null}</div></div></button>)}</div>
        {!filtered.length ? <div className="border border-dashed border-[#dbe3e8] bg-white p-10 text-center"><BookOpen className="mx-auto text-[#9aa7b6]" size={28} /><p className="mt-3 text-sm font-bold text-[#536477]">No papers match these filters.</p><p className="mt-1 text-xs text-[#9aa7b6]">Try changing your search or filters.</p></div> : null}
      </div>

      {filtersOpen ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102c3d]/35 px-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setFiltersOpen(false); }}><section className="w-full max-w-md border border-[#e1e7ec] bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="library-filter-title"><div className="flex items-center justify-between border-b border-[#e8edf0] px-5 py-4"><div><p className="text-[10px] font-extrabold tracking-[1.3px] text-[#64a9b0]">LIBRARY</p><h2 id="library-filter-title" className="mt-1 text-lg font-bold text-[#173c5d]">Filter papers</h2></div><button type="button" onClick={() => setFiltersOpen(false)} className="grid h-8 w-8 place-items-center text-[#788598] hover:bg-[#f2f7f9]" aria-label="Close filters"><X size={18} /></button></div><div className="grid gap-5 px-5 py-6"><label className="grid gap-2 text-xs font-bold text-[#536477]">Author<select className="border border-[#dbe3e8] bg-white px-3 py-3 text-sm font-normal outline-none focus:border-[#64a9b0]" value={draftAuthor} onChange={(event) => setDraftAuthor(event.target.value)}><option value="all">All authors</option>{authors.map((author) => <option key={author} value={author}>{author}</option>)}</select></label><label className="grid gap-2 text-xs font-bold text-[#536477]">Month uploaded<select className="border border-[#dbe3e8] bg-white px-3 py-3 text-sm font-normal outline-none focus:border-[#64a9b0]" value={draftMonth} onChange={(event) => setDraftMonth(event.target.value)}><option value="all">All months</option>{months.map((month) => <option key={month} value={month}>{monthLabel(month)}</option>)}</select></label><label className="grid gap-2 text-xs font-bold text-[#536477]">Date uploaded<select className="border border-[#dbe3e8] bg-white px-3 py-3 text-sm font-normal outline-none focus:border-[#64a9b0]" value={draftDateOrder} onChange={(event) => setDraftDateOrder(event.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></label></div><div className="flex items-center justify-between border-t border-[#e8edf0] px-5 py-4"><button type="button" onClick={clearFilters} className="text-xs font-bold text-[#be5d54]">Clear filters</button><div className="flex gap-2"><button type="button" onClick={() => setFiltersOpen(false)} className="border border-[#dbe3e8] px-4 py-2.5 text-xs font-bold text-[#536477]">Cancel</button><button type="button" onClick={applyFilters} className="bg-[#173c5d] px-4 py-2.5 text-xs font-bold text-white">Apply filters</button></div></div></section></div> : null}
    </section>
  );
}

export default Library;
