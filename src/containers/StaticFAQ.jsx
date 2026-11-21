import React, { useEffect, useState } from "react";

const MAROON = "#7A1230";

/* ------------------------------------------------------------------ */
/* CATEGORIES: "General" holds the 10 priority questions.              */
/* Each tab shows only its own questions inside this one section.       */
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
        answer:
          "Ahmedabad , Bengaluru , Chennai , Delhi,  Hyderabad , Kolkata , Mumbai , and Pune .",
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
        question: "How do I post a property on ZEROBRIKS?",
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
          "Interested users may submit enquiries through your property listing. You can review these enquiries and respond using the communication options available on ZEROBRIKS. Access to certain lead-management features may depend on your subscription plan.",
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
        question: "How can I search for properties on ZEROBRIKS?",
        answer:
          "Use the property search feature to explore listings based on your preferred location, budget, property type, size, and other available filters. Review the property details to identify options that match your requirements.",
      },
      {
        question: "How can I contact a property owner or seller?",
        answer:
          "Open the property listing you are interested in and use the available enquiry or contact option. Follow the instructions provided on the platform to connect with the owner or listing representative.",
      },
      {
        question: "Are properties listed on ZEROBRIKS verified?",
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
        question: "How can I find a rental property on ZEROBRIKS?",
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
        question: "How can builders register on ZEROBRIKS?",
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
          "Eligible commercial properties can be listed under the relevant category, subject to the options supported by ZEROBRIKS. These may include offices, shops, showrooms, warehouses, and other commercial spaces.",
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
          "Check property details carefully, verify the identity and authority of the person offering the property, and independently confirm relevant documents. Avoid transferring money based solely on online messages or unverified claims. If you suspect a fraudulent or misleading listing, report it to ZEROBRIKS through the available support channels.",
      },
      {
        question: "Does a verified listing guarantee that a property is legally safe?",
        answer:
          "No. A verification badge should not be treated as a guarantee of legal ownership, clear title, regulatory compliance, or a fraud-free transaction. Buyers and tenants should conduct appropriate independent checks and seek professional advice when necessary.",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* SEO / AEO: FAQPage JSON-LD from the same data shown on the page     */
/* ------------------------------------------------------------------ */
const ALL_FAQS = CATEGORIES.flatMap((c) => c.items);

const buildFaqSchema = (items) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
});

const useFaqSchema = (items, id = "zb-faq-schema") => {
  useEffect(() => {
    const json = JSON.stringify(buildFaqSchema(items));
    let script = document.getElementById(id);
    if (!script) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = id;
      document.head.appendChild(script);
    }
    script.textContent = json;
    return () => {
      const el = document.getElementById(id);
      if (el) el.remove();
    };
  }, [items, id]);
};

/* ------------------------------------------------------------------ */
/* Accordion item                                                      */
/* ------------------------------------------------------------------ */
const AccordionItem = ({ number, question, answer, isOpen, onToggle, id }) => (
  <div
    className={`overflow-hidden rounded-xl border bg-white transition-colors duration-300 ${
      isOpen ? "border-[#7A1230] bg-[#FBF6F3]" : "border-slate-200/80"
    }`}
  >
    <button
      type="button"
      aria-expanded={isOpen}
      aria-controls={`${id}-panel`}
      id={`${id}-button`}
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7A1230]"
    >
      <span className="flex min-w-0 items-center gap-3">
        <span
          className="grid h-6 w-6 flex-none place-items-center rounded-full text-[11px] font-bold text-white"
          style={{ backgroundColor: MAROON }}
        >
          {number}
        </span>
        <span className="text-[13px] font-semibold leading-snug text-gray-900 sm:text-[14px]">
          {question}
        </span>
      </span>
      <span
        className="flex-none text-lg leading-none transition-transform duration-300"
        style={{ color: MAROON, transform: isOpen ? "rotate(45deg)" : "none" }}
        aria-hidden="true"
      >
        +
      </span>
    </button>

    <div
      id={`${id}-panel`}
      role="region"
      aria-labelledby={`${id}-button`}
      className={`grid transition-[grid-template-rows] duration-300 ease-out ${
        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      }`}
    >
      <div className="min-h-0 overflow-hidden">
        <p
          className={`px-4 pb-3 sm:pb-4 pl-[3.25rem] text-[12.5px] leading-relaxed text-gray-600 transition-opacity duration-300 sm:text-[13px] ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
        >
          {answer}
        </p>
      </div>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Section: one block. Tabs at the top, questions for the selected tab  */
/* ------------------------------------------------------------------ */
const FAQ = () => {
  const [activeKey, setActiveKey] = useState(CATEGORIES[0].key);
  const [openIndex, setOpenIndex] = useState(0);

  useFaqSchema(ALL_FAQS);

  const active = CATEGORIES.find((c) => c.key === activeKey);

  const selectTab = (key) => {
    setActiveKey(key);
    setOpenIndex(0); // first question of the selected tab opens
  };

  return (
    <section
      id="faq"
      className="w-full bg-white px-6 py-2 sm:px-6 sm:py-3 md:px-8 lg:px-10 overflow-x-hidden"
    >
      <div className="w-full">
        <div className="w-full">

          {/* Header — same as BuyProperty */}
          <div className="flex flex-col gap-3 mb-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#B9770E]">
                FAQ
              </p>
              <h2
                className="text-[25px] font-semibold text-[#1B1113] sm:text-[26px]"
                style={{ fontFamily: '"Newsreader", Georgia, serif' }}
              >
                Frequently Asked Questions
              </h2>
              <p className="text-[11.5px] text-gray-500">
                Quick answers about listing, buying, renting and staying safe on ZeroBriks.
              </p>
            </div>
          </div>

          {/* Category tabs */}
          <div className="pb-3">
            <div
              className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible sm:pb-0"
              role="tablist"
            >
              {CATEGORIES.map((cat) => {
                const isActive = cat.key === activeKey;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => selectTab(cat.key)}
                    className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7A1230] sm:text-[13px] ${
                      isActive
                        ? "border-[#7A1230] bg-[#7A1230] text-white"
                        : "border-slate-200 bg-white text-gray-700 hover:border-[#7A1230] hover:text-[#7A1230]"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Questions for the selected tab */}
          <div className="grid grid-cols-1 items-start gap-3 pb-2 md:grid-cols-2">
            {active.items.map((faq, i) => (
              <AccordionItem
                key={`${activeKey}-${i}`}
                id={`faq-${activeKey}-${i}`}
                number={i + 1}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default FAQ;