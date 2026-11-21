import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../styles/RecommendedProperties.css";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { Heart } from "lucide-react";
import { GoArrowLeft, GoArrowRight } from "react-icons/go";
import { IoBedOutline } from "react-icons/io5";
import { FaBath, FaMapMarkerAlt, FaUser } from "react-icons/fa";
import { RiRuler2Line } from "react-icons/ri";
import { FiCamera } from "react-icons/fi";
import { MdApartment, MdCheckCircleOutline } from "react-icons/md";
import { PiCubeFocus } from "react-icons/pi";
import { AiOutlineUser, AiOutlineClockCircle } from "react-icons/ai";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShareNodes } from "@fortawesome/free-solid-svg-icons";
import Login1 from "../auth/Login1";
import SignUp1 from "../auth/SignUp1";
import PropertyCardSkeleton from "./PropertyCardSkeleton";

/* ------------------------------------------------------------------ */
/* CARD SIZE: change these two numbers to make the cards bigger or      */
/* smaller. Everything else follows them.                               */
/* ------------------------------------------------------------------ */
const CARD_HEIGHT = 380; // whole card, in px
const IMAGE_HEIGHT = 190; // photo area at the top of the card, in px

// Colours taken from the existing ZeroBriks code
const C = {
  primary: "#8B1E3F",
  deep: "#7a1235",
  navy: "#5e0d28",
  gold: "#b8860b",
  soft: "#fbf3ec",
  chip: "#F6EEF1",
  line: "#eadfd6",
};

const STYLE = `
  .zb-bp .slick-prev, .zb-bp .slick-next { display: none !important; }
  .zb-bp-track .slick-list { overflow: hidden; padding-bottom: 32px; margin-bottom: -32px; }
  .zb-bp-photos .slick-list { overflow: hidden; padding: 0; margin: 0; }
  .zb-bp-card { box-shadow: 0 24px 50px -30px rgba(78, 12, 34, .45); }
  .zb-bp-card:hover { box-shadow: 0 34px 60px -26px rgba(78, 12, 34, .55); }
  .zb-bp .slick-slide > div { height: 100%; }
  .zb-bp .zb-serif { font-family: "Newsreader", Georgia, serif; }
  .zb-bp-photos .slick-dots { bottom: 8px; }
  .zb-bp-photos .slick-dots li { width: 12px; height: 12px; margin: 0 2px; }
  .zb-bp-photos .slick-dots li button:before { font-size: 7px; color: #fff; opacity: .5; }
  .zb-bp-photos .slick-dots li.slick-active button:before { opacity: 1; }
  @media (prefers-reduced-motion: reduce) {
    .zb-bp, .zb-bp * { transition: none !important; }
  }
`;

const BASE_URL = process.env.REACT_APP_API_URL;

const toUrl = (img) => {
  if (typeof img !== "string" || !img.trim()) return null;
  return img.startsWith("http") ? img : `${BASE_URL}${img}`;
};

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
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// 45000 -> "45K", 125000000 -> "12.5 Cr"
const shortAmount = (value) => {
  const n = Number(value);
  if (!n) return "";
  if (n >= 1e7) return `${+(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `${+(n / 1e5).toFixed(2)} L`;
  if (n >= 1e3) return `${+(n / 1e3).toFixed(1)}K`;
  return String(n);
};

const isCommercial = (p) =>
  (p.property_category_type || "").toLowerCase().includes("commercial") ||
  p.building_type === "Commercial";
const isPG = (p) => /pg|living/i.test(p.property_category_type || "");
const isRentLike = (p) => p.property_category_type === "Rent" || isPG(p);
const isBuy = (p) => (p.property_category_type || "").toLowerCase().includes("buy");

const badgeFor = (p) => {
  const cat = (p.property_category_type || "").toLowerCase();
  if (cat.includes("commercial")) {
    return { text: cat.includes("lease") ? "For Lease" : "Commercial", color: C.navy };
  }
  if (isPG(p)) return { text: "PG / Co-living", color: C.gold };
  if (cat === "rent") return { text: "For Rent", color: C.primary };
  return { text: "For Sale", color: C.gold };
};

const priceOf = (p) => {
  const rentLike = isRentLike(p);
  const amount = shortAmount(rentLike ? p.rent : p.property_price);
  const duration =
    p.rent_duration && p.rent_duration !== "N/A"
      ? p.rent_duration.replace(/^per\s+/i, "").toLowerCase()
      : "month";
  return { amount, suffix: rentLike && amount ? `/${duration}` : "" };
};

const locationOf = (p) => {
  const area = p.address_area || "";
  const city = p.city_name || "";
  if (!city || area.toLowerCase().includes(city.toLowerCase())) return area || city;
  return `${area}, ${city}`;
};

const featuresOf = (p) => {
  const area = p.area ? `${p.area} ${p.area_in || ""}`.trim() : "—";
  if (isCommercial(p)) {
    return [
      { icon: <MdApartment />, value: p.property_type || "Commercial" },
      { icon: <RiRuler2Line />, value: area },
      { icon: <MdApartment />, value: p.furnished_type || "Bare shell" },
    ];
  }
  if (isPG(p)) {
    return [
      { icon: <FaUser />, value: p.available_for || "Anyone" },
      { icon: <FaBath />, value: `${p.bathroom || 0} Baths` },
      { icon: <RiRuler2Line />, value: area },
    ];
  }
  return [
    { icon: <IoBedOutline />, value: p.bhk_type || "—" },
    { icon: <FaBath />, value: `${p.bathroom || 0} Baths` },
    { icon: <RiRuler2Line />, value: area },
  ];
};

// Owner avatar URL, or null to show the default icon
const ownerImageOf = (p) =>
  p.property_owner_image && !p.property_owner_image.includes("default_profile")
    ? `${BASE_URL}/media/${p.property_owner_image}`
    : null;

// Card carousel. No lazyLoad and no hover lift, so cards stay still while scrolling.
const cardSlider = {
  infinite: true,
  speed: 700,
  slidesToShow: 4,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3500,
  pauseOnHover: true,
  arrows: false,
  swipeToSlide: true,
  cssEase: "cubic-bezier(0.22, 1, 0.36, 1)",
  responsive: [
    { breakpoint: 1400, settings: { slidesToShow: 3 } },
    { breakpoint: 1024, settings: { slidesToShow: 2 } },
    { breakpoint: 640, settings: { slidesToShow: 1 } },
  ],
};

const photoSlider = {
  dots: true,
  infinite: true,
  fade: true,
  speed: 800,
  autoplay: true,
  autoplaySpeed: 2600,
  pauseOnHover: false,
  arrows: false,
  cssEase: "cubic-bezier(0.22, 1, 0.36, 1)",
};

const BuyProperty = ({ openRecommendedShareModal, data }) => {
  const history = useHistory();
  const sliderRef = useRef(null);
  const userId = sessionStorage.getItem("accessToken");
  const [properties, setProperties] = useState([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);

  useEffect(() => {
    if (data?.status === 1 && Array.isArray(data.data)) {
      setProperties(
        data.data.filter(
          (item) => (item.property_category_type || "").toLowerCase() === "buy"
        )
      );
    } else {
      setProperties([]);
    }
  }, [data]);

  const patchProperty = (id, patch) =>
    setProperties((prev) =>
      prev.map((item) => (item._id === id ? { ...item, ...patch } : item))
    );

  // Optimistic favourite toggle; reverts if the API call fails
  const toggleFavorite = async (property) => {
    if (!userId) {
      setIsLoginModalOpen(true);
      return;
    }
    const id = property._id;
    if (property.is_favorite) {
      patchProperty(id, { is_favorite: false, favorite_id: null });
      try {
        const res = await axios.delete(
          `${BASE_URL}/cust_api/remove_from_favorite`,
          { data: { favorite_id: property.favorite_id } }
        );
        if (res.data.status !== 1) throw new Error("remove failed");
      } catch (err) {
        patchProperty(id, { is_favorite: true, favorite_id: property.favorite_id });
        toast.error("Couldn't update favourites. Please try again.");
      }
    } else {
      patchProperty(id, { is_favorite: true });
      try {
        const res = await axios.post(`${BASE_URL}/cust_api/add_to_favorite`, {
          user_id: userId,
          property_id: id,
        });
        if (res.data.status !== 1) throw new Error("add failed");
        patchProperty(id, { favorite_id: res.data.favorite_id });
      } catch (err) {
        patchProperty(id, { is_favorite: false, favorite_id: null });
        toast.error("Couldn't update favourites. Please try again.");
      }
    }
  };

  const visible = properties.filter((p) => p.available_status !== "Sold");

  return (
    <section
      className="zb-bp px-4 py-2 sm:px-6 sm:py-3 md:px-8 lg:px-10"
      style={{ backgroundColor: "#F5F5F5" }}
    >
      <style>{STYLE}</style>

      {/* Header */}
      <div className="flex flex-col gap-3 mb-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#B9770E]">
            Handpicked for you
          </p>
          <h2 className="zb-serif text-[25px] font-semibold text-[#1B1113] sm:text-[26px]">
            Discover Your Dream Home
          </h2>
          <p className="text-[11.5px] text-gray-500">
            Your dream property is just a few clicks away
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => history.push("/advisordashboard?label=Buy")}
            className="px-4 py-2 text-[12px] font-semibold text-[#7a1235] bg-white border border-[#eadfd6] rounded-lg hover:bg-[#7a1235]  hover:text-white transition-colors"
          >
            View All Properties
          </button>
          <button
            type="button"
            aria-label="Previous properties"
            onClick={() => sliderRef.current?.slickPrev()}
            className="items-center justify-center hidden w-9 h-9 bg-white border border-[#eadfd6] rounded-full shadow-sm sm:flex hover:bg-[#fbf3ec] transition-colors"
          >
            <GoArrowLeft className="text-[18px] text-[#7a1235]" />
          </button>
          <button
            type="button"
            aria-label="Next properties"
            onClick={() => sliderRef.current?.slickNext()}
            className="items-center justify-center hidden w-9 h-9 bg-white border border-[#eadfd6] rounded-full shadow-sm sm:flex hover:bg-[#fbf3ec] transition-colors"
          >
            <GoArrowRight className="text-[18px] text-[#7a1235]" />
          </button>
        </div>
      </div>

      {/* Cards */}
      {data.status === 0 ? (
        <Slider {...cardSlider}>
          {[1, 2, 3, 4].map((item) => (
            <PropertyCardSkeleton key={item} />
          ))}
        </Slider>
      ) : visible.length === 0 ? (
        <p className="py-10 text-center text-[13px] text-gray-500">
          No properties to show right now.
        </p>
      ) : (
        <Slider ref={sliderRef} {...cardSlider} className="zb-bp-track">
          {visible.map((p) => {
            const images = [p.cover_image, ...(p.property_images || []).map((i) => i?.image)]
              .map(toUrl)
              .filter(Boolean);
            const badge = badgeFor(p);
            const { amount, suffix } = priceOf(p);
            const features = featuresOf(p);
            const verified = p.admin_approval === "Approved";
            const ownerImage = ownerImageOf(p);
            const distance =
              userLocation && p.latitude && p.longitude
                ? calculateDistance(
                    userLocation.latitude,
                    userLocation.longitude,
                    parseFloat(p.latitude),
                    parseFloat(p.longitude)
                  ).toFixed(1)
                : null;

            return (
              <div key={p._id} className="w-full h-full p-2">
                <article
                  onClick={() => history.push(`/propertydetails/${p._id}`)}
                  style={{ height: CARD_HEIGHT }}
                  className="zb-bp-card group flex flex-col overflow-hidden bg-white border cursor-pointer rounded-2xl border-[#EADFE2] transition-shadow duration-500 ease-out hover:border-[#7A1230] hover:shadow-lg hover:shadow-[#7A1230]/10"
                >
                  <div className="flex flex-col flex-1 min-h-0">
                    {/* Image area */}
                    <div className="relative overflow-hidden" style={{ height: IMAGE_HEIGHT }}>
                      {images.length > 1 ? (
                        <div className="zb-bp-photos relative h-full overflow-hidden">
                          <Slider {...photoSlider}>
                            {images.map((src, i) => (
                              <img
                                key={`${p._id}-${i}`}
                                src={src}
                                alt={p.property_name || "Property"}
                                loading="lazy"
                                className="block object-cover w-full"
                                style={{ height: IMAGE_HEIGHT }}
                              />
                            ))}
                          </Slider>
                        </div>
                      ) : (
                        <img
                          src={images[0] || "/image/app.png"}
                          alt={p.property_name || "Property"}
                          loading="lazy"
                          className="block object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                      )}

                      <span
                        className="absolute z-10 px-3 py-1 text-[10.5px] font-semibold text-white rounded-full shadow top-3 left-3"
                        style={{ background: badge.color }}
                      >
                        {badge.text}
                      </span>

                      <div className="absolute z-10 flex items-center gap-2 top-3 right-3">
                        {p.virtual_tour_availability === "Yes" && (
                          <span className="flex items-center gap-1 px-2 py-1 text-[10px] text-white rounded-full bg-black/55 backdrop-blur-sm">
                            <PiCubeFocus className="text-[12px]" />
                            Virtual Tour
                          </span>
                        )}
                        <button
                          type="button"
                          aria-label={p.is_favorite ? "Remove from favourites" : "Add to favourites"}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(p);
                          }}
                          className="flex items-center justify-center w-8 h-8 bg-white rounded-full shadow transition-transform duration-300 hover:scale-110"
                        >
                          <Heart
                            size={16}
                            color={p.is_favorite ? "#e11d48" : C.deep}
                            fill={p.is_favorite ? "#e11d48" : "transparent"}
                            strokeWidth={2}
                          />
                        </button>
                      </div>

                      {verified && (
                        <span className="absolute z-10 px-2 py-0.5 text-[9.5px] font-semibold text-white rounded bottom-3 left-3 bg-[#7a1235]">
                          ✓ Verified
                        </span>
                      )}

                      {images.length > 0 && (
                        <span className="absolute z-10 flex items-center gap-1 px-2 py-1 text-[10px] text-white rounded-full bottom-3 right-3 bg-black/55">
                          <FiCamera className="text-[11px]" />
                          {images.length} Photos
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex flex-col flex-1 min-h-0 gap-2 p-3.5 overflow-hidden">
                      {/* Name + amount */}
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className="flex-1 min-w-0 m-0 text-[14px] font-bold leading-5 text-gray-900 truncate"
                          title={p.property_name}
                        >
                          {p.property_name || "N/A"}
                        </h3>
                        <p className="flex-shrink-0 m-0 text-[18px] font-bold text-[#7a1235] whitespace-nowrap">
                          {amount ? (
                            <>
                              ₹ {amount}
                              {suffix && (
                                <span className="ml-1 text-[11px] font-medium text-gray-500">{suffix}</span>
                              )}
                            </>
                          ) : (
                            "On request"
                          )}
                        </p>
                      </div>

                      {/* Location on the left; Ready / Possession on the right */}
                      <div className="flex items-center justify-between gap-2">
                        <p className="flex items-center min-w-0 gap-1.5 m-0 text-[11.5px] text-gray-500">
                          <FaMapMarkerAlt className="flex-shrink-0 text-[#8B1E3F]" />
                          <span className="truncate">
                            {locationOf(p)}
                            {distance && ` · ${distance} km`}
                          </span>
                        </p>
                        {isBuy(p) && p.possession_status === "Ready To Move" && (
                          <span className="flex items-center flex-shrink-0 gap-1 px-2.5 py-1 text-[10.5px] font-semibold text-[#7a1235] bg-[#F6EEF1] rounded-full whitespace-nowrap">
                            <MdCheckCircleOutline className="text-[13px]" />
                            Ready
                          </span>
                        )}
                        {isBuy(p) && p.possession_status !== "Ready To Move" && p.possession_date && (
                          <span className="flex-shrink-0 px-2.5 py-1 text-[10.5px] font-semibold text-[#7a1235] bg-[#F6EEF1] rounded-full whitespace-nowrap">
                            Possession: {new Date(p.possession_date).toLocaleDateString("en-IN")}
                          </span>
                        )}
                      </div>

                      {/* Features */}
                      <div className="grid grid-cols-3 py-2.5 mt-1 border-y border-[#f1e7e3]">
                        {features.map((f, i) => (
                          <div
                            key={i}
                            className={`flex items-center gap-1.5 min-w-0 px-1 ${
                              i ? "pl-2.5 border-l border-[#f1e7e3]" : ""
                            }`}
                          >
                            <span className="flex-shrink-0 text-[14px] text-[#7a1235]">{f.icon}</span>
                            <span className="text-[10.5px] font-semibold text-gray-800 truncate">
                              {f.value}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Footer: owner, posted by, days, share */}
                      <div className="flex items-center justify-between gap-2 mt-auto pt-1">
                        <div className="flex items-center min-w-0 gap-2">
                          <div className="flex items-center justify-center flex-shrink-0 w-7 h-7 overflow-hidden rounded-full bg-[#fbf3ec]">
                            {ownerImage ? (
                              <>
                                <img
                                  src={ownerImage}
                                  alt={p.connect_to_name || "Owner"}
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
                              title={p.connect_to_name}
                            >
                              {p.connect_to_name || "Owner"}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-gray-500 truncate">
                              <AiOutlineClockCircle className="text-[11px]" />
                              {p.user_type || "Owner"} ·{" "}
                              {p.days_since_created
                                ? `${p.days_since_created} days ago`
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
                            openRecommendedShareModal(p._id);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </article>
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
          onClick={() => sliderRef.current?.slickPrev()}
          className="flex items-center justify-center w-9 h-9 bg-white border border-[#eadfd6] rounded-full shadow-sm"
        >
          <GoArrowLeft className="text-[18px] text-[#7a1235]" />
        </button>
        <button
          type="button"
          aria-label="Next properties"
          onClick={() => sliderRef.current?.slickNext()}
          className="flex items-center justify-center w-9 h-9 bg-white border border-[#eadfd6] rounded-full shadow-sm"
        >
          <GoArrowRight className="text-[18px] text-[#7a1235]" />
        </button>
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
        }}
      />
    </section>
  );
};

const userLocation = JSON.parse(sessionStorage.getItem("userLocation"));

export default BuyProperty;