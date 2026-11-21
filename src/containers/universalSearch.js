// universalSearch.js
// 99acres-style universal search for ZeroBriks. Needs no extra npm packages.
//
//   1. parseUniversalQuery    "3 bhk flat in pune under 50 lakh"  ->  structured query
//   2. describeQuery / describeFilters   query or filters  ->  "3 BHK Flats for Sale in Pune"
//   3. analyzeQuery           text typed so far  ->  suggestions ("5 BHK Projects in Surat" ...)
//   4. buildSearchState / readSearchState / mergeLocations
//                             query  <->  router state the results page understands
//   5. filterByLocality / filterListings   helpers for listings already loaded in the browser
//   6. searchPropertiesByName listings whose name matches the typed text ("finland")
//   7. useSearchSuggestions   React hook shared by the home search card and the navbar search

import { useEffect, useMemo, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/* 0. VOCABULARY                                                       */
/* ------------------------------------------------------------------ */

const UNITS = {
  k: 1e3, thousand: 1e3,
  l: 1e5, lac: 1e5, lacs: 1e5, lakh: 1e5, lakhs: 1e5,
  cr: 1e7, crore: 1e7, crores: 1e7,
};

// Cities offered when no city has been typed yet ("5 BHK Projects in Pune", "... in Mumbai").
// Put the cities where you have the most listings first.
export const POPULAR_CITIES = [
  "Pune", "Mumbai", "Bengaluru", "Hyderabad", "Delhi", "Chennai", "Ahmedabad", "Kolkata",
];

// City name as stored in listings -> other spellings and common typos
const CITIES = {
  Pune: ["Poona", "Puna", "Puine", "Punee", "Pnue"],
  Mumbai: ["Bombay", "Mumbia", "Mumbay", "Mumabi"],
  "Navi Mumbai": ["New Mumbai"],
  Thane: ["Thana"],
  Bengaluru: ["Bangalore", "Bengalore", "Banglore", "Bangaluru"],
  Hyderabad: ["Hydrabad"],
  Delhi: ["New Delhi", "Dehli", "Dilli"],
  Noida: ["Nodia"],
  "Greater Noida": [],
  Gurugram: ["Gurgaon"],
  Ghaziabad: [],
  Faridabad: [],
  Chennai: ["Madras"],
  Kolkata: ["Calcutta"],
  Ahmedabad: ["Ahmadabad", "Amdavad"],
  Surat: [],
  Vadodara: ["Baroda"],
  Rajkot: [],
  Gandhinagar: [],
  Nashik: ["Nasik"],
  Nagpur: [],
  Aurangabad: [],
  Kolhapur: [],
  Jaipur: [],
  Udaipur: [],
  Jodhpur: [],
  Lucknow: [],
  Kanpur: [],
  Varanasi: ["Banaras"],
  Agra: [],
  Indore: [],
  Bhopal: [],
  Raipur: [],
  Chandigarh: [],
  Mohali: [],
  Ludhiana: [],
  Amritsar: [],
  Kochi: ["Cochin", "Kochin"],
  Thiruvananthapuram: ["Trivandrum"],
  Kozhikode: ["Calicut"],
  Coimbatore: [],
  Mysuru: ["Mysore"],
  Mangaluru: ["Mangalore"],
  Visakhapatnam: ["Vizag"],
  Vijayawada: [],
  Patna: [],
  Ranchi: [],
  Bhubaneswar: [],
  Guwahati: [],
  Dehradun: [],
  Goa: [],
};

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const CITY_NAMES = Object.keys(CITIES);
const CITY_BY_SPELLING = {};
const CITY_MATCHERS = [];
CITY_NAMES.forEach((name) => {
  [name, ...CITIES[name]].forEach((term) => {
    CITY_BY_SPELLING[term.toLowerCase()] = name;
    CITY_MATCHERS.push({
      name,
      term: term.toLowerCase(),
      re: new RegExp(`\\b${escapeRe(term.toLowerCase()).replace(/\s+/g, "\\s+")}\\b`, "g"),
    });
  });
});
// Longest names first so "New Delhi" wins over "Delhi" and "Navi Mumbai" over "Mumbai"
CITY_MATCHERS.sort((a, b) => b.term.length - a.term.length);

// "bangalore" -> "Bengaluru". Returns "" when the name is not a known city.
export const canonicalCity = (name = "") =>
  CITY_BY_SPELLING[String(name).trim().toLowerCase()] || "";

// Property types, checked in order. Longer phrases first so "farm house" is not read as "house".
const TYPE_RULES = [
  ["service_apartment", /\bserviced? apartments?\b/g],
  ["builder_floor", /\b(?:builder|independent) floors?\b/g],
  ["farmhouse", /\bfarm ?houses?\b/g],
  ["cold_storage", /\bcold storages?\b/g],
  ["warehouse", /\b(?:ware ?houses?|godowns?)\b/g],
  ["factory", /\b(?:factor(?:y|ies)|industrial sheds?|manufacturing units?)\b/g],
  ["studio", /\b(?:studios?(?: apartments?)?|1\s*rk)\b/g],
  ["apartment", /\b(?:flats?|apartments?|apts?)\b/g],
  ["villa", /\b(?:villas?|bungalows?)\b/g],
  ["house", /\b(?:(?:independent |row )?houses?|kothis?|independent)\b/g],
  ["plot", /\b(?:(?:industrial |agricultural |commercial |farm ?)?lands?|plots?|acres?)\b/g],
  ["office", /\boffices?(?: spaces?)?\b/g],
  ["shop", /\b(?:shops?|showrooms?|retail(?: spaces?)?)\b/g],
  ["pg", /\b(?:pgs?|paying guests?|hostels?|co[\s-]?living|coliving|shared rooms?)\b/g],
  ["room", /\brooms?\b/g],
];

// Plural nouns used in headings and suggestions
const TYPE_NOUNS = {
  apartment: "Flats",
  villa: "Villas",
  house: "Houses",
  plot: "Plots",
  studio: "Studio Apartments",
  farmhouse: "Farmhouses",
  builder_floor: "Builder Floors",
  service_apartment: "Service Apartments",
  office: "Office Spaces",
  shop: "Shops",
  warehouse: "Warehouses",
  factory: "Factories",
  cold_storage: "Cold Storages",
  pg: "PGs",
  room: "Rooms",
};

// Types that have bedrooms and can be bought or rented as a home
const HOME_KEYS = new Set([
  "apartment", "house", "villa", "builder_floor", "studio", "service_apartment", "farmhouse",
]);

const PREPOSITIONS = new Set(["in", "at", "near", "around"]);

// Words that carry no location or property meaning
const STOP = new Set(
  (
    "in at near around for the a an with and or of to on under below above over less than more " +
    "max min upto up within least sale buy buying sell selling purchase resale rent rental renting " +
    "lease leasing let available need want looking rs inr bhk by from between budget price " +
    "property properties home homes residential commercial me my i show find search get please " +
    "is are any all some only this that india nearby space spaces"
  ).split(" ")
);

const capitalize = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());

/* ------------------------------------------------------------------ */
/* 1. TYPO FIXING                                                      */
/* ------------------------------------------------------------------ */
// Deliberately conservative: a wrong "correction" would silently change the search.
// Short city names are covered by the spellings listed in CITIES instead.

const TYPOS = {
  iun: "in", inn: "in", iin: "in", fro: "for", neer: "near",
  bkh: "bhk", bhkk: "bhk", bhks: "bhk",
};

// Words the parser already understands; never "corrected"
const KNOWN = new Set(
  (
    "service serviced apartment apartments builder builders independent floor floors farm farmhouse " +
    "farmhouses house houses cold storage storages ware warehouse warehouses godown godowns factory " +
    "factories industrial agricultural shed sheds manufacturing unit units studio studios flat flats " +
    "apts villa villas bungalow bungalows kothi kothis plot plots land lands acre acres " +
    "farmland office offices shop shops showroom showrooms retail paying guest guests hostel hostels " +
    "coliving living shared room rooms rents project projects owner owners broker brokers brokerage " +
    "zero without direct furnished unfurnished semi fully ready move construction launch launches " +
    "upcoming possession lakh lakhs lacs crore crores thousand bedroom bedrooms maximum minimum " +
    "starting near"
  ).split(" ")
);

// Common place-name words that sit one letter away from a search word
const PROTECTED = new Set(
  "hotel hotels tower towers officer officers abode floors horse house rooms".split(" ")
);

const FUZZY_TARGETS = [
  ...(
    "flat plot shop room land rent sale near apartment house villa bungalow office showroom " +
    "warehouse godown hostel studio farmhouse factory lease rental project builder furnished " +
    "unfurnished commercial property properties budget below bedroom"
  )
    .split(" ")
    .map((word) => ({ word, city: false })),
  // Only long city names: short ones collide with real localities (Bopal / Bhopal)
  ...Object.keys(CITY_BY_SPELLING)
    .filter((w) => w.length >= 7 && !w.includes(" "))
    .map((word) => ({ word, city: true })),
];

// Edit distance where swapping two neighbouring letters counts as one edit
const editDistance = (a, b) => {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
};

const sameLetters = (a, b) => a.split("").sort().join("") === b.split("").sort().join("");

const fixToken = (tok) => {
  if (TYPOS[tok]) return TYPOS[tok];
  if (
    tok.length < 4 || KNOWN.has(tok) || STOP.has(tok) || PROTECTED.has(tok) ||
    CITY_BY_SPELLING[tok]
  ) {
    return tok;
  }
  let best = "";
  let bestDistance = 3;
  let tie = false;
  for (const { word, city } of FUZZY_TARGETS) {
    if (word[0] !== tok[0] || Math.abs(word.length - tok.length) > 2) continue;
    const dist = editDistance(tok, word);
    let allowed;
    if (tok.length === 4) {
      // 4-letter words: only two swapped letters ("falt" -> "flat")
      allowed = dist === 1 && word.length === 4 && sameLetters(tok, word);
    } else if (dist === 1) {
      allowed = word.length >= 5;
    } else {
      allowed = dist === 2 && !city && tok.length >= 8 && word.length >= 8;
    }
    if (!allowed) continue;
    if (dist < bestDistance) {
      best = word;
      bestDistance = dist;
      tie = false;
    } else if (dist === bestDistance && word !== best) {
      tie = true;
    }
  }
  return best && !tie ? best : tok;
};

// Lowercases, strips currency marks and fixes typos word by word
const normalize = (raw) =>
  String(raw)
    .toLowerCase()
    .replace(/₹|\brs\.?(?=\s*\d)|\binr\b/g, " ")
    .replace(/(\d),(?=\d)/g, "$1")
    .replace(/,/g, " ")
    .replace(/(\d)\s*-\s*(?=bhk)/g, "$1 ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((tok) => (/^[a-z]+$/.test(tok) ? fixToken(tok) : tok))
    .join(" ");

/* ------------------------------------------------------------------ */
/* 2. PARSER: free text -> structured query                            */
/* ------------------------------------------------------------------ */

const UNIT_RE = "(thousand|lakhs?|lacs?|crores?|cr|k|l)";
const NUM_RE = "(\\d+(?:\\.\\d+)?)";
// "20 to 30 lakh", "between 50 lakh and 1 cr"
const RANGE_RE = new RegExp(
  `\\b(?:between |from )?${NUM_RE}\\s*${UNIT_RE}?\\s*(?:to|and|-)\\s*${NUM_RE}\\s*${UNIT_RE}\\b`
);
// "between 10000 and 20000"
const BETWEEN_RE = new RegExp(`\\b(?:between|from) ${NUM_RE}\\s*(?:to|and|-)\\s*${NUM_RE}\\b`);
// "under 1000", "10 lakh", "above 2 cr", "50k"
const SINGLE_RE = new RegExp(
  "\\b(under|below|upto|up to|less than|within|max(?:imum)?|above|over|more than|" +
    `min(?:imum)?|at least|starting|budget)?\\s*${NUM_RE}\\s*${UNIT_RE}?\\b`,
  "g"
);

// `hasCurrency`: the text had a ₹ / Rs mark, so a plain number such as "₹50,000" is a budget
const parseBudget = (t, hasCurrency) => {
  const amount = (n, unit) => Number(n) * (unit ? UNITS[unit] : 1);

  let m = t.match(RANGE_RE);
  if (m) {
    return { min: amount(m[1], m[2] || m[4]), max: amount(m[3], m[4]), rest: t.replace(m[0], " ") };
  }
  m = t.match(BETWEEN_RE);
  if (m) return { min: Number(m[1]), max: Number(m[2]), rest: t.replace(m[0], " ") };

  for (const s of t.matchAll(SINGLE_RE)) {
    const [whole, keyword, n, unit] = s;
    // A bare number is not a budget. It needs a keyword ("under") or a unit ("lakh").
    if (!keyword && !unit && !hasCurrency) continue;
    const value = amount(n, unit);
    if (!unit && value < 500) continue;
    const isMin = /above|over|more|min|least|starting/.test(keyword || "");
    return {
      min: isMin ? value : null,
      max: isMin ? null : value,
      rest: t.replace(whole, " "),
    };
  }
  return { min: null, max: null, rest: t };
};

export const parseUniversalQuery = (input = "") => {
  const raw = String(input).trim();
  let t = normalize(raw);

  const out = {
    raw,
    text: t,             // lowercased, typo-fixed text
    category: null,      // "Buy" | "Rent" | "PG/Co-living" | "Commercial" | "Plot/Land" | null
    mode: null,          // "Buy" | "Lease" (commercial only)
    propertyTypes: [],   // keys from TYPE_RULES
    bhk: "",
    furnishing: "",
    construction: "",
    minPrice: null,
    maxPrice: null,
    postedBy: "",        // "Builder" (projects) | "Owner" | ""
    city: "",            // first city found
    cities: [],          // every city found, in the order typed
    locality: "",
    place: "",           // set when a Google place is picked for a city we do not list
  };

  // Removes every match of a pattern from the text; true when something was removed
  const take = (re) => {
    const next = t.replace(re, " ");
    const hit = next !== t;
    t = next;
    return hit;
  };

  // Intent flags are read before any text is removed
  const hasPG = /\b(pgs?|paying guests?|hostels?|co[\s-]?living|coliving)\b/.test(t);
  const hasCommercial = /\b(offices?|shops?|showrooms?|ware ?houses?|godowns?|factor(?:y|ies)|retail|commercial|industrial|cold storage)\b/.test(t);
  const hasRent = /\b(rent|rents|rental|renting|to let)\b/.test(t);
  const hasLease = /\b(lease|leasing)\b/.test(t);
  const hasBuy = /\b(buy|buying|sale|sell|selling|purchase|resale)\b/.test(t);
  const hasRoom = /\brooms?\b/.test(t);

  // 1. BHK: "3 BHK", "4+ bhk", "2.5bhk", "3 bedroom"
  const bhk = t.match(/\b(\d+(?:\.5)?)\s*(\+)?\s*(?:bhk|bedrooms?)\b/);
  if (bhk) {
    out.bhk = `${bhk[1]}${bhk[2] ? "+" : ""} BHK`;
    t = t.replace(bhk[0], " ");
  }

  // 2. Furnishing (check "semi" and "un" before plain "furnished")
  if (take(/\bsemi[\s-]?furnished\b/g)) out.furnishing = "Semi-Furnished";
  else if (take(/\b(?:un|non)[\s-]?furnished\b/g)) out.furnishing = "Unfurnished";
  else if (take(/\b(?:fully[\s-]?)?furnished\b/g)) out.furnishing = "Fully Furnished";

  // 3. Construction status ("under construction" must go before the budget reads "under")
  if (take(/\bunder[\s-]?construction\b/g)) out.construction = "Under Construction";
  else if (take(/\b(?:ready[\s-]?to[\s-]?move(?:[\s-]?in)?|rtm|ready possession|ready)\b/g)) {
    out.construction = "Ready to Move";
  } else if (take(/\b(?:new[\s-]?launch(?:es)?|pre[\s-]?launch|upcoming)\b/g)) {
    out.construction = "New Launch";
  }

  // 4. Budget
  const budget = parseBudget(t, /₹|\brs\.?\s*\d|\binr\b/i.test(raw));
  out.minPrice = budget.min;
  out.maxPrice = budget.max;
  t = budget.rest;

  // 5. Property types (removed from the text as they match)
  for (const [key, re] of TYPE_RULES) {
    if (take(re)) out.propertyTypes.push(key);
  }
  // "pg room" is read as PG only
  if (out.propertyTypes.includes("pg")) {
    out.propertyTypes = out.propertyTypes.filter((k) => k !== "room");
  }

  // 6. Posted by: "projects" are builder listings, "owner / no brokerage" are owner listings
  if (take(/\b(?:new )?projects?\b|\b(?:by )?builders?\b/g)) out.postedBy = "Builder";
  else if (take(/\b(?:by |from |direct )?owners?\b|\b(?:no|zero|without) broker(?:age|s)?\b/g)) {
    out.postedBy = "Owner";
  }

  // 7. Category
  const isPG = hasPG || out.propertyTypes.includes("pg");
  const isCommercial =
    hasCommercial ||
    out.propertyTypes.some((k) => ["office", "shop", "warehouse", "factory", "cold_storage"].includes(k));
  const isPlot = out.propertyTypes.includes("plot");

  if (isPG) {
    out.category = "PG/Co-living";
  } else if (isCommercial) {
    out.category = "Commercial";
    // Only set Buy or Lease when the query says so; otherwise show both
    out.mode = hasLease || hasRent ? "Lease" : hasBuy ? "Buy" : null;
  } else if (isPlot) {
    out.category = "Plot/Land";
  } else if (hasRent || hasLease) {
    out.category = "Rent";
  } else if (hasBuy) {
    out.category = "Buy";
  } else if (hasRoom) {
    out.category = "PG/Co-living";
  }

  // 8. Cities (canonical names, in the order they were typed)
  const found = [];
  for (const { name, re } of CITY_MATCHERS) {
    const at = t.search(re);
    re.lastIndex = 0;
    if (at === -1) continue;
    found.push({ name, at });
    take(re);
  }
  found
    .sort((a, b) => a.at - b.at)
    .forEach(({ name }) => {
      if (!out.cities.includes(name)) out.cities.push(name);
    });
  out.city = out.cities[0] || "";

  // 9. Whatever is left is treated as a locality or landmark
  let words = t.split(/[\s,.;:()\-/&+'"]+/).filter((w) => w.length > 1 && !STOP.has(w));
  if (words.every((w) => /^\d+$/.test(w))) words = [];
  out.locality = capitalize(words.join(" "));

  return out;
};

/* ------------------------------------------------------------------ */
/* 3. HEADINGS: "3 BHK Flats for Sale in Pune"                         */
/* ------------------------------------------------------------------ */

const formatAmount = (value) => {
  const n = Number(value);
  if (!n) return "";
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2).replace(/\.?0+$/, "")} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2).replace(/\.?0+$/, "")} L`;
  return `₹${n.toLocaleString("en-IN")}`;
};

const unique = (list) => [...new Set(list.filter(Boolean))];

const composeTitle = ({
  furnishing, construction, bhk, nouns = [], isPG, isCommercial, postedBy, action,
  places = [], minPrice, maxPrice,
}) => {
  const names = unique(nouns);
  let noun = names.length > 2 ? "Properties" : names.join(" & ");
  if (isPG) noun = noun ? `PG ${noun}` : "PGs";
  else if (!noun) {
    noun = postedBy === "Builder" ? "Projects" : isCommercial ? "Commercial Properties" : "Properties";
  }

  const where = unique(places);
  const min = formatAmount(minPrice);
  const max = formatAmount(maxPrice);

  return [
    furnishing === "Fully Furnished" ? "Furnished" : furnishing,
    construction,
    bhk,
    noun,
    action,
    where.length ? `in ${where.join(", ")}` : "",
    postedBy === "Owner" ? "by Owner" : postedBy === "Builder" && noun !== "Projects" ? "by Builder" : "",
    min && max ? `between ${min} and ${max}` : max ? `under ${max}` : min ? `above ${min}` : "",
  ]
    .filter(Boolean)
    .join(" ");
};

// Heading for a parsed query. `locations` overrides the cities found in the text.
export const describeQuery = (q, { locations } = {}) => {
  const keys = q.propertyTypes || [];
  const isPG = q.category === "PG/Co-living";
  const nouns = keys.filter((k) => !(isPG && (k === "pg" || k === "room"))).map((k) => TYPE_NOUNS[k]);
  if (q.category === "Plot/Land" && !keys.includes("plot")) nouns.push("Plots");

  let action = "";
  if (q.category === "Buy") action = "for Sale";
  else if (q.category === "Rent") action = "for Rent";
  else if (q.category === "Commercial") {
    action = q.mode === "Lease" ? "for Lease" : q.mode === "Buy" ? "for Sale" : "";
  }

  return composeTitle({
    furnishing: q.furnishing,
    construction: q.construction,
    bhk: q.bhk,
    nouns,
    isPG,
    isCommercial: q.category === "Commercial",
    postedBy: q.postedBy,
    action,
    places: [q.locality, ...(locations || q.cities || [q.city]), q.place],
    minPrice: q.minPrice,
    maxPrice: q.maxPrice,
  });
};

// Results-page "Property Type" options -> nouns
const LABEL_NOUNS = {
  "Flat/Apartment": "Flats",
  Apartment: "Flats",
  "Home/Villa": "Houses/Villas",
  "Independent House/Villa": "Houses/Villas",
  "Builder Floor": "Builder Floors",
  "Independent/Builder Floor": "Builder Floors",
  "1RK/Studio Apartment": "Studio Apartments",
  "Service Apartment": "Service Apartments",
  Farmhouse: "Farmhouses",
  "Plot/Land": "Plots",
  Office: "Office Spaces",
  "Office Space": "Office Spaces",
  "Ready to move office space": "Office Spaces",
  "Bare shell office space": "Office Spaces",
  Retail: "Shops/Showrooms",
  "Retail Shops/Showrooms": "Shops/Showrooms",
  "Ware House": "Warehouses",
  Factory: "Factories",
  "Cold Storage": "Cold Storages",
  "Other Commercial spaces": "Commercial Spaces",
};

// Heading for the filters currently applied on the results page
export const describeFilters = ({
  category = "", buildingType = "", typeLabels = [], bhk = "", furnishing = "",
  construction = [], postedBy = "", locations = [], locality = "", minPrice = "", maxPrice = "",
} = {}) => {
  const status = Array.isArray(construction) ? construction : [construction].filter(Boolean);
  return composeTitle({
    furnishing,
    construction: status.length === 1 ? status[0].replace("To Move", "to Move") : "",
    bhk,
    nouns: typeLabels.map((label) => LABEL_NOUNS[label] || label),
    isPG: category === "PG/Co-living",
    isCommercial: category.startsWith("Commercial") || buildingType === "Commercial",
    postedBy,
    action:
      category === "Buy" || category === "Commercial Buy"
        ? "for Sale"
        : category === "Rent"
          ? "for Rent"
          : category === "Commercial Lease"
            ? "for Lease"
            : "",
    places: [locality, ...locations],
    minPrice,
    maxPrice,
  });
};

/* ------------------------------------------------------------------ */
/* 4. SUGGESTIONS: what to offer while the user types                  */
/* ------------------------------------------------------------------ */

// Words completed from their first letters ("fla" -> "flat")
const WORD_COMPLETIONS = [
  "flat", "apartment", "house", "villa", "bungalow", "plot", "land", "office", "shop",
  "showroom", "warehouse", "godown", "factory", "pg", "hostel", "room", "studio", "farmhouse",
  "project", "commercial", "furnished",
];

const completeCity = (prefix) => {
  const hits = CITY_NAMES.filter((name) =>
    [name, ...CITIES[name]].some((term) => term.toLowerCase().startsWith(prefix))
  );
  return [
    ...POPULAR_CITIES.filter((c) => hits.includes(c)),
    ...hits.filter((c) => !POPULAR_CITIES.includes(c)),
  ].slice(0, 4);
};

// True when the text says something about the property, not just where it is
const hasIntent = (q) =>
  !!(
    q.bhk || q.propertyTypes.length || q.category || q.postedBy || q.furnishing ||
    q.construction || q.minPrice || q.maxPrice
  );

const isHomeSearch = (q) =>
  (!q.category || q.category === "Buy" || q.category === "Rent") &&
  (!q.propertyTypes.length || q.propertyTypes.some((k) => HOME_KEYS.has(k)));

// Adds every location of a query to the chips already selected (no duplicates, capped)
export const mergeLocations = (existing = [], q = {}, max = 3) => {
  const out = existing.filter(Boolean);
  const add = (name) => {
    if (!name || out.length >= max) return;
    if (!out.some((m) => m.toLowerCase() === name.toLowerCase())) out.push(name);
  };
  (q.cities && q.cities.length ? q.cities : [q.city]).forEach(add);
  add(q.place);
  return out;
};

export const analyzeQuery = (
  input = "",
  { selectedCities = [], defaultCategory = null, limit = 7 } = {}
) => {
  const typed = String(input);
  const raw = typed.trim();
  if (raw.length < 2) return { parsed: null, intent: false, placeQuery: "", suggestions: [] };

  const parsed = parseUniversalQuery(raw);
  const intent = hasIntent(parsed);
  const chips = selectedCities.filter(Boolean);

  // On the Buy / Rent tab a home search defaults to that tab, like 99acres
  const applyDefault = (q) =>
    !q.category && defaultCategory && isHomeSearch(q) ? { ...q, category: defaultCategory } : q;
  const withCity = (q, city) => ({ ...q, city, cities: [city] });
  const placeKnown = (q) => q.cities.length > 0 || chips.length > 0;
  // No city yet: one suggestion per popular city
  const perCity = (q) => POPULAR_CITIES.map((city) => withCity(applyDefault(q), city));

  // The place is known: offer the query itself plus its natural refinements
  const variants = (q0) => {
    if (!hasIntent(q0)) {
      // Only a place was typed: offer a menu for it
      return [
        { ...q0, category: "Buy" },
        { ...q0, category: "Rent" },
        { ...q0, propertyTypes: ["apartment"] },
        { ...q0, category: "PG/Co-living", propertyTypes: ["pg"] },
        { ...q0, category: "Plot/Land", propertyTypes: ["plot"] },
        { ...q0, category: "Commercial", propertyTypes: ["office"] },
        { ...q0, propertyTypes: ["house"] },
      ];
    }
    const q = applyDefault(q0);
    const out = [q];
    const home = isHomeSearch(q);
    if (home && !q0.category) {
      ["Buy", "Rent"].forEach((c) => {
        if (c !== q.category) out.push({ ...q, category: c });
      });
    }
    if (q.category === "Commercial" && !q.mode) {
      out.push({ ...q, mode: "Buy" }, { ...q, mode: "Lease" });
    }
    if (home) {
      if (!q.propertyTypes.length && !q.postedBy) {
        out.push({ ...q, propertyTypes: ["apartment"] }, { ...q, propertyTypes: ["house"] });
      }
      if (!q.bhk && !q.propertyTypes.includes("studio")) {
        ["2 BHK", "3 BHK", "1 BHK", "4 BHK"].forEach((bhk) => out.push({ ...q, bhk }));
      }
    }
    return out;
  };

  // Is the user still in the middle of the last word?
  const tokens = parsed.text.split(" ");
  const last = /\s$/.test(typed) ? "" : tokens[tokens.length - 1] || "";
  const leftover = parsed.locality.toLowerCase().split(" ");
  const midWord = last.length >= 2 && /^[a-z]+$/.test(last) && leftover[leftover.length - 1] === last;
  const head = tokens.slice(0, -1).join(" ");
  const afterPreposition = PREPOSITIONS.has(tokens[tokens.length - 2]);

  const word = midWord && !afterPreposition ? WORD_COMPLETIONS.find((w) => w.startsWith(last)) : null;
  const cityHits = midWord ? completeCity(last) : [];

  const queries = [];

  // "fla" -> flat
  if (word) {
    const q = parseUniversalQuery(`${head} ${word}`.trim());
    if (!q.locality) queries.push(...(placeKnown(q) ? variants(q) : perCity(q)));
  }
  // "flat in pu" -> Pune
  if (cityHits.length) {
    const q = parseUniversalQuery(head);
    if (!q.cities.length && !q.locality) {
      const list = cityHits.map((city) => withCity(q, city));
      queries.push(...(list.length === 1 ? variants(list[0]) : list.map(applyDefault)));
    }
  }
  // The text as typed, when it does not end in a half-typed or city-less locality
  if (!midWord && (intent || parsed.cities.length) && !(parsed.locality && !parsed.cities.length)) {
    queries.push(...(placeKnown(parsed) ? variants(parsed) : perCity(parsed)));
  }

  const seen = new Set();
  const suggestions = [];
  for (const q of queries) {
    const label = describeQuery(q, { locations: mergeLocations(chips, q) });
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    suggestions.push({ kind: "query", key: `q:${key}`, label, parsed: { ...q, raw: label } });
    if (suggestions.length >= limit) break;
  }

  // What to ask Google Places for: only the location part of the text
  let placeQuery = "";
  if (!word) {
    if (!intent) placeQuery = raw;
    else if (parsed.locality) placeQuery = `${parsed.locality} ${parsed.city || chips[0] || ""}`.trim();
  }

  return { parsed, intent, placeQuery, suggestions };
};

/* ------------------------------------------------------------------ */
/* 5. ROUTER STATE: query <-> filters of the results page              */
/* ------------------------------------------------------------------ */
// A typed search sets exactly the filters a visitor could pick by hand on the results
// page, so the listings come filtered from the server.

const STUDIO = ["1RK/Studio Apartment"];
const TYPE_LABELS = {
  any: {
    apartment: ["Flat/Apartment", "Apartment"],
    house: ["Home/Villa", "Independent House/Villa"],
    villa: ["Home/Villa", "Independent House/Villa"],
    plot: ["Plot/Land"],
    studio: STUDIO,
    farmhouse: ["Farmhouse"],
    builder_floor: ["Builder Floor", "Independent/Builder Floor"],
    service_apartment: ["Service Apartment"],
  },
  Buy: {
    apartment: ["Flat/Apartment"],
    house: ["Home/Villa"],
    villa: ["Home/Villa"],
    plot: ["Plot/Land"],
    studio: STUDIO,
    farmhouse: ["Farmhouse"],
    builder_floor: ["Builder Floor"],
    service_apartment: ["Service Apartment"],
  },
  Rent: {
    apartment: ["Flat/Apartment"],
    house: ["Independent House/Villa"],
    villa: ["Independent House/Villa"],
    studio: STUDIO,
    farmhouse: ["Farmhouse"],
    builder_floor: ["Builder Floor"],
    service_apartment: ["Service Apartment"],
  },
  "PG/Co-living": {
    apartment: ["Flat/Apartment"],
    house: ["Independent House/Villa"],
    villa: ["Independent House/Villa"],
    studio: STUDIO,
    builder_floor: ["Builder Floor"],
    service_apartment: ["Service Apartment"],
  },
  commercial: {
    office: ["Ready to move office space", "Bare shell office space"],
    shop: ["Retail"],
    warehouse: ["Ware House"],
    factory: ["Factory"],
    cold_storage: ["Cold Storage"],
    plot: ["Plot/Land"],
  },
  lease: {
    office: ["Office Space"],
    shop: ["Retail Shops/Showrooms"],
    warehouse: ["Other Commercial spaces"],
    factory: ["Other Commercial spaces"],
    cold_storage: ["Other Commercial spaces"],
    plot: ["Plot/Land"],
  },
};
const LEASE_OTHER = { warehouse: "Ware House", factory: "Factory", cold_storage: "Cold Storage" };

const DASHBOARD_CATEGORIES = ["Buy", "Rent", "Commercial Buy", "Commercial Lease", "PG/Co-living"];
const DASHBOARD_BHK = [
  "Studio", "1 RK", "1 BHK", "1.5 BHK", "2 BHK", "2.5 BHK", "3 BHK", "3.5 BHK", "4 BHK", "5 BHK", "6+ BHK",
];

const splitLocations = (value) =>
  Array.isArray(value)
    ? value.filter(Boolean)
    : String(value || "").split(",").map((s) => s.trim()).filter(Boolean);

// Builds the router state for history.push({ pathname: "/searchdashboard", state })
//   locations      location chips (cities / localities) to search in
//   typeLabels     property types picked by hand in a dropdown (results-page labels)
//   plotLandTypes  plot sub-types picked by hand on the Plots tab
export const buildSearchState = (q, { locations = [], typeLabels = [], plotLandTypes = [] } = {}) => {
  const keys = q.propertyTypes || [];
  let propertyType = "";
  let buildingType = "";

  if (q.category === "Commercial") {
    buildingType = "Commercial";
    propertyType = q.mode === "Lease" ? "Commercial Lease" : q.mode === "Buy" ? "Commercial Buy" : "";
  } else if (["Buy", "Rent", "PG/Co-living"].includes(q.category)) {
    propertyType = q.category;
  } else if (q.category === "Plot/Land" && plotLandTypes.length) {
    // Plot sub-types only exist under Commercial Buy on the results page
    propertyType = "Commercial Buy";
    buildingType = "Commercial";
  }

  const table =
    propertyType === "Commercial Lease"
      ? TYPE_LABELS.lease
      : buildingType === "Commercial"
        ? TYPE_LABELS.commercial
        : TYPE_LABELS[propertyType] || TYPE_LABELS.any;

  const labels = [...typeLabels];
  keys.forEach((k) => labels.push(...(table[k] || [])));
  if (q.category === "Plot/Land") labels.push("Plot/Land");

  const otherCommercialType =
    propertyType === "Commercial Lease" ? keys.map((k) => LEASE_OTHER[k]).filter(Boolean) : [];

  const joined = locations.join(", ");
  return {
    zbSearch: true,
    searchCity: joined,
    searchQuery: joined,
    type: buildingType,
    propertyType,
    buildingType,
    propertyTypes: unique(labels),
    plotLandTypes: unique(plotLandTypes),
    otherCommercialType: unique(otherCommercialType),
    bhk: q.bhk || "",
    furnishing: q.furnishing || "",
    constructionStatus: q.construction || "",
    minPrice: q.minPrice ? String(q.minPrice) : "",
    maxPrice: q.maxPrice ? String(q.maxPrice) : "",
    postedBy: q.postedBy || "",
    universal: { ...q, locations, title: describeQuery(q, { locations }) },
  };
};

const toDashboardBhk = (value) => {
  const m = String(value || "").match(/(\d+(?:\.5)?)/);
  if (!m) return DASHBOARD_BHK.includes(value) ? value : "";
  const n = Number(m[1]);
  if (n >= 6) return "6+ BHK";
  const label = `${m[1]} BHK`;
  return DASHBOARD_BHK.includes(label) ? label : "";
};

const toDashboardFurnishing = (value) => {
  const v = String(value || "").toLowerCase();
  if (!v) return "";
  if (v.includes("semi")) return "Semi-Furnished";
  if (v.includes("un")) return "Unfurnished";
  return "Furnished";
};

const toDashboardConstruction = (value) =>
  unique(
    (Array.isArray(value) ? value : [value]).map((item) => {
      const v = String(item || "").toLowerCase();
      if (v.includes("ready")) return "Ready To Move";
      if (v.includes("launch")) return "New Launch";
      if (v.includes("construction")) return "Under Construction";
      return "";
    })
  );

// Reads router state on the results page and returns values valid for its filter controls.
// `isSearch` is false when the page was opened some other way (old links keep working).
export const readSearchState = (state) => {
  const s = state && state.zbSearch ? state : {};
  const list = (v) => (Array.isArray(v) ? v.filter(Boolean) : []);
  const out = {
    isSearch: !!s.zbSearch,
    locations: splitLocations(s.searchCity || s.searchQuery),
    propertyType: DASHBOARD_CATEGORIES.includes(s.propertyType) ? s.propertyType : "",
    buildingType: ["Residential", "Commercial"].includes(s.buildingType) ? s.buildingType : "",
    propertyTypes: list(s.propertyTypes),
    plotLandTypes: list(s.plotLandTypes),
    otherCommercialType: list(s.otherCommercialType),
    bhk: toDashboardBhk(s.bhk),
    furnishing: toDashboardFurnishing(s.furnishing),
    construction: toDashboardConstruction(s.constructionStatus),
    minPrice: s.minPrice ? String(s.minPrice) : "",
    maxPrice: s.maxPrice ? String(s.maxPrice) : "",
    postedBy: ["Owner", "Builder"].includes(s.postedBy) ? s.postedBy : "",
    universal: s.universal || null,
  };
  out.hasFilters = !!(
    out.propertyType || out.buildingType || out.propertyTypes.length || out.plotLandTypes.length ||
    out.bhk || out.furnishing || out.construction.length || out.minPrice || out.maxPrice || out.postedBy
  );
  return out;
};

/* ------------------------------------------------------------------ */
/* 6. LISTING HELPERS (listings already loaded in the browser)         */
/* ------------------------------------------------------------------ */

const plain = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

// Narrows loaded listings to a locality or landmark. When nothing matches, the full list
// comes back with matched: false so the page can say so instead of showing an empty screen.
export const filterByLocality = (list = [], locality = "") => {
  const words = plain(locality).split(" ").filter(Boolean);
  if (!words.length) return { list, matched: true };
  const hits = list.filter((p) => {
    const place = plain(
      `${p.address_area || ""} ${p.address || ""} ${p.landmark || ""} ${p.city_name || ""} ${p.property_name || ""}`
    );
    return words.every((w) => place.includes(w));
  });
  return hits.length ? { list: hits, matched: true } : { list, matched: false };
};

// Matches property type text, used for flats, houses, offices, plots and so on
const TYPE_HAYSTACK = {
  apartment: /apartment|flat/,
  house: /house|villa|independent/,
  villa: /house|villa|independent/,
  plot: /plot|land/,
  office: /office/,
  shop: /retail|shop|showroom/,
  warehouse: /ware ?house|godown|storage/,
  factory: /factory|industry|manufactur/,
  cold_storage: /cold storage|storage/,
  pg: /\bpg\b|co.?living|hostel/,
  studio: /studio|1\s*rk/,
  farmhouse: /farm/,
  builder_floor: /builder floor/,
  service_apartment: /service apart/,
  room: /room/,
};

// Filters listings already loaded in the browser with a parsed query (strict match on every field).
export const filterListings = (list = [], q) => {
  if (!q) return list;

  const num = (v) => Number(String(v ?? "").replace(/[^\d.]/g, "")) || 0;

  const matchesCategory = (cat) => {
    if (!q.category) return true;
    if (q.category === "PG/Co-living") return /pg|co.?living|coliving/.test(cat);
    if (q.category === "Plot/Land") return true; // checked through the property type below
    if (q.category === "Commercial") {
      return cat.includes("commercial") && (q.mode ? cat.includes(q.mode.toLowerCase()) : true);
    }
    if (q.category === "Rent") {
      return cat.includes("rent") && !cat.includes("commercial") && !/pg|living/.test(cat);
    }
    if (q.category === "Buy") return cat.includes("buy") && !cat.includes("commercial");
    return true;
  };

  const wantedBhk = (q.bhk || "").match(/\d+(?:\.5)?/);
  const cities = q.cities && q.cities.length ? q.cities : [q.city].filter(Boolean);

  return list.filter((p) => {
    const cat = (p.property_category_type || "").toLowerCase();
    const type = `${p.property_type || ""} ${p.office_type || ""} ${p.bhk_type || ""} ${p.building_type || ""}`.toLowerCase();
    const isRent = cat.includes("rent") || cat.includes("lease") || /pg|living/.test(cat);
    const price = num(isRent ? p.rent : p.property_price);
    const place = `${p.address_area || ""} ${p.city_name || ""} ${p.property_name || ""}`.toLowerCase();

    if (!matchesCategory(cat)) return false;

    // PG and room are matched by category above, so their type text is not checked
    const typeKeys = (q.propertyTypes || []).filter((k) => k !== "pg" && k !== "room");
    if (q.category === "Plot/Land" && !typeKeys.includes("plot")) typeKeys.push("plot");
    if (typeKeys.length && !typeKeys.some((k) => TYPE_HAYSTACK[k]?.test(type))) return false;

    if (wantedBhk) {
      const has = (p.bhk_type || "").match(/\d+(?:\.5)?/);
      if (!has) return false;
      if (q.bhk.includes("+") ? Number(has[0]) < Number(wantedBhk[0]) : has[0] !== wantedBhk[0]) return false;
    }

    if (q.furnishing) {
      const kind = toDashboardFurnishing(p.furnished_type);
      if (kind !== toDashboardFurnishing(q.furnishing)) return false;
    }

    if (q.construction) {
      const ready = (p.possession_status || "") === "Ready To Move";
      if (q.construction === "Ready to Move" && !ready) return false;
      if (q.construction !== "Ready to Move" && ready) return false;
    }

    if (q.minPrice && price < q.minPrice) return false;
    if (q.maxPrice && price > q.maxPrice) return false;

    if (cities.length && !cities.some((c) => place.includes(c.toLowerCase()))) return false;
    if (q.locality && !filterByLocality([p], q.locality).matched) return false;

    return true;
  });
};

/* ------------------------------------------------------------------ */
/* 7. PROPERTY NAME SEARCH (listings in the ZeroBriks database)        */
/* ------------------------------------------------------------------ */
// Typing a property or project name ("finland") offers that listing in the suggestions.
// The same listing APIs the results page uses are asked for the typed text, and only
// listings whose NAME contains every typed word are kept.

const PROPERTY_SOURCES = [
  {
    path: "/cust_api/search_properties",
    fields: (text) => ({ user_id: "", city_name: "", search_query: text, building_type: "" }),
  },
  {
    path: "/cust_api/filter_property",
    fields: (text) => ({ customer_id: "", search_keyword: text }),
  },
];
const PROPERTY_MIN_CHARS = 3;
const PROPERTY_PAGE_SIZE = 20;
const propertyCache = new Map();

const nameWords = (text) => plain(text).split(" ").filter(Boolean);
const nameMatches = (name, words) => {
  const n = plain(name);
  return words.length > 0 && words.every((w) => n.includes(w));
};

const searchPropertiesByName = async (text, signal) => {
  const words = nameWords(text);
  const key = words.join(" ");
  if (propertyCache.has(key)) return propertyCache.get(key);

  let answered = false;
  let hits = [];
  for (const source of PROPERTY_SOURCES) {
    const form = new FormData();
    Object.entries(source.fields(text)).forEach(([k, v]) => form.append(k, v));
    form.append("page", 1);
    form.append("page_size", PROPERTY_PAGE_SIZE);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}${source.path}`, {
        method: "POST",
        body: form,
        signal,
      });
      const data = await res.json();
      answered = true;
      const list = data && data.status === 1 && Array.isArray(data.data) ? data.data : [];
      hits = list.filter((p) => p && p._id && nameMatches(p.property_name, words));
      if (hits.length) break;
    } catch (err) {
      if (err && err.name === "AbortError") throw err;
      // this source failed: try the next one
    }
  }

  // Names that start with the typed text come first
  const first = words[0] || "";
  hits.sort(
    (a, b) =>
      Number(plain(b.property_name).startsWith(first)) - Number(plain(a.property_name).startsWith(first))
  );
  const out = hits.slice(0, 5);
  if (answered) propertyCache.set(key, out);
  return out;
};

const propertyPlace = (p) => {
  const area = String(p.address_area || "").trim();
  const city = String(p.city_name || "").trim();
  if (!area) return city;
  return !city || area.toLowerCase().includes(city.toLowerCase()) ? area : `${area}, ${city}`;
};

/* ------------------------------------------------------------------ */
/* 8. REACT HOOK: suggestions for a search box                         */
/* ------------------------------------------------------------------ */

const hasPlaces = () =>
  typeof window !== "undefined" && !!(window.google && window.google.maps && window.google.maps.places);

const REGION_TYPES = ["locality", "administrative_area_level_1", "administrative_area_level_2", "country"];

// Puts a Google place into a parsed query: "Baner" + "Pune" -> city Pune, locality Baner
const withPlace = (q, main, parent) => {
  const cityOfMain = canonicalCity(main);
  if (cityOfMain) return { ...q, city: cityOfMain, cities: [cityOfMain], locality: "", place: "" };
  const cityOfParent = canonicalCity(parent);
  if (cityOfParent) return { ...q, city: cityOfParent, cities: [cityOfParent], locality: main, place: "" };
  return { ...q, city: "", cities: [], locality: "", place: parent ? `${main}, ${parent}` : main };
};

// Suggestions for a search box.
//   text            what the user has typed
//   apiKey          Google Maps key (Places library), used for locality suggestions
//   selectedCities  location chips already selected
//   defaultCategory "Buy" or "Rent" when a tab is selected, else null
//   placeTypes      optional Google Places `types` filter, e.g. ["geocode"]
//
// Each item is { kind: "query" | "place" | "property", key, label, sub, parsed, name, id }.
//   kind "property"   -> a listing from the database: open /propertydetails/<item.id>
//   item.parsed set   -> run the search with it
//   item.parsed empty -> a plain place: add item.name as a location chip
export const useSearchSuggestions = (
  text,
  { enabled = true, apiKey = "", selectedCities = [], defaultCategory = null, placeTypes, limit = 7 } = {}
) => {
  const [mapsReady, setMapsReady] = useState(hasPlaces);
  const [places, setPlaces] = useState([]);
  const [listings, setListings] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const serviceRef = useRef(null);
  const sessionRef = useRef(null);
  const requestRef = useRef(0);

  const chipsKey = selectedCities.join("|");
  const analysis = useMemo(
    () => analyzeQuery(text, { selectedCities, defaultCategory, limit }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text, chipsKey, defaultCategory, limit]
  );

  // Load the Google Places script once (shared with every other search box on the page)
  useEffect(() => {
    if (!enabled || mapsReady) return undefined;
    if (hasPlaces()) {
      setMapsReady(true);
      return undefined;
    }
    const onLoad = () => setMapsReady(hasPlaces());
    let script = document.querySelector("script[data-gmaps]");
    if (!script) {
      if (!apiKey) return undefined;
      script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.setAttribute("data-gmaps", "1");
      document.body.appendChild(script);
    }
    script.addEventListener("load", onLoad);
    return () => script.removeEventListener("load", onLoad);
  }, [enabled, mapsReady, apiKey]);

  useEffect(() => {
    if (mapsReady && hasPlaces() && !serviceRef.current) {
      serviceRef.current = new window.google.maps.places.AutocompleteService();
      sessionRef.current = new window.google.maps.places.AutocompleteSessionToken();
    }
  }, [mapsReady]);

  // Locality suggestions (debounced; stale responses ignored)
  const placeQuery = enabled ? analysis.placeQuery : "";
  const placeTypesKey = (placeTypes || []).join("|");
  useEffect(() => {
    const requestId = ++requestRef.current;
    if (!mapsReady || !serviceRef.current || placeQuery.length < 2) {
      setPlaces((prev) => (prev.length ? [] : prev));
      return undefined;
    }
    const timer = setTimeout(() => {
      serviceRef.current.getPlacePredictions(
        {
          input: placeQuery,
          componentRestrictions: { country: "in" },
          ...(placeTypesKey ? { types: placeTypesKey.split("|") } : {}),
          sessionToken: sessionRef.current,
        },
        (preds, status) => {
          if (requestId !== requestRef.current) return;
          const ok = status === window.google.maps.places.PlacesServiceStatus.OK && preds;
          setPlaces(ok ? preds.slice(0, 5) : []);
        }
      );
    }, 250);
    return () => clearTimeout(timer);
  }, [placeQuery, placeTypesKey, mapsReady]);

  // Listings whose name matches the text (debounced; stale responses ignored).
  // "finland" is searched as typed; "flat in finland" searches the leftover "Finland".
  const nameQuery =
    enabled && analysis.parsed ? (analysis.intent ? analysis.parsed.locality : text.trim()) : "";
  useEffect(() => {
    if (nameQuery.length < PROPERTY_MIN_CHARS) {
      setListings((prev) => (prev.length ? [] : prev));
      return undefined;
    }
    let live = true;
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timer = setTimeout(() => {
      searchPropertiesByName(nameQuery, controller ? controller.signal : undefined)
        .then((list) => live && setListings(list))
        .catch(() => {});
    }, 300);
    return () => {
      live = false;
      clearTimeout(timer);
      if (controller) controller.abort();
    };
  }, [nameQuery]);

  const items = useMemo(() => {
    const { parsed, intent, suggestions } = analysis;
    if (!enabled || !parsed) return [];

    // Up to 3 listings, and only those that still match what is typed right now
    const words = nameWords(nameQuery);
    const propertyItems = listings
      .filter((p) => nameMatches(p.property_name, words))
      .slice(0, 3)
      .map((p) => ({
        kind: "property",
        key: `r:${p._id}`,
        id: p._id,
        label: p.property_name,
        sub: ["Property", propertyPlace(p)].filter(Boolean).join(" · "),
        name: p.property_name,
        parsed: null,
      }));

    const placeItems = places.map((pred) => {
      const main = pred.structured_formatting?.main_text || pred.description;
      const sub = pred.structured_formatting?.secondary_text || "";
      const parent = sub.split(",")[0].trim();
      const isRegion = (pred.types || []).some((type) => REGION_TYPES.includes(type));
      const name = isRegion || !parent ? main : `${main}, ${parent}`;
      const item = { kind: "place", key: `p:${pred.place_id}`, label: main, sub, name, parsed: null };
      if (!intent) return item;
      // "flat in ban" + Baner, Pune -> "Flats in Baner, Pune"
      const q = withPlace(parsed, main, isRegion ? "" : parent);
      const label = describeQuery(q, { locations: mergeLocations(selectedCities, q) });
      return { ...item, label, parsed: { ...q, raw: label } };
    });

    // A typed description leads with query suggestions; a plain place name leads with places
    const first = intent ? suggestions : placeItems;
    const second = intent ? placeItems : suggestions;
    const room = limit + 1 - propertyItems.length;
    const head = first.slice(0, second.length ? Math.min(5, room - Math.min(2, second.length)) : room);
    const tail = second.slice(0, room - head.length);

    // Listings lead for a plain name ("finland"). When the text is a city or the start of
    // one ("pu", "pune"), or describes a property ("flat in ..."), they follow the first group.
    const typedCity =
      parsed.cities.length > 0 || completeCity(text.trim().toLowerCase()).length > 0;
    const merged =
      intent || typedCity
        ? [...head, ...propertyItems, ...tail]
        : [...propertyItems, ...head, ...tail];

    const seen = new Set();
    return merged.filter((item) => {
      const key = `${item.kind === "property" ? "r:" : ""}${item.label.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysis, places, listings, nameQuery, enabled, chipsKey, limit]);

  // A plain name pre-selects the first place or listing (Enter adds the chip / opens the listing).
  // A typed description pre-selects nothing (Enter searches what was typed).
  const signature = items.map((item) => item.key).join("|");
  const leadsWithPlace = items.length > 0 && items[0].kind !== "query" && !items[0].parsed;

  // A listing named exactly what was typed, so the Search button can open it directly
  const typedName = plain(text);
  const exactProperty =
    items.find((item) => item.kind === "property" && plain(item.label) === typedName) || null;
  useEffect(() => {
    setActive(leadsWithPlace ? 0 : -1);
  }, [signature, leadsWithPlace]);

  // Typing re-opens the list after it was dismissed
  useEffect(() => {
    setOpen(true);
  }, [text]);

  // Call after a place is picked so Google bills the keystrokes as one session
  const endSession = () => {
    if (hasPlaces()) sessionRef.current = new window.google.maps.places.AutocompleteSessionToken();
  };

  return {
    items,
    open: open && items.length > 0,
    setOpen,
    active,
    setActive,
    parsed: analysis.parsed,
    intent: analysis.intent,
    exactProperty,
    endSession,
  };
};