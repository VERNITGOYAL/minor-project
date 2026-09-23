import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyOTP, resendOTP } from "../../store/authStore";

function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleVerify(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!email) {
      setError("Email address is missing. Please sign up again.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);

      await verifyOTP({
        email,
        otp,
      });

      navigate("/dashboard");

    } catch (error) {
      setError(error.message || "Invalid OTP.");

    } finally {
      setLoading(false);
    }
  }


  async function handleResend() {
    setError("");
    setMessage("");

    if (!email) {
      setError("Email address is missing. Please sign up again.");
      return;
    }

    try {
      setResending(true);

      const result = await resendOTP({
        email,
      });

      setMessage(
        result.message || "A new OTP has been sent."
      );

    } catch (error) {
      setError(
        error.message || "Unable to resend OTP."
      );

    } finally {
      setResending(false);
    }
  }


  function handleOTPChange(event) {
    const value = event.target.value;

    if (/^\d{0,6}$/.test(value)) {
      setOtp(value);
      setError("");
    }
  }


  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8fafb] px-5">
      <section className="w-full max-w-md rounded-lg border border-[#e1e7ec] bg-white p-8">

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-[#173b57]">
            Verify your email
          </h1>

          <p className="mt-2 text-sm text-[#788598]">
            We sent a 6-digit verification code to
          </p>

          <p className="mt-1 text-sm font-bold text-[#398798]">
            {email}
          </p>
        </div>


        <form onSubmit={handleVerify}>

          <label
            htmlFor="otp"
            className="mb-2 block text-sm font-bold text-[#44566b]"
          >
            Verification code
          </label>

          <input
            id="otp"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={handleOTPChange}
            placeholder="000000"
            className="w-full rounded-md border border-[#dbe3e8] px-4 py-3 text-center text-xl tracking-[8px] outline-none focus:border-[#64a9b0]"
          />

          {error && (
            <p className="mt-2 text-xs font-semibold text-[#c65b5b]">
              {error}
            </p>
          )}

          {message && (
            <p className="mt-2 text-xs font-semibold text-[#4da38f]">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-md bg-[#173b57] py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify email"}
          </button>

        </form>


        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="mt-5 w-full text-sm font-bold text-[#398798] disabled:opacity-50"
        >
          {resending ? "Sending..." : "Resend OTP"}
        </button>

      </section>
    </main>
  );
}

export default VerifyEmail;