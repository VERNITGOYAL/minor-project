import { useEffect, useState } from "react";
import paperdiffLogo from "../assets/paperdiff.png";

/**
 * PaperDiffPreloader
 * A ~4.4s loading screen for PaperDiff, styled as a teal illustrated intro:
 * the background fills in first, then a research illustration rises up
 * from below into place, then the logo, copy and a status pill fade in
 * on the left. Loosely modeled on a "lab research" hero layout, but the
 * artwork is original and reworked around papers/analysis rather than
 * biology, since that's what PaperDiff actually does.
 *
 * Usage:
 *   const [loading, setLoading] = useState(true);
 *   {loading && <PaperDiffPreloader onComplete={() => setLoading(false)} />}
 *
 * Requires Tailwind. No external fonts, images or libraries needed —
 * the illustration is plain inline SVG.
 */

const STEPS = {
  BG: 0,
  RISE: 1, // illustration slides up
  HEADING: 2,
  COPY: 3,
  PILL: 4,
  EXIT: 5,
};

const T = {
  RISE: 300,
  HEADING: 1000,
  COPY: 1300,
  PILL: 1800,
  EXIT: 3600,
  DONE: 4500,
};

export default function PaperDiffPreloader({ onComplete }) {
  const [step, setStep] = useState(STEPS.BG);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(STEPS.RISE), T.RISE),
      setTimeout(() => setStep(STEPS.HEADING), T.HEADING),
      setTimeout(() => setStep(STEPS.COPY), T.COPY),
      setTimeout(() => setStep(STEPS.PILL), T.PILL),
      setTimeout(() => setStep(STEPS.EXIT), T.EXIT),
      setTimeout(() => onComplete?.(), T.DONE),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const at = (s) => step >= s;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#153b56] transition-transform duration-[900ms] ease-in-out ${
        step === STEPS.EXIT
          ? "origin-left scale-x-0"
          : "origin-left scale-x-100"
      }`}
      role="status"
      aria-label="Loading PaperDiff"
    >
      <style>{`
        @keyframes pd-rise {
          0% { opacity: 0; transform: translateY(70px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes pd-fade-up {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes pd-drift {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pd-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        .pd-rise { animation: pd-rise 0.75s cubic-bezier(0.22,1,0.36,1) both; }
        .pd-fade-up { animation: pd-fade-up 0.55s ease-out both; }
        .pd-drift { animation: pd-drift 4.5s ease-in-out infinite; }
        .pd-dot { animation: pd-pulse 1.1s ease-in-out infinite; }
      `}</style>

      <div className="mx-auto flex w-full max-w-5xl flex-col-reverse items-center gap-8 px-8 md:flex-row md:gap-4">
        {/* left: logo, copy, status pill */}
        <div className="flex w-full max-w-sm flex-col items-center text-center md:items-start md:text-left">
          <img
            src={paperdiffLogo}
            alt="PaperDiff"
            className={`h-24 w-auto object-contain transition-opacity duration-500 sm:h-28 md:h-32 lg:h-36 ${
              at(STEPS.HEADING) ? "pd-fade-up opacity-100" : "opacity-0"
            }`}
          />

          <p
            className={`mt-4 text-[13.5px] leading-relaxed text-[#CFE3E0] transition-opacity duration-200 ${
              at(STEPS.COPY) ? "pd-fade-up opacity-100" : "opacity-0"
            }`}
          >
            We read new papers as they're published, track what changed
            between versions, and hand you a clear, plain-language summary
            in seconds.
          </p>

          <div
            className={`mt-6 inline-flex items-center gap-2 rounded-full bg-[#F3B27A] px-5 py-2 transition-opacity duration-200 ${
              at(STEPS.PILL) ? "pd-fade-up opacity-100" : "opacity-0"
            }`}
          >
            <span className="pd-dot h-1.5 w-1.5 rounded-full bg-[#0F6461]" />
            <span className="text-[11px] font-medium tracking-wide text-[#0F6461]">
              PREPARING YOUR SUMMARY
            </span>
          </div>
        </div>

        {/* right: illustration, rises up after the background settles */}
        <div
          className={`w-full max-w-md md:max-w-lg transition-opacity duration-200 ${
            at(STEPS.RISE) ? "pd-rise opacity-100" : "opacity-0"
          }`}
        >
          <svg viewBox="0 0 480 400" className="h-auto w-full">
            {/* soft clouds */}
            <g className="pd-drift" fill="#1C7C78" opacity="0.6">
              <ellipse cx="75" cy="60" rx="30" ry="14" />
              <ellipse cx="100" cy="52" rx="20" ry="11" />
            </g>
            <g
              className="pd-drift"
              style={{ animationDelay: "1.2s" }}
              fill="#1C7C78"
              opacity="0.5"
            >
              <ellipse cx="410" cy="330" rx="34" ry="15" />
              <ellipse cx="435" cy="322" rx="20" ry="10" />
            </g>

            {/* citation network */}
            <g
              className="pd-drift"
              style={{ animationDelay: "0.6s" }}
              stroke="#BFE3DA"
              strokeWidth="1.5"
              fill="#BFE3DA"
            >
              <line x1="225" y1="70" x2="255" y2="95" />
              <line x1="255" y1="95" x2="215" y2="110" />
              <line x1="225" y1="70" x2="215" y2="110" />
              <circle cx="225" cy="70" r="4" />
              <circle cx="255" cy="95" r="4" />
              <circle cx="215" cy="110" r="4" />
            </g>

            {/* floating document icon */}
            <g
              className="pd-drift"
              style={{ animationDelay: "0.3s" }}
              transform="translate(60,110) rotate(-8)"
            >
              <rect width="34" height="44" rx="3" fill="#F2EBDC" />
              <line x1="7" y1="12" x2="27" y2="12" stroke="#0F6461" strokeWidth="2" />
              <line x1="7" y1="20" x2="27" y2="20" stroke="#0F6461" strokeWidth="2" />
              <line x1="7" y1="28" x2="20" y2="28" stroke="#0F6461" strokeWidth="2" />
            </g>

            {/* floating chart icon */}
            <g
              className="pd-drift"
              style={{ animationDelay: "0.9s" }}
              transform="translate(392,130)"
            >
              <line x1="0" y1="34" x2="40" y2="34" stroke="#BFE3DA" strokeWidth="2" />
              <rect x="2" y="18" width="7" height="16" fill="#F3B27A" />
              <rect x="14" y="8" width="7" height="26" fill="#F3B27A" />
              <rect x="26" y="22" width="7" height="12" fill="#F3B27A" />
            </g>

            {/* ground */}
            <ellipse cx="240" cy="368" rx="190" ry="10" fill="#0B4F4D" opacity="0.5" />

            {/* podium with papers, person examining with a magnifier */}
            <ellipse cx="150" cy="362" rx="38" ry="7" fill="#0B4F4D" opacity="0.4" />
            <rect x="122" y="300" width="56" height="58" rx="6" fill="#F3B27A" />
            <ellipse cx="150" cy="300" rx="28" ry="7" fill="#F6C596" />
            <rect x="136" y="284" width="28" height="18" rx="1.5" fill="#F2EBDC" />
            <line x1="140" y1="290" x2="160" y2="290" stroke="#0F6461" strokeWidth="1.5" />
            <line x1="140" y1="295" x2="156" y2="295" stroke="#0F6461" strokeWidth="1.5" />

            <rect x="96" y="332" width="6" height="28" fill="#2A2620" />
            <rect x="106" y="332" width="6" height="28" fill="#2A2620" />
            <rect x="88" y="290" width="30" height="44" rx="9" fill="#F7F6F2" />
            <circle cx="103" cy="278" r="12" fill="#D9A066" />
            <path d="M91,275 a12,12 0 0 1 24,0 q-12,-8 -24,0" fill="#2A2620" />
            <line
              x1="112"
              y1="300"
              x2="138"
              y2="290"
              stroke="#F7F6F2"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <circle cx="147" cy="284" r="8" fill="none" stroke="#2A2620" strokeWidth="2.5" />
            <line x1="153" y1="290" x2="160" y2="297" stroke="#2A2620" strokeWidth="2.5" strokeLinecap="round" />

            {/* stack of books with a person holding a magnifier up high */}
            <rect x="270" y="330" width="76" height="16" rx="2" fill="#1C7C78" />
            <rect x="276" y="314" width="64" height="16" rx="2" fill="#F2EBDC" />
            <rect x="282" y="298" width="52" height="16" rx="2" fill="#F3B27A" />

            <rect x="295" y="268" width="6" height="30" fill="#2A2620" />
            <rect x="307" y="268" width="6" height="30" fill="#2A2620" />
            <rect x="286" y="228" width="34" height="46" rx="10" fill="#F7F6F2" />
            <circle cx="303" cy="216" r="13" fill="#D9A066" />
            <path d="M290,213 a13,13 0 0 1 26,0 q-13,-9 -26,0" fill="#2A2620" />
            <line
              x1="303"
              y1="228"
              x2="303"
              y2="188"
              stroke="#F7F6F2"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <circle cx="303" cy="178" r="10" fill="none" stroke="#2A2620" strokeWidth="3" />
            <line x1="310" y1="185" x2="317" y2="192" stroke="#2A2620" strokeWidth="3" strokeLinecap="round" />

            {/* small plants at the base for grounding, echoing the reference layout */}
            <g stroke="#1C7C78" strokeWidth="2" fill="none">
              <path d="M40,362 Q46,338 60,332" />
              <path d="M50,362 Q54,344 66,336" />
              <path d="M440,362 Q432,340 418,332" />
              <path d="M428,362 Q424,346 412,340" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}