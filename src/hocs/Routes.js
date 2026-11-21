import React from "react";
import { useEffect } from 'react';
import { Switch, Route, Redirect } from "react-router-dom";
import Home from "../containers/Home";
import About from "../containers/About";
import Listing from "../containers/Listing";
import Contact from "../containers/Contact";
import Profile from "../containers/Profile";
import NotFound from "../containers/NotFound";
import PostProperty from "../containers/PostProperty";
import PropertyDashboard from "../containers/PropertyDashboard";
import Offer from "../containers/Offer";
import AllProperty from "../containers/AllProperty";
import Detail from "../containers/Detail";
import AllDeveloper from "../containers/AllDeveloper";
import SavedSearch from "../containers/SavedSearch";
import PostedProperties from "../containers/PostedProperties";
import ChangePassword from "../containers/ChangePassword";
import Download from "../containers/Download";
import DownloadHouzzaShots from "../containers/DownloadHouzzaShots";
import City_Wise from "../containers/City_Wise";
import SpotliteDetail from "../containers/SpotliteDetail";
import PDetails from "../containers/PDetails";
import OfferProperties from "../containers/OfferProperties";
import OfferDetail from "../containers/OfferDetail";
import AddOffer from "../containers/AddOffer";
import PlanPurchase from "../containers/PlanPurchase";
import SearchResults from "../containers/SearchResults";
// import EditProperty from "../containers/EditProperty";
import Amenities from "../containers/Amenities";
import UpdateDeveloper from "../containers/UpdateDeveloper";
import AddDeveloper from "../containers/AddDeveloper";
import UpcomingProject from "../containers/UpcomingProject";
import AddUpcomingProject from "../containers/AddUpcomingProject";
import Faq from "../containers/Faq";
import InquiriesList from "../containers/InquiriesList";
import InquiryDetail from "../containers/InquiryDetail";
import PlanHistory from "../containers/PlanHistory";
import ContactedProperties from "../containers/ContactedProperties";
import BhkProperties from "../containers/BhkProperties";
import Vaibhav from "../containers/Vaibhav";
import AdvisorDashboard from "../containers/AdvisorDashboard";
import MyTour from "../containers/MyTour";
import AllScheduled from "../containers/AllScheduled";
import SearchDashboard from "../containers/SearchDashboard";
import Dashboard from "../dashboard/Dashboard";
import AddNewProperty from "../postproperty/AddNewProperty";
import EditProperty from "../postproperty/EditProperty";
import AddNewProject from "../postproject/AddNewProject";
import Editproject from "../postproject/Editproject";
import Login1 from "../auth/Login1";
import OtpVerification_Login from "../auth/OtpVerification_Login";
import SignUp1, { CompleteProfile, ThankYou } from "../auth/SignUp1";
import OtpVerification from "../auth/OtpVerification";
import { restoreSession } from "../auth/authShared";
import AddNewOffer from "../addoffer/AddNewOffer";
import ProjectDetail from "../containers/ProjectDetail";
// import FeaturedDashboard from "../containers/FeaturedDashboard";
import AgentDetail from "../containers/AgentDetail";
import ProjectBuilder from "../containers/ProjectBuilder";
import ProjectList from "../containers/ProjectList";
import AllOffers from "../containers/AllOffers";
import GetScheduleModal from "../containers/GetScheduleModal";
import GetScheduleVTourproperty from "../containers/GetScheduleVTourproperty";
import AboutUs from "../dashboard/AboutUs";
import Privacy from "../dashboard/Privacy";
import Terms from "../dashboard/Terms";
import FAQ from "../dashboard/FAQ";
import CookiePolicy from "../dashboard/CookiePolicy";
import ContactUS from "../dashboard/ContactUS";
import OfferNotApprovedModal from "../dashboard/OfferNotApprovedModal";
import AdsNotApprovedModal from "../dashboard/AdsNotApprovedModal";
import AppDownloadPopup from "../containers/AppDownloadPopup";
import { ToastContainer } from "react-toastify";
import FeaturedDashboard from "../containers/FeaturedDashboard";
import RecommendedPropertiesDashboard from "../containers/RecommendedPropertiesDashboard";
import RecommendedProperties from "../containers/RecommendedProperties";
import ShareModal from "../containers/ShareModal";
import ContactDetails from "../containers/ContactDetails";
import { useHistory } from "react-router-dom";
import NRIPage from "../containers/NRIPage";
import ComingSoon from "../containers/ComingSoon";
import Pricing from "../containers/Pricing";
import Student from "../containers/Student";
import { CategoryRedirect } from "../containers/CategoryLinks";

// Restores the logged-in session from localStorage when the app starts.
restoreSession();

const Routes = () => {
  const accessToken = sessionStorage.getItem("accessToken");
  const history = useHistory();

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} />
      <Switch>

        {/* ════════════════════════════════════════════════════════════
            1. PUBLIC WEBSITE & INFO PAGES
            Marketing pages, legal pages, FAQs, and general info.
            No login required.
           ════════════════════════════════════════════════════════════ */}
        <Route exact path="/" component={Home} />
        <Route exact path="/about" component={About} />
        <Route path="/about-us" component={AboutUs} />
        <Route exact path="/contact" component={Contact} />
        <Route path="/contact-us" component={ContactUS} />
        <Route exact path="/nri" component={NRIPage} />
        <Route exact path="/coming-soon/:city_name" component={ComingSoon} />
        {/* Two FAQ pages share the path "/faq". React Router renders the first match,
            so "FAQ" (dashboard) is the one users see. "Faq" (containers) is unreachable. */}
        {/* <Route path="/faq" component={FAQ} /> */}
        <Route path="/faq" component={Faq} />
        <Route path="/privacy-policy" component={Privacy} />
        <Route path="/terms-conditions" component={Terms} />
        <Route path="/cookies-policy" component={CookiePolicy} />

        {/* ════════════════════════════════════════════════════════════
            2. AUTHENTICATION
            Login, sign-up, OTP, profile and thank-you steps. Every step has its
            own URL, and the home page renders behind each one. The auth component
            draws the dark overlay + card on top of it, so all steps look like
            popups on the hero.
           ════════════════════════════════════════════════════════════ */}
        <Route
          exact
          path="/login"
          render={() => (
            <>
              <Home />
              <Login1 page />
            </>
          )}
        />
        <Route
          exact
          path="/verify-login-otp"
          render={() => (
            <>
              <Home />
              <OtpVerification_Login />
            </>
          )}
        />
        <Route
          exact
          path="/register-:role"
          render={({ match }) => (
            <>
              <Home />
              <SignUp1 key={match.params.role} page />
            </>
          )}
        />
        <Route
          exact
          path="/verify-otp"
          render={() => (
            <>
              <Home />
              <OtpVerification />
            </>
          )}
        />
        <Route
          exact
          path="/complete-profile"
          render={() => (
            <>
              <Home />
              <CompleteProfile />
            </>
          )}
        />
        <Route
          exact
          path="/thank-you"
          render={() => (
            <>
              <Home />
              <ThankYou />
            </>
          )}
        />
        <Route path="/changepassword" component={ChangePassword} />

        {/* Old modal-era URLs redirect to the new pages */}
        <Redirect from="/login1" to="/login" />
        <Redirect from="/signup" to="/register-buyer" />
        <Redirect from="/signup1" to="/register-buyer" />
        <Redirect from="/otp" to="/register-buyer" />

        {/* ════════════════════════════════════════════════════════════
            3. USER PROFILE & SAVED ACTIVITY
            Personal profile, saved searches, and the user's posted items.
           ════════════════════════════════════════════════════════════ */}
        <Route exact path="/profile" component={Profile} />
        <Route path="/savedsearch" component={SavedSearch} />
        <Route path="/postedproperties" component={PostedProperties} />

        {/* ════════════════════════════════════════════════════════════
            4. DASHBOARDS
            All dashboard screens in one place.
           ════════════════════════════════════════════════════════════ */}
        <Route exact path="/dashboard" component={Dashboard} />
        <Route path="/property" component={PropertyDashboard} />
        <Route path="/recommendedpropertiesDashboard" component={RecommendedPropertiesDashboard} />
        <Route path="/featuredDashboard" component={FeaturedDashboard} />
        <Route path="/advisordashboard" component={AdvisorDashboard} />
        <Route path="/searchdashboard" component={SearchDashboard} />

        {/* ════════════════════════════════════════════════════════════
            5. PROPERTY MANAGEMENT
            Posting, editing, and amenities for properties.
           ════════════════════════════════════════════════════════════ */}
        <Route exact path="/add_new_property" component={AddNewProperty} />
        <Route path="/edit_property/:_id" component={EditProperty} />
        <Route path="/post-property" component={PostProperty} />
        <Route path="/amenity" component={Amenities} />

        {/* ════════════════════════════════════════════════════════════
            6. PROPERTY BROWSING & SEARCH
            Listings, property detail pages, search results, and city views.
           ════════════════════════════════════════════════════════════ */}
        <Route exact path="/listing" component={Listing} />
        <Route path="/allproperties" component={AllProperty} />
        <Route path="/propertydetails/:_id" component={Detail} />
        <Route path="/pdetails/:_id" component={PDetails} />
        <Route path="/bhkproperties" component={BhkProperties} />
        <Route path="/citywiseproperties/:city_name" component={City_Wise} />
        <Route path="/search/:cityName/:category" component={SearchResults} />

        {/* ════════════════════════════════════════════════════════════
            7. PROJECTS & DEVELOPERS
            New projects, upcoming projects, builders, and agents.
           ════════════════════════════════════════════════════════════ */}
        <Route exact path="/add_new_project" component={AddNewProject} />
        <Route path="/Editproject/:_id" component={Editproject} />
        {/* Two routes match "/projectdetail/...". Order is kept from the original file:
            ":projectId" is matched first. */}
        <Route path="/projectdetail/:projectId" component={ProjectDetail} />
        <Route path="/projectdetail/:id" component={ProjectDetail} />
        <Route path="/projectbuilder/:id" component={ProjectBuilder} />
        <Route path="/projectlist" component={ProjectList} />
        <Route path="/upcomingproject" component={UpcomingProject} />
        <Route path="/add-upcoming-project" component={AddUpcomingProject} />
        <Route path="/alldeveloper" component={AllDeveloper} />
        <Route path="/add-developer" component={AddDeveloper} />
        <Route path="/updatedeveloper" component={UpdateDeveloper} />
        <Route path="/spotlitedetails/:developerId/:userId" component={SpotliteDetail} />
        <Route path="/agentdetail/:id" component={AgentDetail} />

        {/* ════════════════════════════════════════════════════════════
            8. OFFERS
            Creating, viewing, and managing offers.
           ════════════════════════════════════════════════════════════ */}
        <Route exact path="/add_new_offer" component={AddNewOffer} />
        <Route path="/addoffer" component={AddOffer} />
        <Route path="/offer/:id" component={Offer} />
        <Route exact path="/offerdetail/:_id" component={OfferDetail} />
        <Route exact path="/all-offers" component={AllOffers} />
        <Route path="/offerproperties" component={OfferProperties} />
        <Route path="/offer-not-approved" component={OfferNotApprovedModal} />

        {/* ════════════════════════════════════════════════════════════
            9. SCHEDULING & SITE VISITS
            Booking viewings, virtual tours, and the tour schedule.
           ════════════════════════════════════════════════════════════ */}
        <Route exact path="/get-shedule" component={GetScheduleModal} />
        <Route exact path="/get-shedule-property" component={GetScheduleVTourproperty} />
        <Route path="/mytour" component={MyTour} />
        <Route path="/allschedules" component={AllScheduled} />

        {/* ════════════════════════════════════════════════════════════
            10. ENQUIRIES & CONTACTS
            Inquiries from seekers and contacts the user has reached out to.
           ════════════════════════════════════════════════════════════ */}
        <Route path="/inquirieslist" component={InquiriesList} />
        <Route path="/inquiriesdetail/:_id" component={InquiryDetail} />
        <Route path="/contactedproperties" component={ContactedProperties} />
        <Route path="/ContactDetails" component={ContactDetails} />

        {/* ════════════════════════════════════════════════════════════
            11. PLANS & PAYMENTS
            Plan purchase, plan history, and the pricing page.
           ════════════════════════════════════════════════════════════ */}
        <Route path="/plan" component={PlanPurchase} />
        <Route path="/plan-history" component={PlanHistory} />
        {/* Moved from the bottom of the file. It previously sat after the catch-all
            route, so /pricing was never reached and showed "Not Found". */}
        <Route path="/pricing" component={Pricing} />

        {/* ════════════════════════════════════════════════════════════
            12. SHARING, DOWNLOADS & APP
            Share dialogs, download pages, and the app download popup.
           ════════════════════════════════════════════════════════════ */}
        <Route path="/ShareModal" component={ShareModal} />
        <Route path="/download" component={Download} />
        <Route path="/downloadhouzzashots" component={DownloadHouzzaShots} />
        <Route path="/app-download" component={AppDownloadPopup} />

        {/* ════════════════════════════════════════════════════════════
            13. ADMIN & MISCELLANEOUS
            Approval notices and pages with no clear category yet.
           ════════════════════════════════════════════════════════════ */}
        <Route path="/add-not-approved" component={AdsNotApprovedModal} />
        {/* Purpose not clear from the name. Review before changing. */}
        <Route path="/vaibhav" component={Vaibhav} />

        <Route path="/student" component={Student} />

        {/* ════════════════════════════════════════════════════════════
            CATEGORY LISTING URLS
            e.g. /flats-for-sale-in-pune → City_Wise with filters applied.
           ════════════════════════════════════════════════════════════ */}
        <Route exact path="/:listing-in-:city_name" component={CategoryRedirect} />

        {/* ════════════════════════════════════════════════════════════
            FALLBACK
            Must stay last. Any path not matched above shows NotFound.
           ════════════════════════════════════════════════════════════ */}
        <Route component={NotFound} />

      </Switch>
    </>
  );
};

export default Routes;