import React from "react";
import {
  FaPercent,
  FaShieldAlt,
  FaRobot,
  FaVrCardboard,
  FaLock,
} from "react-icons/fa";

const MAROON = "#7A1230";

const WHY_CHOOSE_US = [
  {
    icon: FaPercent,
    title: "Zero Brokerage",
    text: "Deal directly with owners and pay no brokerage fee. Every rupee stays with you.",
  },
  {
    icon: FaShieldAlt,
    title: "Verified Owners",
    text: "Every listing is checked before it goes live, so you deal with genuine owners.",
  },
  {
    icon: FaRobot,
    title: "AI Smart Match",
    text: "Share your budget, location and property type. Our AI shows the best-fit properties first.",
  },
  {
    icon: FaVrCardboard,
    title: "Virtual Tours",
    text: "Walk through properties from your phone or laptop before you visit in person.",
  },
  {
    icon: FaLock,
    title: "Secure & Transparent",
    text: "Your data is secure, and pricing is transparent with no hidden fees.",
  },
];

const WhyChooseUs = () => {
  return (
    <section
      id="why"
      className="w-full bg-white px-4 py-2 sm:px-6 sm:py-3 md:px-8 lg:px-10 overflow-x-hidden"
    >
      <div className="flex w-full flex-col">
        <div className="w-full">
          {/* Header — same as BuyProperty */}
          <div className="flex flex-col gap-3 mb-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#B9770E]">
                Why Choose Us
              </p>
              <h2
                className="text-[25px] font-semibold text-[#1B1113] sm:text-[26px]"
                style={{ fontFamily: '"Newsreader", Georgia, serif' }}
              >
                The Zerobriks difference
              </h2>
            </div>
          </div>

          {/* Cards: each card lifts with a light maroon border and a soft shadow on hover */}
          <div className="grid grid-cols-1 gap-3 pb-1 sm:grid-cols-2 sm:gap-4 lg:grid-cols-5">
            {WHY_CHOOSE_US.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="group flex min-w-0 flex-row items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5
                           shadow-[0_12px_28px_-16px_rgba(122,18,48,0.28)]
                           transition-all duration-300 ease-out
                           hover:-translate-y-1 hover:border-[#7A1230]/50
                           hover:shadow-[0_24px_44px_-18px_rgba(122,18,48,0.4)]
                           sm:flex-col sm:items-stretch sm:gap-0"
              >
                {/* Icon */}
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#FBF6F3] text-[#7A1230]">
                  <Icon size={16} />
                </div>

                {/* Title and description */}
                <div className="min-w-0 flex-1">
                  <h3 className="mt-0 text-base font-bold leading-snug text-slate-900 group-hover:text-[#7A1230] sm:mt-3">
                    {title}
                  </h3>

                  <p className="mt-1 text-[13px] leading-relaxed text-slate-700 group-hover:text-[#7A1230] sm:mt-1.5 sm:text-sm">
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;