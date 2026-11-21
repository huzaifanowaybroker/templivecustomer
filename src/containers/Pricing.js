// import React, { useState, useRef, useEffect } from "react";
// import {
// 	Check,
// 	ChevronDown,
// 	ChevronUp,
// 	ChevronLeft,
// 	ChevronRight,
// 	Clock,
// 	CreditCard,
// 	Crown,
// 	HelpCircle,
// 	Layers,
// 	Search,
// 	ShieldCheck,
// 	Sparkles,
// 	Unlock,
// 	X,
// 	Zap,
// } from "lucide-react";

// const STUDENT_FEATURES = [
// 	"Browse student-focused PG, hostel & rental listings",
// 	"AI property matching & recommendations, where available",
// 	"Smart location & map-based search with filters",
// 	"Photos, videos & virtual tours where available",
// 	"Save listings and track your enquiries",
// ];

// const STUDENT_PERKS = ["Live Access Timer", "Unlocks Remaining Counter", "Free Browsing After Expiry"];
// const STUDENT_NOTE = "Unused unlocks expire when access ends. Browsing stays free.";

// // One card per student pass (from the NWB Student Access proposal)
// const STUDENT_PLANS = [
// 	{ id: "student-quick", name: "Student Quick Access", usp: "A quick 3-hour pass to unlock a few contacts and shortlist your top options.", price: 49, duration: "3 Hours", unlocks: 3 },
// 	{ id: "student-discovery", name: "Student Discovery", usp: "6 hours to explore more PGs and hostels near your college and unlock your favourites.", price: 99, duration: "6 Hours", unlocks: 5 },
// 	{ id: "student-day", name: "Student Day Pass", usp: "A full day of access to compare listings and unlock contacts at your own pace.", price: 149, duration: "24 Hours", unlocks: 10 },
// 	{ id: "student-explorer", name: "Student Explorer", usp: "48 hours and up to 15 unlocks for a thorough accommodation search.", price: 199, duration: "48 Hours", unlocks: 15 },
// ].map(({ price, duration, unlocks, ...plan }) => ({
// 	...plan,
// 	tag: "Students",
// 	category: "Students",
// 	tiers: [{ price, duration, unlocks, discount: "Base Tier" }],
// 	features: [`Unlock up to ${unlocks} owner / provider contacts`, ...STUDENT_FEATURES],
// 	perks: STUDENT_PERKS,
// 	note: STUDENT_NOTE,
// }));

// const PLANS = [
// 	{
// 		id: "owner-active",
// 		name: "Owner Active",
// 		tag: "Property Owners",
// 		category: "Owners",
// 		usp: "Property Visibility + Lead Generation + AI 24×7 + AI Property Matching + Virtual Tours + AI Recommendations",
// 		tiers: [
// 			{ price: 399, duration: "30 Days", discount: "Base Tier" },
// 			{ price: 699, duration: "60 Days", discount: "Save 12%" },
// 			{ price: 999, duration: "90 Days", discount: "Save 16%" },
// 		],
// 		features: [
// 			"Enhanced property visibility across relevant searches",
// 			"Lead generation from interested property seekers",
// 			"AI assistance 24×7 for listings & enquiries",
// 			"AI property matching with buyers / tenants",
// 			"Virtual property tours & immersive media",
// 			"AI property recommendations to relevant seekers",
// 		],
// 		perks: ["Verified Owner Badge", "Instant WhatsApp Alerts", "Dedicated Support"],
// 	},
// 	{
// 		id: "res-rental-seeker",
// 		name: "Residential Rental Seeker",
// 		tag: "Residential Rental Seekers",
// 		category: "Seekers",
// 		usp: "Unlimited Property Search + AI Matching + Smart Map Search + Up to 30 Contact Unlocks + Virtual Tours",
// 		tiers: [
// 			{ price: 499, duration: "30 Days", discount: "Base Tier" },
// 			{ price: 899, duration: "60 Days", discount: "Save 10%" },
// 			{ price: 1299, duration: "90 Days", discount: "Save 13%" },
// 		],
// 		features: [
// 			"Unlimited eligible rental property search",
// 			"Up to 30 property contact unlocks",
// 			"AI matching on budget, location & requirements",
// 			"Smart map search with radius-based results",
// 			"Virtual tours for eligible listings",
// 		],
// 		perks: ["Zero Brokerage Guarantee", "Priority Owner Calls", "Neighborhood Insights"],
// 		popular: true,
// 	},
// 	{
// 		id: "res-buyer-seeker",
// 		name: "Residential Buyer Seeker",
// 		tag: "Residential Property Buyers",
// 		category: "Seekers",
// 		usp: "Smart Property Discovery + AI Matching + Location Intelligence + Property Comparison + Virtual Tours",
// 		tiers: [
// 			{ price: 999, duration: "30 Days", discount: "Base Tier" },
// 			{ price: 1099, duration: "60 Days", discount: "Best Value - Save 45%" },
// 			{ price: 1599, duration: "90 Days", discount: "Save 46%" },
// 		],
// 		features: [
// 			"Smart property discovery tools",
// 			"AI-powered property matching",
// 			"Location intelligence & insights",
// 			"Side-by-side property comparison",
// 			"Virtual tours + limited contact unlocks",
// 		],
// 		perks: ["Legal Document Verification Check", "Valuation Calculator", "Direct Builder Directs"],
// 	},
// 	...STUDENT_PLANS,
// 	{
// 		id: "comm-rental-seeker",
// 		name: "Commercial Rental Seeker",
// 		tag: "Commercial Rental Seekers",
// 		category: "Commercial",
// 		usp: "Commercial Property Discovery + Smart Location Search + AI Matching + Business Location Intelligence",
// 		tiers: [
// 			{ price: 699, duration: "30 Days", discount: "Base Tier" },
// 			{ price: 1499, duration: "60 Days", discount: "Save 6%" },
// 			{ price: 2199, duration: "90 Days", discount: "Save 10%" },
// 		],
// 		features: [
// 			"Commercial property discovery",
// 			"Smart location-based search",
// 			"AI matching for business needs",
// 			"Business location intelligence",
// 			"Limited property contact unlocks",
// 		],
// 		perks: ["Footfall Data Insights", "Zoning Compliance Check", "B2B Lease Templates"],
// 	},
// 	{
// 		id: "comm-buyer",
// 		name: "Commercial Property Buyer",
// 		tag: "Commercial Property Buyers",
// 		category: "Commercial",
// 		usp: "Commercial Investment Discovery + AI Matching + Smart Maps + Property Intelligence + Virtual Experience",
// 		tiers: [
// 			{ price: 999, duration: "30 Days", discount: "Base Tier" },
// 			{ price: 1799, duration: "60 Days", discount: "Save 10%" },
// 			{ price: 2599, duration: "90 Days", discount: "Save 13%" },
// 		],
// 		features: [
// 			"Commercial investment discovery",
// 			"AI-powered investment matching",
// 			"Smart maps & property intelligence",
// 			"Immersive virtual experience",
// 			"Limited property contact unlocks",
// 		],
// 		perks: ["ROI Yield Calculator", "Commercial Market Trends", "Direct Developer Connect"],
// 	},
// 	{
// 		id: "builder-active",
// 		name: "Builder Active",
// 		tag: "Builders / Developers",
// 		category: "Developers",
// 		usp: "Project Visibility + Lead Generation + AI Lead Qualification + Inventory Management + Analytics",
// 		tiers: [
// 			{ price: 5999, duration: "30 Days", discount: "Base Tier" },
// 			{ price: 10999, duration: "60 Days", discount: "Save 8%" },
// 			{ price: 17999, duration: "90 Days", discount: "Save 10%" },
// 		],
// 		features: [
// 			"Project visibility & lead generation",
// 			"AI lead qualification & project matching",
// 			"Inventory management tools",
// 			"Virtual project tours & analytics",
// 			"1 project listing included",
// 		],
// 		perks: ["CRM Integration API", "Dedicated Relationship Manager", "Custom Branding"],
// 	},
// 	{
// 		id: "pg-owner",
// 		name: "PG Owner",
// 		tag: "PG Owners",
// 		category: "Owners",
// 		usp: "PG / Bed Visibility + Vacancy Promotion + AI Tenant Matching + Lead Generation + Virtual PG Tours",
// 		tiers: [
// 			{ price: 499, duration: "30 Days", discount: "Base Tier" },
// 			{ price: 899, duration: "60 Days", discount: "Save 10%" },
// 			{ price: 1299, duration: "90 Days", discount: "Save 13%" },
// 		],
// 		features: [
// 			"PG / bed visibility & vacancy promotion",
// 			"AI tenant matching",
// 			"Lead generation from seekers",
// 			"Virtual PG tours",
// 			"Availability management + AI recommendations",
// 		],
// 		perks: ["Quick Occupancy Booster", "Tenant Background Verification", "Automated Rent Reminders"],
// 	},
// ];

// const PROPERTY_MANAGEMENT = {
// 	name: "Property Management Service",
// 	tag: "Full Hands-off Management",
// 	usp: "End-to-end management, tenant coordination, maintenance tracking, and hassle-free rent collection.",
// 	price: "10–12%",
// 	duration: "of Monthly Rent Collected",
// 	features: [
// 		"End-to-end property management & tenant onboarding",
// 		"24/7 emergency repair & maintenance tracking",
// 		"Automated rent collection & occupancy optimization",
// 		"Quarterly physical property inspection reports",
// 		"Legal rental agreements & dispute assistance",
// 	],
// };

// const BENEFITS = [
// 	{
// 		icon: Search,
// 		title: "Smarter AI Discovery",
// 		desc: "Machine learning algorithms match requirements with zero spam and precision criteria filters.",
// 	},
// 	{
// 		icon: Zap,
// 		title: "Direct Connections",
// 		desc: "Bypass middlemen. Directly connect with genuine property owners, tenants, and buyers.",
// 	},
// 	{
// 		icon: Layers,
// 		title: "Flexible Validity",
// 		desc: "Choose between 30, 60, or 90 days validity options with instant multi-month savings.",
// 	},
// ];

// const CATEGORIES = ["Seekers", "Students", "Owners", "Commercial", "Developers"];

// export default function Pricing() {
// 	const [selectedCategory, setSelectedCategory] = useState("Seekers");
// 	const [expandedPlanId, setExpandedPlanId] = useState(null);
// 	const [tierSelections, setTierSelections] = useState({});
// 	const [checkoutData, setCheckoutData] = useState(null);
// 	const [paymentSuccess, setPaymentSuccess] = useState(false);
// 	const [formData, setFormData] = useState({
// 		cardName: "Vijay Kumar",
// 		cardNumber: "4532 •••• •••• 8892",
// 		expiry: "08/28",
// 		cvv: "889",
// 	});
// 	const [currentSlide, setCurrentSlide] = useState(0);
// 	const [isMobile, setIsMobile] = useState(false);

// 	const sliderRef = useRef(null);

// 	// Scroll to top when arriving from "Unlock Contact" and open Students tab
// 	useEffect(() => {
// 		window.scrollTo({ top: 0, behavior: "smooth" });
// 	}, []);

// 	// Detect mobile
// 	useEffect(() => {
// 		const check = () => setIsMobile(window.innerWidth < 768);
// 		check();
// 		window.addEventListener("resize", check);
// 		return () => window.removeEventListener("resize", check);
// 	}, []);

// 	// Reset slide when category changes
// 	useEffect(() => {
// 		setCurrentSlide(0);
// 		setExpandedPlanId(null);
// 		if (sliderRef.current) {
// 			sliderRef.current.scrollTo({ left: 0, behavior: "smooth" });
// 		}
// 	}, [selectedCategory]);

// 	const handleTierChange = (planId, tierIndex) => {
// 		setTierSelections((prev) => ({ ...prev, [planId]: tierIndex }));
// 	};

// 	const openCheckout = (plan, tierIndex) => {
// 		setCheckoutData({ plan, tierIndex });
// 	};

// 	const handlePaymentSubmit = (e) => {
// 		e.preventDefault();
// 		setPaymentSuccess(true);
// 	};

// 	const closeCheckout = () => {
// 		setCheckoutData(null);
// 		setPaymentSuccess(false);
// 	};

// 	const filteredPlans =
// 		selectedCategory === "All"
// 			? PLANS
// 			: PLANS.filter((p) => p.category === selectedCategory);

// 	const scrollToSlide = (index) => {
// 		if (!sliderRef.current) return;
// 		const card = sliderRef.current.children[index];
// 		if (card) {
// 			card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
// 			setCurrentSlide(index);
// 			setExpandedPlanId(null);
// 		}
// 	};

// 	const goPrev = () => {
// 		const next = Math.max(0, currentSlide - 1);
// 		scrollToSlide(next);
// 	};

// 	const goNext = () => {
// 		const next = Math.min(filteredPlans.length - 1, currentSlide + 1);
// 		scrollToSlide(next);
// 	};

// 	// Sync currentSlide on manual swipe
// 	const handleScroll = () => {
// 		if (!sliderRef.current || !isMobile) return;
// 		const container = sliderRef.current;
// 		const scrollLeft = container.scrollLeft;
// 		const cardWidth = container.offsetWidth;
// 		const index = Math.round(scrollLeft / cardWidth);
// 		if (index !== currentSlide) {
// 			setCurrentSlide(index);
// 			setExpandedPlanId(null);
// 		}
// 	};

// 	const toggleExpand = (planId) => {
// 		setExpandedPlanId((prev) => (prev === planId ? null : planId));
// 	};

// 	const isStudentPlan = (plan) => plan.category === "Students";

// 	return (
// 		<div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#7A1F2B] selection:text-white flex flex-col">
// 			{/* ─── SMALL HERO ─── */}
// 			<section className="pt-4 pb-8 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
// 				<div className="max-w-3xl mx-auto px-4 text-center">
// 					<div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7A1F2B]/10 text-[#7A1F2B] text-[10px] font-bold uppercase tracking-wider mb-3 border border-[#7A1F2B]/20">
// 						<Sparkles className="w-3 h-3" />
// 						Zero Brokerage • Direct AI Matching
// 					</div>
// 					<h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight mb-2">
// 						Find your place.{" "}
// 						<span className="text-[#7A1F2B]">Choose your plan.</span>
// 					</h1>
// 					<p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mb-5">
// 						Simple plans for Owners, Seekers, Students, Builders & PG Hosts.
// 					</p>
// 					<div className="flex flex-wrap justify-center gap-1.5">
// 						{CATEGORIES.map((cat) => (
// 							<button
// 								key={cat}
// 								onClick={() => setSelectedCategory(cat)}
// 								className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
// 									selectedCategory === cat
// 										? "bg-[#7A1F2B] text-white shadow-sm"
// 										: "bg-white text-slate-600 border border-slate-200 hover:border-[#7A1F2B]/50 hover:text-[#7A1F2B]"
// 								}`}
// 							>
// 								{cat}
// 							</button>
// 						))}
// 					</div>
// 				</div>
// 			</section>

// 			{/* ─── PLANS ─── */}
// 			<section id="plans" className="max-w-6xl mx-auto px-0 sm:px-6 py-6 flex-grow w-full">
// 				{/* Mobile arrows + counter */}
// 				{isMobile && filteredPlans.length > 1 && (
// 					<div className="flex items-center justify-between px-4 mb-3">
// 						<button
// 							onClick={goPrev}
// 							disabled={currentSlide === 0}
// 							className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
// 								currentSlide === 0
// 									? "border-slate-200 text-slate-300"
// 									: "border-[#7A1F2B]/40 text-[#7A1F2B] bg-white shadow-sm active:scale-95"
// 							}`}
// 						>
// 							<ChevronLeft className="w-5 h-5" />
// 						</button>

// 						<span className="text-xs font-bold text-slate-500">
// 							{currentSlide + 1} / {filteredPlans.length}
// 						</span>

// 						<button
// 							onClick={goNext}
// 							disabled={currentSlide === filteredPlans.length - 1}
// 							className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
// 								currentSlide === filteredPlans.length - 1
// 									? "border-slate-200 text-slate-300"
// 									: "border-[#7A1F2B]/40 text-[#7A1F2B] bg-white shadow-sm active:scale-95"
// 							}`}
// 						>
// 							<ChevronRight className="w-5 h-5" />
// 						</button>
// 					</div>
// 				)}

// 				{/* Slider / Grid container */}
// 				<div
// 					ref={sliderRef}
// 					onScroll={handleScroll}
// 					className={`
// 						${isMobile
// 							? "flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-0 pb-40 hide-scrollbar"
// 							: `grid grid-cols-1 md:grid-cols-2 gap-5 pb-48 ${selectedCategory === "Students" ? "xl:grid-cols-4" : "lg:grid-cols-3"}`
// 						}
// 					`}
// 					style={isMobile ? { scrollbarWidth: "none", msOverflowStyle: "none" } : {}}
// 				>
// 					{filteredPlans.map((plan) => {
// 						const isExpanded = expandedPlanId === plan.id;
// 						const selectedTierIdx = tierSelections[plan.id] || 0;
// 						const currentTier = plan.tiers[selectedTierIdx];
// 						const student = isStudentPlan(plan);

// 						return (
// 							<div
// 								key={plan.id}
// 								onMouseEnter={() => !isMobile && setExpandedPlanId(plan.id)}
// 								onMouseLeave={() => !isMobile && setExpandedPlanId(null)}
// 								className={`
// 									relative bg-white rounded-2xl flex flex-col border transition-all duration-300
// 									${isMobile
// 										? "min-w-[100%] w-full snap-center px-3"
// 										: "hover:border-[#7A1F2B] hover:shadow-xl hover:-translate-y-0.5"
// 									}
// 									${plan.popular
// 										? "border-[#7A1F2B] ring-2 ring-[#7A1F2B]/25 shadow-lg z-10"
// 										: "border-slate-200 shadow-sm"
// 									}
// 									${isExpanded ? "z-30" : "z-0"}
// 									${student && !isMobile ? "scale-[0.92] origin-top" : ""}
// 								`}
// 							>
// 								{/* Inner card */}
// 								<div className={`${isMobile ? "bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" : ""}`}>
// 									{/* Popular badge */}
// 									{plan.popular && (
// 										<div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#7A1F2B] text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1 shadow-md z-10">
// 											<Crown className="w-3 h-3 text-amber-300" /> Most Popular
// 										</div>
// 									)}

// 									{/* Card body – tighter for student plans (~30% more compact) */}
// 									<div className={student ? "p-3.5" : "p-5"}>
// 										<div className="flex justify-between items-start gap-2 mb-1.5">
// 											<span className={`font-extrabold uppercase tracking-wider text-[#7A1F2B] bg-[#7A1F2B]/5 px-2 py-0.5 rounded ${student ? "text-[9px]" : "text-[10px]"}`}>
// 												{plan.tag}
// 											</span>
// 											{currentTier.label ? (
// 												<span className={`font-bold text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded ${student ? "text-[9px]" : "text-[10px]"}`}>
// 													{currentTier.label}
// 												</span>
// 											) : (
// 												currentTier.discount !== "Base Tier" && (
// 													<span className={`font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded ${student ? "text-[9px]" : "text-[10px]"}`}>
// 														{currentTier.discount}
// 													</span>
// 												)
// 											)}
// 										</div>

// 										<h3 className={`font-black text-slate-900 ${student ? "text-base" : "text-lg"}`}>
// 											{plan.name}
// 										</h3>
// 										<p className={`text-slate-500 mt-1 line-clamp-2 ${student ? "text-[11px] min-h-[28px]" : "text-xs min-h-[32px]"}`}>
// 											{plan.usp}
// 										</p>

// 										{/* Duration toggle (single-tier plans show a validity chip instead) */}
// 										{plan.tiers.length > 1 ? (
// 											<div className={`mt-3 p-1 bg-slate-100 rounded-xl flex gap-1 ${student ? "mt-2.5" : "mt-4"}`}>
// 												{plan.tiers.map((t, idx) => (
// 													<button
// 														key={t.duration}
// 														type="button"
// 														onClick={() => handleTierChange(plan.id, idx)}
// 														className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
// 															selectedTierIdx === idx
// 																? "bg-[#7A1F2B] text-white"
// 																: "text-slate-600 hover:bg-slate-200/70"
// 														}`}
// 													>
// 														{t.duration}
// 													</button>
// 												))}
// 											</div>
// 										) : (
// 											<div className={`py-1.5 bg-slate-100 rounded-xl flex items-center justify-center gap-1.5 font-bold text-slate-700 ${student ? "mt-2.5 text-[11px]" : "mt-4 text-xs py-2"}`}>
// 												<Clock className={`text-[#7A1F2B] ${student ? "w-3 h-3" : "w-3.5 h-3.5"}`} />
// 												Valid for {currentTier.duration}
// 											</div>
// 										)}

// 										<div className={`flex items-baseline gap-1 ${student ? "mt-3" : "mt-4"}`}>
// 											<span className={`font-black text-slate-900 ${student ? "text-xl" : "text-2xl"}`}>
// 												₹{currentTier.price.toLocaleString("en-IN")}
// 											</span>
// 											<span className={`font-medium text-slate-500 ${student ? "text-[11px]" : "text-xs"}`}>
// 												/ {currentTier.duration}
// 											</span>
// 										</div>
// 										<p className={`text-slate-400 mt-0.5 ${student ? "text-[9px]" : "text-[10px]"}`}>
// 											+ GST • No hidden charges
// 										</p>

// 										{/* Student-only details: unlock limit + note */}
// 										{currentTier.unlocks && (
// 											<p className={`mt-2 inline-flex items-center gap-1.5 font-bold text-[#7A1F2B] bg-[#7A1F2B]/5 border border-[#7A1F2B]/15 px-2 py-0.5 rounded-md ${student ? "text-[10px]" : "text-[11px]"}`}>
// 												<Unlock className={student ? "w-2.5 h-2.5" : "w-3 h-3"} />
// 												Up to {currentTier.unlocks} contact unlocks
// 											</p>
// 										)}
// 										{currentTier.unlocks && (
// 											<p className={`text-slate-500 mt-0.5 ${student ? "text-[9px]" : "text-[10px]"}`}>
// 												≈ ₹{(currentTier.price / currentTier.unlocks).toFixed(0)} per contact
// 											</p>
// 										)}
// 										{plan.note && (
// 											<p className={`text-slate-500 mt-1 leading-snug ${student ? "text-[9px]" : "text-[10px]"}`}>
// 												{plan.note}
// 											</p>
// 										)}

// 										<div className={`flex gap-2 ${student ? "mt-3.5" : "mt-5"}`}>
// 											<button
// 												onClick={() => openCheckout(plan, selectedTierIdx)}
// 												className={`flex-1 bg-[#7A1F2B] hover:bg-[#601822] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 ${
// 													student ? "text-[11px] py-2" : "text-xs py-2.5"
// 												}`}
// 											>
// 												<CreditCard className={student ? "w-3 h-3" : "w-3.5 h-3.5"} />
// 												Select & Pay
// 											</button>

// 											{/* Arrow / expand button */}
// 											<button
// 												type="button"
// 												onClick={() => toggleExpand(plan.id)}
// 												className={`rounded-xl border font-bold flex items-center justify-center transition-colors ${
// 													isExpanded
// 														? "bg-slate-900 text-white border-slate-900"
// 														: "bg-slate-50 border-slate-200 text-slate-600"
// 												} ${student ? "px-2.5 py-2 text-[11px]" : "px-3 py-2.5 text-xs"}`}
// 											>
// 												{isExpanded ? (
// 													<ChevronUp className={student ? "w-3.5 h-3.5" : "w-4 h-4"} />
// 												) : (
// 													<ChevronDown className={student ? "w-3.5 h-3.5" : "w-4 h-4"} />
// 												)}
// 											</button>
// 										</div>
// 									</div>

// 									{/* ── FLOATING DROPDOWN ── */}
// 									<div
// 										className={`absolute left-3 right-3 sm:left-0 sm:right-0 top-full mt-1 z-40
// 											bg-white rounded-2xl border border-[#7A1F2B]/30 shadow-2xl
// 											overflow-hidden transition-all duration-300 ease-out origin-top
// 											${isExpanded
// 												? "opacity-100 scale-y-100 translate-y-0 pointer-events-auto"
// 												: "opacity-0 scale-y-95 -translate-y-1 pointer-events-none"
// 											}`}
// 									>
// 										<div className={`space-y-3 max-h-[340px] overflow-y-auto ${student ? "p-4" : "p-5 space-y-4"}`}>
// 											<div>
// 												<h4 className={`font-extrabold uppercase tracking-wider text-slate-800 mb-1.5 flex items-center gap-1 ${student ? "text-[10px]" : "text-xs"}`}>
// 													<Check className={student ? "w-3 h-3 text-[#7A1F2B]" : "w-3.5 h-3.5 text-[#7A1F2B]"} /> Features
// 												</h4>
// 												<ul className="space-y-1.5">
// 													{plan.features.map((feat, i) => (
// 														<li key={i} className={`text-slate-600 flex items-start gap-2 ${student ? "text-[11px]" : "text-xs"}`}>
// 															<span className="w-1.5 h-1.5 rounded-full bg-[#7A1F2B] mt-1.5 flex-shrink-0" />
// 															{feat}
// 														</li>
// 													))}
// 												</ul>
// 											</div>

// 											{plan.perks && (
// 												<div className="pt-2.5 border-t border-slate-100">
// 													<h4 className={`font-extrabold uppercase tracking-wider text-[#7A1F2B] mb-1.5 flex items-center gap-1 ${student ? "text-[10px]" : "text-xs"}`}>
// 														<Sparkles className={student ? "w-3 h-3" : "w-3.5 h-3.5"} /> Perks
// 													</h4>
// 													<div className="flex flex-wrap gap-1.5">
// 														{plan.perks.map((perk, idx) => (
// 															<span
// 																key={idx}
// 																className={`font-bold bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md ${student ? "text-[9px]" : "text-[10px]"}`}
// 															>
// 																{perk}
// 															</span>
// 														))}
// 													</div>
// 												</div>
// 											)}

// 											<button
// 												onClick={() => openCheckout(plan, selectedTierIdx)}
// 												className={`w-full bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors ${
// 													student ? "text-[11px] py-2" : "text-xs py-2.5"
// 												}`}
// 											>
// 												Proceed with {currentTier.duration}
// 											</button>
// 										</div>
// 									</div>
// 								</div>
// 							</div>
// 						);
// 					})}
// 				</div>

// 				{/* Mobile dots */}
// 				{isMobile && filteredPlans.length > 1 && (
// 					<div className="flex justify-center gap-1.5 mt-2">
// 						{filteredPlans.map((_, idx) => (
// 							<button
// 								key={idx}
// 								onClick={() => scrollToSlide(idx)}
// 								className={`h-1.5 rounded-full transition-all ${
// 									idx === currentSlide
// 										? "w-5 bg-[#7A1F2B]"
// 										: "w-1.5 bg-slate-300"
// 								}`}
// 							/>
// 						))}
// 					</div>
// 				)}

// 				{filteredPlans.length === 0 && (
// 					<p className="text-center text-slate-500 py-12 text-sm">No plans in this category.</p>
// 				)}
// 			</section>

// 			{/* Property Management */}
// 			<section id="property-management" className="max-w-6xl mx-auto px-2 sm:px-6 py-2">
// 				<div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 relative overflow-hidden">
// 					<div className="absolute top-0 right-0 w-64 h-64 bg-[#7A1F2B]/25 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" />
// 					<div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
// 						<div className="lg:col-span-7 space-y-2.5">
// 							<span className="inline-block bg-[#7A1F2B] text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded">
// 								{PROPERTY_MANAGEMENT.tag}
// 							</span>
// 							<h3 className="text-lg sm:text-xl font-black">{PROPERTY_MANAGEMENT.name}</h3>
// 							<p className="text-slate-300 text-sm max-w-lg">{PROPERTY_MANAGEMENT.usp}</p>
// 							<div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
// 								{PROPERTY_MANAGEMENT.features.map((feat, idx) => (
// 									<div key={idx} className="flex items-center gap-2 text-xs text-slate-200">
// 										<div className="w-4 h-4 rounded-full bg-[#7A1F2B] flex items-center justify-center flex-shrink-0">
// 											<Check className="w-2.5 h-2.5 text-white" />
// 										</div>
// 										{feat}
// 									</div>
// 								))}
// 							</div>
// 						</div>
// 						<div className="lg:col-span-5 bg-white/10 backdrop-blur-sm p-5 rounded-xl border border-white/10 text-center">
// 							<span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
// 								Commission
// 							</span>
// 							<div className="text-3xl font-black mt-1">{PROPERTY_MANAGEMENT.price}</div>
// 							<p className="text-xs text-slate-300 mt-1">{PROPERTY_MANAGEMENT.duration}</p>
// 							<button
// 								onClick={() =>
// 									alert("Thank you! A Zerobriks Property Manager will contact you within 2 hours.")
// 								}
// 								className="mt-4 w-full bg-[#7A1F2B] hover:bg-[#601822] text-white font-bold text-xs py-2.5 rounded-xl transition-colors"
// 							>
// 								Inquire Now
// 							</button>
// 						</div>
// 					</div>
// 				</div>
// 			</section>

// 			{/* Benefits */}
// 			<section id="benefits" className="bg-slate-50 border-t border-slate-200 py-10 mt-4">
// 				<div className="max-w-6xl mx-auto px-4 sm:px-6">
// 					<div className="text-center max-w-xl mx-auto mb-7">
// 						<h2 className="text-lg sm:text-xl font-black text-slate-900">
// 							A smarter way to find property
// 						</h2>
// 						<p className="text-slate-600 text-xs mt-1">AI matching + verified direct connections.</p>
// 					</div>
// 					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// 						{BENEFITS.map((item, idx) => {
// 							const Icon = item.icon;
// 							return (
// 								<div
// 									key={idx}
// 									className="bg-white p-4 rounded-xl border border-slate-200 hover:border-[#7A1F2B]/40 transition-all"
// 								>
// 									<div className="w-9 h-9 rounded-lg bg-[#7A1F2B]/10 text-[#7A1F2B] flex items-center justify-center mb-2.5">
// 										<Icon className="w-4.5 h-4.5" />
// 									</div>
// 									<h3 className="text-sm font-extrabold text-slate-900 mb-1">{item.title}</h3>
// 									<p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
// 								</div>
// 							);
// 						})}
// 					</div>
// 					<div className="mt-7 bg-white border border-[#7A1F2B]/20 rounded-xl p-3.5 text-center max-w-2xl mx-auto">
// 						<p className="text-xs text-slate-700">
// 							⭐ <strong className="text-slate-900">Longer plans = better savings.</strong> Instant
// 							discounts on 60 & 90 day plans.
// 						</p>
// 					</div>
// 				</div>
// 			</section>

// 			{/* FAQ */}
// 			<section id="faq" className="max-w-3xl mx-auto px-4 py-10">
// 				<h2 className="text-lg font-black text-center text-slate-900 mb-5">FAQs</h2>
// 				<div className="space-y-2.5">
// 					<div className="p-3.5 rounded-xl border border-slate-200 bg-white">
// 						<h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
// 							<HelpCircle className="w-4 h-4 text-[#7A1F2B]" /> What happens when my plan expires?
// 						</h4>
// 						<p className="text-xs text-slate-600 mt-1 pl-6">
// 							Your data stays saved. Renew anytime to reactivate unlocks and AI features.
// 						</p>
// 					</div>
// 					<div className="p-3.5 rounded-xl border border-slate-200 bg-white">
// 						<h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
// 							<HelpCircle className="w-4 h-4 text-[#7A1F2B]" /> Any hidden brokerage fees?
// 						</h4>
// 						<p className="text-xs text-slate-600 mt-1 pl-6">
// 							No. Zerobriks is subscription-only. We never take brokerage from standard plan users.
// 						</p>
// 					</div>
// 					<div className="p-3.5 rounded-xl border border-slate-200 bg-white">
// 						<h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
// 							<HelpCircle className="w-4 h-4 text-[#7A1F2B]" /> What happens when my Student Access ends?
// 						</h4>
// 						<p className="text-xs text-slate-600 mt-1 pl-6">
// 							Paid contact unlocks stop and unused unlocks don’t carry forward. You can keep browsing for
// 							free and buy another plan anytime.
// 						</p>
// 					</div>
// 				</div>
// 			</section>

// 			{/* Checkout Modal */}
// 			{checkoutData && (
// 				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
// 					<div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
// 						<div className="bg-slate-900 text-white p-5 flex justify-between items-center">
// 							<div>
// 								<span className="text-[10px] font-black uppercase tracking-wider text-[#7A1F2B] bg-white px-2 py-0.5 rounded">
// 									Secure Checkout
// 								</span>
// 								<h3 className="text-base font-black mt-1">{checkoutData.plan.name}</h3>
// 							</div>
// 							<button
// 								onClick={closeCheckout}
// 								className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
// 							>
// 								<X className="w-4 h-4" />
// 							</button>
// 						</div>
// 						{paymentSuccess ? (
// 							<div className="p-6 text-center space-y-3">
// 								<div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
// 									<Check className="w-7 h-7" />
// 								</div>
// 								<h4 className="text-lg font-black text-slate-900">Payment Successful!</h4>
// 								<p className="text-xs text-slate-600">
// 									You subscribed to <strong>{checkoutData.plan.name}</strong> (
// 									{checkoutData.plan.tiers[checkoutData.tierIndex].duration}).
// 								</p>
// 								<div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-left space-y-1">
// 									<div className="flex justify-between">
// 										<span className="text-slate-500">Transaction ID</span>
// 										<span className="font-mono font-bold">ZB-8849201</span>
// 									</div>
// 									{checkoutData.plan.tiers[checkoutData.tierIndex].unlocks && (
// 										<div className="flex justify-between">
// 											<span className="text-slate-500">Contact Unlocks</span>
// 											<span className="font-bold">
// 												{checkoutData.plan.tiers[checkoutData.tierIndex].unlocks}
// 											</span>
// 										</div>
// 									)}
// 									<div className="flex justify-between">
// 										<span className="text-slate-500">Total Paid</span>
// 										<span className="font-bold text-[#7A1F2B]">
// 											₹{(checkoutData.plan.tiers[checkoutData.tierIndex].price * 1.18).toFixed(0)}
// 										</span>
// 									</div>
// 								</div>
// 								<button
// 									onClick={closeCheckout}
// 									className="w-full bg-[#7A1F2B] hover:bg-[#601822] text-white text-xs font-bold py-2.5 rounded-xl"
// 								>
// 									Go to Dashboard
// 								</button>
// 							</div>
// 						) : (
// 							<form onSubmit={handlePaymentSubmit} className="p-5 space-y-3">
// 								<div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
// 									<div>
// 										<p className="font-extrabold text-slate-900">
// 											{checkoutData.plan.tiers[checkoutData.tierIndex].label || checkoutData.plan.tag}
// 										</p>
// 										<p className="text-slate-500">
// 											{checkoutData.plan.tiers[checkoutData.tierIndex].duration}
// 											{checkoutData.plan.tiers[checkoutData.tierIndex].unlocks &&
// 												` • Up to ${checkoutData.plan.tiers[checkoutData.tierIndex].unlocks} unlocks`}
// 										</p>
// 									</div>
// 									<div className="text-right">
// 										<p className="text-base font-black text-[#7A1F2B]">
// 											₹{checkoutData.plan.tiers[checkoutData.tierIndex].price.toLocaleString("en-IN")}
// 										</p>
// 										<p className="text-[10px] text-slate-400">
// 											+ 18% GST (₹
// 											{(checkoutData.plan.tiers[checkoutData.tierIndex].price * 0.18).toFixed(0)})
// 										</p>
// 									</div>
// 								</div>
// 								<div className="space-y-2.5">
// 									<div>
// 										<label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
// 											Cardholder Name
// 										</label>
// 										<input
// 											type="text"
// 											required
// 											value={formData.cardName}
// 											onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
// 											className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#7A1F2B] focus:border-[#7A1F2B] outline-none"
// 										/>
// 									</div>
// 									<div>
// 										<label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
// 											Card Number
// 										</label>
// 										<div className="relative">
// 											<input
// 												type="text"
// 												required
// 												value={formData.cardNumber}
// 												onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
// 												className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#7A1F2B] focus:border-[#7A1F2B] outline-none font-mono"
// 											/>
// 											<CreditCard className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
// 										</div>
// 									</div>
// 									<div className="grid grid-cols-2 gap-2.5">
// 										<div>
// 											<label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
// 												Expiry
// 											</label>
// 											<input
// 												type="text"
// 												required
// 												placeholder="MM/YY"
// 												value={formData.expiry}
// 												onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
// 												className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#7A1F2B] focus:border-[#7A1F2B] outline-none"
// 											/>
// 										</div>
// 										<div>
// 											<label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
// 												CVV
// 											</label>
// 											<input
// 												type="password"
// 												required
// 												maxLength={4}
// 												value={formData.cvv}
// 												onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
// 												className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#7A1F2B] focus:border-[#7A1F2B] outline-none"
// 											/>
// 										</div>
// 									</div>
// 								</div>
// 								<div className="flex items-center gap-2 text-[10px] text-slate-500 pt-1">
// 									<ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
// 									256-Bit SSL • Cancel anytime
// 								</div>
// 								<button
// 									type="submit"
// 									className="w-full bg-[#7A1F2B] hover:bg-[#601822] text-white font-black text-xs py-3 rounded-xl shadow transition-colors"
// 								>
// 									Pay ₹{(checkoutData.plan.tiers[checkoutData.tierIndex].price * 1.18).toFixed(0)} &
// 									Activate
// 								</button>
// 							</form>
// 						)}
// 					</div>
// 				</div>
// 			)}

// 			{/* Hide scrollbar utility */}
// 			<style>{`
// 				.hide-scrollbar::-webkit-scrollbar { display: none; }
// 			`}</style>
// 		</div>
// 	);
// }

import React from "react";
import { Sparkles, Check, Search, Zap, Layers } from "lucide-react";

const FEATURES = [
  { icon: Search, text: "AI property matching with zero spam" },
  { icon: Zap, text: "Direct connections with owners, tenants and buyers" },
  { icon: Layers, text: "Flexible 30, 60 and 90 day plans" },
];

export default function ComingSoon() {
  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-white text-slate-900 font-sans flex flex-col selection:bg-[#7A1F2B] selection:text-white">
      {/* Header */}
      

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 sm:px-10 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        {/* Left: headline + notice card */}
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7A1F2B]/10 text-[#7A1F2B] text-[10px] font-bold uppercase tracking-wider border border-[#7A1F2B]/20 sm:hidden mb-4">
            <Sparkles className="w-3 h-3" />
            Coming soon
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]">
            Find your place.
            <br />
            <span className="text-[#7A1F2B]">Choose your plan.</span>
          </h1>

          <p className="mt-5 text-sm sm:text-base text-slate-600 max-w-md leading-relaxed">
            Homes, PGs, offices and investments, matched to what you need. Simple plans for owners, seekers, students, builders and PG hosts. Launching soon.
          </p>

          <div className="mt-8 max-w-md flex items-start gap-4 rounded-2xl bg-[#faf6f6] border border-slate-200 p-6">
            <span className="mt-0.5 w-8 h-8 rounded-full bg-[#7A1F2B] flex items-center justify-center flex-shrink-0">
              <Check className="w-4 h-4 text-white" strokeWidth={3} />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900">Something good is coming.</p>
              <p className="text-sm text-slate-600 mt-0.5">We're putting the final touches on Zerobriks. Check back soon.</p>
            </div>
          </div>
        </div>

        {/* Right: dark feature card, matching the pricing page's property block */}
        <div className="relative bg-slate-900 text-white rounded-2xl p-7 sm:p-9 overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#7A1F2B]/30 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" />
          <div className="relative">
            <span className="inline-block bg-[#7A1F2B] text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded">
              Coming Soon
            </span>
            <h2 className="mt-4 text-2xl sm:text-3xl font-black">What's on the way</h2>
            <p className="mt-2 text-sm text-slate-300">
              A smarter way to find property, with no brokers in the middle.
            </p>

            <ul className="mt-7 space-y-4">
              {FEATURES.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg bg-[#D4A24C]/15 border border-[#D4A24C]/40 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-[#D4A24C]" />
                  </span>
                  <span className="text-sm font-semibold text-slate-100">{text}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span className="text-[#D4A24C] font-semibold">Longer plans = better savings</span>
              <span>&copy; {new Date().getFullYear()} Zerobriks</span>
            </div>
          </div>
        </div>
      </main>

      <div className="h-1" />
    </div>
  );
}