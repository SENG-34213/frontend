import { useMemo, useState } from "react";
import { getPasswordRules, isStrongPassword, passwordStrength } from "./passwordValidation";

const Icon = ({ children }: { children: string }) => <span aria-hidden="true">{children}</span>;

type Props = {
  email: string;
  roleLabel: string;
  onSubmit: (currentPassword: string, newPassword: string) => Promise<void>;
  onCancel: () => void;
};

export function SetPasswordPanel({ email, roleLabel, onSubmit, onCancel }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rules = useMemo(() => getPasswordRules(newPassword, email), [newPassword, email]);
  const strength = useMemo(() => passwordStrength(newPassword, email), [newPassword, email]);
  const matches = newPassword.length > 0 && newPassword === confirmPassword;
  const canSubmit = Boolean(currentPassword) && isStrongPassword(newPassword, email) && matches;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      setError("Use a strong password and make sure both password fields match.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await onSubmit(currentPassword, newPassword);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unable to update your password.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const passwordField = (
    label: string,
    value: string,
    setValue: (value: string) => void,
    visible: boolean,
    toggle: () => void,
    autoComplete: string,
  ) => (
    <label className="block text-xs font-semibold text-slate-700">
      {label}
      <div className="relative mt-2">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setValue(event.target.value)}
          className="block h-11 w-full rounded-lg border border-slate-200 px-3 pr-11 text-sm font-normal text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
          autoComplete={autoComplete}
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute inset-y-0 right-0 grid w-11 place-items-center text-slate-400 hover:text-indigo-600"
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        >
          <Icon>{visible ? "Hide" : "Show"}</Icon>
        </button>
      </div>
    </label>
  );

  return (
    <main className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-indigo-950 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-300">
                {roleLabel} Workspace
              </p>
            </div>
          </div>
          <div className="mt-24 max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-300">
              Secure account setup
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
              Make your workspace yours.
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-indigo-100/80">
              Create a personal password to finish activating your learning account.
            </p>
          </div>
        </div>
        <div className="relative flex items-center gap-2 text-xs text-indigo-100/80">
          <Icon>✓</Icon> Your temporary password will stop working after this step.
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-600">
                Account Setup
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-9">
            <div className="mb-7">
              <div className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600 text-lg">
                <Icon>⌘</Icon>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">
                One-time setup
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                Create your password
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                You are setting up <span className="font-semibold text-slate-700">{email}</span>.
                Choose a password you will remember.
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
              {passwordField(
                "Temporary password",
                currentPassword,
                setCurrentPassword,
                showCurrent,
                () => setShowCurrent((value: boolean) => !value),
                "current-password",
              )}
              {passwordField(
                "New password",
                newPassword,
                setNewPassword,
                showNew,
                () => setShowNew((value: boolean) => !value),
                "new-password",
              )}
              {newPassword && (
                <div className="-mt-1 space-y-2">
                  <div
                    className="flex items-center gap-1.5"
                    aria-label={`Password strength: ${strength.label}`}
                  >
                    {[1, 2, 3, 4].map((bar) => (
                      <span
                        key={bar}
                        className={`h-1.5 flex-1 rounded-full ${bar <= strength.bars ? strength.tone : "bg-slate-200"}`}
                      />
                    ))}
                    <span className="ml-1 text-[11px] font-semibold text-slate-500">
                      {strength.label}
                    </span>
                  </div>
                  <div className="grid gap-1 sm:grid-cols-2">
                    {rules.map((rule: { label: string; valid: boolean }) => (
                      <div
                        key={rule.label}
                        className={`flex items-center gap-1.5 text-[11px] ${rule.valid ? "text-emerald-600" : "text-slate-400"}`}
                      >
                        {rule.valid ? (
                          <Icon>✓</Icon>
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        )}
                        {rule.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {passwordField(
                "Confirm new password",
                confirmPassword,
                setConfirmPassword,
                showConfirm,
                () => setShowConfirm((value: boolean) => !value),
                "new-password",
              )}
              {confirmPassword && !matches && (
                <p className="text-xs font-medium text-rose-600">Passwords do not match.</p>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Saving password…" : "Save password and continue"}
                {!isSubmitting && <Icon>→</Icon>}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="w-full pt-1 text-xs font-semibold text-slate-500 hover:text-indigo-600"
              >
                Back to sign in
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
