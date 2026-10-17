import { useState } from "react";
import { ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, Sparkles } from "lucide-react";
import { loginTeacher } from "../api/auth";
import type { AuthSession } from "./authTypes";

type Props = { onLogin: (session: AuthSession) => void };

export function TeacherLoginView({ onLogin }: Props) {
  const [email, setEmail] = useState("teacher1@mentify.test");
  const [password, setPassword] = useState("Sample@12345");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Enter your teacher identifier and password to continue.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      const session = await loginTeacher(email.trim(), password);
      onLogin(session);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-indigo-950 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-500 text-xl font-bold shadow-lg shadow-indigo-950/30">
              M
            </span>
            <div>
              <p className="text-lg font-bold tracking-tight">Mentify</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-300">
                Faculty Workspace
              </p>
            </div>
          </div>
          <div className="mt-24 max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-300">
              Teacher Portal
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
              Make every teaching moment count.
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-indigo-100/80">
              One calm workspace for courses, assessment, student support, and the insights that
              help you teach with intention.
            </p>
          </div>
        </div>
        <div className="relative grid gap-3 text-xs text-indigo-100/80 sm:grid-cols-3">
          {["Plan courses", "Support students", "See progress"].map((item) => (
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
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
              M
            </span>
            <div>
              <p className="text-base font-bold text-slate-900">Mentify</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-600">
                Teacher Portal
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
                Sign in to your workspace
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Continue to your courses, students, and teaching tools.
              </p>
            </div>
            {error && (
              <div
                role="alert"
                className="mb-4 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-700"
              >
                {error}
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
                  <input type="checkbox" defaultChecked className="h-3.5 w-3.5 accent-indigo-600" />{" "}
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setError("Use the sample teacher credentials below for local verification.")
                  }
                  className="font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Forgot password?
                </button>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60"
              >
                {isSubmitting ? "Signing in…" : "Sign in to Mentify"}{" "}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
            <div className="mt-6 rounded-lg border border-indigo-100 bg-indigo-50/70 p-3">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-800">
                <Sparkles className="h-4 w-4" /> Demo teacher account
              </div>
              <p className="mt-1 text-[11px] leading-5 text-indigo-700/80">
                alex.rivera@mentify.edu · teacher-demo
              </p>
            </div>
            <p className="mt-6 text-center text-[11px] text-slate-400">
              Protected faculty workspace · Sample UI mode
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
