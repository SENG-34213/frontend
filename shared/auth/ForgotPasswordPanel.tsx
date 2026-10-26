import { useEffect, useMemo, useRef, useState } from "react";
import { getPasswordRules, isStrongPassword, passwordStrength } from "./passwordValidation";

type ResetStep = "email" | "otp" | "password";

type Props = {
  roleLabel: string;
  initialEmail?: string;
  requestReset: (email: string) => Promise<{ message?: string }>;
  verifyOtp: (email: string, otp: string) => Promise<string>;
  resetPassword: (resetToken: string, newPassword: string) => Promise<unknown>;
  onComplete: () => void;
  onCancel: () => void;
};

const OTP_EXPIRY_MINUTES = 10;

type VerificationCodeInputProps = {
  value: string;
  onChange: (value: string) => void;
};

function VerificationCodeInput({ value, onChange }: VerificationCodeInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: 6 }, (_, index) => value[index] ?? "");

  function updateDigit(index: number, nextValue: string) {
    const digit = nextValue.replace(/\D/g, "").slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = digit;
    onChange(nextDigits.join(""));
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pastedCode = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pastedCode);
    inputRefs.current[Math.min(pastedCode.length, 5)]?.focus();
  }

  return (
    <div className="flex justify-center gap-2 sm:gap-3" role="group" aria-label="6-digit verification code">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputRefs.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          onChange={(event) => updateDigit(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          className="h-12 w-10 rounded-xl border border-slate-200 bg-white text-center text-xl font-bold text-slate-800 shadow-sm outline-none transition focus:border-indigo-500 focus:bg-indigo-50/40 focus:ring-4 focus:ring-indigo-100 sm:h-14 sm:w-12 sm:text-2xl"
          aria-label={`Verification code digit ${index + 1}`}
          autoComplete={index === 0 ? "one-time-code" : "off"}
        />
      ))}
    </div>
  );
}

export function ForgotPasswordPanel({
  roleLabel,
  initialEmail = "",
  requestReset,
  verifyOtp,
  resetPassword,
  onComplete,
  onCancel,
}: Props) {
  const [step, setStep] = useState<ResetStep>("email");
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rules = useMemo(() => getPasswordRules(newPassword, email), [newPassword, email]);
  const strength = useMemo(() => passwordStrength(newPassword, email), [newPassword, email]);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  useEffect(() => {
    if (!expiresAt) return;
    const updateCountdown = () =>
      setSecondsLeft(Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)));
    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt]);

  async function handleRequestCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) {
      setError("Enter the email address connected to your learning account.");
      return;
    }
    setError("");
    setNotice("");
    setIsSubmitting(true);
    try {
      const response = await requestReset(email.trim());
      setStep("otp");
      setExpiresAt(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
      setNotice(
        response.message || "If an account matches that email, a 6-digit code has been sent.",
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Unable to send the reset code.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    if (secondsLeft === 0) {
      setError("That code has expired. Request a new code to continue.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      setResetToken(await verifyOtp(email.trim(), otp));
      setStep("password");
      setNotice("");
    } catch (verifyError) {
      setError(
        verifyError instanceof Error ? verifyError.message : "That code is invalid or expired.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResetPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isStrongPassword(newPassword, email) || !passwordsMatch) {
      setError("Choose a strong password and make sure both password fields match.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await resetPassword(resetToken, newPassword);
      onComplete();
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Unable to reset your password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const title =
    step === "email"
      ? "Reset your password"
      : step === "otp"
        ? "Check your email"
        : "Create a new password";
  const eyebrow =
    step === "email"
      ? "Account recovery"
      : step === "otp"
        ? "Verification code"
        : "Secure your account";

  return (
    <main
      className="min-h-screen bg-slate-50 font-sans lg:grid lg:grid-cols-[1.05fr_0.95fr]"
      style={{
        fontFamily:
          '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <section className="relative hidden overflow-hidden bg-indigo-950 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
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
              Secure recovery
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
              Get back to your workspace.
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-indigo-100/80">
              We will verify your email with a short-lived code before you choose a new password.
            </p>
          </div>
        </div>
        <div className="relative text-xs text-indigo-100/80">
          Your 6-digit verification code expires in {OTP_EXPIRY_MINUTES} minutes.
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-600">
                Account Recovery
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-9">
            <div className="mb-7">
              <div className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-lg text-indigo-600">
                ⌁
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">
                {eyebrow}
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {step === "email"
                  ? "Enter your email and we will send a verification code if an account exists."
                  : step === "otp"
                    ? `Enter the code sent to ${email}.`
                    : "Choose a password you have not used before."}
              </p>
            </div>
            <div className="mb-6 grid grid-cols-3 gap-2">
              {["Email", "Code", "Password"].map((label, index) => {
                const activeIndex = step === "email" ? 0 : step === "otp" ? 1 : 2;
                return (
                  <div
                    key={label}
                    className={`rounded-full px-2 py-1.5 text-center text-[10px] font-bold uppercase tracking-wide ${index <= activeIndex ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-400"}`}
                  >
                    {index + 1}. {label}
                  </div>
                );
              })}
            </div>
            {error && (
              <div
                role="alert"
                className="mb-4 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-700"
              >
                {error}
              </div>
            )}
            {notice && (
              <div
                role="status"
                className="mb-4 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-xs font-medium text-emerald-700"
              >
                {notice}
              </div>
            )}

            {step === "email" && (
              <form className="space-y-4" onSubmit={handleRequestCode}>
                <label className="block text-xs font-semibold text-slate-700">
                  Email address
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-2 block h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-normal text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                </label>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex h-11 w-full items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60"
                >
                  {isSubmitting ? "Sending code…" : "Send verification code"}
                </button>
              </form>
            )}

            {step === "otp" && (
              <form className="space-y-4" onSubmit={handleVerifyCode}>
                <div>
                  <p className="mb-3 text-center text-xs font-semibold text-slate-700">
                    Enter your 6-digit verification code
                  </p>
                  <VerificationCodeInput value={otp} onChange={setOtp} />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {secondsLeft > 0
                      ? `Code expires in ${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`
                      : "Code expired"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setNotice("");
                      setError("");
                    }}
                    className="font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    Send a new code
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || secondsLeft === 0}
                  className="flex h-11 w-full items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Verifying code…" : "Verify code"}
                </button>
              </form>
            )}

            {step === "password" && (
              <form className="space-y-4" onSubmit={handleResetPassword}>
                <label className="block text-xs font-semibold text-slate-700">
                  New password
                  <div className="relative mt-2">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      className="block h-11 w-full rounded-lg border border-slate-200 px-3 pr-16 text-sm font-normal text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute inset-y-0 right-0 px-3 text-xs font-semibold text-slate-400 hover:text-indigo-600"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </label>
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
                      {rules.map((rule) => (
                        <div
                          key={rule.label}
                          className={`text-[11px] ${rule.valid ? "text-emerald-600" : "text-slate-400"}`}
                        >
                          {rule.valid ? "✓" : "•"} {rule.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <label className="block text-xs font-semibold text-slate-700">
                  Confirm new password
                  <div className="relative mt-2">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      className="block h-11 w-full rounded-lg border border-slate-200 px-3 pr-16 text-sm font-normal text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((current) => !current)}
                      className="absolute inset-y-0 right-0 px-3 text-xs font-semibold text-slate-400 hover:text-indigo-600"
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </label>
                {confirmPassword && !passwordsMatch && (
                  <p className="text-xs font-medium text-rose-600">Passwords do not match.</p>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex h-11 w-full items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60"
                >
                  {isSubmitting ? "Saving password…" : "Reset password"}
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={onCancel}
              className="mt-5 w-full text-xs font-semibold text-slate-500 hover:text-indigo-600"
            >
              Back to sign in
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
