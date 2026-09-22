import { useState } from "react";
import { Brain, ChevronRight, Database, FileText, Network } from "lucide-react";

const nodes = [
  { label: "Plant Disease", pos: "left-[43%] top-[42%]", color: "bg-[#398798] text-white" },
  { label: "CNN", pos: "left-[15%] top-[17%]", color: "bg-[#e8f4f7] text-[#347ba0]" },
  { label: "PlantVillage", pos: "right-[10%] top-[18%]", color: "bg-[#e4f5f0] text-[#2b8d81]" },
  { label: "Vision Transformers", pos: "left-[8%] bottom-[18%]", color: "bg-[#fff0e9] text-[#c16d51]" },
  { label: "Edge AI", pos: "right-[13%] bottom-[19%]", color: "bg-[#eeedfb] text-[#7272ad]" },
];

function KnowledgeGraph() {
  const [active, setActive] = useState("Plant Disease");
  return <section className="px-4 pb-10 sm:px-8 lg:px-10"><div className="py-8 sm:py-10"><div className="mb-7"><p className="text-[10px] font-extrabold tracking-[1.4px] text-[#64a9b0]">CONNECT THE EVIDENCE</p><h1 className="mt-2 text-3xl font-bold text-[#173c5d]">Knowledge graph</h1><p className="mt-2 text-sm text-[#788598]">Explore concepts and relationships found across your research.</p></div><div className="grid gap-5 lg:grid-cols-[1fr_260px]"><section className="relative min-h-[510px] overflow-hidden border-y border-[#dfe7eb] bg-white">{nodes.map((node) => <button key={node.label} onClick={() => setActive(node.label)} className={`absolute ${node.pos} rounded-full px-4 py-2 text-xs font-bold shadow-sm ${node.color} ${active === node.label ? "ring-4 ring-[#9ed7d5]/40" : ""}`}>{node.label}</button>)}<div className="absolute bottom-5 left-5 text-[10px] text-[#9aa7b6]">Selected concept: {active}</div></section><aside className="border-y border-[#e1e7ec] bg-white p-5"><Network size={22} className="text-[#398798]" /><h2 className="mt-3 text-lg font-bold text-[#173c5d]">{active}</h2><p className="mt-2 text-xs leading-relaxed text-[#8997a6]">This concept appears across 6 papers and connects to methods, datasets, and evaluation results.</p><div className="mt-6 grid gap-3 text-xs text-[#536477]"><span className="flex gap-3"><FileText size={15} className="text-[#398798]" />6 related papers</span><span className="flex gap-3"><Brain size={15} className="text-[#398798]" />4 connected methods</span><span className="flex gap-3"><Database size={15} className="text-[#398798]" />2 datasets</span></div><button className="mt-7 inline-flex items-center gap-1 text-xs font-bold text-[#398798]">Explore papers <ChevronRight size={14} /></button></aside></div></div></section>;
}

export default KnowledgeGraph;
