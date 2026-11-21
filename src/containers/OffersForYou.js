import React, { useRef } from "react";
import { useHistory, Link } from "react-router-dom";
import Slider from "react-slick";
import { FiGift, FiPercent, FiZap, FiShield, FiTag, FiArrowRight, FiArrowLeft, FiHeart, FiShare2, FiMapPin, FiClock, FiHome, FiBriefcase } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const MAROON = "#7a1433";
const NAVY = "#111b33";
const GOLD = "#f5b93a";
const FALLBACK_IMAGE = "/image/property-search.jpg";

// Price in Indian units: 10000000 -> "₹1.00 Cr", 7400000 -> "₹74.00 L"
const formatPrice = (value) => {
  const n = Number(value);
  if (!n || isNaN(n)) return "";
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(2)} K`;
  return `₹${n}`;
};

// 16-point star used for the SAVE badge
const STAR_POINTS = (() => {
  const pts = [];
  const count = 16;
  for (let i = 0; i < count * 2; i++) {
    const r = i % 2 === 0 ? 50 : 42;
    const a = (Math.PI * i) / count;
    pts.push(`${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
})();

/* ------------------------------------------------------------------ */
/* Static offers. Each one has its own image that matches its type.    */
/* They always show, and live offers from the backend are added before */
/* them as they arrive.                                                */
/* ------------------------------------------------------------------ */
const STATIC_OFFERS = [
  {
    _id: "static-festive-apartment",
    offer_name: "Festive Deal",
    offer_title: "Festive Savings on Apartments",
    offer_description: "Limited-time discount on selected ready apartments.",
    image: "/image/featured1.jpg",
    property_name: "Modern Apartments",
    property_price: 6500000,
    offer_price: 6175000,
    discount_percent: 5,
    address_area: "Baner",
    city_name: "Pune",
    property_category_type: "Buy",
    link: "/all-offers",
  },
  {
    _id: "static-builder-project",
    offer_name: "Builder Special",
    offer_title: "Launch Offer on New Projects",
    offer_description: "Pre-launch pricing on selected builder projects.",
    image: "/image/builder12.jpg",
    property_name: "Skyline Builder Project",
    property_price: 9800000,
    offer_price: 9016000,
    discount_percent: 8,
    address_area: "Whitefield",
    city_name: "Bengaluru",
    property_category_type: "Buy",
    link: "/all-offers",
  },
  {
    _id: "static-plot-deal",
    offer_name: "Early Bird",
    offer_title: "Early Bird Plot Offer",
    offer_description: "Reserve a plot early and save on the total price.",
    image: "/image/plots.jpg",
    property_name: "Residential Plot",
    property_price: 4200000,
    offer_price: 3864000,
    discount_percent: 8,
    address_area: "Hinjewadi",
    city_name: "Pune",
    property_category_type: "Buy",
    link: "/all-offers",
  },
  {
    _id: "static-pg-offer",
    offer_name: "PG Rent Offer",
    offer_title: "First Month Discount for Students",
    offer_description: "Save on your first month at selected PGs and co-living spaces.",
    image: "/image/pgpg.jpg",
    property_name: "Co-living Room",
    property_price: 0,
    offer_price: 0,
    rent: 9500,
    discount_percent: 10,
    address_area: "Koramangala",
    city_name: "Bengaluru",
    property_category_type: "Rent",
    link: "/all-offers",
  },
  {
    _id: "static-commercial-offer",
    offer_name: "Commercial Deal",
    offer_title: "Office Space Offer",
    offer_description: "Ready office spaces with special pricing this season.",
    image: "/image/commercial.jpg",
    property_name: "Office Space",
    property_price: 12500000,
    offer_price: 11250000,
    discount_percent: 10,
    address_area: "Bandra Kurla Complex",
    city_name: "Mumbai",
    property_category_type: "Buy",
    link: "/all-offers",
  },
];

const FEATURES = [
  { icon: FiGift, label: "Limited Period Offers" },
  { icon: FiPercent, label: "Attractive Discounts" },
  { icon: FiZap, label: "Hot Property Deals" },
  { icon: FiShield, label: "Verified Listings" },
];

// Picks the image for a card: static offers use their own file, live offers use the backend path
const imageOf = (offer) => {
  if (offer.image) return offer.image;
  if (offer.offer_img) return `${process.env.REACT_APP_API_URL}${offer.offer_img}`;
  return FALLBACK_IMAGE;
};

const OffersForYou = ({ data }) => {
  const sliderRef = useRef(null);
  const history = useHistory();

  // Live offers from the backend come first. Static offers always follow,
  // so the carousel always has cards and new live offers appear automatically.
  const liveOffers = data && data.status === 1 && Array.isArray(data.data) ? data.data : [];
  const cards = [...liveOffers, ...STATIC_OFFERS];

  // Three cards on desktop and tablet, one on phones. Infinite loop with autoplay.
  const settings = {
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    speed: 600,
    pauseOnHover: true,
    arrows: false,
    dots: false,
    adaptiveHeight: false,
    responsive: [{ breakpoint: 767, settings: { slidesToShow: 1 } }],
  };

  const stop = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const copyLink = (e, path) => {
    stop(e);
    navigator.clipboard?.writeText(`${window.location.origin}${path}`);
  };

  const renderCard = (offer) => {
    const isStatic = !!offer.image;
    const listed = Number(offer?.property_price) || 0;
    const offerPrice = Number(offer?.offer_price) || 0;
    const showPrice = offerPrice > 0 ? offerPrice : listed;
    const showStrike = offerPrice > 0 && listed > offerPrice;
    const discount =
      Number(offer?.discount_percent) ||
      (showStrike ? Math.round(((listed - offerPrice) / listed) * 100) : 0);
    const isRent = offer?.property_category_type === "Rent";
    const location = [offer?.address_area, offer?.city_name].filter(Boolean).join(", ");
    const detailId = isStatic ? null : offer?.property_id || offer?._id;
    const path = isStatic ? offer.link : detailId ? `/offerdetail/${detailId}` : "/all-offers";

    return (
      <Link
        to={{ pathname: path, state: isStatic ? undefined : { offer } }}
        className="group flex flex-col h-full w-full bg-white rounded-2xl overflow-hidden no-underline hover:no-underline shadow-[0_6px_22px_rgba(15,23,42,0.10)] transition-transform duration-300 hover:-translate-y-1"
      >
        {/* Image */}
        <div className="relative h-32 sm:h-36 lg:h-40 shrink-0">
          <img
            src={imageOf(offer)}
            alt={offer?.offer_title || offer?.property_name || "Offer"}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
          />

          {/* Top-left offer tag */}
          <span
            className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 bg-white rounded-full px-2 py-1 text-[9px] font-semibold shadow"
            style={{ color: MAROON }}
          >
            <HiSparkles className="text-[9px]" style={{ color: "#e8612c" }} />
            {offer?.offer_name || "Hot Deal"}
          </span>

          {/* Top-right actions */}
          <div className="absolute top-2.5 right-2.5 flex flex-col gap-2">
            <button
              type="button"
              aria-label="Save offer"
              onClick={stop}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-white shadow hover:scale-110 transition"
            >
              <FiHeart className="text-[10.5px]" style={{ color: NAVY }} />
            </button>
            <button
              type="button"
              aria-label="Share offer"
              onClick={(e) => copyLink(e, path)}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-white shadow hover:scale-110 transition"
            >
              <FiShare2 className="text-[10.5px]" style={{ color: NAVY }} />
            </button>
          </div>

          {/* Bottom-left listing type */}
          <span
            className="absolute bottom-2.5 left-0 text-white text-[9px] font-bold px-3 py-1 rounded-r shadow"
            style={{ background: MAROON }}
          >
            {isRent ? "FOR RENT" : "FOR BUY"}
          </span>

          {/* SAVE starburst */}
          {discount > 0 && (
            <div className="absolute bottom-2 right-2.5 w-14 h-14 flex flex-col items-center justify-center">
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-lg">
                <polygon
                  points={STAR_POINTS}
                  fill={MAROON}
                  stroke={GOLD}
                  strokeWidth="4"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="relative text-[9px] font-bold leading-none text-white tracking-wide">
                SAVE
              </span>
              <span className="relative text-[14px] font-extrabold leading-tight text-white">
                {discount}%
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 px-3.5 pt-3 pb-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-[14px] font-bold truncate" style={{ color: NAVY }}>
              {offer?.property_name || offer?.offer_name || "Hot Deal"}
            </h3>
            <div className="text-right shrink-0">
              {showStrike && (
                <p className="text-[10.5px] text-gray-500 line-through leading-tight">
                  {formatPrice(listed)}
                </p>
              )}
              <p className="text-[15.5px] font-extrabold leading-tight" style={{ color: MAROON }}>
                {isRent && !showPrice && offer?.rent
                  ? `₹${Number(offer.rent).toLocaleString("en-IN")}/mo`
                  : formatPrice(showPrice)}
              </p>
            </div>
          </div>

          {location && (
            <p className="mt-0.5 flex items-center gap-1.5 text-[10.5px] text-gray-700 truncate">
              <FiMapPin className="shrink-0" style={{ color: MAROON }} />
              {location}
            </p>
          )}

          <p className="mt-2 text-[12px] font-bold" style={{ color: NAVY }}>
            {offer?.offer_title || offer?.offer_name || "Special Offer"}
          </p>
          {offer?.offer_description && (
            <p className="mt-0.5 text-[10.5px] text-gray-600 line-clamp-2">{offer.offer_description}</p>
          )}

          <span
            className="mt-2 self-start inline-flex items-center gap-1 rounded px-2 py-1 text-[9px] font-semibold"
            style={{ background: "#fdf0cf", color: "#8a5a00" }}
          >
            <FiClock />
            Limited Time Deal
          </span>

          {/* Footer */}
          <div className="mt-auto pt-3 border-t border-dashed border-gray-300 flex flex-wrap items-center justify-between gap-x-2 gap-y-2">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] text-gray-800 min-w-0">
              <span className="flex items-center gap-1 whitespace-nowrap">
                <FiHome style={{ color: MAROON }} />
                Residential
              </span>
              <span style={{ color: MAROON }}>|</span>
              <span className="flex items-center gap-1 whitespace-nowrap">
                <FiBriefcase style={{ color: MAROON }} />
                Commercial
              </span>
            </div>
            <span
              className="shrink-0 whitespace-nowrap flex items-center gap-1 text-white text-[9px] font-semibold px-2.5 py-1.5 rounded shadow group-hover:brightness-110"
              style={{ background: MAROON }}
            >
              Claim Offer
              <FiArrowRight />
            </span>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <section className="w-full bg-white px-4 py-2 sm:px-6 sm:py-3 md:px-8 lg:px-10">
      {/* ───── Header ───── */}
      <div className="flex flex-col gap-3 mb-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#B9770E]">
            Deals of the Season
          </p>
          <h2
            className="text-[25px] font-semibold text-[#1B1113] sm:text-[26px]"
            style={{ fontFamily: '"Newsreader", Georgia, serif' }}
          >
            Hot Deals & Exclusive Offers
          </h2>
          <p className="text-[11.5px] text-gray-500">
            Limited-time property deals and special savings on selected properties.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => history.push("/all-offers")}
            className="flex items-center gap-2 text-white text-[10.5px] font-semibold px-4 py-2 rounded-lg shadow-lg hover:brightness-110 transition"
            style={{ background: MAROON }}
          >
            <FiTag className="text-[12px]" />
            View All Offers
            <FiArrowRight className="text-[12px]" />
          </button>
          <button
            type="button"
            aria-label="Previous offers"
            onClick={() => sliderRef.current?.slickPrev()}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition"
          >
            <FiArrowLeft className="text-[12px]" style={{ color: NAVY }} />
          </button>
          <button
            type="button"
            aria-label="Next offers"
            onClick={() => sliderRef.current?.slickNext()}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition"
          >
            <FiArrowRight className="text-[12px]" style={{ color: NAVY }} />
          </button>
        </div>
      </div>

      {/* ───── Feature strip ───── */}
      <div
        className="mt-3 rounded-full px-4 py-2 grid grid-cols-2 lg:grid-cols-4 gap-y-2"
        style={{ background: "#fde9ef" }}
      >
        {FEATURES.map(({ icon: Icon, label }, i) => (
          <div
            key={label}
            className={`flex items-center justify-center gap-2 text-[10.5px] font-semibold ${
              i > 0 ? "lg:border-l lg:border-[#e7bcc9]" : ""
            }`}
            style={{ color: NAVY }}
          >
            <Icon className="text-[14px]" style={{ color: MAROON }} />
            {label}
          </div>
        ))}
      </div>

      {/* ───── Offer slides: infinite loop, three cards per view ───── */}
      <div className="mt-3 overflow-hidden">
        {/* key changes when live offers arrive, so the loop rebuilds with the new list */}
        <Slider key={liveOffers.length} ref={sliderRef} {...settings}>
          {cards.map((offer) => (
            <div key={offer._id} className="h-full px-1.5 sm:px-2">
              {renderCard(offer)}
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default OffersForYou;