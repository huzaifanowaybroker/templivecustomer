import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { X, Camera, Pencil } from "lucide-react";

const LETTERS_CONTROL = ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete"];

const displayValue = (value) => (value !== null && value !== "" && value !== undefined ? value : "N/A");

const Field = ({ label, value }) => (
  <div>
    <p className="text-[11px] uppercase tracking-wide text-[#1e2a44]/50">{label}</p>
    <p className="text-sm text-[#1e2a44] break-words">{displayValue(value)}</p>
  </div>
);

const Input = (props) => (
  <input
    {...props}
    className={`w-full h-9 px-3 border border-[#d6cfc9] rounded-md text-sm bg-white outline-none focus:border-[#700c28] ${props.readOnly ? "bg-[#f5f1ee] text-[#1e2a44]/60" : ""} ${props.className || ""}`}
  />
);

const Label = ({ children }) => <span className="block text-xs text-[#1e2a44]/60 mb-1">{children}</span>;

const Profile = () => {
  const accessToken = sessionStorage.getItem("accessToken");
  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState(null);
  const [updatedData, setUpdatedData] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState({ listings: 0, leads: 0, tours: 0 });

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/cust_api/get_profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: accessToken }),
      });
      const data = await response.json();
      if (data.status === 1 && data.data) {
        setProfileData(data.data);
        setUpdatedData(data.data);
        if (data.data.profile_image) setProfileImage(data.data.profile_image);
        if (data.compare_data) {
          setStats({
            listings: data.compare_data.listings_count || 0,
            leads: data.compare_data.leads_count || 0,
            tours: data.compare_data.virtual_tour_count || 0,
          });
        }
      }
    } catch (error) {
      console.error("API Error:", error);
    }
  };

  useEffect(() => {
    if (accessToken) fetchProfile();
  }, [accessToken]);

  const isBuilder = (updatedData.user_type || profileData?.user_type || "").toString().toLowerCase() === "builder";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/cust_api/edit_profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: accessToken,
          full_name: updatedData.full_name,
          email: updatedData.email,
          mobile_number: updatedData.mobile_number,
          proprietorship: updatedData.proprietorship,
          experience: updatedData.experience,
          city: updatedData.city,
          company_name: updatedData.company_name,
        }),
      });
      const result = await response.json();
      if (result.status === 1) {
        setProfileData(updatedData);
        sessionStorage.setItem("user_email", updatedData.email);
        setIsModalOpen(false);
      } else {
        console.error("Update failed:", result);
      }
    } catch (error) {
      console.error("API Update Error:", error);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !profileData) return;

    setProfileImage(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("user_id", accessToken);
    formData.append("profile_image", file);
    formData.append("full_name", profileData.full_name);
    formData.append("email", profileData.email);
    formData.append("mobile_number", profileData.mobile_number);
    formData.append("experience", profileData.experience || "");
    formData.append("proprietorship", profileData.proprietorship || "");

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/cust_api/edit_profile`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.status === 1 && res.data.data?.profile_image) {
        setProfileImage(res.data.data.profile_image);
      }
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  const statItems = [
    { label: "Listings", value: stats.listings },
    { label: "Leads", value: stats.leads },
    { label: "Virtual tours", value: stats.tours },
  ];

  return (
    <div className="max-w-4xl space-y-4">
      <div>
        <h2 className="text-lg font-semibold">
          Welcome back, {profileData ? displayValue(profileData.full_name) : "..."}
        </h2>
        <p className="text-xs text-[#1e2a44]/60">Manage your account details.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {statItems.map((s) => (
          <div key={s.label} className="bg-white border border-[#ece6e1] rounded-lg px-3 py-2.5">
            <p className="text-lg font-semibold text-[#700c28] leading-tight">{s.value}</p>
            <p className="text-xs text-[#1e2a44]/60">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Profile card */}
      {profileData && (
        <div className="bg-white border border-[#ece6e1] rounded-lg p-4 flex flex-col sm:flex-row gap-4">
          <div className="flex flex-col items-center sm:items-start gap-2">
            <div className="relative">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-full overflow-hidden bg-[#700c28]/10 flex items-center justify-center text-[#700c28]"
                aria-label="Change photo"
              >
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-semibold">
                    {(profileData.full_name || "?").charAt(0).toUpperCase()}
                  </span>
                )}
              </button>
              <span className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-[#700c28] text-white flex items-center justify-center">
                <Camera size={12} />
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            <Field label="Name" value={profileData.full_name} />
            <Field label="Email" value={profileData.email} />
            <Field label="Mobile" value={profileData.mobile_number} />
            <Field label="City" value={profileData.city} />
            <Field label="Experience" value={profileData.experience} />
            <Field label="Proprietorship" value={profileData.proprietorship} />
            {isBuilder && <Field label="Company" value={profileData.company_name} />}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="h-9 px-4 self-start rounded-md border border-[#700c28] text-[#700c28] text-sm flex items-center gap-1.5 hover:bg-[#700c28]/5 whitespace-nowrap"
          >
            <Pencil size={13} /> Edit profile
          </button>
        </div>
      )}

      {/* Edit modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-lg">
            <div className="flex items-center justify-between px-4 h-12 border-b border-[#ece6e1]">
              <h2 className="text-sm font-semibold">Edit profile</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#1e2a44]/60 hover:text-[#1e2a44]" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto">
              <label className="block">
                <Label>Name</Label>
                <Input
                  type="text"
                  name="full_name"
                  value={updatedData.full_name || ""}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    const ok = /^[a-zA-Z\s]$/.test(e.key) || LETTERS_CONTROL.includes(e.key);
                    if (!ok) e.preventDefault();
                  }}
                />
              </label>
              <label className="block">
                <Label>Mobile number</Label>
                <Input type="text" name="mobile_number" value={updatedData.mobile_number || ""} readOnly maxLength={10} />
              </label>
              <label className="block">
                <Label>Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={updatedData.email || ""}
                  onChange={handleInputChange}
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                  title="Please enter a valid email address"
                />
              </label>
              <label className="block">
                <Label>City</Label>
                <Input type="text" name="city" value={updatedData.city || ""} onChange={handleInputChange} />
              </label>
              <label className="block">
                <Label>Experience (years)</Label>
                <Input
                  type="text"
                  name="experience"
                  value={updatedData.experience || ""}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    const ok = /^[0-9]$/.test(e.key) || LETTERS_CONTROL.includes(e.key);
                    if (!ok) e.preventDefault();
                  }}
                />
              </label>
              <label className="block">
                <Label>Proprietorship</Label>
                <select
                  name="proprietorship"
                  value={updatedData.proprietorship || ""}
                  onChange={handleInputChange}
                  className="w-full h-9 px-2 border border-[#d6cfc9] rounded-md text-sm bg-white outline-none focus:border-[#700c28]"
                >
                  <option value="">Select</option>
                  <option value="Individual">Individual</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Private Limited">Private Limited</option>
                  <option value="LLP">LLP</option>
                </select>
              </label>
              {isBuilder && (
                <label className="block sm:col-span-2">
                  <Label>Company name</Label>
                  <Input type="text" name="company_name" value={updatedData.company_name || ""} onChange={handleInputChange} />
                </label>
              )}
            </div>

            <div className="px-4 py-3 border-t border-[#ece6e1] flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="h-9 px-4 rounded-md border border-[#d6cfc9] text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProfile}
                className="h-9 px-4 rounded-md bg-[#700c28] hover:bg-[#580920] text-white text-sm"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
