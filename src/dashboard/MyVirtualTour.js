import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiSmartphone,
  FiUser,
  FiX,
} from "react-icons/fi";

/* ------------------------------------------------------------------ */
/* Config & helpers                                                    */
/* ------------------------------------------------------------------ */

const API = process.env.REACT_APP_API_URL;
const SCHEDULE_URL = `${API}/cust_api/get_virtual_tour_schedule`;
const PAGE_SIZE = 10;
const FILTERS = ["All", "Pending", "Accepted", "Rejected", "Expired"];

const STATUS_STYLE = {
  Pending: { border: "border-l-amber-400", pill: "bg-amber-50 text-amber-700" },
  Accepted: { border: "border-l-green-500", pill: "bg-green-50 text-green-700" },
  Rejected: { border: "border-l-red-400", pill: "bg-red-50 text-red-700" },
  Expired: { border: "border-l-slate-400", pill: "bg-slate-100 text-slate-600" },
};

const CATEGORY_LABEL = { Buy: "For Sale", Rent: "For Rent", Project: "Project" };
const CATEGORY_STYLE = { Buy: "bg-green-600", Rent: "bg-blue-600", Project: "bg-gray-800" };

const BTN_PRIMARY =
  "px-4 py-2 text-sm font-semibold text-white bg-[#800020] rounded-lg transition hover:bg-[#5A0017]";
const BTN_SECONDARY =
  "px-4 py-2 text-sm font-semibold text-[#800020] bg-white border border-[#800020] rounded-lg transition hover:bg-[#fbf1f3]";
const BTN_SMALL =
  "px-3 py-1.5 text-sm font-semibold text-white bg-[#800020] rounded-md transition hover:bg-[#5A0017]";

// Drops trailing zeros: 2.00 -> "2", 1.50 -> "1.5"
const trimZeros = (x) => parseFloat(x.toFixed(2)).toString();

const formatPrice = (value) => {
  const n = Number(value);
  if (!n) return null;
  if (n >= 1e7) return `₹${trimZeros(n / 1e7)} Cr`;
  if (n >= 1e5) return `₹${trimZeros(n / 1e5)} L`;
  if (n >= 1e3) return `₹${trimZeros(n / 1e3)} K`;
  return `₹${n}`;
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const resolveImage = (src) => {
  if (!src) return "/image/appstore.png";
  return src.startsWith("http") ? src : `${API}/${src}`;
};

const normalizeStatus = (status) =>
  FILTERS.slice(1).find((f) => f.toLowerCase() === String(status || "").toLowerCase()) ||
  "Pending";

// Turns one API row into the shape the cards need.
const toAppointment = (item, tab) => {
  const isProperty = item.tour_type === "Property";
  const listing = (isProperty ? item.property_details : item.project_details) || {};
  const person = tab === "sent" ? item.property_owner_details : item.user_details;
  const isRent = isProperty && listing.property_category_type === "Rent";
  const rentDuration =
    isRent && listing.rent_duration && listing.rent_duration !== "N/A"
      ? listing.rent_duration
      : "";

  return {
    id: item._id,
    propertyId: item.property_id,
    detailPath: isProperty
      ? `/propertydetails/${item.property_id}`
      : `/projectdetail/${item.property_id}`,
    name: person?.full_name || "Unknown",
    role: person?.user_type || "",
    phone: person?.mobile_number || "Not available",
    ownerImage: item.property_owner_details?.profile_image || "",
    status: normalizeStatus(item.status),
    date: formatDate(item.schedule_date),
    time: [item.timeslot, item.time_unit].filter(Boolean).join(" "),
    title: listing.property_name || listing.project_name || "Untitled listing",
    location: listing.address_area || "",
    category: isProperty ? listing.property_category_type || "" : "Project",
    image: resolveImage(listing.cover_image),
    price: isRent
      ? formatPrice(listing.rent)
      : formatPrice(isProperty ? listing.property_price : listing.average_project_price),
    rentDuration,
  };
};

/* ------------------------------------------------------------------ */
/* Small UI pieces                                                     */
/* ------------------------------------------------------------------ */

const Modal = ({ open, title, onClose, children }) => {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-sm p-6 text-center bg-white shadow-xl rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute text-gray-400 top-3 right-3 hover:text-gray-700"
        >
          <FiX size={18} />
        </button>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <div className="mt-2 text-sm text-gray-600">{children}</div>
      </div>
    </div>
  );
};

const Avatar = ({ src }) =>
  src ? (
    <img
      src={`${API}/media/${src}`}
      alt=""
      className="object-cover w-10 h-10 rounded-full"
    />
  ) : (
    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-rose-100 text-[#800020]">
      <FiUser size={18} />
    </div>
  );

const AppointmentCard = ({ appt, isReceived, revealed, onReveal, onDecide, onOpenApp }) => {
  const style = STATUS_STYLE[appt.status];
  const canDecide = isReceived && appt.status === "Pending";

  return (
    <article
      className={`flex flex-col gap-4 p-4 bg-white border border-slate-200 border-l-4 rounded-xl shadow-sm sm:p-5 ${style.border}`}
    >
      {/* Header: person + contact */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center min-w-0 gap-3">
          <Avatar src={appt.ownerImage} />
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">{appt.name}</p>
            <p className="text-xs text-gray-500 capitalize">{appt.role}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <FiSmartphone className="text-[#800020]" />
          {revealed ? (
            <span className="font-medium text-gray-900">{appt.phone}</span>
          ) : (
            <button type="button" onClick={() => onReveal(appt)} className={BTN_SMALL}>
              Show number
            </button>
          )}
        </div>
      </header>

      {/* Body: listing */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <Link
          to={{ pathname: appt.detailPath, state: { propertyId: appt.propertyId } }}
          className="relative shrink-0"
        >
          <img
            src={appt.image}
            alt={appt.title}
            className="object-cover w-full h-36 rounded-lg sm:h-28 sm:w-36"
          />
          <span
            className={`absolute top-2 left-2 px-2 py-0.5 text-xs font-medium text-white rounded ${
              CATEGORY_STYLE[appt.category] || "bg-gray-800"
            }`}
          >
            {CATEGORY_LABEL[appt.category] || appt.category}
          </span>
        </Link>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 break-words">{appt.title}</h3>
          {appt.location && (
            <p className="flex items-center gap-1 mt-0.5 text-sm text-gray-500">
              <FiMapPin size={13} className="shrink-0" />
              <span className="truncate">{appt.location}</span>
            </p>
          )}
          {appt.price && (
            <p className="mt-1.5 font-bold text-[#800020]">
              {appt.price}
              {appt.rentDuration && (
                <span className="text-sm font-medium text-gray-500"> / {appt.rentDuration}</span>
              )}
            </p>
          )}
          <span
            className={`inline-block mt-2 px-2.5 py-0.5 text-xs font-semibold rounded-full ${style.pill}`}
          >
            {appt.status}
          </span>
        </div>
      </div>

      {/* Footer: schedule + actions */}
      <footer className="flex flex-col gap-3 pt-4 border-t border-slate-100 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1.5">
            <FiCalendar className="text-gray-400" /> {appt.date}
          </span>
          {appt.time && (
            <span className="flex items-center gap-1.5">
              <FiClock className="text-gray-400" /> {appt.time}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {canDecide && (
            <>
              <button
                type="button"
                onClick={() => onDecide({ id: appt.id, status: "Rejected" })}
                className="px-4 py-2 text-sm font-semibold text-red-600 bg-white border border-red-300 rounded-lg transition hover:bg-red-50"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => onDecide({ id: appt.id, status: "Accepted" })}
                className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg transition hover:bg-green-700"
              >
                Accept
              </button>
            </>
          )}
          {appt.status === "Accepted" && (
            <button type="button" onClick={onOpenApp} className={BTN_SECONDARY}>
              Open in app
            </button>
          )}
        </div>
      </footer>
    </article>
  );
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const MyVirtualTour = () => {
  const history = useHistory();
  const userId = sessionStorage.getItem("accessToken");

  const [tab, setTab] = useState("sent");
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ sent: 0, received: 0 });
  const [viewCounts, setViewCounts] = useState({ free: 0, paid: 0 });
  const [revealed, setRevealed] = useState(() => new Set());
  const [pendingDecision, setPendingDecision] = useState(null);
  const [modal, setModal] = useState(null); // "limit" | "app" | null

  const closeModal = () => setModal(null);

  /* ----- Data ----- */

  const fetchViewCounts = async () => {
    if (!userId) return;
    try {
      const form = new FormData();
      form.append("user_id", userId);
      const { data } = await axios.post(`${API}/cust_api/get_profile`, form);
      const c = data?.count_data;
      if (c) setViewCounts({ free: c.free_view_count || 0, paid: c.paid_view_count || 0 });
    } catch (err) {
      console.error("Could not load view limits:", err);
    }
  };

  const fetchCounts = async () => {
    if (!userId) return;
    try {
      const sentForm = new FormData();
      sentForm.append("user_id", userId);
      const receivedForm = new FormData();
      receivedForm.append("property_owner_id", userId);

      const [sent, received] = await Promise.all([
        axios.post(SCHEDULE_URL, sentForm),
        axios.post(SCHEDULE_URL, receivedForm),
      ]);
      setCounts({
        sent: sent.data?.total_count ?? 0,
        received: received.data?.total_count ?? 0,
      });
    } catch (err) {
      console.error("Could not load tour counts:", err);
    }
  };

  useEffect(() => {
    fetchViewCounts();
    fetchCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const form = new FormData();
      form.append(tab === "sent" ? "user_id" : "property_owner_id", userId);
      form.append("page", page);
      form.append("page_size", PAGE_SIZE);

      try {
        const { data } = await axios.post(SCHEDULE_URL, form);
        if (cancelled) return;
        if (data?.status === 1) {
          setAppointments((data.data || []).map((item) => toAppointment(item, tab)));
          setTotalPages(data.total_pages || 1);
        } else {
          setAppointments([]);
          setTotalPages(0);
        }
      } catch (err) {
        if (cancelled) return;
        console.error("Could not load tours:", err);
        setAppointments([]);
        setTotalPages(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [tab, page, userId]);

  /* ----- Actions ----- */

  const switchTab = (next) => {
    setTab(next);
    setFilter("All");
    setPage(1);
  };

  const goToPage = (next) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReveal = async (appt) => {
    if (!userId) {
      toast.info("Please log in to continue.");
      return;
    }
    if (revealed.has(appt.id)) return;
    if (viewCounts.free <= 0 && viewCounts.paid <= 0) {
      setModal("limit");
      return;
    }

    const key = viewCounts.free > 0 ? "free" : "paid";
    setViewCounts((prev) => ({ ...prev, [key]: prev[key] - 1 }));
    setRevealed((prev) => new Set(prev).add(appt.id));

    try {
      const form = new FormData();
      form.append(`${key}_view_count`, -1);
      form.append("user_id", userId);
      const res = await fetch(`${API}/cust_api/add_count`, { method: "POST", body: form });
      if (res.ok) fetchViewCounts();
    } catch (err) {
      console.error("Could not record view:", err);
    }
  };

  const handleDecision = async ({ id, status }) => {
    const form = new FormData();
    form.append("tour_schedule_id", id);
    form.append("status", status);

    try {
      const res = await axios.post(`${API}/cust_api/update_tour_status`, form);
      if (res.status === 200) {
        toast.success(`Tour ${status.toLowerCase()}.`);
        setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
      }
    } catch (err) {
      console.error("Status update failed:", err);
      toast.error("Could not update the tour. Please try again.");
    }
  };

  const confirmDecision = () => {
    const decision = pendingDecision;
    setPendingDecision(null);
    if (decision) handleDecision(decision);
  };

  /* ----- Derived ----- */

  const visible =
    filter === "All"
      ? appointments
      : appointments.filter((a) => a.status.toLowerCase() === filter.toLowerCase());

  const isReceived = tab === "received";

  /* ----- Render ----- */

  return (
    <div className="max-w-4xl px-4 pb-24 mx-auto mt-6 sm:px-6">
     

      {/* Tabs */}
      <div className="flex gap-6 border-b border-slate-200">
        {[
          { key: "sent", label: "Sent", count: counts.sent },
          { key: "received", label: "Received", count: counts.received },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => switchTab(t.key)}
            className={`flex items-center gap-2 pb-3 text-sm font-semibold transition ${
              tab === t.key
                ? "text-[#800020] border-b-2 border-[#800020]"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {t.label}
            <span
              className={`px-2 py-0.5 text-xs rounded-full ${
                tab === t.key ? "bg-rose-100 text-[#800020]" : "bg-slate-100 text-gray-600"
              }`}
            >
              {String(t.count).padStart(2, "0")}
            </span>
          </button>
        ))}
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2 mt-4">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 text-sm font-medium rounded-full transition ${
              filter === f
                ? "bg-[#800020] text-white"
                : "bg-slate-100 text-gray-600 hover:bg-slate-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="mt-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-gray-200 rounded-full border-t-[#800020] animate-spin" />
          </div>
        ) : visible.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-medium text-gray-700">No tours found</p>
            <p className="mt-1 text-sm text-gray-500">
              {isReceived
                ? "Tour requests for your listings will appear here."
                : "Tours you request will appear here."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {visible.map((appt) => (
              <AppointmentCard
                key={appt.id}
                appt={appt}
                isReceived={isReceived}
                revealed={revealed.has(appt.id)}
                onReveal={handleReveal}
                onDecide={setPendingDecision}
                onOpenApp={() => setModal("app")}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-center mt-8 gap-2" aria-label="Pagination">
          <button
            type="button"
            onClick={() => goToPage(Math.max(page - 1, 1))}
            disabled={page === 1}
            className="px-3 py-2 text-sm border rounded-full disabled:cursor-not-allowed disabled:text-gray-300 hover:bg-gray-100 disabled:hover:bg-transparent"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => goToPage(n)}
              aria-current={page === n ? "page" : undefined}
              className={`w-9 h-9 rounded-full text-sm font-medium ${
                page === n
                  ? "bg-[#800020] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            onClick={() => goToPage(Math.min(page + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-2 text-sm border rounded-full disabled:cursor-not-allowed disabled:text-gray-300 hover:bg-gray-100 disabled:hover:bg-transparent"
          >
            Next
          </button>
        </nav>
      )}

      {/* Confirm accept / reject */}
      <Modal
        open={Boolean(pendingDecision)}
        title={`Confirm ${pendingDecision?.status?.toLowerCase() ?? ""}`}
        onClose={() => setPendingDecision(null)}
      >
        <p>
          Are you sure you want to <b>{pendingDecision?.status?.toLowerCase()}</b> this tour
          request?
        </p>
        <div className="flex gap-3 mt-5">
          <button
            type="button"
            onClick={() => setPendingDecision(null)}
            className="flex-1 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button type="button" onClick={confirmDecision} className={`${BTN_PRIMARY} flex-1`}>
            Confirm
          </button>
        </div>
      </Modal>

      {/* Contact limit reached */}
      <Modal open={modal === "limit"} title="Contact limit reached" onClose={closeModal}>
        <p>
          You have used all your contact views. Choose a plan to keep viewing owner phone
          numbers.
        </p>
        <div className="flex gap-3 mt-5">
          <button type="button" onClick={closeModal} className="flex-1 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
            Later
          </button>
          <button
            type="button"
            onClick={() => {
              closeModal();
              history.push({ pathname: "/dashboard", state: { page: "mySubscriptions" } });
            }}
            className={`${BTN_PRIMARY} flex-1`}
          >
            View plans
          </button>
        </div>
      </Modal>

      {/* Mobile app only */}
      <Modal open={modal === "app"} title="Open in the ZeroBriks app" onClose={closeModal}>
        <p>Live tour details are available in the ZeroBriks app.</p>
        <button
          type="button"
          onClick={() => {
            closeModal();
            history.push("/download");
          }}
          className={`${BTN_PRIMARY} w-full mt-5`}
        >
          Download the app
        </button>
        <div className="flex justify-center gap-4 mt-4">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
            alt="Get it on Google Play"
            className="h-10"
          />
          <img
            src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
            alt="Download on the App Store"
            className="h-10"
          />
        </div>
      </Modal>
    </div>
  );
};

export default MyVirtualTour;