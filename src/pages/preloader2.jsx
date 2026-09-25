import { useState, useEffect } from "react";

export default function Preloader({ onFinish }) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setDone(true);
      onFinish && setTimeout(onFinish, 500); // wait for fade-out
    }, 2600);
    return () => clearTimeout(t);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-[#0a0a0f] transition-opacity duration-500 ${
        done ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <style>{`
        @keyframes logoIn {
          0% { opacity: 0; transform: scale(0.4) rotate(-15deg); }
          60% { opacity: 1; transform: scale(1.08) rotate(4deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes logoPulse {
          0%, 100% { filter: drop-shadow(0 0 6px #7dd3fc); }
          50% { filter: drop-shadow(0 0 22px #7dd3fc); }
        }
        @keyframes nameReveal {
          0% { clip-path: inset(0 100% 0 0); opacity: 0; letter-spacing: 0.5em; }
          100% { clip-path: inset(0 0% 0 0); opacity: 1; letter-spacing: 0.06em; }
        }
        @keyframes sweep {
          0% { transform: translateX(-120%) skewX(-20deg); opacity: 0; }
          15% { opacity: 1; }
          100% { transform: translateX(220%) skewX(-20deg); opacity: 0; }
        }
        .logo-wrap {
          animation: logoIn 700ms cubic-bezier(.2,.9,.25,1) forwards,
                     logoPulse 1.8s ease-in-out 700ms infinite;
        }
        .name-text {
          animation: nameReveal 900ms cubic-bezier(.16,.9,.25,1) 650ms forwards;
          opacity: 0;
        }
        .sweep-bar {
          animation: sweep 1.1s ease-in-out 650ms 1;
        }
      `}</style>

      <div className="relative flex items-center justify-center">
        {/* Logo */}
        <div className="logo-wrap relative z-10">
          <svg width="84" height="84" viewBox="0 0 84 84" fill="none">
            <rect
              x="6" y="6" width="72" height="72" rx="18"
              stroke="#7dd3fc" strokeWidth="3" fill="rgba(125,211,252,0.06)"
            />
            <path
              d="M28 56 L28 28 L46 28 Q56 28 56 38 Q56 48 46 48 L28 48"
              stroke="#f4f4f5" strokeWidth="4"
              strokeLinecap="round" strokeLinejoin="round" fill="none"
            />
          </svg>
        </div>

        {/* Sweeping light bar passing through the logo */}
        <div
          className="sweep-bar absolute top-0 h-full w-8 bg-gradient-to-r from-transparent via-white/70 to-transparent pointer-events-none"
          style={{ left: "-10%" }}
        />

        {/* Name reveal, sliding out sideways from the logo */}
        <div className="absolute left-full ml-4 whitespace-nowrap">
          <span className="name-text text-3xl md:text-4xl font-semibold text-white tracking-wide">
            Paper<span className="text-sky-300">DIFF</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/* Usage:

import { useState } from "react";
import Preloader from "./Preloader";
import YourApp from "./YourApp";

function App() {
  const [loading, setLoading] = useState(true);
  return loading ? <Preloader onFinish={() => setLoading(false)} /> : <YourApp />;
}

export default App;
*/