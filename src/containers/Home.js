import React, { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet";
import RecommendedProperties from "../containers/RecommendedProperties";
import OffersForYou from "../containers/OffersForYou";
import Spotlight from "../containers/Spotlight";
import Adviser from "./Adviser";
import Cities from "./Cities";
import OwnerProperty from "./OwnerProperty";
import ManyMore from "./ManyMore";
import Search from "../containers/Search";
import ExploreServices from "../containers/ExploreServices";
import axios from "axios";
import ShareModal from "../containers/ShareModal";
import BuyProperty from "./BuyProperty";
import Commercial from "./Commercial";
import FeaturesSection from "./FeaturesSection";
import Student from "./Student";
import StaticFAQ from "./StaticFAQ";
import WhyZeroBriks from "./WhyZeroBriks";
import CatoryLinks from "./CategoryLinks";
const Home = () => {
  const [cityName, setCityName] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentShareUrl, setCurrentShareUrl] = useState("");
  const userId = sessionStorage.getItem("accessToken");

  const [homeData, setHomeData] = useState({
    recommendedProperties: {
      status: 0,
      data: [],
    },
    offersForYou: [],
    spotlight: {
      status: 0,
      data: [],
    },
    manyMore: {
      status: 0,
      data: [],
    },
    cities: [],
    adviser: {},
  });

  const [ownerProperties, setOwnerProperties] = useState([]);
  const [ownerData, setOwnerData] = useState({
    status: 0,
    data: [],
  });

  const [buyData, setBuyProperty] = useState({
    status: 0,
    data: [],
  });
  const fetchBuyData = async () => {
    try {
      const formData = new FormData();
      formData.append("page", 1);
      formData.append("page_size", 10);
      formData.append("property_category_type", "Buy");
      formData.append("building_type", "Residential");

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/cust_api/filter_property`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.status === 1) {
        setBuyProperty({
          status: 1,
          data: response.data.data || [],
        });
      }
    } catch (error) {
      console.error("Error fetching buy properties:", error);
    }
  };

  const [offersData, setOffersData] = useState({
    status: 0,
    data: [],
  });
  const fetchOffers = async () => {
    try {
      const formData = new FormData();
      formData.append("page", 1);
      formData.append("page_size", 10);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/cust_api/get_offer`,
        formData
      );

      setOffersData(response.data);
    } catch (error) {
      console.error("Error fetching offers:", error);
      setOffersData({
        status: 0,
        data: [],
      });
    }
  };
  const [commercialData, setCommercialData] = useState({
    status: 0,
    data: [],
  });

  const fetchCommercialData = async () => {
    try {
      const formData = new FormData();
      formData.append("page", 1);
      formData.append("page_size", 10);
      formData.append("property_category_type", "Buy");
      formData.append("building_type", "Commercial");

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/cust_api/filter_property`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.status === 1) {
        setCommercialData({
          status: 1,
          data: response.data.data || [],
        });
      }
    } catch (error) {
      console.error("Error fetching commercial properties:", error);
    }
  };

  useEffect(() => {
    fetchCommercialData();
  }, []);
  useEffect(() => {
    fetchBuyData();
  }, []);
  // Memoized fetchHomeData
  const fetchHomeData = useCallback(async () => {
    try {
      const formData = new FormData();
      formData.append("user_id", userId);
      formData.append("city_name", cityName);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/cust_api/get_home_data`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      if (response.data) {
        setHomeData({
          recommendedProperties: response.data.featured_properties || {
            status: 0,
            data: [],
          },
          offersForYou: response.data.offers || [],
          spotlight: response.data.projects || {
            status: 0,
            data: [],
          },
          manyMore:
            response.data.recommended_properties || {
              status: 0,
              data: [],
            },
          cities: response.data.city_property_count || [],
          adviser: response.data.user_type_property_count || {},
        });
      }
    } catch (error) {
      console.error("Error fetching home data:", error);
    }
  }, [cityName, userId]);

  const fetchOwnerProperties = async () => {
    try {
      const formData = new FormData();

      formData.append("page", 1);
      formData.append("page_size", 10);
      formData.append("user_type", "Owner");

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/cust_api/filter_property`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.status === 1) {
        setOwnerProperties(response.data.data || []);

        setOwnerData({
          status: 1,
          data: response.data.data || [],
        });
      }
    } catch (error) {
      console.error("Owner API Error:", error);
    }
  };
  // Geolocation useEffect
  useEffect(() => {
    const storedCityName = sessionStorage.getItem("cityName");
    if (storedCityName) {
      setCityName(storedCityName);
      return;
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          sessionStorage.setItem(
            "userLocation",
            JSON.stringify({ latitude, longitude }),
          );

          try {
            const response = await axios.get(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyAUCNwxnNo52kFWJNGhRVj-AnkoffmzYe0`,
            );

            if (response.data.status === "OK") {
              const addressComponents =
                response.data.results[0].address_components;

              const cityComponent = addressComponents.find((component) =>
                component.types.includes("locality"),
              );

              if (cityComponent) {
                setCityName(cityComponent.long_name);

                sessionStorage.setItem("cityName", cityComponent.long_name);
              }
            }
          } catch (error) {
            console.error("Google API Error:", error);
          }
        },

        (error) => {
          console.error("Geolocation Error:", error);
        },
      );
    }
  }, []);

  // Fetch home data with debounce
  useEffect(() => {
    const debounceFetch = setTimeout(() => {
      fetchHomeData();
      fetchOffers();
      fetchOwnerProperties();
    }, 300);

    return () => clearTimeout(debounceFetch);
  }, [cityName, fetchHomeData]);

  const openRecommendedShareModal = useCallback((propertyId) => {
    const baseUrl = window.location.origin;
    const fullUrl = `${baseUrl}/propertydetails/${propertyId}`;
    setCurrentShareUrl(fullUrl);
    setShowShareModal(true);
  }, []);

  const openSpotlightShareModal = useCallback((projectId) => {
    const baseUrl = window.location.origin;
    const fullUrl = `${baseUrl}/projectdetail/${projectId}`;
    setCurrentShareUrl(fullUrl);
    setShowShareModal(true);
  }, []);

  const closeShareModal = useCallback(() => {
    setShowShareModal(false);
  }, []);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(currentShareUrl);
    alert("Link copied: " + currentShareUrl);
  }, [currentShareUrl]);

  return (
    <>
      <Helmet>
        <title>Zerobriks - Home</title>
        <meta name="description" content="sign up page" />
      </Helmet>

      <section className="">
        <Search />
        {/* <FeaturesSection /> */}

        <div className="w-full pr-2 pl-2  flex flex-col">
          <Cities data={homeData?.cities || []} />
          <BuyProperty
            data={buyData}
            fetchHomeData={fetchHomeData}
            openRecommendedShareModal={openRecommendedShareModal}
            closeShareModal={closeShareModal}
            copyLink={copyLink}
            currentShareUrl={currentShareUrl}
          />

          <WhyZeroBriks />

          <Commercial
            data={commercialData}
            fetchHomeData={fetchHomeData}
            openRecommendedShareModal={openRecommendedShareModal}
            closeShareModal={closeShareModal}
            copyLink={copyLink}
            currentShareUrl={currentShareUrl}
          />
          <OwnerProperty
            data={ownerData}
            openRecommendedShareModal={openRecommendedShareModal}
            closeShareModal={closeShareModal}
            copyLink={copyLink}
            currentShareUrl={currentShareUrl}
            fetchHomeData={fetchHomeData}
          />
          <ManyMore
            data={homeData.manyMore}
            openRecommendedShareModal={openRecommendedShareModal}
            closeShareModal={closeShareModal}
            copyLink={copyLink}
            currentShareUrl={currentShareUrl}
            fetchHomeData={fetchHomeData}
          />
          <Spotlight
            data={homeData.spotlight}
            openSpotlightShareModal={openSpotlightShareModal}
            closeShareModal={closeShareModal}
            copyLink={copyLink}
            currentShareUrl={currentShareUrl}
            fetchHomeData={fetchHomeData}
          />
          <OffersForYou data={offersData} />
          <RecommendedProperties
            data={homeData.recommendedProperties}
            openRecommendedShareModal={openRecommendedShareModal}
            closeShareModal={closeShareModal}
            copyLink={copyLink}
            currentShareUrl={currentShareUrl}
            fetchHomeData={fetchHomeData}
          />
          {/* <Student /> */}
          <Adviser data={homeData.adviser} />
          <StaticFAQ />
          <ExploreServices />
          <CatoryLinks />
        </div>

        {showShareModal && (
          <ShareModal
            currentShareUrl={currentShareUrl}
            closeShareModal={closeShareModal}
            copyLink={copyLink}
          />
        )}
      </section>
    </>
  );
};

export default Home;