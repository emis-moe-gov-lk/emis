import { useAuthContext } from "@asgardeo/auth-react";
import PasswordForm from "@/components/UserProfile/SettingsPage/PasswordForm";

export default function ForcePasswordChange() {
  const { signOut } = useAuthContext();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Security Update Required
            </p>
            <h1 className="mt-3 text-3xl font-bold">Change your default password</h1>
            <p className="mt-3 text-sm text-slate-300">
              Your account was created with a temporary default password. You need to
              update it before continuing to the EMIS dashboard.
            </p>
          </div>
          <button
            onClick={() => signOut()}
            className="ml-6 shrink-0 text-sm text-slate-400 hover:text-white underline underline-offset-2 transition"
          >
            Logout
          </button>
        </div>
        <div className="mt-8 rounded-2xl border border-white/10 bg-slate-900/60 p-6">
          <PasswordForm forceMode />
        </div>
      </div>
    </div>
  );
}
