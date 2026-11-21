import { useEffect, useRef, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Search, X, Trash2, Plus, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";

const PAGE_SIZE = 10;

// 1500000 -> "15 L", 10000000 -> "1 Cr", 2000 -> "2 K"
const formatAmount = (value) => {
  const n = Number(value);
  const trim = (x) => x.toFixed(1).replace(/\.0$/, "");
  if (n >= 10000000) return `${trim(n / 10000000)} Cr`;
  if (n >= 100000) return `${trim(n / 100000)} L`;
  if (n >= 1000) return `${trim(n / 1000)} K`;
  return value;
};

// Price line shown on a property (rent or sale price)
const priceText = (p = {}) => {
  if (p.property_category_type === "Rent") {
    const duration = p.rent_duration && p.rent_duration !== "N/A" ? ` / ${p.rent_duration}` : "";
    return `₹${formatAmount(p.rent)}${duration}`;
  }
  if (p.property_price && p.property_price !== "N/A") {
    return `₹${formatAmount(p.property_price)}`;
  }
  return null;
};

const tagFor = (type, saleLabel = "FOR BUY") => {
  if (type === "Buy") return { text: saleLabel, cls: "bg-[#700c28] text-white" };
  if (type === "Rent") return { text: "FOR RENT", cls: "bg-green-600 text-white" };
  return { text: "UNKNOWN", cls: "bg-gray-400 text-white" };
};

const statusClass = (status) => {
  if (status === "Approved") return "bg-green-100 text-green-700";
  if (status === "Rejected" || status === "Disapproved") return "bg-red-100 text-red-700";
  return "bg-yellow-100 text-yellow-700";
};

// Thumbnail with category tag
const Thumb = ({ src, tag }) => (
  <div className="relative w-20 h-16 shrink-0">
    <img src={src || "/image/app.png"} alt="" className="w-full h-full object-cover rounded-md" />
    <span className={`absolute top-1 left-1 text-[10px] px-1.5 py-0.5 rounded ${tag.cls}`}>
      {tag.text}
    </span>
  </div>
);

const Price = ({ text }) =>
  text ? <p className="text-xs font-semibold text-[#1e2a44] mt-0.5">{text}</p> : null;

// Shared image box used in the edit and create modals
const UploadBox = ({ src, onRemove, onPick, label }) => (
  <div className="flex flex-col items-center justify-center gap-2 border border-dashed border-[#d6cfc9] rounded-lg p-3 bg-[#fdf9f6] min-h-[140px]">
    {src ? (
      <div className="relative">
        <button
          onClick={onRemove}
          className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white"
          aria-label="Remove image"
        >
          <Trash2 size={12} />
        </button>
        <img src={src} alt="Offer" className="w-36 h-24 object-cover rounded-md" />
      </div>
    ) : (
      <button
        type="button"
        onClick={onPick}
        className="flex items-center gap-1 bg-[#700c28] text-white px-3 py-1.5 rounded-md text-xs"
      >
        <Plus size={14} /> Add photo
      </button>
    )}
    <p className="text-[11px] text-[#1e2a44]/50">{label}</p>
  </div>
);

const SelectedSummary = ({ property, saleLabel }) => (
  <div className="flex items-center gap-3 bg-white border border-[#ece6e1] rounded-lg p-3">
    <Thumb
      src={property?.property_data?.cover_image || property?.cover_image}
      tag={tagFor(property?.property_data?.property_category_type || property?.property_category_type, saleLabel)}
    />
    <div className="min-w-0">
      <p className="text-sm font-medium truncate">
        {property?.property_data?.property_name || property?.property_name}
      </p>
      <p className="text-xs text-[#1e2a44]/60 truncate">
        {property?.property_data?.address_area || property?.address_area}
      </p>
      <Price text={priceText(property?.property_data || property)} />
    </div>
  </div>
);

const ModalShell = ({ title, onClose, children, footer, wide = true }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className={`bg-[#fdf9f6] rounded-xl w-full ${wide ? "max-w-2xl" : "max-w-md"} max-h-[90vh] flex flex-col shadow-lg`}>
      <div className="flex items-center justify-between px-4 h-12 bg-white border-b border-[#ece6e1] rounded-t-xl">
        <h2 className="text-sm font-semibold">{title}</h2>
        <button onClick={onClose} className="text-[#1e2a44]/60 hover:text-[#1e2a44]" aria-label="Close">
          <X size={18} />
        </button>
      </div>
      <div className="p-4 overflow-y-auto space-y-3">{children}</div>
      {footer && <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-[#ece6e1] rounded-b-xl">{footer}</div>}
    </div>
  </div>
);

const primaryBtn = "bg-[#700c28] hover:bg-[#580920] text-white px-4 h-9 rounded-md text-sm disabled:opacity-50";

const Offer = () => {
  const history = useHistory();
  const userId = sessionStorage.getItem("accessToken");

  const [projects, setProjects] = useState([]);
  const [offerProjects, setOfferProjects] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [offerCount, setOfferCount] = useState(0);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const [searchOfferTerm, setSearchOfferTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNextModal, setShowNextModal] = useState(false);
  const [showCountModal, setShowCountModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState(null);
  const [selectedReason, setSelectedReason] = useState("");

  // Selection
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Edit form
  const [offerName, setOfferName] = useState("");
  const [offerDescription, setOfferDescription] = useState("");
  const [offerPhoto, setOfferPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // Create form
  const [createOfferName, setCreateOfferName] = useState("");
  const [createOfferDescription, setCreateOfferDescription] = useState("");
  const [createOfferPhoto, setCreateOfferPhoto] = useState(null);

  const fileRef = useRef(null);

  // Offer limit
  useEffect(() => {
    if (!userId) return;
    const checkPostLimits = async () => {
      try {
        const form = new FormData();
        form.append("user_id", userId);
        const { data } = await axios.post(
          `${process.env.REACT_APP_API_URL}/cust_api/get_profile`,
          form,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
        setOfferCount(data?.count_data?.offer_count || 0);
      } catch (error) {
        console.error("Error checking post limits:", error);
      }
    };
    checkPostLimits();
  }, [userId]);

  const fetchProjects = async () => {
    try {
      const form = new FormData();
      form.append("user_id", userId);
      form.append("page_size", 999999);
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/cust_api/get-listing-properties`,
        form,
      );
      if (data?.data) setProjects(data.data);
    } catch (error) {
      console.error("Failed to fetch properties:", error);
    }
  };

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const form = new FormData();
      form.append("user_id", userId);
      form.append("page", currentPage);
      form.append("page_size", PAGE_SIZE);
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/cust_api/get_offer`,
        form,
      );
      setOfferProjects(data?.data || []);
      setTotalCount(data?.total_count || 0);
    } catch (error) {
      console.error("Failed to fetch offers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchOffers();
  }, [userId, currentPage]);

  // Client-side search over the loaded offers
  useEffect(() => {
    const term = searchOfferTerm.toLowerCase().trim();
    setFilteredOffers(
      offerProjects.filter((o) =>
        (o.offer_name || "").toLowerCase().includes(term) ||
        (o.offer_description || "").toLowerCase().includes(term),
      ),
    );
    setCurrentPage(1);
  }, [searchOfferTerm, offerProjects]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // Lock page scroll while a modal is open
  useEffect(() => {
    const open = showSelectModal || showEditModal || showNextModal;
    document.body.style.overflow = open ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showSelectModal, showEditModal, showNextModal]);

  // Fill the edit form when an offer is chosen
  useEffect(() => {
    if (showEditModal && selectedProperty) {
      setOfferName(selectedProperty.offer_name || "");
      setOfferDescription(selectedProperty.offer_description || "");
      const imageUrl = `${process.env.REACT_APP_API_URL}${selectedProperty.offer_img || ""}`;
      setOfferPhoto(imageUrl);
      setPreviewUrl(imageUrl);
    }
  }, [showEditModal, selectedProperty]);

  const paginatedOffers = filteredOffers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const filteredProjects = projects.filter((p) => {
    const term = searchTerm.toLowerCase().trim();
    return (
      String(p.property_name || "").toLowerCase().includes(term) ||
      String(p.address || "").toLowerCase().includes(term)
    );
  });

  const resetCreateForm = () => {
    setSearchTerm("");
    setCreateOfferName("");
    setCreateOfferDescription("");
    setCreateOfferPhoto(null);
    setSelectedProperty(null);
    setSelectedProperties([]);
  };

  const toggleSelect = (propertyId) => {
    if (selectedProperties.includes(propertyId)) {
      setSelectedProperties([]);
      setSelectedProperty(null);
    } else {
      setSelectedProperties([propertyId]);
      setSelectedProperty(filteredProjects.find((p) => p._id === propertyId) || null);
    }
  };

  const openEdit = (offer) => {
    setSelectedProperty(offer);
    setShowEditModal(true);
  };

  const openCreate = () => {
    if (offerCount <= 0) {
      setShowCountModal(true);
      return;
    }
    resetCreateForm();
    setShowSelectModal(true);
    fetchProjects();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setOfferPhoto(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDeleteImage = () => {
    if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setOfferPhoto(null);
    setPreviewUrl("");
  };

  const handleEditSubmit = async () => {
    if (!userId) return toast.error("You must be logged in to edit an offer.");
    if (!offerName || !offerDescription || !selectedProperty?._id) {
      return toast.error("Please fill all fields and upload an image.");
    }
    const formData = new FormData();
    formData.append("user_id", selectedProperty.user_id);
    formData.append("offer_auto_id", selectedProperty._id);
    formData.append("offer_name", offerName);
    formData.append("offer_description", offerDescription);
    if (offerPhoto instanceof File) formData.append("offer_img", offerPhoto);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/cust_api/update_offer`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Offer edited successfully!");
        if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
        setSelectedProperties([]);
        setOfferName("");
        setOfferDescription("");
        setOfferPhoto(null);
        setPreviewUrl("");
        fetchOffers();
      } else {
        toast.error(data?.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Error submitting offer:", error);
      toast.error("Error submitting offer.");
    }
  };

  const handleCreateSubmit = async () => {
    if (!userId) return toast.error("You must be logged in to create an offer.");
    if (!createOfferName || !createOfferDescription || !selectedProperty?._id) {
      return toast.error("Please fill all fields and upload an image.");
    }
    const formData = new FormData();
    formData.append("user_id", selectedProperty.user_id);
    formData.append("property_id", selectedProperty._id);
    formData.append("offer_name", createOfferName);
    formData.append("offer_description", createOfferDescription);
    formData.append("offer_img", createOfferPhoto);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/cust_api/add_offer`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.status === 1) {
        toast.success("Offer created successfully!");
        setShowNextModal(false);
        resetCreateForm();
        setCreateOfferName("");
        setCreateOfferDescription("");
        setCreateOfferPhoto(null);
        fetchOffers();
      } else {
        toast.error(data?.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Error creating offer:", error);
      toast.error("Error creating offer.");
    }
  };

  const handleDelete = async () => {
    try {
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/cust_api/delete_offer`,
        {
          data: { user_id: offerToDelete.user_id, offer_auto_id: offerToDelete._id },
          headers: { "Content-Type": "application/json" },
        },
      );
      if (data.status === 1) {
        setOfferProjects((prev) => prev.filter((o) => o._id !== offerToDelete._id));
        setShowDeleteModal(false);
        toast.success("Offer deleted successfully!");
      } else {
        toast.error(data.detail || "Failed to delete offer");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  const closeNextModal = () => {
    setShowNextModal(false);
  };


  return (
    <div className="max-w-4xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-[#1e2a44]/60">Promote your properties with special offers.</p>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1e2a44]/40" />
            <input
              type="text"
              placeholder="Search offers"
              value={searchOfferTerm}
              onChange={(e) => setSearchOfferTerm(e.target.value)}
              className="h-9 w-56 pl-8 pr-8 border border-[#d6cfc9] rounded-md text-sm bg-white outline-none focus:border-[#700c28]"
            />
            {searchOfferTerm && (
              <button
                onClick={() => setSearchOfferTerm("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#1e2a44]/50"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button onClick={openCreate} className={`${primaryBtn} whitespace-nowrap`}>
            + New Offer
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <p className="text-xs text-center text-[#1e2a44]/60 py-6">Loading...</p>
      ) : paginatedOffers.length === 0 ? (
        <div className="bg-white border border-[#ece6e1] rounded-lg py-10 text-center text-sm text-[#1e2a44]/60">
          {searchOfferTerm.trim() ? "No offers match your search." : "No offers yet."}
        </div>
      ) : (
        <ul className="grid gap-2 md:grid-cols-2">
          {paginatedOffers.map((offer) => {
            const pd = offer.property_data || {};
            return (
              <li key={offer._id} className="bg-white border border-[#ece6e1] rounded-lg p-2.5 flex gap-3 items-center transition-all duration-150 hover:shadow-md hover:border-[#700c28]/30">
                <Link
                  to={{ pathname: `/offerdetail/${offer.property_id}`, state: { offer } }}
                  className="shrink-0"
                >
                  <Thumb
                    src={pd.cover_image ? `${process.env.REACT_APP_API_URL}${pd.cover_image}` : null}
                    tag={tagFor(pd.property_category_type)}
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <p className="text-sm font-medium truncate">{pd.property_name}</p>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${statusClass(offer.status)}`}>
                      {offer.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#1e2a44]/60 truncate">{pd.address_area}</p>
                  <Price text={priceText(pd)} />
                  <p className="text-[11px] text-[#1e2a44]/50 mt-0.5">
                    {offer.created_at &&
                      new Date(offer.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    {" · "}
                    {pd.view_count || 0} views · {pd.leads_count || 0} leads
                  </p>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={() => openEdit(offer)}
                    className="h-7 px-3 rounded-md border border-[#700c28] text-[#700c28] text-xs hover:bg-[#700c28]/5"
                  >
                    Edit
                  </button>
                  {offer.status === "Approved" && (
                    <button
                      onClick={() => {
                        setOfferToDelete(offer);
                        setShowDeleteModal(true);
                      }}
                      className="h-7 px-3 rounded-md border border-red-300 text-red-600 text-xs hover:bg-red-50"
                    >
                      Delete
                    </button>
                  )}
                  {(offer.status === "Rejected" || offer.status === "Disapproved") && (
                    <button
                      onClick={() => {
                        setSelectedReason(offer.reason || "No reason provided");
                        setShowReasonModal(true);
                      }}
                      className="h-7 px-3 rounded-md border border-[#1e2a44]/30 text-[#1e2a44] text-xs hover:bg-white"
                    >
                      View reason
                    </button>
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

      {/* Step 1: choose a property */}
      {showSelectModal && (
        <ModalShell
          title="Select a property"
          onClose={() => {
            resetCreateForm();
            setShowSelectModal(false);
          }}
          footer={
            <>
              <p className="text-xs text-[#1e2a44]/60">{selectedProperties.length} selected</p>
              <button
                className={primaryBtn}
                disabled={selectedProperties.length === 0}
                onClick={() => {
                  setShowSelectModal(false);
                  setShowNextModal(true);
                }}
              >
                Next
              </button>
            </>
          }
        >
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1e2a44]/40" />
            <input
              type="text"
              placeholder="Search properties"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 w-full pl-8 pr-3 border border-[#d6cfc9] rounded-md text-sm bg-white outline-none focus:border-[#700c28]"
            />
          </div>
          <ul className="space-y-2 max-h-72 overflow-y-auto">
            {filteredProjects.map((project) => {
              const checked = selectedProperties.includes(project._id);
              return (
                <li
                  key={project._id}
                  onClick={() => toggleSelect(project._id)}
                  className={`flex items-center gap-3 bg-white border rounded-lg p-2 cursor-pointer ${
                    checked ? "border-[#700c28]" : "border-[#ece6e1] hover:border-[#700c28]/40"
                  }`}
                >
                  <input type="checkbox" readOnly checked={checked} className="accent-[#700c28]" />
                  <Thumb src={project.cover_image} tag={tagFor(project.property_category_type)} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{project.property_name}</p>
                    <p className="text-xs text-[#1e2a44]/60 truncate">{project.address_area}</p>
                    <Price text={priceText(project)} />
                  </div>
                </li>
              );
            })}
          </ul>
        </ModalShell>
      )}

      {/* Edit offer */}
      {showEditModal && selectedProperty && (
        <ModalShell
          title="Edit offer"
          onClose={() => {
            fetchOffers();
            setShowEditModal(false);
            setSelectedProperties([]);
          }}
          footer={
            <>
              <p className="text-xs text-[#1e2a44]/60">1 property selected</p>
              <button
                className={primaryBtn}
                onClick={async () => {
                  await handleEditSubmit();
                  setShowEditModal(false);
                  fetchOffers();
                }}
              >
                Save changes
              </button>
            </>
          }
        >
          <SelectedSummary property={selectedProperty} saleLabel="FOR BUY" />
          <div className="grid sm:grid-cols-2 gap-3">
            <UploadBox
              src={previewUrl}
              label="Offer image"
              onRemove={handleDeleteImage}
              onPick={() => fileRef.current?.click()}
            />
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Offer name"
                value={offerName}
                onChange={(e) => setOfferName(e.target.value)}
                className="w-full h-9 px-3 border border-[#d6cfc9] rounded-md text-sm bg-white outline-none focus:border-[#700c28]"
              />
              <textarea
                rows={4}
                placeholder="Offer description"
                value={offerDescription}
                onChange={(e) => setOfferDescription(e.target.value)}
                className="w-full px-3 py-2 border border-[#d6cfc9] rounded-md text-sm bg-white outline-none focus:border-[#700c28]"
              />
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </ModalShell>
      )}

      {/* Create offer */}
      {showNextModal && selectedProperty && (
        <ModalShell
          title="Offer details"
          onClose={() => setShowNextModal(false)}
          footer={
            <>
              <button
                onClick={() => {
                  setShowNextModal(false);
                  setShowSelectModal(true);
                }}
                className="flex items-center gap-1 text-xs text-[#700c28] hover:underline"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                className={primaryBtn}
                onClick={async () => {
                  await handleCreateSubmit();
                  fetchOffers();
                }}
              >
                Create offer
              </button>
            </>
          }
        >
          <SelectedSummary property={selectedProperty} saleLabel="FOR SALE" />
          <div className="grid sm:grid-cols-2 gap-3">
            <UploadBox
              src={createOfferPhoto ? URL.createObjectURL(createOfferPhoto) : ""}
              label="Offer image"
              onRemove={() => setCreateOfferPhoto(null)}
              onPick={() => fileRef.current?.click()}
            />
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Offer name"
                value={createOfferName}
                onChange={(e) => setCreateOfferName(e.target.value)}
                className="w-full h-9 px-3 border border-[#d6cfc9] rounded-md text-sm bg-white outline-none focus:border-[#700c28]"
              />
              <textarea
                rows={4}
                placeholder="Offer description"
                value={createOfferDescription}
                onChange={(e) => setCreateOfferDescription(e.target.value)}
                className="w-full px-3 py-2 border border-[#d6cfc9] rounded-md text-sm bg-white outline-none focus:border-[#700c28]"
              />
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setCreateOfferPhoto(e.target.files[0] || null)}
          />
        </ModalShell>
      )}

      {/* Offer limit reached */}
      {showCountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl p-5 w-full max-w-xs shadow-lg">
            <h2 className="text-base font-semibold text-red-600">Offer limit reached</h2>
            <p className="text-xs text-[#1e2a44]/70 mt-2">
              You have reached your offer limit. Purchase a plan to create more offers.
            </p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setShowCountModal(false);
                  history.push({ pathname: "/dashboard", state: { page: "mySubscriptions" } });
                }}
                className="flex-1 h-9 rounded-md bg-[#700c28] text-white text-sm"
              >
                Purchase plan
              </button>
              <button
                onClick={() => setShowCountModal(false)}
                className="flex-1 h-9 rounded-md border border-[#d6cfc9] text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {showDeleteModal && offerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl p-5 w-full max-w-xs text-center shadow-lg">
            <h2 className="text-base font-semibold">Delete offer?</h2>
            <p className="text-xs text-[#1e2a44]/60 mt-1">
              "{offerToDelete.offer_name}" will be removed.
            </p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 h-9 rounded-md border border-[#700c28] text-[#700c28] text-sm"
              >
                Cancel
              </button>
              <button onClick={handleDelete} className="flex-1 h-9 rounded-md bg-[#700c28] text-white text-sm">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection reason */}
      {showReasonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl p-5 w-full max-w-xs text-center shadow-lg">
            <h2 className="text-base font-semibold text-[#700c28]">Reason</h2>
            <p className="text-sm text-[#1e2a44]/70 mt-2">{selectedReason}</p>
            <button
              onClick={() => setShowReasonModal(false)}
              className="mt-4 h-9 w-full rounded-md bg-[#700c28] text-white text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Offer;
