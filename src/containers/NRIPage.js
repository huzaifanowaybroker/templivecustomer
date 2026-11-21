import { API_BASE_URL } from "../config/api";
import { useState, useRef, useEffect } from "react";
import {
  FaBuilding,
  FaBalanceScale,
  FaHandshake,
  FaPhoneAlt
} from "react-icons/fa";

// Custom hook for count-up animation
function useCounter(end, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!startOnView) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration, startOnView]);

  return count;
}

export default function NRIPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // ================= STATES =================
  const [form, setForm] = useState({
    name: "",
    countryCode: "+91",
    phone: "",
    city: "",
    email: "",
    service: "",
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({
    name: "",
    phone: "",
    city: "",
    email: "",
    service: "",
    agreeTerms: "",
  });

  const [activeTab, setActiveTab] = useState("overview");
  const [isServiceOpen, setIsServiceOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  // API Form States
  const [isLoading, setIsLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: "", text: "" });

  // ================= SCROLL REFERENCE =================
  const formRef = useRef(null);

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => {
        const nameInput = formRef.current.querySelector('input[name="name"]');
        if (nameInput) nameInput.focus();
      }, 500);
    }
  };

  // ================= DATA =================

  const countryCodes = [
    { code: "+91", flag: "🇮🇳", name: "India" },
    { code: "+1", flag: "🇺🇸", name: "USA / Canada" },
    { code: "+44", flag: "🇬🇧", name: "United Kingdom" },
    { code: "+971", flag: "🇦🇪", name: "UAE" },
    { code: "+65", flag: "🇸🇬", name: "Singapore" },
    { code: "+61", flag: "🇦🇺", name: "Australia" },
    { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
    { code: "+974", flag: "🇶🇦", name: "Qatar" },
    { code: "+968", flag: "🇴🇲", name: "Oman" },
    { code: "+965", flag: "🇰🇼", name: "Kuwait" },
    { code: "+973", flag: "🇧🇭", name: "Bahrain" },
    { code: "+49", flag: "🇩🇪", name: "Germany" },
    { code: "+33", flag: "🇫🇷", name: "France" },
    { code: "+81", flag: "🇯🇵", name: "Japan" },
    { code: "+64", flag: "🇳🇿", name: "New Zealand" },
    { code: "+353", flag: "🇮🇪", name: "Ireland" },
    { code: "+41", flag: "🇨🇭", name: "Switzerland" },
    { code: "+31", flag: "🇳🇱", name: "Netherlands" },
    { code: "+46", flag: "🇸🇪", name: "Sweden" },
    { code: "+47", flag: "🇳🇴", name: "Norway" },
    { code: "+45", flag: "🇩🇰", name: "Denmark" },
    { code: "+358", flag: "🇫🇮", name: "Finland" },
    { code: "+32", flag: "🇧🇪", name: "Belgium" },
    { code: "+43", flag: "🇦🇹", name: "Austria" },
    { code: "+34", flag: "🇪🇸", name: "Spain" },
    { code: "+39", flag: "🇮🇹", name: "Italy" },
    { code: "+351", flag: "🇵🇹", name: "Portugal" },
    { code: "+30", flag: "🇬🇷", name: "Greece" },
    { code: "+48", flag: "🇵🇱", name: "Poland" },
    { code: "+420", flag: "🇨🇿", name: "Czech Republic" },
    { code: "+36", flag: "🇭🇺", name: "Hungary" },
    { code: "+55", flag: "🇧🇷", name: "Brazil" },
    { code: "+52", flag: "🇲🇽", name: "Mexico" },
    { code: "+27", flag: "🇿🇦", name: "South Africa" },
    { code: "+60", flag: "🇲🇾", name: "Malaysia" },
    { code: "+62", flag: "🇮🇩", name: "Indonesia" },
    { code: "+63", flag: "🇵🇭", name: "Philippines" },
    { code: "+66", flag: "🇹🇭", name: "Thailand" },
    { code: "+84", flag: "🇻🇳", name: "Vietnam" },
    { code: "+82", flag: "🇰🇷", name: "South Korea" }
  ];
  const cityOptions =["Mumbai", "Delhi", "Bengaluru", "Pune", "Hyderabad", "Ahmedabad", "Chennai"];
  const serviceOptions = [
    "Legal Services",
    "To BUY a property",
    "To SELL your property",
    "To RENT out your property",
    "Property Management Services"
  ];

  const faqs = [
    {
      q: "What is End-to-End Property Management?",
      a: "End-to-end property management is a complete solution where every aspect of your property is handled for you. From tenant search and verification to rent collection, legal documentation, inspections, and maintenance — everything is managed seamlessly by a dedicated team."
    },
    {
      q: "How does ZEROBRIKS manage my property remotely?",
      a: "ZEROBRIKS assigns a dedicated Relationship Manager who takes care of your property on your behalf. You receive regular updates, and all activities — including tenant handling, rent collection, and maintenance — are managed efficiently without your physical presence."
    },
    {
      q: "How are tenants verified before renting?",
      a: "Tenants go through a thorough verification process, including background checks, document validation, and screening. This ensures that only reliable and trustworthy tenants are selected for your property."
    },
    {
      q: "How is rent collected and transferred?",
      a: "Rent is collected from tenants on time and transferred directly to your account. The process is fully transparent, and you are kept informed about all transactions."
    },
    {
      q: "What kind of property maintenance services are included?",
      a: "The service includes regular property inspections, repair coordination, and maintenance support. Any issues are identified early and resolved quickly to keep your property in the best condition."
    },
    {
      q: "Do I need to handle legal documentation myself?",
      a: "No, all legal documentation such as rental agreements and related paperwork is handled by the team. This ensures compliance and saves you time and effort."
    }
  ];

  // ================= VALIDATION HELPERS =================
  const validateField = (name, value) => {
    let error = "";

    if (name === "name") {
      if (!value.trim()) {
        error = "Name is required.";
      } else if (value.length > 40) {
        error = "Name cannot exceed 40 characters.";
      } else if (/^\d+$/.test(value)) {
        error = "Name cannot consist only of numbers.";
      } else if (/^[^a-zA-Z0-9]+$/.test(value)) {
        error = "Name cannot consist only of special characters.";
      }
    }

    if (name === "phone") {
      const cleanPhone = value.replace(/\D/g, "");
      if (!value.trim()) {
        error = "Phone number is required.";
      } else if (cleanPhone.length < 7 || cleanPhone.length > 15) {
        error = "Please enter a valid phone number (7 to 15 digits).";
      }
    }

    if (name === "city") {
      if (!value) {
        error = "Please select a city.";
      }
    }

    if (name === "email") {
      const emailRegex = /^[a-zA-Z0-9._%+-]{1,64}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!value.trim()) {
        error = "Email address is required.";
      } else if (!emailRegex.test(value)) {
        error = "Please enter a valid email address.";
      }
    }

    if (name === "service") {
      if (!value) {
        error = "Please select a required service.";
      }
    }

    if (name === "agreeTerms") {
      if (!value) {
        error = "You must agree to the terms and conditions.";
      }
    }

    return error;
  };

  // ================= HANDLERS =================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    if (name === "name" && value.length > 40) return;

    setForm({ ...form, [name]: val });

    const fieldError = validateField(name, val);
    setErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  const handleServiceSelect = (option) => {
    setForm({ ...form, service: option });
    setErrors((prev) => ({ ...prev, service: "" }));
    setIsServiceOpen(false);
  };

  const handleCitySelect = (option) => {
    setForm({ ...form, city: option });
    setErrors((prev) => ({ ...prev, city: "" }));
    setIsCityOpen(false);
  };

  const toggleFaq = (index) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  // ================= FORM SUBMISSION API =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const nameErr = validateField("name", form.name);
    const phoneErr = validateField("phone", form.phone);
    const cityErr = validateField("city", form.city);
    const emailErr = validateField("email", form.email);
    const serviceErr = validateField("service", form.service);
    const termsErr = validateField("agreeTerms", form.agreeTerms);

    const newErrors = {
      name: nameErr,
      phone: phoneErr,
      city: cityErr,
      email: emailErr,
      service: serviceErr,
      agreeTerms: termsErr,
    };

    setErrors(newErrors);

    if (nameErr || phoneErr || cityErr || emailErr || serviceErr || termsErr) {
      setSubmitMessage({ type: "error", text: "Please fill out all highlighted inputs and agree to the terms." });
      return;
    }

    setIsLoading(true);
    setSubmitMessage({ type: "", text: "" });

    try {
      const response = await fetch(`${API_BASE_URL}/cust_api/add_nri_leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          phone: `${form.countryCode} ${form.phone}`
        }),
      });

      if (response.ok) {
        setSubmitMessage({ type: "success", text: "Thank you! Our experts will contact you soon." });
        setForm({ name: "", countryCode: "+91", phone: "", city: "", email: "", service: "", agreeTerms: false });
        setErrors({ name: "", phone: "", city: "", email: "", service: "", agreeTerms: "" });
      } else {
        setSubmitMessage({ type: "error", text: "Something went wrong. Please try again later." });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitMessage({ type: "error", text: "Network error. Please check your internet connection." });
    } finally {
      setIsLoading(false);
    }
  };

  // Counter Hook calculations
  const rentedCount = useCounter(5000, 4000);
  const soldCount = useCounter(2000, 4000);

  return (


    <div className="bg-slate-50 min-h-screen font-sans text-slate-800 antialiased selection:bg-[#691E2E] selection:text-white overflow-x-hidden">

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-10 md:py-16 bg-slate-900 text-white">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&q=80"
            alt="NRI Real Estate"
            className="w-full h-full object-cover opacity-25 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">

          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm font-semibold tracking-wide mx-auto lg:mx-0">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
              Global NRI Concierge Service
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tight leading-[1.15]">
              Manage Indian Real Estate Without Flying Home.
            </h1>

            <p className="text-slate-300 text-[11px] sm:text-xs md:text-sm font-normal max-w-xl mx-auto lg:mx-0 leading-relaxed">
              End-to-end verified tenant discovery, rental collection, legal compliance, and tax management tailored for global NRIs.
            </p>

            {/* Quick Animated Counter Highlights */}
            <div className="grid grid-cols-2 gap-2.5 pt-2 max-w-md mx-auto lg:mx-0">
              <div className="p-2.5 sm:p-3 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="text-lg sm:text-xl font-black text-rose-400">{rentedCount.toLocaleString()}+</div>
                <div className="text-[10px] text-slate-400 font-medium mt-0.5">Properties Rented Monthly</div>
              </div>
              <div className="p-2.5 sm:p-3 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="text-lg sm:text-xl font-black text-rose-400">{soldCount.toLocaleString()}+</div>
                <div className="text-[10px] text-slate-400 font-medium mt-0.5">Properties Sold Monthly</div>
              </div>
            </div>
          </div>

          {/* Hero Right: Form Card */}
          <div ref={formRef} className="lg:col-span-5 max-w-sm md:max-w-md mx-auto lg:max-w-none w-full">
            <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 text-slate-800 shadow-2xl shadow-slate-950/50 border border-slate-100 relative">

              <div className="absolute -top-2.5 right-4 bg-[#691E2E] text-white text-[8px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full shadow">
                Priority Desk
              </div>

              <h3 className="text-base sm:text-lg font-black text-slate-900 mb-0.5">Talk to Our NRI Expert</h3>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mb-4">Fill in your details for a prompt callback aligned with your timezone.</p>

              <form className="space-y-2.5" onSubmit={handleSubmit} noValidate>
                {/* Name Field */}
                <div>
                  <input
                    name="name"
                    value={form.name}
                    placeholder="Full Name"
                    className={`w-full bg-slate-50 border p-2.5 rounded-lg text-[11px] outline-none transition-all font-medium ${errors.name ? 'border-rose-500 bg-rose-50/20 focus:ring-2 focus:ring-rose-500/20' : 'border-slate-200 focus:border-[#691E2E] focus:bg-white'}`}
                    onChange={handleChange}
                  />
                  {errors.name && <p className="text-[9px] font-semibold text-rose-600 mt-0.5 pl-1">⚠️ {errors.name}</p>}
                </div>

                {/* Country Code + Phone Number Field */}
                <div>
                  <div className={`flex bg-slate-50 border rounded-lg overflow-hidden transition-all ${errors.phone ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200 focus-within:border-[#691E2E] focus-within:bg-white'}`}>
                    <select
                      name="countryCode"
                      value={form.countryCode}
                      onChange={handleChange}
                      className="bg-transparent border-r border-slate-200 px-2 py-2.5 text-[11px] font-bold text-slate-700 outline-none cursor-pointer"
                    >
                      {countryCodes.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.flag} {item.code}
                        </option>
                      ))}
                    </select>
                    <input
                      name="phone"
                      value={form.phone}
                      placeholder="Phone Number"
                      className="w-full p-2.5 text-[11px] outline-none bg-transparent font-medium"
                      onChange={handleChange}
                    />
                  </div>
                  {errors.phone ? (
                    <p className="text-[9px] font-semibold text-rose-600 mt-0.5 pl-1">⚠️ {errors.phone}</p>
                  ) : (
                    <p className="text-[8px] font-semibold text-slate-400 mt-0.5 pl-1">Zero international calling charges.</p>
                  )}
                </div>

                {/* City Dropdown */}
                <div className="relative">
                  <div
                    className={`w-full bg-slate-50 border p-2.5 rounded-lg text-[11px] cursor-pointer flex justify-between items-center transition-all font-medium ${errors.city ? 'border-rose-500 bg-rose-50/20' : isCityOpen ? 'border-[#691E2E] bg-white ring-2 ring-[#691E2E]/10' : 'border-slate-200'}`}
                    onClick={() => {
                      setIsCityOpen(!isCityOpen);
                      setIsServiceOpen(false);
                    }}
                  >
                    <span
                      className={
                        form.city !== ""
                          ? "text-slate-900 font-semibold"
                          : "text-slate-400"
                      }
                    >
                      {form.city === ""
                        ? "Select City (Mumbai, Delhi, Bengaluru, Pune, Hyderabad, Ahmedabad, Chennai)"
                        : form.city}
                    </span>
                    <span className="text-slate-400 text-[8px] transform transition-transform duration-200">▼</span>
                  </div>

                  {errors.city && <p className="text-[9px] font-semibold text-rose-600 mt-0.5 pl-1">⚠️ {errors.city}</p>}

                  {isCityOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsCityOpen(false)}></div>
                      <div className="absolute top-[110%] left-0 w-full bg-white rounded-lg shadow-2xl border border-slate-100 z-50 overflow-hidden py-1 divide-y divide-slate-50">
                        {cityOptions.map((city, idx) => (
                          <div
                            key={idx}
                            className="px-2.5 py-2 text-[10px] sm:text-[11px] text-slate-700 hover:bg-rose-50 hover:text-[#691E2E] cursor-pointer flex items-center justify-between transition-colors font-medium"
                            onClick={() => handleCitySelect(city)}
                          >
                            <span>{city}</span>
                            <span className="text-[#691E2E] font-bold">{form.city === city ? "✓" : ""}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <input
                    name="email"
                    value={form.email}
                    placeholder="Email Address"
                    className={`w-full bg-slate-50 border p-2.5 rounded-lg text-[11px] outline-none transition-all font-medium ${errors.email ? 'border-rose-500 bg-rose-50/20 focus:ring-2 focus:ring-rose-500/20' : 'border-slate-200 focus:border-[#691E2E] focus:bg-white'}`}
                    onChange={handleChange}
                  />
                  {errors.email && <p className="text-[9px] font-semibold text-rose-600 mt-0.5 pl-1">⚠️ {errors.email}</p>}
                </div>

                {/* Description Field */}
                <div>
                  <textarea
                    name="description"
                    value={form.description}
                    placeholder="Describe your requirement (optional)"
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-[11px] outline-none transition-all font-medium resize-none focus:border-[#691E2E] focus:bg-white"
                    onChange={handleChange}
                  />
                </div>

                {/* Service Dropdown */}
                <div className="relative">
                  <div
                    className={`w-full bg-slate-50 border p-2.5 rounded-lg text-[11px] cursor-pointer flex justify-between items-center transition-all font-medium ${errors.service ? 'border-rose-500 bg-rose-50/20' : isServiceOpen ? 'border-[#691E2E] bg-white ring-2 ring-[#691E2E]/10' : 'border-slate-200'}`}
                    onClick={() => {
                      setIsServiceOpen(!isServiceOpen);
                      setIsCityOpen(false);
                    }}
                  >
                    <span className={form.service !== "" ? "text-slate-900 font-semibold" : "text-slate-400"}>
                      {form.service === "" ? "Select Required Service" : form.service}
                    </span>
                    <span className="text-slate-400 text-[8px] transform transition-transform duration-200">▼</span>
                  </div>

                  {errors.service && <p className="text-[9px] font-semibold text-rose-600 mt-0.5 pl-1">⚠️ {errors.service}</p>}

                  {isServiceOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsServiceOpen(false)}></div>
                      <div className="absolute top-[110%] left-0 w-full bg-white rounded-lg shadow-2xl border border-slate-100 z-50 overflow-hidden py-1 divide-y divide-slate-50">
                        {serviceOptions.map((option, idx) => (
                          <div
                            key={idx}
                            className="px-2.5 py-2 text-[10px] sm:text-[11px] text-slate-700 hover:bg-rose-50 hover:text-[#691E2E] cursor-pointer flex items-center justify-between transition-colors font-medium"
                            onClick={() => handleServiceSelect(option)}
                          >
                            <span>{option}</span>
                            <span className="text-[#691E2E] font-bold">{form.service === option ? "✓" : ""}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Terms and Conditions Checkbox */}
                <div className="pt-0.5">
                  <label className="flex items-start gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={form.agreeTerms}
                      onChange={handleChange}
                      className="mt-0.5 w-3 h-3 rounded text-[#691E2E] focus:ring-[#691E2E] border-slate-300 cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-600 leading-snug">
                      I agree to the{" "}
                      <a href="/terms-and-conditions.pdf" target="_blank" rel="noopener noreferrer" className="text-[#691E2E] font-bold underline hover:text-[#581926]">
                        Terms and Conditions
                      </a>{" "}
                      and privacy policy.
                    </span>
                  </label>
                  {errors.agreeTerms && <p className="text-[9px] font-semibold text-rose-600 mt-0.5 pl-1">⚠️ {errors.agreeTerms}</p>}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-2.5 rounded-lg font-bold text-[11px] tracking-wide shadow-lg shadow-rose-900/10 transition-all flex justify-center items-center cursor-pointer ${isLoading ? 'bg-slate-400 cursor-not-allowed text-white' : 'bg-[#691E2E] hover:bg-[#581926] text-white'}`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing Request...
                    </>
                  ) : (
                    "Instant Consultation Request"
                  )}
                </button>

                {submitMessage.text && (
                  <div className={`mt-2 p-2 rounded-lg text-[10px] font-semibold text-center transition-all ${submitMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                    {submitMessage.text}
                  </div>
                )}
              </form>

              <div className="mt-4 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2 text-[8px] font-bold uppercase tracking-wider text-slate-800 text-center">
                <span>Zero Brokerage</span>
                <span>•</span>
                <span>Full Transparency</span>
                <span>•</span>
                <span>Verified RMs</span>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* CORE VALUE PROPOSITIONS */}
      <section className="py-10 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-6 md:mb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight">Comprehensive NRI Solutions</h2>
          <p className="text-[11px] md:text-xs text-slate-500 mt-1.5">Explore our core divisions designed specifically to make remote property ownership seamless.</p>
        </div>

        <div className="flex overflow-x-auto pb-1.5 mb-5 md:flex-wrap md:justify-center gap-1.5 scrollbar-none">
          {[
            { id: "overview", label: "Why Choose Us" },
            { id: "buysell", label: "Buy, Sell & Rent" },
            { id: "management", label: "Property Management" },
            { id: "legal", label: "Legal & Tax Assistance" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${activeTab === tab.id ? 'bg-[#691E2E] text-white shadow-md shadow-rose-900/10' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 md:p-8 border border-slate-200/80 shadow-xl shadow-slate-200/50">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: <FaBuilding />, title: "All-in-One Platform", desc: "Buy, sell, rent, manage, and legal support under one single roof." },
                { icon: <FaBalanceScale />, title: "Legal & Tax Mastery", desc: "Expert guidance on TDS certificates, Capital Gains, and repatriations." },
                { icon: <FaHandshake />, title: "Local Expert Network", desc: "Dedicated field managers handling physical inspections and handovers." },
                { icon: <FaPhoneAlt />, title: "Timezone Aligned", desc: "24/7 dedicated assistance tailored to your international schedule." }
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-slate-50 border border-slate-100 hover:border-rose-200 transition-all group">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-[#691E2E] flex items-center justify-center text-base mb-2.5 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs mb-1.5">{item.title}</h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "buysell" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-center">
              <div className="space-y-2.5">
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#691E2E]">Zero Drama Transactions</span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">Buy, Sell & Rent With Complete Peace of Mind</h3>
                <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                  Whether you are looking to liquidate an asset or invest in India's top 4000+ verified builder projects, our dedicated Relationship Managers take care of documentation, shortlisting, and negotiations on your behalf.
                </p>
                <button onClick={scrollToForm} className="px-4 py-2 bg-[#691E2E] text-white rounded-lg text-[11px] font-bold shadow hover:bg-[#581926] transition cursor-pointer">
                  Explore Property Options
                </button>
              </div>
              <div className="rounded-lg overflow-hidden shadow-md aspect-video bg-slate-100">
                <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800" alt="Buy Sell Rent" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {activeTab === "management" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-center">
              <div className="space-y-2.5">
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#691E2E]">Total Care Solutions</span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">Your Property. Our Full Responsibility.</h3>
                <ul className="space-y-2 text-[11px] sm:text-xs text-slate-700 font-medium">
                  {["Rigorous Tenant Discovery & Background Verification", "Timely Automated Monthly Rent Transfers", "Regular Move-in, Move-out & Maintenance Inspections", "Complimentary Digital Rental Agreements"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[8px] shrink-0 font-bold">✓</div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg overflow-hidden shadow-md aspect-video bg-slate-100">
                <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800" alt="Property Management" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {activeTab === "legal" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-center">
              <div className="space-y-2.5">
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#691E2E]">Absolute Compliance</span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">Secure Legal & Tax Frameworks</h3>
                <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                  Navigate complex Indian tax regulations effortlessly. Get certified expert assistance with Power of Attorney execution, Lower TDS Certificates, Khata transfers, and capital gains tax repatriation.
                </p>
                <button onClick={scrollToForm} className="px-4 py-2 bg-[#691E2E] text-white rounded-lg text-[11px] font-bold shadow hover:bg-[#581926] transition cursor-pointer">
                  Book Legal Consultation
                </button>
              </div>
              <div className="rounded-lg overflow-hidden shadow-md aspect-video bg-slate-100">
                <img src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800" alt="Legal and Tax Services" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* POPULAR SERVICES GRID */}
      <section className="py-10 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#691E2E]">Add-on Care</span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">Services NRIs Rely on the Most</h2>
            </div>
            <span className="self-start md:self-auto inline-flex items-center px-3 py-1 mt-1.5 md:mt-0 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#691E2E] bg-[#691E2E]/10 border border-[#691E2E]/20 rounded-full whitespace-nowrap">
              Coming Soon
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
            {[
              { name: "Painting & Cleaning", img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=300" },
              { name: "Property Inspections", img: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=300" },
              { name: "Interior Design", img: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=300" },
              { name: "Packers & Movers", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=300" },
              { name: "Rental Agreements", img: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=300" }
            ].map((s, i) => (
              <div key={i} className="relative rounded-lg overflow-hidden group border border-slate-200 aspect-[4/5] flex flex-col items-center justify-end shadow-sm cursor-pointer" onClick={scrollToForm}>
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url('${s.img}')` }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                <span className="relative z-10 text-white text-[10px] sm:text-[11px] font-bold text-center p-2 leading-tight w-full">{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON MATRIX */}
      <section className="py-10 md:py-16 max-w-5xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-6 md:mb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            The ZEROBRIKS Advantage
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1.5">
            See why global NRIs choose our structured concierge service over traditional brokers.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50">
          <table className="w-full table-fixed text-[10px] text-left">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="py-2.5 px-2 sm:px-4 font-bold w-[46%]">Key Offerings</th>
                <th className="py-2.5 px-1 sm:px-4 font-bold text-center bg-[#691E2E] w-[27%]">
                  With ZEROBRIKS
                </th>
                <th className="py-2.5 px-1 sm:px-4 font-bold text-center text-slate-100 w-[27%]">
                  Traditional Brokers
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {[
                "One-stop asset & legal solution",
                "Dedicated Relationship Manager",
                "100% Transparent pricing & documentation",
                "End-to-end remote execution",
                "ZERO hidden fees or brokerage drama",
              ].map((feature, i) => (
                <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-2 sm:px-4 text-xs sm:text-sm text-slate-800 whitespace-normal break-words leading-snug">
                    {feature}
                  </td>
                  <td className="py-2.5 px-1 sm:px-4 text-center bg-rose-50/50 text-emerald-600 font-black text-sm sm:text-base">
                    ✓
                  </td>
                  <td className="py-2.5 px-1 sm:px-4 text-center text-rose-500 font-black text-sm sm:text-base">
                    ✕
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-10 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center max-w-xl mx-auto mb-6">
            <h2 className="text-lg sm:text-xl font-black">Trusted Across Continents</h2>
            <p className="text-[10px] sm:text-[11px] text-slate-100 mt-1.5">Hear what homeowners in the UK, USA, and beyond say about our service.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { name: "Lokesh Singh", loc: "United Kingdom", img: "https://i.pravatar.cc/100?img=11", text: "ZEROBRIKS has been like magic for renting my apartment. Special thanks to my Relationship Manager who supported me throughout from tenant search to agreement finalization." },
              { name: "Rajesh Kumar", loc: "United States", img: "https://i.pravatar.cc/100?img=12", text: "Great service overall! Rented my property in less than a month. Screened tenants properly and quick with repair coordination. Absolute peace of mind." },
              { name: "Sumit Mahtre", loc: "India / NRI", img: "https://i.pravatar.cc/100?img=13", text: "Very responsive and efficient team. They take care of timely rent collection and documentation seamlessly without requiring my physical presence." }
            ].map((t, i) => (
              <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col justify-between">
                <div>
                  <div className="text-amber-400 text-[10px] mb-1.5">★★★★★</div>
                  <p className="text-[10px] sm:text-[11px] text-slate-100 leading-relaxed italic mb-3">"{t.text}"</p>
                </div>
                <div className="flex items-center gap-2 pt-2.5 border-t border-white/10">
                  <img src={t.img} alt={t.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider">{t.name}</h4>
                    <p className="text-[8px] text-slate-400">{t.loc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section className="py-10 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-6">
          <span className="text-[9px] font-bold uppercase tracking-widest text-[#691E2E]">Got Questions?</span>
          <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 mt-0.5">Frequently Asked Questions</h2>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1.5">Everything you need to know about managing Indian real estate remotely.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 items-start">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                onClick={() => setOpenFaq(isOpen ? null : index)}
                className={`group bg-white rounded-lg p-4 border transition-all duration-300 cursor-pointer relative overflow-hidden self-start ${isOpen
                  ? 'border-[#691E2E]/30 shadow-xl shadow-rose-950/5 ring-1 ring-[#691E2E]/20 border-l-4 border-l-[#691E2E]'
                  : 'border-slate-200/80 hover:border-rose-200 hover:shadow-md'
                  }`}
              >
                <div className="flex items-start justify-between gap-2.5">
                  <h3 className={`text-[11px] sm:text-xs font-bold transition-colors ${isOpen ? 'text-[#691E2E]' : 'text-slate-900 group-hover:text-[#691E2E]'}`}>
                    {faq.q}
                  </h3>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 transition-all duration-300 ${isOpen ? 'bg-[#691E2E] text-white rotate-180' : 'bg-slate-100 text-slate-500 group-hover:bg-rose-50 group-hover:text-[#691E2E]'
                    }`}>
                    ↓
                  </div>
                </div>

                <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-2.5 pt-2.5 border-t border-slate-100' : 'grid-rows-[0fr] opacity-0 mt-0'
                  }`}>
                  <div className="overflow-hidden">
                    <p className="text-[10px] sm:text-[11px] text-slate-600 leading-relaxed font-normal">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>

  );
}