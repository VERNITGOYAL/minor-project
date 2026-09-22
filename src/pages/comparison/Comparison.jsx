import { useState } from "react";
import { Check, FileText, GitCompare, Plus } from "lucide-react";
import { usePaperStore } from "../../store/paperStore";

function Comparison() {
  const { papers } = usePaperStore();

  const [selected, setSelected] = useState([]);

  const toggle = (paper) => {
    setSelected((current) => {
      const alreadySelected = current.some((item) => item.id === paper.id);

      if (alreadySelected) {
        return current.filter((item) => item.id !== paper.id);
      }

      if (current.length >= 4) {
        return current;
      }

      return [...current, paper];
    });
  };

  return (
    <section className="px-4 pb-10 sm:px-8 lg:px-10">
      <div className="py-8 sm:py-10">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-extrabold tracking-[1.4px] text-[#64a9b0]">
              COMPARE EVIDENCE
            </p>

            <h1 className="mt-2 text-3xl font-bold text-[#173c5d]">
              Paper comparison
            </h1>

            <p className="mt-2 text-sm text-[#788598]">
              Compare methods, datasets, and findings side by side.
            </p>
          </div>

          <GitCompare className="text-[#398798]" size={30} />
        </div>

        {/* Paper selection */}
        <section className="border-y border-[#e1e7ec] bg-white">
          <div className="flex justify-between border-b border-[#e8edf0] px-5 py-4">
            <div>
              <h2 className="text-sm font-bold text-[#405369]">
                Select papers
              </h2>

              <p className="mt-1 text-[11px] text-[#8997a6]">
                Choose 2–4 papers to compare.
              </p>
            </div>

            <span className="text-xs font-bold text-[#398798]">
              {selected.length} selected
            </span>
          </div>

          {papers.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <FileText
                size={25}
                className="mx-auto text-[#9aa7b6]"
              />

              <p className="mt-3 text-sm font-bold text-[#536477]">
                No papers available
              </p>

              <p className="mt-1 text-xs text-[#8997a6]">
                Upload papers before comparing them.
              </p>
            </div>
          ) : (
            <div className="grid gap-2 p-5 sm:grid-cols-2">
              {papers.map((paper) => {
                const isSelected = selected.some(
                  (item) => item.id === paper.id
                );

                return (
                  <button
                    key={paper.id}
                    type="button"
                    onClick={() => toggle(paper)}
                    className={`flex items-center gap-3 border px-3 py-3 text-left text-xs font-semibold ${
                      isSelected
                        ? "border-[#8bc5cd] bg-[#edf7f8] text-[#236e86]"
                        : "border-[#e1e7ec] text-[#718397]"
                    }`}
                  >
                    <span
                      className={`grid h-6 w-6 shrink-0 place-items-center border ${
                        isSelected
                          ? "border-[#398798] bg-[#398798] text-white"
                          : "border-[#cbd6dc]"
                      }`}
                    >
                      {isSelected ? (
                        <Check size={14} />
                      ) : (
                        <Plus size={14} />
                      )}
                    </span>

                    <FileText size={16} />

                    <span className="truncate">
                      {paper.title || paper.name || "Untitled paper"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Comparison */}
        <section className="mt-6 overflow-x-auto border-y border-[#e1e7ec] bg-white">
          <div className="flex items-center gap-3 border-b border-[#e8edf0] px-5 py-4">
            <GitCompare size={17} className="text-[#398798]" />

            <div>
              <h2 className="text-sm font-bold text-[#405369]">
                Comparison result
              </h2>

              <p className="mt-1 text-[10px] text-[#8997a6]">
                AI-generated comparison will appear here after the RAG backend
                is connected.
              </p>
            </div>
          </div>

          {selected.length < 2 ? (
            <div className="px-5 py-14 text-center">
              <GitCompare
                size={25}
                className="mx-auto text-[#9aa7b6]"
              />

              <p className="mt-3 text-sm font-bold text-[#536477]">
                Select at least 2 papers
              </p>

              <p className="mt-1 text-xs text-[#8997a6]">
                Choose two to four papers above to begin comparison.
              </p>
            </div>
          ) : (
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead>
                <tr className="border-b border-[#e8edf0]">
                  <th className="px-5 py-4 text-[#536477]">
                    Dimension
                  </th>

                  {selected.map((paper) => (
                    <th
                      className="px-4 py-4 text-[#536477]"
                      key={paper.id}
                    >
                      {paper.title || paper.name}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                <tr className="border-b border-[#edf0f3]">
                  <th className="px-5 py-4 text-[#398798]">
                    Author
                  </th>

                  {selected.map((paper) => (
                    <td
                      className="px-4 py-4 text-[#718397]"
                      key={paper.id}
                    >
                      {paper.author || "Not available"}
                    </td>
                  ))}
                </tr>

                <tr className="border-b border-[#edf0f3]">
                  <th className="px-5 py-4 text-[#398798]">
                    Year
                  </th>

                  {selected.map((paper) => (
                    <td
                      className="px-4 py-4 text-[#718397]"
                      key={paper.id}
                    >
                      {paper.year || "Not available"}
                    </td>
                  ))}
                </tr>

                <tr className="border-b border-[#edf0f3]">
                  <th className="px-5 py-4 text-[#398798]">
                    File
                  </th>

                  {selected.map((paper) => (
                    <td
                      className="px-4 py-4 text-[#718397]"
                      key={paper.id}
                    >
                      {paper.name || "PDF"}
                    </td>
                  ))}
                </tr>

                <tr>
                  <th className="px-5 py-4 text-[#398798]">
                    AI Analysis
                  </th>

                  {selected.map((paper) => (
                    <td
                      className="px-4 py-4 text-[#9aa7b6]"
                      key={paper.id}
                    >
                      Awaiting RAG analysis
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          )}
        </section>
      </div>
    </section>
  );
}

export default Comparison;