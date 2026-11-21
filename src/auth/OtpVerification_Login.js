import React, { useEffect, useState } from "react";
import { Redirect, useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import {
  AuthOverlay,
  OtpStep,
  captureAttribution,
  clearPendingLogin,
  getErrorMessage,
  getPendingLogin,
  loginWithOtp,
  saveLoginSession,
  sendLoginOtp,
  useNoindex,
} from "./authShared";

/* Login OTP step. Rendered as an overlay on the home page (see Routes). */
const OtpVerification_Login = () => {
  const history = useHistory();
  const [pending] = useState(getPendingLogin);
  const [isVerifying, setIsVerifying] = useState(false);

  useNoindex();
  useEffect(() => {
    captureAttribution();
  }, []);

  if (!pending) return <Redirect to="/login" />;

  const handleVerify = async (code) => {
    setIsVerifying(true);
    try {
      const data = await loginWithOtp(pending.countryCode, pending.mobile, code);
      if (data.status !== 1) {
        toast.error(data.message || "OTP verification failed.");
        return;
      }
      saveLoginSession(data.user);
      clearPendingLogin();
      toast.success("Login successful!");
      window.location.assign("/");
    } catch (err) {
      const rawMessage = err?.response?.data?.message;
      if (rawMessage === "Mobile number is not verified. Please verify OTP first.") {
        toast.error("You need to verify OTP first.");
        history.push("/register-buyer");
      } else {
        toast.error(getErrorMessage(err, "Something went wrong during login."));
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    try {
      const data = await sendLoginOtp(pending.mobile, pending.countryCode);
      if (data.status === 1) toast.success("New OTP sent successfully!");
      else toast.error(data.message || "Failed to resend OTP.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Something went wrong while resending OTP."));
    }
  };

  return (
    <AuthOverlay onClose={() => history.push("/")}>
      <OtpStep
        mobile={pending.mobile}
        countryCode={pending.countryCode}
        onVerify={handleVerify}
        onResend={handleResend}
        onBack={() => history.push("/login")}
        isVerifying={isVerifying}
      />
    </AuthOverlay>
  );
};

export default OtpVerification_Login;