import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Database,
  FileText,
  Quote,
  RefreshCw,
  Target,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import { analyzePaper } from "../../services/paperService";
import { usePaperStore } from "../../store/paperStore";

const sections = [
  { label: "Summary", icon: BookOpen },
  { label: "Key Findings", icon: Target },
  { label: "Methodology", icon: Database },
  { label: "Authors", icon: UserRound },
  { label: "Metadata", icon: Quote },
];

function formatDisplayValue(value) {
  if (Array.isArray(value)) {
    return value.map(formatDisplayValue).filter(Boolean).join(", ");
  }
  if (value && typeof value === "object") {
    return Object.entries(value)
      .map(([key, item]) => {
        const formattedItem = formatDisplayValue(item);
        return formattedItem ? `${key}: ${formattedItem}` : key;
      })
      .join("; ");
  }
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  return "";
}

function AnalysisField({ label, value }) {
  const displayValue = formatDisplayValue(value);

  return (
    <div className="border-y border-[#e1e7ec] bg-white p-4">
      <span className="text-[10px] font-bold text-[#9aa7b6]">{label}</span>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#405369]">
        {displayValue || "Not specified in the paper."}
      </p>
    </div>
  );
}

function AnalysisList({ items, emptyText = "Not specified in the paper." }) {
  const list = (Array.isArray(items) ? items : items ? [items] : [])
    .map(formatDisplayValue)
    .filter(Boolean);

  if (!list.length) {
    return <p className="text-sm text-[#8997a6]">{emptyText}</p>;
  }

  return (
    <ul className="grid gap-3">
      {list.map((item, index) => (
        <li
          key={`${index}-${item.slice(0, 40)}`}
          className="border-l-2 border-[#64a9b0] pl-4 text-sm leading-6 text-[#536477]"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function PaperAnalysis() {
  const { selectedPaper } = usePaperStore();
  const paperId = selectedPaper?.id;
  const [activeSection, setActiveSection] = useState("Summary");
  const [retryCount, setRetryCount] = useState(0);
  const [analysisState, setAnalysisState] = useState({
    paperId: null,
    retryCount: -1,
    status: "idle",
  });

  useEffect(() => {
    if (!paperId) return undefined;

    let active = true;
    analyzePaper(paperId)
      .then((result) => {
        if (active) {
          setAnalysisState({
            paperId,
            retryCount,
            status: "ready",
            analysis: result.analysis,
            sources: result.sources || [],
          });
        }
      })
      .catch((error) => {
        if (active) {
          setAnalysisState({
            paperId,
            retryCount,
            status: "error",
            error: error.message,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [paperId, retryCount]);

  if (!selectedPaper) {
    return (
      <section className="flex min-h-[calc(100vh-76px)] items-center justify-center px-5 text-center">
        <div>
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#e8f4f7] text-[#398798]">
            <FileText size={26} />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-[#173c5d]">
            No paper selected
          </h1>
          <p className="mt-2 max-w-md text-sm text-[#788598]">
            Choose a paper from your library to view its analysis.
          </p>
          <Link
            to="/library"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#173c5d] px-4 py-2.5 text-xs font-bold text-white"
          >
            <ArrowLeft size={15} /> Go to My Library
          </Link>
        </div>
      </section>
    );
  }

  const title = selectedPaper.title || selectedPaper.name || "Untitled paper";
  const author = selectedPaper.author || "Uploaded paper";
  const year = selectedPaper.year || "Not available";
  const size = selectedPaper.size || "PDF";
  const isCurrentResult =
    analysisState.paperId === paperId && analysisState.retryCount === retryCount;
  const status = isCurrentResult ? analysisState.status : "loading";
  const analysis = isCurrentResult ? analysisState.analysis : null;
  const sources = isCurrentResult ? analysisState.sources || [] : [];

  function renderContent() {
    if (status === "loading") {
      return (
        <div className="mt-7 flex items-center gap-3 border-y border-[#d7e8f0] bg-[#edf6fa] p-5 text-sm text-[#536f7d]">
          <RefreshCw size={17} className="animate-spin text-[#398798]" />
          Reading and analyzing this paper. The first analysis may take a little longer.
        </div>
      );
    }

    if (status === "error") {
      return (
        <div className="mt-7 max-w-3xl border-y border-[#f0d5d7] bg-[#fff5f5] p-5">
          <div className="flex items-start gap-3 text-sm text-[#9d424c]">
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            <p>{analysisState.error || "Unable to analyze this paper."}</p>
          </div>
          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
            className="mt-4 inline-flex items-center gap-2 bg-[#173c5d] px-3 py-2 text-xs font-bold text-white"
          >
            <RefreshCw size={13} /> Retry analysis
          </button>
        </div>
      );
    }

    if (activeSection === "Summary") {
      return (
        <div className="mt-7 grid max-w-3xl gap-4">
          <AnalysisField label="SUMMARY" value={analysis?.summary} />
          <AnalysisField label="RESEARCH OBJECTIVE" value={analysis?.objective} />
          <AnalysisField label="PROBLEM ADDRESSED" value={analysis?.problem} />
        </div>
      );
    }

    if (activeSection === "Key Findings") {
      return (
        <div className="mt-7 grid max-w-3xl gap-7">
          <section>
            <h3 className="mb-3 text-sm font-bold text-[#405369]">Findings</h3>
            <AnalysisList items={analysis?.findings} />
          </section>
          <section>
            <h3 className="mb-3 text-sm font-bold text-[#405369]">Limitations</h3>
            <AnalysisList items={analysis?.limitations} />
          </section>
        </div>
      );
    }

    if (activeSection === "Methodology") {
      return (
        <div className="mt-7 grid max-w-3xl gap-3">
          <AnalysisField label="METHODOLOGY" value={analysis?.methodology} />
          <AnalysisField label="MODELS AND ALGORITHMS" value={analysis?.models} />
          <AnalysisField label="DATASET" value={analysis?.dataset} />
          <AnalysisField label="DATA SOURCE" value={analysis?.data_source} />
          <AnalysisField label="ACCURACY" value={analysis?.accuracy} />
          <AnalysisField label="OTHER METRICS" value={analysis?.other_metrics} />
        </div>
      );
    }

    if (activeSection === "Authors") {
      return (
        <div className="mt-7 max-w-3xl">
          <AnalysisList items={analysis?.authors} />
        </div>
      );
    }

    return (
      <div className="mt-7 grid max-w-3xl gap-3">
        <AnalysisField label="PAPER TITLE" value={analysis?.title || title} />
        <AnalysisField label="UPLOADED BY" value={author} />
        <AnalysisField label="YEAR UPLOADED" value={year} />
        <AnalysisField label="FILE SIZE" value={size} />
        <AnalysisField label="KEYWORDS" value={analysis?.keywords} />
      </div>
    );
  }

  return (
    <section className="flex h-[calc(100vh-64px)] min-h-0 flex-col px-4 pb-8 sm:h-[calc(100vh-76px)] sm:px-8 lg:px-10">
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[#e1e7ec] py-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-9 shrink-0 place-items-center rounded-md bg-[#fff0f1] text-[#e4515c]">
            <FileText size={19} />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-extrabold text-[#405369] sm:text-base">
              {analysis?.title || title}
            </h1>
            <p className="mt-1 text-[10px] text-[#8997a6]">
              {author} · {year}
            </p>
          </div>
        </div>
        <div
          className={`hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold sm:flex ${
            status === "ready"
              ? "bg-[#e4f5f0] text-[#2b8d81]"
              : "bg-[#eef3f5] text-[#718397]"
          }`}
        >
          {status === "ready" ? <CheckCircle2 size={14} /> : null}
          {status === "ready" ? "ANALYZED" : status === "error" ? "ERROR" : "ANALYZING"}
        </div>
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[245px_1fr]">
        <aside className="overflow-y-auto border-b border-[#e5ebee] bg-[#fbfcfd] p-5 lg:border-b-0 lg:border-r lg:p-6">
          <p className="mb-4 text-[10px] font-extrabold tracking-[1.2px] text-[#9aa7b6]">
            PAPER ANALYSIS
          </p>
          <nav className="grid gap-1">
            {sections.map(({ label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => setActiveSection(label)}
                className={`flex min-h-9 items-center gap-2.5 rounded-md px-2.5 text-left text-[11px] font-semibold ${
                  activeSection === label
                    ? "bg-[#e5f1f8] text-[#347ba0]"
                    : "text-[#718397] hover:bg-[#eef5f7]"
                }`}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="min-h-0 overflow-y-auto p-5 sm:p-8 lg:p-10">
          <p className="text-[10px] font-extrabold tracking-[1.2px] text-[#64a9b0]">
            SELECTED PAPER
          </p>
          <h2 className="mt-1.5 text-2xl font-bold text-[#173c5d]">
            {activeSection}
          </h2>
          {status === "ready" ? (
            <>
              {renderContent()}
              {sources.length ? (
                <section className="mt-9 max-w-3xl border-t border-[#e1e7ec] pt-5">
                  <h3 className="text-sm font-bold text-[#405369]">
                    Evidence from this paper
                  </h3>
                  <div className="mt-3 grid gap-3">
                    {sources.map((source, index) => (
                      <blockquote
                        key={`${source.paper_id}-${source.page}-${index}`}
                        className="border-l-2 border-[#64a9b0] pl-4 text-xs leading-5 text-[#718397]"
                      >
                        <p className="font-semibold text-[#536477]">
                          {source.title}, page {source.page}
                        </p>
                        <p className="mt-1">{source.snippet}</p>
                      </blockquote>
                    ))}
                  </div>
                </section>
              ) : null}
            </>
          ) : (
            renderContent()
          )}
        </div>
      </div>
    </section>
  );
}

export default PaperAnalysis;
