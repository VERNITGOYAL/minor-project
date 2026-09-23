import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Eye, EyeOff, GraduationCap, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { requestPasswordReset, resetPassword } from "../../store/authStore";

function PasswordReset() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState("email");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function clearMessages() {
    setStatus("");
    setError("");
  }

  async function handleRequestCode(event) {
    event.preventDefault();
    clearMessages();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }

    setStatus("Sending verification code...");
    setSubmitting(true);

    try {
      await requestPasswordReset(email);
      setStep("password");
      setStatus("A 6-digit code was sent to your email.");
    } catch (requestError) {
      setStatus("");
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetPassword(event) {
    event.preventDefault();
    clearMessages();

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit verification code.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setStatus("Resetting your password...");
    setSubmitting(true);

    try {
      await resetPassword({ email, otp, password });
      setStatus("Password reset successfully. Redirecting to login...");
      window.setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch (resetError) {
      setStatus("");
      setError(resetError.message);
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-[#fbfcfd] lg:grid-cols-[minmax(420px,0.9fr)_minmax(480px,1.1fr)]">
      <section className="relative flex min-h-[260px] flex-col overflow-hidden bg-[#153b56] px-6 py-7 text-white sm:px-12 lg:min-h-screen lg:px-[8vw] lg:py-10">
        <div className="relative z-10 flex items-center gap-2.5 text-lg font-extrabold"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#9bd6cd] text-[#153b56]"><GraduationCap size={19} /></span>Research<span className="text-[#79c5bc]">AI</span></div>
        <div className="relative z-10 my-auto max-w-[430px] py-10 lg:py-0"><p className="mb-4 text-[10px] font-extrabold tracking-[1.8px] text-[#64b8b0]">ACCOUNT SECURITY</p><h1 className="font-serif text-[48px] leading-none text-white">A fresh start for your workspace.</h1><p className="mt-6 max-w-[360px] text-sm leading-7 text-[#bdd0d5]">Verify your email and create a new password securely.</p></div>
      </section>
      <section className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-[7vw]"><div className="w-full max-w-[390px]"><Link to="/login" className="mb-10 inline-flex items-center gap-2 text-xs font-bold text-[#398798]"><ArrowLeft size={15} /> Back to login</Link><p className="mb-3 text-[10px] font-extrabold tracking-[1.8px] text-[#64a9b0]">PASSWORD RESET</p><h2 className="mb-2 text-[29px] font-bold tracking-[-1px] text-[#173b57]">{step === "email" ? "Forgot your password?" : "Create a new password"}</h2><p className="mb-8 text-[13px] text-[#8795a3]">{step === "email" ? "Enter your account email and we will send a verification code." : `Enter the code sent to ${email.trim().toLowerCase()}.`}</p>
        {step === "email" ? <form onSubmit={handleRequestCode} className="space-y-5"><label className="block text-[11px] font-extrabold text-[#44566b]" htmlFor="reset-email">Email address</label><div className="flex min-h-[46px] items-center gap-2.5 rounded-md border border-[#dbe3e8] bg-white px-3 text-[#9ba9b6]"><Mail size={17} /><input className="w-full bg-transparent text-[13px] text-[#293f55] outline-none" id="reset-email" type="email" value={email} onChange={(event) => { setEmail(event.target.value); clearMessages(); }} placeholder="you@example.com" autoComplete="email" /></div><button className="flex min-h-[46px] w-full items-center justify-center rounded-md bg-[#173b57] text-[13px] font-extrabold text-white disabled:opacity-70" disabled={submitting}>{submitting ? "Sending..." : "Send verification code"}</button></form> : <form onSubmit={handleResetPassword} className="space-y-5"><label className="block text-[11px] font-extrabold text-[#44566b]" htmlFor="reset-otp">Verification code</label><input className="w-full border border-[#dbe3e8] bg-white px-3.5 py-3 text-center text-lg font-bold tracking-[6px] outline-none" id="reset-otp" value={otp} onChange={(event) => { if (/^\d{0,6}$/.test(event.target.value)) { setOtp(event.target.value); clearMessages(); } }} inputMode="numeric" maxLength={6} placeholder="000000" /><label className="block text-[11px] font-extrabold text-[#44566b]" htmlFor="new-password">New password</label><div className="flex min-h-[46px] items-center gap-2.5 rounded-md border border-[#dbe3e8] bg-white px-3 text-[#9ba9b6]"><LockKeyhole size={17} /><input className="w-full bg-transparent text-[13px] text-[#293f55] outline-none" id="new-password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => { setPassword(event.target.value); clearMessages(); }} autoComplete="new-password" placeholder="At least 8 characters" /><button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div><label className="block text-[11px] font-extrabold text-[#44566b]" htmlFor="confirm-password">Confirm password</label><input className="w-full border border-[#dbe3e8] bg-white px-3.5 py-3 text-[13px] outline-none" id="confirm-password" type="password" value={confirmPassword} onChange={(event) => { setConfirmPassword(event.target.value); clearMessages(); }} autoComplete="new-password" placeholder="Repeat your password" /><button className="flex min-h-[46px] w-full items-center justify-center rounded-md bg-[#173b57] text-[13px] font-extrabold text-white disabled:opacity-70" disabled={submitting}>{submitting ? "Resetting..." : "Reset password"}</button></form>}
        {error ? <p className="mt-4 text-center text-xs font-semibold text-[#c65b5b]" role="alert">{error}</p> : null}{status && (step === "password" || status.includes("successfully")) ? <p className="mt-4 flex items-center justify-center gap-1 text-xs font-semibold text-[#4da38f]"><Check size={15} />{status}</p> : null}<p className="mt-8 flex items-center justify-center gap-2 border-t border-[#e9edef] pt-5 text-center text-[10px] text-[#9ca8b3]"><ShieldCheck className="text-[#6ab09d]" size={16} />Your account stays protected throughout the reset.</p></div></section>
    </main>
  );
}

export default PasswordReset;