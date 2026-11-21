import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, Redirect, useHistory, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  IoArrowForward,
  IoCheckmarkCircle,
  IoCloseCircleOutline,
  IoConstructOutline,
  IoCashOutline,
  IoHardwareChipOutline,
  IoHeadset,
  IoHomeOutline,
  IoKeyOutline,
  IoLockClosed,
  IoPeople,
  IoShieldCheckmark,
} from "react-icons/io5";
// import { FcGoogle } from "react-icons/fc";
import {
  AuthOverlay,
  CITIES,
  COUNTRY_CODES,
  FieldError,
  GOLD,
  MAROON,
  ROLES,
  ROLE_KEYS,
  StepBadge,
  captureAttribution,
  clearRegistrationFlags,
  fireRegistrationConversion,
  getCountry,
  getErrorMessage,
  getPendingRegistration,
  inputClass,
  isOtpVerified,
  isValidEmail,
  lockPageScroll,
  saveProfile,
  sendSignupOtp,
  setPendingRegistration,
  trackEvent,
  useDocumentTitle,
  useNoindex,
  validateFullName,
  validateMobile,
} from "./authShared";

/* ============================================================
   Design system — one spacing scale, one type scale.
   Spacing: 6 / 10 / 14 / 20.  Text: 11 / 12 / 13 / 15 / 22.
   Left: deep maroon brand panel.  Right: white compact form,
   fields on a 2-column grid so the card stays short.
   ============================================================ */
const SERIF = "Newsreader, Georgia, serif";
const MAROON_900 = "#4E0C22";
const INK = "#1B1113";
const MUTED = "#776066";
const LINE = "#E6DADE";
const FIELD_BORDER = "#DCCFD4";
const PLACEHOLDER = "#8A7A80";

/* app1.png from the public folder; size = height */
const Logo = ({ size = 22 }) => (
  <img
    src={`${process.env.PUBLIC_URL || ""}/app1.png`}
    alt="ZeroBriks"
    style={{ height: size, width: "auto", display: "block", flex: "none" }}
  />
);

const ROLE_ICONS = {
  buyer: IoHomeOutline,
  owner: IoKeyOutline,
  builder: IoConstructOutline,
};

const BENEFITS = [
  { Icon: IoShieldCheckmark, title: "Verified Properties", sub: "100% verified & genuine listings" },
  { Icon: IoPeople, title: "Verified Owners", sub: "Connect with trusted owners" },
  { Icon: IoHardwareChipOutline, title: "AI Property Search", sub: "Smart recommendations for you" },
  { Icon: IoCashOutline, title: "Zero Brokerage", sub: "No hidden charges" },
  { Icon: IoLockClosed, title: "Secure Transactions", sub: "Your data is 100% protected" },
  { Icon: IoHeadset, title: "Customer Support", sub: "We are always here to help" },
];

/* one field = label + control + error, fixed vertical rhythm */
const Field = ({ label, required, htmlFor, error, children }) => (
  <div>
    <label htmlFor={htmlFor} className="su-label">
      {label} {required && <span style={{ color: "#DC2626" }}>*</span>}
    </label>
    {children}
    <FieldError message={error} />
  </div>
);

// While typing, show only character problems. Length and "required" are checked on submit.
const liveNameError = (value) => {
  const message = validateFullName(value);
  return message.startsWith("Name must be at least") || message === "Name is required" ? "" : message;
};

/*
  SignUp1 has two modes, like Login1:
  - page: <SignUp1 page /> on /register-:role. Full page.
  - popup: <SignUp1 isOpen onClose={...} /> from another page. Closes on X, Escape,
    a click on the dark background, or when the user navigates.
  If neither is set, it renders nothing.
*/
const SignUp1 = ({ page = false, isOpen = false, onClose }) => {
  const params = useParams();
  const history = useHistory();
  const [roleKey, setRoleKey] = useState(ROLES[params.role] ? params.role : "buyer");
  const role = ROLES[roleKey];

  const [form, setForm] = useState({
    fullName: "",
    countryCode: "+91",
    mobile: "",
    email: "",
    city: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const country = getCountry(form.countryCode);

  useDocumentTitle("Create Account | ZeroBriks", page || isOpen);

  // Only the sign-up page asks search engines not to index it.
  useEffect(() => {
    if (!page) return undefined;
    let meta = document.querySelector('meta[name="robots"]');
    const created = !meta;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "robots";
      document.head.appendChild(meta);
    }
    const previous = meta.content;
    meta.content = "noindex, nofollow";
    return () => {
      if (created) meta.remove();
      else meta.content = previous;
    };
  }, [page]);

  // Overlay behaviour (page and popup mode): Escape closes it and the page
  // behind does not scroll. In page mode "closing" means going back home.
  useEffect(() => {
    if (!page && !isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (page) history.push("/");
        else onClose?.();
      }
    };
    document.addEventListener("keydown", onKey);
    const unlock = lockPageScroll();
    return () => {
      document.removeEventListener("keydown", onKey);
      unlock();
    };
  }, [page, isOpen, onClose, history]);

  useEffect(() => {
    captureAttribution();
    trackEvent("form_start", { role: roleKey });
  }, [roleKey]);

  if (!page && !isOpen) return null;
  if (page && !ROLES[params.role]) return <Redirect to="/register-buyer" />;

  // Close the popup first, then go to the new page.
  const goTo = (path) => {
    onClose?.();
    history.push(path);
  };

  // Role tabs: page mode changes the URL, popup mode just changes the form.
  const selectRole = (key) => {
    if (page) history.push(`/register-${key}`);
    else setRoleKey(key);
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleNameChange = (value) => {
    setForm((prev) => ({ ...prev, fullName: value }));
    setErrors((prev) => ({ ...prev, fullName: liveNameError(value) }));
  };

  const handleNameBlur = () => {
    setForm((prev) => ({ ...prev, fullName: prev.fullName.replace(/\s+/g, " ").trim() }));
  };

  // Changing the country trims the number to that country's maximum length.
  const handleCountryChange = (code) => {
    const max = getCountry(code).max;
    setForm((prev) => ({ ...prev, countryCode: code, mobile: prev.mobile.slice(0, max) }));
    setErrors((prev) => ({ ...prev, mobile: "" }));
  };

  const handleMobileChange = (value) => {
    if (new RegExp(`^\\d{0,${country.max}}$`).test(value)) updateField("mobile", value);
  };

  // Server messages about a field go under that field. Anything else is a toast.
  const showServerMessage = (message, fallback) => {
    const text = String(message || "").trim();
    if (!text) {
      toast.error(fallback);
    } else if (/mobile|phone/i.test(text)) {
      setErrors((prev) => ({ ...prev, mobile: text }));
    } else {
      toast.error(text);
    }
  };

  const handleSubmit = async () => {
    if (!agreed) {
      toast.error("Please agree to the Terms & Conditions.");
      return;
    }

    const name = form.fullName.replace(/\s+/g, " ").trim();
    const email = form.email.trim();
    const nextErrors = {};

    const nameError = validateFullName(form.fullName);
    if (nameError) nextErrors.fullName = nameError;

    const mobileError = validateMobile(form.countryCode, form.mobile);
    if (mobileError) nextErrors.mobile = mobileError;

    if (!email) nextErrors.email = "Email is required";
    else if (!isValidEmail(email)) nextErrors.email = "Enter a valid email address";

    if (!form.city) nextErrors.city = "Please select your city";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setIsSubmitting(true);
    try {
      const data = await sendSignupOtp(form.mobile, form.countryCode);
      if (data.status !== 1) {
        showServerMessage(data.message, "Something went wrong.");
        return;
      }
      toast.success("OTP sent successfully!");
      setPendingRegistration({
        role: role.key,
        apiUserType: role.apiUserType,
        fullName: name,
        countryCode: form.countryCode,
        mobile: form.mobile,
        email,
        city: form.city,
      });
      goTo("/verify-otp");
    } catch (err) {
      const message = err?.response?.data?.message;
      if (/mobile|phone/i.test(String(message || ""))) {
        showServerMessage(message, "");
      } else {
        toast.error(getErrorMessage(err, "Error generating OTP. Please try again."));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------- the form (right side / popup body) ---------- */
  const content = (
    <>
      <style>{`
        .su-label{ display:block; font-size:11px; font-weight:600; color:${INK}; margin-bottom:4px; }
        .su-input{
          display:block; width:100%; box-sizing:border-box;
          font:inherit; font-size:13px; color:${INK};
          padding:8px 10px; background:#fff;
          border:1px solid ${FIELD_BORDER}; border-radius:8px;
          outline:none; transition:border-color .15s, box-shadow .15s;
        }
        .su-input::placeholder{ color:${PLACEHOLDER}; }
        .su-input:focus{ border-color:${MAROON}; box-shadow:0 0 0 2px rgba(122,18,48,.12); }
        .su-input--error{ border-color:#DC2626; }
        select.su-input{ cursor:pointer; color:${INK}; color-scheme:light; }
        select.su-input option{ color:${INK}; background:#fff; }
        select.su-input option[value=""]{ color:${PLACEHOLDER}; }
        .su-grid{ display:grid; gap:10px 12px; grid-template-columns:1fr; }
        @media (min-width:560px){ .su-grid{ grid-template-columns:1fr 1fr; } }
        .su-role{
          display:flex; align-items:center; justify-content:center; gap:6px;
          padding:7px 4px; font-size:12px; font-weight:600;
          border:1.5px solid ${LINE}; border-radius:8px; background:#fff; color:#6B5A60;
          cursor:pointer; transition:border-color .15s, background-color .15s, color .15s;
        }
        .su-role:hover{ border-color:${MAROON}; }
        .su-role--on{ border-color:${MAROON}; background:#FBEEF2; color:${MAROON}; }
      `}</style>

      {/* header: title left, role caption under it — no wasted vertical space */}
      <h2 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 22, lineHeight: 1.15, color: INK, margin: 0 }}>
        Create your account
      </h2>
      <p style={{ margin: "3px 0 14px", fontSize: 12, color: MUTED }}>{role.subheading}</p>

      {/* role selector */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${ROLE_KEYS.length}, 1fr)`, gap: 8, marginBottom: 14 }}>
        {ROLE_KEYS.map((key) => {
          const Icon = ROLE_ICONS[key];
          const on = key === role.key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => selectRole(key)}
              className={`su-role${on ? " su-role--on" : ""}`}
              aria-pressed={on}
            >
              <Icon size={14} style={{ color: on ? MAROON : GOLD }} />
              {ROLES[key].label}
            </button>
          );
        })}
      </div>

      {/* fields on a 2-column grid */}
      <div className="su-grid">
        <Field label="Full Name" required htmlFor="zb-name" error={errors.fullName}>
          <input
            id="zb-name"
            type="text"
            placeholder="Enter your full name"
            maxLength={50}
            autoComplete="name"
            value={form.fullName}
            onChange={(e) => handleNameChange(e.target.value)}
            onBlur={handleNameBlur}
            className={`su-input${errors.fullName ? " su-input--error" : ""}`}
          />
        </Field>

        <Field label="Mobile Number" required htmlFor="zb-mobile" error={errors.mobile}>
          <div style={{ display: "flex", gap: 6 }}>
            <select
              value={form.countryCode}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="su-input"
              style={{ width: 96, flex: "none", paddingLeft: 8, paddingRight: 4 }}
              aria-label="Country code"
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <input
              id="zb-mobile"
              type="tel"
              inputMode="numeric"
              maxLength={country.max}
              placeholder={`${country.max}-digit number`}
              value={form.mobile}
              onChange={(e) => handleMobileChange(e.target.value)}
              className={`su-input${errors.mobile ? " su-input--error" : ""}`}
            />
          </div>
        </Field>

        <Field label="Email Address" required htmlFor="zb-email" error={errors.email}>
          <input
            id="zb-email"
            type="email"
            placeholder="Enter your email address"
            maxLength={100}
            value={form.email}
            onChange={(e) => updateField("email", e.target.value.replace(/\s/g, ""))}
            className={`su-input${errors.email ? " su-input--error" : ""}`}
          />
        </Field>

        <Field label="Select City" required htmlFor="zb-city" error={errors.city}>
          <select
            id="zb-city"
            value={form.city}
            onChange={(e) => updateField("city", e.target.value)}
            className={`su-input${errors.city ? " su-input--error" : ""}`}
            style={{ color: form.city ? INK : PLACEHOLDER }}
          >
            <option value="">Select your city</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* terms */}
      <label
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 8,
          margin: "12px 0 0",
          fontSize: 11.5,
          lineHeight: 1.4,
          color: "#3A2D31",
          cursor: "pointer",
        }}
      >
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          style={{ width: 14, height: 14, marginTop: 1, flex: "none", accentColor: MAROON }}
        />
        <span>
          I agree to ZeroBriks{" "}
          <Link to="/terms-conditions" style={{ color: MAROON, fontWeight: 600 }}>
            Terms &amp; Conditions
          </Link>{" "}
          and{" "}
          <Link to="/privacy-policy" style={{ color: MAROON, fontWeight: 600 }}>
            Privacy Policy
          </Link>
        </span>
      </label>

      {/* CTA */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          width: "100%",
          marginTop: 12,
          padding: "10px 14px",
          font: "inherit",
          fontSize: 13.5,
          fontWeight: 600,
          color: "#fff",
          background: agreed && !isSubmitting ? MAROON : "#A3959A",
          border: 0,
          borderRadius: 8,
          cursor: agreed && !isSubmitting ? "pointer" : "not-allowed",
          transition: "background-color .15s",
        }}
      >
        {isSubmitting ? "Sending OTP..." : (
          <>
            Create My Account <IoArrowForward size={15} />
          </>
        )}
      </button>

      {/* divider + google + login, one tight block */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "10px 0" }}>
        <span style={{ flex: 1, height: 1, background: LINE }} />
        {/* <span style={{ fontSize: 10.5, color: MUTED }}>OR</span> */}
        <span style={{ flex: 1, height: 1, background: LINE }} />
      </div>

      {/* <button
        type="button"
        onClick={() => toast.info("Google sign-in is not configured yet.")}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          width: "100%",
          padding: "9px 14px",
          font: "inherit",
          fontSize: 13,
          fontWeight: 500,
          color: INK,
          background: "#fff",
          border: `1px solid ${FIELD_BORDER}`,
          borderRadius: 8,
          cursor: "pointer",
        }}
      >
        <FcGoogle size={16} /> Sign in with Google
      </button> */}

      <p style={{ margin: "10px 0 0", textAlign: "center", fontSize: 14, color: MUTED }}>
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => goTo("/login")}
          style={{
            font: "inherit",
            fontWeight: 600,
            color: MAROON,
            background: "none",
            border: 0,
            padding: 0,
            cursor: "pointer",
            textDecoration: "underline",
            textUnderlineOffset: 2,
          }}
        >
          Login
        </button>
      </p>
    </>
  );

  /* ---------- one overlay for both modes ----------
     Page mode (/login-style routes): the dashboard renders behind this in the
     router, and this draws the dark backdrop + card. Closing goes home. */
  const handleClose = page ? () => history.push("/") : onClose;

  return createPortal(
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose?.();
      }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        overflowY: "auto",
        background: "rgba(10,6,8,.72)",
        fontSize: 14,
      }}
    >
        <style>{`
          .su-card{
            display:grid; grid-template-columns:1fr;
            width:100%; max-width:920px;
            background:#fff; border-radius:16px; overflow:hidden;
            box-shadow:0 20px 50px -28px rgba(27,17,19,.5);
          }
          @media (min-width:820px){
            .su-card{ grid-template-columns:340px 1fr; }
          }
          .su-brand{
            background:linear-gradient(170deg, ${MAROON_900} 0%, ${MAROON} 100%);
            color:#fff; padding:24px;
            display:flex; flex-direction:column; justify-content:center;
          }
          @media (min-width:820px){ .su-brand{ padding:28px; } }
          .su-benefit{
            display:grid; grid-template-columns:24px 1fr; gap:10px; align-items:center;
          }
          .su-benefit + .su-benefit{ margin-top:10px; }
          .su-benefit-icon{
            width:24px; height:24px; border-radius:6px;
            display:flex; align-items:center; justify-content:center;
            background:rgba(255,255,255,.14); color:${GOLD === "#C08A2E" ? "#E8C98A" : "#E8C98A"};
          }
        `}</style>

        <div className="su-card" style={{ position: "relative", margin: "auto" }}>
          {/* close */}
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              zIndex: 1,
              background: "none",
              border: 0,
              padding: 0,
              cursor: "pointer",
              color: "#8A7A80",
            }}
          >
            <IoCloseCircleOutline size={22} />
          </button>

          {/* brand panel */}
          <aside className="su-brand">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* <span style={{ background: "#fff", borderRadius: 6, padding: 3, display: "flex" }}>
                <Logo size={20} />
              </span> */}
              <span style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 600 }}>ZeroBriks</span>
            </div>

            <span
              style={{
                alignSelf: "flex-start",
                margin: "16px 0 0",
                padding: "2px 10px",
                fontSize: 10.5,
                fontWeight: 600,
                letterSpacing: ".03em",
                borderRadius: 999,
                background: "rgba(255,255,255,.15)",
              }}
            >
              STEP 1 OF 4
            </span>

            <h1 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 24, lineHeight: 1.2, margin: "10px 0 0" }}>
              Join India&apos;s Trusted Real Estate Platform
            </h1>
            <p style={{ margin: "8px 0 0", fontSize: 12, lineHeight: 1.55, color: "rgba(255,255,255,.78)" }}>
              Create your free account to access verified properties, connect with verified owners, and
              experience AI-powered property search with zero brokerage.
            </p>

            <div style={{ height: 1, background: "rgba(255,255,255,.18)", margin: "16px 0" }} />

            <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, letterSpacing: ".06em", color: "#E8C98A" }}>
              WHY JOIN ZEROBRIKS?
            </p>
            {BENEFITS.map(({ Icon, title, sub }) => (
              <div className="su-benefit" key={title}>
                <span className="su-benefit-icon">
                  <Icon size={13} />
                </span>
                <div style={{ lineHeight: 1.25 }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600 }}>{title}</p>
                  <p style={{ margin: 0, fontSize: 10.5, color: "rgba(255,255,255,.65)" }}>{sub}</p>
                </div>
              </div>
            ))}
          </aside>

          {/* form panel */}
          <main style={{ padding: "22px 24px", display: "flex", alignItems: "center" }}>
            <div style={{ width: "100%", maxWidth: 480, margin: "0 auto" }}>{content}</div>
          </main>
        </div>
    </div>,
    document.body
  );
};

/* ================= STEP 3: role-based profile questions (overlay) ================= */

export const CompleteProfile = () => {
  const history = useHistory();
  const [pending] = useState(getPendingRegistration);
  const [verified] = useState(isOtpVerified);
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const role = pending ? ROLES[pending.role] : null;

  useNoindex();
  useDocumentTitle("Profile Details | ZeroBriks");

  if (!verified || !role) {
    return <Redirect to={role ? `/register-${role.key}` : "/register-buyer"} />;
  }

  const updateAnswer = (name, value) => {
    setAnswers((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSave = async () => {
    const nextErrors = {};
    role.questions.forEach((q) => {
      if (q.required && !String(answers[q.name] ?? "").trim()) {
        nextErrors[q.name] = `${q.label} is required`;
      }
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setIsSaving(true);
    try {
      await saveProfile({ user_id: pending.userId, role: role.key, ...answers });
      trackEvent("profile_complete", { role: role.key });
      history.push("/thank-you");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not save your details. Try again, or skip for now."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AuthOverlay onClose={() => history.push("/")} maxWidth={360}>
      <div className="text-center">
        <StepBadge step={3} total={4} />
        <h1 className="text-base font-bold text-gray-900">Profile details</h1>
        <p className="mt-0.5 mb-3 text-[11px] text-gray-500">
          A few questions so we can show you the right listings.
        </p>
      </div>

      <div className="text-left">
        {role.questions.map((q) => (
          <div key={q.name} className="mb-2.5">
            <label className="block mb-1 text-[11px] font-semibold text-gray-800">
              {q.label}{" "}
              {q.required ? (
                <span className="text-red-500">*</span>
              ) : (
                <span className="font-normal text-gray-400">(optional)</span>
              )}
            </label>

            {q.type === "select" ? (
              <select
                value={answers[q.name] ?? ""}
                onChange={(e) => updateAnswer(q.name, e.target.value)}
                className={inputClass(errors[q.name])}
              >
                <option value="">Select</option>
                {q.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={q.type === "number" ? "number" : "text"}
                min={q.type === "number" ? 0 : undefined}
                placeholder={q.placeholder || ""}
                value={answers[q.name] ?? ""}
                onChange={(e) => updateAnswer(q.name, e.target.value)}
                className={inputClass(errors[q.name])}
              />
            )}
            <FieldError message={errors[q.name]} />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="w-full py-2 mt-2 rounded-lg text-[13px] font-semibold text-white"
        style={{ backgroundColor: isSaving ? "#9ca3af" : MAROON }}
      >
        {isSaving ? "Saving..." : "Save & Continue"}
      </button>

      <button
        type="button"
        onClick={() => history.push("/thank-you")}
        className="w-full mt-2.5 text-[11px] font-semibold hover:underline"
        style={{ color: MAROON }}
      >
        Skip for now
      </button>
    </AuthOverlay>
  );
};

/* ================= STEP 4: thank you, redirects home after 10 seconds (overlay) ================= */

export const ThankYou = () => {
  const history = useHistory();
  // Read once at mount. The flags are cleared below, so a refresh can't count again.
  const [allowed] = useState(isOtpVerified);
  const [role] = useState(() => getPendingRegistration()?.role || "");
  const [secondsLeft, setSecondsLeft] = useState(10);

  useNoindex();
  useDocumentTitle("Registration Complete | ZeroBriks", allowed);
  useEffect(() => {
    captureAttribution();
  }, []);

  useEffect(() => {
    if (!allowed) return;
    fireRegistrationConversion(role);
    clearRegistrationFlags();
  }, [allowed, role]);

  useEffect(() => {
    if (!allowed) return undefined;
    if (secondsLeft <= 0) {
      window.location.assign("/");
      return undefined;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [allowed, secondsLeft]);

  // Block direct visits before OTP is verified.
  if (!allowed) return <Redirect to="/" />;

  return (
    <AuthOverlay onClose={() => history.push("/")}>
      <div className="text-center">
        <div className="flex justify-center mb-2">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#fdf0f3]">
            <IoCheckmarkCircle size={22} style={{ color: MAROON }} />
          </div>
        </div>
        <h1 className="text-base font-bold text-gray-900">Thank you for registering!</h1>
        <p className="mt-1 text-[11px] text-gray-500">
          Your ZeroBriks account is ready. Explore verified properties or head to your dashboard.
        </p>

        <div className="grid grid-cols-2 gap-2 mt-3">
          <button
            type="button"
            onClick={() => history.push("/")}
            className="py-2 rounded-lg text-[12px] font-semibold text-white"
            style={{ backgroundColor: MAROON }}
          >
            Go to Website
          </button>
          <button
            type="button"
            onClick={() => history.push("/dashboard")}
            className="py-2 rounded-lg text-[12px] font-semibold border-2"
            style={{ borderColor: MAROON, color: MAROON }}
          >
            Go to Dashboard
          </button>
        </div>

        <p className="mt-2.5 text-[10.5px] text-gray-500">
          Redirecting to the home page in {secondsLeft} seconds...
        </p>
      </div>
    </AuthOverlay>
  );
};

export default SignUp1;