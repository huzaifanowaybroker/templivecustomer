import React, { useState, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Building2,
  Layers,
  Users,
  Video,
  CreditCard,
  Heart,
  Search,
  Tag,
  Settings,
  LogOut,
  CircleUser,
  Menu,
  X,
} from "lucide-react";
import Profile from "./Profile";
import MyProperties from "./MyProperties";
import MyProjects from "./MyProjects";
import MyLeads from "./MyLeads";
import MyVirtualTour from "./MyVirtualTour";
import Subscription from "./Subscription";
import SavedSerches from "./SavedSerches";
import MyFavourite from "./MyFavourite";
import Offer from "./Offer";

const NAV_ITEMS = [
  { key: "myProperties", label: "My Properties", icon: Building2 },
  { key: "myProjects", label: "My Projects", icon: Layers, hideForOwner: true },
  { key: "myLeads", label: "My Leads", icon: Users },
  { key: "myVirtualtour", label: "Virtual Tours", icon: Video },
  { key: "mySubscriptions", label: "Subscriptions", icon: CreditCard },
  { key: "myFavourite", label: "Favourites", icon: Heart },
  { key: "saveSerches", label: "Saved Searches", icon: Search },
  { key: "offers", label: "Offers", icon: Tag },
  { key: "profile", label: "Settings", icon: Settings },
];

const SECTIONS = {
  profile: Profile,
  myProperties: MyProperties,
  myProjects: MyProjects,
  myLeads: MyLeads,
  myVirtualtour: MyVirtualTour,
  mySubscriptions: Subscription,
  saveSerches: SavedSerches,
  myFavourite: MyFavourite,
  offers: Offer,
};

const Dashboard = () => {
  const location = useLocation();
  const history = useHistory();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(location.state?.page || "profile");
  const [showModal, setShowModal] = useState(false);
  const userType = sessionStorage.getItem("user_type");
  const userName = sessionStorage.getItem("user_name") || "";
  const roleLabel = userType === "Owner" ? "Property Owner" : userType || "";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (location.state?.page) setActiveSection(location.state.page);
  }, [location.state]);

  const go = (key) => {
    setActiveSection(key);
    setIsSidebarOpen(false);
  };

  const confirmLogout = () => {
    sessionStorage.clear();
    history.push("/");
    toast.success("Logout Successfully");
    setShowModal(false);
  };

  const ActiveComponent = SECTIONS[activeSection];
  const visibleItems = NAV_ITEMS.filter((item) => !(item.hideForOwner && userType === "Owner"));
  const activeLabel = NAV_ITEMS.find((i) => i.key === activeSection)?.label || "Dashboard";

  return (
    <div className="min-h-screen bg-[#fdf9f6] text-[#1e2a44] text-sm">
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Sidebar */}
        <aside
          className={`bg-white border-r border-[#ece6e1] w-full md:w-56 shrink-0 md:sticky md:top-0 md:h-screen flex-col ${
            isSidebarOpen ? "flex" : "hidden md:flex"
          }`}
        >
          {/* User */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-[#ece6e1]">
            <div className="w-9 h-9 rounded-full bg-[#700c28]/10 text-[#700c28] flex items-center justify-center shrink-0">
              <CircleUser size={20} />
            </div>
            <div className="min-w-0">
              <p className="font-semibold truncate">{userName || "Welcome"}</p>
              {roleLabel && <p className="text-xs text-[#1e2a44]/60">{roleLabel}</p>}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-0.5 p-2 flex-1">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => go(item.key)}
                  className={`flex items-center gap-3 px-3 py-1.5 rounded-md text-left transition-all duration-150 ${
                    active
                      ? "bg-[#700c28] text-white font-medium"
                      : "text-[#1e2a44]/80 hover:bg-[#700c28]/5"
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-2 border-t border-[#ece6e1]">
            <button
              onClick={() => setShowModal(true)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-left text-[#1e2a44]/80 hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Top bar */}
          <header className="flex items-center justify-between gap-3 px-3 sm:px-5 h-12 bg-white border-b border-[#ece6e1] sticky top-0 z-20">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden w-9 h-9 flex items-center justify-center rounded-md hover:bg-[#700c28]/5"
                aria-label="Toggle menu"
              >
                {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
              <h1 className="font-semibold text-base truncate">{activeLabel}</h1>
            </div>
          </header>

          {/* Content */}
          <main className="p-3 sm:p-4 min-w-0">
            {ActiveComponent && <ActiveComponent />}
          </main>
        </div>
      </div>

      {/* Logout modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl p-5 w-full max-w-xs text-center shadow-lg">
            <h2 className="text-base font-semibold">Log out?</h2>
            <p className="text-[#1e2a44]/70 text-xs mt-1">You will need to sign in again.</p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 h-9 rounded-md border border-[#700c28] text-[#700c28] hover:bg-[#700c28]/5"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 h-9 rounded-md bg-[#700c28] text-white hover:bg-[#580920]"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;