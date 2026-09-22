import { useRef, useState } from "react";
import { Check, FileText, Upload, X } from "lucide-react";
import { addPaperToStore, clearAllPapers, removePaperFromStore, usePaperStore } from "../../store/paperStore";

function UploadPapers() {
  const inputRef = useRef(null);
  const { papers } = usePaperStore();
  const [dragging, setDragging] = useState(false);
  const [processed, setProcessed] = useState(false);

  function addFiles(fileList) {
    const pdfs = Array.from(fileList || []).filter((file) => file.type === "application/pdf");
    pdfs.forEach((file) => addPaperToStore({ name: file.name, title: file.name.replace(/\.pdf$/i, ""), size: `${(file.size / 1048576).toFixed(1)} MB`, type: "PDF", author: "Uploaded paper", year: new Date().getFullYear().toString(), tags: [] }));
    setProcessed(false);
  }

  return <section className="px-4 pb-10 sm:px-8 lg:px-12"><div className="mx-auto max-w-4xl py-8 sm:py-12"><h1 className="text-2xl font-bold tracking-tight text-[#173c5d] sm:text-3xl">Upload Research Papers</h1><p className="mt-2 text-sm text-[#788598]">Add PDFs to your workspace and process them for research assistance.</p><div className={`mt-7 rounded-xl border-2 border-dashed p-7 text-center sm:p-12 ${dragging ? "border-[#398798] bg-[#edf6fa]" : "border-[#d5e0e5] bg-white"}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); addFiles(event.dataTransfer.files); }}><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#e8f4f7] text-[#398798]"><Upload size={29} /></div><h2 className="mt-4 text-base font-bold text-[#233044]">Drag & drop PDF files here</h2><p className="my-2 text-xs text-[#9aa7b6]">or</p><button type="button" className="rounded-md bg-[#173c5d] px-6 py-2.5 text-xs font-bold text-white" onClick={() => inputRef.current?.click()}>Choose Files</button><input ref={inputRef} className="sr-only" type="file" accept="application/pdf" multiple onChange={(event) => addFiles(event.target.files)} /><p className="mt-5 text-[10px] text-[#9aa7b6]">Supported format: PDF · Max size: 50MB per file</p></div><div className="mt-7 flex items-center justify-between"><h2 className="text-base font-bold text-[#233044]">Uploaded Papers ({papers.length})</h2><button type="button" className="text-xs font-bold text-[#536477] hover:text-[#be5d54]" onClick={() => { clearAllPapers(); setProcessed(false); }}>Clear All</button></div><div className="mt-3 grid gap-2">{papers.length ? papers.map((paper) => <div className="flex min-h-14 items-center gap-3 border border-[#e1e7ec] bg-white px-3" key={paper.id}><div className="grid h-9 w-9 place-items-center bg-[#fff0f1] text-[#e4515c]"><FileText size={18} /></div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-[#405369]">{paper.name || paper.title}</p><p className="text-[10px] text-[#8997a6]">{paper.size || "PDF"}</p></div><button type="button" onClick={() => removePaperFromStore(paper.id)} aria-label={`Remove ${paper.name || paper.title}`}><X size={15} /></button></div>) : <div className="border border-dashed border-[#d5e0e5] py-10 text-center text-sm text-[#8997a6]">No papers uploaded yet.</div>}</div><button type="button" disabled={!papers.length} onClick={() => setProcessed(true)} className="mt-7 flex min-h-12 w-full items-center justify-center gap-2 bg-[#173c5d] text-sm font-bold text-white disabled:bg-[#b9c7cf]">{processed ? <><Check size={17} /> Papers ready for analysis</> : "Process Papers"}</button></div></section>;
}

export default UploadPapers;
