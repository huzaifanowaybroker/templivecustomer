import { useEffect, useState } from "react";
import { Share2, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import ShareModal from "../containers/ShareModal";

const TABS = ["Buy", "Rent", "PG", "Commercial"];
const PAGE_SIZE = 10;

// Copy text to clipboard, with a fallback for non-secure contexts
const copyText = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.error("Clipboard API failed:", err);
  }
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch (err) {
    console.error("Fallback copy failed:", err);
  }
  document.body.removeChild(textArea);
  return ok;
};

const SavedSerches = () => {
  const [activeTab, setActiveTab] = useState("Buy");
  const [savedSearches, setSavedSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [shareState, setShareState] = useState({ id: null, url: "" });
  const [selectedId, setSelectedId] = useState(null);
  const userId = sessionStorage.getItem("accessToken");

  const fetchSavedSearches = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("user_id", userId);
      formData.append("page", currentPage);
      formData.append("page_size", PAGE_SIZE);

      // Map each tab to the key/value the backend expects
      if (activeTab === "Commercial") {
        formData.append("building_type", "Commercial");
      } else if (activeTab === "PG") {
        formData.append("property_category_type", "PG/Co-living");
      } else {
        formData.append("property_category_type", activeTab);
      }

      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/cust_api/get_save_search`,
        formData,
      );
      setSavedSearches(data?.data || []);
      setTotalPages(Math.ceil((data?.total_count || 0) / PAGE_SIZE));
    } catch (error) {
      console.error("Error fetching saved searches:", error);
      setSavedSearches([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchSavedSearches();
  }, [currentPage, activeTab]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const handleDelete = async (savedSearchId) => {
    try {
      const formData = new FormData();
      formData.append("saved_search_id", savedSearchId);
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/cust_api/delete_save_search`,
        { headers: { "Content-Type": "multipart/form-data" }, data: formData },
      );
      if (data.status === 1) {
        toast.success("Saved search deleted");
        fetchSavedSearches();
      } else {
        toast.error(data.message || "Failed to delete saved search.");
      }
    } catch (error) {
      toast.error("Something went wrong while deleting.");
      console.error("Error deleting saved search:", error);
    }
  };

  const confirmDelete = () => {
    if (selectedId) {
      handleDelete(selectedId);
      setSelectedId(null);
    }
  };

  const handleCopy = async (url) => {
    const ok = await copyText(url);
    toast[ok ? "success" : "error"](ok ? "Link copied" : "Copy failed");
  };

  const formatDate = (value) =>
    new Date(value).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="max-w-4xl space-y-3">
      <p className="-mt-1 text-xs text-[#1e2a44]/60">Properties you saved from your searches.</p>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#ece6e1]">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setCurrentPage(1);
            }}
            className={`px-3 py-2 text-sm border-b-2 -mb-px transition-colors ${
              activeTab === tab
                ? "border-[#700c28] text-[#700c28] font-medium"
                : "border-transparent text-[#1e2a44]/60 hover:text-[#1e2a44]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <p className="text-xs text-[#1e2a44]/60 py-6 text-center">Loading...</p>
      ) : savedSearches.length === 0 ? (
        <div className="bg-white border border-[#ece6e1] rounded-lg py-10 text-center">
          <Search size={24} className="mx-auto text-[#1e2a44]/30 mb-2" />
          <p className="text-sm text-[#1e2a44]/60">No saved searches in {activeTab}.</p>
        </div>
      ) : (
        <ul className="grid gap-2 md:grid-cols-2">
          {savedSearches.map((search) => (
            <li
              key={search._id}
              className="relative flex items-center gap-2 bg-white border border-[#ece6e1] rounded-lg px-3 py-2.5 transition-all duration-150 hover:shadow-md hover:border-[#700c28]/30"
            >
              <Link
                to={`/propertydetails/${search.property_id}`}
                className="flex-1 min-w-0 no-underline hover:text-[#700c28]"
              >
                <p className="text-sm font-medium truncate">
                  {search.property_name}
                  {search.address ? ` - ${search.address}` : ""}
                </p>
                <p className="text-xs text-[#1e2a44]/60 mt-0.5">
                  Saved on {formatDate(search.saved_on)}
                </p>
              </Link>

              <button
                onClick={() => {
                  const url = `${window.location.origin}/propertydetails/${search.property_id}`;
                  setShareState(
                    shareState.id === search.property_id
                      ? { id: null, url: "" }
                      : { id: search.property_id, url },
                  );
                }}
                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#700c28]/5 text-[#1e2a44]/70"
                aria-label="Share"
              >
                <Share2 size={15} />
              </button>

              <button
                onClick={() => setSelectedId(search._id)}
                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-50 text-red-600"
                aria-label="Delete"
              >
                <Trash2 size={15} />
              </button>

              {shareState.id === search.property_id && (
                <div className="absolute right-0 top-full mt-1 z-30">
                  <ShareModal
                    currentShareUrl={shareState.url}
                    closeShareModal={() => setShareState({ id: null, url: "" })}
                    copyLink={() => handleCopy(shareState.url)}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 pt-2">
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
                currentPage === i + 1
                  ? "bg-[#700c28] text-white"
                  : "hover:bg-white border border-transparent hover:border-[#ece6e1]"
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

      {/* Delete confirmation */}
      {selectedId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl p-5 w-full max-w-xs text-center shadow-lg">
            <h2 className="text-base font-semibold">Delete this search?</h2>
            <p className="text-xs text-[#1e2a44]/60 mt-1">This cannot be undone.</p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setSelectedId(null)}
                className="flex-1 h-9 rounded-md border border-[#700c28] text-[#700c28] hover:bg-[#700c28]/5"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 h-9 rounded-md bg-[#700c28] text-white hover:bg-[#580920]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedSerches;
