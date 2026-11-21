import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { IoAlertCircleOutline, IoArrowBackCircleOutline, IoCloseCircleOutline, IoLockClosed } from "react-icons/io5";
import { friendlyServerMessage } from "../utils/Signupvalidation";

/* ============================ TOAST LAYER ============================ */

// Toasts must sit above the sign-up overlay (z-index 9999). Without this,
// error toasts render behind the modal.
if (typeof document !== "undefined" && !document.getElementById("zb-toast-layer")) {
  const style = document.createElement("style");
  style.id = "zb-toast-layer";
  style.textContent = ".Toastify__toast-container { z-index: 10000 !important; }";
  document.head.appendChild(style);
}

/* ============================ CONFIG ============================ */

export const MAROON = "#7a0f2e";
export const GOLD = "#d4952b";

// min/max = number of national digits accepted for each country code
export const COUNTRY_CODES = [
  { value: "+91", label: "IN +91", min: 10, max: 10 },
  { value: "+1", label: "US +1", min: 10, max: 10 },
  { value: "+44", label: "UK +44", min: 10, max: 10 },
  { value: "+61", label: "AU +61", min: 9, max: 9 },
  { value: "+81", label: "JP +81", min: 10, max: 11 },
  { value: "+49", label: "DE +49", min: 10, max: 11 },
  { value: "+971", label: "AE +971", min: 9, max: 9 },
  { value: "+7", label: "RU +7", min: 10, max: 10 },
  { value: "+27", label: "ZA +27", min: 9, max: 9 },
];

export const getCountry = (value) =>
  COUNTRY_CODES.find((c) => c.value === value) || { value, label: value, min: 10, max: 10 };

/* Cities available for sign-up */

export const CITIES = [
  "Ahmedabad",
  "Bengaluru",
  "Chennai",
  "Delhi",
  "Hyderabad",
  "Kolkata",
  "Mumbai",
  "Pune",
];

const PROPERTY_TYPES = ["Apartment", "Villa", "Independent house", "Plot / land", "Commercial", "PG / co-living"];
const BUDGET_RANGES = ["Under ₹50 lakh", "₹50 lakh – ₹1 crore", "₹1 – 2 crore", "Above ₹2 crore"];
const PROJECT_TYPES = ["Residential", "Commercial", "Mixed use", "Plots / townships"];

// One URL per role: /register-<key>. Keep 4–6 questions per role.
// RERA is asked only of agents and builders.
// apiUserType is sent as user_type to register_user. Confirm these with the backend.
export const ROLES = {
  buyer: {
    key: "buyer",
    label: "Buyer / Tenant",
    subheading: "Find your perfect home or property",
    apiUserType: "Owner",
    questions: [
      { name: "intent", label: "Buy or rent", type: "select", required: true, options: ["Buy", "Rent"] },
      { name: "budget", label: "Budget range", type: "select", required: true, options: BUDGET_RANGES },
      { name: "cityArea", label: "City and area", type: "text", required: true, placeholder: "e.g. Bhopal, Arera Colony" },
      { name: "propertyType", label: "Property type", type: "select", required: true, options: PROPERTY_TYPES },
    ],
  },
  owner: {
    key: "owner",
    label: "Owner",
    subheading: "List and manage your property",
    apiUserType: "Owner",
    questions: [
      { name: "listingType", label: "Sell or rent out", type: "select", required: true, options: ["Sell", "Rent out"] },
      { name: "propertyType", label: "Property type", type: "select", required: true, options: PROPERTY_TYPES },
      { name: "cityLocality", label: "City and locality", type: "text", required: true },
      { name: "expectedPrice", label: "Expected price (₹)", type: "number", required: false, placeholder: "e.g. 4500000" },
    ],
  },
  builder: {
    key: "builder",
    label: "Builder / Developer",
    subheading: "Promote your projects and reach more buyers",
    apiUserType: "Builder",
    questions: [
      { name: "companyName", label: "Company name", type: "text", required: true },
      { name: "reraNumber", label: "RERA number", type: "text", required: false, placeholder: "Add now or later" },
      { name: "cities", label: "Cities", type: "text", required: true, placeholder: "e.g. Bhopal, Indore" },
      { name: "projectTypes", label: "Project types", type: "select", required: true, options: PROJECT_TYPES },
    ],
  },
};
export const ROLE_KEYS = Object.keys(ROLES);

/* ============================ API ============================ */

const API = process.env.REACT_APP_API_URL;

// TODO: confirm with the backend. This endpoint is not in the uploaded code.
const PROFILE_ENDPOINT = "/cust_api/update_profile";

export const sendSignupOtp = (mobile, countryCode) =>
  axios
    .post(`${API}/cust_api/generate-otp`, { mobile_number: mobile, country_code: countryCode })
    .then((r) => r.data);

export const sendLoginOtp = (mobile, countryCode) =>
  axios
    .post(`${API}/cust_api/generate-login-otp`, { mobile_number: mobile, country_code: countryCode })
    .then((r) => r.data);

export const verifySignupOtp = (countryCode, mobile, otp) =>
  axios
    .post(`${API}/cust_api/verify-otp`, { country_code: countryCode, mobile_number: mobile, otp })
    .then((r) => r.data);

export const registerUser = (payload) =>
  axios.post(`${API}/cust_api/register_user`, payload).then((r) => r.data);

export const loginWithOtp = (countryCode, mobile, otp) =>
  axios
    .post(`${API}/cust_api/user_login`, { country_code: countryCode, mobile_number: mobile, otp })
    .then((r) => r.data);

export const saveProfile = (payload) =>
  axios.post(`${API}${PROFILE_ENDPOINT}`, payload).then((r) => r.data);

// Free view/post counts. Failures are logged, not shown, so they never block sign-up.
export async function addFreeCounts(userId) {
  if (!userId) return;
  let freeView = "0";
  let freePost = "0";

  try {
    const { data } = await axios.get(`${API}/cust_api/get_setting`);
    if (data?.status === 1 && Array.isArray(data.data) && data.data.length) {
      freeView = data.data[0]?.free_view_count ?? "0";
      freePost = data.data[0]?.free_post_count ?? "0";
    }
  } catch (err) {
    console.error("Failed to fetch settings:", err);
  }

  const formData = new FormData();
  formData.append("user_id", userId);
  formData.append("free_view_count", freeView);
  formData.append("free_post_count", freePost);

  try {
    await axios.post(`${API}/cust_api/add_count`, formData);
  } catch (err) {
    console.error("add_count failed:", err);
  }
}

export const getErrorMessage = (err, fallback) =>
  friendlyServerMessage(err?.response?.data?.message) || fallback;

/* ============================ SESSION ============================ */

const KEYS = {
  pendingRegistration: "zb_pending_registration",
  pendingLogin: "zb_pending_login",
  otpVerified: "zb_otp_verified",
  conversionFired: "zb_conversion_fired",
  attribution: "zb_attribution",
};

// Every key the app reads for the logged-in user.
const SESSION_KEYS = [
  "accessToken",
  "User_Type",
  "user_type",
  "Country_code",
  "Mobile_Number",
  "user_name",
  "user_email",
  "city",
];

const readJSON = (key) => {
  try {
    return JSON.parse(sessionStorage.getItem(key));
  } catch {
    return null;
  }
};

const writeJSON = (key, value) => sessionStorage.setItem(key, JSON.stringify(value));

export const getPendingRegistration = () => readJSON(KEYS.pendingRegistration);
export const setPendingRegistration = (data) => writeJSON(KEYS.pendingRegistration, data);
export const updatePendingRegistration = (patch) =>
  writeJSON(KEYS.pendingRegistration, { ...getPendingRegistration(), ...patch });
export const markOtpVerified = () => sessionStorage.setItem(KEYS.otpVerified, "true");
export const isOtpVerified = () => sessionStorage.getItem(KEYS.otpVerified) === "true";
export const clearRegistrationFlags = () => {
  sessionStorage.removeItem(KEYS.otpVerified);
  sessionStorage.removeItem(KEYS.pendingRegistration);
};

export const getPendingLogin = () => readJSON(KEYS.pendingLogin);
export const setPendingLogin = (data) => writeJSON(KEYS.pendingLogin, data);
export const clearPendingLogin = () => sessionStorage.removeItem(KEYS.pendingLogin);

// Writes to sessionStorage (this tab) and localStorage (survives closing the browser).
function writeSession(values) {
  Object.entries(values).forEach(([key, value]) => {
    const safe = value ?? "";
    sessionStorage.setItem(key, safe);
    localStorage.setItem(key, safe);
  });
}

export function saveRegisteredSession(user = {}, pending = {}) {
  writeSession({
    accessToken: user._id ?? user.user?._id,
    User_Type: user.user_type ?? pending.apiUserType,
    Country_code: user.country_code ?? pending.countryCode,
    Mobile_Number: user.mobile_number ?? pending.mobile,
    user_name: user.full_name ?? pending.fullName,
    user_email: user.email ?? pending.email,
    city: user.city ?? pending.city,
  });
}

export function saveLoginSession(user = {}) {
  writeSession({
    accessToken: user._id || "N/A",
    Country_code: user.country_code || "N/A",
    Mobile_Number: user.mobile_number || "N/A",
    user_type: user.user_type || "N/A",
    user_name: user.full_name || "N/A",
    user_email: user.email || "N/A",
  });
}

// Runs once when the app starts. If this tab has no session but the browser
// remembers one, it copies the session back into sessionStorage.
export function restoreSession() {
  if (sessionStorage.getItem("accessToken")) return;
  SESSION_KEYS.forEach((key) => {
    const value = localStorage.getItem(key);
    if (value !== null) sessionStorage.setItem(key, value);
  });
}

// Use on logout. Clears both storages, otherwise the session returns on the next visit.
export function clearSession() {
  SESSION_KEYS.forEach((key) => {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  });
}

/* ============================ VALIDATION ============================ */

// Mobile length depends on the selected country code.
export function validateMobile(countryCode, mobile) {
  const c = getCountry(countryCode);
  if (!mobile) return "Mobile number is required";
  if (!/^\d+$/.test(mobile)) return "Mobile number must contain only digits";
  if (mobile.length < c.min || mobile.length > c.max) {
    return c.min === c.max
      ? `Mobile number must be exactly ${c.min} digits for ${c.label}`
      : `Mobile number must be ${c.min} to ${c.max} digits for ${c.label}`;
  }
  if (countryCode === "+91" && !/^[6-9]/.test(mobile)) return "Enter a valid mobile number (starts with 6-9)";
  return "";
}

// Full name: English letters, single spaces, and . ' - only.
// Returns an error message, or "" when valid.
export function validateFullName(raw = "") {
  const v = String(raw).replace(/\s+/g, " ").trim();
  if (!v) return "Name is required";
  if (/\p{Extended_Pictographic}/u.test(v)) return "Emojis are not allowed in the name";
  if (/\d/.test(v)) return "Name cannot contain numbers";
  if (/[^A-Za-z .'-]/.test(v)) {
    if (/\p{L}/u.test(v)) return "Please enter your name in English letters only (Hindi and Marathi are not accepted)";
    return "Name can only contain letters, spaces, dots, hyphens and apostrophes";
  }
  if (v.replace(/[^A-Za-z]/g, "").length < 2) return "Name must be at least 2 letters";
  return "";
}

export const isValidEmail = (email) =>
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/.test(email);

/* ============================ TRACKING ============================ */

const ATTRIBUTION_PARAMS = [
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
  "gclid", "gbraid", "wbraid", "fbclid", "msclkid", "ttclid",
];

export const getAttribution = () => readJSON(KEYS.attribution) || {};

export function captureAttribution() {
  const params = new URLSearchParams(window.location.search);
  const found = {};
  ATTRIBUTION_PARAMS.forEach((key) => {
    const value = params.get(key);
    if (value) found[key] = value;
  });
  if (Object.keys(found).length) writeJSON(KEYS.attribution, { ...getAttribution(), ...found });
}

// Custom events go to dataLayer (GTM). Create them in GA4 as custom events.
export function trackEvent(name, params = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: name,
    ...getAttribution(),
    page_path: window.location.pathname,
    ...params,
  });
}

// Fires once per browser session, on /thank-you only.
export function fireRegistrationConversion(role) {
  if (sessionStorage.getItem(KEYS.conversionFired) === "true") return;
  sessionStorage.setItem(KEYS.conversionFired, "true");

  window.gtag?.("event", "sign_up", { method: "mobile", role }); // GA4
  window.fbq?.("track", "CompleteRegistration", { content_name: role }); // Meta

  const adsConversionId = process.env.REACT_APP_GOOGLE_ADS_CONVERSION_ID; // e.g. "AW-123456789/AbCdEfGh"
  if (adsConversionId) window.gtag?.("event", "conversion", { send_to: adsConversionId }); // Google Ads
}

export function useNoindex() {
  useEffect(() => {
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
  }, []);
}

// Sets the browser tab title while enabled, and restores the old one afterwards.
export function useDocumentTitle(title, enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title, enabled]);
}

/* ============================ UI ============================ */

export const inputClass = (hasError) =>
  `w-full px-3 py-2 text-xs text-gray-700 bg-white border rounded-lg focus:outline-none focus:border-[#7a0f2e] ${hasError ? "border-red-500" : "border-gray-300"
  }`;

export const FieldError = ({ message }) =>
  message ? (
    <p className="flex items-center gap-1 mt-1 text-[11px] text-red-500">
      <IoAlertCircleOutline size={13} />
      {message}
    </p>
  ) : null;


export const AuthLayout = ({ left, children }) => {
  // Start every auth page at the top. Otherwise the scroll position from the
  // previous page carries over and hides the header and the top of the card.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex justify-center min-h-[80vh] px-3 py-10 bg-[#faf7f5]">
      <div
        className={`relative flex w-full overflow-hidden bg-white shadow-xl rounded-2xl ${left ? "max-w-3xl" : "max-w-md"
          }`}
      >
        {left && (
          <div className="hidden md:flex md:w-5/12 flex-col p-6" style={{ backgroundColor: "#f4fbf5" }}>
            {left}
          </div>
        )}
        <div className="flex-1 p-5 md:p-7">{children}</div>
      </div>
    </div>
  );
};

/*
  AuthOverlay: the same dark backdrop and compact white card as the Login popup.
  Routes render the home page behind it, so OTP, profile and thank-you steps
  look like popups on the hero. Escape and a click on the backdrop call onClose.
*/
// Stops the page behind an overlay from scrolling. Locks <html> and <body>
// (some layouts scroll on <html>) and returns a function that restores the old values.
export function lockPageScroll() {
  const html = document.documentElement;
  const prevHtml = html.style.overflow;
  const prevBody = document.body.style.overflow;
  html.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
  return () => {
    html.style.overflow = prevHtml;
    document.body.style.overflow = prevBody;
  };
}

export const AuthOverlay = ({ onClose, maxWidth = 340, children }) => {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closeRef.current?.();
    };
    document.addEventListener("keydown", onKey);
    const unlock = lockPageScroll();
    return () => {
      document.removeEventListener("keydown", onKey);
      unlock();
    };
  }, []);

  return createPortal(
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closeRef.current?.();
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
        padding: "24px 12px",
        overflowY: "auto",
        overscrollBehavior: "contain",
        background: "rgba(0,0,0,.5)",
      }}
    >
      <div
        className="relative w-full bg-white rounded-xl shadow-xl"
        style={{ margin: "auto", maxWidth, padding: "16px 18px" }}
      >
        <button
          type="button"
          onClick={() => closeRef.current?.()}
          aria-label="Close"
          className="absolute top-2.5 right-2.5 text-gray-500 hover:text-gray-800"
        >
          <IoCloseCircleOutline size={19} />
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
};

export const StepBadge = ({ step, total }) => (
  <span
    className="inline-block px-2.5 py-0.5 mb-2 text-[10px] font-medium rounded-full"
    style={{ backgroundColor: "#f6e1e5", color: MAROON }}
  >
    Step {step} of {total}
  </span>
);

const OTP_LENGTH = 4;
const RESEND_SECONDS = 30;

// Shared OTP box for registration and login verification. Compact, like the Login popup.
export const OtpStep = ({ badge, mobile, countryCode, onVerify, onResend, onBack, isVerifying }) => {
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    setDigits(Array(OTP_LENGTH).fill(""));
    setSeconds(RESEND_SECONDS);
    inputRefs.current[0]?.focus();
    await onResend();
  };

  const handleVerify = () => {
    const code = digits.join("");
    if (code.length !== OTP_LENGTH) {
      toast.error("Please enter the 4-digit OTP.");
      return;
    }
    onVerify(code);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <button type="button" onClick={onBack} aria-label="Back" className="text-gray-600 hover:text-gray-900">
          <IoArrowBackCircleOutline size={20} />
        </button>
        <span className="w-5" />
      </div>

      <div className="flex justify-center mb-2">
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#fdf0f3]">
          <IoLockClosed size={13} style={{ color: MAROON }} />
        </div>
      </div>

      <div className="mb-3 text-center">
        {badge && <div className="flex justify-center mb-1.5">{badge}</div>}
        <h2 className="text-base font-bold text-gray-900">Verify your mobile number</h2>
        <p className="mt-0.5 text-[11px] text-gray-500">
          We sent a code to <span className="font-semibold text-gray-700">{countryCode} {mobile}</span>
        </p>
      </div>

      <div className="flex justify-center gap-2 mb-2.5">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-10 h-10 text-center text-base font-semibold text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#7a0f2e]"
          />
        ))}
      </div>

      <div className="flex justify-between mb-3 text-[11px] text-gray-600">
        <button
          type="button"
          onClick={handleResend}
          disabled={seconds > 0}
          className={seconds > 0 ? "text-gray-400 cursor-not-allowed" : "font-semibold hover:underline"}
          style={seconds > 0 ? undefined : { color: MAROON }}
        >
          Resend OTP
        </button>
        <span>{seconds} sec</span>
      </div>

      <button
        type="button"
        onClick={handleVerify}
        disabled={isVerifying}
        className="w-full py-2 rounded-lg text-[13px] font-semibold text-white"
        style={{ backgroundColor: isVerifying ? "#9ca3af" : MAROON }}
      >
        {isVerifying ? "Verifying..." : "Verify"}
      </button>
    </div>
  );
};