import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { IoAlertCircleOutline, IoCloseCircleOutline, IoShieldCheckmarkOutline } from "react-icons/io5";
import { FiCheck } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaApple, FaLock } from "react-icons/fa";
import {
  COUNTRY_CODES,
  MAROON,
  captureAttribution,
  getErrorMessage,
  sendLoginOtp,
  setPendingLogin,
  validateMobile,
} from "./authShared";

const LOGIN_BENEFITS = [
  "Save favourite properties",
  "Manage your properties",
  "Personalised recommendations",
  "Access exclusive offers",
  "Track enquiries",
  "Faster & secure experience",
];

/*
  Login1 has two modes:
  - page: <Login1 page /> on the /login route. The dashboard renders BEHIND it
    in the router (see App routes) and this draws a dark 50% backdrop with the
    login card on top. Closing (X, Escape, backdrop click) goes back to "/".
  - popup: <Login1 isOpen onClose={...} /> from another page. Closes via onClose.
  If neither is set, it renders nothing.
*/
const Login1 = ({ page = false, isOpen = false, onClose, onSwitchToSignUp }) => {
  const history = useHistory();
  const [countryCode, setCountryCode] = useState("+91");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Only the /login page asks search engines not to index it.
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

  // Overlay behaviour (both modes): Escape closes it and the page behind
  // does not scroll. In page mode "closing" means going back home.
  useEffect(() => {
    if (!page && !isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (page) history.push("/");
        else onClose?.();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "auto";
    };
  }, [page, isOpen, onClose, history]);

  useEffect(() => {
    captureAttribution();
  }, []);

  if (!page && !isOpen) return null;

  // Close the popup first, then go to the new page.
  const goTo = (path) => {
    onClose?.();
    history.push(path);
  };

  const handleMobileChange = (value) => {
    if (/^\d{0,10}$/.test(value)) {
      setMobile(value);
      setError("");
    }
  };

  const handleLogin = async () => {
    const validationError = validateMobile(countryCode, mobile);
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await sendLoginOtp(mobile, countryCode);
      if (data.status === 1) {
        toast.success("OTP sent successfully!");
        setPendingLogin({ mobile, countryCode });
        goTo("/verify-login-otp");
      } else {
        toast.error("User not found. Please sign up first.");
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Something went wrong. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = (
    <>
      <div className="flex justify-center mb-2">
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#fdf0f3]">
          <FaLock size={13} style={{ color: MAROON }} />
        </div>
      </div>

      <div className="mb-3 text-center">
        <h1 className="text-base font-bold text-gray-900">Welcome Back!</h1>
        <p className="mt-0.5 text-[11px] text-gray-500">Login to continue your real estate journey</p>
      </div>

      <label className="block mb-1 text-[11px] font-semibold text-gray-800">
        Mobile Number <span className="text-red-500">*</span>
      </label>
      <div className="flex gap-2">
        <select
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
          className="w-1/3 px-2 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none"
        >
          {COUNTRY_CODES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <input
          type="tel"
          inputMode="numeric"
          maxLength={10}
          placeholder="Enter 10-digit mobile number"
          value={mobile}
          onChange={(e) => handleMobileChange(e.target.value)}
          className={`flex-1 px-3 py-1.5 text-xs bg-white border rounded-lg focus:outline-none focus:border-[#7a0f2e] ${
            error ? "border-red-500" : "border-gray-300"
          }`}
        />
      </div>
      {error && (
        <p className="flex items-center gap-1 mt-1 text-[11px] text-red-500">
          <IoAlertCircleOutline size={13} />
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleLogin}
        disabled={isSubmitting}
        className="w-full py-2 mt-3 rounded-lg text-[13px] font-semibold text-white"
        style={{ backgroundColor: isSubmitting ? "#9ca3af" : MAROON }}
      >
        {isSubmitting ? "Sending OTP..." : "Login"}
      </button>

      <div className="flex items-center gap-3 my-2.5">
        <span className="flex-1 h-px bg-gray-200" />
        <span className="text-[10px] text-gray-400"></span>
        <span className="flex-1 h-px bg-gray-200" />
      </div>

      {/* <p className="mb-1.5 text-center text-[10.5px] font-medium text-gray-500">Login with</p>
      <div className="grid grid-cols-2 gap-2 mb-2.5">
        <button
          type="button"
          onClick={() => toast.info("Google sign-in is not configured yet.")}
          className="flex items-center justify-center gap-1.5 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-xs font-semibold text-gray-700"
        >
          <FcGoogle size={14} /> Google
        </button>
        <button
          type="button"
          onClick={() => toast.info("Apple sign-in is not configured yet.")}
          className="flex items-center justify-center gap-1.5 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-xs font-semibold text-gray-700"
        >
          <FaApple size={14} /> Apple
        </button>
      </div> */}

      <div className="bg-[#fdf0f3] rounded-lg p-2.5 mb-2.5 border border-[#f7d6de]">
        <div className="flex items-center gap-1.5 mb-1.5">
          <IoShieldCheckmarkOutline size={13} style={{ color: MAROON }} />
          <h4 className="text-[11px] font-bold" style={{ color: MAROON }}>
            Why login to ZeroBriks?
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10.5px] text-gray-700 font-medium">
          {LOGIN_BENEFITS.map((item) => (
            <div key={item} className="flex items-center gap-1">
              <FiCheck className="flex-shrink-0 text-emerald-600" size={11} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-[11px] text-gray-600 font-medium">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={() => (onSwitchToSignUp ? onSwitchToSignUp() : goTo("/register-buyer"))}
          className="font-bold hover:underline"
          style={{ color: MAROON }}
        >
          Sign Up
        </button>
      </p>
    </>
  );

  /* one overlay for both modes; in page mode the dashboard shows behind it.
     Rendered into document.body via a portal with inline styles, so no parent
     transform/overflow/z-index can trap or hide it. */
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
        padding: "24px 12px",
        overflowY: "auto",
        background: "rgba(0,0,0,.5)",
      }}
    >
      <div
        className="relative w-full bg-white rounded-xl shadow-xl"
        style={{ margin: "auto", maxWidth: 340, padding: "16px 18px" }}
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute top-2.5 right-2.5 text-gray-500 hover:text-gray-800"
        >
          <IoCloseCircleOutline size={19} />
        </button>
        {content}
      </div>
    </div>,
    document.body
  );
};

export default Login1;