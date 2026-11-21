import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { GoArrowLeft, GoArrowRight } from "react-icons/go";
const SITE_NAME = "ZeroBriks";
const SECTION_ID = "explore-services-heading";
const AUTO_SLIDE_MS = 3500;

/* Each service is one card. `propertyType` and `payloadKey` are passed to
   /property through router state, exactly as before. */
const SERVICES = [
  {
    id: "residential",
    title: "Residential Properties",
    short: "Apartments, flats, villas and houses",
    description:
      "Discover verified apartments, flats, villas, independent houses and residential properties for sale and rent, listed directly by owners.",
    image: "/image/plots.jpg",
    alt: "Verified residential apartments and villas for sale and rent",
    propertyType: "Residential",
    payloadKey: "building_type",
  },
  {
    id: "commercial",
    title: "Commercial Properties",
    short: "Shops, offices and warehouses",
    description:
      "Find verified shops, offices, showrooms, warehouses and commercial spaces for your business and investment needs.",
    image: "/image/leasing.jpg",
    alt: "Commercial office and retail spaces for lease and sale",
    propertyType: "Commercial",
    payloadKey: "building_type",
  },
  {
    id: "plots",
    title: "Plots & Land",
    short: "Residential, commercial and agricultural land",
    description:
      "Explore residential, commercial, agricultural and investment plots, with location, size and ownership details.",
    image: "/image/commercial.jpg",
    alt: "Residential and commercial plots of land for sale",
    propertyType: "Buy",
    payloadKey: "property_category_type",
  },
  {
    id: "pg",
    title: "PG & Co-Living",
    short: "Shared rooms for students and professionals",
    description:
      "Find comfortable PGs, shared accommodation and co-living spaces for students and working professionals.",
    image: "/image/pgpg.jpg",
    alt: "Comfortable PG and co-living rooms for students and professionals",
    propertyType: "PG/Co-living",
    payloadKey: "property_category_type",
  },
];

/* Structured data so search engines can read the services as a list. */
const buildJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Real estate services",
  itemListElement: SERVICES.map((s, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: s.title,
    description: s.description,
    url: `${typeof window !== "undefined" ? window.location.origin : ""}/property`,
  })),
});

const ExploreServices = () => {
  const trackRef = useRef(null);
  const [paused, setPaused] = useState(false);

  /* Width of one card plus its gap, and of one full set of cards. */
  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track || !track.children.length) return null;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const step = track.children[0].getBoundingClientRect().width + gap;
    return { track, step, setWidth: step * SERVICES.length };
  }, []);

  /* The cards are rendered three times in a row and the view sits on the
     middle copy. Whenever it drifts into the first or last copy, move it back
     by exactly one set. The cards are identical, so the jump is invisible and
     the row never reaches an end. */
  const recenter = useCallback(() => {
    const m = measure();
    if (!m) return;
    const { track, setWidth } = m;
    if (track.scrollLeft >= setWidth * 2 - 2) {
      track.scrollLeft -= setWidth;
    } else if (track.scrollLeft < setWidth - 2) {
      track.scrollLeft += setWidth;
    }
  }, [measure]);

  /* Slide by one card, in either direction, forever. */
  const slide = useCallback(
    (direction = 1) => {
      recenter();
      const m = measure();
      if (!m) return;
      m.track.scrollBy({ left: direction * m.step, behavior: "smooth" });
    },
    [measure, recenter]
  );

  /* Start on the middle copy, re-centre after every scroll settles (auto,
     arrows or swipe), and reset on resize because card widths change. */
  useEffect(() => {
    const m = measure();
    if (!m) return undefined;
    const { track } = m;

    const toMiddle = () => {
      const fresh = measure();
      if (fresh) track.scrollLeft = fresh.setWidth;
    };
    toMiddle();

    let settleTimer;
    const onScroll = () => {
      clearTimeout(settleTimer);
      settleTimer = setTimeout(recenter, 120);
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", toMiddle);
    return () => {
      clearTimeout(settleTimer);
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", toMiddle);
    };
  }, [measure, recenter]);

  /* Auto-slide. Stops while hovered, focused or touched, and for users who
     have asked their device to reduce motion. */
  useEffect(() => {
    if (paused) return undefined;
    if (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return undefined;
    }
    const timer = setInterval(() => slide(1), AUTO_SLIDE_MS);
    return () => clearInterval(timer);
  }, [paused, slide]);

  const pause = () => setPaused(true);
  const resume = () => setPaused(false);

  return (
    /* Same side padding and vertical spacing as BuyProperty */
    <section
      aria-labelledby={SECTION_ID}
      className="w-full bg-white px-6 py-2 sm:px-6 sm:py-3 md:px-8 lg:px-10 overflow-x-hidden"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd()) }}
      />

      <div className="w-full">
        {/* Heading block, with the previous / next buttons on the right */}
        <header className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#B9770E]">
              {SITE_NAME} services
            </p>
            <h2
              id={SECTION_ID}
              className="text-[25px] font-semibold text-[#1B1113] sm:text-[26px]"
              style={{ fontFamily: '"Newsreader", Georgia, serif' }}
            >
              Explore Our Real Estate Services
            </h2>
            <p className="text-[11.5px] text-gray-500">
              Find, buy, rent, sell and invest in property with confidence. Every listing is
              verified, and there is no brokerage.
            </p>
          </div>

          <div className="hidden sm:flex flex-shrink-0 gap-2">
            <button
              type="button"
              onClick={() => slide(-1)}
              aria-label="Previous service"
              className="items-center justify-center hidden w-9 h-9 bg-white border border-[#eadfe2] rounded-full shadow-sm sm:flex hover:bg-[#fbf3ec] transition-colors"
            >
              <GoArrowLeft className="text-[18px] text-[#7a1235]" />
            </button>
            <button
              type="button"
              onClick={() => slide(1)}
              aria-label="Next service"
              className="items-center justify-center hidden w-9 h-9 bg-white border border-[#eadfe2] rounded-full shadow-sm sm:flex hover:bg-[#fbf3ec] transition-colors"
            >
              <GoArrowRight className="text-[18px] text-[#7a1235]" />
            </button>
          </div>
        </header>

        {/* One-row carousel. Still a real list, so crawlers and screen readers
            treat it as one group. Swipe / scroll works by hand as well. */}
        <ul
          ref={trackRef}
          role="list"
          onMouseEnter={pause}
          onMouseLeave={resume}
          onFocus={pause}
          onBlur={resume}
          onTouchStart={pause}
          onTouchEnd={resume}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {/* Three copies of the cards. Only the middle copy is exposed to
              screen readers and keyboard users; the other two are visual
              filler for the endless loop. */}
          {[0, 1, 2].flatMap((copy) =>
            SERVICES.map((service) => {
              const isClone = copy !== 1;
              return (
                <li
                  key={`${copy}-${service.id}`}
                  aria-hidden={isClone ? "true" : undefined}
                  className="snap-start flex-shrink-0 w-[85%] sm:w-[calc(50%-0.5rem)] lg:w-[calc((100%-2rem)/3)]"
                >
                  <Link
                    tabIndex={isClone ? -1 : undefined}
                    to={{
                      pathname: "/property",
                      state: {
                        propertyType: service.propertyType,
                        payloadKey: service.payloadKey,
                      },
                    }}
                    aria-label={`${service.title}: ${service.short}`}
                    className="group flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4 h-full rounded-xl border border-gray-200 bg-white p-3 no-underline hover:no-underline text-gray-800 transition-all duration-200 hover:border-[#7A1230]/40 hover:shadow-md focus-visible:outline-2 focus-visible:outline-[#7A1230] focus-visible:outline-offset-2"
                  >
                    {/* One image per card, sized so the layout does not shift while loading */}
                    <div className="h-36 w-full flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-auto sm:w-32">
                      <img
                        src={service.image}
                        alt={service.alt}
                        width={128}
                        height={96}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    <div className="flex min-w-0 flex-col justify-center">
                      <h3 className="text-base font-semibold text-gray-900 group-hover:text-[#7A1230]">
                        {service.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 leading-snug">{service.description}</p>
                      <span className="mt-2 text-xs font-semibold text-[#7A1230]">
                        Browse {service.title.toLowerCase()} &rarr;
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </section>
  );
};

export default ExploreServices;