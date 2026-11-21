import { API_BASE_URL } from "../config/api";

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MdApartment } from "react-icons/md";
import { AiOutlineClockCircle } from "react-icons/ai";
import { FaBath, FaUser, FaMapMarkerAlt } from "react-icons/fa";
import { RiRuler2Line } from "react-icons/ri";
import { MapContainer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { ZbMapLayers, houseMarkerIcon } from "../containers/ZbMapTools";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Slider from "react-slick";
import { Heart } from "lucide-react";
import { RiArrowDropDownLine } from "react-icons/ri";
import {
  MdOutlineNavigateBefore,
  MdOutlineNavigateNext,
  MdOutlineBedroomParent,
} from "react-icons/md";
import { BiArea } from "react-icons/bi";
import { AiOutlineUser, AiOutlineInfo } from "react-icons/ai";
import { FaWhatsapp, FaPhone, FaRupeeSign } from "react-icons/fa";
import { PiCubeFocus } from "react-icons/pi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShareNodes, faChair } from "@fortawesome/free-solid-svg-icons";
import ShareModal from "../containers/ShareModal";
import ContactDetails from "../containers/ContactDetails";
import Login1 from "../auth/Login1";
import SignUp1 from "../auth/SignUp1";
import { useCity } from "./SearchContext";
import { IoCall } from "react-icons/io5";
// ============================================================
// CONSTANTS
// ============================================================

const API = process.env.REACT_APP_API_URL;
const DEFAULT_CENTER = [18.5204, 73.8567];
const PAGE_SIZE = 10;
const MAX_LOCATIONS = 3;
const PRICE_OPTIONS = [
  ...Array.from({ length: 19 }, (_, i) => (i + 1) * 500000),
  10000000, 12500000, 15000000, 17500000, 20000000, 25000000, 30000000,
  40000000, 50000000, 75000000, 100000000, 150000000, 200000000, 250000000,
  300000000, 400000000, 500000000, 600000000, 700000000, 750000000, 900000000,
  1000000000, 1500000000, 2000000000, 2500000000, 3000000000, 4000000000,
  5000000000, 6000000000, 7000000000, 7500000000, 9000000000, 10000000000,
];

const AREA_UNITS = [
  "sq.ft", "sq.yards", "sq.m", "acre", "marla", "cents", "bigha", "kottah",
  "kanal", "grounds", "ares", "biswa", "guntha", "aankadam", "hectares",
  "rood", "chataks", "perch",
];

const toOpts = (arr) => arr.map((v) => ({ value: v, label: v }));

const CATEGORY_OPTIONS = [
  { value: "Buy", label: "Buy" },
  { value: "Rent", label: "Rent" },
  { value: "Commercial Buy", label: "Commercial Buy" },
  { value: "Commercial Lease", label: "Commercial Lease" },
  { value: "PG/Co-living", label: "PG / Co-living" },
];
const BUILDING_OPTIONS = ["Residential", "Commercial"];
const BHK_OPTIONS = [
  "Studio", "1 RK", "1 BHK", "1.5 BHK", "2 BHK", "2.5 BHK", "3 BHK",
  "3.5 BHK", "4 BHK", "5 BHK", "6+ BHK",
];
const FURNISHED_OPTIONS = ["Furnished", "Semi-Furnished", "Unfurnished"];
const POSTED_BY_OPTIONS = ["Owner", "Builder"];
const FACING_OPTIONS = [
  "North", "East", "North-East", "South-East", "North-West", "West", "South", "South-West",
];
const YES_NO = ["Yes", "No"];

const CONSTRUCTION_OPTS = toOpts(["Ready To Move", "New Launch", "Under Construction"]);
const AVAILABLE_FROM_OPTS = toOpts([
  "Immediately", "Any Time", "Within 1 Month", "After 1 Month", "Within 3 Month", "After 3 Month",
]);
const SHARING_OPTS = toOpts(["Private Rooms", "2 Per Room", "More than 2 per room"]);
const CAPACITY_OPTS = toOpts(["1-2 guest", "2-4 guest", "4-10 guest", "10+ guest"]);
const CAPACITY_MAP = { "1-2 guest": "1-2", "2-4 guest": "2-4", "4-10 guest": "4-10", "10+ guest": "10+" };
const INVESTMENT_OPTS = toOpts([
  "Pre-leased Spaces", "Restaurants", "SCO Plots", "Business Center",
  "Food Court", "Multiplex", "Co-working",
]);
const PURCHASE_TYPES = ["Resale", "New bookings"];
const PLOT_LAND_OPTS = toOpts([
  "Commercial Land/Inst. Land", "Industrial Lands/Plots", "Agricultural/Farm Land",
]);
const OFFICE_OPTS = toOpts([
  "Ready to move office space", "Bare shell office space", "Co-working office space",
]);
const RETAIL_OPTS = toOpts([
  "Mall", "Commercial Project", "Residential Project", "Retail Complex/Building", "Market/High Street",
]);
const OTHER_COMMERCIAL_OPTS = toOpts([
  "Factory", "Ware House", "Hotel Resorts", "Guest-House/Banquet-Halls",
  "Cold Storage", "Manufacturing", "Others",
]);
const COMMERCIAL_BUY_TYPES = [
  "Ready to move office space", "Bare shell office space", "Ware House", "Factory",
  "Hotel/Resorts", "Others", "Plot/Land", "Cold Storage", "Manufacturing",
  "Guest-House/Banquet-Halls", "Retail",
];
const COMMERCIAL_LEASE_TYPES = ["Office Space", "Retail Shops/Showrooms", "Other Commercial spaces", "Plot/Land"];
const BUY_TYPES = [
  "Flat/Apartment", "Home/Villa", "Service Apartment", "Farmhouse", "Plot/Land",
  "Builder Floor", "1RK/Studio Apartment",
];
const RENT_TYPES = [
  "Flat/Apartment", "Builder Floor", "1RK/Studio Apartment", "Independent House/Villa",
  "Service Apartment", "Farmhouse",
];
const PG_TYPES = [
  "Flat/Apartment", "Builder Floor", "1RK/Studio Apartment", "Independent House/Villa", "Service Apartment",
];
const DEFAULT_TYPES = [
  "Apartment", "Flat/Apartment", "Builder Floor", "Independent House/Villa",
  "Independent/Builder Floor", "1RK/Studio Apartment", "Service Apartment", "Farmhouse",
  "Office", "Retail", "Plot/Land", "Storage", "Industry", "Hospitality", "Other", "Home/Villa",
];
const RENT_AVAILABLE_FOR = ["Family", "Single Women", "Single Men", "Company Guest House"];
const PG_AVAILABLE_FOR = ["Boys", "Girls", "Working"];

const INITIAL_FILTERS = {
  propertyCategory: "",
  buildingType: "",
  propertyTypes: [],
  plotLandTypes: [],
  officeType: [],
  retailType: [],
  otherCommercialType: [],
  bhkType: "",
  minPrice: "",
  maxPrice: "",
  furnishedStatus: "",
  postedBy: "",
  constructionStatus: [],
  amenities: [],
  bathrooms: "",
  facing: "",
  withPhoto: "",
  withVideos: "",
  minArea: "",
  maxArea: "",
  areaIn: "sq.ft",
  sharingType: [],
  availableFrom: [],
  availableFor: [],
  capacity: [],
  investmentOptions: [],
  purchaseType: "",
};

// Cleared when the category changes; amenities and construction are kept
const CATEGORY_RESET = {
  propertyTypes: [],
  plotLandTypes: [],
  officeType: [],
  retailType: [],
  otherCommercialType: [],
  availableFrom: [],
  availableFor: [],
  sharingType: [],
  capacity: [],
  investmentOptions: [],
  purchaseType: "",
};

const selectCls =
  "w-full h-8 px-2 text-xs border border-gray-300 rounded-lg bg-white hover:border-[#8B1E3F] focus:outline-none focus:ring-1 focus:ring-[#8B1E3F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
const btnCls =
  "flex items-center justify-between w-full h-8 px-2 text-xs bg-white border border-gray-300 rounded-lg hover:border-[#8B1E3F] focus:outline-none focus:ring-1 focus:ring-[#8B1E3F] transition-colors";
const panelCls =
  "absolute left-0 right-0 z-[999] mt-1 bg-white border border-gray-200 rounded-lg shadow-xl";
const panelSelectCls =
  "w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#8B1E3F]";
const labelCls = "text-xs text-gray-500 mb-1 block";

const STYLE_TEXT = `
  .zb-popup .leaflet-popup-content-wrapper { padding: 0; overflow: hidden; border-radius: 14px; box-shadow: 0 14px 32px -12px rgba(94,13,40,0.35); border: 1px solid #eadfd6; }
  .zb-popup .leaflet-popup-content { margin: 0 !important; width: auto !important; }
  .zb-popup .leaflet-popup-content p { margin: 0; }
  .zb-popup .leaflet-popup-tip { background: #fff; }
  .zb-popup a.leaflet-popup-close-button { top: 8px; right: 8px; width: 26px; height: 26px; line-height: 24px; border-radius: 6px; background: rgba(255,255,255,.95); color: #7a1235; font-size: 18px; text-align: center; padding: 0; z-index: 20; }
  .zb-map .leaflet-top.leaflet-left { top: 8px; left: 8px; }
  .zb-map .leaflet-control-zoom { border: none !important; box-shadow: 0 6px 16px -6px rgba(94,13,40,.4) !important; border-radius: 10px; overflow: hidden; }
  .zb-map .leaflet-control-zoom a { color: #7a1235; background: #fff; border-bottom: 1px solid #eadfd6; width: 34px; height: 34px; line-height: 34px; }
  .zb-map .leaflet-control-zoom a:hover { background: #fbf3ec; color: #5e0d28; }
  .zb-map .leaflet-control-attribution { font-size: 10px; background: rgba(255,255,255,.8); }
  .marker-wrapper { position: relative; display: flex; justify-content: center; align-items: center; }
  .custom-marker { display: flex; align-items: center; justify-content: center; }
  .price-tooltip { position: relative; background: #fff; color: #1f2937; padding: 5px 10px; border-radius: 16px; border: 1px solid #eadfd6; font-size: 12px; font-weight: 700; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,.2); transition: background-color .2s ease, color .2s ease, border-color .2s ease, transform .2s ease; }
  .price-tooltip .pointer { position: absolute; bottom: -7px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 7px solid transparent; border-right: 7px solid transparent; border-top: 7px solid #fff; }
  .custom-marker.active .price-tooltip { background: #7a1235; color: #fff; border-color: #7a1235; transform: scale(1.08); }
  .custom-marker.active .price-tooltip .pointer { border-top-color: #7a1235; }
  .zb-card .slick-slide img { transition: transform .6s ease; }
  .zb-card:hover .slick-slide img { transform: scale(1.05); }
  .zb-card .slick-prev, .zb-card .slick-next { z-index: 5; width: 28px; height: 28px; opacity: 0; transition: opacity .25s ease; }
  .zb-card .slick-prev { left: 8px; }
  .zb-card .slick-next { right: 8px; }
  .zb-card:hover .slick-prev, .zb-card:hover .slick-next { opacity: 1; }
  .zb-card .slick-prev:before, .zb-card .slick-next:before { font-size: 28px; text-shadow: 0 2px 6px rgba(0,0,0,.45); }
`;

// ============================================================
// PURE HELPERS
// ============================================================

const parseCities = (str) =>
  str ? str.split(",").map((c) => c.trim()).filter(Boolean) : [];

const formatPriceMinMax = (value) => {
  const num = Number(value);
  if (num >= 10000000) return (num / 10000000).toFixed(1).replace(/\.0$/, "") + " Cr";
  if (num >= 100000) return (num / 100000).toFixed(1).replace(/\.0$/, "") + " L";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + " K";
  return num;
};

const formatPrice = (price) => {
  const n = Number(price);
  if (!price || Number.isNaN(n) || n <= 0) return "On request";
  if (n >= 10000000) return `₹ ${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹ ${(n / 100000).toFixed(2)} L`;
  if (n >= 1000) return `₹ ${(n / 1000).toFixed(2)} K`;
  return `₹ ${n}`;
};

const formatAmount = (value) => {
  const n = Number(value);
  if (!n) return value || "N/A";
  if (n >= 10000000) return (n / 10000000).toFixed(1).replace(/\.0$/, "") + " Cr";
  if (n >= 100000) return (n / 100000).toFixed(1).replace(/\.0$/, "") + " L";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + " K";
  return String(n);
};

const getCategoryText = (type) => {
  const raw = (type || "").replace(/[\s\-/]+/g, " ").trim().toLowerCase();
  if (raw === "buy") return "FOR BUY";
  if (raw === "rent") return "FOR RENT";
  if (raw.includes("commercial buy")) return "COMMERCIAL BUY";
  if (raw.includes("commercial lease")) return "COMMERCIAL LEASE";
  if (raw.includes("pg") || raw.includes("co living") || raw.includes("coliving")) return "PG / CO-LIVING";
  if (raw.includes("residential")) return "RESIDENTIAL";
  return "UNKNOWN";
};

const getListedPrice = (p) => {
  const primary = p.property_category_type === "Rent" ? p.rent : p.property_price;
  return primary ?? p.property_price ?? p.rent ?? null;
};

const hasValidCoords = (p) =>
  p.latitude != null &&
  p.longitude != null &&
  Number.isFinite(parseFloat(p.latitude)) &&
  Number.isFinite(parseFloat(p.longitude));

const isCommercialLease = (f) =>
  f.propertyCategory === "Commercial Lease" && f.buildingType === "Commercial";

const hasActiveFilters = (f) =>
  Object.entries(f).some(
    ([k, v]) => k !== "areaIn" && (Array.isArray(v) ? v.length > 0 : v !== ""),
  );

const getPropertyTypeOptions = (f) => {
  if (isCommercialLease(f)) return toOpts(COMMERCIAL_LEASE_TYPES);
  if (f.propertyCategory === "Commercial Buy" || f.buildingType === "Commercial")
    return toOpts(COMMERCIAL_BUY_TYPES);
  if (f.propertyCategory === "Buy") return toOpts(BUY_TYPES);
  if (f.propertyCategory === "Rent") return toOpts(RENT_TYPES);
  if (f.propertyCategory === "PG/Co-living") return toOpts(PG_TYPES);
  return toOpts(DEFAULT_TYPES);
};

// Maps commercial selections to the API's property_type / office_type / sub_sub_property_type
const mapCommercialTypes = (f) => {
  const property_type = [];
  const office_type = [];
  const sub_sub_property_type = [];
  const lease = isCommercialLease(f);

  f.propertyTypes.forEach((raw) => {
    const t = raw.trim();
    if (lease) {
      if (t === "Office Space") {
        property_type.push("Office");
        office_type.push(...f.officeType);
      } else if (t === "Retail Shops/Showrooms") {
        property_type.push("Retail");
        sub_sub_property_type.push(...f.retailType);
      } else if (t === "Other Commercial spaces") {
        f.otherCommercialType.forEach((i) =>
          i === "Others" ? sub_sub_property_type.push("Others") : office_type.push(i),
        );
      } else if (t === "Plot/Land") {
        property_type.push("Plot/Land");
        office_type.push(...f.plotLandTypes);
      }
    } else if (t === "Plot/Land") {
      property_type.push("Plot/Land");
      office_type.push(...f.plotLandTypes);
    } else if (t === "Retail") {
      property_type.push("Retail");
    } else if (t === "Others") {
      sub_sub_property_type.push("Others");
    } else {
      office_type.push(t);
    }
  });

  return { property_type, office_type, sub_sub_property_type };
};

// Single source of truth for filter request params (listing and save-search)
const appendFilterParams = (fd, f, { userType, bathroomKey }) => {
  if (f.buildingType) fd.append("building_type", f.buildingType);

  if (f.propertyCategory) {
    const apiCategory =
      f.propertyCategory === "Commercial Buy"
        ? "Buy"
        : f.propertyCategory === "Commercial Lease"
          ? "Rent"
          : f.propertyCategory;
    fd.append("property_category_type", apiCategory);
  }

  const isCommercial = f.propertyCategory === "Commercial Buy" || isCommercialLease(f);
  if (isCommercial) {
    const m = mapCommercialTypes(f);
    if (m.property_type.length) fd.append("property_type", m.property_type.join(","));
    if (m.office_type.length) fd.append("office_type", m.office_type.join(","));
    if (m.sub_sub_property_type.length)
      fd.append("sub_sub_property_type", m.sub_sub_property_type.join(","));
  } else if (f.propertyTypes.length) {
    fd.append("property_type", f.propertyTypes.join(","));
  }

  if (f.bhkType) fd.append("bhk_type", f.bhkType);
  if (f.furnishedStatus) fd.append("furnished_type", f.furnishedStatus);
  if (f.minPrice) fd.append("min_price", f.minPrice);
  if (f.maxPrice) fd.append("max_price", f.maxPrice);
  if (f.minArea) fd.append("min_area", f.minArea);
  if (f.maxArea) fd.append("max_area", f.maxArea);
  if ((f.minArea || f.maxArea) && f.areaIn) fd.append("area_in", f.areaIn);
  if (userType) fd.append("user_type", userType);

  if (f.constructionStatus.length) fd.append("construction_status", f.constructionStatus.join(","));
  if (f.amenities.length) fd.append("amenities", f.amenities.join(","));
  if (f.bathrooms) fd.append(bathroomKey, f.bathrooms);
  if (f.facing) fd.append("facing", f.facing);
  if (f.withPhoto) fd.append("with_photo", f.withPhoto);
  if (f.withVideos) fd.append("with_videos", f.withVideos);

  if (f.availableFor.length) fd.append("available_for", f.availableFor.join(","));
  if (f.sharingType.length) fd.append("sharing_type", f.sharingType.join(","));
  if (f.availableFrom.length) fd.append("available_from", f.availableFrom.join(","));
  if (f.capacity.length)
    fd.append("available_beds", f.capacity.map((c) => CAPACITY_MAP[c]).join(","));
  if (f.investmentOptions.length) fd.append("investment_options", f.investmentOptions.join(","));
  if (f.purchaseType) fd.append("purchase_type", f.purchaseType);
};

const budgetLabel = (f) => {
  if (f.minPrice && f.maxPrice)
    return `${formatPriceMinMax(f.minPrice)} - ${formatPriceMinMax(f.maxPrice)}`;
  if (f.minPrice) return `Above ${formatPriceMinMax(f.minPrice)}`;
  if (f.maxPrice) return `Below ${formatPriceMinMax(f.maxPrice)}`;
  return "Budget";
};

const areaLabel = (f) =>
  f.minArea || f.maxArea ? `${f.minArea || 0} - ${f.maxArea || "Any"} ${f.areaIn}` : "Area";

const getPaginationRange = (current, total) => {
  const range = [];
  const groupSize = 3;
  const groupStart = Math.floor((current - 1) / groupSize) * groupSize + 1;
  const groupEnd = Math.min(groupStart + groupSize - 1, total);
  for (let i = groupStart; i <= groupEnd; i++) range.push(i);
  if (groupEnd < total) range.push("...", total);
  return range;
};

const fallbackCopy = (text) => {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(ta);
  ok ? toast.success("Link copied!") : toast.error("Copy failed");
};

// Google Maps loads once per page, shared by every mount
let mapsPromise = null;
const loadGoogleMaps = () => {
  if (window.google?.maps?.places) return Promise.resolve();
  if (!mapsPromise) {
    mapsPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_KEY}&libraries=places`;
      s.async = true;
      s.onload = resolve;
      s.onerror = () => {
        mapsPromise = null;
        reject(new Error("Google Maps failed to load"));
      };
      document.head.appendChild(s);
    });
  }
  return mapsPromise;
};

// Price markers are cached by label and active state
const iconCache = new Map();
const getPriceIcon = (price, isActive = false) => houseMarkerIcon(isActive);

// ============================================================
// HOOKS
// ============================================================

const useDebouncedValue = (value, delay) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

// ============================================================
// SUB-COMPONENTS
// ============================================================

const MultiDropdown = ({
  id,
  label,
  options,
  selected,
  onToggle,
  onClear,
  openId,
  setOpenId,
  radio = false,
}) => {
  const isOpen = openId === id;
  const picked = options.filter((o) => selected.includes(o.value)).map((o) => o.label);
  const summary =
    picked.length === 0 ? label : picked.length === 1 ? picked[0] : `${picked.length} selected`;

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpenId(isOpen ? null : id)} className={btnCls}>
        <span className="truncate text-gray-700">{summary}</span>
        <RiArrowDropDownLine className="text-lg text-gray-500 shrink-0" />
      </button>

      {isOpen && (
        <div className={`${panelCls} max-h-64 overflow-y-auto`}>
          {options.map((o) => (
            <label
              key={o.value}
              className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-[#8B1E3F]/5"
            >
              <input
                type={radio ? "radio" : "checkbox"}
                name={id}
                checked={selected.includes(o.value)}
                onChange={() => onToggle(o.value)}
                className="accent-[#8B1E3F]"
              />
              {o.label}
            </label>
          ))}
          <div className="sticky bottom-0 flex gap-2 p-2 bg-white border-t">
            <button
              type="button"
              onClick={onClear}
              className="flex-1 py-1.5 text-xs border rounded-md hover:bg-gray-50"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setOpenId(null)}
              className="flex-1 py-1.5 text-xs text-white bg-[#8B1E3F] rounded-md hover:bg-[#7a1a37]"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Skeleton = () => (
  <div className="flex flex-col gap-2 animate-pulse">
    <div className="h-[130px] rounded-xl bg-gray-200" />
    <div className="h-28 rounded-xl bg-gray-100" />
  </div>
);

const userLocation = JSON.parse(sessionStorage.getItem("userLocation"));

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// One-line subtitle such as "2 BHK Flat for Sale in Mayur Colony, Pune"
function getPropertySubtitle(property) {
  const area = property.address_area || "";
  const city = property.city_name || "";
  const location = area.toLowerCase().includes(city.toLowerCase())
    ? area
    : `${area}, ${city}`;

  const type =
    property.property_type === "Office"
      ? "Office Space"
      : property.property_type === "Retail"
        ? "Retail Space"
        : property.property_type || "";

  const category = property.property_category_type || "";

  if (category === "Commercial Buy" || category === "Commercial Lease") {
    return `${type} for ${category === "Commercial Buy" ? "Sale" : "Lease"} in ${location}`;
  }
  if (category.includes("PG") || category.includes("Co-Living") || category.includes("Coliving")) {
    return `${type} for Rent in ${location}`;
  }
  const action = category === "Buy" ? "Sale" : category;
  return `${property.bhk_type} ${type} for ${action} in ${location}`;
}

const MapPanner = ({ target }) => {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), 12), { duration: 0.8 });
  }, [target, map]);
  return null;
};

const PropertyCard = memo(function PropertyCard({
  property: p,
  isHovered,
  onEnter,
  onLeave,
  onFavorite,
  onShare,
  onContact,
}) {
  const [slide, setSlide] = useState(0);
  const images = useMemo(
    () => [p.cover_image, ...(p.property_images || []).map((i) => i.image)].filter(Boolean),
    [p.cover_image, p.property_images],
  );
  const isRent = p.property_category_type === "Rent";
  const duration =
    isRent && p.rent_duration && p.rent_duration !== "N/A" ? ` / ${p.rent_duration}` : "";
  const detailsPath = `/propertydetails/${p._id}`;
  const waText = encodeURIComponent("Hello, I am interested in your property");

  const cardImages = [p.cover_image, ...(p.property_images || []).map((i) => i.image)].filter(Boolean);
  const cardSlide = slide;
  const cardActive = cardSlide % (cardImages.length || 1);
  const cardCat = p.property_category_type || "";
  const cardRent = cardCat === "Rent";
  const cardBuy = cardCat.includes("Buy");
  const cardPG = cardCat.includes("PG");
  const cardCommercial = p.building_type === "Commercial";
  const cardSubtitle = getPropertySubtitle(p);
  const cardDistance =
    userLocation && p.latitude && p.longitude
      ? calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        parseFloat(p.latitude),
        parseFloat(p.longitude),
      ).toFixed(1)
      : null;
  const cardDetailsPath = `/propertydetails/${p._id}`;
  const cardWa = encodeURIComponent("Hello, I am interested in your property");
  return (
    <div
      onClick={(e) => {
        if (e.target.closest("a, button, svg, input, select, textarea, label")) return;
        const link = e.currentTarget.querySelector('a[href^="/propertydetails/"]');
        if (link) link.click();
      }}
      className={`cursor-pointer zb-card group flex flex-col h-full bg-white shadow-lg rounded-2xl overflow-hidden transition-all duration-300 ${isHovered ? "ring-2 ring-[#7a1235] -translate-y-0.5" : "hover:-translate-y-0.5"}`}
      onMouseEnter={() => onEnter(p)}
      onMouseLeave={onLeave}
    >
      {/* Image */}
      <div className="relative w-full">
        <Link to={cardDetailsPath} className="block">
          {cardImages.length > 1 ? (
            <Slider
              dots={false}
              arrows={false}
              infinite
              speed={600}
              slidesToShow={1}
              slidesToScroll={1}
              autoplay
              autoplaySpeed={2800}
              initialSlide={cardSlide}
              beforeChange={(_, next) => setSlide(next)}
            >
              {cardImages.map((src, i) => (
                <div key={`p._id-${i}`}>
                  <img src={src} alt={p.property_name || "Property"} loading="lazy" className="object-cover w-full h-[110px] rounded-t-2xl" />
                </div>
              ))}
            </Slider>
          ) : (
            <img
              src={cardImages[0] || "/image/app.png"}
              alt={p.property_name || "Property"}
              loading="lazy"
              className="object-cover w-full h-[110px] rounded-t-2xl"
            />
          )}
        </Link>

        {p.admin_approval === "Approved" && (
          <div className="absolute top-2 left-2 z-20 pointer-events-none">
            <div className="flex items-center gap-1 bg-[#8B1E3F] text-white rounded-sm shadow-md px-2 py-1">
              <span className="text-[10px] font-bold">✓</span>
              <span className="text-[9.5px] font-semibold leading-none">Verified</span>
            </div>
          </div>
        )}

        <div className="absolute z-20 flex items-center space-x-2 top-2 right-2">
          {p.virtual_tour_availability === "Yes" && (
            <span className="flex items-center gap-1 px-2 py-1 text-[9px] font-normal text-white rounded-full pointer-events-none bg-gray-800/60 backdrop-blur-sm sm:text-[10px]">
              <PiCubeFocus className="text-[12px] text-white" />
              Virtual Tour
            </span>
          )}
          <button
            type="button"
            className="p-2 rounded-full shadow bg-gray-800/60 backdrop-blur-sm"
            onClick={() => onFavorite(p)}
          >
            <Heart
              size={18}
              stroke={p.is_favorite ? "none" : "white"}
              color={p.is_favorite ? "red" : "rgba(75, 85, 99, 0.4)"}
              fill={p.is_favorite ? "red" : "rgba(75, 85, 99, 0.4)"}
              strokeWidth={2}
            />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 z-20 max-w-[70%] pointer-events-none">
          <span className="block px-2 sm:px-3 py-1 text-[9px] sm:text-[10px] font-semibold text-white truncate bg-[#8B1E3F] rounded-se-lg">
            {getCategoryText(cardCat)}
          </span>
        </div>

        {p.mark_as_featured === "Yes" && (
          <div className="absolute bottom-0 right-0 z-20 pointer-events-none">
            <span className="px-2 py-1 text-[9px] sm:text-[10px] sm:px-3 text-white bg-yellow-500 rounded-ss-lg">
              FEATURED
            </span>
          </div>
        )}

        {cardImages.length > 1 && (
          <div className="absolute z-10 flex gap-1 pointer-events-none bottom-2 left-1/2 -translate-x-1/2">
            {cardImages.map((_, i) => (
              <span
                key={i}
                className="h-1 rounded-full transition-all duration-300"
                style={{
                  width: i === cardActive ? "12px" : "5px",
                  background: i === cardActive ? "#e3b23c" : "rgba(255,255,255,0.6)",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Details (all on the same card) */}
      <div className="flex flex-col justify-between flex-1 px-3 py-2.5 text-black bg-white sm:px-3.5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <Link to={cardDetailsPath} className="flex-1 min-w-0 no-underline hover:no-underline">
              <h3
                className="m-0 text-[12px] font-semibold leading-5 text-gray-900 truncate hover:text-[#7a1235] transition-colors sm:text-[13.5px]"
                title={p.property_name}
              >
                {p.property_name || "N/A"}
              </h3>
            </Link>
            <span
              className="flex-shrink-0 m-0 text-[9.5px] font-medium leading-5 text-black sm:text-[10px] whitespace-nowrap"
              title={p.furnished_type}
            >
              {p.furnished_type}
            </span>
          </div>

          <p className="mt-0 mb-0.5 text-[10px] leading-4 text-gray-600 line-clamp-2 sm:truncate" title={cardSubtitle}>
            {cardSubtitle}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-0.5 text-[15.5px] font-bold sm:text-[17px] text-[#7a1235]">
                <FaRupeeSign className="text-[12px]" />
                {formatAmount(cardRent ? p.rent : p.property_price)}
              </span>
              {cardRent && p.rent_duration && p.rent_duration !== "N/A" && (
                <span className="text-[10px] text-gray-500">/ {p.rent_duration}</span>
              )}
              {cardBuy && p.possession_status === "Ready To Move" && (
                <div className="flex items-center gap-1 px-2 py-0.5 text-white border rounded-full bg-[#8B1E3F] border-[#8B1E3F]">
                  <MdApartment className="text-[12px] text-white" />
                  <span className="text-[9.5px] font-semibold text-white whitespace-nowrap">Ready to Move</span>
                </div>
              )}
            </div>
            <div className="text-[9.5px] sm:text-[10px] font-medium whitespace-nowrap">
              {cardRent && (
                <>
                  <span className="text-gray-500">Deposit:</span>
                  <span className="ml-1 font-semibold">₹ {p.custom_deposit_amount?.toLocaleString("en-IN")}</span>
                </>
              )}
              {cardBuy && p.possession_status !== "Ready To Move" && p.possession_date && (
                <>
                  <span className="text-gray-500">Possession:</span>
                  <span className="ml-1 font-semibold">
                    {new Date(p.possession_date).toLocaleDateString("en-IN")}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 py-2 border-t border-b border-gray-100">
            <div className="flex items-center gap-2 px-1 min-w-0 sm:px-3">
              <MdApartment className="text-[13px] sm:text-[15.5px] text-gray-700 flex-shrink-0" />
              <div className="flex flex-col justify-center min-w-0">
                <p className="m-0 text-[9.5px] font-semibold leading-4 truncate sm:text-[10px]">
                  {cardCommercial
                    ? p.property_type === "Office"
                      ? "Office Space"
                      : p.property_type === "Retail"
                        ? "Retail Space"
                        : p.property_type
                    : cardPG
                      ? `${p.bathroom || 0} Bathrooms`
                      : p.bhk_type}
                </p>
                <p className="m-0 text-[9px] sm:text-[10px] leading-4 text-gray-500 truncate">
                  {cardCommercial ? "Property Type" : cardPG ? "Bathrooms" : p.property_type}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-1 border-l border-gray-200 min-w-0 sm:px-3">
              {cardPG ? (
                <FaUser className="text-[12px] sm:text-[13.5px] text-gray-700 flex-shrink-0" />
              ) : (
                <FaBath className="text-[12px] sm:text-[13.5px] text-gray-700 flex-shrink-0" />
              )}
              <div className="flex flex-col justify-center min-w-0">
                <p className="m-0 text-[9.5px] font-semibold leading-4 truncate sm:text-[10px]">
                  {cardPG ? p.available_for : `${p.bathroom || 0} Baths`}
                </p>
                <p className="m-0 text-[9px] sm:text-[10px] leading-4 text-gray-500 truncate">
                  {cardPG ? "Available For" : "Bathrooms"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-1 border-l border-gray-200 min-w-0 sm:px-3">
              <RiRuler2Line className="text-[13px] sm:text-[15.5px] text-gray-700 flex-shrink-0" />
              <div className="flex flex-col justify-center min-w-0">
                <p className="m-0 text-[9.5px] font-semibold leading-4 truncate sm:text-[10px]">
                  {p.area} {p.area_in}
                </p>
                <p className="m-0 text-[9px] sm:text-[10px] leading-4 text-gray-500 truncate">Built Up Area</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 pb-1 text-[9.5px] sm:text-[10px] text-gray-600">
            <div className="flex items-center flex-wrap min-w-0 gap-x-1">
              <div className="flex items-center min-w-0">
                <AiOutlineClockCircle className="mr-1 text-[13px] text-gray-700 flex-shrink-0" />
                <span className="truncate">Posted by {p.user_type || "Owner"}</span>
              </div>
              <span className="mx-1 text-gray-400 sm:mx-2">•</span>
              <span className="whitespace-nowrap">
                {p.days_since_created ? `${p.days_since_created} days ago` : "Recently"}
              </span>
              {cardDistance && (
                <>
                  <span className="mx-1 text-gray-400 sm:mx-2">•</span>
                  <div className="flex items-center whitespace-nowrap">
                    <FaMapMarkerAlt className="mr-1 text-red-500" />
                    {cardDistance} km from you
                  </div>
                </>
              )}
            </div>
            <button
              type="button"
              aria-label="Share property"
              className="ml-2 p-1 text-gray-500 hover:text-[#7a1235] transition-colors flex-shrink-0"
              onClick={() => onShare(p)}
            >
              <FontAwesomeIcon icon={faShareNodes} className="text-[13px]" />
            </button>
          </div>

          <div className="flex items-center pt-2">
            <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 overflow-hidden rounded-full bg-blue-100 sm:w-9 sm:h-9">
              {p.property_owner_image && !p.property_owner_image.includes("default_profile") ? (
                <img
                  src={`${process.env.REACT_APP_API_URL}/media/${p.property_owner_image}`}
                  alt={p.connect_to_name || "Owner"}
                  loading="lazy"
                  className="object-cover w-full h-full rounded-full"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <AiOutlineUser className="text-[17px] text-blue-600" />
              )}
            </div>
            <div className="flex items-center min-w-0 ml-3 sm:ml-4">
              <span className="text-[12px] font-semibold text-gray-900 truncate whitespace-nowrap" title={p.connect_to_name}>
                {p.connect_to_name || "Owner"}
              </span>
              <div className="w-px h-4 mx-3 bg-gray-300 sm:mx-4"></div>
              <span className="text-[12px] text-gray-500 whitespace-nowrap">{p.user_type || "Owner"}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5 pt-2 mt-2">
          <button
            type="button"
            className="flex items-center justify-center h-8 text-[9.5px] font-semibold text-white rounded-lg bg-[#7a1235] hover:bg-[#5e0d28] active:scale-95 transition-all"
            onClick={() => onContact(p)}
          >
            Contact
          </button>
          <a
            href={`https://wa.me/91${p.connect_to_no}?text=${cardWa}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-1 h-8 text-[9.5px] font-semibold text-white rounded-lg bg-[#25D366] hover:brightness-110 active:scale-95 transition-all"
          >
            <FaWhatsapp className="text-[12px]" />
            WhatsApp
          </a>
          {p.connect_to_no && (
            <a
              href={`tel:+91${p.connect_to_no}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-1 h-8 text-[9.5px] font-semibold text-[#7a1235] rounded-lg border border-[#7a1235] bg-white hover:bg-[#7a1235] hover:text-[#7a1235] active:scale-95 transition-all"
            >
              <IoCall className="text-[10px]" />
              Call
            </a>
          )}
        </div>
      </div>
    </div>
  );
});

// Preview card shown on marker hover: gallery, price, specs, address
const MarkerPopup = ({ p, onFavorite, onEnter, onLeave }) => {
  const images = useMemo(
    () => [p.cover_image, ...(p.property_images || []).map((i) => i.image)].filter(Boolean),
    [p.cover_image, p.property_images],
  );
  const [idx, setIdx] = useState(0);
  const count = images.length || 1;
  const src = images[idx % count] || p.cover_image;

  const step = (e, dir) => {
    e.stopPropagation();
    setIdx((i) => (i + dir + count) % count);
  };

  const isRent = p.property_category_type === "Rent";
  const duration =
    isRent && p.rent_duration && p.rent_duration !== "N/A" ? ` / ${p.rent_duration}` : "";
  const specs = [p.bhk_type, p.city_name, p.area_sq ? `${p.area_sq} sq ft` : null].filter(Boolean);

  return (
    <div
      onClick={(e) => {
        if (e.target.closest("a, button, svg, input, select, textarea, label")) return;
        const link = e.currentTarget.querySelector('a[href^="/propertydetails/"]');
        if (link) link.click();
      }} className="cursor-pointer w-[240px] sm:w-[280px] bg-white" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <div className="relative h-[170px] bg-slate-900">
        <img src={src} alt={p.property_name || "Property"} loading="lazy" className="w-full h-full object-cover" />

        <button
          type="button"
          aria-label={p.is_favorite ? "Remove from favourites" : "Add to favourites"}
          onClick={(e) => {
            e.stopPropagation();
            onFavorite(p);
          }}
          className="absolute z-10 top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-white/90 shadow hover:bg-white"
        >
          <Heart
            size={16}
            color={p.is_favorite ? "#e11d48" : "#7a1235"}
            fill={p.is_favorite ? "#e11d48" : "transparent"}
            strokeWidth={2}
          />
        </button>

        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={(e) => step(e, -1)}
              className="absolute top-1/2 left-1.5 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-white/90 hover:bg-white text-[12px]"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={(e) => step(e, 1)}
              className="absolute top-1/2 right-1.5 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-white/90 hover:bg-white text-[12px]"
            >
              ›
            </button>
          </>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-baseline gap-0.5 text-[13.5px] font-bold text-[#7a1235]">
            <FaRupeeSign className="text-[10px] self-center" />
            {formatAmount(getListedPrice(p))}
            {duration && <span className="text-[9px] font-medium text-gray-500">{duration}</span>}
          </span>
          <Link
            to={`/propertydetails/${p._id}`}
            aria-label="View details"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-[#7a1235] text-white hover:bg-[#5e0d28]"
          >
            <AiOutlineInfo />
          </Link>
        </div>

        <div className="mt-1 text-[10px] font-semibold text-gray-800 truncate">{p.property_name}</div>
        {specs.length > 0 && (
          <div className="text-[9.5px] text-gray-600 truncate">{specs.join(" | ")}</div>
        )}
        <div className="text-[9.5px] text-gray-500 truncate">
          {p.address_area || p.address || "No Address Provided"}
        </div>
      </div>
    </div>
  );
};

// Marker: hover opens the preview card; the card stays open while the cursor is on it
const PropertyMarker = memo(function PropertyMarker({
  property: p,
  isActive,
  onHover,
  onLeave,
  onFavorite,
}) {
  const markerRef = useRef(null);
  const closeTimer = useRef(null);

  const openCard = () => {
    clearTimeout(closeTimer.current);
    markerRef.current?.openPopup();
  };
  const scheduleClose = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => markerRef.current?.closePopup(), 150);
  };
  const keepOpen = () => clearTimeout(closeTimer.current);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  return (
    <Marker
      ref={markerRef}
      position={[parseFloat(p.latitude), parseFloat(p.longitude)]}
      icon={getPriceIcon(getListedPrice(p), isActive)}
      zIndexOffset={isActive ? 1000 : 0}
      eventHandlers={{
        mouseover: () => {
          onHover(p._id);
          openCard();
        },
        mouseout: () => {
          onLeave();
          scheduleClose();
        },
      }}
    >
      <Popup className="zb-popup" minWidth={240} maxWidth={280} autoPan={false}>
        <MarkerPopup p={p} onFavorite={onFavorite} onEnter={keepOpen} onLeave={scheduleClose} />
      </Popup>
    </Marker>
  );
});

// ============================================================
// MAIN COMPONENT
// ============================================================

const FeaturedDashboard = () => {
  const location = useLocation();
  const propertytype = location.state?.propertyType || "";
  const accessToken = sessionStorage.getItem("accessToken");
  const cityFromSession = sessionStorage.getItem("cityName");
  const { searchCity, setSearchCity } = useCity();

  const selectedLocations = useMemo(
    () => parseCities(searchCity || cityFromSession || ""),
    [searchCity, cityFromSession],
  );
  const cities = selectedLocations.join(", ");
  const canAddLocation = selectedLocations.length < MAX_LOCATIONS;

  // ---------- State ----------
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [amenitiesList, setAmenitiesList] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [locationInput, setLocationInput] = useState("");
  const [hoveredId, setHoveredId] = useState(null);
  const [panTarget, setPanTarget] = useState(null);
  const [counts, setCounts] = useState({ free: 0, paid: 0 });
  const [contact, setContact] = useState({ open: false, property: null, upgrade: false });
  const [share, setShare] = useState({ open: false, url: "" });
  const [authModal, setAuthModal] = useState(null); // "login" | "signup" | null

  const locationInputRef = useRef(null);
  const filterBarRef = useRef(null);
  const addLocationRef = useRef(() => { });

  // ---------- Query (debounced so typing and rapid clicks make one request) ----------
  const queryKey = JSON.stringify({
    propertytype,
    accessToken,
    cities,
    filters,
    page,
    reloadKey,
  });
  const debouncedKey = useDebouncedValue(queryKey, 300);

  useEffect(() => {
    const q = JSON.parse(debouncedKey);
    const f = q.filters;
    const controller = new AbortController();
    const { signal } = controller;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        let res;
        if (hasActiveFilters(f)) {
          // Filtered view: same filter contract as Search, limited to featured listings
          const fd = new FormData();
          fd.append("customer_id", q.accessToken || "");
          fd.append("page", q.page);
          fd.append("page_size", PAGE_SIZE);
          fd.append("mark_as_featured", "Yes");
          if (q.cities) fd.append("city_name", q.cities);
          appendFilterParams(fd, f, {
            userType: f.postedBy,
            bathroomKey: "no_of_bathrooms",
          });
          res = await axios.post(`${API}/cust_api/filter_property`, fd, { signal });
        } else {
          // Default featured feed
          res = await axios.post(
            `${API}/cust_api/get_featured_property`,
            {
              user_id: q.accessToken,
              property_category_type: q.propertytype,
              page: q.page,
              page_size: PAGE_SIZE,
              city_name: q.cities,
            },
            { signal },
          );
        }

        if (signal.aborted) return;
        if (res.data?.status === 1) {
          setItems(res.data.data || []);
          setTotalPages(res.data.total_pages || 1);
        } else {
          setItems([]);
          setTotalPages(1);
          setError("No properties available");
        }
      } catch (err) {
        if (axios.isCancel(err) || signal.aborted) return;
        setItems([]);
        setTotalPages(1);
        setError(err?.response?.data?.message || "Failed to load properties.");
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    };

    run();
    return () => controller.abort();
  }, [debouncedKey]);

  // ---------- Amenities (once) ----------
  useEffect(() => {
    axios
      .post(`${API_BASE_URL}/cust_api/get_amenities`, new FormData())
      .then((res) => {
        if (res.data?.status === 1) setAmenitiesList(res.data.data || []);
      })
      .catch((err) => console.log("Amenities fetch failed", err));
  }, []);

  // ---------- Derived ----------
  const visible = useMemo(() => items.filter(hasValidCoords), [items]);
  const mapCenter = visible.length
    ? [parseFloat(visible[0].latitude), parseFloat(visible[0].longitude)]
    : DEFAULT_CENTER;

  const isCL = isCommercialLease(filters);
  const isCB = filters.propertyCategory === "Commercial Buy";
  const isRent = filters.propertyCategory === "Rent";
  const isPG = filters.propertyCategory === "PG/Co-living";
  const showPlotLand = (isCB || isCL) && filters.propertyTypes.includes("Plot/Land");
  const showFacing = filters.propertyTypes.includes("Plot/Land") || filters.plotLandTypes.length > 0;

  const propertyTypeOptions = useMemo(
    () => getPropertyTypeOptions(filters),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters.propertyCategory, filters.buildingType],
  );
  const amenityOptions = useMemo(
    () => amenitiesList.map((a) => ({ value: String(a._id), label: a.amenity_name })),
    [amenitiesList],
  );
  const availableForOptions = useMemo(() => {
    if (isRent) return toOpts(RENT_AVAILABLE_FOR);
    if (isPG) return toOpts(PG_AVAILABLE_FOR);
    return [];
  }, [isRent, isPG]);

  // ---------- Filter handlers ----------
  const closeDropdown = useCallback(() => setOpenDropdown(null), []);
  const toggleOpen = useCallback((id) => setOpenDropdown((cur) => (cur === id ? null : id)), []);

  // Close an open dropdown when clicking outside the filter bar
  useEffect(() => {
    if (!openDropdown) return;
    const onDown = (e) => {
      if (filterBarRef.current && !filterBarRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [openDropdown]);

  const patchFilters = useCallback((patch) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  }, []);

  const toggleList = useCallback((key, value) => {
    setFilters((prev) => {
      const cur = prev[key];
      return {
        ...prev,
        [key]: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value],
      };
    });
    setPage(1);
  }, []);

  const clearList = useCallback((key) => patchFilters({ [key]: [] }), [patchFilters]);

  const togglePropertyType = useCallback((type) => {
    setFilters((prev) => {
      const next = isCommercialLease(prev)
        ? [type]
        : prev.propertyTypes.includes(type)
          ? prev.propertyTypes.filter((t) => t !== type)
          : [...prev.propertyTypes, type];
      return {
        ...prev,
        propertyTypes: next,
        plotLandTypes: next.includes("Plot/Land") ? prev.plotLandTypes : [],
      };
    });
    setPage(1);
  }, []);

  const handleCategoryChange = (value) => {
    const commercial = value === "Commercial Buy" || value === "Commercial Lease";
    patchFilters({
      ...CATEGORY_RESET,
      propertyCategory: value,
      buildingType: commercial ? "Commercial" : "",
    });
  };

  const stepBathrooms = (delta) => {
    const cur = parseInt(filters.bathrooms, 10) || 0;
    const next = Math.min(20, Math.max(0, cur + delta));
    patchFilters({ bathrooms: next === 0 && delta < 0 ? "" : String(next) });
  };

  const handleBathroomInput = (e) => {
    const v = e.target.value;
    if (v === "") return patchFilters({ bathrooms: "" });
    const n = parseInt(v, 10);
    if (!Number.isNaN(n) && n >= 0 && n <= 20) patchFilters({ bathrooms: String(n) });
  };

  const handleReset = () => {
    setFilters(INITIAL_FILTERS);
    setPage(1);
    setOpenDropdown(null);
  };

  const goToPage = useCallback(
    (n) => {
      if (n >= 1 && n <= totalPages) {
        setPage(n);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [totalPages],
  );

  // ---------- Location bar ----------
  const addLocation = useCallback(
    (name) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      if (selectedLocations.includes(trimmed)) {
        setLocationInput("");
        return;
      }
      if (selectedLocations.length >= MAX_LOCATIONS) {
        toast.error(`You can select a maximum of ${MAX_LOCATIONS} locations.`);
        return;
      }
      setSearchCity([...selectedLocations, trimmed].join(", "));
      setPage(1);
      setLocationInput("");
    },
    [selectedLocations, setSearchCity],
  );
  addLocationRef.current = addLocation;

  const removeLocation = (loc) => {
    setSearchCity(selectedLocations.filter((l) => l !== loc).join(", "));
    setPage(1);
  };

  const handleLocationKeyDown = (e) => {
    if (e.key === "Enter" && locationInput.trim()) {
      e.preventDefault();
      addLocation(locationInput);
    }
  };

  useEffect(() => {
    if (!canAddLocation) return;
    let cancelled = false;
    let ac = null;
    loadGoogleMaps()
      .then(() => {
        if (cancelled || !locationInputRef.current) return;
        ac = new window.google.maps.places.Autocomplete(locationInputRef.current, {
          types: ["(cities)"],
          componentRestrictions: { country: "in" },
        });
        ac.addListener("place_changed", () => {
          const place = ac.getPlace();
          if (place?.name) addLocationRef.current(place.name);
        });
      })
      .catch(() => { });
    return () => {
      cancelled = true;
      if (ac) window.google.maps.event.clearInstanceListeners(ac);
    };
  }, [canAddLocation]);

  // ---------- Favourites / counts / contact ----------
  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

  const requireLogin = useCallback(() => {
    if (accessToken) return true;
    setAuthModal("login");
    return false;
  }, [accessToken]);

  const toggleFavorite = useCallback(
    async (p) => {
      if (!requireLogin()) return;
      try {
        if (p.is_favorite) {
          const fd = new FormData();
          fd.append("favorite_id", p.favorite_id);
          await axios.delete(`${API}/cust_api/remove_from_favorite`, { data: fd });
          toast.success("Removed from favourites");
        } else {
          await axios.post(`${API}/cust_api/add_to_favorite`, {
            user_id: accessToken,
            property_id: p._id,
          });
          toast.success("Saved to favourites");
        }
        refresh();
      } catch {
        toast.error("Could not update favourites. Please try again.");
      }
    },
    [accessToken, requireLogin, refresh],
  );

  const refreshCounts = useCallback(async () => {
    if (!accessToken) return;
    try {
      const fd = new FormData();
      fd.append("user_id", accessToken);
      const res = await axios.post(`${API}/cust_api/get_profile`, fd);
      const c = res.data?.count_data;
      if (c) setCounts({ free: c.free_view_count || 0, paid: c.paid_view_count || 0 });
    } catch (err) {
      console.error("Error checking post limits:", err);
    }
  }, [accessToken]);

  useEffect(() => {
    refreshCounts();
  }, [refreshCounts]);

  const handleContactClick = useCallback(
    async (property) => {
      if (!requireLogin()) return;
      const hasCredits = counts.free > 0 || counts.paid > 0;
      if (hasCredits) {
        try {
          const fd = new FormData();
          if (counts.free > 0) fd.append("free_view_count", -1);
          else fd.append("paid_view_count", -1);
          fd.append("user_id", accessToken);
          await axios.post(`${API}/cust_api/add_count`, fd);
          refreshCounts();
        } catch (err) {
          console.error("API error:", err);
        }
      }
      setContact({ open: true, property, upgrade: !hasCredits });
    },
    [accessToken, counts, requireLogin, refreshCounts],
  );

  // ---------- Share ----------
  const openShare = useCallback(
    (p) => setShare({ open: true, url: `${window.location.origin}/propertydetails/${p._id}` }),
    [],
  );
  const closeShare = useCallback(() => setShare((s) => ({ ...s, open: false })), []);
  const copyShare = useCallback(async () => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(share.url);
        toast.success("Link copied!");
        return;
      } catch {
        // fall through to the textarea copy
      }
    }
    fallbackCopy(share.url);
  }, [share.url]);

  // ---------- Save search ----------
  const handleSaveSearch = async () => {
    if (!accessToken) {
      toast.error("Please login first to save search.");
      setAuthModal("login");
      return;
    }
    try {
      const fd = new FormData();
      fd.append("user_id", accessToken);
      fd.append("property_id", items.map((p) => p._id || "").join("|"));
      fd.append("property_name", items.map((p) => p.property_name || "").join("|"));
      fd.append("property_category_type", items.map((p) => p.property_category_type || "").join("|"));
      fd.append("building_type", items.map((p) => p.building_type || "").join("|"));
      fd.append("city_name", cities || cityFromSession || "");
      fd.append("search_keyword", cities);
      appendFilterParams(fd, filters, {
        userType: filters.postedBy,
        bathroomKey: "no_of_bathrooms",
      });

      const res = await fetch(`${API}/cust_api/add_save_search_property`, {
        method: "POST",
        body: fd,
      });
      const result = await res.json();
      if (res.ok && result.status === 1) toast.success("Search saved successfully!");
      else toast.error(result.message || "Failed to save search.");
    } catch (err) {
      console.error("Save Search Error:", err);
      toast.error("Something went wrong.");
    }
  };

  // ---------- Card / map hover ----------
  const handleCardEnter = useCallback((p) => {
    setHoveredId(p._id);
    const lat = parseFloat(p.latitude);
    const lng = parseFloat(p.longitude);
    if (Number.isFinite(lat) && Number.isFinite(lng)) setPanTarget({ lat, lng });
  }, []);
  const handleCardLeave = useCallback(() => setHoveredId(null), []);
  const handleMarkerHover = useCallback((id) => setHoveredId(id), []);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <>
      <style>{STYLE_TEXT}</style>

      {/* ===================== LOCATION BAR ===================== */}


      {/* ===================== FILTERS ===================== */}
      <div
        ref={filterBarRef}
        className="bg-white rounded-xl border border-gray-200 shadow-sm relative z-20 mb-4 mx-4 sm:mx-6"
      >
        <div className="p-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-1.5">
            <select
              value={filters.propertyCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              onFocus={closeDropdown}
              className={selectCls}
              aria-label="Property category"
            >
              <option value="">Property Category</option>
              {CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            <select
              value={filters.buildingType}
              onChange={(e) => patchFilters({ buildingType: e.target.value })}
              onFocus={closeDropdown}
              disabled={isCB || isCL}
              className={selectCls}
              aria-label="Building type"
            >
              <option value="">Building Type</option>
              {BUILDING_OPTIONS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            <MultiDropdown
              id="propertyType"
              label="Property Type"
              options={propertyTypeOptions}
              selected={filters.propertyTypes}
              onToggle={togglePropertyType}
              onClear={() => clearList("propertyTypes")}
              openId={openDropdown}
              setOpenId={setOpenDropdown}
              radio={isCL}
            />

            <div className="relative">
              <button type="button" onClick={() => toggleOpen("budget")} className={btnCls}>
                <span className="truncate text-gray-700">{budgetLabel(filters)}</span>
                <RiArrowDropDownLine className="text-lg text-gray-500" />
              </button>
              {openDropdown === "budget" && (
                <div className={`${panelCls} p-3 space-y-2`}>
                  <div>
                    <label className={labelCls}>Min Price</label>
                    <select
                      value={filters.minPrice}
                      onChange={(e) => patchFilters({ minPrice: e.target.value })}
                      className={panelSelectCls}
                    >
                      <option value="">Min</option>
                      {PRICE_OPTIONS.filter((p) => !filters.maxPrice || p < Number(filters.maxPrice)).map((p) => (
                        <option key={p} value={p}>
                          {formatPriceMinMax(p)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Max Price</label>
                    <select
                      value={filters.maxPrice}
                      onChange={(e) => patchFilters({ maxPrice: e.target.value })}
                      className={panelSelectCls}
                    >
                      <option value="">Max</option>
                      {PRICE_OPTIONS.filter((p) => !filters.minPrice || p > Number(filters.minPrice)).map((p) => (
                        <option key={p} value={p}>
                          {formatPriceMinMax(p)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <select
              value={filters.bhkType}
              onChange={(e) => patchFilters({ bhkType: e.target.value })}
              onFocus={closeDropdown}
              className={selectCls}
              aria-label="BHK"
            >
              <option value="">BHK</option>
              {BHK_OPTIONS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            <div>
              <button
                type="button"
                onClick={() => {
                  setShowMoreFilters((v) => !v);
                  closeDropdown();
                }}
                aria-expanded={showMoreFilters}
                className={`flex items-center justify-center gap-1 w-full h-8 px-2 text-xs font-medium rounded-lg border transition-all ${showMoreFilters
                  ? "bg-[#8B1E3F] text-white border-[#8B1E3F]"
                  : "bg-white text-gray-700 border-gray-300 hover:border-[#8B1E3F] hover:text-[#8B1E3F]"
                  }`}
              >
                <span>More Filters</span>
                <RiArrowDropDownLine
                  className={`text-lg transition-transform ${showMoreFilters ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleReset}
                className="h-8 flex-1 px-2 text-xs font-medium text-[#8B1E3F] border border-[#8B1E3F] rounded-lg hover:bg-[#8B1E3F]/5 transition-colors"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleSaveSearch}
                className="h-8 flex-1 px-2 text-xs font-medium text-white bg-[#8B1E3F] rounded-lg hover:bg-[#7a1a37] transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        {showMoreFilters && (
          <div className="border-t border-gray-200 bg-gray-50/70 p-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
              <select
                value={filters.furnishedStatus}
                onChange={(e) => patchFilters({ furnishedStatus: e.target.value })}
                onFocus={closeDropdown}
                className={selectCls}
                aria-label="Furnished"
              >
                <option value="">Furnished</option>
                {FURNISHED_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>

              <select
                value={filters.postedBy}
                onChange={(e) => patchFilters({ postedBy: e.target.value })}
                onFocus={closeDropdown}
                className={selectCls}
                aria-label="Posted by"
              >
                <option value="">Posted By</option>
                {POSTED_BY_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>

              <MultiDropdown
                id="construction"
                label="Construction"
                options={CONSTRUCTION_OPTS}
                selected={filters.constructionStatus}
                onToggle={(v) => toggleList("constructionStatus", v)}
                onClear={() => clearList("constructionStatus")}
                openId={openDropdown}
                setOpenId={setOpenDropdown}
              />

              <MultiDropdown
                id="amenities"
                label="Amenities"
                options={amenityOptions}
                selected={filters.amenities}
                onToggle={(v) => toggleList("amenities", v)}
                onClear={() => clearList("amenities")}
                openId={openDropdown}
                setOpenId={setOpenDropdown}
              />

              <div className="flex items-center h-8 border border-gray-300 rounded-lg overflow-hidden bg-white hover:border-[#8B1E3F] transition-colors">
                <button
                  type="button"
                  onClick={() => stepBathrooms(-1)}
                  aria-label="Decrease bathrooms"
                  className="w-8 h-full flex items-center justify-center border-r hover:bg-gray-50 text-base"
                >
                  −
                </button>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={filters.bathrooms}
                  onChange={handleBathroomInput}
                  onFocus={closeDropdown}
                  placeholder="Bath"
                  className="w-full h-full text-center text-xs focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => stepBathrooms(1)}
                  aria-label="Increase bathrooms"
                  className="w-8 h-full flex items-center justify-center border-l hover:bg-gray-50 text-base"
                >
                  +
                </button>
              </div>

              {showFacing && (
                <select
                  value={filters.facing}
                  onChange={(e) => patchFilters({ facing: e.target.value })}
                  onFocus={closeDropdown}
                  className={selectCls}
                  aria-label="Facing"
                >
                  <option value="">Facing</option>
                  {FACING_OPTIONS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              )}

              <select
                value={filters.withPhoto}
                onChange={(e) => patchFilters({ withPhoto: e.target.value })}
                onFocus={closeDropdown}
                className={selectCls}
                aria-label="With photo"
              >
                <option value="">With Photo</option>
                {YES_NO.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>

              <select
                value={filters.withVideos}
                onChange={(e) => patchFilters({ withVideos: e.target.value })}
                onFocus={closeDropdown}
                className={selectCls}
                aria-label="With video"
              >
                <option value="">With Video</option>
                {YES_NO.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>

              <div className="relative">
                <button type="button" onClick={() => toggleOpen("area")} className={btnCls}>
                  <span className="truncate text-gray-700">{areaLabel(filters)}</span>
                  <RiArrowDropDownLine className="text-lg text-gray-500" />
                </button>
                {openDropdown === "area" && (
                  <div className={`${panelCls} p-3 space-y-2`}>
                    <select
                      value={filters.areaIn}
                      onChange={(e) => patchFilters({ areaIn: e.target.value })}
                      className="w-full p-2 text-xs border border-gray-300 rounded-md"
                      aria-label="Area unit"
                    >
                      {AREA_UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={filters.minArea}
                      onChange={(e) => patchFilters({ minArea: e.target.value })}
                      placeholder="Min Area"
                      className="w-full p-2 text-xs border border-gray-300 rounded-md"
                    />
                    <input
                      type="number"
                      value={filters.maxArea}
                      onChange={(e) => patchFilters({ maxArea: e.target.value })}
                      placeholder="Max Area"
                      className="w-full p-2 text-xs border border-gray-300 rounded-md"
                    />
                    <button
                      type="button"
                      onClick={closeDropdown}
                      className="w-full py-1.5 text-xs text-white bg-[#8B1E3F] rounded-md hover:bg-[#7a1a37]"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>

              {isRent && (
                <MultiDropdown
                  id="availableFrom"
                  label="Available From"
                  options={AVAILABLE_FROM_OPTS}
                  selected={filters.availableFrom}
                  onToggle={(v) => toggleList("availableFrom", v)}
                  onClear={() => clearList("availableFrom")}
                  openId={openDropdown}
                  setOpenId={setOpenDropdown}
                />
              )}

              {(isRent || isPG) && (
                <MultiDropdown
                  id="availableFor"
                  label="Available For"
                  options={availableForOptions}
                  selected={filters.availableFor}
                  onToggle={(v) => toggleList("availableFor", v)}
                  onClear={() => clearList("availableFor")}
                  openId={openDropdown}
                  setOpenId={setOpenDropdown}
                />
              )}

              {isPG && (
                <MultiDropdown
                  id="sharingType"
                  label="Sharing Type"
                  options={SHARING_OPTS}
                  selected={filters.sharingType}
                  onToggle={(v) => toggleList("sharingType", v)}
                  onClear={() => clearList("sharingType")}
                  openId={openDropdown}
                  setOpenId={setOpenDropdown}
                />
              )}

              {isPG && (
                <MultiDropdown
                  id="capacity"
                  label="Total Capacity"
                  options={CAPACITY_OPTS}
                  selected={filters.capacity}
                  onToggle={(v) => toggleList("capacity", v)}
                  onClear={() => clearList("capacity")}
                  openId={openDropdown}
                  setOpenId={setOpenDropdown}
                />
              )}

              {isCB && (
                <MultiDropdown
                  id="investment"
                  label="Investment Options"
                  options={INVESTMENT_OPTS}
                  selected={filters.investmentOptions}
                  onToggle={(v) => toggleList("investmentOptions", v)}
                  onClear={() => clearList("investmentOptions")}
                  openId={openDropdown}
                  setOpenId={setOpenDropdown}
                />
              )}

              {isCB && (
                <select
                  value={filters.purchaseType}
                  onChange={(e) => patchFilters({ purchaseType: e.target.value })}
                  onFocus={closeDropdown}
                  className={selectCls}
                  aria-label="Purchase type"
                >
                  <option value="">Purchase Type</option>
                  {PURCHASE_TYPES.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              )}

              {showPlotLand && (
                <MultiDropdown
                  id="plotLand"
                  label="Plot/Land Type"
                  options={PLOT_LAND_OPTS}
                  selected={filters.plotLandTypes}
                  onToggle={(v) => toggleList("plotLandTypes", v)}
                  onClear={() => clearList("plotLandTypes")}
                  openId={openDropdown}
                  setOpenId={setOpenDropdown}
                />
              )}

              {isCL && filters.propertyTypes.includes("Office Space") && (
                <MultiDropdown
                  id="officeType"
                  label="Office Type"
                  options={OFFICE_OPTS}
                  selected={filters.officeType}
                  onToggle={(v) => toggleList("officeType", v)}
                  onClear={() => clearList("officeType")}
                  openId={openDropdown}
                  setOpenId={setOpenDropdown}
                />
              )}

              {isCL && filters.propertyTypes.includes("Retail Shops/Showrooms") && (
                <MultiDropdown
                  id="retailType"
                  label="Retail Type"
                  options={RETAIL_OPTS}
                  selected={filters.retailType}
                  onToggle={(v) => toggleList("retailType", v)}
                  onClear={() => clearList("retailType")}
                  openId={openDropdown}
                  setOpenId={setOpenDropdown}
                />
              )}

              {isCL && filters.propertyTypes.includes("Other Commercial spaces") && (
                <MultiDropdown
                  id="otherCommercial"
                  label="Other Commercial Type"
                  options={OTHER_COMMERCIAL_OPTS}
                  selected={filters.otherCommercialType}
                  onToggle={(v) => toggleList("otherCommercialType", v)}
                  onClear={() => clearList("otherCommercialType")}
                  openId={openDropdown}
                  setOpenId={setOpenDropdown}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* ===================== LISTING + MAP ===================== */}
      <div className="flex flex-col p-2 sm:p-5 space-y-4 rounded-2xl bg-[#fbf3ec] mx-4 sm:mx-6 mb-6">
        <div className="flex flex-col bg-white border border-[#eadfd6] shadow-sm rounded-2xl sm:flex-row-reverse relative">
          {/* List */}
          <div className="z-10 flex-1 min-w-0 p-3 sm:p-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {loading ? (
                Array.from({ length: 4 }, (_, i) => <Skeleton key={i} />)
              ) : visible.length > 0 ? (
                visible.map((p) => (
                  <PropertyCard
                    key={p._id}
                    property={p}
                    isHovered={hoveredId === p._id}
                    onEnter={handleCardEnter}
                    onLeave={handleCardLeave}
                    onFavorite={toggleFavorite}
                    onShare={openShare}
                    onContact={handleContactClick}
                  />
                ))
              ) : (
                <div className="py-10 text-center text-gray-700 col-span-full">
                  <p className="m-0">{error || "No properties available at the moment."}</p>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  type="button"
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  aria-label="Previous page"
                  className={`w-9 h-9 flex items-center justify-center rounded-lg border border-[#eadfd6] bg-white text-[#7a1235] transition-colors hover:bg-[#fbf3ec] ${page === 1 ? "opacity-40 cursor-not-allowed" : ""
                    }`}
                >
                  <MdOutlineNavigateBefore className="text-xl" />
                </button>
                {getPaginationRange(page, totalPages).map((n, i) => (
                  <button
                    key={`${n}-${i}`}
                    type="button"
                    onClick={() => n !== "..." && goToPage(n)}
                    className={`min-w-[36px] h-9 px-2 text-sm rounded-lg flex items-center justify-center transition-colors ${page === n ? "bg-[#7a1235] text-white font-semibold" : "text-gray-700 hover:bg-[#fbf3ec]"
                      }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => goToPage(page + 1)}
                  disabled={page === totalPages}
                  aria-label="Next page"
                  className={`w-9 h-9 flex items-center justify-center rounded-lg border border-[#eadfd6] bg-white text-[#7a1235] transition-colors hover:bg-[#fbf3ec] ${page === totalPages ? "opacity-40 cursor-not-allowed" : ""
                    }`}
                >
                  <MdOutlineNavigateNext className="text-xl" />
                </button>
              </div>
            )}
          </div>

          {/* Map */}
          <div className="w-full p-3 h-[300px] sm:h-[calc(100vh-2rem)] sm:w-3/4 md:w-1/2 lg:w-[500px] sm:sticky sm:top-4 sm:self-start">
            <div className="relative w-full h-full overflow-hidden bg-[#fbf3ec] border border-[#eadfd6] rounded-xl zb-map">
              {loading ? (
                <div className="flex items-center justify-center w-full h-full gap-3 text-[#7a1235]">
                  <span className="w-5 h-5 border-2 rounded-full border-[#7a1235] border-t-transparent animate-spin" />
                  <p className="m-0 text-sm font-medium">Loading properties...</p>
                </div>
              ) : (
                <>
                  <div className="absolute z-[1000] px-3 py-1.5 text-xs font-semibold text-white rounded-lg shadow-md pointer-events-none bottom-3 left-3 bg-[#7a1235]">
                    {visible.length} properties on map
                  </div>
                  <MapContainer
                    center={mapCenter}
                    zoom={12}
                    scrollWheelZoom={false}
                    style={{ width: "100%", height: "100%" }}
                  >
                    <ZbMapLayers />
                    <MapPanner target={panTarget} />
                    {visible.map((p) => (
                      <PropertyMarker
                        key={p._id}
                        property={p}
                        isActive={hoveredId === p._id}
                        onHover={handleMarkerHover}
                        onLeave={handleCardLeave}
                        onFavorite={toggleFavorite}
                      />
                    ))}
                  </MapContainer>
                </>
              )}
            </div>
          </div>

          {share.open && (
            <div className="absolute right-0 z-50">
              <ShareModal currentShareUrl={share.url} closeShareModal={closeShare} copyLink={copyShare} />
            </div>
          )}
        </div>

        {contact.open && contact.property && (
          <ContactDetails
            fullName={
              counts.free <= 0 && counts.paid <= 0
                ? `****${contact.property.connect_to_name?.slice(-1) || "N/A"}`
                : contact.property.connect_to_name || "N/A"
            }
            mobile={
              counts.free <= 0 && counts.paid <= 0
                ? `*******${contact.property.connect_to_no?.slice(-3) || "000"}`
                : contact.property.connect_to_no || "N/A"
            }
            showUpgradePrompt={contact.upgrade}
            onClose={() => setContact((c) => ({ ...c, open: false }))}
          />
        )}

        <Login1
          isOpen={authModal === "login"}
          onClose={() => setAuthModal(null)}
          onSwitchToSignUp={() => setAuthModal("signup")}
        />
        <SignUp1
          isOpen={authModal === "signup"}
          onClose={() => setAuthModal(null)}
          onSwitchToLogin={() => setAuthModal("login")}
        />
      </div>
    </>
  );
};

export default FeaturedDashboard;