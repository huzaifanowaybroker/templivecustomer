import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useHistory } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaBuilding } from "react-icons/fa";

/* ================= CITY LANDMARK ICONS =================
   Simplified silhouettes of each city's best-known landmark.
   Each uses currentColor, so the colour comes from the className. */
const GatewayOfIndiaIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M2 20.5h20v1.5H2z" />
    <path d="M4 20V11a8 8 0 0 1 16 0v9h-4.5v-7a3.5 3.5 0 0 0-7 0v7z" />
    <rect x="10.5" y="1.5" width="3" height="2.5" />
  </svg>
);

const IndiaGateIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <rect x="3" y="4" width="18" height="2.5" />
    <path d="M4.5 21V8h15v13h-4.5v-8a3 3 0 0 0-6 0v8z" />
    <path d="M2 21.5h20v1.5H2z" />
  </svg>
);

const VidhanaSoudhaIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <rect x="9.5" y="3" width="5" height="4" />
    <rect x="7" y="7" width="10" height="4" />
    <rect x="2" y="11" width="20" height="10" />
    <path d="M1.5 21h21v1.5h-21z" />
  </svg>
);

const GopuramIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <rect x="11" y="1.5" width="2" height="2" />
    <rect x="10" y="3.5" width="4" height="3.5" />
    <rect x="9" y="7" width="6" height="4" />
    <rect x="8" y="11" width="8" height="4" />
    <rect x="7" y="15" width="10" height="6" />
  </svg>
);

const CharminarIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <circle cx="4" cy="4.5" r="1.5" />
    <circle cx="20" cy="4.5" r="1.5" />
    <rect x="3" y="6.5" width="2.5" height="14.5" />
    <rect x="18.5" y="6.5" width="2.5" height="14.5" />
    <path d="M6 21V10h12v11h-3.5v-5a2.5 2.5 0 0 0-5 0v5z" />
  </svg>
);

const VictoriaMemorialIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <rect x="11.2" y="2" width="1.6" height="3.5" />
    <circle cx="12" cy="2" r="1.2" />
    <path d="M6 16a6 6 0 0 1 12 0z" />
    <rect x="3" y="16" width="18" height="5" />
    <path d="M2 21.5h20v1.5H2z" />
  </svg>
);

const ShaniwarWadaIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    {[2, 6, 10, 14, 18].map((x) => (
      <rect key={x} x={x} y="8.5" width="2.5" height="2.5" />
    ))}
    <rect x="2" y="11" width="20" height="10" />
    <path d="M1.5 21h21v1.5h-21z" />
  </svg>
);

const SidiSaiyyedIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <rect x="2" y="7" width="2.5" height="14" />
    <rect x="19.5" y="7" width="2.5" height="14" />
    <circle cx="3.25" cy="6" r="1.4" />
    <circle cx="20.75" cy="6" r="1.4" />
    <rect x="4" y="15" width="16" height="6" />
    <path d="M7 15a5 5 0 0 1 10 0z" />
  </svg>
);

// Keys match the city names used in the list below (Bengaluru, not Bangalore)
const CITY_ICONS = {
  Mumbai: GatewayOfIndiaIcon,
  Delhi: IndiaGateIcon,
  Bengaluru: VidhanaSoudhaIcon,
  Chennai: GopuramIcon,
  Hyderabad: CharminarIcon,
  Kolkata: VictoriaMemorialIcon,
  Pune: ShaniwarWadaIcon,
  Ahmedabad: SidiSaiyyedIcon,
};

// Shows the city's landmark icon, or a generic building if none is mapped
const CityMark = ({ name, className }) => {
  const Mark = CITY_ICONS[name];
  return Mark ? (
    <Mark className={className} />
  ) : (
    <FaBuilding size={24} className={className} />
  );
};

const Cities = React.memo(({ data }) => {
  /* ================= LOGIC ================= */
  const [citiesData, setCitiesData] = useState([]);
  const history = useHistory();

  useEffect(() => {
    if (data && Array.isArray(data.data) && data.data.length > 0) {
      setCitiesData(data.data);
    } else {
      setCitiesData([{ city_name: "Default City", property_count: 0 }]);
    }
  }, [data]);

  const cities = useMemo(
    () => [
      { name: "Mumbai", imageUrl: "/image/mumbai.jpg", properties: "0" },
      { name: "Delhi", imageUrl: "/image/delhi.jpg", properties: "0" },
      { name: "Bengaluru", imageUrl: "/image/bengaluru.jpg", properties: "0" },
      { name: "Chennai", imageUrl: "/image/chennai.jpg", properties: "0" },
      { name: "Hyderabad", imageUrl: "/image/hyderabad.jpg", properties: "0" },
      { name: "Kolkata", imageUrl: "/image/kolata.jpg", properties: "0" },
      { name: "Pune", imageUrl: "/image/pune.jpg", properties: "0" },
      { name: "Ahmedabad", imageUrl: "/image/ahmedabad.jpg", properties: "0" },
    ],
    []
  );

  const updatedCities = useMemo(() => {
    return cities
      .map((city) => {
        const cityData = citiesData.find(
          (apiCity) => apiCity.city_name === city.name
        );
        return {
          ...city,
          propertyCount: cityData ? cityData.property_count : 0,
          properties: cityData ? `${cityData.property_count}+` : city.properties,
        };
      })
      .sort((a, b) => b.propertyCount - a.propertyCount);
  }, [cities, citiesData]);

  // Same navigation the search page uses: remember the city, then open its listing page
  const handleCityClick = useCallback(
    (cityName) => {
      try {
        sessionStorage.setItem("selectedCity", cityName);
        sessionStorage.setItem("cityName", cityName);
      } catch {
        /* storage may be unavailable (private mode); navigation still works */
      }
      history.push({
        pathname: `/citywiseproperties/${encodeURIComponent(cityName)}`,
      });
    },
    [history]
  );
  /* ================= END LOGIC ================= */

  /* ================= HIDE ON SCROLL (UI ONLY) ================= */
  const HIDE_AFTER = 80;
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onScroll = () => setHidden(window.scrollY > HIDE_AFTER);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 800,
    slidesToShow: 7,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    arrows: true,
    responsive: [
      { breakpoint: 1400, settings: { slidesToShow: 6, slidesToScroll: 1 } },
      { breakpoint: 1024, settings: { slidesToShow: 4, slidesToScroll: 1 } },
      { breakpoint: 768, settings: { slidesToShow: 3, slidesToScroll: 1 } },
      {
        breakpoint: 480,
        settings: { slidesToShow: 2, slidesToScroll: 1, arrows: false },
      },
    ],
  };

  return (
    <section
      aria-label="Explore Real Estate in Popular Indian Cities"
      className={`fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-[#5c0a22] via-[#7a0f2e] to-[#5c0a22] shadow-xl transition-transform duration-500 ${
        hidden ? "translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="flex flex-col items-center justify-between gap-1 px-2 py-1 mx-auto max-w-6xl lg:flex-row lg:gap-2 lg:px-3.5">
        {/* ---------- Left Title Area ---------- */}
        <div className="text-center lg:text-left shrink-0 lg:w-36">
          <p className="text-[5px] font-bold tracking-[0.18em] text-[#f2b632] uppercase">
            Explore Top Cities
          </p>
          <h2 className="text-[8.5px] font-semibold text-white leading-tight">
            Find Opportunities in Major Cities
          </h2>
        </div>

        {/* Divider */}
        <div className="hidden w-px h-5 bg-white/20 lg:block" />

        {/* ---------- City Carousel ---------- */}
        <div className="cities-carousel flex-1 w-full min-w-0 px-2 lg:px-2">
          <Slider {...sliderSettings}>
            {updatedCities.map((city) => (
              <div key={city.name}>
                <button
                  type="button"
                  className="flex flex-col items-center justify-center w-full gap-0.5 py-0.5 text-white transition bg-transparent border-0 cursor-pointer hover:scale-105 group"
                  onClick={() => handleCityClick(city.name)}
                  title={`${city.properties} properties in ${city.name}`}
                  aria-label={`Browse properties in ${city.name}`}
                >
                  <CityMark
                    name={city.name}
                    className="w-6 h-6 text-[#f2b632] transition-transform group-hover:scale-110"
                  />
                  <span className="text-[8.5px] font-medium tracking-tight leading-tight whitespace-nowrap mt-0.5">
                    {city.name}
                  </span>
                </button>
              </div>
            ))}
          </Slider>
        </div>
      </div>

      {/* ---------- Carousel & Arrow Styles ---------- */}
      <style>{`
        .cities-carousel .slick-slide { padding: 0 2px; }
        .cities-carousel .slick-prev,
        .cities-carousel .slick-next {
          z-index: 10;
          width: 14px;
          height: 14px;
        }
        .cities-carousel .slick-prev { left: -11px; }
        .cities-carousel .slick-next { right: -11px; }
        .cities-carousel .slick-prev::before,
        .cities-carousel .slick-next::before {
          color: #f2b632;
          font-size: 11px;
        }
      `}</style>
    </section>
  );
});

export default Cities;