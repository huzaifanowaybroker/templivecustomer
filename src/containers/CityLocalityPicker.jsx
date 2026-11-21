import React, { useEffect, useRef, useState } from "react";
import { FiMapPin, FiChevronDown, FiX } from "react-icons/fi";

/* Cities where listings are live. Keep in sync with the backend. */
export const LIVE_CITIES = [
  "Mumbai",
  "Pune",
  "Delhi",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
];

const GOOGLE_MAPS_KEY = process.env.REACT_APP_GOOGLE_MAPS_KEY;

/*
 * Two-step location picker.
 *   Step 1: choose a city (required before anything else)
 *   Step 2: search a locality inside that city (optional)
 *
 * onChange receives { city, locality }.
 *   city      -> send as city_name
 *   locality  -> send as search_query ("" means whole city)
 */
const CityLocalityPicker = ({ initialCity = "", initialLocality = "", onChange }) => {
  const [city, setCity] = useState(initialCity);
  const [locality, setLocality] = useState(initialLocality);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mapsReady, setMapsReady] = useState(
    !!(window.google && window.google.maps && window.google.maps.places)
  );
  const serviceRef = useRef(null);
  const sessionRef = useRef(null);
  const requestIdRef = useRef(0);
  const containerRef = useRef(null);

  /* Load Google Places once */
  useEffect(() => {
    if (mapsReady) return undefined;
    let script = document.querySelector("script[data-gmaps]");
    const onLoad = () => setMapsReady(true);
    if (!script) {
      script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places`;
      script.async = true;
      script.setAttribute("data-gmaps", "1");
      document.body.appendChild(script);
    }
    script.addEventListener("load", onLoad);
    return () => script.removeEventListener("load", onLoad);
  }, [mapsReady]);

  useEffect(() => {
    if (mapsReady && window.google && !serviceRef.current) {
      serviceRef.current = new window.google.maps.places.AutocompleteService();
      sessionRef.current = new window.google.maps.places.AutocompleteSessionToken();
    }
  }, [mapsReady]);

  /* Close suggestions on outside click */
  useEffect(() => {
    const close = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  /* Fetch locality suggestions, limited to the chosen city */
  useEffect(() => {
    const q = query.trim();
    if (!city || !mapsReady || !serviceRef.current || q.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return undefined;
    }
    const requestId = ++requestIdRef.current;
    const timer = setTimeout(() => {
      serviceRef.current.getPlacePredictions(
        {
          // Put the city in the query so Google ranks results inside it
          input: `${q} ${city}`,
          componentRestrictions: { country: "in" },
          sessionToken: sessionRef.current,
        },
        (preds, status) => {
          if (requestId !== requestIdRef.current) return;
          const ok = status === window.google.maps.places.PlacesServiceStatus.OK && preds;
          // Keep only results whose address mentions the chosen city
          const inCity = ok
            ? preds.filter((p) => p.description.toLowerCase().includes(city.toLowerCase()))
            : [];
          setSuggestions(inCity.slice(0, 6));
          setShowSuggestions(true);
        }
      );
    }, 250);
    return () => clearTimeout(timer);
  }, [query, city, mapsReady]);

  const emit = (next) => onChange && onChange({ city: next.city, locality: next.locality });

  const handleCityChange = (e) => {
    const next = e.target.value;
    setCity(next);
    setLocality("");
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    emit({ city: next, locality: "" });
  };

  const pickLocality = (pred) => {
    // Use only the main part of the name, e.g. "Powai" instead of "Powai, Mumbai"
    const name = pred.structured_formatting?.main_text || pred.description;
    setLocality(name);
    setQuery("");
    setShowSuggestions(false);
    setSuggestions([]);
    if (window.google && window.google.maps) {
      sessionRef.current = new window.google.maps.places.AutocompleteSessionToken();
    }
    emit({ city, locality: name });
  };

  const clearLocality = () => {
    setLocality("");
    emit({ city, locality: "" });
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-2 w-full">
      {/* Step 1: city */}
      <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-md">
        <FiMapPin className="text-[#700c28] shrink-0" size={16} aria-hidden="true" />
        <select
          aria-label="Select city"
          value={city}
          onChange={handleCityChange}
          className="flex-1 min-w-0 text-sm text-gray-700 bg-transparent outline-none cursor-pointer"
        >
          <option value="">1. Select a city</option>
          {LIVE_CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <FiChevronDown className="text-gray-400 shrink-0" size={14} aria-hidden="true" />
      </div>

      {/* Step 2: locality, enabled only after a city is chosen */}
      <div className="relative">
        <div
          className={`flex items-center gap-2 px-3 py-2 border rounded-md bg-white ${
            city ? "border-gray-200" : "border-gray-100 bg-gray-50 opacity-60"
          }`}
        >
          {locality ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-black bg-gray-200 rounded-full">
              {locality}
              <button
                type="button"
                aria-label={`Remove ${locality}`}
                onClick={clearLocality}
                className="text-black hover:text-gray-600"
              >
                <FiX size={11} />
              </button>
            </span>
          ) : (
            <input
              type="text"
              aria-label="Search locality"
              disabled={!city}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && showSuggestions && suggestions.length) {
                  e.preventDefault();
                  pickLocality(suggestions[0]);
                }
                if (e.key === "Escape") setShowSuggestions(false);
              }}
              placeholder={
                city ? `2. Search a locality in ${city} (optional)` : "Select a city first"
              }
              className="flex-1 min-w-0 text-sm text-gray-700 bg-transparent outline-none disabled:cursor-not-allowed"
            />
          )}
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <ul
            role="listbox"
            className="absolute left-0 right-0 z-50 mt-1 overflow-y-auto bg-white border border-gray-100 rounded-md shadow-xl max-h-64 top-full"
          >
            {suggestions.map((pred) => (
              <li key={pred.place_id}>
                <button
                  type="button"
                  onClick={() => pickLocality(pred)}
                  className="flex items-start w-full gap-2 px-3 py-2 text-left hover:bg-gray-50"
                >
                  <FiMapPin size={12} className="mt-0.5 text-[#700c28] shrink-0" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-gray-900 truncate">
                      {pred.structured_formatting?.main_text || pred.description}
                    </span>
                    <span className="block text-xs text-gray-500 truncate">
                      {pred.structured_formatting?.secondary_text || ""}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CityLocalityPicker;
