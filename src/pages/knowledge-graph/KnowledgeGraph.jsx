import {
  Brain,
  Database,
  FileText,
  Network,
  Sparkles,
} from "lucide-react";
import { usePaperStore } from "../../store/paperStore";

function KnowledgeGraph() {
  const { papers } = usePaperStore();
  const active = null;

  return (
    <section className="px-4 pb-10 sm:px-8 lg:px-10">
      <div className="py-8 sm:py-10">
        <div className="mb-7">
          <p className="text-[10px] font-extrabold tracking-[1.4px] text-[#64a9b0]">
            CONNECT THE EVIDENCE
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#173c5d]">
            Knowledge graph
          </h1>

          <p className="mt-2 text-sm text-[#788598]">
            Explore concepts and relationships found across your research.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
          {/* Graph area */}
          <section className="relative min-h-[510px] overflow-hidden border-y border-[#dfe7eb] bg-white">
            {papers.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center px-5 text-center">
                <div>
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#e8f4f7] text-[#398798]">
                    <Network size={25} />
                  </div>

                  <h2 className="mt-4 text-sm font-bold text-[#405369]">
                    No research data available
                  </h2>

                  <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-[#8997a6]">
                    Upload research papers first. The RAG pipeline will
                    extract concepts, methods, datasets, and relationships
                    to build your knowledge graph.
                  </p>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center px-5 text-center">
                <div>
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#eeedfb] text-[#7272ad]">
                    <Sparkles size={25} />
                  </div>

                  <h2 className="mt-4 text-sm font-bold text-[#405369]">
                    Knowledge graph is ready to be generated
                  </h2>

                  <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-[#8997a6]">
                    Your workspace contains {papers.length}{" "}
                    {papers.length === 1 ? "paper" : "papers"}. Once the RAG
                    backend processes them, concepts and relationships will
                    appear here.
                  </p>

                  <div className="mx-auto mt-6 grid max-w-sm gap-2 text-left">
                    {[
                      "Research concepts",
                      "Methods and models",
                      "Datasets",
                      "Paper-to-paper relationships",
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-2 bg-[#f7f9fa] px-3 py-2 text-[11px] text-[#718397]"
                      >
                        <Network
                          size={14}
                          className="shrink-0 text-[#398798]"
                        />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {active ? (
              <div className="absolute bottom-5 left-5 text-[10px] text-[#9aa7b6]">
                Selected concept: {active}
              </div>
            ) : null}
          </section>

          {/* Details */}
          <aside className="border-y border-[#e1e7ec] bg-white p-5">
            <Network size={22} className="text-[#398798]" />

            <h2 className="mt-3 text-lg font-bold text-[#173c5d]">
              {active || "Research network"}
            </h2>

            <p className="mt-2 text-xs leading-relaxed text-[#8997a6]">
              Select a concept from the generated knowledge graph to inspect
              its connections and supporting papers.
            </p>

            <div className="mt-6 grid gap-3 text-xs text-[#536477]">
              <span className="flex gap-3">
                <FileText size={15} className="text-[#398798]" />
                {papers.length} related{" "}
                {papers.length === 1 ? "paper" : "papers"}
              </span>

              <span className="flex gap-3">
                <Brain size={15} className="text-[#398798]" />
                Methods discovered after analysis
              </span>

              <span className="flex gap-3">
                <Database size={15} className="text-[#398798]" />
                Datasets discovered after analysis
              </span>
            </div>

            <div className="mt-7 border-t border-[#e8edf0] pt-5">
              <p className="text-[10px] font-extrabold tracking-[1px] text-[#9aa7b6]">
                BACKEND STATUS
              </p>

              <p className="mt-2 text-xs leading-relaxed text-[#718397]">
                Knowledge graph generation will be connected to the RAG
                pipeline after the frontend is complete.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default KnowledgeGraph;