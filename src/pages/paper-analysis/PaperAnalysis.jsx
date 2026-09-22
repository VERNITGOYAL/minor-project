import { useState } from "react";
import { ArrowLeft, BookOpen, CheckCircle2, CircleDot, Database, FileText, Quote, Target, UserRound, X } from "lucide-react";
import { Link } from "react-router-dom";
import { usePaperStore } from "../../store/paperStore";

const sections = [
  { label: "Summary", icon: BookOpen },
  { label: "Key Findings", icon: Target },
  { label: "Methodology", icon: Database },
  { label: "Authors", icon: UserRound },
  { label: "Metadata", icon: Quote },
];
const questions = ["What is this paper about?", "What are the key findings?", "What methodology was used?", "What are the limitations?"];

function PaperAnalysis() {
  const { selectedPaper } = usePaperStore();
  const [activeSection, setActiveSection] = useState("Summary");
  const [selectedQuestion, setSelectedQuestion] = useState("");

  if (!selectedPaper) {
    return <section className="flex min-h-[calc(100vh-76px)] items-center justify-center px-5 text-center"><div><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#e8f4f7] text-[#398798]"><FileText size={26} /></div><h1 className="mt-5 text-2xl font-bold text-[#173c5d]">No paper selected</h1><p className="mt-2 max-w-md text-sm text-[#788598]">Choose a paper from your library to view its analysis.</p><Link to="/library" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#173c5d] px-4 py-2.5 text-xs font-bold text-white"><ArrowLeft size={15} /> Go to My Library</Link></div></section>;
  }

  const title = selectedPaper.title || selectedPaper.name || "Untitled paper";
  const author = selectedPaper.author || "Uploaded paper";
  const year = selectedPaper.year || "Not available";
  const size = selectedPaper.size || "PDF";
  const sectionContent = {
    Summary: { heading: "Summary", text: `This paper, ${title}, has been added to your research workspace. Its full RAG-generated summary will appear here once the analysis pipeline processes the document.` },
    "Key Findings": { heading: "Key Findings", text: "Key findings extracted from this paper will appear here after analysis. This section is ready for evidence-backed results from your RAG pipeline." },
    Methodology: { heading: "Methodology", text: "The methodology, datasets, models, and evaluation protocol will be summarized here from the selected paper." },
    Authors: { heading: "Authors", text: `${author} is listed as the author information for this paper.` },
    Metadata: { heading: "Metadata", text: "Review the document details and processing status below." },
  };
  const content = sectionContent[activeSection];

  return <section className="flex h-[calc(100vh-64px)] min-h-0 flex-col px-4 pb-8 sm:h-[calc(100vh-76px)] sm:px-8 lg:px-10"><div className="flex shrink-0 items-center justify-between gap-4 border-b border-[#e1e7ec] py-5"><div className="flex min-w-0 items-center gap-3"><div className="grid h-10 w-9 shrink-0 place-items-center rounded-md bg-[#fff0f1] text-[#e4515c]"><FileText size={19} /></div><div className="min-w-0"><h1 className="truncate text-sm font-extrabold text-[#405369] sm:text-base">{title}</h1><p className="mt-1 text-[10px] text-[#8997a6]">{author} · {year}</p></div></div><div className="hidden items-center gap-1.5 rounded-full bg-[#e4f5f0] px-3 py-1.5 text-[10px] font-bold text-[#2b8d81] sm:flex"><CheckCircle2 size={14} /> ANALYZED</div></div><div className="grid min-h-0 flex-1 lg:grid-cols-[245px_1fr]"><aside className="overflow-y-auto border-b border-[#e5ebee] bg-[#fbfcfd] p-5 lg:border-b-0 lg:border-r lg:p-6"><p className="mb-4 text-[10px] font-extrabold tracking-[1.2px] text-[#9aa7b6]">PAPER ANALYSIS</p><nav className="grid gap-1">{sections.map(({ label, icon: Icon }) => <button key={label} type="button" onClick={() => setActiveSection(label)} className={`flex min-h-9 items-center gap-2.5 rounded-md px-2.5 text-left text-[11px] font-semibold ${activeSection === label ? "bg-[#e5f1f8] text-[#347ba0]" : "text-[#718397] hover:bg-[#eef5f7]"}`}><Icon size={14} />{label}</button>)}</nav></aside><div className="min-h-0 overflow-y-auto p-5 sm:p-8 lg:p-10"><p className="text-[10px] font-extrabold tracking-[1.2px] text-[#64a9b0]">SELECTED PAPER</p><h2 className="mt-1.5 text-2xl font-bold text-[#173c5d]">{content.heading}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#788598]">{content.text}</p>{activeSection === "Summary" ? <div className="mt-7 max-w-3xl border border-[#d7e8f0] bg-[#edf6fa] p-5"><p className="text-[10px] font-extrabold tracking-[1px] text-[#4c7890]">ANALYSIS READY</p><div className="mt-3 grid gap-2 text-xs text-[#536f7d]"><p className="flex gap-2"><CircleDot size={13} className="mt-0.5 text-[#398798]" />Paper is available to your RAG pipeline.</p><p className="flex gap-2"><CircleDot size={13} className="mt-0.5 text-[#398798]" />Use Chat, Comparison, Research Gaps, or Knowledge Graph with this selected paper.</p></div></div> : null}{activeSection === "Metadata" ? <div className="mt-7 grid max-w-3xl gap-3 sm:grid-cols-3"><div className="border-y border-[#e1e7ec] bg-white p-4"><span className="text-[10px] text-[#9aa7b6]">AUTHOR</span><strong className="mt-2 block text-sm text-[#405369]">{author}</strong></div><div className="border-y border-[#e1e7ec] bg-white p-4"><span className="text-[10px] text-[#9aa7b6]">YEAR</span><strong className="mt-2 block text-sm text-[#405369]">{year}</strong></div><div className="border-y border-[#e1e7ec] bg-white p-4"><span className="text-[10px] text-[#9aa7b6]">FILE</span><strong className="mt-2 block truncate text-sm text-[#405369]">{size}</strong></div></div> : null}<div className="mt-8 max-w-3xl"><h3 className="text-sm font-bold text-[#405369]">Related Questions</h3><div className="mt-3 flex flex-wrap gap-2">{questions.map((question) => <button type="button" key={question} onClick={() => setSelectedQuestion(question)} className={`rounded-full border px-3 py-2 text-[10px] ${selectedQuestion === question ? "border-[#398798] bg-[#e8f4f7] text-[#236e86]" : "border-[#dbe5e9] text-[#718397]"}`}>{question}</button>)}</div>{selectedQuestion ? <div className="mt-4 flex justify-between border-b border-[#e1e7ec] py-3 text-xs text-[#536477]">Question selected: <strong>{selectedQuestion}</strong><button type="button" onClick={() => setSelectedQuestion("")} aria-label="Clear selected question"><X size={15} /></button></div> : null}</div></div></div></section>;
}

export default PaperAnalysis;
