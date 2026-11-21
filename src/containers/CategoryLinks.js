import React, { useEffect, useMemo, useState } from "react";
import { Link, Redirect } from "react-router-dom";
import { useCity } from "./SearchContext";

/* ============================================================
   DATA
   Add a city to CITIES, or a property type to TYPES, and it shows up everywhere.
   budgets are in lakhs. City_Wise works in rupees, so they are converted below.
   ============================================================ */
export const CITIES = [
  {
    slug: "pune",
    label: "Pune",
    localities: ["Wakad", "Kharadi", "Baner", "Hadapsar", "Pimple Saudagar", "Viman Nagar", "Pimpri", "Hinjewadi"],
    budgets: [45, 50, 60, 70, 80, 90],
  },
  {
    slug: "chennai",
    label: "Chennai",
    localities: ["Velachery", "Thiruvanmiyur", "Madipakkam", "Thoraipakkam", "Sholinganallur", "Medavakkam", "Mylapore", "Adyar", "T Nagar", "Perungudi"],
    budgets: [45, 50, 60, 70, 80, 90],
  },
  {
    slug: "mumbai",
    label: "Mumbai",
    localities: ["Andheri West", "Andheri East", "Malad West", "Navi Mumbai", "Powai", "Thane West", "Mira Road East", "Kharghar", "Kandivali East", "Bandra West"],
    budgets: [60, 70, 80, 90, 200],
  },
];

// buy / rent hold the exact City_Wise filter values for each type
export const TYPES = [
  {
    slug: "flats", label: "Flats", details: true,
    buy: { propertyType: "Buy", buildingType: "Residential", propertyType2: ["Flat/Apartment"] },
    rent: { propertyType: "Rent", buildingType: "Residential", propertyType2: ["Flat/Apartment"] },
  },
  {
    slug: "houses", label: "Houses",
    buy: { propertyType: "Buy", buildingType: "Residential", propertyType2: ["Home/Villa"] },
    rent: { propertyType: "Rent", buildingType: "Residential", propertyType2: ["Independent House/Villa"] },
  },
  {
    slug: "buildings", label: "Buildings",
    buy: { propertyType: "Buy", buildingType: "Residential", propertyType2: ["Builder Floor"] },
    rent: { propertyType: "Rent", buildingType: "Residential", propertyType2: ["Builder Floor"] },
  },
  {
    slug: "commercial-spaces", label: "Commercial",
    buy: { propertyType: "Commercial Buy", buildingType: "Commercial", propertyType2: [] },
    rent: { propertyType: "Commercial Lease", buildingType: "Commercial", propertyType2: [] },
  },
  {
    slug: "offices", label: "Offices",
    buy: { propertyType: "Commercial Buy", buildingType: "Commercial", propertyType2: ["Ready to move office space"] },
    rent: { propertyType: "Commercial Lease", buildingType: "Commercial", propertyType2: ["Office Space"] },
  },
  {
    slug: "shops", label: "Shops",
    buy: { propertyType: "Commercial Buy", buildingType: "Commercial", propertyType2: ["Retail"] },
    rent: { propertyType: "Commercial Lease", buildingType: "Commercial", propertyType2: ["Retail Shops/Showrooms"] },
  },
];

const BHK_OPTIONS = ["1 BHK", "2 BHK", "3 BHK", "4 BHK"];
const FURNISHED_OPTIONS = ["Furnished", "Semi-Furnished", "Unfurnished"];

// columns: "types" = one column per property type, "single" = one column for the city
export const TABS = [
  { id: "buyers", label: "For Buyers", verb: "sale", columns: "types", localities: true, budgets: true },
  { id: "tenants", label: "For Tenants", verb: "rent", columns: "types", localities: true },
  { id: "projects", label: "Projects", verb: "sale", columns: "single", localities: true },
  { id: "popular", label: "Popular Searches", verb: "sale", columns: "types", localities: true, budgets: true, details: true, limit: 3 },
];

/* ============================================================
   HELPERS
   ============================================================ */
const lakhLabel = (v) => (v >= 100 ? `${v / 100} Cr` : `${v} Lakhs`);

const toQuery = (obj) => {
  const s = new URLSearchParams(obj).toString();
  return s ? `?${s}` : "";
};

// Link to a listing path such as /flats-for-sale-in-pune, with filters in the query string
const listingLink = (type, city, verb, params, label) => ({
  label,
  to: { pathname: `/${type.slug}-for-${verb}-in-${city.slug}`, search: toQuery(params) },
});

// Builds the columns shown for one tab and city
const columnsFor = (tab, city) => {
  const limit = tab.limit || Infinity;

  if (tab.columns === "single") {
    return [
      {
        title: `Projects in ${city.label}`,
        groups: [
          {
            title: "Localities",
            links: city.localities.map((loc) => ({
              label: `Projects in ${loc}`,
              to: { pathname: `/citywiseproperties/${city.label}`, search: toQuery({ loc }) },
            })),
          },
        ],
      },
    ];
  }

  return TYPES.map((type) => {
    const groups = [];

    if (tab.localities) {
      groups.push({
        title: "Localities",
        links: city.localities.slice(0, tab.limit || 4).map((loc) =>
          listingLink(type, city, tab.verb, { loc }, `${type.label} for ${tab.verb} in ${loc}`)
        ),
      });
    }

    if (tab.budgets && tab.verb === "sale") {
      groups.push({
        title: "Budget",
        links: city.budgets.slice(0, tab.limit || 3).map((b) =>
          listingLink(type, city, tab.verb, { max: b * 100000 }, `${type.label} for sale below ${lakhLabel(b)}`)
        ),
      });
    }

    if (tab.details && type.details) {
      groups.push({
        title: "BHK",
        links: BHK_OPTIONS.slice(0, limit).map((bhk) =>
          listingLink(type, city, tab.verb, { bhk }, `${bhk} ${type.label.toLowerCase()} for ${tab.verb} in ${city.label}`)
        ),
      });
      groups.push({
        title: "Furnishing",
        links: FURNISHED_OPTIONS.slice(0, limit).map((furnished) =>
          listingLink(type, city, tab.verb, { furnished }, `${furnished} ${type.label.toLowerCase()} for ${tab.verb} in ${city.label}`)
        ),
      });
    }

    return {
      title: type.label,
      groups: groups.filter((g) => g.links.length),
      viewAll: listingLink(type, city, tab.verb, {}, `View all ${type.label.toLowerCase()} →`),
    };
  });
};

/* ============================================================
   ROUTING HELPERS
   Used by the routes file and by City_Wise.
   ============================================================ */

// Route: /:listing-in-:city_name  (e.g. /flats-for-sale-in-pune)
// Forwards to the city page and passes the listing name in the query string.
export const CategoryRedirect = ({ match, location }) => {
  const city = CITIES.find((c) => c.slug === match.params.city_name);
  if (!city) return <Redirect to="/" />;

  const params = new URLSearchParams(location.search);
  params.set("listing", match.params.listing);
  return <Redirect to={{ pathname: `/citywiseproperties/${city.label}`, search: `?${params.toString()}` }} />;
};

// Reads the query string on /citywiseproperties/:city_name and returns City_Wise filter values
export const filtersFromSearch = (search) => {
  const p = new URLSearchParams(search);
  const listing = p.get("listing") || "";
  const match = listing.match(/^(.+)-for-(sale|rent)$/);
  const type = match ? TYPES.find((t) => t.slug === match[1]) : null;
  const cfg = type ? (match[2] === "sale" ? type.buy : type.rent) : null;

  const bhk = p.get("bhk") || "";
  const furnished = p.get("furnished") || "";
  const min = p.get("min") || "";
  const max = p.get("max") || "";
  const searchQuery = p.get("loc") || "";

  return {
    hasFilters: Boolean(cfg || bhk || furnished || min || max || searchQuery),
    searchQuery,
    propertyType: cfg ? cfg.propertyType : "",
    buildingType: cfg ? cfg.buildingType : "",
    propertyType2: cfg ? [...cfg.propertyType2] : [],
    bhkType: bhk,
    furnishedStatus: furnished,
    minPrice: min,
    maxPrice: max,
  };
};

/* ============================================================
   STYLES (project palette: maroon #7a1235, gold #e3b23c, cream #fbf3ec)
   ============================================================ */
const CSS = `
  .zb-cl { background: #fbf3ec; color: #2b2320; border-top: 1px solid #eadfd6; }
  .zb-cl__tabs { display: flex; border-bottom: 1px solid #eadfd6; }
  .zb-cl__tab {
    position: relative; overflow: hidden; flex: 1 1 0; padding: 14px 18px; background: none; border: 0;
    color: #6b625c; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: .2px;
    cursor: pointer; white-space: nowrap; transition: color .3s; z-index: 0;
  }
  .zb-cl__tab::before {
    content: ""; position: absolute; inset: 0; z-index: -1;
    background: linear-gradient(to top, rgba(122,18,53,.10), transparent);
    transform: scaleY(0); transform-origin: bottom; transition: transform .45s cubic-bezier(.22,1,.36,1);
  }
  .zb-cl__tab::after {
    content: ""; position: absolute; left: 14px; right: 14px; bottom: -1px; height: 2px;
    background: #7a1235; transform: scaleX(0); transition: transform .4s cubic-bezier(.22,1,.36,1);
  }
  .zb-cl__tab:hover::before { transform: scaleY(1); }
  .zb-cl__tab:hover, .zb-cl__tab[aria-selected="true"] { color: #7a1235; }
  .zb-cl__tab:hover::after, .zb-cl__tab[aria-selected="true"]::after { transform: scaleX(1); }
  .zb-cl__tab:focus-visible { outline: 2px solid #7a1235; outline-offset: -2px; }

  .zb-cl__cities { display: flex; flex-wrap: wrap; gap: 10px; padding: 12px 0 0; }
  .zb-cl__pill {
    position: relative; overflow: hidden; z-index: 0; padding: 8px 18px; border-radius: 999px;
    border: 1px solid #7a1235; background: #fff; color: #7a1235; font-size: 15px; font-weight: 600;
    cursor: pointer; transition: color .3s, transform .3s cubic-bezier(.22,1,.36,1), box-shadow .3s;
  }
  .zb-cl__pill::before {
    content: ""; position: absolute; inset: 0; z-index: -1; background: #7a1235;
    transform: scaleX(0); transform-origin: left; transition: transform .4s cubic-bezier(.22,1,.36,1);
  }
  .zb-cl__pill:hover { color: #fff; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(122,18,53,.18); }
  .zb-cl__pill:hover::before, .zb-cl__pill[aria-selected="true"]::before { transform: scaleX(1); }
  .zb-cl__pill[aria-selected="true"] { color: #fff; background: #7a1235; }
  .zb-cl__pill:focus-visible { outline: 2px solid #e3b23c; outline-offset: 2px; }

  .zb-cl__heading {
    position: relative; display: inline-block; margin: 14px 0 14px; padding-bottom: 6px;
    font-size: 18px; font-weight: 600; color: #2b2320;
  }
  .zb-cl__heading::after {
    content: ""; position: absolute; left: 0; bottom: 0; width: 100%; height: 3px; background: #7a1235;
    transform-origin: left; animation: zbClBar .7s cubic-bezier(.22,1,.36,1) both;
  }

  .zb-cl__grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 14px; padding-bottom: 24px; }
  .zb-cl__col {
    background: #fff; border: 1px solid #eadfd6; border-radius: 12px; padding: 14px 14px 10px;
    transition: transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s, border-color .35s;
    animation: zbClIn .5s cubic-bezier(.22,1,.36,1) both;
  }
  .zb-cl__col:hover { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(122,18,53,.12); border-color: #7a1235; }
  .zb-cl__colname {
    margin: 0 0 8px; padding-bottom: 6px; border-bottom: 2px solid #e3b23c;
    font-size: 14px; font-weight: 700; color: #7a1235;
  }
  .zb-cl__subtitle {
    margin: 10px 0 4px; font-size: 10px; font-weight: 700; letter-spacing: 1.2px;
    text-transform: uppercase; color: #b9803a;
  }
  .zb-cl__list { list-style: none; margin: 0; padding: 0; }
  .zb-cl__item { animation: zbClIn .45s cubic-bezier(.22,1,.36,1) both; }
  .zb-cl__link {
    display: inline-block; padding: 2px 6px; margin: 0 0 1px -6px; border-radius: 4px;
    color: #2b2320; text-decoration: none; font-size: 12.5px; line-height: 1.35;
    transition: background-color .25s, color .25s, transform .25s cubic-bezier(.22,1,.36,1);
  }
  .zb-cl__link:hover { background: rgba(122,18,53,.10); color: #7a1235; transform: translateX(3px); }
  .zb-cl__link:focus-visible { outline: 2px solid #7a1235; outline-offset: 2px; }
  .zb-cl__empty { color: #6b625c; font-size: 13px; margin: 0; }
  .zb-cl__viewall { display: inline-block; margin-top: 10px; font-size: 11px; font-weight: 700; color: #7a1235; text-decoration: none; }
  .zb-cl__viewall:hover { text-decoration: underline; }

  @keyframes zbClIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  @keyframes zbClBar { from { transform: scaleX(0); } to { transform: scaleX(1); } }

  @media (max-width: 1100px) { .zb-cl__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
  @media (max-width: 640px) {
    .zb-cl__tabs { overflow-x: auto; }
    .zb-cl__tab { flex: 0 0 auto; font-size: 14px; padding: 12px; }
    .zb-cl__pill { padding: 7px 14px; font-size: 14px; }
    .zb-cl__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (prefers-reduced-motion: reduce) {
    .zb-cl *, .zb-cl *::before, .zb-cl *::after { animation: none !important; transition: none !important; }
  }
`;

/* ============================================================
   COMPONENT
   ============================================================ */
const CategoryLinks = () => {
  const { searchCity } = useCity();

  const cityFromSearch = (name) =>
    CITIES.find((c) => c.label.toLowerCase() === String(name || "").trim().toLowerCase());

  const [tabId, setTabId] = useState(TABS[0].id);
  const [citySlug, setCitySlug] = useState((cityFromSearch(searchCity) || CITIES[0]).slug);

  // When the header search picks a city, the links switch to that city
  useEffect(() => {
    const match = cityFromSearch(searchCity);
    if (match) setCitySlug(match.slug);
  }, [searchCity]);

  const tab = TABS.find((t) => t.id === tabId);
  const city = CITIES.find((c) => c.slug === citySlug);
  const columns = useMemo(() => columnsFor(tab, city), [tab, city]);

  return (
    <section className="zb-cl" aria-label="Browse property listings">
      <style>{CSS}</style>

      <div role="tablist" className="zb-cl__tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={t.id === tabId}
            className="zb-cl__tab"
            onClick={() => setTabId(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tablist" className="zb-cl__cities">
        {CITIES.map((c) => (
          <button
            key={c.slug}
            type="button"
            role="tab"
            aria-selected={c.slug === citySlug}
            className="zb-cl__pill"
            onClick={() => setCitySlug(c.slug)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <h3 className="zb-cl__heading">
        {tab.label}: {city.label}
      </h3>

      <div className="zb-cl__grid">
        {columns.map((col) => (
          <div key={col.title} className="zb-cl__col">
            <h4 className="zb-cl__colname">{col.title}</h4>
            {col.groups.length === 0 && <p className="zb-cl__empty">No links yet.</p>}
            {col.groups.map((g) => (
              <div key={g.title}>
                <h5 className="zb-cl__subtitle">{g.title}</h5>
                <ul className="zb-cl__list">
                  {g.links.map((l, i) => (
                    <li key={`${l.label}-${i}`} className="zb-cl__item" style={{ animationDelay: `${Math.min(i, 20) * 15}ms` }}>
                      <Link to={l.to} className="zb-cl__link">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {col.viewAll && (
              <Link to={col.viewAll.to} className="zb-cl__viewall">
                {col.viewAll.label}
              </Link>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategoryLinks;