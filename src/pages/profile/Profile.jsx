import { useState } from "react";
import { Check, Mail, Save, ShieldCheck, UserRound } from "lucide-react";
import { updateProfile, useAuthStore } from "../../store/authStore";

function Profile() {
  const { user, isLoading, error } = useAuthStore();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState("");

  const initials = (name || "Research User")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleSubmit(event) {
    event.preventDefault();
    setSaved(false);
    setFormError("");

    if (!name.trim()) {
      setFormError("Full name is required.");
      return;
    }

    if (!email.trim()) {
      setFormError("Email address is required.");
      return;
    }

    try {
      await updateProfile({ id: user.id, name, email });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    } catch (saveError) {
      setFormError(saveError.message);
    }
  }

  return (
    <section className="px-4 pb-10 text-[#233044] sm:px-8 lg:px-10">
      <div className="max-w-3xl py-8 sm:py-10">
        <p className="text-[10px] font-extrabold tracking-[1.5px] text-[#64a9b0]">ACCOUNT</p>
        <h1 className="mt-2 text-3xl font-bold text-[#173c5d]">Your profile</h1>
        <p className="mt-2 text-sm text-[#788598]">Manage your identity and account details.</p>
        <section className="mt-8 overflow-hidden border-y border-[#e1e7ec] bg-white">
          <div className="flex items-center gap-4 border-b border-[#e8edf0] px-6 py-6">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-[#dff1f0] text-xl font-extrabold text-[#2a8290]">{initials}</div>
            <div><h2 className="text-lg font-bold">{name || "Research User"}</h2><p className="text-sm text-[#788598]">{email}</p></div>
          </div>
          <form className="space-y-6 p-6" onSubmit={handleSubmit}>
            <label className="block text-sm font-bold">Full name<div className="mt-2 flex items-center gap-3 border border-[#dbe3e8] px-3.5 py-3"><UserRound size={17} className="text-[#9ba9b6]" /><input value={name} onChange={(event) => setName(event.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="Enter your full name" /></div></label>
            <label className="block text-sm font-bold">Email address<div className="mt-2 flex items-center gap-3 border border-[#dbe3e8] px-3.5 py-3"><Mail size={17} className="text-[#9ba9b6]" /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="Enter your email" /></div></label>
            <div className="flex items-start gap-3 border border-[#d9ebeb] bg-[#f0f8f8] p-4 text-sm text-[#547278]"><ShieldCheck size={18} className="shrink-0 text-[#4da38f]" />Your account details are private and used only to personalize your workspace.</div>
            {formError || error ? <p className="text-xs font-semibold text-[#c65b5b]" role="alert">{formError || error}</p> : null}
            <div className="flex justify-end gap-4 border-t border-[#e8edf0] pt-6"><span className="text-sm text-[#4da38f]">{saved ? <><Check size={15} className="mr-1 inline" />Changes saved</> : null}</span><button type="submit" disabled={isLoading} className="inline-flex items-center gap-2 bg-[#173c5d] px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"><Save size={16} />{isLoading ? "Saving..." : "Save changes"}</button></div>
          </form>
        </section>
      </div>
    </section>
  );
}

export default Profile;
