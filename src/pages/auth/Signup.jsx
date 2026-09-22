import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, GraduationCap, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { signup as signupUser } from "../../store/authStore";

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", terms: false });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setStatus("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Enter your full name.";
    if (!form.email.trim()) nextErrors.email = "Enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = "Enter a valid email address.";
    if (!form.password) nextErrors.password = "Create a password.";
    else if (form.password.length < 8) nextErrors.password = "Use at least 8 characters.";
    if (!form.confirmPassword) nextErrors.confirmPassword = "Confirm your password.";
    else if (form.password !== form.confirmPassword) nextErrors.confirmPassword = "Passwords do not match.";
    if (!form.terms) nextErrors.terms = "Accept the terms to continue.";
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }
    setStatus("Creating your workspace...");
    try {
      await signupUser({ name: form.name, email: form.email, password: form.password });
      navigate("/dashboard");
    } catch (error) {
      setStatus(error.message);
    }
  }

  const inputClass = (field) => `w-full bg-transparent text-[13px] text-[#293f55] outline-none placeholder:text-[#aeb9c3] ${errors[field] ? "" : ""}`;
  const wrapperClass = (field) => `flex min-h-[44px] items-center gap-2.5 rounded-md border bg-white px-3 text-[#9ba9b6] focus-within:border-[#64a9b0] focus-within:ring-4 focus-within:ring-[#64a9b01a] ${errors[field] ? "border-[#cc6f62]" : "border-[#dbe3e8]"}`;

  return (
    <main className="grid min-h-screen bg-[#f8fafb] lg:grid-cols-[minmax(420px,0.9fr)_minmax(480px,1.1fr)]">
      <section className="relative flex min-h-[250px] flex-col overflow-hidden bg-[#153b56] px-6 py-7 text-[#edf7f7] sm:px-12 lg:min-h-screen lg:px-[8vw] lg:py-10"><div className="absolute -bottom-44 -right-60 h-[560px] w-[560px] rounded-full border border-[#8ccbc41f]" /><div className="relative z-10 flex items-center gap-2.5 text-lg font-extrabold text-white"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#9bd6cd] text-[#153b56]"><GraduationCap size={19} /></span>Research<span className="text-[#79c5bc]">AI</span></div><div className="relative z-10 my-auto max-w-[480px] py-8 lg:py-0"><p className="mb-4 text-[10px] font-extrabold tracking-[1.8px] text-[#64b8b0]">A BETTER RESEARCH HABIT</p><h1 className="font-serif text-[42px] font-normal leading-[.98] tracking-[-2px] text-white sm:text-[54px]">Make every<br /><em className="text-[#9bd6cd]">paper count.</em></h1><p className="mt-6 max-w-[360px] text-sm leading-7 text-[#bdd0d5]">Bring your research together, ask better questions, and find the connections that move your work forward.</p></div></section>
      <section className="flex items-center justify-center bg-[#fbfcfd] px-5 py-9 sm:px-10 lg:px-[7vw] lg:py-12"><div className="w-full max-w-[410px]"><Link to="/login" className="mb-7 inline-flex items-center gap-2 text-xs font-bold text-[#398798]"><ArrowLeft size={14} /> Back to sign in</Link><p className="mb-3 text-[10px] font-extrabold tracking-[1.8px] text-[#64a9b0]">GET STARTED</p><h2 className="mb-2 text-[29px] font-bold tracking-[-1px] text-[#173b57]">Create your workspace</h2><p className="mb-7 text-[13px] text-[#8795a3]">Your research desk is just a few details away.</p>
        <form onSubmit={handleSubmit} noValidate>
          <label className="mb-2 block text-[11px] font-extrabold text-[#44566b]" htmlFor="name">Full name</label><div className={wrapperClass("name")}><UserRound size={16} /><input className={inputClass("name")} id="name" name="name" autoComplete="name" value={form.name} onChange={updateField} placeholder="John Doe" /></div>{errors.name ? <p className="mt-1 text-[11px] text-[#be5d54]">{errors.name}</p> : null}
          <label className="mb-2 mt-4 block text-[11px] font-extrabold text-[#44566b]" htmlFor="email">Email address</label><div className={wrapperClass("email")}><Mail size={16} /><input className={inputClass("email")} id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={updateField} placeholder="you@example.com" /></div>{errors.email ? <p className="mt-1 text-[11px] text-[#be5d54]">{errors.email}</p> : null}
          <label className="mb-2 mt-4 block text-[11px] font-extrabold text-[#44566b]" htmlFor="password">Password</label><div className={wrapperClass("password")}><LockKeyhole size={16} /><input className={inputClass("password")} id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={form.password} onChange={updateField} placeholder="At least 8 characters" /><button type="button" className="p-1 text-[#8e9ba8]" onClick={() => setShowPassword((value) => !value)} aria-label="Toggle password visibility">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>{errors.password ? <p className="mt-1 text-[11px] text-[#be5d54]">{errors.password}</p> : null}
          <label className="mb-2 mt-4 block text-[11px] font-extrabold text-[#44566b]" htmlFor="confirmPassword">Confirm password</label><div className={wrapperClass("confirmPassword")}><LockKeyhole size={16} /><input className={inputClass("confirmPassword")} id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" value={form.confirmPassword} onChange={updateField} placeholder="Repeat your password" /><button type="button" className="p-1 text-[#8e9ba8]" onClick={() => setShowConfirmPassword((value) => !value)} aria-label="Toggle confirmation visibility">{showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>{errors.confirmPassword ? <p className="mt-1 text-[11px] text-[#be5d54]">{errors.confirmPassword}</p> : null}
          <label className="my-5 flex cursor-pointer items-start gap-2 text-[11px] leading-relaxed text-[#7b8998]"><input className="peer sr-only" name="terms" type="checkbox" checked={form.terms} onChange={updateField} /><span className="mt-0.5 grid h-[15px] w-[15px] shrink-0 place-items-center rounded border border-[#cbd6dc] text-transparent peer-checked:border-[#318b95] peer-checked:bg-[#318b95] peer-checked:text-white"><Check size={12} /></span><span>I agree to the <span className="font-bold text-[#398798]">Terms of Service</span> and <span className="font-bold text-[#398798]">Privacy Policy</span>.</span></label>{errors.terms ? <p className="-mt-4 mb-3 text-[11px] text-[#be5d54]">{errors.terms}</p> : null}
          <button type="submit" className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-md bg-[#173b57] text-[13px] font-extrabold text-white transition hover:bg-[#245877] disabled:cursor-wait disabled:opacity-75" disabled={Boolean(status)}>{status || "Create account"}{!status ? <ArrowRight size={17} /> : null}</button>{status ? <p className="mt-2 text-center text-[11px] text-[#398798]">{status}</p> : null}
        </form><p className="my-6 flex items-center justify-center gap-1 text-[11px] text-[#8b98a5]">Already have an account? <Link className="font-extrabold text-[#398798]" to="/login">Sign in</Link></p><div className="flex items-center justify-center gap-2 border-t border-[#e9edef] pt-4 text-center text-[10px] text-[#9ca8b3]"><ShieldCheck className="shrink-0 text-[#6ab09d]" size={16} />Your papers stay private.</div></div></section>
    </main>
  );
}

export default Signup;
