import {
  CheckCircle2,
  FileText,
  Sparkles,
  Target,
} from "lucide-react";
import { usePaperStore } from "../../store/paperStore";

function ResearchGaps() {
  const { papers } = usePaperStore();

  const analyzedCount = 0;
  const identifiedGaps = 0;

  return (
    <section className="px-4 pb-10 sm:px-8 lg:px-10">
      <div className="py-8 sm:py-10">
        <div className="mb-8 flex items-start gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#eeedfb] text-[#7272ad]">
            <Sparkles size={23} />
          </div>

          <div>
            <p className="text-[10px] font-extrabold tracking-[1.4px] text-[#7272ad]">
              SYNTHESIZE THE FIELD
            </p>

            <h1 className="mt-2 text-3xl font-bold text-[#173c5d]">
              Research gap analysis
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-[#788598]">
              Surface unanswered questions and promising directions across
              your uploaded papers.
            </p>
          </div>
        </div>

        {/* Overview */}
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="border-y border-[#e1e7ec] bg-white p-4">
            <span className="text-[10px] font-extrabold tracking-[1px] text-[#9aa7b6]">
              PAPERS UPLOADED
            </span>

            <strong className="mt-2 block text-2xl text-[#173c5d]">
              {papers.length}
            </strong>
          </div>

          <div className="border-y border-[#e1e7ec] bg-white p-4">
            <span className="text-[10px] font-extrabold tracking-[1px] text-[#9aa7b6]">
              PAPERS ANALYZED
            </span>

            <strong className="mt-2 block text-2xl text-[#173c5d]">
              {analyzedCount}
            </strong>
          </div>

          <div className="border-y border-[#e1e7ec] bg-white p-4">
            <span className="text-[10px] font-extrabold tracking-[1px] text-[#9aa7b6]">
              GAPS IDENTIFIED
            </span>

            <strong className="mt-2 block text-2xl text-[#173c5d]">
              {identifiedGaps}
            </strong>
          </div>
        </div>

        {/* No papers */}
        {papers.length === 0 ? (
          <div className="border-y border-[#e1e7ec] bg-white px-5 py-14 text-center">
            <FileText
              size={28}
              className="mx-auto text-[#9aa7b6]"
            />

            <h2 className="mt-4 text-sm font-bold text-[#405369]">
              No papers available
            </h2>

            <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-[#8997a6]">
              Upload research papers first. Once your papers are processed,
              this workspace will identify potential research gaps.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-2">
              <Target size={17} className="text-[#398798]" />

              <h2 className="text-lg font-bold text-[#405369]">
                Identified research gaps
              </h2>
            </div>

            {/* Waiting for RAG */}
            <div className="border-y border-[#e1e7ec] bg-white px-5 py-14 text-center">
              <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[#eeedfb] text-[#7272ad]">
                <Sparkles size={20} />
              </div>

              <h2 className="mt-4 text-sm font-bold text-[#405369]">
                Analysis is ready to begin
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-[#8997a6]">
                You currently have {papers.length} uploaded{" "}
                {papers.length === 1 ? "paper" : "papers"}. The RAG pipeline
                will analyze their methods, findings, limitations, and
                relationships to identify evidence-backed research gaps.
              </p>

              <div className="mx-auto mt-6 grid max-w-md gap-2 text-left">
                {[
                  "Compare findings across papers",
                  "Identify methodological limitations",
                  "Detect underexplored topics",
                  "Generate potential research questions",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-md bg-[#f7f9fa] px-3 py-2 text-[11px] text-[#718397]"
                  >
                    <CheckCircle2
                      size={14}
                      className="shrink-0 text-[#3b9995]"
                    />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

      </div>
    </section>
  );
}

export default ResearchGaps;