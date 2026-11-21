import React, { useEffect, useState } from "react";
import { Redirect, useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import {
  AuthOverlay,
  OtpStep,
  StepBadge,
  addFreeCounts,
  captureAttribution,
  getErrorMessage,
  getPendingRegistration,
  isOtpVerified,
  markOtpVerified,
  registerUser,
  saveRegisteredSession,
  sendSignupOtp,
  trackEvent,
  updatePendingRegistration,
  useNoindex,
  verifySignupOtp,
} from "./authShared";
import { friendlyServerMessage } from "../utils/Signupvalidation";

/* Sign-up OTP step. Rendered as an overlay on the home page (see Routes). */
const OtpVerification = () => {
  const history = useHistory();
  const [pending] = useState(getPendingRegistration);
  const [alreadyVerified] = useState(isOtpVerified);
  const [isVerifying, setIsVerifying] = useState(false);

  useNoindex();
  useEffect(() => {
    captureAttribution();
  }, []);

  if (!pending) return <Redirect to="/register-buyer" />;
  if (alreadyVerified) return <Redirect to="/complete-profile" />;

  const handleVerify = async (code) => {
    setIsVerifying(true);
    try {
      const verifyData = await verifySignupOtp(pending.countryCode, pending.mobile, code);
      if (verifyData.status !== 1) {
        toast.error(verifyData.message || "OTP verification failed.");
        return;
      }

      const registerData = await registerUser({
        full_name: pending.fullName,
        country_code: pending.countryCode,
        mobile_number: pending.mobile,
        user_type: pending.apiUserType,
        email: pending.email,
        city: pending.city,
      });
      if (registerData.status !== 1) {
        toast.error(friendlyServerMessage(registerData.message) || "Registration failed.");
        return;
      }

      const user = registerData.data;
      const userId = user?._id ?? user?.user?._id;

      saveRegisteredSession(user, pending);
      await addFreeCounts(userId);
      markOtpVerified();
      updatePendingRegistration({ userId });
      trackEvent("otp_verified", { role: pending.role });

      history.push("/complete-profile");
    } catch (err) {
      toast.error(getErrorMessage(err, "Something went wrong. Please try again."));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    try {
      const data = await sendSignupOtp(pending.mobile, pending.countryCode);
      if (data.status === 1) toast.success("New OTP sent successfully!");
      else toast.error(data.message || "Failed to resend OTP.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Something went wrong while resending OTP."));
    }
  };

  return (
    <AuthOverlay onClose={() => history.push("/")}>
      <OtpStep
        badge={<StepBadge step={2} total={4} />}
        mobile={pending.mobile}
        countryCode={pending.countryCode}
        onVerify={handleVerify}
        onResend={handleResend}
        onBack={() => history.push(`/register-${pending.role}`)}
        isVerifying={isVerifying}
      />
    </AuthOverlay>
  );
};

export default OtpVerification;