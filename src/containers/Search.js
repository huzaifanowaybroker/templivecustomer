import React, { useState, useEffect, useRef, useContext } from "react";
import { Link, useHistory } from "react-router-dom";
import { FiMapPin, FiChevronDown, FiSliders, FiCrosshair, FiMic, FiSearch, FiClock } from "react-icons/fi";
import { RiHomeLine } from "react-icons/ri";
import {
  FaHome,
  FaBuilding,
  FaTree,
  FaCity,
  FaBed,
  FaArrowRight,
  FaFire,
  FaRupeeSign,
  FaPercent,
  FaShieldAlt,
  FaLock,
  FaCamera,
  FaMagic,
} from "react-icons/fa";
import { SearchContext } from "./SearchContext";
import {
  parseUniversalQuery,
  buildSearchState,
  mergeLocations,
  useSearchSuggestions,
} from "./universalSearch";

/* ================= SEARCH CONFIG ================= */
const POST_PROPERTY_PATH = "/postproperty";
const RECENT_KEY = "zb_recent_searches_v2";
const MAX_LOCATIONS = 3;
const GOOGLE_MAPS_API_KEY = "AIzaSyAt8bj4UACvakZfiSy-0c1o_ivfplm7jEU";

const BUY_TYPES = ["Flat/Apartment", "Home/Villa", "Service Apartment", "Farmhouse", "Plot/Land", "Builder Floor", "1RK/Studio Apartment"];
const RENT_TYPES = ["Flat/Apartment", "Builder Floor", "1RK/Studio Apartment", "Independent House/Villa", "Service Apartment", "Farmhouse"];
const PG_TYPES = ["Flat/Apartment", "Builder Floor", "1RK/Studio Apartment", "Independent House/Villa", "Service Apartment"];
const COMMERCIAL_BUY_TYPES = [
  "Ready to move office space", "Bare shell office space", "Ware House", "Factory", "Hotel/Resorts",
  "Others", "Plot/Land", "Cold Storage", "Manufacturing", "Guest-House/Banquet-Halls", "Retail",
];
const COMMERCIAL_LEASE_TYPES = ["Office Space", "Retail Shops/Showrooms", "Other Commercial spaces", "Plot/Land"];
const PLOT_TYPES = ["Commercial Land/Inst. Land", "Industrial Lands/Plots", "Agricultural/Farm Land"];

const BUY_BUDGETS = [
  { label: "Under ₹25 Lac", value: "0-2500000" },
  { label: "₹25 Lac – ₹50 Lac", value: "2500000-5000000" },
  { label: "₹50 Lac – ₹1 Cr", value: "5000000-10000000" },
  { label: "₹1 Cr – ₹2 Cr", value: "10000000-20000000" },
  { label: "Above ₹2 Cr", value: "20000000-" },
];
const RENT_BUDGETS = [
  { label: "Under ₹10,000", value: "0-10000" },
  { label: "₹10,000 – ₹25,000", value: "10000-25000" },
  { label: "₹25,000 – ₹50,000", value: "25000-50000" },
  { label: "₹50,000 – ₹1 Lac", value: "50000-100000" },
  { label: "Above ₹1 Lac", value: "100000-" },
];
const PG_BUDGETS = [
  { label: "Under ₹5,000", value: "0-5000" },
  { label: "₹5,000 – ₹10,000", value: "5000-10000" },
  { label: "₹10,000 – ₹20,000", value: "10000-20000" },
  { label: "Above ₹20,000", value: "20000-" },
];

const TABS = [
  { id: "Buy", label: "Buy", category: "Buy", building: "Residential", all: "All Residential", types: BUY_TYPES, budgets: BUY_BUDGETS, example: "3 BHK flat in Pune" },
  { id: "Rent", label: "Rent", category: "Rent", building: "Residential", all: "All Residential", types: RENT_TYPES, budgets: RENT_BUDGETS, monthly: true, example: "Flat for rent in Noida" },
  { id: "PG/Co-living", label: "PG", category: "PG/Co-living", building: "Residential", all: "All PG types", types: PG_TYPES, budgets: PG_BUDGETS, monthly: true, example: "PG in Pune under 10000" },
  { id: "Commercial", label: "Commercial", category: "Commercial", building: "Commercial", all: "All Commercial", types: COMMERCIAL_BUY_TYPES, budgets: BUY_BUDGETS, hasMode: true, example: "Office for lease in Baner" },
  { id: "Plot/Land", label: "Plots/Land", category: "Plot/Land", building: "", all: "All Plot Types", types: PLOT_TYPES, budgets: BUY_BUDGETS, example: "Plot in Wakad" },
];

const TAB_FOR_CATEGORY = {
  Buy: "Buy",
  Rent: "Rent",
  "PG/Co-living": "PG/Co-living",
  Commercial: "Commercial",
  "Plot/Land": "Plot/Land",
};

const readRecent = () => {
  try {
    return (JSON.parse(localStorage.getItem(RECENT_KEY)) || []).filter((r) => r && r.label && r.state);
  } catch {
    return [];
  }
};

const saveRecent = (entry) => {
  try {
    const list = [entry, ...readRecent().filter((r) => r.label !== entry.label)].slice(0, 6);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
    return list;
  } catch {
    return [];
  }
};

const Search = () => {
  /* ================= STATE ================= */
  const history = useHistory();
  const { searchCity, setSearchCity } = useContext(SearchContext);

  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  const [selectedLocations, setSelectedLocations] = useState(
    searchCity
      ? Array.isArray(searchCity)
        ? searchCity
        : String(searchCity).split(",").map((s) => s.trim()).filter(Boolean)
      : []
  );

  const [selectedTab, setSelectedTab] = useState("Buy");
  const [commercialMode, setCommercialMode] = useState("Buy");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [budget, setBudget] = useState("");

  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [selectedBhk, setSelectedBhk] = useState("");
  const [selectedFurnishing, setSelectedFurnishing] = useState("");
  const [selectedConstruction, setSelectedConstruction] = useState("");

  const [openDd, setOpenDd] = useState(null);
  const [locating, setLocating] = useState(false);
  const [listening, setListening] = useState(false);
  const [recent, setRecent] = useState(readRecent);

  // True while the search box (or its dropdown) is in use; shows recent searches when empty
  const [focused, setFocused] = useState(false);

  /* ================= DERIVED VALUES ================= */
  const tab = TABS.find((t) => t.id === selectedTab) || TABS[0];
  const lease = tab.hasMode && commercialMode === "Lease";
  const typeOptions = lease ? COMMERCIAL_LEASE_TYPES : tab.types;
  const isMonthly = tab.monthly || lease;
  const budgetOptions = lease ? RENT_BUDGETS : tab.budgets;
  const showBhk = selectedTab !== "Commercial" && selectedTab !== "Plot/Land";
  const showFurnishing = selectedTab !== "Plot/Land";
  const showConstruction = selectedTab !== "Plot/Land";
  const canAddMore = selectedLocations.length < MAX_LOCATIONS;

  /* ================= SUGGESTIONS (as you type) ================= */
  // Query suggestions ("5 BHK Projects in Pune") plus Google Places localities
  const sugg = useSearchSuggestions(searchQuery, {
    apiKey: GOOGLE_MAPS_API_KEY,
    selectedCities: selectedLocations,
    defaultCategory: selectedTab === "Buy" || selectedTab === "Rent" ? selectedTab : null,
  });
  const showRecent = !sugg.open && focused && !searchQuery.trim() && recent.length > 0;

  /* ================= TABS & FILTERS ================= */
  const selectTab = (t) => {
    setSelectedTab(t.id);
    setCommercialMode("Buy");
    setSelectedTypes([]);
    setBudget("");
    setOpenDd(null);
    setError("");
    if (t.id === "Commercial" || t.id === "Plot/Land") setSelectedBhk("");
    if (t.id === "Plot/Land") setSelectedFurnishing("");
    setSelectedConstruction("");
  };

  const changeMode = (mode) => {
    setCommercialMode(mode);
    setSelectedTypes([]);
    setBudget("");
  };

  const toggleType = (opt) =>
    setSelectedTypes((prev) => (prev.includes(opt) ? prev.filter((x) => x !== opt) : [...prev, opt]));

  /* ================= LOCATIONS ================= */
  const addLocation = (locName) => {
    const trimmed = locName.trim();
    if (!trimmed) return;
    if (selectedLocations.includes(trimmed)) {
      setSearchQuery("");
      return;
    }
    if (selectedLocations.length >= MAX_LOCATIONS) {
      setError("You can select a maximum of 3 locations.");
      return;
    }
    setError("");
    const updated = [...selectedLocations, trimmed];
    setSelectedLocations(updated);
    setSearchCity(updated.join(", "));
    setSearchQuery("");
  };

  const removeLocation = (locToRemove) => {
    const updated = selectedLocations.filter((loc) => loc !== locToRemove);
    setSelectedLocations(updated);
    setSearchCity(updated.join(", "));
    setError("");
  };

  // A listing from the database opens its details page
  const openProperty = (item) => {
    sugg.setOpen(false);
    setFocused(false);
    setSearchQuery("");
    setError("");
    history.push(`/propertydetails/${item.id}`);
  };

  // A suggestion that carries a query runs the search; a plain place becomes a location chip
  const pickItem = (item) => {
    if (item.kind === "property") return openProperty(item);
    sugg.setOpen(false);
    if (item.kind === "place") sugg.endSession();
    if (item.parsed) handleSearch(item.parsed);
    else addLocation(item.name);
  };

  /* ================= SEARCH (universal) ================= */
  // `picked` is the query of a chosen suggestion. Without it the typed text is parsed.
  const handleSearch = (picked) => {
    // The typed text is exactly the name of a listing: open that listing
    if (!picked && sugg.exactProperty) return openProperty(sugg.exactProperty);

    const typed = searchQuery.trim();
    const parsed = picked || parseUniversalQuery(typed);

    // Cities found in the text join the location chips. A locality narrows the results.
    const locations = mergeLocations(selectedLocations, parsed, MAX_LOCATIONS);

    const hasAnything =
      typed || picked || locations.length || selectedTypes.length || budget ||
      selectedBhk || selectedFurnishing || selectedConstruction;
    if (!hasAnything) {
      setError("Please enter what you're looking for.");
      return;
    }
    setError("");

    // The text picks the tab when it names one ("pg", "office", "plot").
    // Otherwise the selected tab applies, so "house in pune" on Buy means houses for sale.
    const tabId = parsed.category ? TAB_FOR_CATEGORY[parsed.category] : selectedTab;
    const nextTab = TABS.find((t) => t.id === tabId) || TABS[0];
    const sameTab = tabId === selectedTab;
    const isPlotTab = tabId === "Plot/Land";
    const mode = nextTab.hasMode ? parsed.mode || (sameTab ? commercialMode : null) : null;

    // Dropdown choices belong to the selected tab. Anything typed overrides them.
    const [minPick, maxPick] = sameTab && budget ? budget.split("-") : [];
    const typedBudget = parsed.minPrice || parsed.maxPrice;
    const query = {
      ...parsed,
      category: nextTab.category,
      mode,
      bhk: parsed.bhk || (tabId === "Commercial" || isPlotTab ? "" : selectedBhk),
      furnishing: parsed.furnishing || (isPlotTab ? "" : selectedFurnishing),
      construction: parsed.construction || (isPlotTab ? "" : selectedConstruction),
      minPrice: typedBudget ? parsed.minPrice : Number(minPick) || null,
      maxPrice: typedBudget ? parsed.maxPrice : Number(maxPick) || null,
    };

    const state = buildSearchState(query, {
      locations,
      typeLabels: sameTab && !isPlotTab ? selectedTypes : [],
      plotLandTypes: sameTab && isPlotTab ? selectedTypes : [],
    });

    setSelectedTab(tabId);
    if (mode) setCommercialMode(mode);
    if (!sameTab) {
      setSelectedTypes([]);
      setBudget("");
    }
    setSelectedLocations(locations);
    setSearchCity(locations.join(", "));
    setSearchQuery("");
    sugg.setOpen(false);
    setFocused(false);

    setRecent(saveRecent({ label: state.universal.title, state }));
    history.push({ pathname: "/searchdashboard", state });
  };

  const handleKeyDown = (e) => {
    const { items, active } = sugg;
    if (sugg.open) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        sugg.setActive((i) => (i + 1) % items.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        sugg.setActive((i) => (i <= 0 ? items.length - 1 : i - 1));
        return;
      }
      if (e.key === "Escape") {
        sugg.setOpen(false);
        return;
      }
      // Enter picks the highlighted suggestion, if any
      if (e.key === "Enter" && items[active]) {
        e.preventDefault();
        pickItem(items[active]);
        return;
      }
    }
    // Enter with nothing highlighted searches exactly what was typed
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const runRecent = (r) => {
    const locations = String(r.state.searchCity || "").split(",").map((s) => s.trim()).filter(Boolean);
    setSelectedLocations(locations);
    setSearchCity(locations.join(", "));
    setFocused(false);
    setRecent(saveRecent(r));
    history.push({ pathname: "/searchdashboard", state: r.state });
  };

  /* ================= "USE MY LOCATION" ================= */
  const reverseGeocode = async (lat, lng) => {
    const pickFrom = (results) => {
      const comps = results.flatMap((r) => r.address_components || []);
      const pick = (type) => (comps.find((c) => c.types.includes(type)) || {}).long_name;
      return (
        pick("sublocality_level_1") ||
        pick("neighborhood") ||
        pick("sublocality") ||
        pick("locality") ||
        pick("administrative_area_level_2") ||
        pick("administrative_area_level_1") ||
        ""
      );
    };
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=en&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await res.json();
      if (data.status === "OK" && data.results && data.results.length) {
        const name = pickFrom(data.results);
        if (name) return name;
      }
    } catch (e) {
      /* fall through to the JS geocoder */
    }
    if (window.google && window.google.maps) {
      return new Promise((resolve) => {
        new window.google.maps.Geocoder().geocode({ location: { lat, lng } }, (results, status) => {
          resolve(status === "OK" && results && results.length ? pickFrom(results) : "");
        });
      });
    }
    return "";
  };

  const getPosition = (options) =>
    new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, options));

  const handleLocate = async () => {
    if (!navigator.geolocation) {
      setError("Location isn't supported on this device.");
      return;
    }
    if (window.isSecureContext === false) {
      setError("Live location needs a secure (https) connection.");
      return;
    }
    setLocating(true);
    setError("");
    try {
      let pos;
      try {
        pos = await getPosition({ enableHighAccuracy: true, timeout: 20000, maximumAge: 60000 });
      } catch (err) {
        if (err.code === 1) throw err;
        pos = await getPosition({ enableHighAccuracy: false, timeout: 20000, maximumAge: 300000 });
      }
      const name = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
      setLocating(false);
      if (name) addLocation(name);
      else setError("Found your position but couldn't name the area. Please type it in.");
    } catch (err) {
      setLocating(false);
      setError(
        err && err.code === 1
          ? "Location is blocked. Allow location for this site in your browser settings."
          : err && err.code === 2
            ? "Couldn't detect your position. Turn on location/GPS and try again."
            : err && err.code === 3
              ? "Finding your location took too long. Please try again."
              : "Couldn't get your location. Please try again."
      );
    }
  };

  /* ================= VOICE SEARCH ================= */
  const handleVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setError("Voice search isn't supported in this browser. Try Chrome.");
      return;
    }
    if (listening) {
      recognitionRef.current && recognitionRef.current.stop();
      return;
    }
    setError("");
    const rec = new SR();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = (e) => {
      setListening(false);
      setError(e.error === "not-allowed" ? "Microphone permission denied." : "Couldn't hear that. Please try again.");
    };
    rec.onresult = (e) => {
      // Voice fills the search text; Enter or the Search button runs the universal search
      const said = e.results[0][0].transcript.replace(/[.,]$/, "").trim();
      setSearchQuery(said);
    };
    recognitionRef.current = rec;
    rec.start();
  };

  /* ================= OUTSIDE CLICK + CLEANUP ================= */
  useEffect(() => {
    const closeSuggestions = sugg.setOpen;
    const close = (e) => {
      if (!e.target.closest("[data-ac]")) {
        closeSuggestions(false);
        setFocused(false);
      }
      if (!e.target.closest("[data-dd]")) {
        setOpenDd(null);
        setShowMoreFilters(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      if (recognitionRef.current) recognitionRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================= STATIC UI DATA ================= */
  const popularCities = [
    { name: "Ahmedabad", imageUrl: "/image/ahmedabad.jpg" },
    { name: "Bengaluru", imageUrl: "/image/bengaluru.jpg" },
    { name: "Chennai", imageUrl: "/image/chennai.jpg" },
    { name: "Delhi", imageUrl: "/image/delhi.jpg" },
    { name: "Hyderabad", imageUrl: "/image/hyderabad.jpg" },
    { name: "Kolkata", imageUrl: "/image/kolkata.jpg" },
    { name: "Mumbai", imageUrl: "/image/mumbai.jpg" },
    { name: "Pune", imageUrl: "/image/pune.jpg" },
  ];

  const typeCards = [
    { title: "Apartments", sub: "Flats & Luxury Homes", icon: <FaBuilding />, img: "/apartments.jpg", type: "Buy" },
    { title: "Independent Houses", sub: "Villas & Individual Homes", icon: <FaHome />, img: "/independenthouse.jpg", type: "Buy" },
    { title: "Plots & Land", sub: "Residential & Commercial", icon: <FaTree />, img: "/plotandland.jpg", type: "Plot/Land" },
    { title: "Commercial", sub: "Offices, Shops & Spaces", icon: <FaCity />, img: "/commercialspace.jpg", type: "Commercial" },
    { title: "PG & Co-Living", sub: "PGs, Hostels & Shared Rooms", icon: <FaBed />, img: "/pgandcoliving.jpg", type: "PG/Co-living" },
  ];

  /* ================= RENDER ================= */
  return (
    <div className="zb-root w-full overflow-x-hidden antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600;6..72,700&family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');

        .hero-title { margin-top: 0.75rem; font-size: 30px; font-weight: 600; line-height: 1.1; font-family: "Newsreader", Georgia, serif; }
        .zb-gold { color: #b8860b; }
        @media (min-width: 640px) { .hero-title { font-size: 38px; } }
        @media (min-width: 1024px) { .hero-title { font-size: 42px; } }

        .zb-root {
          --bg: #FBF6F3; --surface: #FFFFFF; --ink: #1B1113; --muted: #6B5A60;
          --accent: #7A1230; --accent-deep: #4E0C22; --gold: #B9770E; --gold-soft: #F6D27A;
          --gold-bright: #F2B632; --line: #EADFE2; --chip: #F6EEF1;
          --shadow: 0 24px 50px -30px rgba(78, 12, 34, .45);
          font-family: "Be Vietnam Pro", system-ui, sans-serif; background: var(--bg); color: var(--ink);
        }
        .zb-serif { font-family: "Newsreader", Georgia, serif; }
        .zb-eyebrow { color: var(--gold); font-weight: 700; letter-spacing: .2em; text-transform: uppercase; font-size: 9px; }
        .zb-card { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; box-shadow: var(--shadow); }
        .zb-tile { background: var(--surface); border: 1px solid var(--line); border-radius: 11px; }
        .zb-field { background: #fff; border: 1px solid var(--line); border-radius: 9px; transition: border-color .15s; }
        .zb-field:focus-within, .zb-field:hover { border-color: var(--accent); }
        .zb-tab { border-radius: 999px; color: var(--muted); transition: background .15s, color .15s; }
        .zb-tab[aria-pressed="true"] { background: var(--accent); color: #fff; }
        .zb-btn { background: var(--accent); color: #fff; border-radius: 9px; transition: transform .15s ease, filter .15s ease; }
        .zb-btn:hover { transform: translateY(-1px); filter: brightness(1.08); }
        .zb-pill { background: var(--chip); color: var(--ink); border-radius: 999px; transition: background .15s, color .15s; }
        .zb-pill:hover { background: var(--accent); color: #fff; }
        .zb-pop { background: #fff; border: 1px solid var(--line); border-radius: 9px; box-shadow: 0 14px 30px -14px rgba(78, 12, 34, .45); }
        .zb-dd-item:hover { background: rgba(122, 18, 48, .05); }
        .zb-city-btn { transition: background .15s, color .15s; }
      `}</style>

      {/* SEO / AEO / GEO : structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                name: "ZeroBriks",
                description:
                  "ZeroBriks is an Indian real estate platform to buy, rent or sell homes, plots and commercial property directly from verified owners with zero brokerage.",
                areaServed: { "@type": "Country", name: "India" },
              },
              {
                "@type": "WebSite",
                name: "ZeroBriks",
                inLanguage: "en-IN",
                description:
                  "Buy, rent or sell property in 50+ cities across India directly from verified owners. No brokerage, no middlemen.",
              },
            ],
          }),
        }}
      />

      {/* ============================================================ */}
      {/*  SECTION 1 : HERO + UNIVERSAL SEARCH                          */}
      {/* ============================================================ */}
      {/* <section aria-labelledby="hero-heading" className="relative overflow-hidden" style={{ backgroundColor: "#FBF6F3" }}> */}
      <section
        aria-labelledby="hero-heading"
        className="relative overflow-hidden"
        style={{
          backgroundImage: "url('/image/hero.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
{/* huzaifa */}


        <div className="grid items-start max-w-6xl gap-8 px-2  pt-9 pb-12 mx-auto md:grid-cols-12 sm:px-8 lg:px-10 lg:pt-12">
          {/* LEFT: headline, value line, feature icons, stats */}
          <div className="contents md:block md:col-span-7">
            <p className="hidden md:block zb-eyebrow">Welcome to ZeroBriks</p>
            <h1 id="hero-heading" className="hero-title">
              India’s No.&nbsp;1&nbsp;
              <span className="zb-gold">Zero Brokerage</span> Property Site
            </h1>

            <div className="order-2 mt-2 md:order-none">
              <p className="text-[16px] font-bold" style={{ color: "var(--accent)" }}>
                No brokerage. No middlemen. Just Direct Deals.
              </p>
              <p className="hidden md:block text-[10px] font-normal">
                A smarter way to buy, rent or sell property, directly with verified owners across India.
              </p>
            </div>

            <ul className="hidden md:grid grid-cols-5 gap-2 max-w-2xl mt-4 m-0 p-0 list-none" aria-label="Key benefits">
              {[
                { icon: <FaPercent />, label: "Zero Brokerage" },
                { icon: <FaShieldAlt />, label: "Verified Owners" },
                { icon: <FaMagic />, label: "AI Smart Match" },
                { icon: <FaCamera />, label: "Virtual Tour" },
                { icon: <FaLock />, label: "Secure & Transparent" },
              ].map((f) => (
                <li key={f.label} className="flex flex-col items-center text-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className="grid w-8 h-8 text-[10px] text-white rounded-full place-items-center"
                    style={{ background: "var(--accent)" }}
                  >
                    {f.icon}
                  </span>
                  <span className="text-[11px] font-semibold leading-tight">{f.label}</span>
                </li>
              ))}
            </ul>

            <div
              aria-label="ZeroBriks at a glance"
              className="order-4 mt-4 md:mt-6 md:order-none grid grid-cols-4 items-start content-start self-start w-full max-w-3xl overflow-hidden rounded-2xl border border-[var(--line)] bg-white"
            >
              {[
                { value: "30,000+", label: "Property Listings", sub: "Across India" },
                { value: "7000+", label: "Verified Owners", sub: "Genuine & trusted" },
                { value: "8+", label: "Cities", sub: "Across India, and growing" },
                { value: "4.9/5", label: "User Rating", sub: "Trusted by thousands" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col px-2 py-2 border-[var(--line)] first:border-l-0 border-l">
                  <p className="mt-4 min-h-[2rem] text-[9px] font-semibold uppercase tracking-[0.2em] leading-snug text-[#b8860b]">
                    {s.label}
                  </p>
                  <p className="text-[15px] md:text-[24px] font-bold leading-tight whitespace-nowrap zb-serif">{s.value}</p>
                  <p className="hidden md:block text-[11px] leading-snug text-[var(--muted)]">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: SEARCH CARD */}
          <div className="relative w-full order-3 md:order-none md:col-span-5">
            <div role="search" aria-label="Search properties" className="relative p-4 zb-card">
              {/* Category tabs */}
              <nav
                aria-label="Property categories"
                className="flex gap-1 p-1 overflow-x-auto rounded-full scrollbar-hide"
                style={{ background: "var(--chip)" }}
              >
                {TABS.map((t) => {
                  const active = selectedTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => selectTab(t)}
                      aria-pressed={active}
                      className="zb-tab grow shrink-0 px-2.5 py-1.5 text-[11px] font-semibold whitespace-nowrap"
                    >
                      {t.label}
                    </button>
                  );
                })}
              </nav>

              <h2 className="mt-4 mb-2 text-lg font-semibold zb-serif">Search Properties</h2>

              <div className="space-y-2">
                {/* 1. Universal search input */}
                <div data-ac className="relative flex flex-wrap items-center gap-1 min-h-[34px] px-2.5 py-1 zb-field">
                  <FiMapPin size={12} className="shrink-0" style={{ color: "var(--accent)" }} aria-hidden="true" />

                  {selectedLocations.map((loc) => (
                    <span
                      key={loc}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold rounded-full"
                      style={{ color: "var(--accent)", background: "rgba(122,18,48,.1)" }}
                    >
                      {loc}
                      <button
                        type="button"
                        onClick={() => removeLocation(loc)}
                        className="font-bold ml-0.5 focus:outline-none"
                        style={{ color: "var(--accent)" }}
                        aria-label={`Remove ${loc}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}

                  {/* Always shown: with 3 locations chosen you can still type "3 BHK flat" */}
                  <input
                    ref={inputRef}
                    type="text"
                    id="search"
                    role="combobox"
                    aria-expanded={sugg.open}
                    aria-controls="zb-search-suggestions"
                    aria-autocomplete="list"
                    autoComplete="off"
                    aria-label="Search properties, city or locality"
                    placeholder={
                      selectedLocations.length === 0
                        ? `Try "${tab.example}"`
                        : canAddMore
                          ? 'Add "3 BHK flat" or another location...'
                          : 'Add "3 BHK flat", "under 50 lakh"...'
                    }
                    className="flex-1 min-w-[90px] px-1 text-[11px] bg-transparent outline-none placeholder:text-gray-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onKeyDown={handleKeyDown}
                  />
                  {/* 
                  <div className="flex items-center gap-1 ml-auto shrink-0">
                    <button
                      type="button"
                      onClick={handleLocate}
                      disabled={locating}
                      aria-label="Use my current location"
                      title="Use my current location"
                      className={`flex items-center justify-center w-5 h-5 rounded-full transition ${locating ? "animate-pulse" : ""}`}
                      style={{ background: "rgba(122,18,48,.1)", color: "var(--accent)" }}
                    >
                      <FiCrosshair size={10} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={handleVoice}
                      aria-label={listening ? "Stop voice search" : "Search by voice"}
                      title={listening ? "Listening… tap to stop" : "Search by voice"}
                      className={`flex items-center justify-center w-5 h-5 rounded-full transition ${listening ? "bg-red-500 text-white animate-pulse" : ""}`}
                      style={listening ? undefined : { background: "rgba(122,18,48,.1)", color: "var(--accent)" }}
                    >
                      <FiMic size={10} aria-hidden="true" />
                    </button>
                  </div> */}

                  {/* Suggestions while typing: searches first, then matching places */}
                  {sugg.open && (
                    <ul
                      id="zb-search-suggestions"
                      role="listbox"
                      className="zb-pop absolute left-0 right-0 z-50 mt-1 overflow-y-auto max-h-64 top-full"
                    >
                      {sugg.items.map((item, i) => (
                        <li key={item.key} role="option" aria-selected={i === sugg.active}>
                          <button
                            type="button"
                            onMouseMove={() => i !== sugg.active && sugg.setActive(i)}
                            onClick={() => pickItem(item)}
                            className="flex items-start w-full gap-2 px-2.5 py-1.5 text-left"
                            style={{ background: i === sugg.active ? "rgba(122,18,48,.08)" : "transparent" }}
                          >
                            {item.kind === "property" ? (
                              <RiHomeLine size={10} className="mt-0.5 shrink-0" style={{ color: "var(--accent)" }} aria-hidden="true" />
                            ) : item.kind === "place" ? (
                              <FiMapPin size={10} className="mt-0.5 shrink-0" style={{ color: "var(--accent)" }} aria-hidden="true" />
                            ) : (
                              <FiSearch size={10} className="mt-0.5 shrink-0" style={{ color: "var(--accent)" }} aria-hidden="true" />
                            )}
                            <span className="min-w-0">
                              <span className="block text-[11px] font-semibold truncate">{item.label}</span>
                              {item.sub && (
                                <span className="block text-[10px] truncate" style={{ color: "var(--muted)" }}>
                                  {item.sub}
                                </span>
                              )}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Recent searches, shown when the empty box is focused */}
                  {/* {showRecent && (
                    <ul aria-label="Recent searches" className="zb-pop absolute left-0 right-0 z-50 mt-1 overflow-y-auto max-h-64 top-full">
                      <li className="px-2.5 pt-2 pb-1 text-[9px] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                        Recent searches
                      </li>
                      {recent.slice(0, 5).map((r) => (
                        <li key={r.label}>
                          <button
                            type="button"
                            onClick={() => runRecent(r)}
                            className="zb-dd-item flex items-center w-full gap-2 px-2.5 py-1.5 text-left"
                          >
                            <FiClock size={10} className="shrink-0" style={{ color: "var(--muted)" }} aria-hidden="true" />
                            <span className="text-[11px] truncate">{r.label}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )} */}
                </div>

                {/* <p className="px-1 text-[8px] text-gray-400">
                  Try: "3 BHK flat in Pune" · "house under 50 lakh" · "PG in Baner" · "5 BHK project"
                </p> */}

                {/* 2. Buy/Lease (commercial only) + property type */}
                <div className={tab.hasMode ? "grid grid-cols-[80px_minmax(0,1fr)] gap-1.5" : ""}>
                  {tab.hasMode && (
                    <div className="relative flex items-center h-8 px-2 zb-field">
                      <select
                        aria-label="Buy or lease"
                        value={commercialMode}
                        onChange={(e) => changeMode(e.target.value)}
                        className="w-full h-full text-[11px] bg-transparent outline-none appearance-none cursor-pointer"
                      >
                        <option value="Buy">Buy</option>
                        <option value="Lease">Lease</option>
                      </select>
                      <FiChevronDown size={11} aria-hidden="true" className="absolute pointer-events-none right-2" style={{ color: "var(--muted)" }} />
                    </div>
                  )}

                  <div className="relative" data-dd>
                    <button
                      type="button"
                      aria-haspopup="listbox"
                      aria-expanded={openDd === "types"}
                      onClick={() => {
                        setOpenDd(openDd === "types" ? null : "types");
                        setShowMoreFilters(false);
                      }}
                      className="flex items-center w-full h-8 px-2 text-left zb-field"
                    >
                      <RiHomeLine size={11} className="shrink-0" style={{ color: "var(--accent)" }} aria-hidden="true" />
                      <span className="flex-1 px-2 text-[11px] truncate">
                        {selectedTypes.length === 0
                          ? tab.all
                          : selectedTypes.length === 1
                            ? selectedTypes[0]
                            : `${selectedTypes.length} types selected`}
                      </span>
                      <FiChevronDown
                        size={11}
                        aria-hidden="true"
                        className={`transition-transform duration-200 ${openDd === "types" ? "rotate-180" : ""}`}
                        style={{ color: "var(--muted)" }}
                      />
                    </button>

                    {openDd === "types" && (
                      <div role="listbox" className="zb-pop absolute left-0 right-0 z-50 mt-1 overflow-y-auto max-h-52">
                        {typeOptions.map((opt) => (
                          <label key={opt} className="zb-dd-item flex items-center gap-2 px-3 py-1.5 text-[11px] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedTypes.includes(opt)}
                              onChange={() => toggleType(opt)}
                              style={{ accentColor: "var(--accent)" }}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                        <div className="sticky bottom-0 flex gap-2 p-2 bg-white border-t" style={{ borderColor: "var(--line)" }}>
                          <button type="button" onClick={() => setSelectedTypes([])} className="flex-1 py-1 text-[10px] border rounded hover:bg-gray-50">
                            Clear
                          </button>
                          <button type="button" onClick={() => setOpenDd(null)} className="zb-btn flex-1 py-1 text-[10px]">
                            Done
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Budget */}
                <div className="relative flex items-center h-8 px-2 zb-field">
                  <span
                    aria-hidden="true"
                    className="flex items-center justify-center w-3.5 h-3.5 text-[8px] text-white rounded-full shrink-0"
                    style={{ background: "var(--accent)" }}
                  >
                    <FaRupeeSign />
                  </span>
                  <select
                    id="budget"
                    name="budget"
                    aria-label="Budget (optional)"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full h-full px-2 text-[11px] bg-transparent outline-none appearance-none cursor-pointer"
                  >
                    <option value="">{isMonthly ? "Budget per month (Optional)" : "Budget (Optional)"}</option>
                    {budgetOptions.map((b) => (
                      <option key={b.value} value={b.value}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown size={11} aria-hidden="true" className="absolute pointer-events-none right-2" style={{ color: "var(--muted)" }} />
                </div>

                {/* 4. More filters */}
                <div className="relative w-full" data-dd>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreFilters((v) => !v);
                      setOpenDd(null);
                    }}
                    className="flex items-center w-full h-8 px-2 text-left zb-field"
                  >
                    <FiSliders size={11} className="shrink-0" style={{ color: "var(--accent)" }} aria-hidden="true" />
                    <span className="flex-1 px-2 text-[11px] truncate">
                      {selectedBhk || selectedFurnishing || selectedConstruction
                        ? `${selectedBhk ? selectedBhk + " " : ""}${selectedFurnishing ? selectedFurnishing + " " : ""}`
                        : "More Filters"}
                    </span>
                    <FiChevronDown
                      size={11}
                      aria-hidden="true"
                      className={`transition-transform duration-200 ${showMoreFilters ? "rotate-180" : ""}`}
                      style={{ color: "var(--muted)" }}
                    />
                  </button>

                  {showMoreFilters && (
                    <div className="zb-pop absolute left-0 right-0 z-50 p-3 mt-1 space-y-2.5 text-[11px]">
                      {showBhk && (
                        <div>
                          <label className="block mb-1 text-[10px] font-semibold">BHK Configuration</label>
                          <div className="flex flex-wrap gap-1">
                            {["1 BHK", "2 BHK", "3 BHK", "4+ BHK"].map((bhk) => (
                              <button
                                key={bhk}
                                type="button"
                                onClick={() => setSelectedBhk(selectedBhk === bhk ? "" : bhk)}
                                className="px-2 py-0.5 text-[10px] rounded-full border transition"
                                style={
                                  selectedBhk === bhk
                                    ? { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" }
                                    : { background: "var(--chip)", color: "var(--ink)", borderColor: "var(--line)" }
                                }
                              >
                                {bhk}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {showFurnishing && (
                        <div>
                          <label className="block mb-1 text-[10px] font-semibold">Furnishing</label>
                          <div className="flex flex-wrap gap-1">
                            {["Fully Furnished", "Semi-Furnished", "Unfurnished"].map((furnish) => (
                              <button
                                key={furnish}
                                type="button"
                                onClick={() => setSelectedFurnishing(selectedFurnishing === furnish ? "" : furnish)}
                                className="px-2 py-0.5 text-[10px] rounded-full border transition"
                                style={
                                  selectedFurnishing === furnish
                                    ? { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" }
                                    : { background: "var(--chip)", color: "var(--ink)", borderColor: "var(--line)" }
                                }
                              >
                                {furnish}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {showConstruction && (
                        <div>
                          <label className="block mb-1 text-[10px] font-semibold">Construction Status</label>
                          <div className="flex flex-wrap gap-1">
                            {["Ready to Move", "Under Construction"].map((status) => (
                              <button
                                key={status}
                                type="button"
                                onClick={() => setSelectedConstruction(selectedConstruction === status ? "" : status)}
                                className="px-2 py-0.5 text-[10px] rounded-full border transition"
                                style={
                                  selectedConstruction === status
                                    ? { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" }
                                    : { background: "var(--chip)", color: "var(--ink)", borderColor: "var(--line)" }
                                }
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {(selectedBhk || selectedFurnishing || selectedConstruction) && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBhk("");
                            setSelectedFurnishing("");
                            setSelectedConstruction("");
                          }}
                          className="w-full pt-1 text-center text-[10px] underline font-medium"
                          style={{ color: "var(--accent)" }}
                        >
                          Reset Filters
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Search button */}
              <button
                type="button"
                className="zb-btn flex items-center justify-center w-full h-9 gap-1.5 mt-3 text-xs font-semibold"
                onClick={() => handleSearch()}
              >
                <span>Search Properties</span>
                <FaArrowRight size={9} aria-hidden="true" />
              </button>

              {error && (
                <div className="mt-2 text-center" role="alert">
                  <span className="inline-block px-2.5 py-1 text-[11px] text-white rounded-md" style={{ background: "var(--ink)" }}>
                    {error}
                  </span>
                </div>
              )}

              {/* Popular cities */}
              <nav aria-label="Popular cities" className="mt-4">
                <p className="flex items-center gap-1.5 mb-2 text-[11px] font-semibold">
                  <FaFire style={{ color: "var(--accent)" }} aria-hidden="true" /> Popular Cities
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {popularCities.map((city) => (
                    <button
                      key={city.name}
                      type="button"
                      onClick={() => addLocation(city.name)}
                      className="zb-pill zb-city-btn px-2.5 py-1 text-[11px] font-semibold cursor-pointer"
                    >
                      {city.name}
                    </button>
                  ))}
                </div>
              </nav>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 2 : DISCOVER PROPERTIES                             */}
      {/* ============================================================ */}
      <section aria-labelledby="discover-heading" className="px-3 pt-6 pb-10 sm:px-5 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-3 mb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="zb-eyebrow">Explore by property type</p>
              <h2 id="discover-heading" className="mt-1.5 text-2xl font-bold zb-serif">
                Discover Properties <span style={{ color: "var(--accent)" }}>Across India</span>
              </h2>
            </div>

            <div className="flex flex-col gap-2.5 md:flex-row md:items-center md:gap-5">
              
              <Link
                to={{ pathname: "/property", state: { propertyType: "Buy" } }}
                className="zb-tile inline-flex items-center self-start gap-1.5 px-3.5 py-1.5 text-[11px] font-semibold whitespace-nowrap no-underline transition hover:no-underline"
                style={{ color: "var(--accent)", borderColor: "var(--accent)" }}
              >
                View All Properties <FaArrowRight size={8} aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
            {typeCards.map((c) => (
              <Link
                key={c.title}
                to={{ pathname: "/property", state: { propertyType: c.type } }}
                aria-label={`${c.title} – ${c.sub}`}
                className="zb-card relative block overflow-hidden no-underline transition hover:-translate-y-1 hover:no-underline"
              >
                <img
                  src={c.img}
                  alt={`${c.title}: ${c.sub}`}
                  className="object-cover w-full h-[104px] sm:h-[117px]"
                  loading="lazy"
                  decoding="async"
                />
                <div
                  className="relative flex items-center gap-2 p-2 mx-2 mb-2 -mt-6 bg-white rounded-lg shadow-lg"
                  style={{ border: "1px solid var(--line)" }}
                >
                  <span
                    aria-hidden="true"
                    className="flex items-center justify-center w-6 h-6 text-[11px] rounded-full shrink-0"
                    style={{ color: "var(--accent)", background: "#F9E4E8" }}
                  >
                    {c.icon}
                  </span>
                  <span className="flex-1 min-w-0 leading-tight">
                    <span className="block text-[11px] font-semibold truncate zb-serif">{c.title}</span>
                    <span className="block text-[10px] truncate" style={{ color: "var(--muted)" }}>
                      {c.sub}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="flex items-center justify-center w-4 h-4 text-[7px] rounded-full border shrink-0"
                    style={{ color: "var(--gold)", borderColor: "var(--gold)" }}
                  >
                    <FaArrowRight />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Search;