import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Helmet } from "react-helmet";
import {
  FaPercent,
  FaUsers,
  FaBell,
  FaShieldAlt,
  FaHeart,
  FaHome,
  FaKey,
  FaChartBar,
  FaVrCardboard,
  FaBuilding,
  FaUserCircle,
} from "react-icons/fa";

const SITE_URL = (
  process.env.REACT_APP_SITE_URL || "https://www.zerobriks.com"
).replace(/\/$/, "");
const PAGE_URL = `${SITE_URL}/download`;
const OG_IMAGE = `${SITE_URL}/image/download-mobile-app1.png`;

const PAGE_TITLE =
  "ZeroBriks Mobile App – Buy, Rent & Sell Property Directly from Owners | No Brokerage";
const PAGE_DESCRIPTION =
  "Download the ZeroBriks app for Android and iOS. Find, buy, rent, sell and invest in verified properties directly from owners across India. Zero brokerage, no middleman.";

const highlights = [
  { icon: FaPercent, title: "Zero Brokerage", text: "No hidden charges" },
  { icon: FaUsers, title: "Direct Owner Connection", text: "Talk. Visit. Deal." },
  { icon: FaBell, title: "Instant Notifications", text: "Get alerts first." },
  { icon: FaShieldAlt, title: "Verified Properties", text: "100% genuine" },
  { icon: FaHeart, title: "Save Favorites", text: "Shortlist easily" },
];

const sideFeatures = [
  { icon: FaHome, title: "Buy Property", text: "Direct from Owners" },
  { icon: FaKey, title: "Rent Property", text: "Hassle Free" },
  { icon: FaChartBar, title: "Invest Smarter", text: "Better Opportunities" },
  { icon: FaShieldAlt, title: "Safe & Secure", text: "Verified Listings" },
  { icon: FaVrCardboard, title: "Virtual Tours", text: "360° Property View" },
];

const stats = [
  { icon: FaHome, value: "10,000+", label: "Verified Properties" },
  { icon: FaBuilding, value: "500+", label: "Cities Across India" },
  { icon: FaUserCircle, value: "100%", label: "Owner Listings" },
  { icon: FaShieldAlt, value: "Easy & Secure", label: "Property Transactions" },
];

const faqs = [
  {
    q: "What is the ZeroBriks app?",
    a: "ZeroBriks is a real estate mobile app for Android and iOS that lets you find, buy, rent, sell and invest in properties directly from owners in India, with zero brokerage and no middleman.",
  },
  {
    q: "Is the ZeroBriks app free to download?",
    a: "Yes. You can download the ZeroBriks app for free from the Google Play Store for Android or the Apple App Store for iPhone.",
  },
  {
    q: "Do I have to pay brokerage on ZeroBriks?",
    a: "No. ZeroBriks connects you directly with property owners, so there is no brokerage and no middleman involved.",
  },
  {
    q: "Are the properties on ZeroBriks verified?",
    a: "ZeroBriks focuses on verified owner listings, so you can shortlist properties, talk to owners directly and schedule visits with confidence.",
  },
  {
    q: "What types of property can I find on the app?",
    a: "You can browse residential properties, commercial spaces, plots and land, and PG or co-living accommodation for sale or rent.",
  },
  {
    q: "How do I download the ZeroBriks app?",
    a: "Tap the App Store or Google Play button on this page, or scan the QR code with your phone camera to open the download page for your device.",
  },
];

const Download = () => {
  const [socialLinks, setSocialLinks] = useState({
    appstore: "#",
    playstore: "#",
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/cust_api/get_setting`
        );
        if (response.data.status === 1 && response.data.data.length > 0) {
          const data = response.data.data[0];
          setSocialLinks({
            appstore: data.appstore || "#",
            playstore: data.playstore || "#",
          });
        }
      } catch (error) {
        console.error("Error fetching social links:", error);
      }
    };
    fetchSettings();
  }, []);

  const hasLink = (url) => url && url !== "#";
  const downloadUrls = [socialLinks.playstore, socialLinks.appstore].filter(
    hasLink
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "ZeroBriks",
        url: SITE_URL,
        slogan: "Your Digital Agent. Zero Brokerage.",
        logo: `${SITE_URL}/image/logo.png`,
        areaServed: { "@type": "Country", name: "India" },
      },
      {
        "@type": "MobileApplication",
        "@id": `${PAGE_URL}#app`,
        name: "ZeroBriks",
        description: PAGE_DESCRIPTION,
        applicationCategory: "LifestyleApplication",
        operatingSystem: "ANDROID, IOS",
        inLanguage: "en-IN",
        image: OG_IMAGE,
        publisher: { "@id": `${SITE_URL}/#organization` },
        areaServed: { "@type": "Country", name: "India" },
        featureList: [
          "Zero brokerage",
          "Direct owner connection",
          "Instant property alerts",
          "Verified property listings",
          "Save favorite properties",
          "360° virtual tours",
        ],
        offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
        ...(downloadUrls.length ? { downloadUrl: downloadUrls } : {}),
      },
      {
        "@type": "WebPage",
        "@id": `${PAGE_URL}#webpage`,
        url: PAGE_URL,
        name: PAGE_TITLE,
        description: PAGE_DESCRIPTION,
        inLanguage: "en-IN",
        isPartOf: { "@id": `${SITE_URL}/#organization` },
        about: { "@id": `${PAGE_URL}#app` },
        primaryImageOfPage: OG_IMAGE,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Download App", item: PAGE_URL },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <>
      <Helmet>
        <html lang="en-IN" />
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESCRIPTION} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <link rel="canonical" href={PAGE_URL} />
        <link rel="alternate" hrefLang="en-IN" href={PAGE_URL} />
        <meta name="geo.region" content="IN" />
        <meta name="geo.placename" content="India" />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="ZeroBriks" />
        <meta property="og:locale" content="en_IN" />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta property="og:description" content={PAGE_DESCRIPTION} />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:alt" content="ZeroBriks mobile app on iPhone showing featured properties" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={PAGE_TITLE} />
        <meta name="twitter:description" content={PAGE_DESCRIPTION} />
        <meta name="twitter:image" content={OG_IMAGE} />

        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <main className="flex flex-col min-h-screen bg-[#fdf9f8] text-xs sm:text-sm">
        {/* ================= HERO ================= */}
        <section
          aria-labelledby="download-heading"
          className="max-w-[1300px] w-full mx-auto px-4 sm:px-6 pt-6 lg:pt-8"
        >
          <div className="grid items-center gap-6 lg:grid-cols-[1.1fr_1fr]">
            {/* ---------- Left ---------- */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="hidden sm:block w-8 h-[2px] bg-[#c8962e]" />
                <p className="text-[11px] sm:text-xs font-semibold tracking-widest text-[#b8862a] uppercase">
                  ZeroBriks Mobile App
                </p>
                <span className="hidden sm:block w-8 h-[2px] bg-[#c8962e]" />
              </div>

              <h1
                id="download-heading"
                className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold leading-[1.1] text-[#0f1b3d]"
              >
                Your Property Journey
                <span className="block text-[#7a0c1e]">
                  Now in <span className="text-[#b8862a]">Your Pocket</span>
                </span>
              </h1>

              <p className="mt-3 text-xs sm:text-sm text-[#1f2937] max-w-lg leading-relaxed">
                Find, buy, rent, sell and invest in properties directly from
                owners — anytime, anywhere. No brokerage. No middleman.
              </p>

              {/* Highlights */}
              <ul className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-4 list-none p-0">
                {highlights.map(({ icon: Icon, title, text }) => (
                  <li
                    key={title}
                    className="flex flex-col items-center text-center bg-white rounded-lg border border-[#f3dfe2] shadow-sm p-2"
                  >
                    <span className="w-8 h-8 rounded-lg bg-[#fdecee] text-[#c4122f] flex items-center justify-center text-sm mb-1">
                      <Icon aria-hidden="true" />
                    </span>
                    <span className="text-[11px] font-semibold leading-tight text-[#2a1a1f]">
                      {title}
                    </span>
                    <span className="text-[10px] text-gray-500 mt-0.5">{text}</span>
                  </li>
                ))}
              </ul>

              {/* Download card */}
              <div
                id="download-app"
                className="mt-4 bg-white rounded-xl border border-gray-200 shadow-sm p-4"
              >
                <h2 className="font-serif text-base sm:text-lg font-bold text-[#7a0c1e]">
                  Download the ZEROBRIKS App
                </h2>
                <p className="text-xs text-gray-600 mt-0.5">
                  Experience a smarter and faster way to find your dream property.
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Apple App Store Button with Coming Soon Badge */}
                    <div className="relative inline-block">
                      <a
                        href={socialLinks.appstore}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Download ZeroBriks on the Apple App Store - Coming Soon"
                      >
                        <img
                          src="/image/apl.png"
                          alt="Download ZeroBriks on the App Store"
                          width="130"
                          height="38"
                          loading="lazy"
                          className="h-10 w-auto cursor-pointer"
                        />
                      </a>
                      <span className="absolute -top-2 -right-2 bg-[#7a0c1e] text-white text-[6px] font-bold px-1.5 py-0.5 rounded-full shadow-sm tracking-wide uppercase pointer-events-none">
                        coming Soon
                      </span>
                    </div>

                    {/* Google Play Button */}
                    <a
                      href={socialLinks.playstore !== "#" ? socialLinks.playstore : "https://play.google.com/store/apps/details?id=com.nowaybroker.user&hl=en_IN"}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Get ZeroBriks on Google Play"
                    >
                      <img
                        src="/image/abc.jpg"
                        alt="Get ZeroBriks on Google Play"
                        width="130"
                        height="38"
                        loading="lazy"
                        className="h-10 w-auto cursor-pointer"
                      />
                    </a>
                  </div>

                  <span className="hidden sm:block text-[11px] font-semibold text-gray-400">
                    OR
                  </span>

                  <div className="flex items-center gap-4">
                    {/* QR image */}
                    <img
                      src="/image/qrbar.png"
                      alt="QR code to download the ZeroBriks app"
                      width="64"
                      height="64"
                      loading="lazy"
                      className="w-16 h-16 rounded-md border border-gray-200"
                    />

                    {/* Text block – stacked vertically */}
                    <div className="flex flex-col justify-center">
                      <strong className="text-xs block">Scan QR Code</strong>
                      <span className="text-[11px] text-gray-700 leading-snug">
                        to Download App
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ---------- Right ---------- */}
            <div className="relative flex flex-col sm:flex-row items-center justify-center gap-3">
              <div className="absolute inset-0 -z-0 rounded-2xl bg-gradient-to-br from-[#fbe9ea] via-[#fdf3ef] to-[#f6e3c8] opacity-80" />
              <img
                src="/image/download.png"
                alt="ZeroBriks real estate app on iPhone showing the home screen and featured property listings"
                width="520"
                height="460"
                fetchpriority="high"
                className="relative z-10 w-full max-w-[240px] sm:max-w-[320px] lg:max-w-[380px] h-auto object-contain"
              />

              <ul className="relative z-10 grid grid-cols-2 sm:grid-cols-1 gap-2 w-full sm:w-56 list-none p-2 sm:p-0 m-0">
                {sideFeatures.map(({ icon: Icon, title, text }) => (
                  <li
                    key={title}
                    className="flex items-center gap-2.5 min-w-0 bg-white/80 backdrop-blur rounded-lg border border-white shadow-sm p-2.5"
                  >
                    <span className="w-10 h-10 shrink-0 rounded-lg bg-[#7a0c1e] text-white flex items-center justify-center text-lg">
                      <Icon aria-hidden="true" />
                    </span>
                    <span className="leading-tight">
                      <span className="block text-xs font-bold text-[#2a1a1f]">
                        {title}
                      </span>
                      <span className="block text-[10px] text-gray-500">{text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ================= STATS ================= */}
        <section
          aria-label="ZeroBriks at a glance"
          className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 mt-6"
        >
          <ul className="grid grid-cols-2 lg:grid-cols-4 bg-white rounded-xl border border-gray-200 shadow-sm list-none p-2 m-0 divide-x divide-gray-100">
            {stats.map(({ icon: Icon, value, label }) => (
              <li key={label} className="flex items-center gap-3 p-3">
                <span className="w-10 h-10 shrink-0 rounded-full bg-[#fdecee] text-[#7a0c1e] flex items-center justify-center text-base">
                  <Icon aria-hidden="true" />
                </span>
                <span className="leading-tight">
                  <span className="block text-base font-bold text-[#2a1a1f]">
                    {value}
                  </span>
                  <span className="block text-xs text-gray-600">{label}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* ================= ABOUT ================= */}
        <section
          aria-labelledby="about-heading"
          className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 mt-8"
        >
          <h2
            id="about-heading"
            className="font-serif text-xl sm:text-2xl font-bold text-[#2a1a1f]"
          >
            What is the ZeroBriks property app?
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-700 max-w-4xl leading-relaxed">
            ZeroBriks is a zero-brokerage real estate app for Android and iOS
            in India. It lets you find, buy, rent, sell and invest in
            residential properties, commercial spaces, plots and land, and PG
            or co-living accommodation by connecting you directly with verified
            property owners — with no brokerage and no middleman. Explore{" "}
            <Link to="/property" className="text-[#7a0c1e] font-semibold underline">
              all properties
            </Link>{" "}
            on the website, or download the app to get instant alerts, save
            favourites and take 360° virtual tours.
          </p>
        </section>

        {/* ================= FAQ ================= */}
        <section
          aria-labelledby="faq-heading"
          className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 mt-8 mb-10"
        >
          <h2
            id="faq-heading"
            className="font-serif text-xl sm:text-2xl font-bold text-[#2a1a1f]"
          >
            Frequently asked questions
          </h2>
          <div className="mt-3 grid gap-2.5 lg:grid-cols-2">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="group bg-white rounded-lg border border-gray-200 px-4 py-3"
              >
                <summary className="cursor-pointer list-none flex items-center justify-between gap-3 font-semibold text-[#2a1a1f]">
                  <h3 className="text-xs sm:text-sm font-semibold">{f.q}</h3>
                  <span className="text-[#7a0c1e] text-lg group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="mt-2 text-xs text-gray-600 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </>
  );
};

export default Download;