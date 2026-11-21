import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaYoutube,
  FaLinkedinIn,
  FaXTwitter,
  FaInstagram,
  FaRegBuilding,
} from "react-icons/fa6";
import { FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { IoHomeOutline, IoLayersOutline } from "react-icons/io5";

/* ============================================================
   Static site data
   ============================================================ */
const SITE_URL = "https://www.zerobriks.com";
const LOGO_URL = `${SITE_URL}/app1.png`;

const COMPANY = {
  name: "ZeroBriks",
  legalName: "NOWAYBROKER (OPC) PRIVATE LIMITED",
  displayLegalName: "Nowaybroker (OPC) Private Limited",
  phone: "+91 9890911818",
  phoneHref: "tel:+919890911818",
  email: "support@zerobriks.com",
  address: {
    lines: [
      "FL 2, Square No 14 SP, INNOV8 SKCL Tech Square,",
      "Guindy Industrial Estate, Chennai, Tamil Nadu 600032",
    ],
    street: "FL 2, Square No 14 SP, INNOV8 SKCL Tech Square, Guindy Industrial Estate",
    locality: "Chennai",
    region: "Tamil Nadu",
    postalCode: "600032",
  },
};

const SOCIAL_LINKS = [
  { name: "Facebook", href: "https://www.facebook.com/people/Zerobriks/61595349040746/", icon: FaFacebookF, bg: "bg-[#2f55a4]" },
  { name: "YouTube", href: "https://www.youtube.com/@ZeroBriks", icon: FaYoutube, bg: "bg-[#ff0000]" },
  { name: "LinkedIn", href: "https://www.linkedin.com/company/zerobriks", icon: FaLinkedinIn, bg: "bg-[#0a66c2]" },
  { name: "X (Twitter)", href: "https://x.com/zerobriks", icon: FaXTwitter, bg: "bg-black" },
  { name: "Instagram", href: "https://www.instagram.com/zerobriks", icon: FaInstagram, bg: "bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5]" },
];

const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.nowaybroker.user&hl=en_IN";

// Replace with your real App Store URL, then set APP_STORE_LIVE to true.
// Until then the badge is shown (as in the design) but is not clickable.
const APP_STORE_URL = "https://apps.apple.com/";
const APP_STORE_LIVE = false;

// TODO: point these paths at your real routes
const BUY_RENT_LINKS = [
  { name: "Buy Property", path: "/buy" },
  { name: "Rent Property", path: "/rent" },
  { name: "PG & Co-living", path: "/pg-coliving" },
  { name: "Plots & Land", path: "/plots-land" },
  { name: "Commercial", path: "/commercial" },
];

// TODO: point these paths at your real routes
const SERVICE_LINKS = [
  { name: "Post Free Ad", path: "/post-property" },
  { name: "Projects", path: "/projects" },
  { name: "Plans", path: "/plans" },
  { name: "NRI Services", path: "/nri" },
  { name: "Download App", href: GOOGLE_PLAY_URL },
];

const COMPANY_LINKS = [
  { name: "About Us", path: "/about-us" },
  { name: "Contact Us", path: "/contact" },
  { name: "FAQ", path: "/faq" },
  { name: "Privacy Policy", path: "/privacy-policy" },
  { name: "Terms of Service", path: "/terms-conditions" },
];

// Live cities, sorted alphabetically
const CITIES = [
  "Ahmedabad",
  "Bengaluru",
  "Chennai",
  "Delhi",
  "Hyderabad",
  "Kolkata",
  "Mumbai",
  "Pune",
];

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: COMPANY.name,
  legalName: COMPANY.legalName,
  url: SITE_URL,
  logo: LOGO_URL,
  description:
    "ZeroBriks is a real estate platform connecting verified owners, buyers, tenants and builders directly, with zero brokerage.",
  email: COMPANY.email,
  telephone: "+91-9890911818",
  address: {
    "@type": "PostalAddress",
    streetAddress: COMPANY.address.street,
    addressLocality: COMPANY.address.locality,
    addressRegion: COMPANY.address.region,
    postalCode: COMPANY.address.postalCode,
    addressCountry: "IN",
  },
  areaServed: { "@type": "Country", name: "India" },
  sameAs: SOCIAL_LINKS.map((s) => s.href),
};

const scrollTop = () => window.scrollTo(0, 0);

/* ---------- Small building blocks ---------- */

const ColumnHeading = ({ id, icon: Icon, children, after }) => (
  <h2
    id={id}
    className="mb-1.5 flex items-center gap-1.5 text-[13px] font-bold uppercase leading-none text-[#700c28]"
  >
    <Icon size={16} aria-hidden="true" className="flex-shrink-0" />
    <span>{children}</span>
    {after}
  </h2>
);

const linkClass =
  "text-[11px] leading-tight text-gray-900 no-underline transition-colors hover:text-[#700c28] hover:no-underline";

const LinkList = ({ items }) => (
  <ul className="space-y-0.5">
    {items.map((item) => (
      <li key={item.name} className="leading-tight">
        {item.href ? (
          <a href={item.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
            {item.name}
          </a>
        ) : (
          <Link to={item.path} onClick={scrollTop} className={linkClass}>
            {item.name}
          </Link>
        )}
      </li>
    ))}
  </ul>
);

const IndiaFlag = () => (
  <span
    role="img"
    aria-label="India"
    className="relative ml-1 inline-flex h-[14px] w-[21px] flex-col overflow-hidden rounded-[2px] border border-gray-200"
  >
    <span className="flex-1 bg-[#ff9933]" />
    <span className="flex-1 bg-white" />
    <span className="flex-1 bg-[#138808]" />
    <span className="absolute left-1/2 top-1/2 h-[4px] w-[4px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#000080]" />
  </span>
);

/* Gold swoosh that leads into the maroon bottom bar */
const Wave = () => (
  <svg
    viewBox="0 0 1440 48"
    preserveAspectRatio="none"
    aria-hidden="true"
    className="block h-5 w-full"
  >
    <defs>
      <linearGradient id="zb-gold-l" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#d99a2b" />
        <stop offset="1" stopColor="#f3d488" />
      </linearGradient>
      <linearGradient id="zb-gold-r" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#f3d488" />
        <stop offset="1" stopColor="#d99a2b" />
      </linearGradient>
    </defs>
    <path
      d="M0,10 C200,38 420,45 620,45 L900,45 C1100,45 1300,32 1440,8 L1440,48 L0,48 Z"
      fill="#700c28"
    />
    <path d="M0,0 C200,33 420,44 620,45 C420,45 200,38 0,10 Z" fill="url(#zb-gold-l)" />
    <path d="M1440,0 C1300,27 1100,44 900,45 C1100,45 1300,32 1440,8 Z" fill="url(#zb-gold-r)" />
  </svg>
);

const colDivider = "lg:border-l lg:border-[#ecd3d8] lg:pl-6";

/* ============================================================
   Footer
   ============================================================ */
const Footer = () => {
  const appStoreBadge = (
    <img src="/image/apl.png" alt="Download on the App Store" className="h-8 w-auto rounded-md" />
  );

  return (
    <footer className="relative overflow-hidden border-t border-gray-200 bg-white text-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      <div className="mx-auto max-w-[1400px] px-4 pt-4 md:px-8 md:pt-3 lg:px-14">
        {/* ---------- Top: brand + link columns (one row on desktop) ---------- */}
        <div className="grid grid-cols-2 items-start gap-x-4 gap-y-5 pb-3 md:gap-x-6 md:gap-y-3 lg:grid-cols-[1.9fr_1.05fr_1.7fr_1fr_1fr] lg:gap-x-6">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1 lg:pr-4">
            <Link to="/" onClick={scrollTop} aria-label="ZeroBriks home" className="inline-block">
              <img
                src="/app1.png"
                alt="ZeroBriks logo"
                width="300"
                height="64"
                className="h-16 w-auto object-contain"
              />
            </Link>
            <p className="text-[12px] font-bold leading-tight text-[#1a2332]">
              A Brand of Nowaybroker
            </p>

            <p className="mt-1 max-w-[300px] text-[12px] leading-snug text-gray-900">
              Connecting verified owners, buyers, tenants and builders directly, with zero
              brokerage across India.
            </p>

            <ul className="mt-2 flex gap-2">
              {SOCIAL_LINKS.map(({ name, href, icon: Icon, bg }) => (
                <li key={name}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`ZeroBriks on ${name}`}
                    className={`flex h-7 w-7 items-center justify-center rounded-md text-white shadow-sm transition-opacity hover:opacity-90 ${bg}`}
                  >
                    <Icon size={13} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Buy & Rent */}
          <nav aria-labelledby="footer-buy-rent" className={colDivider}>
            <ColumnHeading id="footer-buy-rent" icon={IoHomeOutline}>
              Buy &amp; Rent
            </ColumnHeading>
            <LinkList items={BUY_RENT_LINKS} />
          </nav>

          {/* Explore Cities */}
          <nav
            aria-labelledby="footer-cities"
            className={`col-span-2 lg:col-span-1 ${colDivider}`}
          >
            <ColumnHeading id="footer-cities" icon={HiOutlineLocationMarker} after={<IndiaFlag />}>
              Explore Cities
            </ColumnHeading>

            <ul className="grid w-full max-w-[270px] grid-cols-2 gap-x-2 gap-y-1.5 md:gap-y-1">
              {CITIES.map((city) => (
                <li key={city} className="min-w-0">
                  <Link
                    to={`/citywiseproperties/${encodeURIComponent(city)}`}
                    onClick={scrollTop}
                    title={`Property in ${city}`}
                    className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-[11px] text-gray-900 no-underline shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-colors hover:border-[#700c28] hover:text-[#700c28] hover:no-underline"
                  >
                    <HiOutlineLocationMarker
                      size={12}
                      className="flex-shrink-0 text-[#700c28]"
                      aria-hidden="true"
                    />
                    <span className="whitespace-nowrap">{city}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Services */}
          <nav aria-labelledby="footer-services" className={colDivider}>
            <ColumnHeading id="footer-services" icon={IoLayersOutline}>
              Services
            </ColumnHeading>
            <LinkList items={SERVICE_LINKS} />
          </nav>

          {/* Company */}
          <nav aria-labelledby="footer-company" className={colDivider}>
            <ColumnHeading id="footer-company" icon={FaRegBuilding}>
              Company
            </ColumnHeading>
            <LinkList items={COMPANY_LINKS} />
          </nav>
        </div>

        {/* Gold rule */}
        <div className="h-px w-full bg-gradient-to-r from-[#e3b65c] via-[#e9c77e] to-[#e3b65c]" />

        {/* ---------- Contact strip (one row from tablet up) ---------- */}
        <div className="mt-2 grid grid-cols-1 rounded-xl bg-[#fbf1f3] md:grid-cols-3">
          {[
            {
              key: "phone",
              icon: <FaPhoneAlt size={14} aria-hidden="true" />,
              label: "Toll-Free Phone",
              value: (
                <a href={COMPANY.phoneHref} className="text-[13px] font-bold text-[#700c28] no-underline hover:underline">
                  {COMPANY.phone}
                </a>
              ),
            },
            {
              key: "email",
              icon: <FaEnvelope size={14} aria-hidden="true" />,
              label: "Email Support",
              value: (
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="break-all text-[13px] font-bold text-[#700c28] no-underline hover:underline"
                >
                  {COMPANY.email}
                </a>
              ),
            },
            {
              key: "address",
              icon: <HiOutlineLocationMarker size={16} aria-hidden="true" />,
              label: "Registered Address",
              value: (
                <address className="not-italic text-[11px] leading-snug text-gray-900">
                  {COMPANY.address.lines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
              ),
            },
          ].map((item, i) => (
            <div
              key={item.key}
              className={`flex items-start gap-2.5 px-4 py-3 md:items-center md:px-5 md:py-1.5 ${
                i > 0 ? "border-t border-[#e6d3d7] md:border-l md:border-t-0" : ""
              }`}
            >
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center text-[#700c28] md:h-7">
                {item.icon}
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-medium leading-tight text-gray-800">{item.label}</p>
                <div className="leading-tight">{item.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ---------- App download row (one row) ---------- */}
        <div className="flex flex-col items-start gap-4 py-3 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-x-6 md:gap-y-2 md:px-1 md:py-2">
          <div className="flex w-full flex-wrap items-center gap-x-4 gap-y-3 md:w-auto md:gap-y-2">
            <p className="text-[12px] font-bold leading-tight text-[#700c28]">
              Download the
              <br />
              ZeroBriks App
            </p>
            <span className="hidden h-7 w-px bg-gray-400 sm:block" aria-hidden="true" />
            <div className="flex flex-wrap items-center gap-4">
              <a
                href={GOOGLE_PLAY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-90"
              >
                <img src="/image/abc.jpg" alt="Get it on Google Play" className="h-8 w-auto rounded-md" />
              </a>
              {APP_STORE_LIVE ? (
                <a
                  href={APP_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-opacity hover:opacity-90"
                >
                  {appStoreBadge}
                </a>
              ) : (
                <span title="Coming soon" className="relative inline-block">
                  {appStoreBadge}
                  <span className="absolute -right-2 -top-2 rounded-full bg-[#700c28] px-1.5 py-0.5 text-[8px] font-bold uppercase leading-none tracking-wide text-white shadow-sm">
                    Coming soon
                  </span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 md:border-l-[1.5px] md:border-[#700c28] md:pl-5">
            <div className="rounded-md border-[1.5px] border-[#700c28] bg-white p-1">
              <img
                src="/image/qrbar.png"
                alt="QR code to download the ZeroBriks app"
                className="h-12 w-12 object-contain"
              />
            </div>
            <p className="text-center text-[12px] font-bold leading-tight text-[#1a2332]">
              Scan QR Code to
              <br />
              Download App
            </p>
          </div>
        </div>
      </div>

      {/* ---------- Bottom bar ---------- */}
      <div>
        <Wave />
        <div className="-mt-px bg-[#700c28] pb-1.5 pt-0.5 text-white">
          <div className="mx-auto max-w-[1400px] px-4 text-center text-[11px] leading-relaxed text-white md:text-[12px]">
            <p className="inline text-white">
              © {new Date().getFullYear()} {COMPANY.name} – A Brand of {COMPANY.displayLegalName}. All
              Rights Reserved.
            </p>
            <nav aria-label="Legal" className="inline">
              <span aria-hidden="true" className="mx-2">|</span>
              <Link to="/privacy-policy" onClick={scrollTop} className="text-white no-underline hover:underline">
                Privacy
              </Link>
              <span aria-hidden="true" className="mx-2">|</span>
              <Link to="/terms-conditions" onClick={scrollTop} className="text-white no-underline hover:underline">
                Terms
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;