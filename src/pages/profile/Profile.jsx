import { useState } from "react";
import {
  Check,
  Mail,
  Save,
  ShieldCheck,
  UserRound,
  ArrowLeft,
} from "lucide-react";

import {
  updateProfile,
  verifyEmailChange,
  useAuthStore,
} from "../../store/authStore";

function Profile() {
  const { user, isLoading, error } = useAuthStore();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  const [originalEmail, setOriginalEmail] = useState(user?.email || "");

  const [otpMode, setOtpMode] = useState(false);
  const [otp, setOtp] = useState("");

  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState("");
  const [status, setStatus] = useState("");

  const initials = (name || "Research User")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  /*
   * Only allow letters and spaces in name.
   */
  function handleNameChange(event) {
    const value = event.target.value;

    // Allows:
    // A-Z
    // a-z
    // spaces
    // common Indian/English names with multiple words
    if (/^[A-Za-z\s]*$/.test(value)) {
      setName(value);
      setFormError("");
    }
  }

  /*
   * Save profile.
   *
   * If email has not changed:
   *     save immediately.
   *
   * If email changed:
   *     send OTP to new email first.
   */
  async function handleSubmit(event) {
    event.preventDefault();

    setSaved(false);
    setFormError("");
    setStatus("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanOriginalEmail = originalEmail.trim().toLowerCase();

    // Validate name
    if (!cleanName) {
      setFormError("Full name is required.");
      return;
    }

    if (!/^[A-Za-z]+(?:\s+[A-Za-z]+)*$/.test(cleanName)) {
      setFormError("Name can contain letters and spaces only.");
      return;
    }

    // Validate email
    if (!cleanEmail) {
      setFormError("Email address is required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setFormError("Enter a valid email address.");
      return;
    }

    /*
     * EMAIL DID NOT CHANGE
     * --------------------------------
     * Only update the name.
     */
    if (cleanEmail === cleanOriginalEmail) {
      try {
        await updateProfile({
          id: user.id,
          name: cleanName,
          email: cleanOriginalEmail,
        });

        setSaved(true);

        window.setTimeout(() => {
          setSaved(false);
        }, 2000);
      } catch (saveError) {
        setFormError(saveError.message);
      }

      return;
    }

    /*
     * EMAIL CHANGED
     * --------------------------------
     * Send OTP to new email.
     */
    try {
      setStatus("Sending verification code...");
      await updateProfile({
        id: user.id,
        name: cleanName,
        email: cleanEmail,
      });

      setOtpMode(true);
      setStatus(`Verification code sent to ${cleanEmail}.`);
    } catch (error) {
      setStatus("");
      setFormError(error.message);
    }
  }

  /*
   * Verify OTP and change email.
   */
  async function handleVerifyEmail() {
    setFormError("");
    setStatus("");

    if (!otp.trim()) {
      setFormError("Enter the verification code.");
      return;
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      setFormError("Enter the 6-digit verification code.");
      return;
    }

    try {
      setStatus("Verifying email...");

      await verifyEmailChange({
        userId: user.id,
        newEmail: email.trim().toLowerCase(),
        otp: otp.trim(),
      });

      setOriginalEmail(email.trim().toLowerCase());
      setOtpMode(false);
      setOtp("");
      setStatus("");
      setSaved(true);

      window.setTimeout(() => {
        setSaved(false);
      }, 2000);
    } catch (error) {
      setStatus("");
      setFormError(error.message);
    }
  }

  /*
   * Cancel email change.
   */
  function cancelEmailChange() {
    setEmail(originalEmail);
    setOtp("");
    setOtpMode(false);
    setFormError("");
    setStatus("");
  }

  return (
    <section className="px-4 pb-10 text-[#233044] sm:px-8 lg:px-10">
      <div className="max-w-3xl py-8 sm:py-10">

        <p className="text-[10px] font-extrabold tracking-[1.5px] text-[#64a9b0]">
          ACCOUNT
        </p>

        <h1 className="mt-2 text-3xl font-bold text-[#173c5d]">
          Your profile
        </h1>

        <p className="mt-2 text-sm text-[#788598]">
          Manage your identity and account details.
        </p>

        <section className="mt-8 overflow-hidden border-y border-[#e1e7ec] bg-white">

          {/* PROFILE HEADER */}
          <div className="flex items-center gap-4 border-b border-[#e8edf0] px-6 py-6">

            <div className="grid h-16 w-16 place-items-center rounded-full bg-[#dff1f0] text-xl font-extrabold text-[#2a8290]">
              {initials}
            </div>

            <div>
              <h2 className="text-lg font-bold">
                {name || "Research User"}
              </h2>

              <p className="text-sm text-[#788598]">
                {email}
              </p>
            </div>

          </div>

          <form
            className="space-y-6 p-6"
            onSubmit={handleSubmit}
          >

            {/* NAME */}
            <label className="block text-sm font-bold">
              Full name

              <div className="mt-2 flex items-center gap-3 border border-[#dbe3e8] px-3.5 py-3">

                <UserRound
                  size={17}
                  className="text-[#9ba9b6]"
                />

                <input
                  value={name}
                  onChange={handleNameChange}
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="Enter your full name"
                  autoComplete="name"
                />

              </div>
            </label>

            {/* EMAIL */}
            <label className="block text-sm font-bold">
              Email address

              <div className="mt-2 flex items-center gap-3 border border-[#dbe3e8] px-3.5 py-3">

                <Mail
                  size={17}
                  className="text-[#9ba9b6]"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setFormError("");
                    setSaved(false);
                  }}
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="Enter your email"
                  autoComplete="email"
                />

              </div>
            </label>

            {/* EMAIL CHANGE NOTICE */}
            {email.trim().toLowerCase() !==
              originalEmail.trim().toLowerCase() &&
              !otpMode && (
                <div className="border border-[#f0dfbd] bg-[#fff9ed] p-4 text-sm text-[#806a3c]">
                  <strong>Email verification required.</strong>
                  <p className="mt-1 text-xs">
                    We will send a 6-digit verification code to your
                    new email address before changing it.
                  </p>
                </div>
              )}

            {/* OTP SECTION */}
            {otpMode && (
              <div className="rounded-md border border-[#d9ebeb] bg-[#f0f8f8] p-5">

                <div className="flex items-start gap-3">

                  <ShieldCheck
                    size={20}
                    className="mt-0.5 shrink-0 text-[#4da38f]"
                  />

                  <div className="w-full">

                    <h3 className="font-bold text-[#173c5d]">
                      Verify your new email
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-[#547278]">
                      Enter the 6-digit code sent to{" "}
                      <strong>{email}</strong>.
                    </p>

                    <input
                      value={otp}
                      onChange={(event) => {
                        const value = event.target.value;

                        if (/^\d{0,6}$/.test(value)) {
                          setOtp(value);
                          setFormError("");
                        }
                      }}
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Enter 6-digit OTP"
                      className="mt-4 w-full border border-[#cbdcdf] bg-white px-4 py-3 text-center text-lg font-bold tracking-[6px] outline-none focus:border-[#64a9b0]"
                    />

                    <div className="mt-4 flex gap-3">

                      <button
                        type="button"
                        onClick={handleVerifyEmail}
                        disabled={isLoading || otp.length !== 6}
                        className="inline-flex items-center gap-2 bg-[#173c5d] px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ShieldCheck size={16} />
                        Verify email
                      </button>

                      <button
                        type="button"
                        onClick={cancelEmailChange}
                        className="inline-flex items-center gap-2 border border-[#dbe3e8] px-5 py-2.5 text-sm font-bold text-[#536578]"
                      >
                        <ArrowLeft size={15} />
                        Cancel
                      </button>

                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* PRIVACY */}
            <div className="flex items-start gap-3 border border-[#d9ebeb] bg-[#f0f8f8] p-4 text-sm text-[#547278]">

              <ShieldCheck
                size={18}
                className="shrink-0 text-[#4da38f]"
              />

              Your account details are private and used only to
              personalize your workspace.

            </div>

            {/* ERROR */}
            {formError || error ? (
              <p
                className="text-xs font-semibold text-[#c65b5b]"
                role="alert"
              >
                {formError || error}
              </p>
            ) : null}

            {/* SUCCESS */}
            {saved && (
              <p className="flex items-center gap-1 text-sm font-semibold text-[#4da38f]">
                <Check size={15} />
                Changes saved
              </p>
            )}

            {/* SAVE */}
            {!otpMode && (
              <div className="flex justify-end gap-4 border-t border-[#e8edf0] pt-6">

                <button
                  type="submit"
                  disabled={isLoading || Boolean(status)}
                  className="inline-flex items-center gap-2 bg-[#173c5d] px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={16} />

                  {status || (isLoading ? "Saving..." : "Save changes")}
                </button>

              </div>
            )}

          </form>
        </section>
      </div>
    </section>
  );
}

export default Profile;