export type PasswordRule = {
  label: string;
  valid: boolean;
};

export function getPasswordRules(password: string, identity = ""): PasswordRule[] {
  const normalizedIdentity = identity.trim().toLowerCase();
  const identityParts = normalizedIdentity.split(/[^a-z0-9]+/).filter((part) => part.length >= 3);
  const containsIdentity = identityParts.some((part) => password.toLowerCase().includes(part));

  return [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "One uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "One lowercase letter", valid: /[a-z]/.test(password) },
    { label: "One number", valid: /\d/.test(password) },
    { label: "One special character", valid: /[^A-Za-z0-9]/.test(password) },
    { label: "Does not include your name or email", valid: !containsIdentity },
  ];
}

export function isStrongPassword(password: string, identity = "") {
  return getPasswordRules(password, identity).every((rule) => rule.valid);
}

export function passwordStrength(password: string, identity = "") {
  const validRules = getPasswordRules(password, identity).filter((rule) => rule.valid).length;
  if (!password) return { label: "Not set", bars: 0, tone: "bg-slate-200" };
  if (validRules <= 2) return { label: "Weak", bars: 1, tone: "bg-rose-500" };
  if (validRules <= 4) return { label: "Fair", bars: 2, tone: "bg-amber-500" };
  if (validRules < 6) return { label: "Good", bars: 3, tone: "bg-sky-500" };
  return { label: "Strong", bars: 4, tone: "bg-emerald-500" };
}
