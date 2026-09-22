import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login as loginUser } from "../../store/authStore";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setStatus("");
  }

  function validate() {
    const nextErrors = {};
    if (!form.email.trim()) nextErrors.email = "Enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = "Enter a valid email address.";
    if (!form.password) nextErrors.password = "Enter your password.";
    else if (form.password.length < 8) nextErrors.password = "Use at least 8 characters.";
    return nextErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setStatus("Signing you in...");
    try {
      await loginUser({ email: form.email, password: form.password });
      if (form.remember) window.localStorage.setItem("researchai-remembered", "true");
      navigate("/dashboard");
    } catch (error) {
      setStatus(error.message);
    }
  }

  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[minmax(420px,0.9fr)_minmax(480px,1.1fr)]">
      <section className="relative flex min-h-[310px] flex-col overflow-hidden bg-[#153b56] px-6 py-7 text-[#edf7f7] sm:px-12 lg:min-h-screen lg:px-[8vw] lg:py-10" aria-label="ResearchAI overview">
        <div className="absolute -bottom-44 -right-60 h-[560px] w-[560px] rounded-full border border-[#8ccbc41f]" /><div className="absolute -bottom-24 -right-40 h-[390px] w-[390px] rounded-full border border-[#8ccbc41f]" />
        <div className="relative z-10 flex items-center gap-2.5 text-lg font-extrabold tracking-tight text-white"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#9bd6cd] text-[#153b56]"><GraduationCap size={19} /></span><span>Research<span className="text-[#79c5bc]">AI</span></span></div>
        <div className="relative z-10 my-auto max-w-[480px] py-10 lg:py-0"><p className="mb-4 text-[10px] font-extrabold tracking-[1.8px] text-[#64b8b0]">YOUR RESEARCH, IN FOCUS</p><h1 className="font-serif text-[42px] font-normal leading-[.98] tracking-[-2px] text-white sm:text-[54px] lg:text-[clamp(43px,5vw,67px)]">Read deeper.<br /><em className="text-[#9bd6cd]">Discover more.</em></h1><p className="my-6 max-w-[360px] text-sm leading-7 text-[#bdd0d5] lg:mb-10">A quieter way to understand complex papers, connect ideas, and find the question hiding between the lines.</p>
          <div className="relative max-w-[390px] rounded-[10px] border border-[#8ccbc42e] bg-[#214d65d9] p-5 shadow-[0_18px_45px_#071f2e2e] max-lg:hidden"><div className="flex items-center gap-2 text-[9px] font-extrabold tracking-[1.2px] text-[#9dc4c8]"><span className="h-2 w-2 rounded-full bg-[#75c9bc]" /> INSIGHT MAP <span className="ml-auto flex items-center gap-1 text-[#82d0bd]"><Check size={12} /> READY</span></div><div className="relative h-24"><span className="absolute left-[43%] top-9 z-10 rounded bg-[#9bd6cd] px-2 py-1.5 text-[9px] font-bold text-[#143d57]">RAG</span><span className="absolute left-[7%] top-1 rounded bg-[#2b6179] px-2 py-1.5 text-[9px] text-[#c6e4e2]">Methods</span><span className="absolute bottom-2 right-[5%] rounded bg-[#2b6179] px-2 py-1.5 text-[9px] text-[#c6e4e2]">Findings</span><span className="absolute bottom-0 left-[29%] rounded bg-[#2b6179] px-2 py-1.5 text-[9px] text-[#c6e4e2]">Gaps</span></div><p className="m-0 text-[10px] text-[#a9c6ca]">Turn scattered research into a connected point of view.</p></div>
        </div><p className="relative z-10 m-0 text-[10px] text-[#91b1b9] max-lg:hidden">Built for curious minds and serious questions.</p>
      </section>

      <section className="flex items-center justify-center bg-[#fbfcfd] px-5 py-10 sm:px-10 lg:px-[7vw] lg:py-[55px]"><div className="w-full max-w-[390px]"><div className="mb-9 flex items-center gap-2 text-[17px] font-bold text-[#173b57] lg:hidden"><span className="grid h-7 w-7 place-items-center rounded-lg bg-[#9bd6cd] text-[#153b56]"><GraduationCap size={18} /></span>Research<span className="text-[#79c5bc]">AI</span></div><p className="mb-3 text-[10px] font-extrabold tracking-[1.8px] text-[#64a9b0]">WELCOME BACK</p><h2 className="mb-2 text-[29px] font-bold tracking-[-1px] text-[#173b57]">Sign in to your workspace</h2><p className="mb-8 text-[13px] text-[#8795a3]">Continue your research exactly where you left off.</p>
        <form onSubmit={handleSubmit} noValidate><label className="mb-2 block text-[11px] font-extrabold text-[#44566b]" htmlFor="email">Email address</label><div className={`flex min-h-[46px] items-center gap-2.5 rounded-md border bg-white px-3 text-[#9ba9b6] transition focus-within:border-[#64a9b0] focus-within:ring-4 focus-within:ring-[#64a9b01a] ${errors.email ? "border-[#cc6f62]" : "border-[#dbe3e8]"}`}><Mail size={17} /><input className="w-full border-0 bg-transparent text-[13px] text-[#293f55] outline-none placeholder:text-[#aeb9c3]" id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={updateField} placeholder="you@example.com" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} />{form.email && !errors.email ? <Check className="text-[#4da38f]" size={16} /> : null}</div>{errors.email ? <p className="mb-3 mt-1.5 text-[11px] text-[#be5d54]" id="email-error">{errors.email}</p> : null}
          <div className="mt-5 flex items-center justify-between"><label className="mb-2 block text-[11px] font-extrabold text-[#44566b]" htmlFor="password">Password</label><button type="button" className="text-[11px] text-[#398798]" onClick={() => setStatus("Password reset will be available when authentication is connected.")}>Forgot password?</button></div><div className={`flex min-h-[46px] items-center gap-2.5 rounded-md border bg-white px-3 text-[#9ba9b6] transition focus-within:border-[#64a9b0] focus-within:ring-4 focus-within:ring-[#64a9b01a] ${errors.password ? "border-[#cc6f62]" : "border-[#dbe3e8]"}`}><LockKeyhole size={17} /><input className="w-full border-0 bg-transparent text-[13px] text-[#293f55] outline-none placeholder:text-[#aeb9c3]" id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={form.password} onChange={updateField} placeholder="Enter your password" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "password-error" : undefined} /><button type="button" className="p-1 text-[#8e9ba8]" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>{errors.password ? <p className="mb-3 mt-1.5 text-[11px] text-[#be5d54]" id="password-error">{errors.password}</p> : null}
          <label className="my-[18px] flex cursor-pointer items-center gap-2 text-[11px] text-[#7b8998]"><input className="peer sr-only" name="remember" type="checkbox" checked={form.remember} onChange={updateField} /><span className="grid h-[15px] w-[15px] place-items-center rounded border border-[#cbd6dc] text-transparent peer-checked:border-[#318b95] peer-checked:bg-[#318b95] peer-checked:text-white"><Check size={12} /></span>Keep me signed in</label><button type="submit" className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-md border border-[#173b57] bg-[#173b57] text-[13px] font-extrabold text-white transition hover:bg-[#245877] disabled:cursor-wait disabled:opacity-75" disabled={Boolean(status)}>{status || "Sign in"}{!status ? <ArrowRight size={17} /> : null}</button>{status && status !== "Signing you in..." ? <p className="mt-2.5 text-center text-[11px] text-[#be5d54]" role="status">{status}{status.includes("No account") ? <> <Link className="font-bold text-[#398798]" to="/signup">Create an account</Link></> : null}</p> : null}</form>
        <div className="my-7 flex items-center gap-3 text-[10px] text-[#a5b0ba] before:h-px before:flex-1 before:bg-[#e4e9ed] after:h-px after:flex-1 after:bg-[#e4e9ed]"><span>or continue with</span></div><div className="grid grid-cols-1 gap-2.5 min-[381px]:grid-cols-2"><button type="button" className="flex min-h-[39px] items-center justify-center gap-2 rounded border border-[#dbe3e8] bg-white text-[11px] font-bold text-[#5f7182] hover:border-[#9fc7cd] hover:bg-[#f3f8f9]" onClick={() => setStatus("Google sign in will be available when authentication is connected.")}><span className="text-sm font-extrabold text-[#4285f4]">G</span> Google</button><button type="button" className="flex min-h-[39px] items-center justify-center gap-2 rounded border border-[#dbe3e8] bg-white text-[11px] font-bold text-[#5f7182] hover:border-[#9fc7cd] hover:bg-[#f3f8f9]" onClick={() => setStatus("GitHub sign in will be available when authentication is connected.")}><span className="text-[10px] font-extrabold text-[#34495e]">GH</span> GitHub</button></div><p className="my-7 flex items-center justify-center gap-1 text-[11px] text-[#8b98a5]">New to ResearchAI? <Link className="flex items-center gap-1 font-extrabold text-[#398798]" to="/signup">Create an account <ArrowRight size={13} /></Link></p><div className="flex items-center justify-center gap-2 border-t border-[#e9edef] pt-4 text-center text-[10px] leading-snug text-[#9ca8b3]"><ShieldCheck className="shrink-0 text-[#6ab09d]" size={16} />Your papers stay private and are only used to answer your questions.</div>
      </div></section>
    </main>
  );
}

export default Login;
