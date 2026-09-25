import { useEffect, useRef, useState } from "react";
import { Check, ExternalLink, FileText, Upload, X } from "lucide-react";
import {
  addPaperToStore,
  clearAllPapers,
  loadPapers,
  removePaperFromStore,
  usePaperStore,
} from "../../store/paperStore";
import { openPaper } from "../../services/paperService";

function UploadPapers() {
  const inputRef = useRef(null);
  const { papers } = usePaperStore();
  const [dragging, setDragging] = useState(false);
  const [processed, setProcessed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPapers().catch((loadError) => setError(loadError.message));
  }, []);

  async function addFiles(fileList) {
    const pdfs = Array.from(fileList || []).filter(
      (file) => file.type === "application/pdf"
    );

    if (!pdfs.length) {
      setError("Choose at least one PDF file.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      for (const file of pdfs) {
        await addPaperToStore(file);
      }
      setProcessed(false);
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleClearAll() {
    setBusy(true);
    setError("");

    try {
      await clearAllPapers();
      setProcessed(false);
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id) {
    setBusy(true);
    setError("");

    try {
      await removePaperFromStore(id);
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleOpen(id) {
    setError("");

    try {
      await openPaper(id);
    } catch (openError) {
      setError(openError.message);
    }
  }

  return (
    <section className="px-4 pb-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl py-8 sm:py-12">
        <h1 className="text-2xl font-bold tracking-tight text-[#173c5d] sm:text-3xl">Upload Research Papers</h1>
        <p className="mt-2 text-sm text-[#788598]">Add PDFs to your private research workspace.</p>
        <div className={`mt-7 rounded-xl border-2 border-dashed p-7 text-center sm:p-12 ${dragging ? "border-[#398798] bg-[#edf6fa]" : "border-[#d5e0e5] bg-white"}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); void addFiles(event.dataTransfer.files); }}>
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#e8f4f7] text-[#398798]"><Upload size={29} /></div>
          <h2 className="mt-4 text-base font-bold text-[#233044]">Drag & drop PDF files here</h2>
          <p className="my-2 text-xs text-[#9aa7b6]">or</p>
          <button type="button" disabled={busy} className="rounded-md bg-[#173c5d] px-6 py-2.5 text-xs font-bold text-white disabled:opacity-60" onClick={() => inputRef.current?.click()}>Choose Files</button>
          <input ref={inputRef} className="sr-only" type="file" accept="application/pdf" multiple onChange={(event) => { void addFiles(event.target.files); event.target.value = ""; }} />
          <p className="mt-5 text-[10px] text-[#9aa7b6]">Supported format: PDF · Max size: 50MB per file</p>
        </div>
        {error ? <p className="mt-4 text-xs font-semibold text-[#c65b5b]" role="alert">{error}</p> : null}
        <div className="mt-7 flex items-center justify-between"><h2 className="text-base font-bold text-[#233044]">Your Papers ({papers.length})</h2><button type="button" disabled={busy || !papers.length} className="text-xs font-bold text-[#536477] hover:text-[#be5d54] disabled:opacity-40" onClick={() => { void handleClearAll(); }}>Clear All</button></div>
        <div className="mt-3 grid gap-2">{papers.length ? papers.map((paper) => <div className="flex min-h-14 items-center gap-3 border border-[#e1e7ec] bg-white px-3" key={paper.id}><div className="grid h-9 w-9 place-items-center bg-[#fff0f1] text-[#e4515c]"><FileText size={18} /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-[#233044]">{paper.title || paper.name}</p><p className="text-[10px] text-[#9aa7b6]">{paper.size || "PDF"}</p></div><button type="button" disabled={busy} className="grid h-8 w-8 place-items-center text-[#398798] hover:text-[#173c5d] disabled:opacity-40" aria-label={`Open ${paper.title || paper.name}`} onClick={() => { void handleOpen(paper.id); }}><ExternalLink size={16} /></button><button type="button" disabled={busy} className="grid h-8 w-8 place-items-center text-[#a0aab7] hover:text-[#be5d54] disabled:opacity-40" aria-label={`Delete ${paper.title || paper.name}`} onClick={() => { void handleDelete(paper.id); }}><X size={16} /></button></div>) : <div className="border border-dashed border-[#dbe3e8] bg-white p-8 text-center text-xs text-[#9aa7b6]">No papers uploaded yet.</div>}</div>
        
      </div>
    </section>
  );
}

export default UploadPapers;
