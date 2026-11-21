import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const PAGE_TITLE = "Terms and Conditions";
const ENDPOINT = "/cust_api/get-term-conditions";
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

const Terms = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}${ENDPOINT}`);
      const rows = response.data?.data;
      if (response.data?.status === 1 && Array.isArray(rows) && rows.length > 0) {
        setContent(rows[0].content || "");
      } else {
        setContent("");
      }
    } catch (err) {
      console.error(`Error fetching ${PAGE_TITLE} content:`, err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchContent();
  }, [fetchContent]);

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

export default Terms;