import { useState } from "react";
import {
  Bell,
  Check,
  ChevronRight,
  Moon,
  Shield,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  getSettings,
  saveSettings,
} from "../../services/settingsService";

function Settings() {
  const [settings, setSettings] = useState(getSettings);
  const [saved, setSaved] = useState(false);

  const toggle = (key) => {
    setSettings((current) => ({
      ...current,
      [key]: !current[key],
    }));

    setSaved(false);
  };

  const handleSave = () => {
    saveSettings(settings);

    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  return (
    <section className="px-4 pb-10 sm:px-8 lg:px-10">
      <div className="max-w-3xl py-8 sm:py-10">
        <p className="text-[10px] font-extrabold tracking-[1.4px] text-[#64a9b0]">
          PREFERENCES
        </p>

        <h1 className="mt-2 text-3xl font-bold text-[#173c5d]">
          Settings
        </h1>

        <p className="mt-2 text-sm text-[#788598]">
          Shape how ResearchAI works for you.
        </p>

        <div className="mt-8 grid gap-6">
          {/* Workspace preferences */}
          <section>
            <h2 className="mb-3 text-sm font-bold text-[#405369]">
              Workspace preferences
            </h2>

            <div className="divide-y divide-[#e8edf0] border-y border-[#e1e7ec] bg-white">
              {[
                [
                  "notifications",
                  Bell,
                  "Research updates",
                  "Get notified when an analysis is ready.",
                ],
                [
                  "citations",
                  Shield,
                  "Show citations",
                  "Include source references in research answers.",
                ],
                [
                  "compact",
                  SlidersHorizontal,
                  "Compact paper list",
                  "Use denser rows in library and activity views.",
                ],
              ].map(([key, Icon, title, text]) => (
                <div
                  className="flex items-center gap-4 px-5 py-4"
                  key={key}
                >
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#e8f4f7] text-[#398798]">
                    <Icon size={17} />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-[#405369]">
                      {title}
                    </h3>

                    <p className="mt-1 text-xs text-[#8997a6]">
                      {text}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggle(key)}
                    aria-pressed={settings[key]}
                    aria-label={`Toggle ${title}`}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      settings[key]
                        ? "bg-[#398798]"
                        : "bg-[#cbd6dc]"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
                        settings[key]
                          ? "left-6"
                          : "left-1"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Account */}
          <section>
            <h2 className="mb-3 text-sm font-bold text-[#405369]">
              Account
            </h2>

            <div className="divide-y divide-[#e8edf0] border-y border-[#e1e7ec] bg-white">
              <Link
                to="/profile"
                className="flex items-center gap-4 px-5 py-4 hover:bg-[#fbfcfd]"
              >
                <UserRound
                  size={18}
                  className="text-[#398798]"
                />

                <span className="flex-1 text-sm font-bold text-[#405369]">
                  Edit profile
                </span>

                <ChevronRight
                  size={16}
                  className="text-[#a0aab7]"
                />
              </Link>

              <button
                type="button"
                className="flex w-full items-center gap-4 px-5 py-4 text-left"
              >
                <Moon
                  size={18}
                  className="text-[#398798]"
                />

                <span className="flex-1 text-sm font-bold text-[#405369]">
                  Appearance
                </span>

                <span className="text-xs text-[#8997a6]">
                  Light
                </span>
              </button>
            </div>
          </section>
        </div>

        {/* Save */}
        <div className="mt-6 flex justify-end gap-4">
          <span className="text-xs text-[#4da38f]">
            {saved ? (
              <>
                <Check
                  size={14}
                  className="mr-1 inline"
                />
                Saved
              </>
            ) : null}
          </span>

          <button
            type="button"
            onClick={handleSave}
            className="bg-[#173c5d] px-5 py-2.5 text-xs font-bold text-white"
          >
            Save preferences
          </button>
        </div>
      </div>
    </section>
  );
}

export default Settings;