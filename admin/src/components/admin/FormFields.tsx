import type { RegistrationValues } from "@/features/admin/types";

export function Field({ label, name, type = "text", placeholder, required = true, hint, values, onChange }: {
  label: string; name: keyof RegistrationValues; type?: string; placeholder?: string;
  required?: boolean; hint?: string; values: RegistrationValues; onChange: (name: keyof RegistrationValues, value: string) => void;
}) {
  const phone = name === "phoneNumber" || name === "guardianPhone";
  return <label className="field"><span className="field-label">{label}{required && <span className="required"> *</span>}</span>
    <input name={name} type={type} required={required} placeholder={placeholder} pattern={phone ? "(?:\\+94|0)7[0-9]{8}" : undefined} title={phone ? "Use a Sri Lankan mobile number, for example 0771234567 or +94771234567." : undefined} value={values[name]} onChange={(event) => onChange(name, event.target.value)} />
    {hint && <span className="field-hint">{hint}</span>}
  </label>;
}

export function SelectField({ label, name, options, values, onChange }: {
  label: string; name: keyof RegistrationValues; options: [string, string][]; values: RegistrationValues; onChange: (name: keyof RegistrationValues, value: string) => void;
}) {
  return <label className="field"><span className="field-label">{label}<span className="required"> *</span></span>
    <select name={name} required value={values[name]} onChange={(event) => onChange(name, event.target.value)}>{options.map(([value, optionLabel]) => <option key={value} value={value}>{optionLabel}</option>)}</select>
  </label>;
}
