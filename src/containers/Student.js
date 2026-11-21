import React, { useCallback, useRef, useState } from "react";
import Slider from "react-slick";
import { useHistory } from "react-router-dom";
import { MdApartment, MdCheckCircleOutline } from "react-icons/md";
import { FaBath, FaUtensils, FaMapMarkerAlt } from "react-icons/fa";
import { AiOutlineClockCircle, AiOutlineUser } from "react-icons/ai";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShareNodes } from "@fortawesome/free-solid-svg-icons";
import { GoArrowLeft, GoArrowRight } from "react-icons/go";
import { Heart } from "lucide-react";
import { PiCubeFocus } from "react-icons/pi";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

/* ------------------------------------------------------------------ */
/* Design tokens — same look as the BuyProperty card                   */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */
const PRICING_ROUTE = "/pricing";
const FALLBACK_IMAGE = "/image/property-search.jpg";
const OWNER = { name: "Sonu", role: "Owner" };

// Same formatter as Recommended Properties ("8 K", "1.2 L", "1.5 Cr")
const formatPrice = (price) => {
  if (!price) return "";
  const fmt = (value, unit) =>
    (value % 1 === 0
      ? parseInt(value, 10)
      : value.toFixed(2).replace(/\.?0+$/, "")) + unit;

  if (price >= 10000000) return fmt(price / 10000000, " Cr");
  if (price >= 100000) return fmt(price / 100000, " L");
  if (price >= 1000) return fmt(price / 1000, " K");
  return price.toString();
};

// Replace image URLs with your own files in /image/...
const LISTINGS = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=70",
    tag: "PG for Boys",
    title: "Sunrise PG",
    furnished: "Furnished",
    subtitle: "PG in Near IIT College, Pune",
    price: 8000,
    deposit: 16000,
    room: "Single Room",
    bath: "Attached Bath",
    meals: "Meals Included",
    noMeals: false,
    postedAgo: 5,
    verified: true,
    featured: true,
    tour: false,
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=70",
    tag: "Hostel",
    title: "City Hostel",
    furnished: "Semi-Furnished",
    subtitle: "Hostel in Near Fergusson College, Pune",
    price: 6500,
    deposit: 13000,
    room: "Shared Room",
    bath: "Common Bath",
    meals: "Meals Included",
    noMeals: false,
    postedAgo: 7,
    verified: false,
    featured: true,
    tour: true,
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=70",
    tag: "PG for Girls",
    title: "Comfort Living PG",
    furnished: "Furnished",
    subtitle: "PG in Near Symbiosis College, Pune",
    price: 9000,
    deposit: 18000,
    room: "Single Room",
    bath: "Attached Bath",
    meals: "Meals Included",
    noMeals: false,
    postedAgo: 3,
    verified: false,
    featured: false,
    tour: true,
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=70",
    tag: "Rental Room",
    title: "Student Rental Room",
    furnished: "Unfurnished",
    subtitle: "Room in Near University Road, Pune",
    price: 10000,
    deposit: 20000,
    room: "Private Room",
    bath: "Attached Bath",
    meals: "No Meals",
    noMeals: true,
    postedAgo: 10,
    verified: false,
    featured: true,
    tour: false,
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=70",
    tag: "PG for Boys",
    title: "Scholars Den PG",
    furnished: "Semi-Furnished",
    subtitle: "PG in Near COEP, Pune",
    price: 7500,
    deposit: 15000,
    room: "Shared Room",
    bath: "Attached Bath",
    meals: "Meals Included",
    noMeals: false,
    postedAgo: 2,
    verified: true,
    featured: false,
    tour: false,
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=70",
    tag: "Hostel",
    title: "Campus Nest Hostel",
    furnished: "Semi-Furnished",
    subtitle: "Hostel in Near MIT WPU, Pune",
    price: 5800,
    deposit: 11600,
    room: "Shared Room",
    bath: "Common Bath",
    meals: "No Meals",
    noMeals: true,
    postedAgo: 6,
    verified: false,
    featured: false,
    tour: false,
  },
];

// Same breakpoints as Recommended Properties
const SLIDER_SETTINGS = {
  infinite: true,
  lazyLoad: "ondemand",
  slidesToShow: 4,
  slidesToScroll: 1,
  autoplay: false,
  arrows: false,
  cssEase: "linear",
  responsive: [
    { breakpoint: 1399, settings: { slidesToShow: 3 } },
    { breakpoint: 1023, settings: { slidesToShow: 2 } },
    { breakpoint: 767, settings: { slidesToShow: 1 } },
  ],
};

const handleImageError = (e) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = FALLBACK_IMAGE;
};

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */
const StudentCard = ({ item, isFav, onToggleFav, onShare, onOpen }) => (
  <div className="h-full px-2 py-2">
    <div
      onClick={(e) => {
        if (e.target.closest("button, a, svg")) return;
        onOpen();
      }}
      className={CARD_CLASS}
    >
      {/* ============ Image area ============ */}
      <div className={IMG_WRAP_CLASS}>
        <img
          src={item.image}
          alt={item.title}
          loading="lazy"
          onError={handleImageError}
          className={IMG_CLASS}
        />

        {/* Tag — top left */}
        <span className="absolute z-10 px-3 py-1 text-[10.5px] font-semibold text-white rounded-full shadow top-3 left-3 bg-[#8B1E3F]">
          {item.tag}
        </span>

        {/* Virtual tour + favourite — top right */}
        <div className="absolute z-10 flex items-center gap-2 top-3 right-3">
          {item.tour && (
            <span className="flex items-center gap-1 px-2 py-1 text-[10px] text-white rounded-full bg-black/55 backdrop-blur-sm">
              <PiCubeFocus className="text-[12px]" />
              Virtual Tour
            </span>
          )}
          <button
            type="button"
            className={HEART_BTN_CLASS}
            aria-label={isFav ? "Remove from favourites" : "Add to favourites"}
            onClick={() => onToggleFav(item.id)}
          >
            <Heart
              size={16}
              stroke={isFav ? "none" : C_DEEP}
              color={isFav ? "#e11d48" : C_DEEP}
              fill={isFav ? "#e11d48" : "transparent"}
              strokeWidth={2}
            />
          </button>
        </div>

        {/* Verified — bottom left */}
        {item.verified && (
          <span className="absolute z-10 px-2 py-0.5 text-[9.5px] font-semibold text-white rounded bottom-3 left-3 bg-[#7a1235]">
            ✓ Verified
          </span>
        )}

        {/* Featured — bottom right */}
        {item.featured && (
          <span className="absolute z-10 px-2 py-0.5 text-[9.5px] font-semibold text-white rounded bottom-3 right-3 bg-yellow-500">
            FEATURED
          </span>
        )}
      </div>

      {/* ============ Details ============ */}
      <div className={DETAILS_CLASS}>
        {/* Title + price */}
        <div className="flex items-start justify-between gap-2">
          <h3 className={NAME_CLASS} title={item.title}>
            {item.title}
          </h3>
          <p className={PRICE_CLASS}>
            ₹ {formatPrice(item.price)}
            <span className="ml-1 text-[11px] font-medium text-gray-500">/ Per Month</span>
          </p>
        </div>

        {/* Subtitle */}
        <p
          className="flex items-center min-w-0 gap-1.5 m-0 text-[11.5px] text-gray-500"
          title={item.subtitle}
        >
          <FaMapMarkerAlt className="flex-shrink-0 text-[#8B1E3F]" />
          <span className="truncate">{item.subtitle}</span>
        </p>

        {/* Deposit + furnished */}
        <div className="flex items-center justify-between gap-2">
          <p className="m-0 text-[11px] text-gray-600">
            <span className="text-gray-500">Deposit:</span>{" "}
            <span className="font-semibold">₹ {item.deposit.toLocaleString("en-IN")}</span>
          </p>
          <span className={PILL_CLASS}>
            <MdCheckCircleOutline className="text-[13px]" />
            {item.furnished}
          </span>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 py-2.5 mt-1 border-y border-[#f1e7e3]">
          <div className="flex items-center gap-1.5 min-w-0 px-1">
            <MdApartment className={FEATURE_ICON_CLASS} />
            <div className="flex flex-col min-w-0">
              <span className={FEATURE_VALUE_CLASS}>{item.room}</span>
              <span className="text-[9px] text-gray-500 truncate">Room Type</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 min-w-0 pl-2.5 border-l border-[#f1e7e3]">
            <FaBath className={FEATURE_ICON_CLASS} />
            <div className="flex flex-col min-w-0">
              <span className={FEATURE_VALUE_CLASS}>{item.bath}</span>
              <span className="text-[9px] text-gray-500 truncate">Bathroom</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 min-w-0 pl-2.5 border-l border-[#f1e7e3]">
            <FaUtensils
              className={`flex-shrink-0 text-[13px] ${item.noMeals ? "text-gray-400" : "text-[#7a1235]"}`}
            />
            <div className="flex flex-col min-w-0">
              <span
                className={`${FEATURE_VALUE_CLASS} ${item.noMeals ? "text-gray-400 line-through" : ""}`}
              >
                {item.meals}
              </span>
              <span className="text-[9px] text-gray-500 truncate">Food</span>
            </div>
          </div>
        </div>

        {/* Footer: owner, posted by, days, share */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-1">
          <div className="flex items-center min-w-0 gap-2">
            <div className="flex items-center justify-center flex-shrink-0 w-7 h-7 overflow-hidden rounded-full bg-[#fbf3ec]">
              <AiOutlineUser className="text-[14px] text-[#7a1235]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-semibold text-gray-900 truncate">{OWNER.name}</span>
              <span className="flex items-center gap-1 text-[10px] text-gray-500 truncate">
                <AiOutlineClockCircle className="text-[11px]" />
                Posted by {OWNER.role} · {item.postedAgo} days ago
              </span>
            </div>
          </div>

          <FontAwesomeIcon
            icon={faShareNodes}
            className="flex-shrink-0 text-[14px] text-gray-500 transition-colors cursor-pointer hover:text-[#7a1235]"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onShare(item);
            }}
          />
        </div>
      </div>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */
const Student = () => {
  const sliderRef = useRef(null);
  const history = useHistory();
  const [favorites, setFavorites] = useState([]);

  const goToPricing = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    history.push(PRICING_ROUTE);
  }, [history]);

  const toggleFavorite = useCallback((id) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  }, []);

  const shareListing = useCallback(async (item) => {
    const url = `${window.location.origin}${PRICING_ROUTE}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: item.title, text: `${item.title} – ${item.subtitle}`, url });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch (e) {
      // share sheet dismissed, nothing to do
    }
  }, []);

  return (
    <div className="w-full bg-white px-4 py-2 sm:px-6 sm:py-3 md:px-8 lg:px-10 overflow-x-hidden">
      <div className="w-full">
        <div className="w-full">
          {/* ============ Header — same as BuyProperty ============ */}
          <div className="flex flex-col gap-3 mb-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#B9770E]">
                Handpicked for you
              </p>
              <h2
                className="text-[25px] font-semibold text-[#1B1113] sm:text-[26px]"
                style={{ fontFamily: '"Newsreader", Georgia, serif' }}
              >
                Student Plans
              </h2>
              <p className="text-[11.5px] text-gray-500">
                Find PGs, hostels and rental rooms near your college
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goToPricing}
                className="px-4 py-2 text-[12px] font-semibold text-[#7a1235] bg-white border border-[#eadfe2] rounded-lg hover:bg-[#7a1235] hover:text-white transition-colors"
              >
                View All
              </button>
              <button
                type="button"
                aria-label="Previous"
                onClick={() => sliderRef.current?.slickPrev()}
                className="items-center justify-center hidden w-9 h-9 bg-white border border-[#eadfe2] rounded-full shadow-sm sm:flex hover:bg-[#fbf3ec] transition-colors"
              >
                <GoArrowLeft className="text-[18px] text-[#7a1235]" />
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={() => sliderRef.current?.slickNext()}
                className="items-center justify-center hidden w-9 h-9 bg-white border border-[#eadfe2] rounded-full shadow-sm sm:flex hover:bg-[#fbf3ec] transition-colors"
              >
                <GoArrowRight className="text-[18px] text-[#7a1235]" />
              </button>
            </div>
          </div>

          <Slider
            {...SLIDER_SETTINGS}
            className="[&_.slick-track]:items-stretch [&_.slick-slide]:h-auto [&_.slick-slide>div]:h-full"
            ref={sliderRef}
          >
            {LISTINGS.map((item) => (
              <StudentCard
                key={item.id}
                item={item}
                isFav={favorites.includes(item.id)}
                onToggleFav={toggleFavorite}
                onShare={shareListing}
                onOpen={goToPricing}
              />
            ))}
          </Slider>

          {/* Mobile arrows, below the cards */}
          <div className="flex items-center justify-center gap-4 mt-4 sm:hidden">
            <button
              type="button"
              aria-label="Previous"
              className="flex items-center justify-center w-9 h-9 bg-white border border-[#eadfe2] rounded-full shadow-sm"
              onClick={() => sliderRef.current?.slickPrev()}
            >
              <GoArrowLeft className="text-[18px] text-[#7a1235]" />
            </button>
            <button
              type="button"
              aria-label="Next"
              className="flex items-center justify-center w-9 h-9 bg-white border border-[#eadfe2] rounded-full shadow-sm"
              onClick={() => sliderRef.current?.slickNext()}
            >
              <GoArrowRight className="text-[18px] text-[#7a1235]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Student;