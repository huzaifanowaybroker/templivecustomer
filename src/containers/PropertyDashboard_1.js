import { API_BASE_URL } from "../config/api";
import React, { memo, useMemo, useState, useEffect, useRef } from "react";
import { MapContainer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { ZbMapLayers, houseMarkerIcon } from "../containers/ZbMapTools";
import { BiRupee, BiArea } from "react-icons/bi";
import { AiOutlineInfo, AiOutlineUser } from "react-icons/ai";
import axios from "axios";
import { useLocation, Link } from "react-router-dom";
import { RiArrowDropDownLine } from "react-icons/ri";
import { MdOutlineNavigateBefore, MdOutlineNavigateNext, MdOutlineBedroomParent } from "react-icons/md";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShareNodes, faChair } from "@fortawesome/free-solid-svg-icons";
import { FaRupeeSign, FaWhatsapp, FaPhone } from "react-icons/fa";
import { PiCubeFocus } from "react-icons/pi";
import ShareModal from "../containers/ShareModal";
import Slider from "react-slick";
import { Heart } from "lucide-react";
import { toast } from "react-toastify";
import Login1 from "../auth/Login1";
import SignUp1 from "../auth/SignUp1";
import { useCity } from "./SearchContext";
import ContactDetails from "../containers/ContactDetails";
import { IoCall } from "react-icons/io5";
// Flies the map to a target point whenever a card is hovered
const MapPanner = ({ target }) => {
  const map = useMap();

  useEffect(() => {
    if (!target) return;
    map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), 12), {
      duration: 0.8,
    });
  }, [target, map]);

  return null;
};

// Preview card shown on marker hover: gallery, price, specs, address
const popupFormatAmount = (value) => {
  const n = Number(value);
  if (!n) return value || "N/A";
  if (n >= 10000000) return (n / 10000000).toFixed(1).replace(/\.0$/, "") + " Cr";
  if (n >= 100000) return (n / 100000).toFixed(1).replace(/\.0$/, "") + " L";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + " K";
  return String(n);
};

const popupListedPrice = (property) => {
  const isRent = property.property_category_type === "Rent";
  const primary = isRent ? property.rent : property.property_price;
  return primary ?? property.property_price ?? property.rent ?? null;
};

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
            {popupFormatAmount(popupListedPrice(p))}
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
  icon,
  zIndexOffset,
  onHover,
  onLeave,
  onFavorite,
}) {
  const markerRef = useRef(null);
  const closeTimer = useRef(null);
  const openedAt = useRef(0);

  const openCard = () => {
    clearTimeout(closeTimer.current);
    openedAt.current = Date.now();
    markerRef.current?.openPopup();
  };
  const scheduleClose = () => {
    clearTimeout(closeTimer.current);
    // When the map auto-pans to fit the popup, the cursor briefly leaves the marker.
    // Give the pan time to finish so the popup doesn't close while it is moving.
    const panGuard = Math.max(0, 900 - (Date.now() - openedAt.current));
    closeTimer.current = setTimeout(() => markerRef.current?.closePopup(), Math.max(150, panGuard));
  };
  const keepOpen = () => clearTimeout(closeTimer.current);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  return (
    <Marker
      ref={markerRef}
      position={[parseFloat(p.latitude), parseFloat(p.longitude)]}
      icon={icon}
      zIndexOffset={zIndexOffset}
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
      <Popup
        className="zb-popup"
        minWidth={240}
        maxWidth={280}
        autoPan={true}
        autoPanPaddingTopLeft={[12, 12]}
        autoPanPaddingBottomRight={[12, 12]}
        keepInView={false}
      >
        <MarkerPopup p={p} onFavorite={onFavorite} onEnter={keepOpen} onLeave={scheduleClose} />
      </Popup>
    </Marker>
  );
});

const PropertyDashboard = () => {
  const [hoveredPropertyId, setHoveredPropertyId] = useState(null);
  const [panTarget, setPanTarget] = useState(null);
  const location = useLocation();
  const propertytype = location.state?.propertyType;
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const { searchCity, setSearchCity } = useCity();
  const [filterRequestId, setFilterRequestId] = useState(0);
  const [locationInput, setLocationInput] = useState("");
  // Ignore responses from requests that a newer request has superseded
  const requestIdRef = useRef(0);
  // searchCity holds the chosen cities as "pune, mumbai" (shared with the navbar)
  const selectedLocations = searchCity
    ? searchCity.split(",").map((c) => c.trim()).filter(Boolean)
    : [];
  const [bhkType, setBhkType] = useState("");
  const [furnishedStatus, setFurnishedStatus] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minSquareFt, setMinSquareFt] = useState("");
  const [maxSquareFt, setMaxSquareFt] = useState("");
  const [filtersApplied, setFiltersApplied] = useState(false);

  const [currentShareUrl, setCurrentShareUrl] = useState("");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [activeShareId, setActiveShareId] = useState(null);
  const [activePropertyId, setActivePropertyId] = useState(null);
  const accessToken = sessionStorage.getItem("accessToken");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [propertyImages, setPropertyImages] = useState([]);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState();
  const itemsPerPage = 10;
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const [selectedProperty, setSelectedProperty] = useState(null);
  const [buildingType, setBuildingType] = useState("");
  const [mode, setMode] = useState("search");
  const [postedBy, setPostedBy] = useState("");
  const [constructionStatus, setConstructionStatus] = useState([]);
  const [amenitiesList, setAmenitiesList] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [bathrooms, setBathrooms] = useState("");
  const [facing, setFacing] = useState("");
  const [withPhoto, setWithPhoto] = useState("");
  const [withVideos, setWithVideos] = useState("");
  const [areaIn, setAreaIn] = useState("sq.ft");
  const [sharingType, setSharingType] = useState([]);
  const [availableFrom, setAvailableFrom] = useState([]);
  const [availableFor, setAvailableFor] = useState([]);
  const [capacity, setCapacity] = useState([]);
  const [investmentOptions, setInvestmentOptions] = useState([]);
  const [purchaseType, setPurchaseType] = useState("");
  const [plotLandTypes, setPlotLandTypes] = useState([]);
  const [officeType, setOfficeType] = useState([]);
  const [retailType, setRetailType] = useState([]);
  const [otherCommercialType, setOtherCommercialType] = useState([]);
  const [propertyType2, setPropertyType2] = useState([]);
  const [freeViewCount, setFreeViewCount] = useState(0);
  const [paidViewCount, setPaidViewCount] = useState(0);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [activeIndexes, setActiveIndexes] = useState({});

  // ========== SINGLE DROPDOWN CONTROL ==========
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (name) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  // ========== OPTIONS ==========
  const officeTypeOptions = [
    "Ready to move office space",
    "Bare shell office space",
    "Co-working office space",
  ];

  const retailTypeOptions = [
    "Mall",
    "Commercial Project",
    "Residential Project",
    "Retail Complex/Building",
    "Market/High Street",
  ];

  const otherCommercialOptions = [
    "Factory",
    "Ware House",
    "Hotel Resorts",
    "Guest-House/Banquet-Halls",
    "Cold Storage",
    "Manufacturing",
    "Others",
  ];

  const commercialPropertyOptions = [
    "Ready to move office space",
    "Bare shell office space",
    "Ware House",
    "Factory",
    "Hotel/Resorts",
    "Others",
    "Plot/Land",
    "Cold Storage",
    "Manufacturing",
    "Guest-House/Banquet-Halls",
    "Retail",
  ];

  const plotLandOptions = [
    "Commercial Land/Inst. Land",
    "Industrial Lands/Plots",
    "Agricultural/Farm Land",
  ];

  const investmentOptionsList = [
    "Pre-leased Spaces",
    "Restaurants",
    "SCO Plots",
    "Business Center",
    "Food Court",
    "Multiplex",
    "Co-working",
  ];

  const purchaseTypeOptions = ["Resale", "New bookings"];

  const priceOptions = [
    500000, 1000000, 1500000, 2000000, 2500000, 3000000, 3500000, 4000000,
    4500000, 5000000, 5500000, 6000000, 6500000, 7000000, 7500000, 8000000,
    8500000, 9000000, 9500000, 10000000, 12500000, 15000000, 17500000,
    20000000, 25000000, 30000000, 40000000, 50000000, 75000000, 100000000,
    150000000, 200000000, 250000000, 300000000, 400000000, 500000000,
    600000000, 700000000, 750000000, 900000000, 1000000000, 1500000000,
    2000000000, 2500000000, 3000000000, 4000000000, 5000000000, 6000000000,
    7000000000, 7500000000, 9000000000, 10000000000,
  ];

  const areaUnits = [
    "sq.ft", "sq.yards", "sq.m", "acre", "marla", "cents", "bigha", "kottah",
    "kanal", "grounds", "ares", "biswa", "guntha", "aankadam", "hectares",
    "rood", "chataks", "perch",
  ];

  // ========== EFFECTS ==========
  // Category chosen in the navbar (Buy / Rent / PG / Plots/Land / Commercial)
  // is applied as the category filter so the dropdown and results match.
  useEffect(() => {
    if (!propertytype) return;
    const navMap = {
      Buy: { propertyType: "Buy" },
      Rent: { propertyType: "Rent" },
      PG: { propertyType: "PG/Co-living" },
      "PG/Co-living": { propertyType: "PG/Co-living" },
      "Plots/Land": { propertyType: "Buy", propertyType2: ["Plot/Land"] },
      Commercial: { propertyType: "Commercial Buy", buildingType: "Commercial" },
    };
    const m = navMap[propertytype] || { propertyType: propertytype };
    setPropertyType(m.propertyType || "");
    setBuildingType(m.buildingType || "");
    setPropertyType2(m.propertyType2 || []);
    setFiltersApplied(true);
    setMode("filter");
  }, [propertytype]);

  useEffect(() => {
    fetchAmenities();
  }, []);

  useEffect(() => {
    if (accessToken) checkPostLimits();
  }, [accessToken]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  useEffect(() => {
    if (!propertyType2.includes("Plot/Land")) {
      setPlotLandTypes([]);
    }
  }, [propertyType2]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".relative")) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setError(null);
    if (filtersApplied) {
      fetchFilteredProperties(currentPage);
    } else {
      fetchProperties(propertytype);
    }
  }, [propertytype, currentPage, accessToken, searchCity, filtersApplied, filterRequestId]);

  // ========== HELPERS ==========
  const formatPriceMinMax = (value) => {
    const num = Number(value);
    if (num >= 10000000) return (num / 10000000).toFixed(1).replace(/\.0$/, "") + " Cr";
    if (num >= 100000) return (num / 100000).toFixed(1).replace(/\.0$/, "") + " L";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + " K";
    return num;
  };
  const formatPrice = (price) => {
    const n = Number(price);
    if (!price || isNaN(n) || n <= 0) return "On request";
    if (n >= 10000000) return `₹ ${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `₹ ${(n / 100000).toFixed(2)} L`;
    if (n >= 1000) return `₹ ${(n / 1000).toFixed(2)} K`;
    return `₹ ${n}`;
  };

  const getPaginationRange = () => {
    const range = [];
    const groupSize = 3;
    const groupStart = Math.floor((currentPage - 1) / groupSize) * groupSize + 1;
    const groupEnd = Math.min(groupStart + groupSize - 1, totalPages);
    for (let i = groupStart; i <= groupEnd; i++) range.push(i);
    if (groupEnd < totalPages) {
      range.push("...");
      range.push(totalPages);
    }
    return range;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // ========== HOVER: CARD <-> MAP ==========
  const handleCardEnter = (property) => {
    setHoveredPropertyId(property._id);
    const lat = parseFloat(property.latitude);
    const lng = parseFloat(property.longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      // new object every time so the map flies even when hovering the same card again
      setPanTarget({ lat, lng });
    }
  };

  const handleCardLeave = () => {
    setHoveredPropertyId(null);
  };

  const isMarkerActive = (id) => id === activePropertyId || id === hoveredPropertyId;

  // ========== TOGGLES ==========
  const toggleAmenity = (id) => {
    const value = String(id);
    setSelectedAmenities((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const togglePropertyType = (type) => {
    if (propertyType === "Commercial Lease" && buildingType === "Commercial") {
      setPropertyType2([type]);
    } else {
      setPropertyType2((prev) =>
        prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type]
      );
    }
  };

  const toggleConstructionStatus = (value) => {
    setConstructionStatus((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const toggleAvailableFor = (value) => {
    setAvailableFor((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const toggleSharingType = (value) => {
    setSharingType((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const toggleAvailableFrom = (value) => {
    setAvailableFrom((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const toggleCapacity = (value) => {
    setCapacity((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const incrementBathrooms = () => {
    setBathrooms((prev) => {
      const current = parseInt(prev) || 0;
      return current < 20 ? String(current + 1) : prev;
    });
  };

  const decrementBathrooms = () => {
    setBathrooms((prev) => {
      const current = parseInt(prev) || 0;
      return current > 0 ? String(current - 1) : "";
    });
  };

  const handleBathroomInput = (e) => {
    const value = e.target.value;
    if (value === "") {
      setBathrooms("");
      return;
    }
    const numericValue = parseInt(value);
    if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 20) {
      setBathrooms(String(numericValue));
    }
  };

  // ========== API CALLS ==========
  const fetchAmenities = async () => {
    try {
      const formData = new FormData();
      const response = await axios.post(
        `${API_BASE_URL}/cust_api/get_amenities`,
        formData
      );
      if (response.data.status === 1) setAmenitiesList(response.data.data);
    } catch (error) {
      console.log("Amenities fetch failed", error);
    }
  };

  const fetchProperties = async (propertytype) => {
    const reqId = ++requestIdRef.current;
    try {
      const payloadKey =
        propertytype === "Commercial" || propertytype === "Residential"
          ? "building_type"
          : propertytype === "Plot/Land"
            ? "property_type"
            : "property_category_type";

      const formData = new FormData();
      formData.append("user_id", accessToken);
      formData.append(payloadKey, propertytype);
      formData.append("page", currentPage);
      formData.append("page_size", itemsPerPage);
      formData.append("city_name", searchCity);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/cust_api/search_location`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (reqId !== requestIdRef.current) return;

      if (response.status === 200 && response.data.status === 1) {
        setProperties(response.data.data);
        setTotalPages(response.data.total_pages || 1);
      } else {
        setError("No properties available");
        setProperties([]);
        setTotalPages(0);
      }
    } catch (error) {
      if (reqId !== requestIdRef.current) return;
      setError("Failed to load properties.");
      setProperties([]);
      setTotalPages(0);
    } finally {
      if (reqId === requestIdRef.current) setLoading(false);
    }
  };

  const fetchFilteredProperties = async (page) => {
    const reqId = ++requestIdRef.current;
    try {
      const formData = new FormData();
      const cityToSend = searchCity && searchCity.trim() !== "" ? searchCity.trim() : "";

      formData.append("customer_id", accessToken);
      if (cityToSend) formData.append("city_name", cityToSend);
      formData.append("page", page);
      formData.append("page_size", itemsPerPage);
      formData.append("search_keyword", search || "");

      if (buildingType) formData.append("building_type", buildingType);

      if (propertyType) {
        const apiPropertyCategory =
          propertyType === "Commercial Buy"
            ? "Buy"
            : propertyType === "Commercial Lease"
              ? "Rent"
              : propertyType;
        formData.append("property_category_type", apiPropertyCategory);
      }

      if (propertyType === "Commercial Lease" && buildingType === "Commercial") {
        const mapped = mapCommercialLeaseTypes({
          propertyType2,
          officeType,
          retailType,
          otherCommercialType,
          plotLandTypes,
        });
        if (mapped.property_type.length > 0)
          formData.append("property_type", mapped.property_type.join(","));
        if (mapped.office_type.length > 0)
          formData.append("office_type", mapped.office_type.join(","));
        if (mapped.sub_sub_property_type.length > 0)
          formData.append("sub_sub_property_type", mapped.sub_sub_property_type.join(","));
      } else if (propertyType === "Commercial Buy") {
        const mapped = mapCommercialTypes(propertyType2);
        if (mapped.property_type.length > 0)
          formData.append("property_type", mapped.property_type.join(","));
        if (mapped.office_type.length > 0)
          formData.append("office_type", mapped.office_type.join(","));
        if (mapped.sub_sub_property_type.length > 0)
          formData.append("sub_sub_property_type", mapped.sub_sub_property_type.join(","));
      } else {
        if (propertyType2.length > 0)
          formData.append("property_type", propertyType2.join(","));
      }

      if (bhkType) formData.append("bhk_type", bhkType);
      if (furnishedStatus) formData.append("furnished_type", furnishedStatus);
      if (minPrice) formData.append("min_price", minPrice);
      if (maxPrice) formData.append("max_price", maxPrice);
      if (minSquareFt) formData.append("min_area", minSquareFt);
      if (maxSquareFt) formData.append("max_area", maxSquareFt);
      if ((minSquareFt || maxSquareFt) && areaIn) formData.append("area_in", areaIn);
      if (postedBy) formData.append("user_type", postedBy);
      if (constructionStatus.length > 0)
        formData.append("construction_status", constructionStatus.join(","));
      if (selectedAmenities.length > 0)
        formData.append("amenities", selectedAmenities.join(","));
      if (bathrooms) formData.append("number_of_minimum_bathrooms", bathrooms);
      if (facing) formData.append("facing", facing);
      if (withPhoto) formData.append("with_photo", withPhoto);
      if (withVideos) formData.append("with_videos", withVideos);
      if (availableFor.length > 0)
        formData.append("available_for", availableFor.join(","));
      if (sharingType.length > 0)
        formData.append("sharing_type", sharingType.join(","));
      if (availableFrom.length > 0)
        formData.append("available_from", availableFrom.join(","));
      if (capacity.length > 0)
        formData.append("available_beds", mapCapacityToBeds(capacity));
      if (investmentOptions.length > 0)
        formData.append("investment_options", investmentOptions.join(","));
      if (purchaseType) formData.append("purchase_type", purchaseType);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/cust_api/filter_property`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (reqId !== requestIdRef.current) return;

      if (response.status === 200 && response.data.status === 1) {
        setProperties(response.data.data);
        setTotalPages(response.data.total_pages || 1);
      } else {
        setProperties([]);
        setTotalPages(0);
        setError("No properties available");
      }
    } catch (error) {
      if (reqId !== requestIdRef.current) return;
      setProperties([]);
      setTotalPages(0);
      setError("Failed to load properties.");
    } finally {
      if (reqId === requestIdRef.current) setLoading(false);
    }
  };

  // Filter changes only bump a counter. The fetch effect runs after the new
  // values are committed, so it never sends the previous filter values.
  const handleAutoApply = () => {
    setFiltersApplied(true);
    setMode("filter");
    setCurrentPage(1);
    setFilterRequestId((n) => n + 1);
  };

  // Multiple locations (max 3), same rules as the search dashboard.
  // The fetch effect reacts to searchCity, so no manual fetch is needed.
  const addLocation = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (selectedLocations.some((l) => l.toLowerCase() === trimmed.toLowerCase())) {
      setLocationInput("");
      return;
    }
    if (selectedLocations.length >= 3) {
      toast.error("You can select a maximum of 3 locations.");
      return;
    }
    setSearchCity([...selectedLocations, trimmed].join(", "));
    setCurrentPage(1);
    setLocationInput("");
  };

  const removeLocation = (loc) => {
    setSearchCity(selectedLocations.filter((l) => l !== loc).join(", "));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setPropertyType("");
    setBuildingType("");
    setBhkType("");
    setFurnishedStatus("");
    setMinPrice("");
    setMaxPrice("");
    setMinSquareFt("");
    setMaxSquareFt("");
    setPostedBy("");
    setConstructionStatus([]);
    setSelectedAmenities([]);
    setBathrooms("");
    setFacing("");
    setWithPhoto("");
    setWithVideos("");
    setPropertyType2([]);
    setAvailableFor([]);
    setSharingType([]);
    setAvailableFrom([]);
    setCapacity([]);
    setInvestmentOptions([]);
    setPurchaseType("");
    setPlotLandTypes([]);
    setOfficeType([]);
    setRetailType([]);
    setOtherCommercialType([]);
    setAreaIn("sq.ft");
    setOpenDropdown(null);
    setFiltersApplied(false);
    setMode("search");
    setCurrentPage(1);
    fetchProperties(propertytype);
  };

  // ========== FAVORITES ==========
  const addToFavorites = async (PropertyId) => {
    if (!accessToken) {
      toast.error("You must be logged in to perform this action");
      return;
    }
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/cust_api/add_to_favorite`, {
        user_id: accessToken,
        property_id: PropertyId,
      });
      fetchProperties(propertytype);
    } catch (error) {
      console.error("Error adding property to favorites:", error);
    }
  };

  const removeFromFavorites = async (favoriteId) => {
    const formData = new FormData();
    formData.append("favorite_id", favoriteId);
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/cust_api/remove_from_favorite`,
        { data: formData }
      );
      if (response.data.status === 1) fetchProperties(propertytype);
    } catch (error) {
      console.error("Error unfavoriting:", error);
    }
  };

  // ========== SHARE ==========
  const openShareModal1 = (url, propertyId) => {
    setCurrentShareUrl(url);
    setActiveShareId(propertyId);
    setIsShareModalOpen(true);
  };

  const handleCloseShareModal = () => {
    setIsShareModalOpen(false);
    setActiveShareId(null);
  };

  // ========== SAVE SEARCH ==========
  const handleSaveSearch = async () => {
    if (!accessToken) {
      toast.error("Please login first to save search.");
      setIsLoginModalOpen(true);
      return;
    }
    try {
      const propertyIds = [];
      const propertyNames = [];
      const propertyCategories = [];
      const buildingTypes = [];

      properties.forEach((prop) => {
        propertyIds.push(prop._id || "");
        propertyNames.push(prop.property_name || "");
        propertyCategories.push(prop.property_category_type || "");
        buildingTypes.push(prop.building_type || "");
      });

      const formData = new FormData();
      formData.append("user_id", accessToken);
      formData.append("property_id", propertyIds.join("|"));
      formData.append("property_name", propertyNames.join("|"));
      formData.append("property_category_type", propertyCategories.join("|"));
      formData.append("building_type", buildingTypes.join("|"));
      formData.append("city_name", searchCity || "");
      formData.append("search_keyword", search || "");

      if (propertyType === "Commercial Lease" && buildingType === "Commercial") {
        const mapped = mapCommercialLeaseTypes({
          propertyType2, officeType, retailType, otherCommercialType, plotLandTypes,
        });
        if (mapped.property_type.length)
          formData.append("property_type", mapped.property_type.join(","));
        if (mapped.office_type.length)
          formData.append("office_type", mapped.office_type.join(","));
        if (mapped.sub_sub_property_type.length)
          formData.append("sub_sub_property_type", mapped.sub_sub_property_type.join(","));
      } else if (propertyType === "Commercial Buy") {
        const mapped = mapCommercialTypes(propertyType2);
        if (mapped.property_type.length)
          formData.append("property_type", mapped.property_type.join(","));
        if (mapped.office_type.length)
          formData.append("office_type", mapped.office_type.join(","));
        if (mapped.sub_sub_property_type.length)
          formData.append("sub_sub_property_type", mapped.sub_sub_property_type.join(","));
      } else if (propertyType2.length > 0) {
        formData.append("property_type", propertyType2.join(","));
      }

      if (bhkType) formData.append("bhk_type", bhkType);
      if (furnishedStatus) formData.append("furnished_type", furnishedStatus);
      if (minPrice) formData.append("min_price", minPrice);
      if (maxPrice) formData.append("max_price", maxPrice);
      if (minSquareFt) formData.append("min_area", minSquareFt);
      if (maxSquareFt) formData.append("max_area", maxSquareFt);
      if (areaIn) formData.append("area_in", areaIn);
      if (postedBy) formData.append("user_type", postedBy);
      if (constructionStatus.length > 0)
        formData.append("construction_status", constructionStatus.join(","));
      if (selectedAmenities.length > 0)
        formData.append("amenities", selectedAmenities.join(","));
      if (bathrooms) formData.append("no_of_bathrooms", bathrooms);
      if (facing) formData.append("facing", facing);
      if (withPhoto) formData.append("with_photo", withPhoto);
      if (withVideos) formData.append("with_videos", withVideos);
      if (availableFor.length > 0)
        formData.append("available_for", availableFor.join(","));
      if (sharingType.length > 0)
        formData.append("sharing_type", sharingType.join(","));
      if (availableFrom.length > 0)
        formData.append("available_from", availableFrom.join(","));
      if (capacity.length > 0)
        formData.append("available_beds", mapCapacityToBeds(capacity));
      if (investmentOptions.length > 0)
        formData.append("investment_options", investmentOptions.join(","));
      if (purchaseType) formData.append("purchase_type", purchaseType);

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/cust_api/add_save_search_property`,
        { method: "POST", body: formData }
      );
      const result = await response.json();
      if (response.ok && result.status === 1) {
        toast.success("Search saved successfully!");
      } else {
        toast.error(result.message || "Failed to save search.");
      }
    } catch (error) {
      console.error("Save Search Error:", error);
      toast.error("Something went wrong.");
    }
  };

  // ========== MAPPING HELPERS ==========
  const shouldShowFacingFilter = () => propertyType2.includes("Plot/Land");

  const getFilteredPropertyTypes = () => {
    if (propertyType === "Commercial Lease" && buildingType === "Commercial") {
      return ["Office Space", "Retail Shops/Showrooms", "Other Commercial spaces", "Plot/Land"];
    }
    if (propertyType === "Commercial Buy" || buildingType === "Commercial") {
      return commercialPropertyOptions;
    }
    if (propertyType === "Buy") {
      return ["Flat/Apartment", "Home/Villa", "Service Apartment", "Farmhouse", "Plot/Land", "Builder Floor", "1RK/Studio Apartment"];
    }
    if (propertyType === "Rent") {
      return ["Flat/Apartment", "Builder Floor", "1RK/Studio Apartment", "Independent House/Villa", "Service Apartment", "Farmhouse"];
    }
    if (propertyType === "PG/Co-living") {
      return ["Flat/Apartment", "Builder Floor", "1RK/Studio Apartment", "Independent House/Villa", "Service Apartment"];
    }
    return [
      "Apartment", "Flat/Apartment", "Builder Floor", "Independent House/Villa",
      "Independent/Builder Floor", "1RK/Studio Apartment", "Service Apartment",
      "Farmhouse", "Office", "Retail", "Plot/Land", "Storage", "Industry",
      "Hospitality", "Other", "Home/Villa",
    ];
  };

  const getAvailableForOptions = () => {
    if (propertyType === "Rent") return ["Family", "Single Women", "Single Men", "Company Guest House"];
    if (propertyType === "PG/Co-living") return ["Boys", "Girls", "Working"];
    return [];
  };

  const mapCapacityToBeds = (capacityArr) => {
    const mapping = {
      "1-2 guest": "1-2",
      "2-4 guest": "2-4",
      "4-10 guest": "4-10",
      "10+ guest": "10+",
    };
    return capacityArr.map((item) => mapping[item]).join(",");
  };

  const mapCommercialTypes = (selectedTypes) => {
    const property_type = [];
    const office_type = [];
    const sub_sub_property_type = [];
    selectedTypes.forEach((item) => {
      const val = item.trim();
      if (val === "Plot/Land") {
        property_type.push("Plot/Land");
        if (plotLandTypes.length > 0) office_type.push(...plotLandTypes);
      } else if (val === "Retail") {
        property_type.push("Retail");
      } else if (val === "Others") {
        sub_sub_property_type.push("Others");
      } else {
        office_type.push(val);
      }
    });
    return { property_type, office_type, sub_sub_property_type };
  };

  const mapCommercialLeaseTypes = ({
    propertyType2, officeType, retailType, otherCommercialType, plotLandTypes,
  }) => {
    let property_type = [];
    let office_type = [];
    let sub_sub_property_type = [];
    propertyType2.forEach((type) => {
      if (type === "Office Space") {
        property_type.push("Office");
        office_type.push(...officeType);
      } else if (type === "Retail Shops/Showrooms") {
        property_type.push("Retail");
        sub_sub_property_type.push(...retailType);
      } else if (type === "Other Commercial spaces") {
        otherCommercialType.forEach((item) => {
          if (item === "Others") sub_sub_property_type.push("Others");
          else office_type.push(item);
        });
      } else if (type === "Plot/Land") {
        property_type.push("Plot/Land");
        if (plotLandTypes.length > 0) office_type.push(...plotLandTypes);
      }
    });
    return { property_type, office_type, sub_sub_property_type, plotLandTypes };
  };

  // ========== CONTACT LIMITS ==========
  const checkPostLimits = async () => {
    try {
      const profileForm = new FormData();
      profileForm.append("user_id", accessToken);
      const profileResponse = await axios.post(
        `${process.env.REACT_APP_API_URL}/cust_api/get_profile`,
        profileForm,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      const countData = profileResponse?.data?.count_data;
      if (countData) {
        setFreeViewCount(countData.free_view_count || 0);
        setPaidViewCount(countData.paid_view_count || 0);
      }
    } catch (error) {
      console.error("Error checking post limits:", error);
    }
  };

  const handleAddCount = async () => {
    try {
      const addCountFormData = new FormData();
      if (freeViewCount > 0) addCountFormData.append("free_view_count", -1);
      else addCountFormData.append("paid_view_count", -1);
      addCountFormData.append("user_id", accessToken);
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/cust_api/add_count`,
        { method: "POST", body: addCountFormData }
      );
      if (response.ok) checkPostLimits();
    } catch (error) {
      console.error("API error:", error);
    }
  };

  const handleContactClick = async (property) => {
    if (!accessToken) {
      setIsLoginModalOpen(true);
      return;
    }
    setSelectedProperty(property);
    if (freeViewCount > 0 || paidViewCount > 0) {
      await handleAddCount();
      setShowUpgradePrompt(false);
      setIsContactModalOpen(true);
    } else {
      setShowUpgradePrompt(true);
      setIsContactModalOpen(true);
    }
  };

  // ========== MAP ICON ==========
  const createCustomIcon = (price, isActive = false) => houseMarkerIcon(isActive);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? propertyImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === propertyImages.length - 1 ? 0 : prev + 1));
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
    const raw = (type || "").replace(/\s+/g, " ").replace(/-/g, " ").replace(/\//g, " ").trim().toLowerCase();
    if (raw === "buy") return "FOR BUY";
    if (raw === "rent") return "FOR RENT";
    if (raw.includes("commercial buy")) return "COMMERCIAL BUY";
    if (raw.includes("commercial lease")) return "COMMERCIAL LEASE";
    if (raw.includes("pg") || raw.includes("co living") || raw.includes("coliving")) return "PG / CO-LIVING";
    if (raw.includes("residential")) return "RESIDENTIAL";
    return "UNKNOWN";
  };

  const getListedPrice = (property) => {
    const isRent = property.property_category_type === "Rent";
    const primary = isRent ? property.rent : property.property_price;
    return primary ?? property.property_price ?? property.rent ?? null;
  };
  return (
    <>
      {/* ===================== FILTERS ===================== */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm relative z-20 mb-4">
        {/* Location bar: multiple cities, max 3 */}
       

        {/* Main Filters Row */}
        <div className="p-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-1.5">

            {/* Category */}
            <div>
              <select
                value={propertyType}
                onChange={(e) => {
                  const val = e.target.value;
                  setPropertyType(val);
                  setPropertyType2([]);
                  setOfficeType([]);
                  setRetailType([]);
                  setOtherCommercialType([]);
                  setPlotLandTypes([]);
                  if (val === "Commercial Buy" || val === "Commercial Lease") {
                    setBuildingType("Commercial");
                  } else {
                    setBuildingType("");
                  }
                  handleAutoApply();
                }}
                onFocus={() => setOpenDropdown(null)}
                className="w-full h-8 px-2 text-xs border border-gray-600 rounded-lg bg-white hover:border-[#8B1E3F] focus:outline-none focus:ring-1 focus:ring-[#8B1E3F] transition-colors"
              >

                <option value="Buy">Buy</option>
                <option value="Rent">Rent</option>
                <option value="Commercial Buy">Commercial Buy</option>
                <option value="Commercial Lease">Commercial Lease</option>
                <option value="PG/Co-living">PG / Co-living</option>
              </select>
            </div>

            {/* Building Type */}
            <div>
              <select
                value={buildingType}
                onChange={(e) => {
                  setBuildingType(e.target.value);
                  handleAutoApply();
                }}
                onFocus={() => setOpenDropdown(null)}
                disabled={
                  propertyType === "Commercial Buy" ||
                  propertyType === "Commercial Lease"
                }
                className="w-full h-8 px-2 text-xs border border-gray-300 rounded-lg bg-white hover:border-[#8B1E3F] focus:outline-none focus:ring-1 focus:ring-[#8B1E3F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <option value="">Building Type</option>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>

            {/* Property Type (Custom Dropdown) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown("propertyType")}
                className="flex items-center justify-between w-full h-8 px-2 text-xs bg-white border border-gray-300 rounded-lg hover:border-[#8B1E3F] focus:outline-none focus:ring-1 focus:ring-[#8B1E3F] transition-colors"
              >
                <span className="truncate text-gray-700">
                  {propertyType2.length > 0
                    ? `${propertyType2.length} selected`
                    : "Property Type"}
                </span>
                <RiArrowDropDownLine className="text-lg text-gray-500" />
              </button>

              {openDropdown === "propertyType" && (
                <div className="absolute left-0 right-0 z-[999] mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  {getFilteredPropertyTypes().map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-[#8B1E3F]/5 cursor-pointer text-sm transition-colors"
                    >
                      <input
                        type={
                          propertyType === "Commercial Lease" &&
                            buildingType === "Commercial"
                            ? "radio"
                            : "checkbox"
                        }
                        checked={propertyType2.includes(type)}
                        onChange={() => {
                          togglePropertyType(type);
                          handleAutoApply();
                        }}
                        className="accent-[#8B1E3F]"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                  <div className="flex gap-2 p-2 border-t sticky bottom-0 bg-white">
                    <button
                      type="button"
                      onClick={() => {
                        setPropertyType2([]);
                        handleAutoApply();
                      }}
                      className="flex-1 py-1.5 text-xs border rounded-md hover:bg-gray-50"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpenDropdown(null)}
                      className="flex-1 py-1.5 text-xs text-white bg-[#8B1E3F] rounded-md hover:bg-[#7a1a37]"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Budget (Custom Dropdown) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown("budget")}
                className="flex items-center justify-between w-full h-8 px-2 text-xs bg-white border border-gray-300 rounded-lg hover:border-[#8B1E3F] focus:outline-none focus:ring-1 focus:ring-[#8B1E3F] transition-colors"
              >
                <span className="truncate text-gray-700">
                  {minPrice && maxPrice
                    ? `${formatPriceMinMax(minPrice)} - ${formatPriceMinMax(maxPrice)}`
                    : minPrice
                      ? `Above ${formatPriceMinMax(minPrice)}`
                      : maxPrice
                        ? `Below ${formatPriceMinMax(maxPrice)}`
                        : "Budget"}
                </span>
                <RiArrowDropDownLine className="text-lg text-gray-500" />
              </button>

              {openDropdown === "budget" && (
                <div className="absolute left-0 right-0 mt-1 p-3 bg-white border border-gray-200 rounded-lg shadow-xl z-[999] space-y-2">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Min Price</label>
                    <select
                      value={minPrice}
                      onChange={(e) => {
                        setMinPrice(e.target.value);
                        handleAutoApply();
                      }}
                      className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#8B1E3F]"
                    >
                      <option value="">Min</option>
                      {priceOptions
                        .filter((price) => !maxPrice || price < maxPrice)
                        .map((price) => (
                          <option key={price} value={price}>
                            {formatPriceMinMax(price)}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Max Price</label>
                    <select
                      value={maxPrice}
                      onChange={(e) => {
                        setMaxPrice(e.target.value);
                        handleAutoApply();
                      }}
                      className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#8B1E3F]"
                    >
                      <option value="">Max</option>
                      {priceOptions
                        .filter((price) => !minPrice || price > minPrice)
                        .map((price) => (
                          <option key={price} value={price}>
                            {formatPriceMinMax(price)}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* BHK */}
            <div>
              <select
                value={bhkType}
                onChange={(e) => {
                  setBhkType(e.target.value);
                  handleAutoApply();
                }}
                onFocus={() => setOpenDropdown(null)}
                className="w-full h-8 px-2 text-xs border border-gray-300 rounded-lg bg-white hover:border-[#8B1E3F] focus:outline-none focus:ring-1 focus:ring-[#8B1E3F] transition-colors"
              >
                <option value="">BHK</option>
                <option value="Studio">Studio</option>
                <option value="1 RK">1 RK</option>
                <option value="1 BHK">1 BHK</option>
                <option value="1.5 BHK">1.5 BHK</option>
                <option value="2 BHK">2 BHK</option>
                <option value="2.5 BHK">2.5 BHK</option>
                <option value="3 BHK">3 BHK</option>
                <option value="3.5 BHK">3.5 BHK</option>
                <option value="4 BHK">4 BHK</option>
                <option value="5 BHK">5 BHK</option>
                <option value="6+ BHK">6+ BHK</option>
              </select>
            </div>

            {/* More Filters Toggle */}
            <div>
              <button
                type="button"
                onClick={() => {
                  setShowMoreFilters(!showMoreFilters);
                  setOpenDropdown(null);
                }}
                className={`flex items-center justify-center gap-1 w-full h-8 px-2 text-xs font-medium rounded-lg border transition-all ${showMoreFilters
                  ? "bg-[#8B1E3F] text-white border-[#8B1E3F]"
                  : "bg-white text-gray-700 border-gray-300 hover:border-[#8B1E3F] hover:text-[#8B1E3F]"
                  }`}
              >
                <span>More Filters</span>
                <RiArrowDropDownLine
                  className={`text-lg transition-transform ${showMoreFilters ? "rotate-180" : ""
                    }`}
                />
              </button>
            </div>

            {/* Reset + Save */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleResetFilters}
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

        {/* ========== MORE FILTERS SECTION ========== */}
        {showMoreFilters && (
          <div className="border-t border-gray-200 bg-gray-50/70 p-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">

              {/* Furnished */}
              <select
                value={furnishedStatus}
                onChange={(e) => {
                  setFurnishedStatus(e.target.value);
                  handleAutoApply();
                }}
                onFocus={() => setOpenDropdown(null)}
                className="h-8 px-2.5 text-xs border border-gray-300 rounded-lg bg-white hover:border-[#8B1E3F] focus:outline-none focus:ring-1 focus:ring-[#8B1E3F] transition-colors"
              >
                <option value="">Furnished</option>
                <option value="Furnished">Furnished</option>
                <option value="Semi-Furnished">Semi-Furnished</option>
                <option value="Unfurnished">Unfurnished</option>
              </select>

              {/* Posted By */}
              <select
                value={postedBy}
                onChange={(e) => {
                  setPostedBy(e.target.value);
                  handleAutoApply();
                }}
                onFocus={() => setOpenDropdown(null)}
                className="h-8 px-2.5 text-xs border border-gray-300 rounded-lg bg-white hover:border-[#8B1E3F] focus:outline-none focus:ring-1 focus:ring-[#8B1E3F] transition-colors"
              >
                <option value="">Posted By</option>
                <option value="Owner">Owner</option>
                <option value="Builder">Builder</option>
              </select>

              {/* Construction Status */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown("construction")}
                  className="flex items-center justify-between w-full h-8 px-2.5 text-xs bg-white border border-gray-300 rounded-lg hover:border-[#8B1E3F] transition-colors"
                >
                  <span className="truncate">
                    {constructionStatus.length > 0
                      ? `${constructionStatus.length} selected`
                      : "Construction"}
                  </span>
                  <RiArrowDropDownLine className="text-base text-gray-500" />
                </button>

                {openDropdown === "construction" && (
                  <div className="absolute left-0 right-0 z-[999] mt-1 bg-white border border-gray-200 rounded-lg shadow-xl">
                    {["Ready To Move", "New Launch", "Under Construction"].map(
                      (option) => (
                        <label
                          key={option}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-[#8B1E3F]/5 cursor-pointer text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={constructionStatus.includes(option)}
                            onChange={() => {
                              toggleConstructionStatus(option);
                              handleAutoApply();
                            }}
                            className="accent-[#8B1E3F]"
                          />
                          {option}
                        </label>
                      )
                    )}
                    <div className="p-2 border-t">
                      <button
                        type="button"
                        onClick={() => setOpenDropdown(null)}
                        className="w-full py-1.5 text-xs text-white bg-[#8B1E3F] rounded-md hover:bg-[#7a1a37]"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Amenities */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown("amenities")}
                  className="flex items-center justify-between w-full h-8 px-2.5 text-xs bg-white border border-gray-300 rounded-lg hover:border-[#8B1E3F] transition-colors"
                >
                  <span className="truncate">
                    {selectedAmenities.length > 0
                      ? `${selectedAmenities.length} amenities`
                      : "Amenities"}
                  </span>
                  <RiArrowDropDownLine className="text-base text-gray-500" />
                </button>

                {openDropdown === "amenities" && (
                  <div className="absolute left-0 right-0 z-[999] mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-52 overflow-y-auto">
                    {amenitiesList.map((item) => (
                      <label
                        key={item._id}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-[#8B1E3F]/5 cursor-pointer text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={selectedAmenities.includes(String(item._id))}
                          onChange={() => {
                            toggleAmenity(item._id);
                            handleAutoApply();
                          }}
                          className="accent-[#8B1E3F]"
                        />
                        {item.amenity_name}
                      </label>
                    ))}
                    <div className="sticky bottom-0 p-2 border-t bg-white">
                      <button
                        type="button"
                        onClick={() => setOpenDropdown(null)}
                        className="w-full py-1.5 text-xs text-white bg-[#8B1E3F] rounded-md hover:bg-[#7a1a37]"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Bathrooms */}
              <div className="flex items-center h-8 border border-gray-300 rounded-lg overflow-hidden bg-white hover:border-[#8B1E3F] transition-colors">
                <button
                  type="button"
                  onClick={() => {
                    decrementBathrooms();
                    handleAutoApply();
                  }}
                  className="w-8 h-full flex items-center justify-center border-r hover:bg-gray-50 text-base"
                >
                  −
                </button>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={bathrooms}
                  onChange={(e) => {
                    handleBathroomInput(e);
                    handleAutoApply();
                  }}
                  onFocus={() => setOpenDropdown(null)}
                  placeholder="Bath"
                  className="w-full h-full text-center text-xs focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    incrementBathrooms();
                    handleAutoApply();
                  }}
                  className="w-8 h-full flex items-center justify-center border-l hover:bg-gray-50 text-base"
                >
                  +
                </button>
              </div>

              {/* Facing */}
              {shouldShowFacingFilter() && (
                <select
                  value={facing}
                  onChange={(e) => {
                    setFacing(e.target.value);
                    handleAutoApply();
                  }}
                  onFocus={() => setOpenDropdown(null)}
                  className="h-8 px-2.5 text-xs border border-gray-300 rounded-lg bg-white hover:border-[#8B1E3F] focus:outline-none focus:ring-1 focus:ring-[#8B1E3F] transition-colors"
                >
                  <option value="">Facing</option>
                  <option value="North">North</option>
                  <option value="East">East</option>
                  <option value="North-East">North-East</option>
                  <option value="South-East">South-East</option>
                  <option value="North-West">North-West</option>
                  <option value="West">West</option>
                  <option value="South">South</option>
                  <option value="South-West">South-West</option>
                </select>
              )}

              {/* With Photo */}
              <select
                value={withPhoto}
                onChange={(e) => {
                  setWithPhoto(e.target.value);
                  handleAutoApply();
                }}
                onFocus={() => setOpenDropdown(null)}
                className="h-8 px-2.5 text-xs border border-gray-300 rounded-lg bg-white hover:border-[#8B1E3F] focus:outline-none focus:ring-1 focus:ring-[#8B1E3F] transition-colors"
              >
                <option value="">With Photo</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>

              {/* With Video */}
              <select
                value={withVideos}
                onChange={(e) => {
                  setWithVideos(e.target.value);
                  handleAutoApply();
                }}
                onFocus={() => setOpenDropdown(null)}
                className="h-8 px-2.5 text-xs border border-gray-300 rounded-lg bg-white hover:border-[#8B1E3F] focus:outline-none focus:ring-1 focus:ring-[#8B1E3F] transition-colors"
              >
                <option value="">With Video</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>

              {/* Area (Custom Dropdown) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown("area")}
                  className="flex items-center justify-between w-full h-8 px-2.5 text-xs bg-white border border-gray-300 rounded-lg hover:border-[#8B1E3F] transition-colors"
                >
                  <span className="truncate">
                    {minSquareFt || maxSquareFt
                      ? `${minSquareFt || 0} - ${maxSquareFt || "Any"} ${areaIn}`
                      : "Area"}
                  </span>
                  <RiArrowDropDownLine className="text-base text-gray-500" />
                </button>

                {openDropdown === "area" && (
                  <div className="absolute left-0 right-0 mt-1 p-3 bg-white border border-gray-200 rounded-lg shadow-xl z-[999] space-y-2">
                    <select
                      value={areaIn}
                      onChange={(e) => {
                        setAreaIn(e.target.value);
                        handleAutoApply();
                      }}
                      className="w-full p-2 text-xs border border-gray-300 rounded-md"
                    >
                      {areaUnits.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={minSquareFt}
                      onChange={(e) => {
                        setMinSquareFt(e.target.value);
                        handleAutoApply();
                      }}
                      placeholder="Min Area"
                      className="w-full p-2 text-xs border border-gray-300 rounded-md"
                    />
                    <input
                      type="number"
                      value={maxSquareFt}
                      onChange={(e) => {
                        setMaxSquareFt(e.target.value);
                        handleAutoApply();
                      }}
                      placeholder="Max Area"
                      className="w-full p-2 text-xs border border-gray-300 rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => setOpenDropdown(null)}
                      className="w-full py-1.5 text-xs text-white bg-[#8B1E3F] rounded-md hover:bg-[#7a1a37]"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>

              {/* PG / Co-living filters */}
              {propertyType === "PG/Co-living" && (
                <>
                  {/* Sharing Type */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => toggleDropdown("sharingType")}
                      className="flex items-center justify-between w-full h-8 px-2.5 text-xs bg-white border border-gray-300 rounded-lg hover:border-[#8B1E3F] transition-colors"
                    >
                      <span className="truncate">
                        {sharingType.length > 0
                          ? `${sharingType.length} selected`
                          : "Sharing Type"}
                      </span>
                      <RiArrowDropDownLine className="text-base text-gray-500" />
                    </button>

                    {openDropdown === "sharingType" && (
                      <div className="absolute left-0 right-0 z-[999] mt-1 bg-white border border-gray-200 rounded-lg shadow-xl">
                        {["Private Rooms", "2 Per Room", "More than 2 per room"].map(
                          (option) => (
                            <label
                              key={option}
                              className="flex items-center gap-2 px-3 py-2 hover:bg-[#8B1E3F]/5 cursor-pointer text-sm"
                            >
                              <input
                                type="checkbox"
                                checked={sharingType.includes(option)}
                                onChange={() => {
                                  toggleSharingType(option);
                                  handleAutoApply();
                                }}
                                className="accent-[#8B1E3F]"
                              />
                              {option}
                            </label>
                          )
                        )}
                        <div className="p-2 border-t">
                          <button
                            type="button"
                            onClick={() => setOpenDropdown(null)}
                            className="w-full py-1.5 text-xs text-white bg-[#8B1E3F] rounded-md hover:bg-[#7a1a37]"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Capacity */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => toggleDropdown("capacity")}
                      className="flex items-center justify-between w-full h-8 px-2.5 text-xs bg-white border border-gray-300 rounded-lg hover:border-[#8B1E3F] transition-colors"
                    >
                      <span className="truncate">
                        {capacity.length > 0
                          ? `${capacity.length} selected`
                          : "Capacity"}
                      </span>
                      <RiArrowDropDownLine className="text-base text-gray-500" />
                    </button>

                    {openDropdown === "capacity" && (
                      <div className="absolute left-0 right-0 z-[999] mt-1 bg-white border border-gray-200 rounded-lg shadow-xl">
                        {["1-2 guest", "2-4 guest", "4-10 guest", "10+ guest"].map(
                          (option) => (
                            <label
                              key={option}
                              className="flex items-center gap-2 px-3 py-2 hover:bg-[#8B1E3F]/5 cursor-pointer text-sm"
                            >
                              <input
                                type="checkbox"
                                checked={capacity.includes(option)}
                                onChange={() => {
                                  toggleCapacity(option);
                                  handleAutoApply();
                                }}
                                className="accent-[#8B1E3F]"
                              />
                              {option}
                            </label>
                          )
                        )}
                        <div className="p-2 border-t">
                          <button
                            type="button"
                            onClick={() => setOpenDropdown(null)}
                            className="w-full py-1.5 text-xs text-white bg-[#8B1E3F] rounded-md hover:bg-[#7a1a37]"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Available From - Rent only */}
              {propertyType === "Rent" && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => toggleDropdown("availableFrom")}
                    className="flex items-center justify-between w-full h-8 px-2.5 text-xs bg-white border border-gray-300 rounded-lg hover:border-[#8B1E3F] transition-colors"
                  >
                    <span className="truncate">
                      {availableFrom.length > 0
                        ? `${availableFrom.length} selected`
                        : "Available From"}
                    </span>
                    <RiArrowDropDownLine className="text-base text-gray-500" />
                  </button>

                  {openDropdown === "availableFrom" && (
                    <div className="absolute left-0 right-0 z-[999] mt-1 bg-white border border-gray-200 rounded-lg shadow-xl">
                      {[
                        "Immediately",
                        "Any Time",
                        "Within 1 Month",
                        "After 1 Month",
                        "Within 3 Month",
                        "After 3 Month",
                      ].map((option) => (
                        <label
                          key={option}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-[#8B1E3F]/5 cursor-pointer text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={availableFrom.includes(option)}
                            onChange={() => {
                              toggleAvailableFrom(option);
                              handleAutoApply();
                            }}
                            className="accent-[#8B1E3F]"
                          />
                          {option}
                        </label>
                      ))}
                      <div className="p-2 border-t">
                        <button
                          type="button"
                          onClick={() => setOpenDropdown(null)}
                          className="w-full py-1.5 text-xs text-white bg-[#8B1E3F] rounded-md hover:bg-[#7a1a37]"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Available For - Rent & PG */}
              {(propertyType === "Rent" || propertyType === "PG/Co-living") && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => toggleDropdown("availableFor")}
                    className="flex items-center justify-between w-full h-8 px-2.5 text-xs bg-white border border-gray-300 rounded-lg hover:border-[#8B1E3F] transition-colors"
                  >
                    <span className="truncate">
                      {availableFor.length > 0
                        ? `${availableFor.length} selected`
                        : "Available For"}
                    </span>
                    <RiArrowDropDownLine className="text-base text-gray-500" />
                  </button>

                  {openDropdown === "availableFor" && (
                    <div className="absolute left-0 right-0 z-[999] mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-52 overflow-y-auto">
                      {getAvailableForOptions().map((option) => (
                        <label
                          key={option}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-[#8B1E3F]/5 cursor-pointer text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={availableFor.includes(option)}
                            onChange={() => {
                              toggleAvailableFor(option);
                              handleAutoApply();
                            }}
                            className="accent-[#8B1E3F]"
                          />
                          {option}
                        </label>
                      ))}
                      <div className="sticky bottom-0 p-2 border-t bg-white">
                        <button
                          type="button"
                          onClick={() => setOpenDropdown(null)}
                          className="w-full py-1.5 text-xs text-white bg-[#8B1E3F] rounded-md hover:bg-[#7a1a37]"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ===================== LISTING + MAP ===================== */}
      <style>{`
        .zb-popup .leaflet-popup-content-wrapper { padding: 0; overflow: hidden; border-radius: 12px; box-shadow: 0 14px 32px -12px rgba(94,13,40,0.35); border: 1px solid #eadfd6; }
        .zb-popup .leaflet-popup-content { margin: 0 !important; width: auto !important; }
        .zb-popup .leaflet-popup-content p { margin: 0; }
        .zb-popup .leaflet-popup-tip { background: #fff; }
        .zb-popup a.leaflet-popup-close-button { top: 8px; right: 8px; width: 26px; height: 26px; line-height: 24px; border-radius: 6px; background: rgba(255,255,255,.95); color: #7a1235; font-size: 18px; text-align: center; padding: 0; z-index: 20; }
        .zb-map .leaflet-top.leaflet-left { top: 8px; left: 8px; }
        .zb-map .leaflet-control-zoom { border: none !important; box-shadow: 0 6px 16px -6px rgba(94,13,40,.4) !important; border-radius: 10px; overflow: hidden; }
        .zb-map .leaflet-control-zoom a { color: #7a1235; background: #fff; border-bottom: 1px solid #eadfd6; width: 34px; height: 34px; line-height: 34px; }
        .zb-map .leaflet-control-zoom a:hover { background: #fbf3ec; color: #5e0d28; }
        .zb-map .leaflet-control-attribution { font-size: 10px; background: rgba(255,255,255,.8); }

        /* Map price markers */
        .marker-wrapper { position: relative; display: flex; justify-content: center; align-items: center; }
        .custom-marker { display: flex; align-items: center; justify-content: center; }
        .price-tooltip { position: relative; background: #fff; color: #1f2937; padding: 5px 10px; border-radius: 16px; border: 1px solid #eadfd6; font-size: 12px; font-weight: 700; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,.2); transition: background-color .2s ease, color .2s ease, border-color .2s ease, transform .2s ease; }
        .price-tooltip .pointer { position: absolute; bottom: -7px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 7px solid transparent; border-right: 7px solid transparent; border-top: 7px solid #fff; }
        .custom-marker.active .price-tooltip { background: #7a1235; color: #fff; border-color: #7a1235; transform: scale(1.08); }
        .custom-marker.active .price-tooltip .pointer { border-top-color: #7a1235; }

        /* Card image zoom + slider arrows */
        .zb-card .slick-slide img { transition: transform .6s ease; }
        .zb-card:hover .slick-slide img { transform: scale(1.05); }
        .zb-card .slick-prev, .zb-card .slick-next { z-index: 5; width: 28px; height: 28px; opacity: 0; transition: opacity .25s ease; }
        .zb-card .slick-prev { left: 8px; }
        .zb-card .slick-next { right: 8px; }
        .zb-card:hover .slick-prev, .zb-card:hover .slick-next { opacity: 1; }
        .zb-card .slick-prev:before, .zb-card .slick-next:before { font-size: 28px; text-shadow: 0 2px 6px rgba(0,0,0,.45); }
      `}</style>

      <div className="flex flex-col p-2 space-y-4 sm:p-5 rounded-2xl bg-[#fbf3ec]">
        <div className="flex-grow">
          <div className="flex flex-col bg-white border border-[#eadfd6] shadow-sm rounded-2xl sm:flex-row-reverse">
            {/* Properties List */}
            <div className="z-10 flex-1 p-3 sm:p-5 no-scrollbar" style={{ scrollbarWidth: "none" }}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2">
                {properties.length > 0 ? (
                  properties
                    .filter((p) => p.latitude !== null && p.longitude !== null && !isNaN(p.latitude) && !isNaN(p.longitude))
                    .map((property) => {
                      const total = 1 + (property?.property_images?.length || 0);
                      const active = (activeIndexes[property._id] || 0) % total;
                      const isRent = property.property_category_type === "Rent";
                      const isHovered = hoveredPropertyId === property._id;

                      return (
                        <div
                          key={property._id}
                          className={`zb-card group flex flex-col gap-2 transition-transform duration-300 ${isHovered ? "-translate-y-0.5" : "hover:-translate-y-0.5"}`}
                          onMouseEnter={() => handleCardEnter(property)}
                          onMouseLeave={handleCardLeave}
                        >
                          {/* ===== CARD 1: IMAGE ===== */}
                          <div
                            className={`relative h-[130px] shrink-0 overflow-hidden rounded-xl bg-slate-900 transition-shadow duration-300 ${isHovered ? "ring-2 ring-[#7a1235] shadow-lg" : "shadow-sm"}`}
                          >
                            <Link to={`/propertydetails/${property._id}`} className="absolute inset-0 block overflow-hidden">
                              {total > 1 ? (
                                <Slider
                                  dots={false}
                                  arrows={false}
                                  infinite
                                  speed={600}
                                  slidesToShow={1}
                                  slidesToScroll={1}
                                  autoplay
                                  autoplaySpeed={2800}
                                  beforeChange={(c, n) => setActiveIndexes((prev) => ({ ...prev, [property._id]: n }))}
                                  initialSlide={activeIndexes[property._id] || 0}
                                >
                                  <div>
                                    <img src={property.cover_image} alt="Cover" className="object-cover w-full h-[130px]" />
                                  </div>
                                  {(property?.property_images || []).map((img) => (
                                    <div key={img._id}>
                                      <img src={img.image} alt="Property" className="object-cover w-full h-[130px]" />
                                    </div>
                                  ))}
                                </Slider>
                              ) : (
                                <img
                                  src={property.cover_image}
                                  alt="Cover"
                                  className="object-cover w-full h-[130px] transition-transform duration-700 group-hover:scale-105"
                                />
                              )}
                            </Link>

                            {/* Gradient for tag readability */}
                            <div className="absolute inset-x-0 top-0 h-12 pointer-events-none bg-gradient-to-b from-black/50 to-transparent" />

                            {/* Top-left: days + category + featured */}
                            <div className="absolute z-10 flex flex-col items-start gap-1 pointer-events-none top-2 left-2">
                              <span className="px-1.5 py-0.5 text-[9px] font-medium text-white rounded bg-black/45 backdrop-blur">
                                {property.days_since_created} days on ZeroBriks
                              </span>
                              <div className="flex items-center gap-1">
                                <span className="px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-white rounded shadow bg-[#7a1235]">
                                  {getCategoryText(property.property_category_type)}
                                </span>
                                {property.mark_as_featured === "Yes" && (
                                  <span className="px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-[#5e0d28] rounded shadow bg-[#e3b23c]">
                                    ★ FEATURED
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Top-right: tour + favourite */}
                            <div className="absolute z-10 flex items-center gap-1 top-2 right-2">
                              {property.virtual_tour_availability === "Yes" && (
                                <span className="flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-medium text-white rounded-full pointer-events-none bg-black/45 backdrop-blur">
                                  <PiCubeFocus className="text-[10px] text-[#e3b23c]" /> Tour
                                </span>
                              )}
                              <button
                                type="button"
                                className="flex items-center justify-center transition-transform rounded-full w-7 h-7 bg-white/90 backdrop-blur shadow hover:bg-white hover:scale-110 active:scale-95"
                                onClick={(e) => {
                                  if (!accessToken) {
                                    setIsLoginModalOpen(true);
                                    return;
                                  }
                                  e.preventDefault();
                                  if (property.is_favorite) removeFromFavorites(property.favorite_id);
                                  else addToFavorites(property._id);
                                }}
                              >
                                <Heart
                                  size={14}
                                  color={property.is_favorite ? "#e11d48" : "#7a1235"}
                                  fill={property.is_favorite ? "#e11d48" : "transparent"}
                                  strokeWidth={2}
                                />
                              </button>
                            </div>

                            {/* Slide dots */}
                            {total > 1 && (
                              <div className="absolute z-10 flex gap-1 pointer-events-none bottom-2 left-1/2 -translate-x-1/2">
                                {Array.from({ length: total }).map((_, i) => (
                                  <span
                                    key={i}
                                    className="h-1 rounded-full transition-all duration-300"
                                    style={{
                                      width: i === active ? "12px" : "5px",
                                      background: i === active ? "#e3b23c" : "rgba(255,255,255,0.6)",
                                    }}
                                  />
                                ))}
                              </div>
                            )}
                          </div>

                          {/* ===== CARD 2: DETAILS ===== */}
                          <div
                            className={`flex flex-col flex-1 min-h-0 gap-2 p-3 bg-white rounded-xl border transition-colors duration-300 ${isHovered ? "border-[#7a1235] shadow-md" : "border-[#eadfd6] shadow-sm"}`}
                          >
                            {/* Title, address, share */}
                            <div className="min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <Link
                                  to={`/propertydetails/${property._id}`}
                                  className="min-w-0 no-underline hover:no-underline"
                                >
                                  <h3 className="m-0 text-[12px] font-semibold leading-snug text-gray-900 truncate hover:text-[#7a1235] transition-colors">
                                    {property.property_name}
                                  </h3>
                                </Link>
                                <button
                                  type="button"
                                  className="p-1 -mt-0.5 text-[#7a1235] rounded-md hover:bg-[#fbf3ec] transition-colors shrink-0"
                                  onClick={() =>
                                    openShareModal1(`${window.location.origin}/propertydetails/${property._id}`, property._id)
                                  }
                                >
                                  <FontAwesomeIcon icon={faShareNodes} className="text-[10px]" />
                                </button>
                              </div>
                              <p className="flex items-center gap-1 mt-0.5 mb-0 text-[9.5px] text-gray-500">
                                <img
                                  src="/image/address_icon.png"
                                  alt="Location"
                                  className="object-contain w-3 h-3 shrink-0"
                                />
                                <span className="truncate">{property.address_area || "No Address Provided"}</span>
                              </p>
                            </div>

                            {/* Price + key facts */}
                            <div className="flex items-end justify-between gap-2 min-w-0">
                              <div className="flex items-baseline gap-0.5 min-w-0 text-[13.5px] font-bold text-[#7a1235]">
                                <FaRupeeSign className="text-[10px] self-center" />
                                <span>{isRent ? formatAmount(property.rent) : formatAmount(property.property_price)}</span>
                                {isRent && property.rent_duration && property.rent_duration !== "N/A" && (
                                  <span className="text-[9px] font-medium text-gray-500">/ {property.rent_duration}</span>
                                )}
                              </div>

                              {(property.bhk_type || property.area_sq || property.furnished_type) && (
                                <div className="flex flex-wrap justify-end gap-1 text-[9px] text-gray-700">
                                  {property.bhk_type && (
                                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#fbf3ec]">
                                      <MdOutlineBedroomParent className="text-[10px] text-[#7a1235]" />
                                      {property.bhk_type}
                                    </span>
                                  )}
                                  {property.area_sq && (
                                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#fbf3ec]">
                                      <BiArea className="text-[10px] text-[#7a1235]" />
                                      {property.area_sq} sq ft
                                    </span>
                                  )}
                                  {property.furnished_type && (
                                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#fbf3ec]">
                                      <FontAwesomeIcon icon={faChair} className="text-[9px] text-[#7a1235]" />
                                      {property.furnished_type}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Owner */}
                            <div className="flex items-center gap-2 pt-2 mt-auto border-t border-[#eadfd6] min-w-0">
                              <div className="flex items-center justify-center w-6 h-6 overflow-hidden rounded-full shrink-0 bg-[#fbf3ec]">
                                {property.property_owner_image ? (
                                  <img
                                    src={`${process.env.REACT_APP_API_URL}/media/${property.property_owner_image}`}
                                    alt="Owner"
                                    className="object-cover w-6 h-6"
                                  />
                                ) : (
                                  <AiOutlineUser className="text-[#7a1235]" size={14} />
                                )}
                              </div>
                              <div className="flex items-baseline gap-1 min-w-0 text-[9.5px]">
                                <span className="font-semibold text-gray-900 truncate">{property.connect_to_name}</span>
                                <span className="text-gray-500 truncate">· {property.user_type}</span>
                              </div>
                            </div>

                            {/* Actions: Contact, WhatsApp, Call */}
                            <div className="grid grid-cols-3 gap-1.5">
                              <button
                                type="button"
                                className="flex items-center justify-center h-8 text-[9.5px] font-semibold text-white rounded-lg bg-[#7a1235] hover:bg-[#5e0d28] active:scale-95 transition-all"
                                onClick={() => handleContactClick(property)}
                              >
                                Contact
                              </button>
                              <a
                                href={`https://wa.me/91${property.connect_to_no}?text=Hello, I am interested in your property`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center justify-center gap-1 h-8 text-[9.5px] font-semibold text-white rounded-lg bg-[#25D366] hover:brightness-110 active:scale-95 transition-all"
                              >
                                <FaWhatsapp className="text-[12px]" />
                                WhatsApp
                              </a>
                              <a
  href={`tel:${property.connect_to_no}`}
  onClick={(e) => e.stopPropagation()}
  className="flex items-center justify-center gap-1 h-8 text-[9.5px] font-semibold text-[#7a1235] rounded-lg border border-[#7a1235] bg-white hover:bg-[#7a1235] hover:text-white active:scale-95 transition-all"
>
  <IoCall className="text-[10px]" />
  Call
</a>
                            </div>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="py-10 text-center text-gray-700 col-span-full">
                    <p className="m-0">No properties available at the moment.</p>
                  </div>
                )}
              </div>

              {isContactModalOpen && selectedProperty && (
                <ContactDetails
                  fullName={
                    freeViewCount <= 0 && paidViewCount <= 0
                      ? `****${selectedProperty.connect_to_name?.slice(-1) || "N/A"}`
                      : selectedProperty.connect_to_name || "N/A"
                  }
                  mobile={
                    freeViewCount <= 0 && paidViewCount <= 0
                      ? `*******${selectedProperty.connect_to_no?.slice(-3) || "000"}`
                      : selectedProperty.connect_to_no || "N/A"
                  }
                  showUpgradePrompt={showUpgradePrompt}
                  onClose={() => setIsContactModalOpen(false)}
                />
              )}

              {/* Pagination (unchanged) */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg border border-[#eadfd6] bg-white text-[#7a1235] transition-colors hover:bg-[#fbf3ec] ${currentPage === 1 ? "opacity-40 cursor-not-allowed" : ""}`}
                  >
                    <MdOutlineNavigateBefore className="text-xl" />
                  </button>
                  {getPaginationRange().map((page, index) => (
                    <button
                      key={index}
                      onClick={() => (page !== "..." ? handlePageChange(page) : null)}
                      className={`min-w-[36px] h-9 px-2 text-sm rounded-lg flex items-center justify-center transition-colors ${currentPage === page ? "bg-[#7a1235] text-white font-semibold" : "text-gray-700 hover:bg-[#fbf3ec]"
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg border border-[#eadfd6] bg-white text-[#7a1235] transition-colors hover:bg-[#fbf3ec] ${currentPage === totalPages ? "opacity-40 cursor-not-allowed" : ""}`}
                  >
                    <MdOutlineNavigateNext className="text-xl" />
                  </button>
                </div>
              )}
            </div>

            {/* Map */}
            <div className="sticky top-0 w-full p-3 sm:w-3/4 md:w-1/2 lg:w-[500px] h-[300px] sm:h-screen sm:self-start">
              <div className="relative w-full h-full overflow-hidden bg-[#fbf3ec] border border-[#eadfd6] rounded-xl zb-map">
                {loading ? (
                  <div className="flex items-center justify-center w-full h-full gap-3 text-[#7a1235]">
                    <span className="w-5 h-5 border-2 rounded-full border-[#7a1235] border-t-transparent animate-spin" />
                    <p className="m-0 text-sm font-medium">Loading properties...</p>
                  </div>
                ) : (
                  <>
                    <div className="absolute z-[1000] px-3 py-1.5 text-xs font-semibold text-white rounded-lg shadow-md pointer-events-none bottom-3 left-3 bg-[#7a1235]">
                      {properties.length} properties on map
                    </div>
                    <MapContainer
                      center={properties.length > 0 ? [properties[0].latitude, properties[0].longitude] : [18.5204, 73.8567]}
                      zoom={12}
                      scrollWheelZoom={false}
                      style={{ width: "100%", height: "100%" }}
                    >
                      <ZbMapLayers />

                      {/* Glides the map to whichever card is hovered */}
                      <MapPanner target={panTarget} />

                      {properties
                        .filter((p) => p.latitude !== null && p.longitude !== null && !isNaN(p.latitude) && !isNaN(p.longitude))
                        .map((property) => (
                          <PropertyMarker
                            key={property._id}
                            property={property}
                            icon={createCustomIcon(getListedPrice(property), isMarkerActive(property._id))}
                            zIndexOffset={isMarkerActive(property._id) ? 1000 : 0}
                            onHover={(id) => setHoveredPropertyId(id)}
                            onLeave={handleCardLeave}
                            onFavorite={(prop) =>
                              prop.is_favorite
                                ? removeFromFavorites(prop.favorite_id)
                                : addToFavorites(prop._id)
                            }
                          />
                        ))}
                    </MapContainer>
                  </>
                )}
              </div>
            </div>

            {isShareModalOpen && (
              <div className="absolute right-0 z-50">
                <ShareModal
                  currentShareUrl={currentShareUrl}
                  closeShareModal={handleCloseShareModal}
                  copyLink={() => {
                    const url = currentShareUrl;
                    if (navigator.clipboard && window.isSecureContext) {
                      navigator.clipboard.writeText(url).then(() => alert("Link copied!")).catch(() => fallbackCopy(url));
                    } else {
                      fallbackCopy(url);
                    }
                    function fallbackCopy(text) {
                      const ta = document.createElement("textarea");
                      ta.value = text;
                      ta.style.position = "fixed";
                      ta.style.left = "-9999px";
                      document.body.appendChild(ta);
                      ta.focus();
                      ta.select();
                      try {
                        document.execCommand("copy");
                        alert("Link copied!");
                      } catch {
                        alert("Copy failed");
                      }
                      document.body.removeChild(ta);
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <Login1
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onSwitchToSignUp={() => { setIsLoginModalOpen(false); setIsSignUpModalOpen(true); }}
        />
        <SignUp1
          isOpen={isSignUpModalOpen}
          onClose={() => setIsSignUpModalOpen(false)}
          onSwitchToLogin={() => { setIsSignUpModalOpen(false); setIsLoginModalOpen(true); }}
        />
      </div>
    </>
  );
};

export default PropertyDashboard;