import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Link, useHistory, useParams } from "react-router-dom";
import Slider from "react-slick";
import { toast } from "react-toastify";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../styles/RecommendedProperties.css";
import {
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiExternalLink,
  FiHeart,
  FiMapPin,
  FiMessageCircle,
  FiPhone,
  FiShare2,
  FiX,
} from "react-icons/fi";
import {
  FaArrowUp,
  FaBath,
  FaBed,
  FaBuilding,
  FaCalendarAlt,
  FaCalendarCheck,
  FaCalendarPlus,
  FaCamera,
  FaCar,
  FaChevronDown,
  FaClipboardList,
  FaCompass,
  FaCouch,
  FaDoorOpen,
  FaExpand,
  FaHourglassHalf,
  FaImages,
  FaInfoCircle,
  FaLayerGroup,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaPaperPlane,
  FaPlug,
  FaRulerCombined,
  FaShower,
  FaTint,
  FaUserFriends,
} from "react-icons/fa";
import {
  PiCubeFocus,
} from "react-icons/pi";
import Login1 from "../auth/Login1";
import SignUp1 from "../auth/SignUp1";
import GetScheduleVTourproperty from "../containers/GetScheduleVTourproperty";
import ShareModal from "../containers/ShareModal";
import ContactDetails from "../containers/ContactDetails";

/* ------------------------------------------------------------------ */
/* Constants & helpers (outside component so they never re-create)    */
/* ------------------------------------------------------------------ */

const API_BASE = process.env.REACT_APP_API_URL;
const DEFAULT_IMAGE = "/image/appstore.png";
const api = (path) => `${API_BASE}/cust_api/${path}`;

const UNIT_TO_SQFT = {
  "sq ft": 1,
  sqft: 1,
  "square feet": 1,
  "sq yd": 9,
  sqyd: 9,
  "square yards": 9,
  "sq mt": 10.7639,
  sqmt: 10.7639,
  "square meters": 10.7639,
  acre: 43560,
  acres: 43560,
};

const formatArea = (area, unit) => {
  if (!area || !unit) return null;
  const num = parseFloat(area);
  if (isNaN(num)) return null;
  const sqft = num * (UNIT_TO_SQFT[unit.toLowerCase()] ?? 1);
  return `${Math.round(sqft).toLocaleString("en-IN")} Sq.Ft.`;
};

const formatINR = (value) =>
  value ? `₹ ${Number(value).toLocaleString("en-IN")}` : null;

const toSqft = (area, unit) => {
  if (!area || !unit) return null;
  const num = parseFloat(area);
  if (isNaN(num)) return null;
  return num * (UNIT_TO_SQFT[unit.toLowerCase()] ?? 1);
};

const trimZeros = (x) => parseFloat(x.toFixed(2)).toString();

const formatPriceLabel = (value) => {
  if (!value) return null;
  const n = Number(value);
  if (n >= 10000000) return `₹ ${trimZeros(n / 10000000)} Cr`;
  if (n >= 100000) return `₹ ${trimZeros(n / 100000)} L`;
  return formatINR(n);
};

const formatPriceShort = (price) => {
  if (!price) return "";
  if (price >= 10000000) return `${parseFloat((price / 10000000).toFixed(1))} Cr`;
  if (price >= 100000) return `${parseFloat((price / 100000).toFixed(1))} L`;
  if (price >= 1000) return `${parseFloat((price / 1000).toFixed(1))} K`;
  return price;
};

const resolveImage = (src) => {
  if (typeof src !== "string" || !src.trim()) return null;
  return src.startsWith("http") ? src : `${API_BASE}${src}`;
};

// Public profile of another user, matched by id in the router: /agentdetail/:id
const OWNER_PROFILE_PATH = "/agentdetail";

// Owner profile card: photo if available, otherwise initials.
// The avatar links to the owner's profile when ownerId is known.
const OwnerProfileCard = ({ owner, ownerId }) => {
  const name = (owner?.full_name || "").trim();
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "O";
  const imageUrl = resolveImage(
    owner?.profile_image || owner?.image || owner?.user_image || owner?.profile_pic,
  );

  const avatar = (
    <div className="relative flex items-center justify-center flex-shrink-0 overflow-hidden text-sm font-bold text-white bg-[#800020] rounded-full w-14 h-14">
      <span>{initials}</span>
      {imageUrl && (
        <img
          src={imageUrl}
          alt={name || "Owner"}
          className="absolute inset-0 object-cover w-full h-full rounded-full"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      )}
    </div>
  );

  return (
    <section className="p-4 bg-white border shadow-sm rounded-xl border-slate-200">
      <div className="pb-1.5 mb-3 border-b border-slate-100">
        <h2 className="inline-block pb-1 text-sm font-bold text-slate-900 border-b-2 border-[#800020]">
          Property Owner
        </h2>
      </div>
      <div className="flex items-center gap-3">
        {ownerId ? (
          <Link
            to={`${OWNER_PROFILE_PATH}/${ownerId}`}
            onClick={() => window.scrollTo(0, 0)}
            aria-label={`View ${name || "owner"}'s profile`}
            title="View owner profile"
            className="flex-shrink-0 rounded-full transition-shadow hover:ring-2 hover:ring-[#800020]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#800020]"
          >
            {avatar}
          </Link>
        ) : (
          avatar
        )}
        <div className="min-w-0">
          <p className="text-sm font-bold truncate text-slate-900">{name || "Owner"}</p>
          <p className="text-[11px] text-slate-500">Property owner</p>
        </div>
      </div>
    </section>
  );
};

const categoryBadge = (type) =>
  type === "Rent"
    ? { label: "FOR RENT", cls: "bg-blue-500" }
    : type === "Buy"
      ? { label: "FOR BUY", cls: "bg-green-600" }
      : { label: "UNKNOWN", cls: "bg-gray-500" };

const fallbackCopy = (text) => {
  const area = document.createElement("textarea");
  area.value = text;
  area.style.position = "fixed";
  area.style.left = "-9999px";
  document.body.appendChild(area);
  area.select();
  try {
    document.execCommand("copy") ? toast.success("Link copied!") : toast.error("Copy failed");
  } catch {
    toast.error("Copy failed");
  }
  document.body.removeChild(area);
};

/* ----- More-details fields grouped by category --------------------- */
const DETAIL_CATEGORIES = [
  {
    id: "structure",
    label: "Building & Structure",
    icon: FaBuilding,
    accent: "bg-indigo-50 text-indigo-600",
    fields: [
      ["Total Floor", "total_floor"],
      ["Property Floor", "property_floor"],
      ["Facing", "facing"],
      ["Flooring", "flooring"],
      ["Ceiling Height", "ceiling_height"],
      ["Age of Property", "age_of_property"],
      ["Type of Construction", "type_of_construction"],
      ["Quality Rating", "quality_rating"],
      ["Builder Floor Type", "builder_floor_type"],
      ["Block", "block"],
      ["Developer", "developer"],
      ["Project Type", "project_type"],
      ["Office Space Type", "office_space_type"],
    ],
  },
  {
    id: "parking",
    label: "Parking & Utilities",
    icon: FaCar,
    accent: "bg-amber-50 text-amber-600",
    fields: [
      ["Covered Parking", "covered_parking"],
      ["Uncovered Parking", "uncovered_parking"],
      ["Parking Availability", "parking_availability"],
      ["Parking Types", "parking_types"],
      ["Total Parking", "total_number_parking"],
      ["Lift Availability", "lift_availability"],
      ["Power Backup", "power_backup"],
      ["Water Source", "water_source"],
      ["Central AC", "central_AC"],
    ],
  },
  {
    id: "rooms",
    label: "Rooms & Spaces",
    icon: FaBath,
    accent: "bg-rose-50 text-rose-600",
    fields: [
      ["Total Beds", "total_beds"],
      ["Available Beds", "available_beds"],
      ["Additional Rooms", "additional_rooms"],
      ["Bathroom", "bathroom"],
      ["Attached Bathroom", "attached_bathroom"],
      ["Min. Bathrooms", "number_of_minimum_bathrooms"],
      ["Attached Balcony", "attached_balcony"],
      ["Balcony", "balcony"],
      ["Pantry", "pantry"],
      ["Pantry Option", "pantry_option"],
      ["Personal Washroom", "personal_washroom"],
      ["Commercial Washroom", "commercial_washroom"],
      ["No. of Cabins", "no_of_cabines"],
      ["Meeting Rooms", "no_of_meeting_Rooms"],
      ["Conference Rooms", "no_of_conference_room"],
      ["Reception Area", "reception_area"],
      ["No. of Peoples", "no_of_peoples"],
      ["Seat Type", "seat_type"],
      ["Seats Available", "number_of_seats_available"],
      ["View", "view"],
    ],
  },
  {
    id: "lease",
    label: "Lease & Possession",
    icon: FaCalendarCheck,
    accent: "bg-emerald-50 text-emerald-600",
    fields: [
      ["Notice Period", "notice_period"],
      ["Notice Period (Days)", "notice_period_other_days"],
      ["Min. Lock-in Period", "min_lockin_period"],
      ["Possession Status", "possession_status"],
      ["Possession Date", "possession_date"],
      ["Possession By", "possession_by"],
      ["Security Deposit Type", "security_deposit_type"],
      ["Maintenance Frequency", "maintenance_frequency"],
      ["Maintenance Cost", "maintenance_cost"],
      ["Maintenance Included", "maintenance_included"],
      ["Transaction Type", "transaction_type"],
      ["Rent Duration", "rent_duration"],
      ["Available From", "available_from"],
      ["Available On", "available_on"],
    ],
  },
  {
    id: "charges",
    label: "Charges & Pricing",
    icon: FaMoneyBillWave,
    accent: "bg-cyan-50 text-cyan-600",
    fields: [
      ["Electricity Charges Included", "electricity_charges_included"],
      ["Tax & Govt. Charges", "tax_and_goverment_charges"],
      ["Electricity & Water Charges", "electricity_and_water_charges"],
      ["All Inclusive Price", "all_inclusive_price"],
      ["Price Negotiable", "price_negotiable"],
      ["Investment Options", "investment_options"],
      ["Food Available", "food_available"],
      ["PG Rules", "pg_rules"],
      ["PG Services", "pg_services"],
      ["Gate Closing Time", "gate_closing_time"],
      ["Gate Closing Hour", "gate_closing_hour"],
    ],
  },
  {
    id: "land",
    label: "Land & Dimensions",
    icon: FaRulerCombined,
    accent: "bg-violet-50 text-violet-600",
    fields: [
      ["Plot No.", "plot_no"],
      ["Dimensions (L)", "property_dimensions_length"],
      ["Dimensions (B)", "property_dimensions_breadth"],
      ["Length of Land", "length_of_land"],
      ["Breadth of Land", "breadthOfLand"],
      ["Open Sides", "openSidesOfLand"],
      ["No. of Open Sides", "no_of_open_sides"],
      ["Construction on Land", "constructionOnLand"],
      ["Selected Construction", "selectedConstructionOnLand"],
      ["Carpet Area", "carpet_area"],
      ["Carpet Area Unit", "carpet_area_unit"],
    ],
  },
  {
    id: "other",
    label: "Other Details",
    icon: FaClipboardList,
    accent: "bg-slate-100 text-slate-600",
    fields: [
      ["RERA ID", "property_no"],
      ["Landmarks", "landmarks"],
      ["Near Landmark", "near_landmark"],
      ["Flat Name", "flat_name"],
    ],
  },
];

const SIMILAR_SLIDER_SETTINGS = {
  infinite: true,
  slidesToShow: 3,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3500,
  arrows: false,
  responsive: [
    { breakpoint: 1024, settings: { slidesToShow: 2 } },
    { breakpoint: 640, settings: { slidesToShow: 1 } },
  ],
};

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

const Detail = () => {
  const { _id } = useParams();
  const history = useHistory();
  const sliderRef = useRef(null);

  const userId = sessionStorage.getItem("accessToken");
  const userType = sessionStorage.getItem("user_type");

  const [propertyDetails, setPropertyDetails] = useState({});
  const [propertyImages, setPropertyImages] = useState([]);
  const [allAmenities, setAllAmenities] = useState([]);
  const [aboutPropertyText, setAboutPropertyText] = useState("");
  const [userDetails, setUserDetails] = useState({
    full_name: "",
    mobile_number: "",
    email: "",
  });
  const [coords, setCoords] = useState({ lat: 0, lng: 0 });
  const [tourSchedule, setTourSchedule] = useState([]);
  const [scheduledDateLabel, setScheduledDateLabel] = useState("Virtual Tour");
  const [similarProperties, setSimilarProperties] = useState([]);

  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [freeViewCount, setFreeViewCount] = useState(0);
  const [paidViewCount, setPaidViewCount] = useState(0);

  const [activeImg, setActiveImg] = useState(0);
  const [showAllImages, setShowAllImages] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(userId));
  const [pendingAction, setPendingAction] = useState(null);

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [contactNumber, setContactNumber] = useState(
    () => sessionStorage.getItem("Mobile_Number") || "",
  );
  const [enquiryStatus, setEnquiryStatus] = useState(null);
  const [enqEmail, setEnqEmail] = useState("");
  const [enqDate, setEnqDate] = useState("");
  const [enqType, setEnqType] = useState("");
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  const checkPostLimits = async () => {
    if (!userId) return;
    try {
      const form = new FormData();
      form.append("user_id", userId);
      const { data } = await axios.post(api("get_profile"), form);
      const counts = data?.count_data;
      if (counts) {
        setFreeViewCount(counts.free_view_count || 0);
        setPaidViewCount(counts.paid_view_count || 0);
      }
    } catch (err) {
      console.error("Error checking post limits:", err);
    }
  };

  const handleAddCount = async (updatedCount) => {
    try {
      const form = new FormData();
      form.append(
        freeViewCount > 0 ? "free_view_count" : "paid_view_count",
        updatedCount,
      );
      form.append("user_id", userId);
      const res = await fetch(api("add_count"), { method: "POST", body: form });
      if (res.ok) checkPostLimits();
    } catch (err) {
      console.error("API error:", err);
    }
  };

  const fetchSimilarProperties = async () => {
    try {
      const { data } = await axios.post(api("get_featured_property"), {
        user_id: userId,
      });
      setSimilarProperties(
        data?.status === 1 && Array.isArray(data.data) ? data.data : [],
      );
    } catch (err) {
      console.error("Error fetching similar properties:", err);
    }
  };

  const checkIfFavorite = async (propertyId) => {
    if (!userId || !propertyId) return;
    try {
      const { data } = await axios.post(api("get_favorite_properties"), {
        user_id: userId,
      });
      const match = (data?.data || []).find(
        (fav) => String(fav._id) === String(propertyId),
      );
      setIsFavorite(Boolean(match));
      setFavoriteId(match?.favorite_id ?? null);
    } catch (err) {
      console.error("Error checking favorite status:", err);
    }
  };

  const fetchPropertyDetails = async (id) => {
    try {
      const { data: res } = await axios.post(api("get_property_details"), {
        property_id: id,
        user_id: userId,
      });
      const data = res?.data || {};
      const pd = data.property_details || {};

      setPropertyImages(data.property_images || []);
      setAllAmenities(data.amenities || []);
      setAboutPropertyText(pd.property_description || "");
      setPropertyDetails(pd);
      setCoords({ lat: pd.latitude || 0, lng: pd.longitude || 0 });

      const owner =
        Array.isArray(data.user_details) && data.user_details.length
          ? data.user_details[0]
          : null;
      setUserDetails(
        owner || { full_name: "N/A", mobile_number: "N/A", email: "N/A" },
      );

      const schedule = data.tour_schedule?.[0];
      if (schedule && !["Rejected", "Expired"].includes(schedule.status)) {
        setTourSchedule(data.tour_schedule);
        const [year, month, day] = schedule.schedule_date.split("-");
        const monthName = new Date(0, parseInt(month, 10) - 1).toLocaleString(
          "default",
          { month: "short" },
        );
        setScheduledDateLabel(
          `Scheduled ${parseInt(day, 10)} ${monthName} ${year.slice(-2)}`,
        );
      } else {
        setTourSchedule([]);
        setScheduledDateLabel("Virtual Tour");
      }
    } catch (err) {
      console.error("Error fetching property details", err);
      setPropertyImages([]);
      setAllAmenities([]);
      setTourSchedule([]);
    }
  };

  const toggleFavorite = async ({ propertyId, favId, saved }) => {
    if (!userId) {
      setIsLoginOpen(true);
      return;
    }
    try {
      if (saved) {
        await axios.delete(api("remove_from_favorite"), {
          data: { favorite_id: favId },
        });
        toast.success("Property removed from your favorites.");
      } else {
        await axios.post(api("add_to_favorite"), {
          user_id: userId,
          property_id: propertyId,
        });
        toast.success("Property has been saved to your favorites!");
      }
      checkIfFavorite(propertyDetails?._id);
      fetchSimilarProperties();
    } catch (err) {
      console.error("Favorite update failed:", err);
      toast.error("Could not update favourites. Please try again.");
    }
  };

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      setIsLoginOpen(true);
      return;
    }
    try {
      const { data } = await axios.post(api("add_property_enquiry"), {
        property_id: propertyDetails?._id,
        user_id: propertyDetails?.user_id,
        customer_id: userId,
        name,
        user_type: userType,
        contact_number: contactNumber,
        message: [
          message,
          enqType && `Enquiry type: ${enqType}`,
          enqDate && `Move-in date: ${enqDate}`,
          enqEmail && `Email: ${enqEmail}`,
        ]
          .filter(Boolean)
          .join("\n"),
      });
      if (data?.status) {
        setEnquiryStatus({ type: "success", message: "Enquiry sent successfully!" });
        setName("");
        setMessage("");
        setAgreedTerms(false);
      } else {
        setEnquiryStatus({ type: "error", message: "Failed to send enquiry!" });
      }
    } catch {
      setEnquiryStatus({ type: "error", message: "Something went wrong!" });
    }
  };

  useEffect(() => {
    checkPostLimits();
    fetchSimilarProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveImg(0);
    fetchPropertyDetails(_id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_id]);

  useEffect(() => {
    checkIfFavorite(propertyDetails?._id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyDetails?._id]);

  useEffect(() => {
    const d = propertyDetails;
    if (!d?._id || !d?.user_id || !userId) return;
    const form = new FormData();
    form.append("property_id", d._id);
    form.append("user_id", d.user_id);
    form.append("customer_id", userId);
    axios
      .post(api("add_view_property"), form)
      .catch((err) => console.error("Failed to record property view:", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyDetails?._id]);

  useEffect(() => {
    if (!isLoggedIn || !pendingAction) return;
    if (pendingAction === "tour") setIsTourOpen(true);
    if (pendingAction === "contact") {
      checkPostLimits();
      setIsContactOpen(true);
    }
    setPendingAction(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, pendingAction]);

  useEffect(() => {
    const locked = isShareOpen || isContactOpen || showAllImages || isTourOpen;
    document.body.style.overflow = locked ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isShareOpen, isContactOpen, showAllImages, isTourOpen]);

  const requireLogin = (action) => {
    if (userId) return true;
    setPendingAction(action);
    setIsLoginOpen(true);
    return false;
  };

  const handleLoginSuccess = () => {
    const mobile = sessionStorage.getItem("Mobile_Number");
    if (!mobile) return;
    setContactNumber(mobile);
    setIsLoginOpen(false);
    setIsLoggedIn(true);
  };

  const handleContactClick = () => {
    if (!requireLogin("contact")) return;
    if (!userDetails?.full_name) {
      toast.error("User data not found");
      return;
    }
    if (freeViewCount > 0) {
      setFreeViewCount(-1);
      handleAddCount(-1);
    } else if (paidViewCount > 0) {
      setPaidViewCount(-1);
      handleAddCount(-1);
    }
    setIsContactOpen(true);
  };

  const handleTourClick = () => {
    if (scheduledDateLabel !== "Virtual Tour") {
      history.push({ pathname: "/dashboard", state: { page: "myVirtualtour" } });
      return;
    }
    if (requireLogin("tour")) setIsTourOpen(true);
  };

  const copyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    } catch {
      fallbackCopy(url);
    }
  };

  const scrollToEnquiry = () =>
    document
      .getElementById("enquiry")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });

  const d = propertyDetails || {};
  const isRent = d.property_category_type === "Rent";
  const headlinePrice = isRent ? d.rent : d.property_price;
  const locality = [d.address_area, d.city_name].filter(Boolean).join(", ");
  const fullAddress = [d.address, d.city_name, d.state, d.zip_code]
    .filter(Boolean)
    .join(", ");
  const mapsLink =
    coords.lat && coords.lng
      ? `https://www.google.com/maps?q=${coords.lat},${coords.lng}`
      : null;
  const mapEmbed = `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`;

  const galleryImages = useMemo(
    () =>
      [
        ...new Set(
          [d.cover_image, ...propertyImages.map((i) => i.image)]
            .map(resolveImage)
            .filter(Boolean),
        ),
      ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [d.cover_image, propertyImages],
  );

  const hasVideo = Boolean(d.property_video);
  const totalPhotos = galleryImages.length + (hasVideo ? 1 : 0);
  const currentImage = galleryImages[activeImg] || galleryImages[0] || DEFAULT_IMAGE;
  const extraCount = Math.max(galleryImages.length - 4, 0) + (hasVideo ? 1 : 0);

  const stepImage = (dir) => {
    if (!galleryImages.length) return;
    setActiveImg((i) => (i + dir + galleryImages.length) % galleryImages.length);
  };

  const isLocked = freeViewCount <= 0 && paidViewCount <= 0;

  const sqftTotal = toSqft(d.area, d.area_in);
  const perSqft =
    !isRent && headlinePrice && sqftTotal
      ? Math.round(Number(headlinePrice) / sqftTotal)
      : null;

  const highlights = useMemo(() => {
    if (Array.isArray(d.key_highlights) && d.key_highlights.length) return d.key_highlights;
    return [
      d.furnished_type && `${d.furnished_type} property`,
      d.lift_availability && `Lift: ${d.lift_availability}`,
      d.power_backup && `Power backup: ${d.power_backup}`,
      d.facing && `${d.facing} facing`,
      d.parking_availability && `Parking: ${d.parking_availability}`,
      (d.near_landmark || d.landmarks) && `Near ${d.near_landmark || d.landmarks}`,
      d.water_source && `Water: ${d.water_source}`,
    ].filter(Boolean);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyDetails]);

  const detailGroups = useMemo(
    () =>
      DETAIL_CATEGORIES.map((cat) => ({
        ...cat,
        rows: cat.fields
          .map(([label, key]) => [
            label,
            key === "maintenance_included"
              ? d.maintenance_included
                ? "Yes"
                : null
              : d[key],
          ])
          .filter(([, value]) => value),
      })).filter((cat) => cat.rows.length > 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [propertyDetails],
  );

  const visibleAmenities = showAllAmenities ? allAmenities : allAmenities.slice(0, 9);

  const tourButtonClass =
    tourSchedule?.[0]?.status === "Accepted"
      ? "bg-green-600 text-white"
      : scheduledDateLabel === "Virtual Tour"
        ? "bg-white border border-[#7a1630] text-[#7a1630]"
        : "bg-[#c98a1b] text-white";

  /* ----- HTML-layout helpers (rent and sale) ----- */
  const n = galleryImages.length;
  const imageAt = (i) => (n ? galleryImages[((i % n) + n) % n] : DEFAULT_IMAGE);
  const openLightboxAt = (i) => {
    setActiveImg(i);
    setShowAllImages(true);
  };

  const isCommercial = String(d.building_type || "").toLowerCase() === "commercial";
  const enquiryTypes = [
    "Price Negotiation",
    "Owner Contact Request",
    "Property Availability",
    "Legal & Documentation Help",
    "Make an Offer",
    "Other Enquiry",
  ];
  const enquiryTypeLabel = isCommercial
    ? isRent
      ? "Preferred Lease Duration"
      : "Preferred Purchase Timeline"
    : "Enquiry Type";
  const reportOptions = ["Listed by Broker", isRent ? "Rented Out" : "Sold Out", "Wrong Info"];
  const nearby = (d.landmarks || d.near_landmark || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const breadcrumb = ["Home", isRent ? "Rent" : "Sale", d.city_name, "Property Details"]
    .filter(Boolean)
    .join(" / ");
  const sqftLabel = sqftTotal ? Math.round(sqftTotal).toLocaleString("en-IN") : null;
  const perSqftText = perSqft ? `₹ ${perSqft.toLocaleString("en-IN")}` : null;
  const floorText =
    d.property_floor && d.total_floor
      ? `${d.property_floor} of ${d.total_floor}`
      : d.property_floor || null;
  const yn = (v) => (v === true || v === "Yes" ? "Yes" : v === false || v === "No" ? "No" : v || null);

  const specCells = [
    { icon: FaBed, label: "No. of Bedroom", value: d.bhk_type },
    { icon: FaBuilding, label: "Property Type", value: d.property_type },
    {
      icon: FaUserFriends,
      label: isRent ? "Preferred Tenant" : "Suited For",
      value: d.suited_for || d.available_for,
    },
    {
      icon: FaCalendarCheck,
      label: isRent ? "Available From" : "Possession",
      value: isRent ? d.available_from : d.possession_date || d.possession_status,
    },
    { icon: FaCar, label: "Parking", value: d.parking_availability },
    { icon: FaHourglassHalf, label: "Age of Building", value: d.age_of_property },
    { icon: FaDoorOpen, label: "Balcony", value: d.balcony },
    {
      icon: FaCalendarAlt,
      label: "Posted On",
      value: d.days_since_created != null ? `${d.days_since_created} days ago` : null,
    },
  ].filter((c) => c.value);

  const overviewCells = [
    { icon: FaCouch, label: "Furnishing Status", value: d.furnished_type },
    { icon: FaCompass, label: "Facing", value: d.facing },
    { icon: FaTint, label: "Water Supply", value: d.water_source },
    { icon: FaLayerGroup, label: "Floor", value: floorText },
    { icon: FaShower, label: "Bathroom", value: d.bathroom },
    { icon: FaArrowUp, label: "Lift", value: d.lift_availability },
    { icon: FaPlug, label: "Power Backup", value: d.power_backup },
    { icon: FaCar, label: "Parking", value: d.parking_availability },
  ].filter((c) => c.value);

  const moreCols = [
    {
      title: isRent ? "Rent & Deposit" : "Price Details",
      rows: isRent
        ? [
            [
              "Monthly rent",
              formatINR(d.rent) &&
                `${formatINR(d.rent)}${d.maintenance_included ? " (maintenance included)" : ""}`,
            ],
            ["Security deposit", formatINR(d.custom_deposit_amount)],
            ["Rent negotiable", yn(d.price_negotiable)],
            ["Available from", d.available_from],
          ]
        : [
            ["Price", formatINR(d.property_price)],
            ["Price per sq ft", perSqftText],
            ["Price negotiable", yn(d.price_negotiable)],
            ["All-inclusive price", formatINR(d.all_inclusive_price)],
            ["Possession", d.possession_date || d.possession_status],
          ],
    },
    {
      title: "Property",
      rows: [
        ["Type", [d.bhk_type, d.property_type].filter(Boolean).join(" ")],
        ["Area", formatArea(d.area, d.area_in)],
        ["Floor", floorText],
        ["Bathrooms ", [d.bathroom].filter(Boolean).join(" / ")],
        ["Building age", d.age_of_property],
        ["Facing", d.facing],
      ],
    },
    {
      title: "Location",
      rows: [
        ["Society", d.flat_name],
        ["Locality", locality],
        ["Pincode", d.zip_code],
        ["Landmark", d.near_landmark || d.landmarks],
      ],
    },
    {
      title: isRent ? "Rules & Preferences" : "Features & Facilities",
      rows: [
        ["Preferred tenant", d.suited_for || d.available_for],
        ["Parking", d.parking_availability],
        ["Lift", d.lift_availability],
        ["Power backup", d.power_backup],
        ["Water source", d.water_source],
      ],
    },
  ];

  const sectionTitle = (text) => (
    <div className="pb-1.5 mb-3 border-b border-slate-100">
      <h2 className="inline-block pb-1 text-sm font-bold border-b-2 text-slate-900 border-[#800020]">
        {text}
      </h2>
    </div>
  );

  const renderCol = (title, rows) => {
    const list = rows.filter(([, value]) => value);
    if (!list.length) return null;
    return (
      <div key={title}>
        <h3 className="text-[11px] font-bold text-[#800020] uppercase tracking-wide mb-1.5">{title}</h3>
        <dl className="divide-y divide-slate-100">
          {list.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-3 py-1.5">
              <dt className="text-slate-500">{label}</dt>
              <dd className="font-semibold text-right break-words text-slate-800">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    );
  };

  // Lightbox keyboard support: Esc closes, arrows move between photos
  useEffect(() => {
    if (!showAllImages) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setShowAllImages(false);
      if (e.key === "ArrowLeft") stepImage(-1);
      if (e.key === "ArrowRight") stepImage(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAllImages, n]);

  return (
    <div className="min-h-screen bg-[#fbf3ec] pb-20 lg:pb-8">
      <main className="w-full max-w-6xl px-3 py-4 mx-auto space-y-4 sm:px-6 lg:px-8 sm:py-8">
        {/* ===== Property header bar ===== */}
        <div className="flex flex-col justify-between gap-3 p-4 bg-white border shadow-sm rounded-xl border-slate-200 md:flex-row md:items-center">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#800020] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded tracking-wider uppercase">
                ZEROBRIKS
              </span>
              <span className="text-xs font-medium truncate text-slate-400">
                <Link to="/" className="hover:underline hover:text-[#800020]">Home</Link>
                {breadcrumb.slice(4)}
              </span>
            </div>
            <h1 className="text-base font-bold tracking-tight sm:text-lg text-slate-900">
              {d.property_name || "Property"}
              {d.property_no && (
                <span className="ml-1.5 text-[10px] font-normal text-slate-400">– {d.property_no}</span>
              )}
            </h1>
            <p className="flex items-center gap-1 mt-0.5 text-xs text-slate-500">
              <FaMapMarkerAlt size={11} className="text-[#800020] shrink-0" />
              <span className="truncate">{fullAddress || "Address N/A"}</span>
            </p>
          </div>

          <div className="flex items-center gap-4 pt-2.5 border-t border-slate-100 md:border-t-0 md:pt-0 shrink-0">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                {isRent ? "Rent" : "Price"}
              </span>
              <span className="text-lg font-extrabold text-[#800020]">
                {formatPriceLabel(headlinePrice) || "On request"}
                {isRent && d.maintenance_included && (
                  <span className="text-[10px] font-normal text-slate-500"> Included</span>
                )}
              </span>
            </div>
            <div className="pl-3 border-l border-slate-200">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Sq.Ft</span>
              <span className="text-sm font-bold text-slate-800">{sqftLabel || "—"}</span>
            </div>
            <div className="pl-3 border-l border-slate-200">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                {isRent ? "Deposit" : "Per Sq.Ft"}
              </span>
              <span className="text-sm font-bold text-slate-800">
                {isRent ? formatINR(d.custom_deposit_amount) || "—" : perSqftText || "—"}
              </span>
            </div>
            {isRent && (
              <button type="button" onClick={handleContactClick} className="px-3.5 py-2 bg-[#FAF6F0] text-[#800020] border-[1.5px] border-[#800020] font-bold text-xs rounded-lg transition-all duration-200 hover:bg-[#800020] hover:text-white hover:shadow-md">
                Contact Owner
              </button>
            )}
          </div>
        </div>

        {/* ===== Two-column layout ===== */}
        <div className="grid items-start grid-cols-1 gap-4 lg:grid-cols-3">
          {/* LEFT COLUMN */}
          <div className="space-y-4 lg:col-span-2">
            {/* Photo gallery */}
            <div className="p-2 bg-white border shadow-sm rounded-xl border-slate-200">
              <div className="relative grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div
                  onClick={() => openLightboxAt(activeImg)}
                  className="relative overflow-hidden rounded-lg cursor-pointer group sm:col-span-2 h-56 sm:h-64"
                >
                  <img
                    src={currentImage}
                    alt={d.property_name || "Property"}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute flex gap-1.5 top-2.5 left-2.5">
                    <span className="bg-[#800020]/90 text-white text-[10px] font-semibold px-2 py-1 rounded flex items-center gap-1">
                      <FaCamera size={9} /> Photos ({totalPhotos})
                    </span>
                    <span className="bg-slate-900/80 text-white text-[10px] font-semibold px-2 py-1 rounded">
                      Click to view full
                    </span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 bg-black/20 group-hover:opacity-100">
                    <span className="bg-white/90 text-[#800020] font-bold text-xs px-3 py-1.5 rounded-full shadow flex items-center gap-1">
                      <FaExpand size={10} /> Open Lightbox
                    </span>
                  </div>
                  {d.virtual_tour_availability === "Yes" && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTourClick();
                      }}
                      className={`absolute z-10 flex items-center gap-1.5 px-2.5 py-1 text-[9.5px] font-semibold rounded-md shadow bottom-2.5 right-2.5 ${tourButtonClass}`}
                    >
                      <PiCubeFocus size={11} />
                      {scheduledDateLabel === "Virtual Tour" ? "VIRTUAL TOUR" : scheduledDateLabel}
                    </button>
                  )}
                </div>

                <div className="grid h-56 grid-rows-2 gap-2 sm:h-64">
                  {[1, 2].map((off) => (
                    <div
                      key={off}
                      onClick={() => openLightboxAt((activeImg + off) % Math.max(n, 1))}
                      className="relative h-full overflow-hidden rounded-lg cursor-pointer group"
                    >
                      <img
                        src={imageAt(activeImg + off)}
                        alt=""
                        className="object-cover w-full h-full transition-transform group-hover:scale-105"
                      />
                      {off === 2 && n > 3 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-xs font-bold text-white transition bg-slate-900/60 hover:bg-slate-900/50">
                          <FaImages size={14} className="mb-1" />
                          <span>+{n - 3} More Photos</span>
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 bg-black/20 group-hover:opacity-100">
                          <FaExpand size={14} className="text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="absolute z-20 flex gap-1.5 top-3 right-3">
                  <button
                    type="button"
                    aria-label="Share property"
                    onClick={() => setIsShareOpen(true)}
                    className="p-2 transition rounded-full shadow-md bg-white/90 hover:bg-white text-slate-700"
                  >
                    <FiShare2 size={13} />
                  </button>
                  <button
                    type="button"
                    aria-label="Save property"
                    onClick={() =>
                      d._id && toggleFavorite({ propertyId: d._id, favId: favoriteId, saved: isFavorite })
                    }
                    className="p-2 transition rounded-full shadow-md bg-white/90 hover:bg-white"
                  >
                    <FiHeart size={13} className={isFavorite ? "fill-red-600 text-red-600" : "text-[#800020]"} />
                  </button>
                </div>
              </div>
            </div>

            {/* 8-cell highlight specs */}
            {specCells.length > 0 && (
              <div className="grid grid-cols-2 gap-3 p-3 text-xs bg-white border shadow-sm rounded-xl border-slate-200 sm:grid-cols-4">
                {specCells.map((c, i) => {
                  const Icon = c.icon;
                  return (
                    <div
                      key={c.label}
                      className={`p-2 flex items-start gap-2 border-slate-100 ${i % 4 !== 3 ? "sm:border-r" : ""} ${i < 4 ? "border-b" : ""}`}
                    >
                      <Icon size={11} className="mt-0.5 text-[#800020] shrink-0" />
                      <div className="min-w-0">
                        <span className="block font-bold truncate text-slate-800">{c.value}</span>
                        <span className="block text-[10px] font-medium text-slate-400">{c.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Nearby tags */}
            {nearby.length > 0 && (
              <div className="flex items-center gap-2 p-2.5 overflow-x-auto text-xs bg-white border shadow-sm rounded-xl border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 shrink-0">Nearby:</span>
                {nearby.map((place) => (
                  <span
                    key={place}
                    className="bg-[#FAF6F0] border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-[11px] shrink-0 font-medium"
                  >
                    {place}
                  </span>
                ))}
              </div>
            )}

            {/* Overview */}
            {overviewCells.length > 0 && (
              <div className="p-4 bg-white border shadow-sm rounded-xl border-slate-200">
                {sectionTitle("Overview")}
                <div className="grid grid-cols-2 gap-x-2 gap-y-3.5 text-xs sm:grid-cols-4">
                  {overviewCells.map((c) => {
                    const Icon = c.icon;
                    return (
                      <div key={c.label} className="flex items-center gap-2">
                        <Icon size={11} className="w-4 text-center text-slate-400 shrink-0" />
                        <div className="min-w-0">
                          <span className="block text-[10px] text-slate-400">{c.label}</span>
                          <span className="block font-bold truncate text-slate-800">{c.value}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Description with show more */}
            <div className="relative p-4 bg-white border shadow-sm rounded-xl border-slate-200">
              {sectionTitle("Description")}
              <div
                className={`text-xs text-slate-600 leading-relaxed space-y-2 overflow-hidden transition-all duration-300 ${showFullDesc ? "" : "max-h-20"}`}
              >
                <p className="whitespace-pre-line">{aboutPropertyText || "No description provided."}</p>
              </div>
              <div className="pt-2 mt-2 text-center border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFullDesc((s) => !s)}
                  className="flex items-center justify-center gap-1 mx-auto text-xs font-bold text-[#800020] hover:underline"
                >
                  <span>{showFullDesc ? "Show Less" : "Show More"}</span>
                  <FaChevronDown size={9} className={`transition-transform ${showFullDesc ? "rotate-180" : ""}`} />
                </button>
              </div>
            </div>

            {/* More details */}
            <div className="p-4 bg-white border shadow-sm rounded-xl border-slate-200">
              {sectionTitle("More Details")}
              <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
                {moreCols.map((col) => renderCol(col.title, col.rows))}
              </div>
            </div>

            {/* Amenities */}
            <div className="p-4 bg-white border shadow-sm rounded-xl border-slate-200">
              {sectionTitle("Amenities")}
              {allAmenities.length > 0 ? (
                <>
                  <div className="flex flex-wrap items-center gap-3">
                    {visibleAmenities.map((amenity, i) => (
                      <div
                        key={`${amenity.name}-${i}`}
                        className="w-20 p-3 text-center border rounded-lg shadow-sm bg-[#FAF6F0] border-slate-200"
                      >
                        {amenity.icon ? (
                          <img
                            src={`${API_BASE}/media/${amenity.icon}`}
                            alt={amenity.name}
                            className="block object-contain w-6 h-6 mx-auto mb-1"
                          />
                        ) : (
                          <FiCheckCircle size={17} className="block mx-auto mb-1 text-[#800020]" />
                        )}
                        <span className="block text-[11px] font-semibold leading-tight text-slate-800">
                          {amenity.name}
                        </span>
                      </div>
                    ))}
                  </div>
                  {allAmenities.length > 9 && (
                    <button
                      type="button"
                      onClick={() => setShowAllAmenities((s) => !s)}
                      className="mt-3 text-xs font-bold text-[#800020] hover:underline"
                    >
                      {showAllAmenities ? "Show less" : `+${allAmenities.length - 9} More`}
                    </button>
                  )}
                </>
              ) : (
                <p className="text-xs text-slate-500">No amenities listed.</p>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-4">
            {/* Enquiry form */}
            <section id="enquiry" className="p-4 bg-white border shadow-sm scroll-mt-16 rounded-xl border-slate-200">
              {sectionTitle("Send an Enquiry")}
              <p className="mb-3 text-[11px] text-slate-500">
                Fill in your details and the owner will get back to you. No brokerage fee.
              </p>
              <form onSubmit={handleEnquirySubmit} className="space-y-2.5 text-xs">
                <div>
                  <label className="block mb-1 font-semibold text-slate-700">
                    Full Name <span className="text-[#800020]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => !userId && setIsLoginOpen(true)}
                    className="w-full p-2 border rounded-md outline-none border-slate-300 focus:border-[#800020]"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-slate-700">
                    Mobile Number <span className="text-[#800020]">*</span>
                  </label>
                  <input
                    type="tel"
                    readOnly
                    placeholder="+91 9876543210"
                    value={contactNumber}
                    className="w-full p-2 border rounded-md outline-none bg-gray-50 border-slate-300"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-slate-700">
                    Email <span className="font-normal text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={enqEmail}
                    onChange={(e) => setEnqEmail(e.target.value)}
                    className="w-full p-2 border rounded-md outline-none border-slate-300 focus:border-[#800020]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1 font-semibold text-slate-700">Move-in Date</label>
                    <input
                      type="date"
                      value={enqDate}
                      onChange={(e) => setEnqDate(e.target.value)}
                      className="w-full p-2 border rounded-md outline-none border-slate-300 focus:border-[#800020]"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold text-slate-700">{enquiryTypeLabel}</label>
                    <select
                      value={enqType || enquiryTypes[0]}
                      onChange={(e) => setEnqType(e.target.value)}
                      className="w-full p-2 bg-white border rounded-md outline-none border-slate-300 focus:border-[#800020]"
                    >
                      {enquiryTypes.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-slate-700">Message</label>
                  <textarea
                    rows={3}
                    placeholder="Anything you'd like the owner to know?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onFocus={() => !userId && setIsLoginOpen(true)}
                    className="w-full p-2 border rounded-md outline-none resize-none border-slate-300 focus:border-[#800020]"
                  />
                </div>
                <div className="flex items-start gap-2 pt-1">
                  <input
                    id="enquiry-terms"
                    type="checkbox"
                    required
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 cursor-pointer accent-[#800020]"
                  />
                  <label htmlFor="enquiry-terms" className="text-[11px] leading-snug text-slate-600 cursor-pointer">
                    I agree to the{" "}
                    <a href="/terms-and-conditions" target="_blank" rel="noreferrer" className="font-semibold text-[#800020] hover:underline">
                      Terms & Conditions
                    </a>{" "}
                    and{" "}
                    <a href="/privacy-policy" target="_blank" rel="noreferrer" className="font-semibold text-[#800020] hover:underline">
                      Privacy Policy
                    </a>
                    .
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={!agreedTerms}
                  className="flex items-center justify-center w-full gap-1.5 py-2.5 rounded-md shadow text-xs font-bold text-white bg-[#800020] border-[1.5px] border-[#800020] hover:bg-[#5A0017] hover:border-[#5A0017] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaPaperPlane size={11} /> Send Enquiry
                </button>
              </form>
              {enquiryStatus && (
                <p
                  className={`mt-2 text-center text-[11px] ${enquiryStatus.type === "success" ? "text-green-600" : "text-red-600"}`}
                >
                  {enquiryStatus.message}
                </p>
              )}
            </section>

            {/* Owner profile */}
            <OwnerProfileCard owner={userDetails} ownerId={propertyDetails?.user_id} />

            {/* Visit and contact actions */}
            <div className="p-4 space-y-3 bg-white border shadow-sm rounded-xl border-slate-200">
              <div className="flex items-center justify-between p-2.5 text-xs text-[#800020] border rounded-lg bg-[#fdf2f4] border-[#800020]/20">
                <span className="text-[11px]">
                  <FaCalendarCheck size={10} className="inline mr-1" /> Next visit slot:{" "}
                  <strong>{scheduledDateLabel === "Virtual Tour" ? "Choose a slot" : scheduledDateLabel}</strong>
                </span>
                <button
                  type="button"
                  onClick={handleTourClick}
                  className="text-[11px] font-bold underline hover:text-[#5A0017]"
                >
                  Select
                </button>
              </div>

              <div className="space-y-2">
                <button type="button" onClick={handleContactClick} className="w-full py-2.5 shadow-sm bg-[#FAF6F0] text-[#800020] border-[1.5px] border-[#800020] font-bold text-xs rounded-lg transition-all duration-200 hover:bg-[#800020] hover:text-white hover:shadow-md">
                  Contact Owner
                </button>
                <button
                  type="button"
                  onClick={handleTourClick}
                  className="flex items-center justify-center w-full gap-1.5 py-2.5 shadow bg-[#800020] text-white border-[1.5px] border-[#800020] font-bold text-xs rounded-lg transition-all duration-200 hover:bg-[#5A0017] hover:border-[#5A0017] hover:shadow-md"
                >
                  <FaCalendarPlus size={11} /> Book Schedule for Visit
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <p className="flex items-center gap-1 mb-1.5 text-[10px] text-slate-400">
                  <FaInfoCircle size={10} className="text-[#800020]" /> Report what was not correct in this property
                </p>
                <div className="flex flex-wrap gap-1 text-[10px]">
                  {reportOptions.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => toast.info(`Reported: ${r}`)}
                      className="px-2 py-1 border rounded bg-[#FAF6F0] hover:bg-slate-200 text-slate-700 border-slate-300"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Location and similar properties ===== */}
        <section className="flex flex-col gap-3 mt-4">
          {/* Location */}
          <section id="sec-location" className="p-3.5 bg-white shadow-sm scroll-mt-16 rounded-2xl">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-[12px] font-bold text-gray-900">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#fbf1f3] text-[#7a1630]">
                  <FiMapPin size={11} />
                </span>
                Location
              </h2>
              {mapsLink && (
                <a
                  href={mapsLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[10.5px] font-medium text-[#7a1630] hover:underline"
                >
                  Open in Maps <FiExternalLink size={10} />
                </a>
              )}
            </div>
            <p className="mt-1 ml-9 text-[10.5px] text-gray-500">{fullAddress || "Address N/A"}</p>
            <div className="mt-2.5 overflow-hidden rounded-xl">
              <iframe
                title="Property location"
                src={mapEmbed}
                className="w-full h-48 md:h-64"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </section>

          {/* Similar properties */}
          {similarProperties.length > 0 && (
            <section id="sec-similar" className="p-3.5 bg-white shadow-sm scroll-mt-16 rounded-2xl">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <div>
                  <h2 className="text-[12px] font-bold text-gray-900">Exclusive Recommended</h2>
                  <p className="text-[9.5px] text-gray-500">Go from browsing to buying</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => history.push("/featuredDashboard")}
                    className="px-2.5 py-1 text-[9.5px] font-medium text-[#7a1630] bg-white border rounded-lg border-[#7a1630]"
                  >
                    View All
                  </button>
                  <button
                    type="button"
                    aria-label="Previous"
                    onClick={() => sliderRef.current?.slickPrev()}
                    className="flex items-center justify-center w-7 h-7 bg-white border rounded-full shadow-sm"
                  >
                    <FiChevronLeft size={11} />
                  </button>
                  <button
                    type="button"
                    aria-label="Next"
                    onClick={() => sliderRef.current?.slickNext()}
                    className="flex items-center justify-center w-7 h-7 bg-white border rounded-full shadow-sm"
                  >
                    <FiChevronRight size={11} />
                  </button>
                </div>
              </div>

              <Slider {...SIMILAR_SLIDER_SETTINGS} ref={sliderRef} className="slider-container">
                {similarProperties.map((p) => {
                  const badge = categoryBadge(p.property_category_type);
                  const cardPrice = p.property_category_type === "Rent" ? p.rent : p.property_price;
                  return (
                    <div key={p._id} className="px-1.5 py-1">
                      <div
                        onClick={(e) => {
                          if (e.target.closest("button, a, svg")) return;
                          window.scrollTo(0, 0);
                          // replace (not push) so Back returns to the page before this detail view
                          history.replace(`/propertydetails/${p._id}?property_owner_id=${p.user_id}`);
                        }}
                        className="relative overflow-hidden bg-white border shadow-sm rounded-xl border-slate-100 cursor-pointer transition-transform duration-300 hover:scale-105">
                        <Link
                          to={`/propertydetails/${p._id}?property_owner_id=${p.user_id}`}
                          replace
                          onClick={() => window.scrollTo(0, 0)}
                          className="block"
                        >
                          <div className="relative">
                            <img
                              src={resolveImage(p.cover_image) || DEFAULT_IMAGE}
                              alt={p.property_name || "Property"}
                              className="object-cover w-full h-32"
                            />
                            <span className="absolute px-2 py-0.5 text-[9px] text-white rounded-full top-1.5 left-1.5 bg-black/50">
                              {p.days_since_created}d on ZeroBriks
                            </span>
                            <span
                              className={`absolute bottom-0 left-0 px-2.5 py-0.5 text-[9px] text-white rounded-tr-lg ${badge.cls}`}
                            >
                              {badge.label}
                            </span>
                            {p.mark_as_featured === "Yes" && (
                              <span className="absolute bottom-0 right-0 px-2.5 py-0.5 text-[9px] text-white rounded-tl-lg bg-amber-500">
                                FEATURED
                              </span>
                            )}
                          </div>

                          <div className="p-2.5">
                            <h3 className="text-[10.5px] font-semibold text-gray-900 truncate">{p.property_name}</h3>
                            <p className="flex items-center gap-1 mt-1 text-[9.5px] text-gray-500 truncate">
                              <FiMapPin size={9} className="shrink-0" />
                              {p.address_area || "No Address Provided"}
                            </p>
                            <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 mt-1.5 text-[9.5px] text-gray-700">
                              {cardPrice && (
                                <span className="font-semibold text-[#7a1630]">
                                  ₹{formatPriceShort(cardPrice)}
                                  {p.property_category_type === "Rent" && p.rent_duration
                                    ? ` / ${p.rent_duration}`
                                    : ""}
                                </span>
                              )}
                              {p.bhk_type && <span>{p.bhk_type}</span>}
                              {formatArea(p.area, p.area_in) && <span>{formatArea(p.area, p.area_in)}</span>}
                            </div>
                          </div>
                        </Link>

                        <button
                          type="button"
                          aria-label="Save property"
                          onClick={() =>
                            toggleFavorite({
                              propertyId: p._id,
                              favId: p.favorite_id,
                              saved: p.is_favorite,
                            })
                          }
                          className="absolute z-10 flex items-center justify-center bg-white rounded-full shadow top-1.5 right-1.5 w-6 h-6"
                        >
                          <FiHeart size={10} className={p.is_favorite ? "fill-red-600 text-red-600" : "text-gray-500"} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </Slider>
            </section>
          )}
        </section>
      </main>

      {/* Mobile sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 p-2.5 bg-white border-t shadow-lg lg:hidden">
        <button
          type="button"
          onClick={handleContactClick}
          className="flex items-center justify-center flex-1 gap-1.5 py-2.5 text-[12px] font-semibold text-white bg-[#7a1630] rounded-lg"
        >
          <FiPhone size={12} /> Call Owner
        </button>
        <button
          type="button"
          onClick={scrollToEnquiry}
          className="flex items-center justify-center flex-1 gap-1.5 py-2.5 text-[12px] font-semibold text-white bg-[#c98a1b] rounded-lg"
        >
          <FiMessageCircle size={12} /> Enquire
        </button>
      </div>

      {/* Lightbox (HTML design) */}
      {showAllImages && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-black/95">
          <button
            type="button"
            aria-label="Close photo viewer"
            onClick={() => setShowAllImages(false)}
            className="absolute z-50 p-2 text-xl text-white top-4 right-4 hover:text-[#9E0028]"
          >
            <FiX />
          </button>
          <div className="absolute px-3 py-1.5 text-xs font-semibold text-white rounded-full top-4 left-4 bg-white/10 backdrop-blur-md">
            {Math.min(activeImg + 1, n || 1)} / {n || 1} — {d.property_name || "Photo Gallery"}
          </div>
          {n > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={() => stepImage(-1)}
                className="absolute p-3 text-white -translate-y-1/2 rounded-full left-4 top-1/2 bg-white/10 hover:bg-[#800020] backdrop-blur-md"
              >
                <FiChevronLeft size={18} />
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={() => stepImage(1)}
                className="absolute p-3 text-white -translate-y-1/2 rounded-full right-4 top-1/2 bg-white/10 hover:bg-[#800020] backdrop-blur-md"
              >
                <FiChevronRight size={18} />
              </button>
            </>
          )}
          <div className="flex items-center justify-center w-full max-w-4xl h-[70vh]">
            <img
              src={currentImage}
              alt={d.property_name || "Property"}
              className="max-w-full max-h-full object-contain transition-all duration-300 rounded-lg shadow-2xl"
            />
          </div>
          <div className="flex items-center max-w-xl gap-2 p-1 mt-4 overflow-x-auto">
            {galleryImages.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setActiveImg(i)}
                className={`shrink-0 w-12 h-12 rounded overflow-hidden border-2 transition ${
                  i === activeImg
                    ? "border-[#800020] scale-105 opacity-100"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img src={src} alt="" className="object-cover w-full h-full" />
              </button>
            ))}
          </div>
          {hasVideo && (
            <video controls className="object-contain mt-3 rounded-lg h-40">
              <source src={d.property_video} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      )}

      {/* Modals */}
      {isTourOpen && (
        <GetScheduleVTourproperty
          onClose={() => setIsTourOpen(false)}
          propertyDetails={propertyDetails}
          setScheduledDateLabel={setScheduledDateLabel}
          setIsModalOpen={setIsTourOpen}
        />
      )}

      {isContactOpen && userDetails?.full_name && (
        <ContactDetails
          onClose={() => setIsContactOpen(false)}
          fullName={isLocked ? `****${userDetails.full_name.slice(-1)}` : userDetails.full_name}
          mobile={
            isLocked
              ? `********${(userDetails.mobile_number || "").slice(-3) || "000"}`
              : userDetails.mobile_number || "N/A"
          }
          userEmail={
            isLocked
              ? userDetails.email
                ? `*******${userDetails.email.slice(-3)}`
                : "N/A"
              : userDetails.email || "N/A"
          }
          showUpgradePrompt={isLocked}
        />
      )}

      {isShareOpen && (
        <ShareModal
          currentShareUrl={window.location.href}
          closeShareModal={() => setIsShareOpen(false)}
          copyLink={copyLink}
        />
      )}

      <Login1
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToSignUp={() => {
          setIsLoginOpen(false);
          setIsSignUpOpen(true);
        }}
        onLoginSuccess={handleLoginSuccess}
      />
      <SignUp1
        isOpen={isSignUpOpen}
        onClose={() => setIsSignUpOpen(false)}
        onSwitchToLogin={() => {
          setIsSignUpOpen(false);
          setIsLoginOpen(true);
        }}
      />
    </div>
  );
};

export default Detail;