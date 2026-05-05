import PasswordForm from "@/components/UserProfile/SettingsPage/PasswordForm";

export default function ForcePasswordChange() {
  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-10">
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
          Security Update Required
        </p>
        <h1 className="mt-3 text-3xl font-bold">Change your default password</h1>
        <p className="mt-3 text-sm text-slate-300">
          Your account was created with a temporary default password. You need to
          update it before continuing to the EMIS dashboard.
        </p>
        <div className="mt-8 rounded-2xl border border-white/10 bg-slate-900/60 p-6">
          <PasswordForm forceMode />
        </div>
      </div>
    </div>
  );
}
