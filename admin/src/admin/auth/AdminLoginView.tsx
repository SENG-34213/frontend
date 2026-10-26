import { useState } from "react";
import { ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole } from "lucide-react";
import {
  loginAdmin,
  requestAdminPasswordReset,
  resetAdminPassword,
  verifyAdminPasswordResetOtp,
} from "../api/authApi";
import { ForgotPasswordPanel } from "../../../../shared/auth/ForgotPasswordPanel";

type Props = { onLogin: (session: Awaited<ReturnType<typeof loginAdmin>>) => void };

export function AdminLoginView({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const isTemporarilyLocked = /too many unsuccessful|temporarily locked/i.test(error);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Enter your admin email and password to continue.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      const session = await loginAdmin(email.trim(), password, rememberMe);
      onLogin(session);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (showForgotPassword) {
    return (
      <ForgotPasswordPanel
        roleLabel="Administration"
        initialEmail={email}
        requestReset={requestAdminPasswordReset}
        verifyOtp={verifyAdminPasswordResetOtp}
        resetPassword={resetAdminPassword}
        onComplete={() => {
          setShowForgotPassword(false);
          setError("");
        }}
        onCancel={() => setShowForgotPassword(false)}
      />
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-indigo-950 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-300">
                Administration Workspace
              </p>
            </div>
          </div>
          <div className="mt-24 max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-300">
              Admin Portal
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
              Keep every learning operation moving forward.
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-indigo-100/80">
              One calm workspace for people, courses, academic operations, and the insights that
              help your institution run with intention.
            </p>
          </div>
        </div>
        <div className="relative grid gap-3 text-xs text-indigo-100/80 sm:grid-cols-3">
          {["Manage people", "Coordinate academics", "See platform health"].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-indigo-300" />
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-600">
                Admin Portal
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-9">
            <div className="mb-7">
              <div className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                <LockKeyhole className="h-5 w-5" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">
                Welcome back
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                Sign in to administration
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Continue to users, academic operations, and platform controls.
              </p>
            </div>
            {error && (
              <div
                role="alert"
                className={`mb-4 rounded-lg border px-3 py-2.5 text-xs ${isTemporarilyLocked ? "border-amber-200 bg-amber-50 text-amber-800" : "border-rose-100 bg-rose-50 font-medium text-rose-700"}`}
              >
                {isTemporarilyLocked ? (
                  <div className="flex items-start gap-2.5">
                    <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <div>
                      <p className="font-semibold">Account temporarily locked</p>
                      <p className="mt-1 leading-5">
                        Too many unsuccessful attempts. Try again after 15 minutes or reset your
                        password now.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setError("");
                          setShowForgotPassword(true);
                        }}
                        className="mt-2 font-semibold text-amber-900 underline underline-offset-2"
                      >
                        Reset password
                      </button>
                    </div>
                  </div>
                ) : (
                  error
                )}
              </div>
            )}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <label className="block text-xs font-semibold text-slate-700">
                Email address
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 block h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-normal text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                  autoComplete="username"
                />
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                Password
                <div className="relative mt-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="block h-11 w-full rounded-lg border border-slate-200 px-3 pr-11 text-sm font-normal text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute inset-y-0 right-0 grid w-11 place-items-center text-slate-400 hover:text-indigo-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>
              <div className="flex items-center justify-between pt-1 text-xs">
                <label className="flex items-center gap-2 text-slate-500">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-3.5 w-3.5 accent-indigo-600"
                  />{" "}
                  Keep me signed in for one day
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setShowForgotPassword(true);
                  }}
                  className="font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Forgot password?
                </button>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
              >
                {isSubmitting ? "Signing in…" : "Sign in to your workspace"}
                {!isSubmitting && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
            <p className="mt-6 text-center text-[11px] text-slate-400">
              Protected administration workspace
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
