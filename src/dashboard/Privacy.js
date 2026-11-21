import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const PAGE_TITLE = "Privacy Policy";
const SUPPORT_EMAIL = "support@zerobriks.com";

/* ------------------------------------------------------------------ */
/* Styles (kept in this file so no extra CSS file is needed)           */
/* ------------------------------------------------------------------ */
const PAGE_STYLES = `
  .zb-page { background: #F7F3F3; min-height: 100vh; }

  /* Hero */
  .zb-hero { position: relative; overflow: hidden; color: #fff;
    background: linear-gradient(135deg, #7A0C22 0%, #5C0919 55%, #3F0611 100%); }
  .zb-hero::before { content: ""; position: absolute; right: -90px; top: -110px; width: 340px; height: 340px;
    border-radius: 50%; border: 52px solid rgba(201, 162, 77, 0.22); }
  .zb-hero::after { content: ""; position: absolute; left: -70px; bottom: -120px; width: 240px; height: 240px;
    border-radius: 50%; border: 36px solid rgba(255, 255, 255, 0.06); }
  .zb-hero-inner { position: relative; z-index: 1; }
  .zb-hero-bar { width: 64px; height: 4px; border-radius: 4px; background: #C9A24D; }
  .zb-crumb, .zb-crumb a { color: rgba(255, 255, 255, 0.75); text-decoration: none; }
  .zb-crumb a:hover { color: #fff; text-decoration: underline; }
  .zb-chip { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 999px;
    font-size: 13px; font-weight: 500; color: #fff; background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.22); }
  .zb-chip-dot { width: 6px; height: 6px; border-radius: 50%; background: #C9A24D; }

  /* Cards */
  .zb-card { background: #fff; border: 1px solid #EFE6E7; border-radius: 16px;
    box-shadow: 0 14px 34px -22px rgba(92, 9, 25, 0.45); }
  .zb-card-accent { border-top: 4px solid #C9A24D; }
  .zb-badge { display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
    width: 38px; height: 38px; border-radius: 12px; font-size: 15px; font-weight: 700;
    color: #7A0C22; background: #F6E9EB; }
  .zb-section-title { margin: 0; font-size: 1.2rem; font-weight: 700; line-height: 1.35; color: #1F1416; }
  .zb-btn { display: inline-flex; align-items: center; justify-content: center; padding: 11px 22px;
    border-radius: 10px; font-weight: 600; text-decoration: none; cursor: pointer; border: 1px solid transparent; }
  .zb-btn-primary { background: #7A0C22; color: #fff; }
  .zb-btn-primary:hover { background: #5C0919; color: #fff; text-decoration: none; }
  .zb-btn-light { background: #fff; color: #7A0C22; }
  .zb-btn-light:hover { background: #F6E9EB; color: #7A0C22; text-decoration: none; }
  .zb-btn-ghost { background: transparent; color: #fff; border-color: rgba(255, 255, 255, 0.6); }
  .zb-btn-ghost:hover { background: rgba(255, 255, 255, 0.1); color: #fff; text-decoration: none; }
  .zb-btn:focus-visible, .zb-toc a:focus-visible, .zb-acc-btn:focus-visible, .zb-pill:focus-visible,
  .zb-search:focus-visible { outline: 3px solid #C9A24D; outline-offset: 2px; }

  /* Table of contents */
  .zb-toc { list-style: none; margin: 0; padding: 0; }
  .zb-toc a { display: block; padding: 7px 12px; border-left: 3px solid transparent; border-radius: 0 8px 8px 0;
    font-size: 14px; line-height: 1.4; color: #5B4B4E; text-decoration: none; }
  .zb-toc a:hover { background: #FAF3F4; color: #7A0C22; }
  .zb-toc a.is-active { border-left-color: #7A0C22; background: #F6E9EB; color: #7A0C22; font-weight: 600; }
  .zb-progress { position: fixed; top: 0; left: 0; height: 3px; z-index: 60; background: #C9A24D; }
  .zb-top { position: fixed; right: 20px; bottom: 20px; z-index: 50; width: 46px; height: 46px; border-radius: 50%;
    border: 0; cursor: pointer; color: #fff; background: #7A0C22; box-shadow: 0 10px 24px -8px rgba(92, 9, 25, 0.7); }

  /* FAQ */
  .zb-search { width: 100%; padding: 15px 18px 15px 48px; border-radius: 14px; border: 0; font-size: 16px;
    color: #1F1416; background: #fff; box-shadow: 0 16px 34px -18px rgba(0, 0, 0, 0.55); }
  .zb-pill { padding: 8px 16px; border-radius: 999px; font-size: 14px; font-weight: 500; cursor: pointer;
    color: #3A2A2D; background: #fff; border: 1px solid #E6D9DB; }
  .zb-pill.is-active { color: #fff; background: #7A0C22; border-color: #7A0C22; }
  .zb-acc { background: #fff; border: 1px solid #EFE6E7; border-radius: 14px; margin-bottom: 12px;
    transition: box-shadow 150ms ease, border-color 150ms ease; }
  .zb-acc.is-open { border-color: #D9B9BE; box-shadow: 0 14px 30px -22px rgba(92, 9, 25, 0.6); }
  .zb-acc-btn { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; width: 100%;
    padding: 18px 20px; border: 0; background: transparent; cursor: pointer; text-align: left;
    font-size: 16px; font-weight: 600; line-height: 1.45; color: #1F1416; border-radius: 14px; }
  .zb-acc-icon { position: relative; flex-shrink: 0; width: 26px; height: 26px; border-radius: 50%; background: #F6E9EB; }
  .zb-acc-icon::before, .zb-acc-icon::after { content: ""; position: absolute; left: 7px; top: 12px; width: 12px;
    height: 2px; border-radius: 2px; background: #7A0C22; transition: transform 150ms ease; }
  .zb-acc-icon::after { transform: rotate(90deg); }
  .zb-acc.is-open .zb-acc-icon::after { transform: rotate(0deg); }
  .zb-acc-panel { padding: 0 20px 20px; }

  /* Backend HTML */
  .zb-content { color: #4A3D40; font-size: 16px; line-height: 1.75; overflow-wrap: anywhere; }
  .zb-content * { font-family: inherit !important; max-width: 100%; }
  .zb-content > *:first-child { margin-top: 0 !important; }
  .zb-content > *:last-child { margin-bottom: 0 !important; }
  .zb-content h1, .zb-content h2, .zb-content h3, .zb-content h4 { color: #1F1416; font-weight: 700; line-height: 1.3; }
  .zb-content h1 { font-size: 1.5rem; margin: 0 0 1rem; }
  .zb-content h2 { font-size: 1.25rem; color: #7A0C22; margin: 2rem 0 0.75rem; }
  .zb-content h3 { font-size: 1.1rem; margin: 1.5rem 0 0.5rem; }
  .zb-content h4 { font-size: 1rem; margin: 1.25rem 0 0.4rem; }
  .zb-content p { margin: 0 0 1rem; }
  .zb-content p:empty { display: none; }
  .zb-content ul, .zb-content ol { margin: 0 0 1rem; padding-left: 0; list-style: none; }
  .zb-content ol { counter-reset: zb-ol; }
  .zb-content li { position: relative; margin-bottom: 0.55rem; padding-left: 1.75rem; }
  .zb-content ul > li::before { content: ""; position: absolute; left: 0.3rem; top: 0.65em; width: 8px; height: 8px;
    border-radius: 50%; background: #C9A24D; box-shadow: 0 0 0 4px #FBF3E0; }
  .zb-content ol > li { counter-increment: zb-ol; }
  .zb-content ol > li::before { content: counter(zb-ol) "."; position: absolute; left: 0; font-weight: 700; color: #7A0C22; }
  .zb-content li > p { margin-bottom: 0.25rem; }
  .zb-content a { color: #7A0C22; text-decoration: underline; }
  .zb-content strong, .zb-content b { color: #1F1416; font-weight: 600; }
  .zb-content blockquote { margin: 0 0 1rem; padding: 0.75rem 1rem; border-left: 4px solid #C9A24D;
    border-radius: 0 10px 10px 0; background: #FBF7EC; }
  .zb-content hr { margin: 1.75rem 0; border: 0; border-top: 1px solid #EFE6E7; }
  .zb-content img { height: auto; border-radius: 12px; }
  .zb-content table { display: block; width: 100%; margin: 0 0 1.25rem; overflow-x: auto; border-collapse: collapse; }
  .zb-content th, .zb-content td { padding: 0.65rem 0.8rem; border: 1px solid #EFE6E7; text-align: left; vertical-align: top; }
  .zb-content th { background: #F6E9EB; color: #7A0C22; font-weight: 600; }
  @media (min-width: 768px) { .zb-content-cols ul { column-count: 2; column-gap: 2.5rem; }
    .zb-content-cols li { break-inside: avoid; } }

  .zb-skeleton { border-radius: 8px; background: #EFE6E7; animation: zb-pulse 1.4s ease-in-out infinite; }
  @keyframes zb-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  @media (prefers-reduced-motion: reduce) { .zb-skeleton { animation: none; }
    .zb-acc, .zb-acc-icon::before, .zb-acc-icon::after { transition: none; } }
`;

/* ------------------------------------------------------------------ */
/* Splits the backend HTML into sections at every heading              */
/* ------------------------------------------------------------------ */
// A heading is an <h1>-<h6> tag, or a short paragraph that is entirely bold
// (how most admin editors save headings). Text before the first heading is
// returned as "intro". If the HTML has no headings, "sections" is empty and
// the page simply shows the content as one formatted block.
const parseSections = (html) => {
  if (!html || typeof DOMParser === "undefined") return { intro: "", sections: [] };
  const doc = new DOMParser().parseFromString(html, "text/html");

  let root = doc.body;
  while (
    root.children.length === 1 &&
    /^(DIV|SECTION|ARTICLE|MAIN)$/.test(root.children[0].tagName) &&
    root.textContent.trim() === root.children[0].textContent.trim()
  ) {
    root = root.children[0];
  }

  const isHeading = (node) => {
    if (node.nodeType !== 1) return false;
    if (/^H[1-6]$/.test(node.tagName)) return node.textContent.trim().length > 0;
    if (!/^(P|DIV)$/.test(node.tagName)) return false;
    const text = node.textContent.trim();
    if (!text || text.length > 140) return false;
    const kids = Array.from(node.childNodes);
    const onlyBold = kids.every(
      (k) =>
        (k.nodeType === 3 && !k.textContent.trim()) ||
        (k.nodeType === 1 && /^(STRONG|B|BR)$/.test(k.tagName)),
    );
    return onlyBold && kids.some((k) => k.nodeType === 1 && /^(STRONG|B)$/.test(k.tagName));
  };

  let intro = "";
  const sections = [];
  Array.from(root.childNodes).forEach((node) => {
    if (isHeading(node)) {
      sections.push({
        id: `zb-section-${sections.length + 1}`,
        title: node.textContent.replace(/\s+/g, " ").trim(),
        html: "",
        text: "",
        hasList: false,
      });
      return;
    }
    const nodeHtml = node.nodeType === 1 ? node.outerHTML : node.textContent;
    const nodeText = node.textContent.trim();
    const current = sections[sections.length - 1];
    if (!current) {
      if (nodeText) intro += nodeHtml;
      return;
    }
    current.html += nodeHtml;
    current.text = `${current.text} ${nodeText}`.trim();
    if (node.nodeType === 1 && (/^(UL|OL)$/.test(node.tagName) || node.querySelector("ul, ol"))) {
      current.hasList = true;
    }
  });
  return { intro, sections };
};

const scrollToId = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const top = el.getBoundingClientRect().top + window.scrollY - 100;
  window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
};

/* ------------------------------------------------------------------ */
/* Shared pieces                                                       */
/* ------------------------------------------------------------------ */
const Hero = () => (
  <header className="zb-hero">
    <div className="px-5 py-5 mx-auto zb-hero-inner max-w-6xl md:px-8 md:py-6">
      <nav aria-label="Breadcrumb" className="mb-1 text-sm zb-crumb">
        <Link to="/">Home</Link>
        <span className="mx-2">›</span>
        <span style={{ color: "#fff" }}>{PAGE_TITLE}</span>
      </nav>
      <h1 className="text-xl font-bold leading-tight md:text-2xl" style={{ color: "#fff", margin: 0 }}>
        {PAGE_TITLE}
      </h1>
    </div>
  </header>
);

const LoadingCard = () => (
  <div className="p-6 zb-card md:p-10" aria-label="Loading">
    <div className="zb-skeleton" style={{ width: "35%", height: 22, marginBottom: 22 }} />
    <div className="zb-skeleton" style={{ height: 14, marginBottom: 12 }} />
    <div className="zb-skeleton" style={{ height: 14, marginBottom: 12 }} />
    <div className="zb-skeleton" style={{ width: "80%", height: 14, marginBottom: 30 }} />
    <div className="zb-skeleton" style={{ width: "28%", height: 22, marginBottom: 22 }} />
    <div className="zb-skeleton" style={{ height: 14, marginBottom: 12 }} />
    <div className="zb-skeleton" style={{ width: "65%", height: 14 }} />
  </div>
);

const MessageCard = ({ text, onRetry }) => (
  <div className="p-8 text-center zb-card md:p-12">
    <p style={{ margin: 0, color: "#4A3D40" }}>{text}</p>
    {onRetry && (
      <button type="button" onClick={onRetry} className="mt-5 zb-btn zb-btn-primary">
        Try again
      </button>
    )}
  </div>
);

const SupportCard = () => (
  <div className="p-6 zb-card zb-card-accent">
    <p className="font-bold" style={{ margin: "0 0 6px", color: "#1F1416" }}>
      Need help?
    </p>
    <p className="text-sm" style={{ margin: "0 0 14px", color: "#5B4B4E", lineHeight: 1.6 }}>
      Our support team can help with your account, listings and payments.
    </p>
    <a href={`mailto:${SUPPORT_EMAIL}`} className="w-full text-sm zb-btn zb-btn-primary">
      {SUPPORT_EMAIL}
    </a>
  </div>
);

const Privacy = () => {
  // This page has no backend endpoint yet, so the text stays in this file.
  // To make it dynamic, replace this block with the same fetch code used in
  // Terms.js and point ENDPOINT at the privacy API.
  const content = `
  <h2>1. Introduction and Corporate Identity</h2>
  <p>This Privacy Policy (the “Policy”) explains how Noway Broker (OPC) Private Limited (the “Company,” “we,” “us,” or “our”), operating the ZEROBRIKS real estate technology brand, collects, uses, stores, shares and protects personal data in connection with its digital platforms and services.</p>
  <p>ZEROBRIKS facilitates residential and commercial property discovery, listings and connections among property owners, buyers, tenants, builders, developers and other eligible participants.</p>
  <p>The Company aims to handle personal data responsibly and transparently in accordance with applicable Indian law. This Policy describes our data practices and the choices available to users.</p>
  <p>Where processing requires consent under applicable law, the Company will seek it through an appropriate mechanism.</p>

  <h2>2. Scope and Users</h2>
  <p>This Policy covers visitors, registered users, prospective buyers, tenants, owners, landlords, sellers, builders, developers, authorized property representatives and people who submit enquiries or contact support through our website, mobile application or associated services.</p>
  <p>Separate privacy notices or contractual arrangements may apply to employees, job applicants, vendors and business partners outside ordinary customer-facing services.</p>

  <h2>3. Personal Data We Collect</h2>
  <p>We may collect names, mobile numbers, email addresses, account credentials and OTP verification status for account-related activities.</p>
  <p>Property-related information may include preferred locations, property types, budgets, saved listings, enquiries and site-visit requests.</p>
  <p>Listing contributors may provide property addresses, descriptions, photographs, prices, availability, amenities, ownership or authorization information and supporting documents.</p>
  <p>For paid services, we may collect subscription details, billing information, invoices, payment status, transaction identifiers and limited payment references.</p>
  <p>Support interactions may include contact details, messages, complaints, feedback and correspondence.</p>
  <p>Technical information may include device type, operating system, browser, IP address, application version, cookies, app events and approximate location, where applicable.</p>
  <p>Users may also voluntarily submit additional information through listing, enquiry and support features. Please avoid including unnecessary confidential or sensitive information.</p>

  <h2>4. Sources of Data</h2>
  <p>We receive information directly from users through registration, listings, enquiries, subscriptions and support interactions.</p>
  <p>Some information arises from users’ interactions with the website or application, including searches and feature usage.</p>
  <p>Property owners, builders, developers and authorized representatives may supply listing-related information or enquiry responses.</p>
  <p>Where applicable and lawful, payment, authentication, communication and analytics providers may supply limited service-related information.</p>

  <h2>5. Why We Process Personal Data</h2>
  <p>ZEROBRIKS processes personal information for specified, legitimate, and lawful purposes to operate and improve its real estate technology platform. This includes creating and managing user accounts, verifying mobile numbers through OTP authentication, displaying relevant property listings, facilitating direct connections between buyers, tenants, property owners, and authorized representatives, managing property enquiries, coordinating site visits, and maintaining property listing information.</p>
  <p>We also process relevant personal data to activate purchased subscription services, confirm payments, maintain billing records, generate invoices, respond to customer support requests, resolve complaints, prevent fraudulent activities, protect against unauthorized access, and maintain Platform security and reliability. Additionally, information may be processed to improve property search functionality, evaluate application performance, fulfill applicable legal and regulatory obligations, and communicate service updates or promotional offers where permitted by law and subject to applicable consent and user preferences.</p>

  <h2>6. Property Enquiries and Contact Sharing</h2>
  <p>When users submit property enquiries or request to connect with property owners, sellers, landlords, builders, developers, or authorized representatives, ZEROBRIKS may share relevant contact information and enquiry details with the respective parties to facilitate direct communication and property-related discussions.</p>
  <p>When users publish property listings, certain information, including property descriptions, photographs, location details, pricing, and contact information selected for public display, may become accessible to other Platform users. Users are responsible for reviewing the information they voluntarily submit or authorize for publication and should avoid disclosing unnecessary personal or confidential details.</p>
  <p>ZEROBRIKS will provide appropriate information through its Platform interface regarding the disclosure of contact details during property enquiries or listing publication. Personal information will be shared for the relevant property-related purpose, subject to applicable privacy requirements and user permissions.</p>

  <h2>7. Consent and Your Choices</h2>
  <p>Where consent is required under applicable data protection laws, ZEROBRIKS will seek user consent through a clear and accessible notice explaining the specific purpose for which personal information will be collected or processed. Users will be provided with appropriate choices regarding consent-based processing activities.</p>
  <p>Users may withdraw consent through available account or consent controls, or by contacting support@zerobriks.com. Withdrawal does not invalidate processing already lawfully completed and may affect dependent services.</p>
  <p>ZEROBRIKS will manage promotional communication preferences separately from essential account, security, payment, and service-related notifications, where applicable. Users may exercise available communication preferences and opt-out choices in accordance with applicable legal requirements.</p>

  <h2>8. Sharing with Service Providers</h2>
  <p>Contracted providers may support hosting, OTP delivery, communications, payments, support, fraud prevention, analytics, cybersecurity and technical operations. We aim to share only the information reasonably necessary for the relevant service. We seek appropriate confidentiality, security and contractual restrictions for providers processing personal information on our behalf.</p>
  <p>ZEROBRIKS may disclose personal information to government authorities, regulatory bodies, law enforcement agencies, or courts where required or otherwise permitted under applicable law, including in response to valid legal requests.</p>
  <p>In connection with a lawful merger, acquisition, business transfer, or corporate restructuring, relevant personal information may be disclosed or transferred where necessary, subject to applicable legal requirements and appropriate data protection safeguards.</p>
  <p>ZEROBRIKS does not authorize unrelated third parties to use personal information shared with them for independent marketing or promotional activities without an appropriate lawful basis and any required user consent.</p>

  <h2>9. Payments and Subscriptions</h2>
  <p>Payment details may be processed by an authorized gateway. We may receive transaction confirmation and limited references needed to activate services and reconcile billing.</p>
  <p>We may retain payment status, invoices, subscription records and refund references for administration and applicable compliance purposes.</p>
  <p>Users should enter sensitive payment credentials only in the authorized payment interface. Company staff do not ask users to share card PINs, CVVs, banking passwords or OTPs.</p>
  <p>Cancellation procedures and refund eligibility are addressed separately in the ZEROBRIKS Refund and Cancellation Policy.</p>

  <h2>10. Cookies, Analytics and Advertising Technologies</h2>
  <p>Essential cookies and session technologies may support login, core features and preferences; disabling them can affect functionality.</p>
  <p>Where deployed, analytics tools may help evaluate traffic, feature usage and technical performance.</p>
  <p>Optional advertising or remarketing technologies, if introduced, will be disclosed and subject to applicable notice, consent and user-choice requirements.</p>
  <p>Users may adjust browser cookie settings and any controls made available by the Platform; controls vary by browser and device.</p>

  <h2>11. Location, Camera, Photo Access and Device Permissions</h2>
  <p>With user permission, location access may support nearby property results. Users may also search manually by city or locality where supported.</p>
  <p>Camera or photo-library access may support user-initiated uploads of listing photographs and documents.</p>
  <p>Permissions are requested through device controls where needed and can generally be managed in operating system settings. Disabling a permission may limit related features.</p>
  <p>The application should request only permissions needed for implemented features; the Company will review the actual released application and its data practices.</p>

  <h2>12. Data Security and Protection of Personal Information</h2>
  <p>We implement reasonable technical, administrative and organizational safeguards intended to reduce risks of unauthorized access, misuse, alteration, disclosure or loss of personal data.</p>
  <p>Depending on the systems in use, safeguards may include access restrictions, encryption in transit, authentication controls, monitoring, confidentiality obligations, secure development practices and incident-response procedures.</p>
  <p>No internet-based system can guarantee absolute security.</p>
  <p>Users should safeguard account credentials, never share verification codes with others and promptly report suspected unauthorized activity.</p>
  <p>Where a personal data breach occurs, the Company will assess and address applicable notification and remediation obligations.</p>

  <h2>13. Data Retention and Account Deletion</h2>
  <p>We retain personal data for as long as reasonably necessary for its specified purpose, subject to applicable legal, regulatory and operational requirements.</p>
  <p>Retention periods may vary by data category, processing purpose and legal obligation.</p>
  <p>Certain accounting, tax, fraud-prevention, dispute-resolution and compliance records may need to be retained after account closure where lawful.</p>
  <p>Users may request account deletion through an available in-app or website mechanism, where implemented, or by contacting support@zerobriks.com.</p>
  <p>We may verify the requester’s identity and assess applicable retention obligations before processing a deletion request.</p>
  <p>Where information is no longer needed and no lawful retention ground applies, we will take appropriate steps to delete, dispose of or de-identify it.</p>
  <p>Limited records may remain where legally required or permitted, subject to appropriate safeguards and a justified retention period.</p>
  <p>The Company will maintain internal retention and deletion procedures appropriate to its operations.</p>
  <p>Users will be informed of request outcomes and relevant limitations where required by applicable law.</p>

  <h2>14. Your Privacy Rights and Data Protection Choices</h2>
  <p>Subject to applicable Indian law and its commencement provisions, eligible users may request information about personal data processing.</p>
  <p>Users may seek correction, completion or updating of inaccurate, incomplete or outdated personal information where legally available.</p>
  <p>Users may request erasure of personal data where applicable, subject to lawful retention obligations. The process is described under “Data Retention and Account Deletion.”</p>
  <p>Users may raise privacy complaints through the contact details provided below. We will address eligible complaints within applicable legal timelines.</p>
  <p>Where legally available, users may seek further remedies before the competent authority under the prescribed procedure.</p>
  <p>Where applicable provisions are in force, eligible users may nominate another person to exercise specified rights in circumstances recognized by law.</p>
  <p>We may undertake reasonable identity or authority verification to protect users against unauthorized requests.</p>
  <p>Requests will be evaluated in accordance with applicable statutory conditions and timelines.</p>

  <h2>15. Children and Age-Related Safeguards</h2>
  <p>The Platform is intended for individuals aged 18 and above and is not designed for independent registration or property transactions by children under 18.</p>
  <p>If we learn that a child’s personal information was collected without an appropriate lawful basis, we will assess the matter and take corrective action, including deletion where required.</p>

  <h2>16. International Data Processing and Transfers</h2>
  <p>Depending on actual service-provider infrastructure, personal data may be stored, accessed or processed outside India. Where cross-border processing occurs, the Company will assess and comply with applicable Indian transfer requirements.</p>
  <p>We will seek appropriate safeguards for relevant international service-provider arrangements.</p>

  <h2>17. Third-Party Links, Services and Property Listings</h2>
  <p>The Platform may link to independently operated websites, applications or payment services with their own privacy practices. We do not control those independent services. Users should review the relevant privacy notices before sharing information outside the Platform.</p>
  <p>Property information supplied by independent listing parties is not automatically guaranteed by its publication on the Platform.</p>
  <p>Users should independently verify ownership, documentation, approvals, pricing and other material property details before a transaction.</p>

  <h2>18. Changes to This Privacy Policy</h2>
  <p>We may update this Policy to reflect changes in services, technology, vendors, data practices or applicable law.</p>
  <p>The updated version and its effective or last-revised date will be published on the official website or application.</p>
  <p>Where legally required, we will provide additional notice or seek renewed consent before relevant processing.</p>
  <p>Revisions take effect on the date stated in the updated Policy, subject to applicable law.</p>

  <h2>19. Grievance and Privacy Contact</h2>
  <p><strong>Privacy and customer support:</strong> support@zerobriks.com<br/>
  <strong>General enquiries:</strong> info@zerobriks.com<br/>
  <strong>Website:</strong> <a href="https://www.zerobriks.com" class="text-blue-600 underline">www.zerobriks.com</a><br/>
  <strong>Registered office:</strong> FL 2, Square No 14 SP, INNOV8 SKCL Tech Square, Guindy Industrial Estate ,600032  , Chennai - Tamil Nadu<br/>
  
  `;

  const loading = false;
  const error = false;
  const fetchContent = undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { intro, sections } = useMemo(() => parseSections(content), [content]);
  const hasToc = sections.length >= 3;
  const [activeId, setActiveId] = useState("");
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);

  // Reading progress bar, "back to top" button and active section highlight.
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
      setShowTop(window.scrollY > 600);
      let current = sections.length ? sections[0].id : "";
      sections.forEach((s) => {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= 140) current = s.id;
      });
      setActiveId(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sections]);

  const tocList = (
    <ol className="zb-toc">
      {sections.map((s) => (
        <li key={s.id}>
          <a
            href={`#${s.id}`}
            className={s.id === activeId ? "is-active" : ""}
            onClick={(e) => {
              e.preventDefault();
              scrollToId(s.id);
            }}
          >
            {s.title}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <div className="zb-page">
      <style>{PAGE_STYLES}</style>
      <div className="zb-progress" style={{ width: `${progress}%` }} />

      <Hero />

      <div className="px-5 py-8 mx-auto max-w-6xl md:px-8 md:py-12">
        {loading ? (
          <LoadingCard />
        ) : error ? (
          <MessageCard
            text="This page could not be loaded. Check your connection and try again."
            onRetry={fetchContent}
          />
        ) : !content ? (
          <MessageCard text="This page has no content yet." />
        ) : !hasToc ? (
          <div className="p-6 zb-card md:p-10">
            <div className="zb-content" dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        ) : (
          <div className="lg:flex lg:items-start lg:gap-8">
            {/* Sidebar: table of contents + support */}
            <aside className="lg:w-80 lg:flex-shrink-0 lg:sticky lg:top-24">
              <details className="p-4 mb-6 zb-card lg:hidden">
                <summary className="font-bold cursor-pointer" style={{ color: "#1F1416" }}>
                  On this page
                </summary>
                <div className="mt-3">{tocList}</div>
              </details>
              <div
                className="hidden p-4 mb-5 overflow-y-auto zb-card lg:block"
                style={{ maxHeight: "calc(100vh - 20rem)" }}
              >
                <p className="px-3 mb-2 font-bold" style={{ color: "#1F1416" }}>
                  On this page
                </p>
                {tocList}
              </div>
              <div className="hidden lg:block">
                <SupportCard />
              </div>
            </aside>

            {/* Sections */}
            <main className="flex-1 min-w-0">
              {intro && (
                <div className="p-6 mb-5 zb-card zb-card-accent md:p-8">
                  <div className="zb-content" dangerouslySetInnerHTML={{ __html: intro }} />
                </div>
              )}
              {sections.map((s, i) => {
                const numbered = s.title.match(/^(\d+)[.)]\s*(.+)$/);
                return (
                  <section key={s.id} id={s.id} className="p-6 mb-5 zb-card md:p-8">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="zb-badge">{numbered ? numbered[1] : i + 1}</span>
                      <h2 className="zb-section-title">{numbered ? numbered[2] : s.title}</h2>
                    </div>
                    <div className="zb-content" dangerouslySetInnerHTML={{ __html: s.html }} />
                  </section>
                );
              })}
              <div className="lg:hidden">
                <SupportCard />
              </div>
            </main>
          </div>
        )}
      </div>

      {showTop && (
        <button
          type="button"
          className="zb-top"
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          ↑
        </button>
      )}
    </div>
  );
};

export default Privacy;