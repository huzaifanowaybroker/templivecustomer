import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Search, X, ArrowDownUp, Phone, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 10;

// 1500000 -> "15 L", 10000000 -> "1 Cr", 2000 -> "2 K"
const formatPrice = (value) => {
  if (!value) return "";
  const n = Number(value);
  const trim = (x) => x.toFixed(2).replace(/\.?0+$/, "");
  if (n >= 10000000) return `${trim(n / 10000000)} Cr`;
  if (n >= 100000) return `${trim(n / 100000)} L`;
  if (n >= 1000) return `${trim(n / 1000)} K`;
  return n.toString();
};

const tagFor = (status) => {
  if (status === "Buy") return { text: "For Buy", cls: "bg-green-600" };
  if (status === "Rent") return { text: "For Rent", cls: "bg-blue-600" };
  if (status === "Residential") return { text: "Residential", cls: "bg-[#700c28]" };
  return { text: "Commercial", cls: "bg-yellow-600" };
};

const MyLeads = () => {
  const userId = sessionStorage.getItem("accessToken");
  const userType = (sessionStorage.getItem("user_type") || "").toLowerCase();
  const canSeeProjects = !["buyer", "owner"].includes(userType);

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("property");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      const formData = new FormData();
      formData.append("user_id", userId);
      formData.append("page", currentPage);
      formData.append("page_size", PAGE_SIZE);
      formData.append("search", search);
      formData.append("sortby", sortBy);
      const endpoint =
        activeTab === "property"
          ? "/cust_api/get_property_enquiry"
          : "/cust_api/get_project_enquiry";
      try {
        const { data } = await axios.post(
          `${process.env.REACT_APP_API_URL}${endpoint}`,
          formData,
        );
        if (data.status === 1) {
          const formatted = data.data.map((item, index) => {
            const isProperty =
              !!item.enquiry_property_name ||
              !!item.enquiry_property_price ||
              !!item.property_id;
            const isProject =
              !!item.enquiry_average_project_price ||
              !!item.enquiry_project_name ||
              !!item.project_id;
            let price = "N/A";
            if (isProperty) price = `₹ ${formatPrice(item.enquiry_property_price)}`;
            else if (isProject) price = `₹ ${formatPrice(item.enquiry_average_project_price)}`;
            return {
              id: item._id || index,
              property_id: isProperty ? item.property_id : null,
              project_id: isProject ? item.project_id : null,
              name: item.name,
              type: item.user_type || "Individual",
              phone: item.contact_number,
              status: item.enquiry_property_category_type,
              title: item.enquiry_property_name || item.project_name,
              location:
                item?.property_details?.address_area ||
                item?.project_details?.address_area ||
                "Not provided",
              price,
              rent: item.rent,
              rent_duration: item.rent_duration,
              receivedOn: new Date(item.created_at).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
              message: item.message || "",
              image: item.enquiry_cover_image,
            };
          });
          setLeads(formatted);
          setTotalCount(data.total_count || 0);
        }
      } catch (error) {
        console.error("Error fetching leads:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, [currentPage, search, sortBy, activeTab]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const detailLink = (lead) =>
    activeTab === "property"
      ? `/propertydetails/${lead.property_id}`
      : `/projectdetail/${lead.project_id}`;

  return (
    <div className="max-w-4xl space-y-3">
      <p className="-mt-1 text-xs text-[#1e2a44]/60">People who enquired about your listings.</p>

      {/* Tabs and filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-1 border-b border-[#ece6e1]">
          {[
            { key: "property", label: "Properties", show: true },
            { key: "project", label: "Projects", show: canSeeProjects },
          ]
            .filter((t) => t.show)
            .map((t) => (
              <button
                key={t.key}
                onClick={() => switchTab(t.key)}
                className={`px-3 py-2 text-sm border-b-2 -mb-px ${
                  activeTab === t.key
                    ? "border-[#700c28] text-[#700c28] font-medium"
                    : "border-transparent text-[#1e2a44]/60 hover:text-[#1e2a44]"
                }`}
              >
                {t.label}
              </button>
            ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1e2a44]/40" />
            <input
              type="text"
              placeholder="Search listing"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 w-56 pl-8 pr-8 border border-[#d6cfc9] rounded-md text-sm bg-white outline-none focus:border-[#700c28]"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setCurrentPage(1);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#1e2a44]/50"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => {
              setSortBy((prev) => (prev === "latest" ? "oldest" : "latest"));
              setCurrentPage(1);
            }}
            className="h-9 flex items-center gap-1.5 px-3 border border-[#d6cfc9] rounded-md text-xs bg-white hover:border-[#700c28]"
          >
            <ArrowDownUp size={13} />
            <span className="capitalize">{sortBy}</span>
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-[3px] border-[#ece6e1] border-t-[#700c28] rounded-full animate-spin" />
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-white border border-[#ece6e1] rounded-lg py-10 text-center text-sm text-[#1e2a44]/60">
          {search.trim() ? "No results found for your search." : "No leads yet."}
        </div>
      ) : (
        <ul className="grid gap-2 md:grid-cols-2">
          {leads.map((lead) => {
            const tag = tagFor(lead.status);
            return (
              <li key={lead.id} className="bg-white border border-[#ece6e1] rounded-lg p-2.5 flex gap-3 transition-all duration-150 hover:shadow-md hover:border-[#700c28]/30">
                {/* Image */}
                <Link to={detailLink(lead)} className="relative w-24 h-20 shrink-0">
                  <img
                    src={
                      lead.image
                        ? `${process.env.REACT_APP_API_URL}/media/${lead.image}`
                        : "https://via.placeholder.com/200x150?text=No+Image"
                    }
                    alt={lead.title || "Listing"}
                    className="w-full h-full object-cover rounded-md"
                  />
                  {activeTab === "property" && (
                    <span className={`absolute top-1 left-1 text-[10px] font-medium text-white px-1.5 py-0.5 rounded ${tag.cls}`}>
                      {tag.text}
                    </span>
                  )}
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{lead.title}</p>
                  <p className="text-xs text-[#1e2a44]/60 truncate">{lead.location}</p>
                  <p className="text-xs font-semibold mt-0.5">
                    {lead.status === "Rent"
                      ? `₹ ${formatPrice(lead.rent)}${lead.rent_duration ? ` / ${lead.rent_duration}` : ""}`
                      : lead.price}
                  </p>

                  {/* Enquirer */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs">
                    <span className="font-medium text-[#1e2a44]">{lead.name}</span>
                    <span className="text-[#1e2a44]/50">{lead.type}</span>
                    {lead.phone && (
                      <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-[#700c28] hover:underline">
                        <Phone size={12} /> {lead.phone}
                      </a>
                    )}
                    <span className="text-[#1e2a44]/50 ml-auto">{lead.receivedOn}</span>
                  </div>

                  {lead.message && (
                    <p className="text-xs text-[#1e2a44]/70 mt-1.5 bg-[#fdf9f6] rounded px-2 py-1.5">
                      {lead.message}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-[#ece6e1] disabled:opacity-40 hover:bg-white"
            aria-label="Previous page"
          >
            <ChevronLeft size={14} />
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-8 h-8 rounded-md text-xs ${
                currentPage === i + 1 ? "bg-[#700c28] text-white" : "hover:bg-white border border-transparent hover:border-[#ece6e1]"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-[#ece6e1] disabled:opacity-40 hover:bg-white"
            aria-label="Next page"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default MyLeads;
