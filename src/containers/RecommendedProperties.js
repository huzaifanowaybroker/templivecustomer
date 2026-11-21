import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRef } from "react";
import { MdApartment, MdCheckCircleOutline } from "react-icons/md";
import { FaBath, FaUser, FaMapMarkerAlt } from "react-icons/fa";
import { RiRuler2Line } from "react-icons/ri";
import { AiOutlineClockCircle, AiOutlineUser } from "react-icons/ai";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Slider from "react-slick";
import { Heart } from "lucide-react";
import { toast } from "react-toastify";
import { PiCubeFocus } from "react-icons/pi";
import { faShareNodes } from "@fortawesome/free-solid-svg-icons";
import { GoArrowLeft, GoArrowRight } from "react-icons/go";
import { useHistory } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Login1 from "../auth/Login1";
import SignUp1 from "../auth/SignUp1";
import PropertyCardSkeleton from "./PropertyCardSkeleton";

const userLocation = JSON.parse(sessionStorage.getItem("userLocation"));

// Card design tokens — same look as the BuyProperty card
const CARD_CLASS =
  "group flex flex-col h-full min-h-[360px] overflow-hidden bg-white border border-[#EADFE2] rounded-2xl cursor-pointer shadow-[0_24px_50px_-30px_rgba(78,12,34,.45)] transition-all duration-500 ease-out hover:-translate-y-1 hover:border-[#7A1230] hover:shadow-lg hover:shadow-[#7A1230]/10";
const IMG_WRAP_CLASS = "relative h-44 overflow-hidden sm:h-48";
const IMG_CLASS =
  "block object-cover w-full h-44 sm:h-48 transition-transform duration-700 ease-out group-hover:scale-105";
const HEART_BTN_CLASS =
  "flex items-center justify-center w-8 h-8 bg-white rounded-full shadow transition-transform duration-300 hover:scale-110";
const DETAILS_CLASS = "flex flex-col flex-1 min-h-0 gap-2 p-3.5 overflow-hidden";
const NAME_CLASS =
  "flex-1 min-w-0 m-0 text-[14px] font-bold leading-5 text-gray-900 truncate";
const PRICE_CLASS =
  "flex-shrink-0 m-0 text-[18px] font-bold text-[#7a1235] whitespace-nowrap";
const PILL_CLASS =
  "flex items-center flex-shrink-0 gap-1 px-2.5 py-1 text-[10.5px] font-semibold text-[#7a1235] bg-[#F6EEF1] rounded-full whitespace-nowrap";
const FEATURE_ICON_CLASS = "flex-shrink-0 text-[14px] text-[#7a1235]";
const FEATURE_VALUE_CLASS = "text-[10.5px] font-semibold text-gray-800 truncate";
const C_DEEP = "#7a1235";

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;

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

const RecommendedProperties = ({
  openRecommendedShareModal,
  closeShareModal,
  copyLink,
  currentShareUrl,
  data,
  fetchHomeData,
}) => {
  const [savedProperties, setSavedProperties] = useState([]);
  const [properties, setProperties] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const sliderRef = useRef(null);
  const history = useHistory();
  const [isContactModalOpen] = useState(false);
  const [openContactModalAfterLogin] = useState(false);
  const accessToken = sessionStorage.getItem("accessToken");

  // Modal open states
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);

  useEffect(() => {
    const userId = sessionStorage.getItem("AccessToken");
    if (userId) {
      setIsLoggedIn(true);
      fetchSavedProperties(userId);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const fetchSavedProperties = async () => {
    const userId = sessionStorage.getItem("AccessToken");
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/cust_api/get_favorite_properties`,
        {
          user_id: userId,
        },
      );

      if (response.data.status === 1 && Array.isArray(response.data.data)) {
        const savedIds = response.data.data.map((prop) => prop._id);
        setSavedProperties(savedIds);
      } else {
        setSavedProperties([]);
        console.error("No saved properties found.");
      }
    } catch (error) {
      console.error("Error fetching saved properties:", error);
    }
  };

  // Fetch recommended properties
  const fetchRecommendedProperties = async () => {
    try {
      if (data && data.status === 1 && Array.isArray(data.data)) {
        setProperties(data.data);
      } else {
        setProperties([]);
      }
    } catch (error) {
      console.error("Error fetching recommended properties:", error);
    }
  };

  useEffect(() => {
    fetchRecommendedProperties();
  }, [data]);

  const handleClick = () => {
    history.push("/featuredDashboard");
  };

  // Toggle save/unsave property
  const toggleSaveProperty = async (propertyId) => {
    if (savedProperties.includes(propertyId)) {
      await removeFromFavorites(propertyId);
      setSavedProperties(savedProperties.filter((id) => id !== propertyId));
    } else {
      await addToFavorites(propertyId);
      setSavedProperties([...savedProperties, propertyId]);
    }
  };

  //  Add to favorites
  const addToFavorites = async (PropertyId) => {
    if (!accessToken) {
      setIsLoginModalOpen(true);
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/cust_api/add_to_favorite`,
        {
          user_id: accessToken,
          property_id: PropertyId,
        },
      );
      fetchHomeData();
    } catch (error) {
      console.error("Error adding property to favorites:", error);
    }
  };

  //  Remove to favorites
  const removeFromFavorites = async (favoriteId) => {
    const formData = new FormData();
    formData.append("favorite_id", favoriteId);

    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/cust_api/remove_from_favorite`,
        { data: formData },
      );

      if (response.data.status === 1) {
        fetchHomeData();
      } else {
        fetchHomeData();
        console.error("Failed to remove:", response.data.message);
      }
    } catch (error) {
      console.error("Error unfavoriting:", error);
    }
  };

  // Slider settings
  const [activeIndexes, setActiveIndexes] = useState({});
  const BASE_URL = process.env.REACT_APP_API_URL;
  const settings = {
    infinite: true,
    lazyLoad: "ondemand",
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    cssEase: "linear",
    centerMode: false,
    responsive: [
      {
        // Laptop: 1024px–1399px -> 3 cards (default slidesToShow: 4 covers 1400px+)
        breakpoint: 1399,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        // Tablet: 768px–1023px -> 2 cards
        breakpoint: 1023,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        // Mobile: <768px -> 1 card, full width
        breakpoint: 767,
        settings: {
          slidesToShow: 1,
          arrows: false,
        },
      },
    ],
  };
  const formatPrice = (price) => {
    if (!price) return "";

    const formatNumber = (value, unit) => {
      return (
        (value % 1 === 0
          ? parseInt(value)
          : value.toFixed(2).replace(/\.?0+$/, "")) + unit
      );
    };

    if (price >= 10000000) {
      return formatNumber(price / 10000000, " Cr");
    } else if (price >= 100000) {
      return formatNumber(price / 100000, " L");
    } else if (price >= 1000) {
      return formatNumber(price / 1000, " K");
    } else {
      return price.toString();
    }
  };

  const convertToSqFt = (area, unit) => {
    if (!area || !unit) return null;
    const areaNum = parseFloat(area);
    if (isNaN(areaNum)) return null;

    switch (unit.toLowerCase()) {
      case "sq ft":
      case "sqft":
      case "square feet":
        return areaNum;
      case "sq yd":
      case "sqyd":
      case "square yards":
        return areaNum * 9;
      case "sq mt":
      case "sqmt":
      case "square meters":
        return areaNum * 10.7639;
      case "acre":
      case "acres":
        return areaNum * 43560;
      default:
        return areaNum; // Return as-is if unit is unknown
    }
  };

  useEffect(() => {
    if (isLoginModalOpen || isContactModalOpen || openContactModalAfterLogin) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    // Cleanup when component unmounts
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isLoginModalOpen, isContactModalOpen, openContactModalAfterLogin]);

  return (
    <div className="w-full bg-white px-4 py-2 sm:px-6 sm:py-3 md:px-8 lg:px-10 overflow-x-hidden">
      <style>{`
        .slider-container .slick-track {
          display: flex !important;
        }
        .slider-container .slick-slide {
          height: auto;
          display: flex !important;
        }
        .slider-container .slick-slide > div {
          width: 100%;
        }
      `}</style>
      <div className="w-full">
        <div className="w-full">
          <div className="flex flex-col gap-3 mb-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#B9770E]">
                Handpicked for you
              </p>
              <h2
                className="text-[25px] font-semibold text-[#1B1113] sm:text-[26px]"
                style={{ fontFamily: '"Newsreader", Georgia, serif' }}
              >
                Featured Properties
              </h2>
              <p className="text-[11.5px] text-gray-500">Your dream property is just a few clicks away</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClick}
                className="px-4 py-2 text-[12px] font-semibold text-[#7a1235] bg-white border border-[#eadfe2] rounded-lg hover:bg-[#7a1235] hover:text-white transition-colors"
              >
                View All Properties
              </button>
              <button
                type="button"
                aria-label="Previous properties"
                onClick={() => sliderRef.current.slickPrev()}
                className="items-center justify-center hidden w-9 h-9 bg-white border border-[#eadfe2] rounded-full shadow-sm sm:flex hover:bg-[#fbf3ec] transition-colors"
              >
                <GoArrowLeft className="text-[18px] text-[#7a1235]" />
              </button>
              <button
                type="button"
                aria-label="Next properties"
                onClick={() => sliderRef.current.slickNext()}
                className="items-center justify-center hidden w-9 h-9 bg-white border border-[#eadfe2] rounded-full shadow-sm sm:flex hover:bg-[#fbf3ec] transition-colors"
              >
                <GoArrowRight className="text-[18px] text-[#7a1235]" />
              </button>
            </div>
          </div>
          {data?.status === 0 ? (
            <Slider {...settings} className="slider-container" ref={sliderRef}>
              {[1, 2, 3, 4].map((item) => (
                <div key={item}>
                  <PropertyCardSkeleton />
                </div>
              ))}
            </Slider>
          ) : (
            <Slider {...settings} className="slider-container" ref={sliderRef}>
              {properties
                .filter((property) => property.available_status !== "Sold")
                .map((property) => {
                  const getValidImageUrl = (img) => {
                    if (typeof img !== "string" || !img.trim()) return null;
                    return img.startsWith("http") ? img : BASE_URL + img;
                  };

                  const coverImage = getValidImageUrl(property.cover_image);
                  const additionalImages = (property.property_images || [])
                    .map((imgObj) => getValidImageUrl(imgObj?.image))
                    .filter(Boolean);
                  const allImages = [
                    ...(coverImage ? [coverImage] : []),
                    ...additionalImages,
                  ];
                  const subtitle = (() => {
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

                    if (
                      category === "Commercial Buy" ||
                      category === "Commercial Lease"
                    ) {
                      return `${type} for ${category === "Commercial Buy" ? "Sale" : "Lease"
                        } in ${location}`;
                    }
                    return `${type} in ${location}`;
                  })();
                  let distance = null;

                  if (userLocation && property.latitude && property.longitude) {
                    distance = calculateDistance(
                      parseFloat(userLocation.latitude),
                      parseFloat(userLocation.longitude),
                      parseFloat(property.latitude),
                      parseFloat(property.longitude),
                    ).toFixed(1);
                  }

                  // Category badge (top-left), same logic as before
                  const rawCategory = property.property_category_type || "";
                  const normalizedCategory = rawCategory
                    .replace(/\s+/g, " ")
                    .replace(/-/g, " ")
                    .replace(/\//g, " ")
                    .trim()
                    .toLowerCase();

                  let badgeText = "UNKNOWN";
                  if (normalizedCategory === "buy") {
                    badgeText = "FOR BUY";
                  } else if (normalizedCategory === "rent") {
                    badgeText = "FOR RENT";
                  } else if (normalizedCategory.includes("commercial buy")) {
                    badgeText = "COMMERCIAL BUY";
                  } else if (normalizedCategory.includes("commercial lease")) {
                    badgeText = "COMMERCIAL LEASE";
                  } else if (
                    normalizedCategory.includes("pg") ||
                    normalizedCategory.includes("co living") ||
                    normalizedCategory.includes("coliving")
                  ) {
                    badgeText = "PG / CO-LIVING";
                  }

                  const isRentLike =
                    property.property_category_type === "Rent" ||
                    property.property_category_type === "PG/Co-living";

                  return (
                    <div key={property._id} className="h-full px-2 py-4">
                      <div
                        onClick={(e) => {
                          if (e.target.closest("button, a, svg")) return;
                          window.scrollTo({ top: 0, behavior: "smooth" });
                          history.push(`/propertydetails/${property._id}`);
                        }}
                        className={`property-card ${CARD_CLASS}`}
                      >
                        {/* ============ Image area ============ */}
                        <div className={IMG_WRAP_CLASS}>
                          <Link
                            to={`/propertydetails/${property._id}`}
                            className="block"
                          >
                            {allImages.length > 1 ? (
                              <Slider
                                key={`${property._id}-${activeIndexes[property._id] || 0}`}
                                dots
                                infinite
                                speed={500}
                                slidesToShow={1}
                                slidesToScroll={1}
                                arrows
                                autoplay
                                autoplaySpeed={2000}
                                beforeChange={(current, next) =>
                                  setActiveIndexes((prev) => ({
                                    ...prev,
                                    [property._id]: next,
                                  }))
                                }
                                initialSlide={activeIndexes[property._id] || 0}
                                customPaging={(i) => {
                                  const activeSlide =
                                    activeIndexes[property._id] || 0;
                                  const isActive =
                                    i === activeSlide % allImages.length;
                                  return (
                                    <div
                                      style={{
                                        width: "10px",
                                        height: "10px",
                                        borderRadius: "50%",
                                        background: isActive ? "#fff" : "#888",
                                        margin: "0 5px",
                                        cursor: "pointer",
                                      }}
                                    />
                                  );
                                }}
                                appendDots={(dots) => (
                                  <div
                                    style={{
                                      position: "absolute",
                                      bottom: "10px",
                                      left: "50%",
                                      transform: "translateX(-50%)",
                                      display: "flex",
                                      justifyContent: "center",
                                      width: "100%",
                                    }}
                                  >
                                    {dots}
                                  </div>
                                )}
                                className="rounded-t-2xl"
                              >
                                {allImages.map((imgUrl, idx) => (
                                  <div key={`${property._id}-${idx}`}>
                                    <img
                                      src={imgUrl}
                                      alt="Property"
                                      className="w-full h-44 sm:h-48 object-cover rounded-t-2xl"
                                    />
                                  </div>
                                ))}
                              </Slider>
                            ) : (
                              <img
                                src={allImages[0] || "/image/app.png"}
                                alt="Property"
                                className={IMG_CLASS}
                                loading="lazy"
                                onError={(e) => (e.target.style.display = "none")}
                              />
                            )}
                          </Link>

                          {/* Category badge — top left */}
                          <span className="absolute z-10 px-3 py-1 text-[10.5px] font-semibold text-white rounded-full shadow top-3 left-3 bg-[#8B1E3F]">
                            {badgeText}
                          </span>

                          {/* Virtual tour + favourite — top right */}
                          <div className="absolute z-10 flex items-center gap-2 top-3 right-3">
                            {property.virtual_tour_availability === "Yes" && (
                              <span className="flex items-center gap-1 px-2 py-1 text-[10px] text-white rounded-full bg-black/55 backdrop-blur-sm">
                                <PiCubeFocus className="text-[12px]" />
                                Virtual Tour
                              </span>
                            )}
                            <button
                              className={HEART_BTN_CLASS}
                              onClick={() => {
                                if (!accessToken) {
                                  setIsLoginModalOpen(true);
                                  return;
                                }
                                if (property.is_favorite) {
                                  removeFromFavorites(property.favorite_id);
                                } else {
                                  addToFavorites(property._id);
                                }
                              }}
                            >
                              <Heart
                                size={16}
                                stroke={property.is_favorite ? "none" : C_DEEP}
                                color={property.is_favorite ? "#e11d48" : C_DEEP}
                                fill={property.is_favorite ? "#e11d48" : "transparent"}
                                strokeWidth={2}
                              />
                            </button>
                          </div>

                          {/* Admin approval — bottom left */}
                          {property.admin_approval === "Approved" && (
                            <span className="absolute z-10 px-2 py-0.5 text-[9.5px] font-semibold text-white rounded bottom-3 left-3 bg-[#7a1235]">
                              ✓ Verified
                            </span>
                          )}

                          {/* Featured — bottom right */}
                          {property.mark_as_featured === "Yes" && (
                            <span className="absolute z-10 px-2 py-0.5 text-[9.5px] font-semibold text-white rounded bottom-3 right-3 bg-yellow-500">
                              FEATURED
                            </span>
                          )}
                        </div>

                        {/* ============ Details ============ */}
                        <div className={DETAILS_CLASS}>
                          {/* Name + price */}
                          <div className="flex items-start justify-between gap-2">
                            <h3
                              className={NAME_CLASS}
                              title={property.property_name}
                            >
                              {property.property_name || "N/A"}
                            </h3>
                            <p className={PRICE_CLASS}>
                              ₹{" "}
                              {isRentLike
                                ? formatPrice(property.rent)
                                : formatPrice(property.property_price)}
                              {isRentLike && (
                                <span className="ml-1 text-[11px] font-medium text-gray-500">
                                  / {property.rent_duration || "Per Month"}
                                </span>
                              )}
                            </p>
                          </div>

                          {/* Subtitle + Ready / Possession */}
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className="flex items-center min-w-0 gap-1.5 m-0 text-[11.5px] text-gray-500"
                              title={subtitle}
                            >
                              <FaMapMarkerAlt className="flex-shrink-0 text-[#8B1E3F]" />
                              <span className="truncate">
                                {subtitle}
                                {distance && ` · ${distance} km`}
                              </span>
                            </p>
                            {property.property_category_type?.includes("Buy") &&
                              property.possession_status === "Ready To Move" && (
                                <span className={PILL_CLASS}>
                                  <MdCheckCircleOutline className="text-[13px]" />
                                  Ready
                                </span>
                              )}
                            {property.property_category_type?.includes("Buy") &&
                              property.possession_status !== "Ready To Move" &&
                              property.possession_date && (
                                <span className="flex-shrink-0 px-2.5 py-1 text-[10.5px] font-semibold text-[#7a1235] bg-[#F6EEF1] rounded-full whitespace-nowrap">
                                  Possession:{" "}
                                  {new Date(property.possession_date).toLocaleDateString("en-IN")}
                                </span>
                              )}
                          </div>

                          {/* Deposit for rent / PG */}
                          {isRentLike && (
                            <p className="m-0 text-[11px] text-gray-600">
                              <span className="text-gray-500">Deposit:</span>{" "}
                              <span className="font-semibold">
                                ₹ {property.custom_deposit_amount?.toLocaleString("en-IN")}
                              </span>
                            </p>
                          )}

                          {/* Features */}
                          <div className="grid grid-cols-3 py-2.5 mt-1 border-y border-[#f1e7e3]">
                            {/* First Column */}
                            <div className="flex items-center gap-1.5 min-w-0 px-1">
                              <MdApartment className={FEATURE_ICON_CLASS} />
                              <span className={FEATURE_VALUE_CLASS}>
                                {property.building_type === "Commercial"
                                  ? property.property_type === "Office"
                                    ? "Office Space"
                                    : property.property_type === "Retail"
                                      ? "Retail Space"
                                      : property.property_type
                                  : property.property_category_type?.includes("PG")
                                    ? `${property.bathroom || 0} Bathrooms`
                                    : property.bhk_type}
                              </span>
                            </div>

                            {/* Second Column */}
                            <div className="flex items-center gap-1.5 min-w-0 pl-2.5 border-l border-[#f1e7e3]">
                              {property.property_category_type?.includes("PG") ? (
                                <FaUser className={FEATURE_ICON_CLASS} />
                              ) : (
                                <FaBath className={FEATURE_ICON_CLASS} />
                              )}
                              <span className={FEATURE_VALUE_CLASS}>
                                {property.property_category_type?.includes("PG")
                                  ? property.available_for
                                  : `${property.bathroom || 0} Baths`}
                              </span>
                            </div>

                            {/* Third Column */}
                            <div className="flex items-center gap-1.5 min-w-0 pl-2.5 border-l border-[#f1e7e3]">
                              <RiRuler2Line className={FEATURE_ICON_CLASS} />
                              <span className={FEATURE_VALUE_CLASS}>
                                {property.area} {property.area_in}
                              </span>
                            </div>
                          </div>

                          {/* Footer: owner, posted by, days, share */}
                          <div className="flex items-center justify-between gap-2 mt-auto pt-1">
                            <div className="flex items-center min-w-0 gap-2">
                              <div className="flex items-center justify-center flex-shrink-0 w-7 h-7 overflow-hidden rounded-full bg-[#fbf3ec]">
                                {property.property_owner_image &&
                                  !property.property_owner_image.includes("default_profile") ? (
                                  <>
                                    <img
                                      src={`${process.env.REACT_APP_API_URL}/media/${property.property_owner_image}`}
                                      alt={property.connect_to_name || "Owner"}
                                      className="object-cover w-full h-full rounded-full"
                                      onError={(e) => {
                                        e.target.style.display = "none";
                                        e.target.nextSibling.style.display = "flex";
                                      }}
                                    />
                                    <div className="items-center justify-center hidden w-full h-full">
                                      <AiOutlineUser className="text-[14px] text-[#7a1235]" />
                                    </div>
                                  </>
                                ) : (
                                  <div className="flex items-center justify-center w-full h-full">
                                    <AiOutlineUser className="text-[14px] text-[#7a1235]" />
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span
                                  className="text-[11px] font-semibold text-gray-900 truncate"
                                  title={property.connect_to_name}
                                >
                                  {property.connect_to_name || "Owner"}
                                </span>
                                <span className="flex items-center gap-1 text-[10px] text-gray-500 truncate">
                                  <AiOutlineClockCircle className="text-[11px]" />
                                  {property.user_type || "Owner"} ·{" "}
                                  {property.days_since_created
                                    ? `${property.days_since_created} days ago`
                                    : "Recently"}
                                </span>
                              </div>
                            </div>

                            <FontAwesomeIcon
                              icon={faShareNodes}
                              className="flex-shrink-0 text-[14px] text-gray-500 transition-colors cursor-pointer hover:text-[#7a1235]"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                openRecommendedShareModal(property._id);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </Slider>
          )}

          {/* Mobile arrows, below the cards */}
          <div className="flex items-center justify-center gap-4 mt-3 sm:hidden">
            <button
              type="button"
              aria-label="Previous properties"
              className="flex items-center justify-center w-9 h-9 bg-white border border-[#eadfe2] rounded-full shadow-sm"
              onClick={() => sliderRef.current.slickPrev()}
            >
              <GoArrowLeft className="text-[18px] text-[#7a1235]" />
            </button>
            <button
              type="button"
              aria-label="Next properties"
              className="flex items-center justify-center w-9 h-9 bg-white border border-[#eadfe2] rounded-full shadow-sm"
              onClick={() => sliderRef.current.slickNext()}
            >
              <GoArrowRight className="text-[18px] text-[#7a1235]" />
            </button>
          </div>
        </div>
      </div>
      <div
        id="shareModal"
        className="fixed bottom-0 right-0 z-50 items-center justify-center hidden bg-black bg-opacity-50"
      >
        <div className="w-full max-w-lg p-4 bg-white rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-[15.5px] font-bold">Share this link</h5>
            <button onClick={closeShareModal}>&times;</button>
          </div>
          <div className="flex items-center mb-4">
            <input
              type="text"
              className="flex-grow p-2 border rounded form-control"
              value={currentShareUrl}
              readOnly
            />
            <button
              className="p-2 ml-2 bg-gray-200 rounded"
              onClick={(e) => copyLink(e)}
            >
              Copy Link
            </button>
          </div>
          <div className="flex justify-around">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(currentShareUrl)}`}
              className="btn btn-success"
            >
              WhatsApp
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentShareUrl)}`}
              className="btn btn-primary"
            >
              Facebook
            </a>
            <a href="https://www.instagram.com" className="btn btn-danger">
              Instagram
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentShareUrl)}`}
              className="btn btn-info"
            >
              Twitter
            </a>
            <a
              href={`mailto:?subject=Check out this page&body=${encodeURIComponent(currentShareUrl)}`}
              className="btn btn-secondary"
            >
              Email
            </a>
          </div>
        </div>
      </div>

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
          fetchHomeData();
        }}
      />
    </div>
  );
};

export default RecommendedProperties;