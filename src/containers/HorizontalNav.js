import React, { useState, useEffect, useContext, useRef } from "react";
import { FiUser, FiMenu, FiMapPin } from "react-icons/fi";
import { FaTimes } from "react-icons/fa";
import { IoCall, IoCloseCircleOutline } from "react-icons/io5";
import { Link, useLocation, useHistory } from "react-router-dom";
import { SearchContext } from "../containers/SearchContext";
import Login1 from "../auth/Login1";
import SignUp1 from "../auth/SignUp1";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { splitLocations, buildLocationName, cleanLocationName } from "../containers/locationUtils";

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_KEY;
const MAX_NAV_LOCATIONS = 3;

const HorizontalNav = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { searchCity, setSearchCity } = useContext(SearchContext);
  const [inputValue, setInputValue] = useState("");
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();
  const history = useHistory();
  const [profileImage, setProfileImage] = useState("");
  const [freePostCount, setFreePostCount] = useState(0);

  const selectedCityList = splitLocations(searchCity);

  const showSearchBar =
    [
      "/searchdashboard",
      "/property",
      "/advisordashboard",
      "/featuredDashboard",
      "/recommendedpropertiesDashboard",
    ].includes(location.pathname) ||
    location.pathname.startsWith("/citywiseproperties");

  /* ---------- Locality suggestions (Google Places) ---------- */
  const [mapsReady, setMapsReady] = useState(
    !!(window.google && window.google.maps && window.google.maps.places)
  );
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const acServiceRef = useRef(null);
  const acSessionRef = useRef(null);
  const acRequestRef = useRef(0);

  // Load the Google Places script once, only on pages that show the search
  useEffect(() => {
    if (!showSearchBar || mapsReady) return undefined;
    if (window.google && window.google.maps && window.google.maps.places) {
      setMapsReady(true);
      return undefined;
    }
    const onLoad = () => setMapsReady(true);
    let script = document.querySelector("script[data-gmaps]");
    if (!script) {
      script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.setAttribute("data-gmaps", "1");
      document.body.appendChild(script);
    }
    script.addEventListener("load", onLoad);
    return () => script.removeEventListener("load", onLoad);
  }, [showSearchBar, mapsReady]);

  useEffect(() => {
    if (mapsReady && window.google && !acServiceRef.current) {
      acServiceRef.current = new window.google.maps.places.AutocompleteService();
      acSessionRef.current = new window.google.maps.places.AutocompleteSessionToken();
    }
  }, [mapsReady]);

  // Fetch suggestions while typing (debounced; stale responses ignored)
  useEffect(() => {
    const q = inputValue.trim();
    if (!mapsReady || !showSearchBar || q.length < 2 || !acServiceRef.current) {
      setSuggestions([]);
      setShowSuggestions(false);
      return undefined;
    }
    const requestId = ++acRequestRef.current;
    const timer = setTimeout(() => {
      acServiceRef.current.getPlacePredictions(
        {
          input: q,
          componentRestrictions: { country: "in" },
          sessionToken: acSessionRef.current,
        },
        (preds, status) => {
          if (requestId !== acRequestRef.current) return;
          const ok = status === window.google.maps.places.PlacesServiceStatus.OK && preds;
          setSuggestions(ok ? preds.slice(0, 6) : []);
          setActiveSuggestion(0);
          setShowSuggestions(true);
        }
      );
    }, 250);
    return () => clearTimeout(timer);
  }, [inputValue, mapsReady, showSearchBar]);

  // Close the suggestion list when clicking outside the search box
  useEffect(() => {
    const close = (e) => {
      if (!e.target.closest("[data-nav-search]")) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const addNavLocation = (name) => {
    const trimmed = cleanLocationName(name);
    if (!trimmed) return;
    const list = [...selectedCityList];
    if (list.some((m) => m.toLowerCase() === trimmed.toLowerCase())) {
      setInputValue("");
      return;
    }
    if (list.length >= MAX_NAV_LOCATIONS) {
      toast.error(`You can select a maximum of ${MAX_NAV_LOCATIONS} locations.`);
      return;
    }
    setSearchCity([...list, trimmed].join(", "));
    setInputValue("");
    setShowSuggestions(false);
    setSuggestions([]);
    if (window.google && window.google.maps) {
      acSessionRef.current = new window.google.maps.places.AutocompleteSessionToken();
    }
  };

  const pickNavSuggestion = (pred) => addNavLocation(buildLocationName(pred));

  const handleNavKeyDown = (e) => {
    // Backspace on an empty box removes the last location chip
    if (e.key === "Backspace" && inputValue === "" && selectedCityList.length) {
      e.preventDefault();
      setSearchCity(selectedCityList.slice(0, -1).join(", "));
      return;
    }
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveSuggestion((i) => (i + 1) % suggestions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveSuggestion((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
        return;
      }
      if (e.key === "Escape") {
        setShowSuggestions(false);
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        pickNavSuggestion(suggestions[activeSuggestion] || suggestions[0]);
        return;
      }
    }
    if (e.key === "Enter" && inputValue.trim() !== "") {
      e.preventDefault();
      // Typed text without a picked suggestion: accept comma-separated places, max 3
      const merged = [...selectedCityList];
      inputValue
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
        .forEach((c) => {
          if (!merged.some((m) => m.toLowerCase() === c.toLowerCase())) merged.push(c);
        });
      if (merged.length > MAX_NAV_LOCATIONS) {
        toast.error(`You can select a maximum of ${MAX_NAV_LOCATIONS} locations.`);
      }
      setSearchCity(merged.slice(0, MAX_NAV_LOCATIONS).join(", "));
      setInputValue("");
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    if (!showSearchBar) {
      setSearchCity("");
      setInputValue("");
    }
  }, [location.pathname]);

  const checkLoginStatus = () => {
    const userId = sessionStorage.getItem("accessToken");
    setIsLoggedIn(!!userId);
  };

  useEffect(() => {
    checkLoginStatus();
    const intervalId = setInterval(checkLoginStatus, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const handleLogout = () => {
    setShowModal(true);
  };

  const confirmLogout = () => {
    sessionStorage.clear();
    setShowModal(false);
    toast.success("Logout Successfully");
    setIsLoggedIn(false);
    history.push("/");
  };

  useEffect(() => {
    if (isDropdownOpen) {
      const timer = setTimeout(() => {
        setIsDropdownOpen(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isDropdownOpen]);

  const userId = sessionStorage.getItem("accessToken");
  const userType = sessionStorage.getItem("user_type");

  useEffect(() => {
    const checkPostLimits = async () => {
      try {
        const profileForm = new FormData();
        profileForm.append("user_id", userId);

        const profileResponse = await axios.post(
          `${process.env.REACT_APP_API_URL}/cust_api/get_profile`,
          profileForm,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const countData = profileResponse?.data?.count_data;

        if (countData) {
          setFreePostCount(countData.free_post_count || 0);
        }
        setProfileImage(profileResponse?.data?.data?.profile_image || "");
      } catch (error) {
        console.error("Error checking post limits:", error);
      }
    };

    if (userId) {
      checkPostLimits();
    }
  }, [userId]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isLoginModalOpen || isSignUpModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isLoginModalOpen, isSignUpModalOpen]);

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
      {/* SEO / AEO / GEO : brand + contact structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "ZeroBriks",
            logo: "/app1.png",
            parentOrganization: { "@type": "Organization", name: "ZeroBriks" },
            areaServed: { "@type": "Country", name: "India" },
            contactPoint: {
              "@type": "ContactPoint",
              telephone: "+91-8600199570",
              contactType: "customer support",
              areaServed: "IN",
              availableLanguage: ["English", "Hindi"],
            },
          }),
        }}
      />

      <div className="max-w-[1160px] mx-auto px-3 sm:px-4 lg:px-6 py-2 flex items-center justify-between gap-3">
        {/* Left: Logo & Tagline */}
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/" aria-label="ZeroBriks" className="flex items-center">
            <img
              src="/app1.png"
              alt="ZeroBriks Logo"
              className="w-[150px] md:w-[130px] h-auto object-contain"
            />
          </Link>
          <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-gray-300">
            <span className="text-[9px] leading-tight text-gray-600 font-medium">
              A Brand of <br />
              <strong className="text-gray-800 font-semibold">Zerobriks</strong>
            </span>
          </div>
        </div>

        {/* Center: Navigation Links / Search Bar */}
        <nav
          aria-label="Main navigation"
          className="hidden lg:flex items-center lg:space-x-4 xl:space-x-5"
        >
          {showSearchBar ? (
            <div
              role="search"
              data-nav-search
              className="relative flex items-center gap-1.5 h-8 w-[280px] max-w-full px-2 my-border rounded-md bg-white"
            >
              {/* Single-line strip: chips + input scroll sideways instead of growing the box */}
              <div className="flex items-center gap-1.5 min-w-0 flex-1 h-full overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {selectedCityList.map((city) => (
                  <span
                    key={city}
                    className="inline-flex items-center shrink-0 max-w-[140px] px-2 py-0.5 text-[11px] text-black bg-gray-200 rounded-full"
                  >
                    <span className="min-w-0 truncate" title={city}>
                      {city}
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove ${city}`}
                      className="ml-1.5 shrink-0 text-black hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#700c28] rounded"
                      onClick={() =>
                        setSearchCity(selectedCityList.filter((c) => c !== city).join(", "))
                      }
                    >
                      ✕
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  aria-label="Search location"
                  className="flex-1 min-w-[70px] h-full bg-transparent border-none outline-none text-[11px]"
                  placeholder={selectedCityList.length ? "" : "Search location or locality..."}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleNavKeyDown}
                />
              </div>

              {showSuggestions && suggestions.length > 0 && (
                <ul
                  role="listbox"
                  className="absolute left-0 right-0 z-50 mt-1 overflow-y-auto bg-white border border-gray-100 rounded-md shadow-xl max-h-64 top-full"
                >
                  {suggestions.map((pred, i) => {
                    const main = pred.structured_formatting?.main_text || pred.description;
                    const sec = pred.structured_formatting?.secondary_text || "";
                    return (
                      <li key={pred.place_id} role="option" aria-selected={i === activeSuggestion}>
                        <button
                          type="button"
                          onMouseEnter={() => setActiveSuggestion(i)}
                          onClick={() => pickNavSuggestion(pred)}
                          className={`flex items-start w-full gap-2 px-2.5 py-1.5 text-left ${
                            i === activeSuggestion ? "bg-[#700c28]/10" : "hover:bg-gray-50"
                          }`}
                        >
                          <FiMapPin size={11} className="mt-0.5 text-[#700c28] shrink-0" aria-hidden="true" />
                          <span className="min-w-0">
                            <span className="block text-[11px] font-semibold text-gray-900 truncate">{main}</span>
                            {sec && <span className="block text-[10px] text-gray-500 truncate">{sec}</span>}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ) : (
            <ul className="flex items-center lg:space-x-4 xl:space-x-5 mb-0 pl-0 list-none">
              <li>
                <Link
                  to={{ pathname: "/property", state: { propertyType: "Buy" } }}
                  className="text-[9px] xl:text-xs font-semibold tracking-wide text-gray-700 no-underline transition hover:text-[#700c28] whitespace-nowrap"
                >
                  Buy
                </Link>
              </li>
              <li>
                <Link
                  to={{ pathname: "/property", state: { propertyType: "Rent" } }}
                  className="text-[9px] xl:text-xs font-semibold tracking-wide text-gray-700 no-underline transition hover:text-[#700c28] whitespace-nowrap"
                >
                  Rent
                </Link>
              </li>
              <li>
                <Link
                  to={{ pathname: "/property", state: { propertyType: "PG" } }}
                  className="text-[9px] xl:text-xs font-semibold tracking-wide text-gray-700 no-underline transition hover:text-[#700c28] whitespace-nowrap"
                >
                  PG
                </Link>
              </li>
              <li>
                <Link
                  to={{ pathname: "/property", state: { propertyType: "Plots/Land" } }}
                  className="text-[9px] xl:text-xs font-semibold tracking-wide text-gray-700 no-underline transition hover:text-[#700c28] whitespace-nowrap"
                >
                  Plots/Land
                </Link>
              </li>
              <li>
                <Link
                  to={{ pathname: "/property", state: { propertyType: "Commercial" } }}
                  className="text-[9px] xl:text-xs font-semibold tracking-wide text-gray-700 no-underline transition hover:text-[#700c28] whitespace-nowrap"
                >
                  Commercial
                </Link>
              </li>
              <li>
                <Link
                  to="/advisordashboard?label=Builder"
                  className="text-[9px] xl:text-xs font-semibold tracking-wide text-gray-700 no-underline transition hover:text-[#700c28] whitespace-nowrap"
                >
                  Projects
                </Link>
              </li>
              <li>
                <Link
                  to="/allproperties"
                  className="text-[9px] xl:text-xs font-semibold tracking-wide text-gray-700 no-underline transition hover:text-[#700c28] whitespace-nowrap"
                >
                  Explore Cities
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-[9px] xl:text-xs font-semibold tracking-wide text-gray-700 no-underline transition hover:text-[#700c28] whitespace-nowrap"
                >
                  Plans
                </Link>
              </li>
            </ul>
          )}
        </nav>

        {/* Right Side Actions */}
        <div className="hidden lg:flex items-center space-x-2 shrink-0">
          {/* Download App Button */}
          <Link
            to="/download"
            className="flex items-center gap-1 px-2.5 py-1 text-[9px] font-semibold text-[#700c28] border border-[#700c28] rounded-lg hover:bg-[#fdf2f4] no-underline transition-colors whitespace-nowrap"
          >
            <span aria-hidden="true" className="text-xs">📱</span>
            <span>Download App</span>
          </Link>

          {/* Post Property Button */}
          {isLoggedIn ? (
            <Link
              to="/add_new_property"
              className="flex items-center gap-1 px-3 py-1 text-[11px] font-semibold text-white bg-[#700c28] rounded-lg hover:bg-[#580920] no-underline transition-colors shadow-sm whitespace-nowrap"
            >
              <span>Post Property</span>
              {freePostCount > 0 && (
                <span className="px-1.5 py-px text-[9px] font-bold text-gray-900 bg-amber-400 rounded-full">
                  FREE
                </span>
              )}
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1 text-[11px] font-semibold text-white bg-[#700c28] rounded-lg hover:bg-[#580920] transition-colors shadow-sm cursor-pointer whitespace-nowrap"
            >
              <span>Post Property</span>
              <span className="px-1.5 py-px text-[9px] font-bold text-gray-900 bg-amber-400 rounded-full">
                FREE
              </span>
            </button>
          )}

          {/* Dialer Icon */}
          <a
            href="tel:+91-8681800029"
            aria-label="Call ZeroBriks"
            className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors"
            title="Call Us"
          >
            <IoCall size={13} aria-hidden="true" />
          </a>

          {/* Profile / User Menu Dropdown */}
          <div className="relative" ref={dropdownRef}>
            {isLoggedIn ? (
              <button
                type="button"
                aria-label="Open account menu"
                aria-haspopup="true"
                aria-expanded={isDropdownOpen}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#700c28] rounded-full flex items-center"
              >
                {profileImage && profileImage !== "null" && profileImage.trim() !== "" ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="object-cover w-7 h-7 border border-gray-300 rounded-full shadow-sm"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center text-gray-700">
                    <FiUser size={15} aria-hidden="true" />
                  </div>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                aria-label="Login or sign up"
                className="w-7 h-7 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#700c28]"
                title="Login / Signup"
              >
                <FiUser size={15} aria-hidden="true" />
              </button>
            )}

            {/* Dropdown Menu */}
            {isDropdownOpen && isLoggedIn && (
              <div className="absolute right-0 z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl w-40 py-1">
                <Link
                  to={{ pathname: "/dashboard", state: { page: "profile" } }}
                  onClick={() => setIsDropdownOpen(false)}
                  className="block px-3 py-1.5 text-[11px] text-gray-800 no-underline hover:bg-gray-50"
                >
                  Profile
                </Link>
                <Link
                  to={{ pathname: "/dashboard", state: { page: "myProperties" } }}
                  onClick={() => setIsDropdownOpen(false)}
                  className="block px-3 py-1.5 text-[11px] text-gray-800 no-underline hover:bg-gray-50"
                >
                  My Properties
                </Link>
                <Link
                  to={{ pathname: "/dashboard", state: { page: "myVirtualtour" } }}
                  onClick={() => setIsDropdownOpen(false)}
                  className="block px-3 py-1.5 text-[11px] text-gray-800 no-underline hover:bg-gray-50"
                >
                  My Virtual Tour
                </Link>
                <Link
                  to={{ pathname: "/dashboard", state: { page: "myFavourite" } }}
                  onClick={() => setIsDropdownOpen(false)}
                  className="block px-3 py-1.5 text-[11px] text-gray-800 no-underline hover:bg-gray-50"
                >
                  My Favourites
                </Link>
                <Link
                  to={{ pathname: "/dashboard", state: { page: "saveSerches" } }}
                  onClick={() => setIsDropdownOpen(false)}
                  className="block px-3 py-1.5 text-[11px] text-gray-800 no-underline hover:bg-gray-50"
                >
                  Saved Searches
                </Link>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-1.5 text-[11px] text-red-600 font-semibold hover:bg-red-50 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex items-center gap-1.5 lg:hidden">
          <a
            href="tel:+918681800029"
            aria-label="Call ZeroBriks"
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700"
          >
            <IoCall size={14} aria-hidden="true" />
          </a>
          <button
            type="button"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#700c28] rounded"
          >
            {isMobileMenuOpen ? (
              <FaTimes size={18} aria-hidden="true" />
            ) : (
              <FiMenu size={18} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Mobile navigation"
          className="lg:hidden bg-white border-t border-gray-200 px-4 py-3 space-y-2.5 shadow-lg max-h-[calc(100vh-56px)] overflow-y-auto"
        >
          <ul className="space-y-0.5 pl-0 list-none mb-0">
            {[
              { label: "Buy", state: { propertyType: "Buy" } },
              { label: "Rent", state: { propertyType: "Rent" } },
              { label: "PG", state: { propertyType: "PG" } },
              { label: "Plots/Land", state: { propertyType: "Plots/Land" } },
              { label: "Commercial", state: { propertyType: "Commercial" } },
            ].map((item) => (
              <li key={item.label}>
                <Link
                  to={{ pathname: "/property", state: item.state }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-[13px] font-semibold text-gray-800 py-2 no-underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/advisordashboard?label=Builder"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-[13px] font-semibold text-gray-800 py-2 no-underline"
              >
                Projects
              </Link>
            </li>
            <li>
              <Link
                to="/allproperties"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-[13px] font-semibold text-gray-800 py-2 no-underline"
              >
                Explore Cities
              </Link>
            </li>
            <li>
              <Link
                to="/pricing"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-[13px] font-semibold text-gray-800 py-2 no-underline"
              >
                Plans
              </Link>
            </li>
          </ul>

          <div className="pt-2.5 border-t border-gray-100 flex flex-col gap-2">
            <Link
              to="/download"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 text-center text-xs font-semibold text-[#700c28] border border-[#700c28] rounded-lg no-underline"
            >
              Download Mobile App
            </Link>

            {isLoggedIn ? (
              <Link
                to="/add_new_property"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 text-center text-xs font-semibold text-white bg-[#700c28] rounded-lg no-underline shadow-sm"
              >
                Post Property FREE
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsLoginModalOpen(true);
                }}
                className="py-2 text-center text-xs font-semibold text-white bg-[#700c28] rounded-lg shadow-sm cursor-pointer"
              >
                Post Property FREE
              </button>
            )}

            {isLoggedIn ? (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="py-2 text-center text-xs font-semibold text-red-600 bg-red-50 rounded-lg cursor-pointer"
              >
                Logout
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsLoginModalOpen(true);
                }}
                className="py-2 text-center text-xs font-semibold text-gray-800 bg-gray-100 rounded-lg cursor-pointer"
              >
                Login / Sign Up
              </button>
            )}
          </div>
        </nav>
      )}

      {/* Logout Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            className="relative p-5 text-center bg-white shadow-xl rounded-xl w-full max-w-[310px]"
          >
            <button
              type="button"
              aria-label="Close dialog"
              className="absolute text-gray-500 hover:text-gray-800 top-2.5 right-2.5"
              onClick={() => setShowModal(false)}
            >
              <IoCloseCircleOutline size={20} aria-hidden="true" />
            </button>

            <h2 id="logout-title" className="text-base font-bold text-gray-900 mt-1.5">
              Are you sure?
            </h2>
            <p className="mt-1 text-[11px] text-gray-600">
              You will be logged out of your account.
            </p>

            <div className="flex justify-center gap-2.5 mt-4">
              <button
                type="button"
                className="px-4 py-1.5 text-[11px] font-semibold text-white bg-[#700c28] rounded-lg hover:bg-[#580920] transition-colors"
                onClick={confirmLogout}
              >
                Yes, Logout
              </button>
              <button
                type="button"
                className="px-4 py-1.5 text-[11px] font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modals */}
      <Login1
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSwitchToSignUp={() => {
          setIsLoginModalOpen(false);
          setIsSignUpModalOpen(true);
        }}
      />

      <SignUp1
        isOpen={isSignUpModalOpen}
        onClose={() => setIsSignUpModalOpen(false)}
        onSwitchToLogin={() => {
          setIsSignUpModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />
    </header>
  );
};

export default HorizontalNav;