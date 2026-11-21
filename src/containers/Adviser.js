import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const MAROON = "#8B1E3F";
const MAROON_DARK = "#7a1a37";

const ICONS = {
  home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  building: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  bolt: "M13 10V3L4 14h7v7l9-11h-7z",
  person: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  arrow: "M14 5l7 7m0 0l-7 7m7-7H3",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z",
};

const Icon = ({ d, className = "w-4 h-4", strokeWidth = 2 }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

const CATEGORIES = [
  {
    key: "owner",
    to: "/advisordashboard?label=Owner",
    image: "/image/featured1.jpg",
    badge: "Owner Properties",
    badgeIcon: ICONS.home,
    statLabel: "Owner Listings",
    desc: "Residential, commercial, PG & more, direct from verified owners.",
    cta: "Explore Owner Properties",
  },
  {
    key: "builder",
    to: "/advisordashboard?label=Builder",
    image: "/image/builder12.jpg",
    badge: "Builder Projects",
    badgeIcon: ICONS.building,
    statLabel: "Builders",
    desc: "RERA-registered projects from trusted and reputed builders.",
    cta: "Explore Builder Projects",
  },
  {
    key: "upcoming",
    to: "/advisordashboard?label=Upcoming",
    image: "/image/upcoming1.jpg",
    badge: "Upcoming Projects",
    badgeIcon: ICONS.bolt,
    statLabel: "Upcoming",
    desc: "New and pre-launch projects with great investment potential.",
    cta: "Explore Upcoming",
  },
];

const Adviser = ({ data }) => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [counts, setCounts] = useState({ owner: 0, builder: 0, upcoming: 0 });

  // Start the count animation once the section scrolls into view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Count up to 50, then show "50+" if the real value is higher
  useEffect(() => {
    if (!isVisible) return;

    const timers = [];

    const runCount = (key, target, finalLabel) => {
      const end = Math.min(target, 50);
      if (end <= 0) {
        setCounts((c) => ({ ...c, [key]: finalLabel }));
        return;
      }

      let count = 0;
      const stepTime = Math.max(Math.floor(1000 / end), 20);

      const id = setInterval(() => {
        count++;
        if (count >= end) {
          clearInterval(id);
          setCounts((c) => ({ ...c, [key]: finalLabel }));
        } else {
          setCounts((c) => ({ ...c, [key]: count }));
        }
      }, stepTime);

      timers.push(id);
    };

    if (data && data.status === 1) {
      const { owner_property_count = 0, builder_property_count = 0 } = data;
      runCount("owner", owner_property_count, owner_property_count > 50 ? "50+" : owner_property_count);
      runCount("builder", builder_property_count, builder_property_count > 50 ? "50+" : builder_property_count);
    } else {
      setCounts((c) => ({ ...c, owner: "50+", builder: "50+" }));
    }

    runCount("upcoming", 50, "50+");

    return () => timers.forEach(clearInterval);
  }, [isVisible, data]);

  return (
    <section ref={sectionRef} className="w-full bg-white px-6 py-2 sm:px-6 sm:py-3 md:px-8 lg:px-10 relative overflow-hidden">
      <div className="w-full relative z-10">

        {/* Section header */}
        <div className="flex flex-col gap-3 mb-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#B9770E]">
              Select Category
            </p>
            <h2
              className="text-[25px] font-semibold text-[#1B1113] sm:text-[26px]"
              style={{ fontFamily: '"Newsreader", Georgia, serif' }}
            >
              Choose Your Property Category
            </h2>
            <p className="text-[11.5px] text-gray-500">
              Explore verified listings and projects as per your need from trusted sources.
            </p>
          </div>
        </div>

        {/* Cards: 2 per row on mobile, 3 on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 items-stretch">
          {CATEGORIES.map((cat) => (
            <article
              key={cat.key}
              className="group flex flex-col h-full overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-900/5 transition-transform duration-300 ease-out hover:scale-[1.03] hover:shadow-lg"
            >
              {/* Image */}
              <div className="relative h-28 sm:h-44 flex-none overflow-hidden bg-slate-100">
                <img
                  src={cat.image}
                  alt={cat.badge}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent" />

                <span
                  className="absolute top-2 left-2 sm:top-3 sm:left-3 inline-flex items-center gap-1 max-w-[calc(100%-1rem)] bg-white/95 backdrop-blur-sm text-[10px] sm:text-xs font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow"
                  style={{ color: MAROON }}
                >
                  <Icon d={cat.badgeIcon} className="w-3 h-3 flex-none" strokeWidth={2} />
                  <span className="truncate">{cat.badge}</span>
                </span>
              </div>

              {/* Body */}
              <div className="flex flex-col flex-1 p-3 sm:p-5">
                {/* Stat row */}
                <div className="flex items-end gap-2 sm:gap-3">
                  <span
                    className="text-2xl sm:text-4xl font-black leading-none tracking-tight tabular-nums"
                    style={{ color: MAROON }}
                  >
                    {counts[cat.key]}
                  </span>
                  <span className="flex items-center gap-1 pb-0.5 text-[11px] sm:text-sm font-semibold text-slate-700 min-w-0">
                    <Icon d={ICONS.person} className="w-3.5 h-3.5 flex-none" strokeWidth={1.8} />
                    <span className="truncate">{cat.statLabel}</span>
                  </span>
                </div>

                <div className="my-2.5 sm:my-3 h-px bg-slate-100" />

                <p className="text-[11px] sm:text-sm text-slate-500 leading-snug sm:leading-relaxed">
                  {cat.desc}
                </p>

                {/* Button pinned to the bottom so all cards line up */}
                <div className="mt-auto pt-3 sm:pt-4">
                  <Link
                    to={cat.to}
                    className="no-underline hover:no-underline flex w-full items-center justify-center gap-1.5 rounded-full px-3 py-2 sm:py-2.5 text-[11px] sm:text-sm font-semibold text-white bg-[#8B1E3F] hover:bg-[#7a1a37] shadow-md shadow-maroon-900/20 transition-colors duration-200"
                  >
                    <span className="text-center leading-tight">{cat.cta}</span>
                    <Icon d={ICONS.arrow} className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-none" strokeWidth={2.5} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Adviser;