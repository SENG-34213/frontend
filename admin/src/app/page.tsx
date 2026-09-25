"use client";

import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";

type Notice = { kind: "success" | "error"; title: string; body: string };

const initialValues = {
  firstName: "", lastName: "", email: "", phoneNumber: "", dateOfBirth: "",
  guardianName: "", guardianPhone: "", grade: "", attendanceMode: "PHYSICAL",
  addressLine1: "", addressLine2: "", city: "", district: "", postalCode: "",
};

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  const paths: Record<string, ReactNode> = {
    grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></>,
    users: <><path d="M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20"/><circle cx="9.5" cy="7" r="4"/><path d="M17 11a4 4 0 0 0 0-8M21 20v-1.5a4 4 0 0 0-3-3.87"/></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 5.5v16M8 7h8M8 11h8"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.6.9l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.6-.9l-1.7.6-1.4-2.4L7.5 15a8 8 0 0 1 0-1.9L6.1 12l1.4-2.4 1.7.6a8 8 0 0 1 1.6-.9l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.6.9l1.7-.6 1.4 2.4-1.4 1.1a8 8 0 0 1-.1 1.9Z" transform="translate(-1 -1) scale(1.08)"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/></>,
    arrow: <><path d="M7 17 17 7M7 7h10v10"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    alert: <><path d="M10.3 3.9 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4m0 4h.01"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
    close: <><path d="m18 6-12 12M6 6l12 12"/></>,
  };
  return <svg {...common}>{paths[name] ?? paths.grid}</svg>;
}

function Field({ label, name, type = "text", placeholder, required = true, hint, values, onChange }: {
  label: string; name: keyof typeof initialValues; type?: string; placeholder?: string;
  required?: boolean; hint?: string; values: typeof initialValues; onChange: (name: keyof typeof initialValues, value: string) => void;
}) {
  return <label className="field"><span className="field-label">{label}{required && <span className="required"> *</span>}</span>
    <input name={name} type={type} required={required} placeholder={placeholder} pattern={name === "phoneNumber" || name === "guardianPhone" ? "(?:\\+94|0)7[0-9]{8}" : undefined} title={name === "phoneNumber" || name === "guardianPhone" ? "Use a Sri Lankan mobile number, for example 0771234567 or +94771234567." : undefined} value={values[name]} onChange={(event) => onChange(name, event.target.value)} />
    {hint && <span className="field-hint">{hint}</span>}
  </label>;
}

function SelectField({ label, name, options, values, onChange }: {
  label: string; name: keyof typeof initialValues; options: [string, string][]; values: typeof initialValues; onChange: (name: keyof typeof initialValues, value: string) => void;
}) {
  return <label className="field"><span className="field-label">{label}<span className="required"> *</span></span>
    <select name={name} required value={values[name]} onChange={(event) => onChange(name, event.target.value)}>{options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
  </label>;
}

export default function Home() {
  const [values, setValues] = useState(initialValues);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [busy, setBusy] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiUrl, setApiUrl] = useState(process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080");
  const [token, setToken] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminUser, setAdminUser] = useState<{ firstName?: string; lastName?: string; email?: string; role?: string } | null>(null);

  useEffect(() => {
    setApiUrl(sessionStorage.getItem("mentify_api_url") || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080");
    const savedToken = sessionStorage.getItem("mentify_access_token") || "";
    setToken(savedToken);
    try {
      const savedAdmin = sessionStorage.getItem("mentify_admin_user");
      if (savedAdmin && savedToken) setAdminUser(JSON.parse(savedAdmin));
      else setShowSettings(true);
    } catch {
      sessionStorage.removeItem("mentify_admin_user");
      setShowSettings(true);
    }
  }, []);

  function change(name: keyof typeof initialValues, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
    if (notice?.kind === "error") setNotice(null);
  }

  async function signIn() {
    const normalizedUrl = apiUrl.trim().replace(/\/$/, "");
    if (!normalizedUrl || !adminEmail.trim() || !adminPassword) {
      setNotice({ kind: "error", title: "Complete the sign-in details", body: "Enter the API base URL, your admin email, and password." });
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      const response = await fetch(`${normalizedUrl}/api/v1/auth/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: adminEmail.trim(), password: adminPassword }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || result.error || (response.status === 401 ? "Email or password is incorrect." : `The server returned ${response.status}.`));
      const session = result.data ?? {};
      const user = session.user ?? {};
      if (!session.accessToken) throw new Error("The login response did not contain an access token.");
      if (!["ADMIN", "SUPER_ADMIN"].includes(user.role)) throw new Error("This account does not have admin access. Sign in with an ADMIN or SUPER_ADMIN account.");
    sessionStorage.setItem("mentify_api_url", normalizedUrl);
      sessionStorage.setItem("mentify_access_token", session.accessToken);
      if (session.refreshToken) sessionStorage.setItem("mentify_refresh_token", session.refreshToken);
      sessionStorage.setItem("mentify_admin_user", JSON.stringify(user));
      setToken(session.accessToken);
      setAdminUser(user);
      setApiUrl(normalizedUrl);
      setAdminPassword("");
      setShowSettings(false);
      setNotice({ kind: "success", title: "Signed in securely", body: `Welcome${user.firstName ? `, ${user.firstName}` : ""}. You can now register students.` });
    } catch (error) {
      const message = error instanceof Error ? error.message : "We couldn’t connect to the sign-in service.";
      setNotice({ kind: "error", title: "Sign-in failed", body: message.includes("Failed to fetch") ? "Couldn’t reach the API. Check that the backend is running, the API URL is correct, and CORS allows this frontend origin." : message });
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    const refreshToken = sessionStorage.getItem("mentify_refresh_token");
    if (refreshToken) {
      try {
        await fetch(`${apiUrl}/api/v1/auth/logout`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
      } catch {
        // Always clear the local session, even when the API is unavailable.
      }
    }
    sessionStorage.removeItem("mentify_access_token");
    sessionStorage.removeItem("mentify_refresh_token");
    sessionStorage.removeItem("mentify_admin_user");
    setToken("");
    setAdminUser(null);
    setNotice({ kind: "success", title: "Signed out", body: "Your admin session was cleared from this browser tab." });
  }

  async function registerStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token.trim()) {
      setShowSettings(true);
      setNotice({ kind: "error", title: "Admin sign-in required", body: "Sign in with an ADMIN or SUPER_ADMIN account before registering a student." });
      return;
    }
    setBusy(true);
    setNotice(null);
    const payload = {
      email: values.email.trim(), firstName: values.firstName.trim(), lastName: values.lastName.trim(),
      phoneNumber: values.phoneNumber.trim(), role: "STUDENT",
      studentProfile: {
        dateOfBirth: values.dateOfBirth, guardianName: values.guardianName.trim(), guardianPhone: values.guardianPhone.trim(),
        attendanceMode: values.attendanceMode, grade: values.grade,
      },
      address: {
        addressLine1: values.addressLine1.trim(), addressLine2: values.addressLine2.trim(), city: values.city.trim(),
        district: values.district.trim(), postalCode: values.postalCode.trim(),
      },
    };
    try {
      const requestOptions: RequestInit = {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token.trim()}` }, body: JSON.stringify(payload),
      };
      let response = await fetch(`${apiUrl}/api/v1/admin/users/register`, requestOptions);
      if (response.status === 401) {
        const refreshToken = sessionStorage.getItem("mentify_refresh_token");
        if (refreshToken) {
          const refreshResponse = await fetch(`${apiUrl}/api/v1/auth/refresh`, {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refreshToken }),
          });
          const refreshed = await refreshResponse.json().catch(() => ({}));
          if (refreshResponse.ok && refreshed.data?.accessToken) {
            const nextAccessToken = refreshed.data.accessToken as string;
            const nextRefreshToken = refreshed.data.refreshToken as string | undefined;
            sessionStorage.setItem("mentify_access_token", nextAccessToken);
            if (nextRefreshToken) sessionStorage.setItem("mentify_refresh_token", nextRefreshToken);
            setToken(nextAccessToken);
            requestOptions.headers = { "Content-Type": "application/json", Authorization: `Bearer ${nextAccessToken}` };
            response = await fetch(`${apiUrl}/api/v1/admin/users/register`, requestOptions);
          } else {
            await signOut();
          }
        }
      }
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        const detail = result.message || result.error || (response.status === 401 ? "Your admin session may have expired. Sign in again and update API settings." : response.status === 403 ? "This account does not have permission to register students." : `The server returned ${response.status}.`);
        throw new Error(detail);
      }
      const student = result.data ?? {};
      const studentId = student.studentProfile?.studentId;
      setNotice({ kind: "success", title: "Student registered", body: `${student.firstName || values.firstName} ${student.lastName || values.lastName} has been added${studentId ? ` with student ID ${studentId}` : ""}. A password setup invitation will be sent by the backend.` });
      setValues(initialValues);
      document.querySelector(".form-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "We couldn’t connect to the registration service. Check the API URL and try again.";
      setNotice({ kind: "error", title: "Registration failed", body: message.includes("Failed to fetch") ? "Couldn’t reach the API. Check that the backend is running, the API URL is correct, and CORS allows this frontend origin." : message });
    } finally {
      setBusy(false);
    }
  }

  return <div className="dashboard-shell">
    <aside className="sidebar">
      <a className="brand" href="#top" aria-label="Mentify home"><span className="brand-mark"><span>m</span></span><span className="brand-name">mentify<span>.</span></span></a>
      <div className="workspace-label">WORKSPACE</div>
      <div className="workspace-picker"><span className="workspace-avatar">M</span><span className="workspace-copy"><strong>Mentify Academy</strong><small>Education workspace</small></span><span className="workspace-dots">···</span></div>
      <nav className="nav-group" aria-label="Main navigation">
        <span className="nav-caption">OVERVIEW</span>
        <a className="nav-link" href="#overview"><Icon name="grid"/><span>Dashboard</span></a>
        <span className="nav-caption nav-caption-spaced">PEOPLE</span>
        <a className="nav-link active" href="#registration"><Icon name="users"/><span>Students</span><span className="nav-chevron"><Icon name="chevron" size={16}/></span></a>
        <a className="nav-link sub-link selected" href="#registration"><span className="sub-dot"/>Register student</a>
        <a className="nav-link" href="#registration"><Icon name="users"/><span>Teachers</span></a>
        <span className="nav-caption nav-caption-spaced">LEARNING</span>
        <a className="nav-link" href="#registration"><Icon name="book"/><span>Courses</span></a>
        <a className="nav-link" href="#registration"><Icon name="calendar"/><span>Classes</span></a>
      </nav>
      <div className="sidebar-bottom"><a className="nav-link" href="#api-settings" onClick={(event) => { event.preventDefault(); setShowSettings(true); }}><Icon name="settings"/><span>{adminUser ? "Account settings" : "Admin sign in"}</span></a>
        <div className="profile-card"><div className="profile-avatar">{adminUser ? `${adminUser.firstName?.[0] || "A"}${adminUser.lastName?.[0] || "D"}` : "AD"}</div><span className="profile-copy"><strong>{adminUser ? `${adminUser.firstName || "Admin"} ${adminUser.lastName || ""}` : "Admin session"}</strong><small>{adminUser?.email || "Sign in to get started"}</small></span><button className="profile-menu" type="button" onClick={() => adminUser ? void signOut() : setShowSettings(true)} aria-label={adminUser ? "Sign out" : "Sign in"}>{adminUser ? "↗" : "···"}</button></div>
      </div>
    </aside>

    <main className="main-area" id="top">
      <header className="topbar"><div className="breadcrumb"><span>People</span><Icon name="chevron" size={14}/><span className="crumb-current">Students</span><Icon name="chevron" size={14}/><span className="crumb-current">Register</span></div><div className="topbar-right"><span className="secure-indicator"><span className="secure-dot"/>{adminUser ? `Signed in as ${adminUser.role === "SUPER_ADMIN" ? "Super admin" : "Admin"}` : "Admin sign in required"}</span><button className="top-avatar" aria-label={adminUser ? "Account settings" : "Sign in"} onClick={() => setShowSettings(true)}>{adminUser ? `${adminUser.firstName?.[0] || "A"}${adminUser.lastName?.[0] || "D"}` : "AD"}</button></div></header>
      <div className="content-wrap" id="registration">
        <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line"/>PEOPLE MANAGEMENT</div><h1>Register a student</h1><p className="page-description">Add a student to your academy and send their account setup invitation.</p></div><button className="text-action" type="button" onClick={() => setShowSettings(true)}><Icon name="settings" size={16}/> API settings</button></div>

        <div className="progress-strip"><div className="progress-step active-step"><span className="step-number"><Icon name="check" size={13}/></span><span>Student details</span></div><span className="progress-line"/><div className="progress-step upcoming-step"><span className="step-number">2</span><span>Account invitation</span></div><span className="progress-note"><Icon name="shield" size={15}/> Secure registration</span></div>

        {notice && <div className={`notice ${notice.kind}`} role="status"><span className="notice-icon"><Icon name={notice.kind === "success" ? "check" : "alert"} size={18}/></span><span className="notice-copy"><strong>{notice.title}</strong><span>{notice.body}</span></span><button className="notice-dismiss" type="button" onClick={() => setNotice(null)} aria-label="Dismiss"><Icon name="close" size={16}/></button></div>}

        <form className="form-card" onSubmit={registerStudent}>
          <section className="form-section"><div className="section-heading"><div className="section-icon"><Icon name="users" size={18}/></div><div><h2>Personal information</h2><p>Start with the student&apos;s basic details.</p></div><span className="section-index">01</span></div>
            <div className="field-grid two-col"><Field label="First name" name="firstName" placeholder="e.g. Amaya" values={values} onChange={change}/><Field label="Last name" name="lastName" placeholder="e.g. Perera" values={values} onChange={change}/><Field label="Email address" name="email" type="email" placeholder="student@example.com" hint="Their account invitation will be sent to this email." values={values} onChange={change}/><Field label="Phone number" name="phoneNumber" type="tel" placeholder="077 123 4567" hint="Use a Sri Lankan mobile number." values={values} onChange={change}/><Field label="Date of birth" name="dateOfBirth" type="date" values={values} onChange={change}/><SelectField label="Grade" name="grade" options={[["", "Select grade"], ...Array.from({ length: 13 }, (_, i) => [String(i + 1), `Grade ${i + 1}`] as [string, string])]} values={values} onChange={change}/></div>
          </section>
          <section className="form-section"><div className="section-heading"><div className="section-icon lavender"><Icon name="users" size={18}/></div><div><h2>Guardian &amp; attendance</h2><p>Keep a guardian contact on file and choose how the student attends.</p></div><span className="section-index">02</span></div>
            <div className="field-grid two-col"><Field label="Guardian full name" name="guardianName" placeholder="e.g. Nadeesha Perera" values={values} onChange={change}/><Field label="Guardian phone" name="guardianPhone" type="tel" placeholder="077 987 6543" values={values} onChange={change}/><div className="attendance-field"><SelectField label="Attendance mode" name="attendanceMode" options={[["PHYSICAL", "In person"], ["ONLINE", "Online"], ["HYBRID", "Hybrid"]]} values={values} onChange={change}/><span className="field-hint">You can update this later in the student profile.</span></div></div>
          </section>
          <section className="form-section address-section"><div className="section-heading"><div className="section-icon mint"><Icon name="pin" size={18}/></div><div><h2>Home address</h2><p>Add the student&apos;s residential address.</p></div><span className="section-index">03</span></div>
            <div className="field-grid two-col"><Field label="Address line 1" name="addressLine1" placeholder="House number and street" values={values} onChange={change}/><Field label="Address line 2" name="addressLine2" placeholder="Apartment, suite, etc." required={false} values={values} onChange={change}/><Field label="City" name="city" placeholder="e.g. Colombo" values={values} onChange={change}/><Field label="District" name="district" placeholder="e.g. Colombo" values={values} onChange={change}/><Field label="Postal code" name="postalCode" placeholder="e.g. 00100" required={false} values={values} onChange={change}/></div>
          </section>
          <div className="form-footer"><span className="required-note"><span className="required">*</span> Required fields</span><div className="form-actions"><button className="secondary-button" type="reset" onClick={() => { setValues(initialValues); setNotice(null); }}>Clear form</button><button className="primary-button" type="submit" disabled={busy}>{busy ? <><span className="spinner"/> Registering…</> : <>Register student <Icon name="arrow" size={16}/></>}</button></div></div>
        </form>

        <div className="invitation-note"><div className="invitation-icon"><Icon name="mail" size={18}/></div><div><strong>What happens next?</strong><p>The student will receive a secure email invitation to verify their address and set a password. You don&apos;t need to create one for them.</p></div><span className="invitation-lock"><Icon name="shield" size={17}/></span></div>
        <footer className="page-footer"><span>© 2026 Mentify Academy</span><span><Icon name="shield" size={14}/> Student data is securely encrypted</span></footer>
      </div>
    </main>

    {showSettings && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowSettings(false); }}><section className="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title"><div className="modal-heading"><div className="modal-icon"><Icon name="shield" size={19}/></div><button className="notice-dismiss" type="button" onClick={() => setShowSettings(false)} aria-label="Close"><Icon name="close" size={17}/></button></div><h2 id="settings-title">{adminUser ? "Admin account" : "Sign in to Mentify"}</h2><p className="modal-description">{adminUser ? `You’re signed in as ${adminUser.email}. Your session is stored in this browser tab.` : "Sign in with your academy admin account to register students. Only ADMIN and SUPER_ADMIN accounts can continue."}</p>{notice?.kind === "error" && <div className="modal-error" role="alert"><Icon name="alert" size={16}/><span>{notice.body}</span></div>}<label className="field modal-field"><span className="field-label">API base URL</span><input value={apiUrl} onChange={(event) => setApiUrl(event.target.value)} placeholder="http://localhost:8080" autoComplete="url" /></label>{!adminUser && <><label className="field modal-field"><span className="field-label">Admin email</span><input type="email" value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} placeholder="admin@youracademy.lk" autoComplete="username" /></label><label className="field modal-field"><span className="field-label">Password</span><input type="password" value={adminPassword} onChange={(event) => setAdminPassword(event.target.value)} placeholder="Enter your password" autoComplete="current-password" onKeyDown={(event) => { if (event.key === "Enter") void signIn(); }} /><span className="field-hint">Your password is sent directly to your Mentify API and is never saved in this browser.</span></label></>}<div className="modal-actions">{adminUser && <button className="secondary-button" type="button" onClick={() => void signOut()}>Sign out</button>}<button className="secondary-button" type="button" onClick={() => setShowSettings(false)}>Cancel</button>{!adminUser && <button className="primary-button" type="button" disabled={busy} onClick={() => void signIn()}>{busy ? <><span className="spinner"/> Signing in…</> : <>Sign in <Icon name="arrow" size={16}/></>}</button>}</div></section></div>}
  </div>;
}
