// import React, { useCallback, useEffect, useMemo, useState } from "react";
// import { Link } from "react-router-dom";
// import axios from "axios";

// const PAGE_TITLE = "Frequently Asked Questions";
// const ENDPOINT = "/cust_api/get-faqs";
// const SUPPORT_EMAIL = "support@zerobriks.com";

// /* ------------------------------------------------------------------ */
// /* Styles (kept in this file so no extra CSS file is needed)           */
// /* ------------------------------------------------------------------ */
// const PAGE_STYLES = `
//   .zb-page { background: #F7F3F3; min-height: 100vh; }

//   /* Hero */
//   .zb-hero { position: relative; overflow: hidden; color: #fff;
//     background: linear-gradient(135deg, #7A0C22 0%, #5C0919 55%, #3F0611 100%); }
//   .zb-hero::before { content: ""; position: absolute; right: -90px; top: -110px; width: 340px; height: 340px;
//     border-radius: 50%; border: 52px solid rgba(201, 162, 77, 0.22); }
//   .zb-hero::after { content: ""; position: absolute; left: -70px; bottom: -120px; width: 240px; height: 240px;
//     border-radius: 50%; border: 36px solid rgba(255, 255, 255, 0.06); }
//   .zb-hero-inner { position: relative; z-index: 1; }
//   .zb-hero-bar { width: 64px; height: 4px; border-radius: 4px; background: #C9A24D; }
//   .zb-crumb, .zb-crumb a { color: rgba(255, 255, 255, 0.75); text-decoration: none; }
//   .zb-crumb a:hover { color: #fff; text-decoration: underline; }
//   .zb-chip { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 999px;
//     font-size: 13px; font-weight: 500; color: #fff; background: rgba(255, 255, 255, 0.12);
//     border: 1px solid rgba(255, 255, 255, 0.22); }
//   .zb-chip-dot { width: 6px; height: 6px; border-radius: 50%; background: #C9A24D; }

//   /* Cards */
//   .zb-card { background: #fff; border: 1px solid #EFE6E7; border-radius: 16px;
//     box-shadow: 0 14px 34px -22px rgba(92, 9, 25, 0.45); }
//   .zb-card-accent { border-top: 4px solid #C9A24D; }
//   .zb-badge { display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
//     width: 38px; height: 38px; border-radius: 12px; font-size: 15px; font-weight: 700;
//     color: #7A0C22; background: #F6E9EB; }
//   .zb-section-title { margin: 0; font-size: 1.2rem; font-weight: 700; line-height: 1.35; color: #1F1416; }
//   .zb-btn { display: inline-flex; align-items: center; justify-content: center; padding: 11px 22px;
//     border-radius: 10px; font-weight: 600; text-decoration: none; cursor: pointer; border: 1px solid transparent; }
//   .zb-btn-primary { background: #7A0C22; color: #fff; }
//   .zb-btn-primary:hover { background: #5C0919; color: #fff; text-decoration: none; }
//   .zb-btn-light { background: #fff; color: #7A0C22; }
//   .zb-btn-light:hover { background: #F6E9EB; color: #7A0C22; text-decoration: none; }
//   .zb-btn-ghost { background: transparent; color: #fff; border-color: rgba(255, 255, 255, 0.6); }
//   .zb-btn-ghost:hover { background: rgba(255, 255, 255, 0.1); color: #fff; text-decoration: none; }
//   .zb-btn:focus-visible, .zb-toc a:focus-visible, .zb-acc-btn:focus-visible, .zb-pill:focus-visible,
//   .zb-search:focus-visible { outline: 3px solid #C9A24D; outline-offset: 2px; }

//   /* Table of contents */
//   .zb-toc { list-style: none; margin: 0; padding: 0; }
//   .zb-toc a { display: block; padding: 7px 12px; border-left: 3px solid transparent; border-radius: 0 8px 8px 0;
//     font-size: 14px; line-height: 1.4; color: #5B4B4E; text-decoration: none; }
//   .zb-toc a:hover { background: #FAF3F4; color: #7A0C22; }
//   .zb-toc a.is-active { border-left-color: #7A0C22; background: #F6E9EB; color: #7A0C22; font-weight: 600; }
//   .zb-progress { position: fixed; top: 0; left: 0; height: 3px; z-index: 60; background: #C9A24D; }
//   .zb-top { position: fixed; right: 20px; bottom: 20px; z-index: 50; width: 46px; height: 46px; border-radius: 50%;
//     border: 0; cursor: pointer; color: #fff; background: #7A0C22; box-shadow: 0 10px 24px -8px rgba(92, 9, 25, 0.7); }

//   /* FAQ */
//   .zb-search { width: 100%; padding: 15px 18px 15px 48px; border-radius: 14px; border: 1px solid #E6D9DB; font-size: 16px;
//     color: #1F1416; background: #fff; box-shadow: 0 14px 30px -22px rgba(92, 9, 25, 0.5); }
//   .zb-pill { padding: 8px 16px; border-radius: 999px; font-size: 14px; font-weight: 500; cursor: pointer;
//     color: #3A2A2D; background: #fff; border: 1px solid #E6D9DB; }
//   .zb-pill.is-active { color: #fff; background: #7A0C22; border-color: #7A0C22; }
//   .zb-acc { background: #fff; border: 1px solid #EFE6E7; border-radius: 14px; margin-bottom: 12px;
//     transition: box-shadow 150ms ease, border-color 150ms ease; }
//   .zb-acc.is-open { border-color: #D9B9BE; box-shadow: 0 14px 30px -22px rgba(92, 9, 25, 0.6); }
//   .zb-acc-btn { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; width: 100%;
//     padding: 18px 20px; border: 0; background: transparent; cursor: pointer; text-align: left;
//     font-size: 16px; font-weight: 600; line-height: 1.45; color: #1F1416; border-radius: 14px; }
//   .zb-acc-icon { position: relative; flex-shrink: 0; width: 26px; height: 26px; border-radius: 50%; background: #F6E9EB; }
//   .zb-acc-icon::before, .zb-acc-icon::after { content: ""; position: absolute; left: 7px; top: 12px; width: 12px;
//     height: 2px; border-radius: 2px; background: #7A0C22; transition: transform 150ms ease; }
//   .zb-acc-icon::after { transform: rotate(90deg); }
//   .zb-acc.is-open .zb-acc-icon::after { transform: rotate(0deg); }
//   .zb-acc-panel { padding: 0 20px 20px; }

//   /* Backend HTML */
//   .zb-content { color: #4A3D40; font-size: 16px; line-height: 1.75; overflow-wrap: anywhere; }
//   .zb-content * { font-family: inherit !important; max-width: 100%; }
//   .zb-content > *:first-child { margin-top: 0 !important; }
//   .zb-content > *:last-child { margin-bottom: 0 !important; }
//   .zb-content h1, .zb-content h2, .zb-content h3, .zb-content h4 { color: #1F1416; font-weight: 700; line-height: 1.3; }
//   .zb-content h1 { font-size: 1.5rem; margin: 0 0 1rem; }
//   .zb-content h2 { font-size: 1.25rem; color: #7A0C22; margin: 2rem 0 0.75rem; }
//   .zb-content h3 { font-size: 1.1rem; margin: 1.5rem 0 0.5rem; }
//   .zb-content h4 { font-size: 1rem; margin: 1.25rem 0 0.4rem; }
//   .zb-content p { margin: 0 0 1rem; }
//   .zb-content p:empty { display: none; }
//   .zb-content ul, .zb-content ol { margin: 0 0 1rem; padding-left: 0; list-style: none; }
//   .zb-content ol { counter-reset: zb-ol; }
//   .zb-content li { position: relative; margin-bottom: 0.55rem; padding-left: 1.75rem; }
//   .zb-content ul > li::before { content: ""; position: absolute; left: 0.3rem; top: 0.65em; width: 8px; height: 8px;
//     border-radius: 50%; background: #C9A24D; box-shadow: 0 0 0 4px #FBF3E0; }
//   .zb-content ol > li { counter-increment: zb-ol; }
//   .zb-content ol > li::before { content: counter(zb-ol) "."; position: absolute; left: 0; font-weight: 700; color: #7A0C22; }
//   .zb-content li > p { margin-bottom: 0.25rem; }
//   .zb-content a { color: #7A0C22; text-decoration: underline; }
//   .zb-content strong, .zb-content b { color: #1F1416; font-weight: 600; }
//   .zb-content blockquote { margin: 0 0 1rem; padding: 0.75rem 1rem; border-left: 4px solid #C9A24D;
//     border-radius: 0 10px 10px 0; background: #FBF7EC; }
//   .zb-content hr { margin: 1.75rem 0; border: 0; border-top: 1px solid #EFE6E7; }
//   .zb-content img { height: auto; border-radius: 12px; }
//   .zb-content table { display: block; width: 100%; margin: 0 0 1.25rem; overflow-x: auto; border-collapse: collapse; }
//   .zb-content th, .zb-content td { padding: 0.65rem 0.8rem; border: 1px solid #EFE6E7; text-align: left; vertical-align: top; }
//   .zb-content th { background: #F6E9EB; color: #7A0C22; font-weight: 600; }
//   @media (min-width: 768px) { .zb-content-cols ul { column-count: 2; column-gap: 2.5rem; }
//     .zb-content-cols li { break-inside: avoid; } }

//   .zb-skeleton { border-radius: 8px; background: #EFE6E7; animation: zb-pulse 1.4s ease-in-out infinite; }
//   @keyframes zb-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
//   @media (prefers-reduced-motion: reduce) { .zb-skeleton { animation: none; }
//     .zb-acc, .zb-acc-icon::before, .zb-acc-icon::after { transition: none; } }
// `;

// /* ------------------------------------------------------------------ */
// /* Splits the backend HTML into sections at every heading              */
// /* ------------------------------------------------------------------ */
// // A heading is an <h1>-<h6> tag, or a short paragraph that is entirely bold
// // (how most admin editors save headings). Text before the first heading is
// // returned as "intro". If the HTML has no headings, "sections" is empty and
// // the page simply shows the content as one formatted block.
// const parseSections = (html) => {
//   if (!html || typeof DOMParser === "undefined") return { intro: "", sections: [] };
//   const doc = new DOMParser().parseFromString(html, "text/html");

//   let root = doc.body;
//   while (
//     root.children.length === 1 &&
//     /^(DIV|SECTION|ARTICLE|MAIN)$/.test(root.children[0].tagName) &&
//     root.textContent.trim() === root.children[0].textContent.trim()
//   ) {
//     root = root.children[0];
//   }

//   const isHeading = (node) => {
//     if (node.nodeType !== 1) return false;
//     if (/^H[1-6]$/.test(node.tagName)) return node.textContent.trim().length > 0;
//     if (!/^(P|DIV)$/.test(node.tagName)) return false;
//     const text = node.textContent.trim();
//     if (!text || text.length > 140) return false;
//     const kids = Array.from(node.childNodes);
//     const onlyBold = kids.every(
//       (k) =>
//         (k.nodeType === 3 && !k.textContent.trim()) ||
//         (k.nodeType === 1 && /^(STRONG|B|BR)$/.test(k.tagName)),
//     );
//     return onlyBold && kids.some((k) => k.nodeType === 1 && /^(STRONG|B)$/.test(k.tagName));
//   };

//   let intro = "";
//   const sections = [];
//   Array.from(root.childNodes).forEach((node) => {
//     if (isHeading(node)) {
//       sections.push({
//         id: `zb-section-${sections.length + 1}`,
//         title: node.textContent.replace(/\s+/g, " ").trim(),
//         html: "",
//         text: "",
//         hasList: false,
//       });
//       return;
//     }
//     const nodeHtml = node.nodeType === 1 ? node.outerHTML : node.textContent;
//     const nodeText = node.textContent.trim();
//     const current = sections[sections.length - 1];
//     if (!current) {
//       if (nodeText) intro += nodeHtml;
//       return;
//     }
//     current.html += nodeHtml;
//     current.text = `${current.text} ${nodeText}`.trim();
//     if (node.nodeType === 1 && (/^(UL|OL)$/.test(node.tagName) || node.querySelector("ul, ol"))) {
//       current.hasList = true;
//     }
//   });
//   return { intro, sections };
// };

// const scrollToId = (id) => {
//   const el = document.getElementById(id);
//   if (!el) return;
//   const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
//   const top = el.getBoundingClientRect().top + window.scrollY - 100;
//   window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
// };

// /* ------------------------------------------------------------------ */
// /* Shared pieces                                                       */
// /* ------------------------------------------------------------------ */
// const Hero = () => (
//   <header className="zb-hero">
//     <div className="px-5 py-5 mx-auto zb-hero-inner max-w-6xl md:px-8 md:py-6">
//       <nav aria-label="Breadcrumb" className="mb-1 text-sm zb-crumb">
//         <Link to="/">Home</Link>
//         <span className="mx-2">›</span>
//         <span style={{ color: "#fff" }}>{PAGE_TITLE}</span>
//       </nav>
//       <h1 className="text-xl font-bold leading-tight md:text-2xl" style={{ color: "#fff", margin: 0 }}>
//         {PAGE_TITLE}
//       </h1>
//     </div>
//   </header>
// );

// const LoadingCard = () => (
//   <div className="p-6 zb-card md:p-10" aria-label="Loading">
//     <div className="zb-skeleton" style={{ width: "35%", height: 22, marginBottom: 22 }} />
//     <div className="zb-skeleton" style={{ height: 14, marginBottom: 12 }} />
//     <div className="zb-skeleton" style={{ height: 14, marginBottom: 12 }} />
//     <div className="zb-skeleton" style={{ width: "80%", height: 14, marginBottom: 30 }} />
//     <div className="zb-skeleton" style={{ width: "28%", height: 22, marginBottom: 22 }} />
//     <div className="zb-skeleton" style={{ height: 14, marginBottom: 12 }} />
//     <div className="zb-skeleton" style={{ width: "65%", height: 14 }} />
//   </div>
// );

// const MessageCard = ({ text, onRetry }) => (
//   <div className="p-8 text-center zb-card md:p-12">
//     <p style={{ margin: 0, color: "#4A3D40" }}>{text}</p>
//     {onRetry && (
//       <button type="button" onClick={onRetry} className="mt-5 zb-btn zb-btn-primary">
//         Try again
//       </button>
//     )}
//   </div>
// );

// // Turns the parsed sections into topic groups with questions. A heading with
// // no text under it (for example "Property Owners") starts a new topic; every
// // other heading is a question and the text under it is the answer.
// const buildFaqGroups = (html) => {
//   const { sections } = parseSections(html);
//   const groups = [];
//   let current = null;
//   sections.forEach((s) => {
//     if (!s.text) {
//       current = { title: s.title, items: [] };
//       groups.push(current);
//       return;
//     }
//     if (!current) {
//       current = { title: "", items: [] };
//       groups.push(current);
//     }
//     current.items.push({ id: s.id, q: s.title.replace(/^\d+[.)]\s*/, ""), html: s.html, text: s.text });
//   });
//   return groups.filter((g) => g.items.length > 0);
// };

// const Faq = () => {
//   const [content, setContent] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(false);

//   const fetchContent = useCallback(async () => {
//     setLoading(true);
//     setError(false);
//     try {
//       const response = await axios.get(`${process.env.REACT_APP_API_URL}${ENDPOINT}`);
//       const rows = response.data?.data;
//       if (response.data?.status === 1 && Array.isArray(rows) && rows.length > 0) {
//         setContent(rows[0].content || "");
//       } else {
//         setContent("");
//       }
//     } catch (err) {
//       console.error(`Error fetching ${PAGE_TITLE} content:`, err);
//       setError(true);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     window.scrollTo(0, 0);
//     fetchContent();
//   }, [fetchContent]);

//   const groups = useMemo(() => buildFaqGroups(content), [content]);
//   const totalQuestions = groups.reduce((sum, g) => sum + g.items.length, 0);
//   const isAccordion = totalQuestions >= 2;
//   const [query, setQuery] = useState("");
//   const [activeGroup, setActiveGroup] = useState("all");
//   const [openId, setOpenId] = useState("");

//   const term = query.trim().toLowerCase();
//   const visibleGroups = groups
//     .filter((g, i) => term || activeGroup === "all" || activeGroup === String(i))
//     .map((g) => ({
//       ...g,
//       items: g.items.filter(
//         (item) => !term || item.q.toLowerCase().includes(term) || item.text.toLowerCase().includes(term),
//       ),
//     }))
//     .filter((g) => g.items.length > 0);
//   const namedGroups = groups.filter((g) => g.title);

//   return (
//     <div className="zb-page">
//       <style>{PAGE_STYLES}</style>

//       <Hero />

//       <div className="px-5 py-8 mx-auto max-w-4xl md:px-8 md:py-12">
//         {loading ? (
//           <LoadingCard />
//         ) : error ? (
//           <MessageCard
//             text="This page could not be loaded. Check your connection and try again."
//             onRetry={fetchContent}
//           />
//         ) : !content ? (
//           <MessageCard text="This page has no content yet." />
//         ) : !isAccordion ? (
//           <div className="p-6 zb-card md:p-10">
//             <div className="zb-content" dangerouslySetInnerHTML={{ __html: content }} />
//           </div>
//         ) : (
//           <>
//             {/* Search */}
//             <div className="relative mb-6">
//               <svg
//                 aria-hidden="true"
//                 width="20"
//                 height="20"
//                 viewBox="0 0 20 20"
//                 fill="none"
//                 style={{ position: "absolute", left: 16, top: 16 }}
//               >
//                 <circle cx="9" cy="9" r="6" stroke="#7A0C22" strokeWidth="2" />
//                 <path d="M14 14l4 4" stroke="#7A0C22" strokeWidth="2" strokeLinecap="round" />
//               </svg>
//               <input
//                 type="search"
//                 className="zb-search"
//                 aria-label="Search the questions"
//                 placeholder={`Search ${totalQuestions} questions`}
//                 value={query}
//                 onChange={(e) => {
//                   setQuery(e.target.value);
//                   setOpenId("");
//                 }}
//               />
//             </div>

//             {/* Topic filter */}
//             {!term && namedGroups.length > 1 && (
//               <div className="flex flex-wrap gap-2 mb-8" role="group" aria-label="Filter by topic">
//                 <button
//                   type="button"
//                   className={`zb-pill ${activeGroup === "all" ? "is-active" : ""}`}
//                   aria-pressed={activeGroup === "all"}
//                   onClick={() => setActiveGroup("all")}
//                 >
//                   All topics
//                 </button>
//                 {groups.map((g, i) =>
//                   g.title ? (
//                     <button
//                       key={g.title}
//                       type="button"
//                       className={`zb-pill ${activeGroup === String(i) ? "is-active" : ""}`}
//                       aria-pressed={activeGroup === String(i)}
//                       onClick={() => {
//                         setActiveGroup(String(i));
//                         setOpenId("");
//                       }}
//                     >
//                       {g.title}
//                     </button>
//                   ) : null,
//                 )}
//               </div>
//             )}

//             {visibleGroups.length === 0 && (
//               <MessageCard text={`No questions match “${query.trim()}”. Try a different word.`} />
//             )}

//             {visibleGroups.map((g) => (
//               <section key={g.title || "faq"} className="mb-10">
//                 {g.title && (
//                   <div className="flex items-center gap-3 mb-4">
//                     <h2 className="zb-section-title" style={{ color: "#7A0C22" }}>
//                       {g.title}
//                     </h2>
//                     <span className="zb-badge" style={{ width: 30, height: 30, fontSize: 13, borderRadius: 999 }}>
//                       {g.items.length}
//                     </span>
//                   </div>
//                 )}
//                 {g.items.map((item) => {
//                   const open = openId === item.id;
//                   return (
//                     <div key={item.id} className={`zb-acc ${open ? "is-open" : ""}`}>
//                       <h3 style={{ margin: 0 }}>
//                         <button
//                           type="button"
//                           className="zb-acc-btn"
//                           aria-expanded={open}
//                           aria-controls={`${item.id}-panel`}
//                           onClick={() => setOpenId(open ? "" : item.id)}
//                         >
//                           <span>{item.q}</span>
//                           <span className="zb-acc-icon" aria-hidden="true" />
//                         </button>
//                       </h3>
//                       {open && (
//                         <div
//                           id={`${item.id}-panel`}
//                           className="zb-acc-panel zb-content"
//                           dangerouslySetInnerHTML={{ __html: item.html }}
//                         />
//                       )}
//                     </div>
//                   );
//                 })}
//               </section>
//             ))}

//             {/* Still need help */}
//             <div className="p-8 text-center zb-hero md:p-10" style={{ borderRadius: 18 }}>
//               <div className="zb-hero-inner">
//                 <h2 className="text-xl font-bold md:text-2xl" style={{ margin: 0, color: "#fff" }}>
//                   Still have a question?
//                 </h2>
//                 <p className="mt-2 mb-5" style={{ color: "rgba(255,255,255,0.85)" }}>
//                   Our support team can help with listings, your account and payments.
//                 </p>
//                 <a href={`mailto:${SUPPORT_EMAIL}`} className="zb-btn zb-btn-light">
//                   Email {SUPPORT_EMAIL}
//                 </a>
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Faq;





import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const PAGE_TITLE = "FAQ";
const SUPPORT_EMAIL = "support@zerobriks.com";
const SUPPORT_PHONE = "+91 9890911818";
const SUPPORT_PHONE_HREF = "tel:+919890911818";

/* ------------------------------------------------------------------ */
/* Styles: same design system as the Privacy page                      */
/* ------------------------------------------------------------------ */
const PAGE_STYLES = `
  .zb-page { background: #F7F3F3; min-height: 100vh; }

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

  .zb-card { background: #fff; border: 1px solid #EFE6E7; border-radius: 16px;
    box-shadow: 0 14px 34px -22px rgba(92, 9, 25, 0.45); }
  .zb-card-accent { border-top: 4px solid #C9A24D; }
  .zb-btn { display: inline-flex; align-items: center; justify-content: center; padding: 11px 22px;
    border-radius: 10px; font-weight: 600; text-decoration: none; cursor: pointer; border: 1px solid transparent; }
  .zb-btn-primary { background: #7A0C22; color: #fff; }
  .zb-btn-primary:hover { background: #5C0919; color: #fff; text-decoration: none; }
  .zb-btn:focus-visible, .zb-pill:focus-visible, .zb-acc-btn:focus-visible, .zb-search:focus-visible,
  .zb-link:focus-visible { outline: 3px solid #C9A24D; outline-offset: 2px; }

  .zb-search-wrap { position: relative; }
  .zb-search-icon { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); color: #7A0C22; pointer-events: none; }
  .zb-search { width: 100%; padding: 15px 18px 15px 48px; border-radius: 14px; border: 0; font-size: 16px;
    color: #1F1416; background: #fff; box-shadow: 0 16px 34px -18px rgba(0, 0, 0, 0.55); }
  .zb-search::placeholder { color: #9A8A8D; }

  .zb-pill { padding: 8px 16px; border-radius: 999px; font-size: 14px; font-weight: 500; cursor: pointer;
    color: #3A2A2D; background: #fff; border: 1px solid #E6D9DB; white-space: nowrap; }
  .zb-pill.is-active { color: #fff; background: #7A0C22; border-color: #7A0C22; }
  .zb-pill-row { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; }
  .zb-pill-row::-webkit-scrollbar { display: none; }

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
  .zb-acc-panel { padding: 0 20px 20px; color: #4A3D40; font-size: 15px; line-height: 1.75; }
  .zb-tag { display: inline-block; margin-left: 8px; padding: 2px 8px; border-radius: 999px;
    font-size: 11px; font-weight: 600; color: #7A0C22; background: #F6E9EB; vertical-align: middle; }

  .zb-skeleton { border-radius: 8px; background: #EFE6E7; }

  @media (prefers-reduced-motion: reduce) {
    .zb-acc, .zb-acc-icon::before, .zb-acc-icon::after { transition: none; }
  }
`;

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */
const CATEGORIES = [
  {
    key: "general",
    label: "General",
    items: [
      {
        question: "What does zero brokerage mean on ZeroBriks?",
        answer:
          "You deal directly with the property owner, so there is no broker and no commission. You agree on the price or rent with the owner yourself.",
      },
      {
        question: "Is it really free to list my property?",
        answer:
          "Yes. Owners and NRIs can post a property ad for free. Register, verify your mobile number with an OTP, and add your property details.",
      },
      {
        question: "How are property owners verified?",
        answer:
          "ZeroBriks lists properties posted directly by owners who register on the platform. Even so, always visit the property and check the documents before you pay anything.",
      },
      {
        question: "Can NRIs list or buy property through ZeroBriks?",
        answer:
          "Yes. NRIs can post a property for free and use the property management support for owners.",
      },
      {
        question: "Which cities does ZeroBriks cover?",
        answer: "Mumbai, Delhi, Bengaluru, Hyderabad, Chennai, Pune, Kolkata, and Ahmedabad.",
      },
      {
        question: "How do I contact an owner directly?",
        answer:
          "Open the property and use the contact option on the listing. You deal with the owner directly, so you can ask questions and arrange a visit yourself.",
      },
      {
        question: "Can I get a rent agreement through ZeroBriks?",
        answer:
          "Yes. You can get a rent agreement and property management support through ZeroBriks. Contact support to get started.",
      },
      {
        question: "Do you offer packers and movers or registration help?",
        answer:
          "ZeroBriks offers rent agreement and property management support. Call +91 9890911818 or email support@zerobriks.com to find out what is available for your move.",
      },
      {
        question: "Are there any hidden charges?",
        answer:
          "No. Searching, contacting owners and posting a free ad cost nothing. ZeroBriks charges no middlemen and no brokerage.",
      },
      {
        question: "How do I report a suspicious listing?",
        answer:
          "Email the listing link to support@zerobriks.com and we'll look into it. Do not pay any advance before you have seen the property and checked the documents.",
      },
    ],
  },
  {
    key: "owners",
    label: "Property Owners",
    items: [
      {
        question: "How do I post a property on ZeroBriks?",
        answer:
          "Log in to your account, select the Post Property option, choose the appropriate category, enter the property details, upload photos, and submit your listing according to the platform's requirements.",
      },
      {
        question: "What information is required to list a property?",
        answer:
          "You may need to provide the property location, type, price or rent, area, amenities, availability, and photographs. Additional information or documents may be required depending on the property category and verification requirements.",
      },
      {
        question: "Can I edit or remove my property listing?",
        answer:
          "You can manage your property listing through your account, subject to the available features. Where supported, you can update property details, pricing, photos, availability, or remove a listing that is no longer relevant.",
      },
      {
        question: "How can I connect with interested buyers or tenants?",
        answer:
          "Interested users may submit enquiries through your property listing. You can review these enquiries and respond using the communication options available on ZeroBriks. Access to certain lead-management features may depend on your subscription plan.",
      },
      {
        question: "How can I increase the visibility of my property listing?",
        answer:
          "Provide accurate property details, clear photographs, relevant amenities, and up-to-date pricing. If promotional plans are available, you can review their features and pricing to determine whether they meet your requirements.",
      },
    ],
  },
  {
    key: "buyers",
    label: "Property Buyers",
    items: [
      {
        question: "How can I search for properties on ZeroBriks?",
        answer:
          "Use the property search feature to explore listings based on your preferred location, budget, property type, size, and other available filters. Review the property details to identify options that match your requirements.",
      },
      {
        question: "How can I contact a property owner or seller?",
        answer:
          "Open the property listing you are interested in and use the available enquiry or contact option. Follow the instructions provided on the platform to connect with the owner or listing representative.",
      },
      {
        question: "Are properties listed on ZeroBriks verified?",
        answer:
          "Verification status may vary by listing. If a property displays a Verified badge, review the scope of the verification. Always independently check ownership, legal documents, approvals, and other relevant details before making a payment or committing to a transaction.",
      },
      {
        question: "Can I schedule a property visit before buying?",
        answer:
          "You can contact the property owner or representative to request a visit. The visit will depend on the property's availability and the owner's or representative's schedule.",
      },
    ],
  },
  {
    key: "tenants",
    label: "Tenants & Rentals",
    items: [
      {
        question: "How can I find a rental property on ZeroBriks?",
        answer:
          "Explore rental listings and use available filters such as location, monthly rent, property type, number of bedrooms, furnishing status, and amenities. Contact the relevant party to confirm availability and arrange a visit.",
      },
      {
        question: "Can I negotiate rent and security deposits?",
        answer:
          "Rent, security deposits, and other rental terms can be discussed directly with the property owner. Confirm all agreed terms, payment conditions, maintenance charges, and refund provisions in writing before finalising the rental agreement.",
      },
      {
        question: "Can I save properties for later?",
        answer:
          "If the saved-properties or favourites feature is available on your account, you can save suitable listings for future reference. Property availability and pricing may change over time.",
      },
    ],
  },
  {
    key: "builders",
    label: "Builders & Developers",
    items: [
      {
        question: "How can builders register on ZeroBriks?",
        answer:
          "Builders and developers can use the relevant registration option, where available, and submit the required business information and verification documents. Access to project-listing features may depend on successful registration and applicable requirements.",
      },
      {
        question: "How can builders list and manage their projects?",
        answer:
          "Where builder project-management features are available, registered builders can submit eligible project details, including location, pricing, configurations, amenities, and photographs. Supported project information and availability can be updated through the applicable dashboard or management process.",
      },
    ],
  },
  {
    key: "commercial",
    label: "Commercial",
    items: [
      {
        question: "Can I list commercial property for rent, lease, or sale?",
        answer:
          "Eligible commercial properties can be listed under the relevant category, subject to the options supported by ZeroBriks. These may include offices, shops, showrooms, warehouses, and other commercial spaces.",
      },
    ],
  },
  {
    key: "safety",
    label: "Payments & Safety",
    items: [
      {
        question: "Are there any charges for listing or promoting a property?",
        answer:
          "Charges, if applicable, depend on the listing type, promotional service, or subscription plan. Review the current pricing, included features, validity, and terms before making a payment.",
      },
      {
        question: "How can I identify or report a suspicious property listing?",
        answer:
          "Check property details carefully, verify the identity and authority of the person offering the property, and independently confirm relevant documents. Avoid transferring money based solely on online messages or unverified claims. If you suspect a fraudulent or misleading listing, report it to ZeroBriks through the available support channels.",
      },
      {
        question: "Does a verified listing guarantee that a property is legally safe?",
        answer:
          "No. A verification badge should not be treated as a guarantee of legal ownership, clear title, regulatory compliance, or a fraud-free transaction. Buyers and tenants should conduct appropriate independent checks and seek professional advice when necessary.",
      },
    ],
  },
];

const ALL_FAQS = CATEGORIES.flatMap((c) =>
  c.items.map((item) => ({ ...item, category: c.key, categoryLabel: c.label }))
);

/* ------------------------------------------------------------------ */
/* SEO: FAQPage structured data from the same list shown on the page   */
/* ------------------------------------------------------------------ */
const buildFaqSchema = () => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: ALL_FAQS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
});

const useFaqSchema = (id = "zb-faq-schema") => {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = id;
    script.textContent = JSON.stringify(buildFaqSchema());
    document.head.appendChild(script);
    return () => script.remove();
  }, [id]);
};

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */
const Hero = () => (
  <header className="zb-hero">
    <div className="px-5 py-8 mx-auto zb-hero-inner max-w-6xl md:px-8 md:py-10">
      <nav aria-label="Breadcrumb" className="mb-2 text-sm zb-crumb">
        <Link to="/">Home</Link>
        <span className="mx-2">›</span>
        <span style={{ color: "#fff" }}>{PAGE_TITLE}</span>
      </nav>
      <h1 className="text-xl font-bold leading-tight md:text-3xl" style={{ color: "#fff", margin: "0 0 12px" }}>
        Frequently asked questions
      </h1>
      <div className="zb-hero-bar" />
      <p className="max-w-xl mt-4 text-sm md:text-base" style={{ color: "rgba(255,255,255,0.85)", margin: 0 }}>
        Quick answers about listing, buying, renting and staying safe on ZeroBriks.
      </p>
    </div>
  </header>
);

const SupportCard = () => (
  <div className="p-6 zb-card zb-card-accent">
    <p className="font-bold" style={{ margin: "0 0 6px", color: "#1F1416" }}>
      Still need help?
    </p>
    <p className="text-sm" style={{ margin: "0 0 14px", color: "#5B4B4E", lineHeight: 1.6 }}>
      Our support team can help with your account, listings and payments.
    </p>
    <a href={`mailto:${SUPPORT_EMAIL}`} className="w-full mb-2 text-sm zb-btn zb-btn-primary">
      {SUPPORT_EMAIL}
    </a>
    <a href={SUPPORT_PHONE_HREF} className="zb-link block text-sm text-center font-semibold" style={{ color: "#7A0C22" }}>
      Call {SUPPORT_PHONE}
    </a>
  </div>
);

const AccordionItem = ({ item, isOpen, onToggle, showTag, id }) => (
  <div className={`zb-acc ${isOpen ? "is-open" : ""}`}>
    <button
      type="button"
      className="zb-acc-btn"
      aria-expanded={isOpen}
      aria-controls={`${id}-panel`}
      id={`${id}-button`}
      onClick={onToggle}
    >
      <span>
        {item.question}
        {showTag && <span className="zb-tag">{item.categoryLabel}</span>}
      </span>
      <span className="zb-acc-icon" aria-hidden="true" />
    </button>
    {isOpen && (
      <div id={`${id}-panel`} role="region" aria-labelledby={`${id}-button`} className="zb-acc-panel">
        {item.answer}
      </div>
    )}
  </div>
);

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
const FAQ = () => {
  useFaqSchema();

  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_FAQS.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (!q) return true;
      return item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q);
    });
  }, [category, query]);

  const pills = [{ key: "all", label: "All" }, ...CATEGORIES.map((c) => ({ key: c.key, label: c.label }))];

  return (
    <div className="zb-page">
      <style>{PAGE_STYLES}</style>
      <Hero />

      <div className="px-5 py-8 mx-auto max-w-6xl md:px-8 md:py-12">
        <div className="lg:flex lg:items-start lg:gap-8">
          {/* Main column */}
          <main className="flex-1 min-w-0">
            <div className="mb-5 zb-search-wrap">
              <svg className="zb-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                className="zb-search"
                placeholder="Search questions, e.g. brokerage, verification"
                aria-label="Search FAQs"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpenId(null);
                }}
              />
            </div>

            <div className="mb-6 zb-pill-row" role="tablist" aria-label="FAQ categories">
              {pills.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  role="tab"
                  aria-selected={category === p.key}
                  className={`zb-pill ${category === p.key ? "is-active" : ""}`}
                  onClick={() => {
                    setCategory(p.key);
                    setOpenId(null);
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <p className="mb-4 text-sm" style={{ color: "#6B5B5E", margin: "0 0 14px" }}>
              {visible.length} {visible.length === 1 ? "question" : "questions"}
            </p>

            {visible.length === 0 ? (
              <div className="p-8 text-center zb-card">
                <p style={{ margin: 0, color: "#4A3D40" }}>No questions match your search.</p>
                <button
                  type="button"
                  className="mt-4 zb-btn zb-btn-primary"
                  onClick={() => {
                    setQuery("");
                    setCategory("all");
                  }}
                >
                  Show all questions
                </button>
              </div>
            ) : (
              visible.map((item, i) => {
                const id = `faq-${item.category}-${i}`;
                return (
                  <AccordionItem
                    key={item.question}
                    id={id}
                    item={item}
                    isOpen={openId === id}
                    onToggle={() => setOpenId((cur) => (cur === id ? null : id))}
                    showTag={category === "all"}
                  />
                );
              })
            )}
          </main>

          {/* Side column */}
          <aside className="mt-8 lg:mt-0 lg:w-80 lg:flex-shrink-0 lg:sticky lg:top-24">
            <SupportCard />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default FAQ;