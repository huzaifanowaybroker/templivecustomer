import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import axios from "axios";
import { connect } from "react-redux";
import setAlert from "../store/actions/alert";
import Loader from "react-loader-spinner";
import { FiMapPin, FiPhone, FiMail, FiClock } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import {
  NAME_MIN,
  EMAIL_MAX,
  cleanSpaces,
  sanitizeNameInput,
  LETTERS_ONLY_REGEX,
  isValidEmail,
  sanitizePropertyNameInput,
  validatePropertyName,
  sanitizeTenDigitPhone,
  validateTenDigitPhone,
  validateFeedback,
  PROPERTY_NAME_MAX,
} from "../utils/Signupvalidation";

/* Company details (shown on the page) */
const COMPANY = {
  legalName: "NOWAYBROKER (OPC) PRIVATE LIMITED",
  brand: "Zerobriks",
  addressLines: [
    "FL 2, Square No 14 SP, INNOV8 SKCL Tech Square",
    "Guindy Industrial Estate",
    "Chennai, Tamil Nadu 600032",
    "India",
  ],
  state: "Tamil Nadu, India",
  phone: "+91 9890911818",
  email: "support@zerobriks.com",
};

const SERIF = { fontFamily: '"Newsreader", Georgia, serif' };

const inputCls =
  "w-full rounded-lg border border-[#EADFE2] bg-white px-3 py-2.5 text-sm text-[#1B1113] outline-none transition placeholder:text-[#9A8F94] focus:border-[#7A1230] focus:ring-2 focus:ring-[#7A1230]/15";

const Field = ({ label, required, error, children }) => (
  <div>
    <label className="mb-1.5 block text-sm font-semibold text-[#1B1113]">
      {label} {required && <span className="text-[#7A1230]">*</span>}
    </label>
    {children}
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

const InfoRow = ({ icon: Icon, label, children }) => (
  <div className="flex items-start gap-3">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#7A1230] text-white">
      <Icon size={15} />
    </span>
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#B9770E]">
        {label}
      </p>
      <div className="mt-0.5 text-sm leading-snug text-[#6B5A60]">{children}</div>
    </div>
  </div>
);

const Contact = ({ setAlert }) => {
  const [formData, setFormData] = useState({
    name: "",
    contact_number: "",
    email: "",
    property_name: "",
    rating: 1,
    feedback_msg: "",
  });

  const { name, contact_number, email, property_name, rating, feedback_msg } = formData;

  const [loading, setLoading] = useState(false);
  const [alert, setLocalAlert] = useState(null);

  const emptyErrors = {
    name: "",
    contact_number: "",
    email: "",
    property_name: "",
    feedback_msg: "",
  };
  const [errors, setErrors] = useState(emptyErrors);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const onChange = (e) => {
    const { name: field, value } = e.target;
    let next = value;
    if (field === "name") next = sanitizeNameInput(value);
    if (field === "contact_number") next = sanitizeTenDigitPhone(value);
    if (field === "email") next = value.replace(/\s/g, "").slice(0, EMAIL_MAX);
    if (field === "property_name") next = sanitizePropertyNameInput(value);

    setFormData({ ...formData, [field]: next });
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  const handleStarClick = (newRating) => {
    setFormData({ ...formData, rating: newRating });
  };

  const onSubmit = (e) => {
    e.preventDefault();

    const cleanName = cleanSpaces(name);
    const cleanPhone = contact_number.trim();
    const cleanEmail = email.trim();
    const cleanProperty = cleanSpaces(property_name);
    const cleanFeedback = feedback_msg.trim();

    const newErrors = {
      name: !cleanName
        ? "Name is required"
        : !LETTERS_ONLY_REGEX.test(cleanName)
          ? "Name can contain letters only"
          : cleanName.length < NAME_MIN
            ? `Name must be at least ${NAME_MIN} characters`
            : "",
      contact_number: !cleanPhone
        ? "Phone number is required"
        : validateTenDigitPhone(cleanPhone),
      email: !cleanEmail
        ? "Email is required"
        : isValidEmail(cleanEmail)
          ? ""
          : "Enter a valid email address (e.g. name@example.com)",
      property_name: validatePropertyName(cleanProperty),
      feedback_msg: validateFeedback(cleanFeedback),
    };

    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setLoading(true);
    axios
      .post(
        `${process.env.REACT_APP_API_URL}/cust_api/give_us_feedback`,
        {
          name: cleanName,
          contact_number: cleanPhone,
          email: cleanEmail,
          property_name: cleanProperty,
          rating,
          feedback_msg: cleanFeedback,
        },
        { headers: { "Content-Type": "application/json" } },
      )
      .then(() => {
        setAlert("Feedback Submitted", "success");
        setLocalAlert({ msg: "Thank you! Your feedback has been submitted.", type: "success" });
        setLoading(false);
        setFormData({
          name: "",
          contact_number: "",
          email: "",
          property_name: "",
          rating: 1,
          feedback_msg: "",
        });
        setErrors(emptyErrors);
        window.scrollTo(0, 0);
        setTimeout(() => setLocalAlert(null), 3000);
      })
      .catch((err) => {
        const serverMessage = err?.response?.data?.message;
        setAlert("Error Submitting Feedback", "error");
        setLocalAlert({
          msg: serverMessage || "Error submitting feedback. Please try again.",
          type: "danger",
        });
        setLoading(false);
        window.scrollTo(0, 0);
        setTimeout(() => setLocalAlert(null), 3000);
      });
  };

  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
    COMPANY.addressLines.join(", "),
  )}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="min-h-screen bg-[#FBF6F3] px-4 py-12 text-[#1B1113] sm:px-6">
      <Helmet>
        <title>Contact Us | Zerobriks</title>
        <meta
          name="description"
          content="Contact Zerobriks for help with listings, your account, or to share feedback. Call +91 9890911818 or email support@zerobriks.com."
        />
      </Helmet>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Newsreader:wght@500;600;700&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');`}</style>

      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="mt-3 text-3xl font-semibold text-[#7A1230] sm:text-4xl" style={SERIF}>
            Contact &amp; Feedback
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-relaxed text-[#6B5A60]">
            Questions about a listing, your account, or the platform? Reach out, or rate your experience below.
          </p>
        </div>

        {alert && (
          <div
            role="status"
            className={`mx-auto mb-6 max-w-3xl rounded-lg px-4 py-3 text-sm font-semibold text-white ${
              alert.type === "success" ? "bg-green-600" : "bg-[#7A1230]"
            }`}
          >
            {alert.msg}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* LEFT: contact details + map */}
          <div className="space-y-5 lg:col-span-2 lg:self-start">
            <div className="rounded-2xl border border-[#EADFE2] bg-white p-6 shadow-[0_24px_50px_-30px_rgba(78,12,34,.45)]">
              <h2 className="text-xl font-semibold text-[#1B1113]" style={SERIF}>
                Contact details
              </h2>
              <div className="mt-4 space-y-4">
                <InfoRow icon={FiMapPin} label="Head office">
                  <p>{COMPANY.addressLines.join(", ")}</p>
                </InfoRow>
                <InfoRow icon={FiPhone} label="Call (toll free)">
                  <a
                    href={`tel:${COMPANY.phone.replace(/\s/g, "")}`}
                    className="font-semibold text-[#7A1230] hover:underline"
                  >
                    {COMPANY.phone}
                  </a>
                </InfoRow>
                <InfoRow icon={FiMail} label="Email">
                  <a
                    href={`mailto:${COMPANY.email}`}
                    className="font-semibold text-[#7A1230] hover:underline"
                  >
                    {COMPANY.email}
                  </a>
                </InfoRow>
                <InfoRow icon={FiClock} label="Response time">
                  <p>We usually reply within 24 hours.</p>
                </InfoRow>
              </div>

              <div className="mt-5 space-y-1 border-t border-[#EADFE2] pt-4 text-xs leading-snug text-[#6B5A60]">
                <p>
                  <span className="font-semibold text-[#1B1113]">Company:</span> {COMPANY.legalName}
                </p>
                <p>
                  <span className="font-semibold text-[#1B1113]">Brand:</span> {COMPANY.brand}
                </p>
                <p>
                  <span className="font-semibold text-[#1B1113]">Registered state:</span> {COMPANY.state}
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#EADFE2] bg-white">
              <iframe
                title="Zerobriks head office location"
                src={mapSrc}
                width="100%"
                height="240"
                loading="lazy"
                style={{ border: 0 }}
                allowFullScreen
              />
            </div>
          </div>

          {/* RIGHT: feedback form */}
          <div className="rounded-2xl border border-[#EADFE2] bg-white p-6 shadow-[0_24px_50px_-30px_rgba(78,12,34,.45)] sm:p-8 lg:col-span-3">
            <h2 className="text-xl font-semibold text-[#1B1113]" style={SERIF}>
              Rate us &amp; share your feedback
            </h2>
            <p className="mt-1 text-sm text-[#6B5A60]">Fields marked * are required.</p>

            <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Full name" required error={errors.name}>
                  <input
                    className={inputCls}
                    name="name"
                    type="text"
                    placeholder="Full name"
                    onChange={onChange}
                    value={name}
                    maxLength={50}
                    required
                  />
                </Field>
                <Field label="Phone number" required error={errors.contact_number}>
                  <input
                    className={inputCls}
                    name="contact_number"
                    type="tel"
                    inputMode="numeric"
                    placeholder="10-digit mobile number"
                    onChange={onChange}
                    value={contact_number}
                    maxLength={10}
                    required
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Email" required error={errors.email}>
                  <input
                    className={inputCls}
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    onChange={onChange}
                    value={email}
                    maxLength={EMAIL_MAX}
                    required
                  />
                </Field>
                <Field label="Property / project name" required error={errors.property_name}>
                  <input
                    className={inputCls}
                    name="property_name"
                    type="text"
                    placeholder="Property name"
                    onChange={onChange}
                    value={property_name}
                    maxLength={PROPERTY_NAME_MAX}
                    required
                  />
                </Field>
              </div>

              <Field label="Feedback" required error={errors.feedback_msg}>
                <div className="relative">
                  <textarea
                    name="feedback_msg"
                    placeholder="Tell us what worked and what could be better..."
                    value={feedback_msg}
                    maxLength={555}
                    onChange={onChange}
                    rows={5}
                    className={`${inputCls} resize-none pb-7`}
                    required
                  />
                  <span className="pointer-events-none absolute bottom-2.5 right-3 text-xs text-[#9A8F94]">
                    {(feedback_msg || "").length}/555
                  </span>
                </div>
              </Field>

              <div>
                <p className="mb-1.5 text-sm font-semibold text-[#1B1113]">
                  Rating <span className="text-[#7A1230]">*</span>
                </p>
                <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      role="radio"
                      aria-checked={rating === star}
                      aria-label={`${star} star${star > 1 ? "s" : ""}`}
                      onClick={() => handleStarClick(star)}
                      className="rounded p-0.5 transition hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7A1230]/40"
                    >
                      <FaStar
                        size={22}
                        className={star <= rating ? "text-[#C8962A]" : "text-[#EADFE2]"}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`flex h-11 w-full items-center justify-center rounded-lg bg-[#7A1230] text-sm font-bold text-white transition hover:bg-[#5A0017] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7A1230]/40 ${
                  loading ? "cursor-not-allowed opacity-60" : ""
                }`}
              >
                {loading ? (
                  <Loader type="ThreeDots" color="#fff" height={15} width={15} />
                ) : (
                  "Submit feedback"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default connect(null, { setAlert })(Contact);