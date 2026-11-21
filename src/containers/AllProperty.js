import { API_BASE_URL } from "../config/api";
// import React, { useState, useEffect } from "react";
// import { MapContainer, Marker, Popup } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";
// import { FaRegHeart, FaHeart } from "react-icons/fa";
// import { BiRupee } from "react-icons/bi";
// import { AiOutlineInfo } from "react-icons/ai";
// import axios from "axios";
// import { useLocation } from "react-router-dom";
// import { Link } from "react-router-dom";
// import { RiArrowDropDownLine } from "react-icons/ri";
// import { MdOutlineNavigateBefore, MdOutlineNavigateNext } from "react-icons/md";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faShareNodes, faUserCircle } from "@fortawesome/free-solid-svg-icons";
// import { AiOutlineUser } from "react-icons/ai";
// import { MdOutlineBedroomParent } from "react-icons/md";
// import { FaMapMarkerAlt } from "react-icons/fa";
// import { BiArea } from "react-icons/bi";
// import { FaRupeeSign } from "react-icons/fa";
// import { faChair } from "@fortawesome/free-solid-svg-icons";
// import { PiShareNetworkLight } from "react-icons/pi";
// import { ShareNetwork } from "@phosphor-icons/react";
// import { PiCubeFocus } from "react-icons/pi";

// const AllProperty = () => {
//   const [squareFtDropdownOpen, setSquareFtDropdownOpen] = useState(false);
//   const location = useLocation();
//   const [properties, setProperties] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isFavorited, setIsFavorited] = useState(false);
//   const queryParams = new URLSearchParams(location.search);
//   const label = queryParams.get("label");
//   const [search, setSearch] = useState("");
//   const [propertyType, setPropertyType] = useState("");
//   const [bhkType, setBhkType] = useState("");
//   const [furnishedStatus, setFurnishedStatus] = useState("");
//   const [minSquareFt, setMinSquareFt] = useState("");
//   const [maxSquareFt, setMaxSquareFt] = useState("");
//   const [filtersApplied, setFiltersApplied] = useState(false);
//   const [activePropertyId, setActivePropertyId] = useState(null);

//   const toggleSquareFtDropdown = () => {
//     setSquareFtDropdownOpen((prev) => !prev);
//   };

//   const [priceDropdownOpen, setPriceDropdownOpen] = useState(false);
//   const [minPrice, setMinPrice] = useState("");
//   const [maxPrice, setMaxPrice] = useState("");

//   const togglePriceDropdown = () => {
//     setPriceDropdownOpen((prev) => !prev);
//   };

//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [propertyImages, setPropertyImages] = useState([]); // Dynamic images
//   // const [loadingImages, setLoadingImages] = useState(false);

//   const fetchPropertyImages = async (propertyId) => {
//     try {
//       const formData = new FormData();
//       formData.append("property_id", propertyId); // Add propertyId to formData

//       const response = await axios.post(
//         `${process.env.REACT_APP_API_URL}/cust_api/get_property_images`,
//         formData,
//         { headers: { "Content-Type": "multipart/form-data" } },
//       );

//       if (response.data.status === 1) {
//         setPropertyImages(response.data.data);
//         // console.log("Fetched images:", response.data.data);
//         setCurrentIndex(0); // Start from the first image
//       } else {
//         // console.error("No images found for the property.");
//       }
//     } catch (error) {
//       // console.error("Error fetching property images:", error);
//     }
//   };

//   const handlePrev = () => {
//     setCurrentIndex((prev) =>
//       prev === 0 ? propertyImages.length - 1 : prev - 1,
//     );
//   };

//   const handleNext = () => {
//     setCurrentIndex((prev) =>
//       prev === propertyImages.length - 1 ? 0 : prev + 1,
//     );
//   };

//   useEffect(() => {
//     setError(null);
//     setProperties([]);

//     const style = document.createElement("style");
//     style.innerHTML = `
//       .leaflet-popup-content-wrapper {
//         margin-bottom: 50px !important;
//         padding: 0 !important;
//       }
      
//       .leaflet-popup-content {
//         margin: 0 !important;
//         padding: 0 !important;
//       }
          
//       .leaflet-container a.leaflet-popup-close-button {
//         z-index: 1000;
//         top: 5px !important;
//         left: 10px;
//         border: none;
//         background-color: rgba(0, 0, 0, 0.6);
//         color: white;
//         cursor: pointer;
//         border-radius: 50%;
//       }
          
//       .leaflet-container a.leaflet-popup-close-button:hover {
//         background-color: rgba(0, 0, 0, 0.9);
//         color: white;
//       }
      
//       .custom-marker.active .marker-wrapper .price-tooltip{
//          background-color: green;
//       }

//       .leaflet-container .leaflet-popup-heart-button {
//         z-index: 1000;
//         position: absolute;
//         top: 5px;
//         right: 10px; /* Adjust the position from right */
//         width: 26px;
//         height: 24px;
//         border: none;
//         background-color: rgba(0, 0, 0, 0.6);
//         color: white;
//         cursor: pointer;
//         border-radius: 20%;
//         display: flex;
//         align-items: center;
//         justify-content: center;
//         padding: 1px;
//       }
      
//       .leaflet-container .leaflet-popup-heart-button:hover {
//         background-color: rgba(0, 0, 0, 0.9);
//         color: white;
//       }
          
//       /* Wrapper for marker */
//       .marker-wrapper {
//         position: relative;
//         display: flex;
//         justify-content: center;
//         align-items: center;
//       }
            
//       /* Tooltip-like price box */
//        .price-tooltip {
//   background: white;
//   color: black; /* Ensure the text color is black */
//   padding: 8px 12px;
//   border-radius: 18px;
//   font-weight: bold; /* Make the text bold */
//   font-size: 1.1rem; /* Increased font size */
//   box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
//   position: relative;
//   text-align: center;
//   white-space: nowrap;
//   z-index: 10;
// }
//       .price-tooltip:hover {
//         background-color: white; /* Change to gray on hover */
//         color: white; /* Optional: Change text color for better contrast */
//       }

//       /* Pointer (triangle below the box) */
//       .price-tooltip .pointer {
//         position: absolute;
//         bottom: -8px;
//         left: 50%;
//         transform: translateX(-50%);
//         width: 0;
//         height: 0;
//         border-left: 8px solid transparent;
//         border-right: 8px solid transparent;
//         border-top: 8px solid white;
//         background-color: lightgray;
//       }
        
//       /* Adjust the marker size */
//       .custom-marker {
//         display: flex;
//         align-items: center;
//         justify-content: center;
//       }
//       input[type="number"]::-webkit-outer-spin-button,
//       input[type="number"]::-webkit-inner-spin-button {
//         -webkit-appearance: none;
//         margin: 0;
//       }
      
//       input[type="number"] {
//         -moz-appearance: textfield;
//       }
              
//       .custom-button {
//         font-family: "Arial", sans-serif;
//         font-size: 1.5rem;
//         background-color: #fff;
//         padding: 0.5rem;
//         text-align: center;
//         cursor: pointer;
//       }
                
//       .custom-button:hover {
//         background-color: #f0f0f0;
//         color: #333;
//       }
//     `;
//     document.head.appendChild(style);

//     fetchProperties(label);
//   }, [label]);

//   const fetchProperties = async (label) => {
//     try {
//       const response = await axios.post(
//         `${process.env.REACT_APP_API_URL}/cust_api/filter_property`,
//         {
//           property_listed_by: label,
//         },
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         },
//       );

//       if (response.status === 200 && response.data.status === 1) {
//         setProperties(response.data.data); // Storing the fetched properties
//       } else {
//         // console.log("No properties available");
//         setProperties([]);
//       }
//     } catch (error) {
//       setError("Failed to load properties.");
//       // console.error("Error fetching properties:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatPrice = (price) => {
//     if (price === null || price === undefined || price === "") return "";

//     price = Number(price);

//     const formatNumber = (value) =>
//       value.toFixed(2).replace(/\.?0+$/, "");

//     if (price >= 10000000) {
//       return `₹ ${formatNumber(price / 10000000)} Cr`;
//     } else if (price >= 100000) {
//       return `₹ ${formatNumber(price / 100000)} L`;
//     } else if (price >= 1000) {
//       return `₹ ${formatNumber(price / 1000)} K`;
//     } else {
//       return `₹ ${price}`;
//     }
//   };

//   const createCustomIcon = (price, isActive = false) =>
//     L.divIcon({
//       className: `custom-marker ${isActive ? "active" : ""}`, // Add 'active' class dynamically
//       html: `
//           <div class="marker-wrapper">
//             <div class="price-tooltip">
//               ${formatPrice(price)} <!-- Formatted Price -->
//               <div class="pointer"></div>
//             </div>
//           </div>
//         `,
//       iconSize: [50, 60],
//       iconAnchor: [25, 60], // Anchor tooltip above the marker
//     });

//   // Handle button click
//   const handleButtonClick = async () => {
//     setError(null);
//     setProperties([]);
//     // Add async here
//     if (filtersApplied) {
//       setSearch("");
//       setPropertyType("");
//       setBhkType("");
//       setFurnishedStatus("");
//       setMinPrice("");
//       setMaxPrice("");
//       setMinSquareFt("");
//       setMaxSquareFt("");

//       fetchProperties(label);
//     } else {
//       const filters = {
//         area: search,
//         property_category_type: propertyType,
//         bhk_type: bhkType,
//         furnished_type: furnishedStatus,
//         property_listed_by: label,
//         min_price: minPrice,
//         max_price: maxPrice,
//         min_area: minSquareFt,
//         max_area: maxSquareFt,
//       };

//       try {
//         const formData = new FormData();
//         Object.entries(filters).forEach(([key, value]) => {
//           if (value) formData.append(key, value);
//         });

//         const response = await axios.post(
//           `${process.env.REACT_APP_API_URL}/cust_api/filter_property`,
//           formData,
//           {
//             headers: { "Content-Type": "multipart/form-data" },
//           },
//         );

//         // console.log("Filter response:", response.data); // Log the response

//         if (response.status === 200 && response.data.status === 1) {
//           setProperties(response.data.data); // Update properties
//         } else {
//           setProperties([]); // Clear map if no results
//         }
//       } catch (error) {
//         // console.error("Error applying filters:", error);
//         setError("Failed to apply filters.");
//       }
//     }

//     setFiltersApplied(!filtersApplied); // Toggle the state
//   };

//   const toggleFavorite = async (propertyId) => {
//     const userId = sessionStorage.getItem("AccessToken");
//     if (!userId) {
//       alert("Please log in to save properties to your favorites.");
//       return;
//     }

//     const data = { user_id: userId, property_id: propertyId };

//     try {
//       if (!isFavorited) {
//         await axios.post(
//           `${process.env.REACT_APP_API_URL}/cust_api/add_to_favorite`,
//           data,
//         );
//         setIsFavorited(true); // Set heart to filled state
//         alert("Property has been saved to your favorites!");
//       } else {
//         await axios.post(
//           `${process.env.REACT_APP_API_URL}/cust_api/remove_from_favorite`,
//           data,
//         );
//         setIsFavorited(false); // Set heart to unfilled state
//         alert("Property has been removed from your favorites!");
//       }
//     } catch (error) {
//       // console.error("Error toggling favorite status:", error);
//       alert("Failed to update the property. Please try again.");
//     }
//   };

//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 6;

//   // Calculate pagination values
//   const totalPages = Math.ceil(properties.length / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const visibleProperties = properties.slice(
//     startIndex,
//     startIndex + itemsPerPage,
//   );

//   return (
//     <div className="flex flex-col p-1 sm:p-6 bg-rose-50 rounded-xl space-y-4">
//       {/* Search and Filter Section */}
//       <div className="flex items-center justify-between  flex-wrap gap-4 md:gap-6 lg:gap-8 ml-14">
//         {/* Search Input - Left Side */}

//         {/* Right Side Fields */}
//         <div className="flex flex-wrap gap-3 md:gap-4 lg:gap-6 w-full  md:flex-row flex-col mt-2 ">
//           {/* Property Type Dropdown */}
//           <div className="w-[200px] ">
//             <select
//               value={propertyType}
//               onChange={(e) => setPropertyType(e.target.value)}
//               className="w-full space-x-3 h-16 p-2 border-2 border-gray-300 rounded-md focus:outline-none hover:bg-gray-300"
//             >
//               <option value="">Property Type</option>
//               <option value="Apartment">Apartment</option>
//               <option value="Villa">Villa</option>
//               <option value="Commercial">Commercial</option>
//               <option value="Residential">Residential</option>
//             </select>
//           </div>

//           {/* Price Range Button */}
//           <div className="relative w-full sm:w-48 md:w-60 lg:w-52 rounded-md">
//             <button
//               onClick={togglePriceDropdown}
//               className="w-full h-16 flex items-center justify-between px-4 border-2 border-gray-300 rounded-md focus:outline-none hover:bg-gray-300 bg-white"
//             >
//               <span>Budget</span>
//               <RiArrowDropDownLine className="text-2xl" />
//             </button>
//             {priceDropdownOpen && (
//               <div className="absolute left-0 mt-2 w-full p-4 bg-white border-2 border-gray-300 rounded-md z-10 shadow-lg">
//                 <div className="flex flex-col gap-2">
//                   <label className="text-sm text-gray-600">Min Price</label>
//                   <input
//                     type="number"
//                     value={minPrice}
//                     onChange={(e) => setMinPrice(e.target.value)}
//                     className="p-2 border-2 border-gray-300 rounded-md focus:outline-none"
//                     placeholder="Min"
//                   />
//                   <label className="text-sm text-gray-600">Max Price</label>
//                   <input
//                     type="number"
//                     value={maxPrice}
//                     onChange={(e) => setMaxPrice(e.target.value)}
//                     className="p-2 border-2 border-gray-300 rounded-md focus:outline-none"
//                     placeholder="Max"
//                   />
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Furnished Status Dropdown */}
//           <div className="w-[200px]  ">
//             <select
//               value={furnishedStatus}
//               onChange={(e) => setFurnishedStatus(e.target.value)}
//               className="w-full p-2  h-16 border-2 border-gray-300 rounded-md focus:outline-none hover:bg-gray-300"
//             >
//               <option value="">Select Furnished </option>
//               <option value="Furnished">Furnished</option>
//               <option value="Semi-Furnished">Semi-Furnished</option>
//               <option value="Unfurnished">Unfurnished</option>
//             </select>
//           </div>

//           {/* BHK Type Dropdown */}
//           <div className="w-[150px] ">
//             <select
//               value={bhkType}
//               onChange={(e) => setBhkType(e.target.value)}
//               className="w-full h-16 p-2 border-2 border-gray-300 rounded-md  focus:outline-none hover:bg-gray-300"
//             >
//               <option value="">Select BHK</option>
//               <option value="Single Room">Single Room</option>
//               <option value="1 RK">1 RK</option>
//               <option value="1 BHK">1 BHK</option>
//               <option value="2 BHK">2 BHK</option>
//               <option value="3 BHK">3 BHK</option>
//               <option value="4+ BHK">4+ BHK</option>
//             </select>
//           </div>

//           {/* Sq. Ft Range Button */}
//           <div className="w-full sm:w-1/2 md:w-auto relative">
//             <button
//               onClick={toggleSquareFtDropdown}
//               className="w-[150px] h-16 p-2 border-2 border-gray-300 rounded-md bg-white flex items-center text-end justify-center gap-2 focus:outline-none hover:bg-gray-300"
//             >
//               <span>sq.Ft</span>
//               <RiArrowDropDownLine className="text-2xl " />
//             </button>
//             {squareFtDropdownOpen && (
//               <div className="absolute right-0 mt-2 p-2 bg-white border-2 border-gray-300 rounded-md z-10">
//                 <label className="text-sm text-gray-600">Min Sq. Ft</label>
//                 <input
//                   type="number"
//                   value={minSquareFt}
//                   onChange={(e) => setMinSquareFt(e.target.value)}
//                   className="w-full p-2 border-2 border-gray-300 rounded-md shadow-md focus:outline-none mb-2"
//                   placeholder="Min"
//                 />
//                 <label className="text-sm text-gray-600">Max Sq. Ft</label>
//                 <input
//                   type="number"
//                   value={maxSquareFt}
//                   onChange={(e) => setMaxSquareFt(e.target.value)}
//                   className="w-full p-2 border-2 border-gray-300 rounded-md shadow-md focus:outline-none"
//                   placeholder="Max"
//                 />
//               </div>
//             )}
//           </div>

//           {/* Apply Filters Button */}
//           <div className="flex justify-center gap-6 ml-10">
//             <div className="flex justify-center">
//               <button
//                 onClick={handleButtonClick}
//                 className="p-2 text-rose-700 border-rose-500 rounded-md hover:bg-gray-300 focus:outline-none"
//               >
//                 {filtersApplied ? "Reset Filters" : "Apply Filter"}
//               </button>
//             </div>
//             <div className="flex justify-center mt-1">
//               <button className="p-2 border-2 w-40 h-12 border-rose-500 rounded-md hover:bg-gray-300 focus:outline-none">
//                 Save Search
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="flex flex-col sm:flex-row-reverse bg-white shadow-md border-white ">
//         {/* Right: Properties */}

//         <div className="flex-1 p-4 shadow-2xl overflow-y-auto h-[650px] sm:max-h-[90vh]  border-white   ">
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
//             {visibleProperties.length > 0 ? (
//               visibleProperties.map((property) => (
//                 <Link
//                   key={property._id}
//                   to={`/propertydetails/${property._id}`}
//                   className="shadow-md rounded-2xl overflow-hidden block no-underline hover:no-underline"
//                 >
//                   {/* Property Image with Featured Tag */}

//                   <div className="relative">
//                     <img
//                       src={property.cover_image}
//                       alt="Property Image"
//                       className="w-full h-48 object-cover rounded-t-2xl"
//                     />

//                     {/* 10 Days Zerobriks Tag (Top Left) */}
//                     <span className="absolute top-2 left-2 bg-gray-800/60 backdrop-blur-sm text-white text-[10px] font-normal py-1 px-2 rounded-full">
//                       10 Days Zerobriks
//                     </span>

//                     {/* Virtual Tour & Heart Icon (Top Right) */}
//                     <div className="absolute top-2 right-2 flex items-center space-x-2">
//                       <span className="bg-gray-800/60 backdrop-blur-sm text-white text-[10px] font-normal py-1 px-2 rounded-full flex items-center gap-1">
//                         <PiCubeFocus className="text-white text-[12px]" />
//                         Virtual Tour
//                       </span>
//                       <button className="bg-gray-800/60 backdrop-blur-sm text-white text-[10px] font-normal bg-opacity-50 rounded-full p-1">
//                         🤍
//                       </button>
//                     </div>

//                     {/* FOR BUY & FEATURED Tags (Bottom of the Image) */}
//                     <div className="absolute bottom-0 left-0">
//                       <span className="bg-[#8B1E3F] text-white text-[10px] px-3 py-1 rounded-se-lg">
//                         FOR BUY
//                       </span>
//                     </div>
//                     <div className="absolute bottom-0 right-0">
//                       <span className="bg-yellow-500 text-white text-[10px] px-3 py-1 rounded-ss-lg">
//                         FEATURED
//                       </span>
//                     </div>

//                     {/* Dots Navigation (Bottom Center) */}
//                     <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
//                       <span className="w-2 h-2 bg-white rounded-full"></span>
//                       <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
//                       <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
//                       <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
//                     </div>
//                   </div>

//                   {/* Property Description */}
//                   <div className="p-1">
//                     {/* Property Name & Share Button */}
//                     <div className="flex justify-between items-center">
//                       <h3 className="text-[17px] font-semibold text-gray-800 truncate">
//                         {property.property_name}
//                       </h3>
//                       <PiShareNetworkLight
//                         className="text-gray-500 bg-white p-2 rounded shadow cursor-pointer"
//                         size={32}
//                       />
//                     </div>

//                     {/* Property Details (Only 3 elements on top) */}
//                     <div className="flex flex-wrap items-center text-gray-700 mt-1 gap-4">
//                       {/* Price */}
//                       <div className="flex items-center gap-1 text-[15.5px] font-semibold">
//                         <FaRupeeSign className="my-text text-[17px]" />
//                         <span>{property.property_price}</span>
//                       </div>

//                       {/* BHK Type */}
//                       {property.bhk_type && (
//                         <div className="flex items-center gap-1">
//                           <MdOutlineBedroomParent className="my-text text-[17px]" />
//                           <p className="m-0 font-semibold">
//                             {property.bhk_type}
//                           </p>
//                         </div>
//                       )}

//                       {/* Area in Sq Ft */}
//                       {property.area_sq && (
//                         <div className="flex items-center gap-1">
//                           <BiArea className="my-text text-[17px]" />
//                           <p className="m-0 font-semibold">
//                             {property.area_sq} sq ft
//                           </p>
//                         </div>
//                       )}
//                     </div>

//                     {/* Furnished/Semi-Furnished - Moved Below */}
//                     {property.furnished_type && (
//                       <div className="flex items-center mt-2">
//                         <FontAwesomeIcon
//                           icon={faChair}
//                           className="mr-1 my-text"
//                         />
//                         <p className="m-0 font-semibold text-black">
//                           {property.furnished_type}
//                         </p>
//                       </div>
//                     )}

//                     {/* Address */}
//                     <p className="text-gray-400 text-[12px] truncate mt-2">
//                       <b>{property.address}</b>
//                     </p>

//                     {/* Description */}
//                     <p className="text-gray-600 text-[12px] truncate mt-2">
//                       {property.property_description}
//                     </p>

//                     {/* Owner Section */}
//                     <div className="flex items-center text-gray-700">
//                       {/* User Icon */}
//                       <div className="bg-blue-100 rounded-full p-1 ml-2">
//                         <AiOutlineUser className="text-gray-600 text-[17px]" />
//                       </div>

//                       {/* Owner Info */}
//                       <div className="flex flex-col ml-3">
//                         <span className="text-[12px] font-semibold">
//                           {property.connect_to_name}
//                         </span>
//                         <span className="text-[12px] text-gray-600">
//                           {property.property_owner_type}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </Link>
//               ))
//             ) : (
//               <div className="text-center text-white">
//                 <p>No properties available at the moment.</p>
//               </div>
//             )}
//           </div>

//           {/* Pagination */}
//           {totalPages > 1 && (
//             <div className="flex justify-center items-center mt-4 gap-2">
//               {/* Previous Button */}
//               <button
//                 onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//                 disabled={currentPage === 1}
//                 className={`w-8 h-8 flex items-center justify-center rounded-full  border-2 border-gray-300  ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
//                   }`}
//               >
//                 <MdOutlineNavigateBefore className="text-xl text-gray-700" />
//               </button>

//               {/* Page Numbers */}
//               {Array.from({ length: totalPages }, (_, i) => (
//                 <button
//                   key={i}
//                   onClick={() => setCurrentPage(i + 1)}
//                   className={`mx-1 px-3 py-1 rounded-full text-sm ${currentPage === i + 1
//                       ? "my-border text-black"
//                       : " text-gray-700"
//                     }`}
//                 >
//                   {i + 1}
//                 </button>
//               ))}

//               {/* Next Button */}
//               <button
//                 onClick={() =>
//                   setCurrentPage((prev) => Math.min(prev + 1, totalPages))
//                 }
//                 disabled={currentPage === totalPages}
//                 className={`w-8 h-8 flex items-center justify-center rounded-full  border-2 border-gray-300  ${currentPage === totalPages
//                     ? "opacity-50 cursor-not-allowed"
//                     : ""
//                   }`}
//               >
//                 <MdOutlineNavigateNext className="text-xl text-gray-700" />
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Left: Map */}
//         <div className="w-[560px] w-1/2 h-[600px] sm:h-[630px] overflow-hidden bg-white rounded-lg shadow-md">
//           {loading ? (
//             <p>Loading properties...</p>
//           ) : (
//             <MapContainer
//               center={
//                 properties.length > 0
//                   ? [properties[0].latitude, properties[0].longitude] // Center the map on the first property
//                   : [18.5204, 73.8567] // Default map center (Pune) when no properties are present
//               } // Default map center (Pune)
//               zoom={12}
//               scrollWheelZoom={false}
//               style={{ width: "100%", height: "100%" }}
//             >
//               <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}" />
//               {properties.map((property, index) => (
//                 <Marker
//                   key={property._id}
//                   position={[property.latitude, property.longitude]}
//                   icon={createCustomIcon(
//                     property.property_price,
//                     property._id === activePropertyId,
//                   )}
//                   eventHandlers={{
//                     click: (e) => {
//                       e.target.openPopup(); // Open the popup when the marker is clicked
//                       fetchPropertyImages(property._id); // Fetch property images for the clicked marker
//                     }, // Open popup on marker click
//                   }}
//                 >
//                   <Popup>
//                     <div className="w-[300px] relative">
//                       {/* Heart Button */}
//                       <button
//                         className="leaflet-popup-heart-button"
//                         onClick={(e) => {
//                           e.stopPropagation(); // Prevent popup from closing
//                           toggleFavorite(property._id); // Call the toggle function
//                         }}
//                       >
//                         {isFavorited ? <FaHeart /> : <FaRegHeart />}
//                       </button>

//                       {/* Slider Implementation */}

//                       <div className="relative">
//                         <img
//                           src={
//                             propertyImages[currentIndex]?.image
//                               ? `${process.env.REACT_APP_API_URL}${propertyImages[currentIndex]?.image}`
//                               : `${property.cover_image}`
//                           }
//                           alt={`Property Image ${currentIndex + 1}`}
//                           style={{ width: "100%", height: "200px" }}
//                         />
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             handlePrev();
//                           }}
//                           className="absolute top-1/2 left-1 transform -translate-y-1/2 bg-white p-1 pe-2 rounded"
//                         >
//                           <b>&#x3008;</b>
//                         </button>
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             handleNext();
//                           }}
//                           className="absolute top-1/2 right-1 transform -translate-y-1/2 bg-white p-1 ps-2 rounded"
//                         >
//                           <b>&#x232A;</b>
//                         </button>
//                       </div>

//                       {/* Property Info */}
//                       <div className="px-2">
//                         <div className="flex items-center justify-between text-lg font-semibold text-black">
//                           {/* Price Information */}
//                           <div className="flex items-center">
//                             <BiRupee className="text-black mr-1 bg-white" />
//                             <span>{property.property_price}</span>
//                           </div>

//                           <Link
//                             key={property._id} // Use the unique property ID
//                             to={`/propertydetails/${property._id}`} // Link to the individual property page
//                             className="border-2 rounded-lg  bg-white overflow-hidden block no-underline hover:no-underline"
//                           >
//                             {/* Info Button */}
//                             <button className="flex items-center text-white rounded-full btn btn-secondary">
//                               <b>
//                                 <AiOutlineInfo />
//                               </b>
//                             </button>
//                           </Link>
//                         </div>
//                         <div className="text-gray-600 text-sm">
//                           <p className="m-0">
//                             <strong>{property.bhk_type}</strong> |{" "}
//                             {property.city_name} | {property.area_sq} sq ft
//                           </p>
//                           <p className="m-0">{property.address}</p>
//                         </div>
//                       </div>
//                     </div>
//                   </Popup>
//                 </Marker>
//               ))}
//             </MapContainer>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };
// export default AllProperty;


import { IoCall } from "react-icons/io5";
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MdApartment } from "react-icons/md";
import { AiOutlineClockCircle } from "react-icons/ai";
import { FaBath, FaUser, FaMapMarkerAlt } from "react-icons/fa";
import { RiRuler2Line } from "react-icons/ri";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { ZbMapLayers, houseMarkerIcon } from "../containers/ZbMapTools";
import axios from "axios";
import { useLocation, Link } from "react-router-dom";
import Slider from "react-slick";
import { toast } from "react-toastify";
import { Heart } from "lucide-react";
import { BiArea } from "react-icons/bi";
import { AiOutlineInfo, AiOutlineUser } from "react-icons/ai";
import { RiArrowDropDownLine } from "react-icons/ri";
import { MdOutlineNavigateBefore, MdOutlineNavigateNext, MdOutlineBedroomParent } from "react-icons/md";
import { FaRupeeSign, FaWhatsapp, FaPhone } from "react-icons/fa";
import { PiCubeFocus } from "react-icons/pi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShareNodes, faChair } from "@fortawesome/free-solid-svg-icons";

import ShareModal from "../containers/ShareModal";
import ContactDetails from "../containers/ContactDetails";
import Login1 from "../auth/Login1";
import SignUp1 from "../auth/SignUp1";

/* ------------------------------------------------------------------ */
/* Constants & helpers                                                 */
/* ------------------------------------------------------------------ */
const PAGE_SIZE = 10;
const DEFAULT_CENTER = [18.5204, 73.8567]; // Pune

const INITIAL_FILTERS = {
  category: "",
  buildingType: "",
  propertyTypes: [],
  bhk: "",
  furnished: "",
  minPrice: "",
  maxPrice: "",
  minArea: "",
  maxArea: "",
  areaIn: "sq.ft",
  postedBy: "",
  construction: [],
  amenities: [],
  bathrooms: "",
  facing: "",
  withPhoto: "",
  withVideo: "",
  availableFor: [],
  availableFrom: [],
  sharingType: [],
  capacity: [],
};

const CATEGORY_API = { "Commercial Buy": "Buy", "Commercial Lease": "Rent" };

const PRICE_OPTIONS = [
  500000, 1000000, 1500000, 2000000, 2500000, 3000000, 3500000, 4000000, 4500000, 5000000,
  5500000, 6000000, 6500000, 7000000, 7500000, 8000000, 8500000, 9000000, 9500000, 10000000,
  12500000, 15000000, 17500000, 20000000, 25000000, 30000000, 40000000, 50000000, 75000000,
  100000000, 150000000, 200000000, 250000000, 300000000, 400000000, 500000000, 600000000,
  700000000, 750000000, 900000000, 1000000000, 1500000000, 2000000000, 2500000000, 3000000000,
  4000000000, 5000000000, 6000000000, 7000000000, 7500000000, 9000000000, 10000000000,
];

const AREA_UNITS = [
  "sq.ft", "sq.yards", "sq.m", "acre", "marla", "cents", "bigha", "kottah", "kanal", "grounds",
  "ares", "biswa", "guntha", "aankadam", "hectares", "rood", "chataks", "perch",
];

const BHK_OPTIONS = [
  "Studio", "1 RK", "1 BHK", "1.5 BHK", "2 BHK", "2.5 BHK", "3 BHK", "3.5 BHK", "4 BHK", "5 BHK", "6+ BHK",
];

const COMMERCIAL_BUY_TYPES = [
  "Ready to move office space", "Bare shell office space", "Ware House", "Factory", "Hotel/Resorts",
  "Others", "Plot/Land", "Cold Storage", "Manufacturing", "Guest-House/Banquet-Halls", "Retail",
];

const FACING_OPTIONS = [
  "North", "East", "North-East", "South-East", "North-West", "West", "South", "South-West",
];

const hasCoords = (p) =>
  p.latitude !== null && p.longitude !== null && !isNaN(parseFloat(p.latitude)) && !isNaN(parseFloat(p.longitude));

// 1,50,000 -> "1.5 L"
const formatAmount = (value) => {
  const n = Number(value);
  if (!n) return value || "N/A";
  if (n >= 10000000) return (n / 10000000).toFixed(1).replace(/\.0$/, "") + " Cr";
  if (n >= 100000) return (n / 100000).toFixed(1).replace(/\.0$/, "") + " L";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + " K";
  return String(n);
};

const formatMarkerPrice = (price) => {
  const n = Number(price);
  if (!price || isNaN(n) || n <= 0) return "On request";
  if (n >= 10000000) return `₹ ${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹ ${(n / 100000).toFixed(2)} L`;
  if (n >= 1000) return `₹ ${(n / 1000).toFixed(2)} K`;
  return `₹ ${n}`;
};

const getListedPrice = (p) => {
  const isRent = p.property_category_type === "Rent";
  const primary = isRent ? p.rent : p.property_price;
  return primary ?? p.property_price ?? p.rent ?? null;
};

const getCategoryText = (type) => {
  const raw = (type || "").replace(/[\s\-/]+/g, " ").trim().toLowerCase();
  if (raw === "buy") return "FOR BUY";
  if (raw === "rent") return "FOR RENT";
  if (raw.includes("commercial buy")) return "COMMERCIAL BUY";
  if (raw.includes("commercial lease")) return "COMMERCIAL LEASE";
  if (raw.includes("pg") || raw.includes("co living") || raw.includes("coliving")) return "PG / CO-LIVING";
  if (raw.includes("residential")) return "RESIDENTIAL";
  return "UNKNOWN";
};

const getPropertyTypeOptions = ({ category, buildingType }) => {
  if (category === "Commercial Lease" && buildingType === "Commercial")
    return ["Office Space", "Retail Shops/Showrooms", "Other Commercial spaces", "Plot/Land"];
  if (category === "Commercial Buy" || buildingType === "Commercial") return COMMERCIAL_BUY_TYPES;
  if (category === "Buy")
    return ["Flat/Apartment", "Home/Villa", "Service Apartment", "Farmhouse", "Plot/Land", "Builder Floor", "1RK/Studio Apartment"];
  if (category === "Rent")
    return ["Flat/Apartment", "Builder Floor", "1RK/Studio Apartment", "Independent House/Villa", "Service Apartment", "Farmhouse"];
  if (category === "PG/Co-living")
    return ["Flat/Apartment", "Builder Floor", "1RK/Studio Apartment", "Independent House/Villa", "Service Apartment"];
  return [
    "Apartment", "Flat/Apartment", "Builder Floor", "Independent House/Villa", "Independent/Builder Floor",
    "1RK/Studio Apartment", "Service Apartment", "Farmhouse", "Office", "Retail", "Plot/Land", "Storage",
    "Industry", "Hospitality", "Other", "Home/Villa",
  ];
};

const getAvailableForOptions = (category) => {
  if (category === "Rent") return ["Family", "Single Women", "Single Men", "Company Guest House"];
  if (category === "PG/Co-living") return ["Boys", "Girls", "Working"];
  return [];
};

// Commercial types -> API fields
const mapCommercialTypes = (selected) => {
  const property_type = [];
  const office_type = [];
  const sub_sub_property_type = [];
  selected.forEach((item) => {
    const val = item.trim();
    if (val === "Plot/Land" || val === "Retail") property_type.push(val);
    else if (val === "Others") sub_sub_property_type.push("Others");
    else office_type.push(val);
  });
  return { property_type, office_type, sub_sub_property_type };
};

const mapCommercialLeaseTypes = (selected) => {
  const property_type = [];
  selected.forEach((type) => {
    if (type === "Office Space") property_type.push("Office");
    else if (type === "Retail Shops/Showrooms") property_type.push("Retail");
    else if (type === "Plot/Land") property_type.push("Plot/Land");
  });
  return { property_type, office_type: [], sub_sub_property_type: [] };
};

const mapPropertyTypes = (f) => {
  if (f.category === "Commercial Lease" && f.buildingType === "Commercial")
    return mapCommercialLeaseTypes(f.propertyTypes);
  if (f.category === "Commercial Buy") return mapCommercialTypes(f.propertyTypes);
  return { property_type: f.propertyTypes, office_type: [], sub_sub_property_type: [] };
};

// One place that turns filter state into API params (used by list + save search)
const buildFilterFormData = ({ filters: f, label, accessToken, page, forSave = false }) => {
  const fd = new FormData();
  const add = (key, value) => {
    if (value === "" || value == null || (Array.isArray(value) && value.length === 0)) return;
    fd.append(key, Array.isArray(value) ? value.join(",") : value);
  };

  if (forSave) {
    add("user_id", accessToken);
  } else {
    add("customer_id", accessToken);
    add("page", page);
    add("page_size", PAGE_SIZE);
  }
  add("property_listed_by", label);
  add("search_keyword", "");

  if (!forSave) {
    add("building_type", f.buildingType);
    add("property_category_type", CATEGORY_API[f.category] || f.category);
  }

  const mapped = mapPropertyTypes(f);
  add("property_type", mapped.property_type);
  add("office_type", mapped.office_type);
  add("sub_sub_property_type", mapped.sub_sub_property_type);

  add("bhk_type", f.bhk);
  add("furnished_type", f.furnished);
  add("min_price", f.minPrice);
  add("max_price", f.maxPrice);
  add("min_area", f.minArea);
  add("max_area", f.maxArea);
  if (forSave || f.minArea || f.maxArea) add("area_in", f.areaIn);
  add("user_type", f.postedBy);
  add("construction_status", f.construction);
  add("amenities", f.amenities);
  add(forSave ? "no_of_bathrooms" : "number_of_minimum_bathrooms", f.bathrooms);
  add("facing", f.facing);
  add("with_photo", f.withPhoto);
  add("with_videos", f.withVideo);
  add("available_for", f.availableFor);
  add("sharing_type", f.sharingType);
  add("available_from", f.availableFrom);
  add("available_beds", f.capacity.map((c) => c.replace(" guest", "")));
  return fd;
};

const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;left:-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    toast.success("Link copied!");
  } catch {
    toast.error("Copy failed");
  }
};

/* ------------------------------------------------------------------ */
/* Map helpers                                                         */
/* ------------------------------------------------------------------ */
// Flies the map to a point whenever a card is hovered
const userLocation = JSON.parse(sessionStorage.getItem("userLocation"));

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// One-line subtitle such as "2 BHK Flat for Sale in Mayur Colony, Pune"
function getPropertySubtitle(property) {
  const area = property.address_area || "";
  const city = property.city_name || "";
  const location = area.toLowerCase().includes(city.toLowerCase())
    ? area
    : `${area}, ${city}`;

  const type =
    property.property_type === "Office"
      ? "Office Space"
      : property.property_type === "Retail"
        ? "Retail Space"
        : property.property_type || "";

  const category = property.property_category_type || "";

  if (category === "Commercial Buy" || category === "Commercial Lease") {
    return `${type} for ${category === "Commercial Buy" ? "Sale" : "Lease"} in ${location}`;
  }
  if (category.includes("PG") || category.includes("Co-Living") || category.includes("Coliving")) {
    return `${type} for Rent in ${location}`;
  }
  const action = category === "Buy" ? "Sale" : category;
  return `${property.bhk_type} ${type} for ${action} in ${location}`;
}

const MapPanner = ({ target }) => {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), 12), { duration: 0.8 });
  }, [target, map]);
  return null;
};

// Re-frames the map when the visible set of properties changes (new page / filters)
const MapFitter = ({ points }) => {
  const map = useMap();
  const key = points.map((p) => p.join(",")).join("|");
  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) map.setView(points[0], Math.max(map.getZoom(), 12));
    else map.fitBounds(points, { padding: [40, 40], maxZoom: 14 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);
  return null;
};

// Preview card shown on marker hover
const MarkerPopup = ({ p, onFavorite, onEnter, onLeave }) => {
  const images = useMemo(
    () => [p.cover_image, ...(p.property_images || []).map((i) => i.image)].filter(Boolean),
    [p.cover_image, p.property_images],
  );
  const [idx, setIdx] = useState(0);
  const count = images.length || 1;
  const src = images[idx % count] || p.cover_image;

  const step = (e, dir) => {
    e.stopPropagation();
    setIdx((i) => (i + dir + count) % count);
  };

  const isRent = p.property_category_type === "Rent";
  const duration = isRent && p.rent_duration && p.rent_duration !== "N/A" ? ` / ${p.rent_duration}` : "";
  const specs = [p.bhk_type, p.city_name, p.area_sq ? `${p.area_sq} sq ft` : null].filter(Boolean);

  return (
    <div
      onClick={(e) => {
        if (e.target.closest("a, button, svg, input, select, textarea, label")) return;
        const link = e.currentTarget.querySelector('a[href^="/propertydetails/"]');
        if (link) link.click();
      }} className="cursor-pointer w-[240px] sm:w-[280px] bg-white" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <div className="relative h-[170px] bg-slate-900">
        <img src={src} alt={p.property_name || "Property"} loading="lazy" className="w-full h-full object-cover" />

        <button
          type="button"
          aria-label={p.is_favorite ? "Remove from favourites" : "Add to favourites"}
          onClick={(e) => {
            e.stopPropagation();
            onFavorite(p);
          }}
          className="absolute z-10 top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-white/90 shadow hover:bg-white"
        >
          <Heart
            size={16}
            color={p.is_favorite ? "#e11d48" : "#7a1235"}
            fill={p.is_favorite ? "#e11d48" : "transparent"}
            strokeWidth={2}
          />
        </button>

        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={(e) => step(e, -1)}
              className="absolute top-1/2 left-1.5 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-white/90 hover:bg-white text-[12px]"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={(e) => step(e, 1)}
              className="absolute top-1/2 right-1.5 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-white/90 hover:bg-white text-[12px]"
            >
              ›
            </button>
          </>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-baseline gap-0.5 text-[13.5px] font-bold text-[#7a1235]">
            <FaRupeeSign className="text-[10px] self-center" />
            {formatAmount(getListedPrice(p))}
            {duration && <span className="text-[9px] font-medium text-gray-500">{duration}</span>}
          </span>
          <Link
            to={`/propertydetails/${p._id}`}
            aria-label="View details"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-[#7a1235] text-white hover:bg-[#5e0d28]"
          >
            <AiOutlineInfo />
          </Link>
        </div>

        <div className="mt-1 text-[10px] font-semibold text-gray-800 truncate">{p.property_name}</div>
        {specs.length > 0 && <div className="text-[9.5px] text-gray-600 truncate">{specs.join(" | ")}</div>}
        <div className="text-[9.5px] text-gray-500 truncate">{p.address_area || p.address || "No Address Provided"}</div>
      </div>
    </div>
  );
};

// Marker: hover opens the preview card; it stays open while the cursor is on it
const PropertyMarker = memo(function PropertyMarker({ property: p, active, onHover, onLeave, onFavorite }) {
  const markerRef = useRef(null);
  const closeTimer = useRef(null);
  const openedAt = useRef(0);
  const price = getListedPrice(p);

  const icon = useMemo(() => houseMarkerIcon(active), [active]);

  const openCard = () => {
    clearTimeout(closeTimer.current);
    openedAt.current = Date.now();
    markerRef.current?.openPopup();
  };
  const scheduleClose = () => {
    clearTimeout(closeTimer.current);
    // The map auto-pans to fit the popup; give the pan time to finish before closing
    const panGuard = Math.max(0, 900 - (Date.now() - openedAt.current));
    closeTimer.current = setTimeout(() => markerRef.current?.closePopup(), Math.max(150, panGuard));
  };
  const keepOpen = () => clearTimeout(closeTimer.current);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  return (
    <Marker
      ref={markerRef}
      position={[parseFloat(p.latitude), parseFloat(p.longitude)]}
      icon={icon}
      zIndexOffset={active ? 1000 : 0}
      eventHandlers={{
        mouseover: () => {
          onHover(p._id);
          openCard();
        },
        mouseout: () => {
          onLeave();
          scheduleClose();
        },
      }}
    >
      <Popup
        className="zb-popup"
        minWidth={240}
        maxWidth={280}
        autoPan
        autoPanPaddingTopLeft={[12, 12]}
        autoPanPaddingBottomRight={[12, 12]}
        keepInView={false}
      >
        <MarkerPopup p={p} onFavorite={onFavorite} onEnter={keepOpen} onLeave={scheduleClose} />
      </Popup>
    </Marker>
  );
});

/* ------------------------------------------------------------------ */
/* Filter controls                                                     */
/* ------------------------------------------------------------------ */
const FIELD =
  "w-full h-8 px-2 text-xs border border-gray-300 rounded-lg bg-white hover:border-[#8B1E3F] focus:outline-none focus:ring-1 focus:ring-[#8B1E3F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

const SelectField = ({ value, onChange, placeholder, options, onFocus, disabled }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} onFocus={onFocus} disabled={disabled} className={FIELD}>
    <option value="">{placeholder}</option>
    {options.map((o) => (
      <option key={o.value ?? o} value={o.value ?? o}>
        {o.label ?? o}
      </option>
    ))}
  </select>
);

// Button + floating panel. `children` is the panel body.
const DropdownShell = ({ id, openId, onToggle, label, children }) => (
  <div className="relative" data-dd>
    <button
      type="button"
      onClick={() => onToggle(id)}
      className="flex items-center justify-between w-full h-8 px-2 text-xs bg-white border border-gray-300 rounded-lg hover:border-[#8B1E3F] focus:outline-none focus:ring-1 focus:ring-[#8B1E3F] transition-colors"
    >
      <span className="truncate text-gray-700">{label}</span>
      <RiArrowDropDownLine className="text-lg text-gray-500" />
    </button>
    {openId === id && (
      <div className="absolute left-0 right-0 z-[999] mt-1 bg-white border border-gray-200 rounded-lg shadow-xl">
        {children}
      </div>
    )}
  </div>
);

const MultiSelect = ({ id, openId, onToggle, placeholder, countLabel = "selected", options, selected, onChange, single, onClear }) => (
  <DropdownShell
    id={id}
    openId={openId}
    onToggle={onToggle}
    label={selected.length > 0 ? `${selected.length} ${countLabel}` : placeholder}
  >
    <div className="max-h-52 overflow-y-auto">
      {options.map((opt) => {
        const value = opt.value ?? opt;
        const text = opt.label ?? opt;
        return (
          <label key={value} className="flex items-center gap-2 px-3 py-2 hover:bg-[#8B1E3F]/5 cursor-pointer text-sm transition-colors">
            <input
              type={single ? "radio" : "checkbox"}
              checked={selected.includes(value)}
              onChange={() => onChange(value)}
              className="accent-[#8B1E3F]"
            />
            <span>{text}</span>
          </label>
        );
      })}
    </div>
    <div className="flex gap-2 p-2 border-t sticky bottom-0 bg-white">
      {onClear && (
        <button type="button" onClick={onClear} className="flex-1 py-1.5 text-xs border rounded-md hover:bg-gray-50">
          Clear
        </button>
      )}
      <button
        type="button"
        onClick={() => onToggle(null)}
        className="flex-1 py-1.5 text-xs text-white bg-[#8B1E3F] rounded-md hover:bg-[#7a1a37]"
      >
        Done
      </button>
    </div>
  </DropdownShell>
);

/* ------------------------------------------------------------------ */
/* Property card                                                       */
/* ------------------------------------------------------------------ */
const PropertyCard = memo(function PropertyCard({
  property,
  isHovered,
  activeIndex,
  onSlide,
  onEnter,
  onLeave,
  onFavorite,
  onShare,
  onContact,
}) {
  const total = 1 + (property.property_images?.length || 0);
  const active = activeIndex % total;
  const isRent = property.property_category_type === "Rent";

  const cardImages = [property.cover_image, ...(property.property_images || []).map((i) => i.image)].filter(Boolean);
  const cardSlide = activeIndex;
  const cardActive = cardSlide % (cardImages.length || 1);
  const cardCat = property.property_category_type || "";
  const cardRent = cardCat === "Rent";
  const cardBuy = cardCat.includes("Buy");
  const cardPG = cardCat.includes("PG");
  const cardCommercial = property.building_type === "Commercial";
  const cardSubtitle = getPropertySubtitle(property);
  const cardDistance =
    userLocation && property.latitude && property.longitude
      ? calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          parseFloat(property.latitude),
          parseFloat(property.longitude),
        ).toFixed(1)
      : null;
  const cardDetailsPath = `/propertydetails/${property._id}`;
  const cardWa = encodeURIComponent("Hello, I am interested in your property");
  return (
    <div
      onClick={(e) => {
        if (e.target.closest("a, button, svg, input, select, textarea, label")) return;
        const link = e.currentTarget.querySelector('a[href^="/propertydetails/"]');
        if (link) link.click();
      }}
      className={`cursor-pointer zb-card group flex flex-col h-full bg-white shadow-lg rounded-2xl overflow-hidden transition-all duration-300 ${isHovered ? "ring-2 ring-[#7a1235] -translate-y-0.5" : "hover:-translate-y-0.5"}`}
      onMouseEnter={() => onEnter(property)}
      onMouseLeave={onLeave}
    >
      {/* Image */}
      <div className="relative w-full">
        <Link to={cardDetailsPath} className="block">
          {cardImages.length > 1 ? (
            <Slider
              dots={false}
              arrows={false}
              infinite
              speed={600}
              slidesToShow={1}
              slidesToScroll={1}
              autoplay
              autoplaySpeed={2800}
              initialSlide={cardSlide}
              beforeChange={(_, next) => onSlide(property._id, next)}
            >
              {cardImages.map((src, i) => (
                <div key={`property._id-${i}`}>
                  <img src={src} alt={property.property_name || "Property"} loading="lazy" className="object-cover w-full h-[110px] rounded-t-2xl" />
                </div>
              ))}
            </Slider>
          ) : (
            <img
              src={cardImages[0] || "/image/app.png"}
              alt={property.property_name || "Property"}
              loading="lazy"
              className="object-cover w-full h-[110px] rounded-t-2xl"
            />
          )}
        </Link>

        {property.admin_approval === "Approved" && (
          <div className="absolute top-2 left-2 z-20 pointer-events-none">
            <div className="flex items-center gap-1 bg-[#8B1E3F] text-white rounded-sm shadow-md px-2 py-1">
              <span className="text-[10px] font-bold">✓</span>
              <span className="text-[9.5px] font-semibold leading-none">Verified</span>
            </div>
          </div>
        )}

        <div className="absolute z-20 flex items-center space-x-2 top-2 right-2">
          {property.virtual_tour_availability === "Yes" && (
            <span className="flex items-center gap-1 px-2 py-1 text-[9px] font-normal text-white rounded-full pointer-events-none bg-gray-800/60 backdrop-blur-sm sm:text-[10px]">
              <PiCubeFocus className="text-[12px] text-white" />
              Virtual Tour
            </span>
          )}
          <button
            type="button"
            className="p-2 rounded-full shadow bg-gray-800/60 backdrop-blur-sm"
            onClick={(e) => {
              e.preventDefault();
              onFavorite(property);
            }}
          >
            <Heart
              size={18}
              stroke={property.is_favorite ? "none" : "white"}
              color={property.is_favorite ? "red" : "rgba(75, 85, 99, 0.4)"}
              fill={property.is_favorite ? "red" : "rgba(75, 85, 99, 0.4)"}
              strokeWidth={2}
            />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 z-20 max-w-[70%] pointer-events-none">
          <span className="block px-2 sm:px-3 py-1 text-[9px] sm:text-[10px] font-semibold text-white truncate bg-[#8B1E3F] rounded-se-lg">
            {getCategoryText(cardCat)}
          </span>
        </div>

        {property.mark_as_featured === "Yes" && (
          <div className="absolute bottom-0 right-0 z-20 pointer-events-none">
            <span className="px-2 py-1 text-[9px] sm:text-[10px] sm:px-3 text-white bg-yellow-500 rounded-ss-lg">
              FEATURED
            </span>
          </div>
        )}

        {cardImages.length > 1 && (
          <div className="absolute z-10 flex gap-1 pointer-events-none bottom-2 left-1/2 -translate-x-1/2">
            {cardImages.map((_, i) => (
              <span
                key={i}
                className="h-1 rounded-full transition-all duration-300"
                style={{
                  width: i === cardActive ? "12px" : "5px",
                  background: i === cardActive ? "#e3b23c" : "rgba(255,255,255,0.6)",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Details (all on the same card) */}
      <div className="flex flex-col justify-between flex-1 px-3 py-2.5 text-black bg-white sm:px-3.5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <Link to={cardDetailsPath} className="flex-1 min-w-0 no-underline hover:no-underline">
              <h3
                className="m-0 text-[12px] font-semibold leading-5 text-gray-900 truncate hover:text-[#7a1235] transition-colors sm:text-[13.5px]"
                title={property.property_name}
              >
                {property.property_name || "N/A"}
              </h3>
            </Link>
            <span
              className="flex-shrink-0 m-0 text-[9.5px] font-medium leading-5 text-black sm:text-[10px] whitespace-nowrap"
              title={property.furnished_type}
            >
              {property.furnished_type}
            </span>
          </div>

          <p className="mt-0 mb-0.5 text-[10px] leading-4 text-gray-600 line-clamp-2 sm:truncate" title={cardSubtitle}>
            {cardSubtitle}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-0.5 text-[15.5px] font-bold sm:text-[17px] text-[#7a1235]">
                <FaRupeeSign className="text-[12px]" />
                {formatAmount(cardRent ? property.rent : property.property_price)}
              </span>
              {cardRent && property.rent_duration && property.rent_duration !== "N/A" && (
                <span className="text-[10px] text-gray-500">/ {property.rent_duration}</span>
              )}
              {cardBuy && property.possession_status === "Ready To Move" && (
                <div className="flex items-center gap-1 px-2 py-0.5 text-white border rounded-full bg-[#8B1E3F] border-[#8B1E3F]">
                  <MdApartment className="text-[12px] text-white" />
                  <span className="text-[9.5px] font-semibold text-white whitespace-nowrap">Ready to Move</span>
                </div>
              )}
            </div>
            <div className="text-[9.5px] sm:text-[10px] font-medium whitespace-nowrap">
              {cardRent && (
                <>
                  <span className="text-gray-500">Deposit:</span>
                  <span className="ml-1 font-semibold">₹ {property.custom_deposit_amount?.toLocaleString("en-IN")}</span>
                </>
              )}
              {cardBuy && property.possession_status !== "Ready To Move" && property.possession_date && (
                <>
                  <span className="text-gray-500">Possession:</span>
                  <span className="ml-1 font-semibold">
                    {new Date(property.possession_date).toLocaleDateString("en-IN")}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 py-2 border-t border-b border-gray-100">
            <div className="flex items-center gap-2 px-1 min-w-0 sm:px-3">
              <MdApartment className="text-[13px] sm:text-[15.5px] text-gray-700 flex-shrink-0" />
              <div className="flex flex-col justify-center min-w-0">
                <p className="m-0 text-[9.5px] font-semibold leading-4 truncate sm:text-[10px]">
                  {cardCommercial
                    ? property.property_type === "Office"
                      ? "Office Space"
                      : property.property_type === "Retail"
                        ? "Retail Space"
                        : property.property_type
                    : cardPG
                      ? `${property.bathroom || 0} Bathrooms`
                      : property.bhk_type}
                </p>
                <p className="m-0 text-[9px] sm:text-[10px] leading-4 text-gray-500 truncate">
                  {cardCommercial ? "Property Type" : cardPG ? "Bathrooms" : property.property_type}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-1 border-l border-gray-200 min-w-0 sm:px-3">
              {cardPG ? (
                <FaUser className="text-[12px] sm:text-[13.5px] text-gray-700 flex-shrink-0" />
              ) : (
                <FaBath className="text-[12px] sm:text-[13.5px] text-gray-700 flex-shrink-0" />
              )}
              <div className="flex flex-col justify-center min-w-0">
                <p className="m-0 text-[9.5px] font-semibold leading-4 truncate sm:text-[10px]">
                  {cardPG ? property.available_for : `${property.bathroom || 0} Baths`}
                </p>
                <p className="m-0 text-[9px] sm:text-[10px] leading-4 text-gray-500 truncate">
                  {cardPG ? "Available For" : "Bathrooms"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-1 border-l border-gray-200 min-w-0 sm:px-3">
              <RiRuler2Line className="text-[13px] sm:text-[15.5px] text-gray-700 flex-shrink-0" />
              <div className="flex flex-col justify-center min-w-0">
                <p className="m-0 text-[9.5px] font-semibold leading-4 truncate sm:text-[10px]">
                  {property.area} {property.area_in}
                </p>
                <p className="m-0 text-[9px] sm:text-[10px] leading-4 text-gray-500 truncate">Built Up Area</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 pb-1 text-[9.5px] sm:text-[10px] text-gray-600">
            <div className="flex items-center flex-wrap min-w-0 gap-x-1">
              <div className="flex items-center min-w-0">
                <AiOutlineClockCircle className="mr-1 text-[13px] text-gray-700 flex-shrink-0" />
                <span className="truncate">Posted by {property.user_type || "Owner"}</span>
              </div>
              <span className="mx-1 text-gray-400 sm:mx-2">•</span>
              <span className="whitespace-nowrap">
                {property.days_since_created ? `${property.days_since_created} days ago` : "Recently"}
              </span>
              {cardDistance && (
                <>
                  <span className="mx-1 text-gray-400 sm:mx-2">•</span>
                  <div className="flex items-center whitespace-nowrap">
                    <FaMapMarkerAlt className="mr-1 text-red-500" />
                    {cardDistance} km from you
                  </div>
                </>
              )}
            </div>
            <button
              type="button"
              aria-label="Share property"
              className="ml-2 p-1 text-gray-500 hover:text-[#7a1235] transition-colors flex-shrink-0"
              onClick={() => onShare(property._id)}
            >
              <FontAwesomeIcon icon={faShareNodes} className="text-[13px]" />
            </button>
          </div>

          <div className="flex items-center pt-2">
            <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 overflow-hidden rounded-full bg-blue-100 sm:w-9 sm:h-9">
              {property.property_owner_image && !property.property_owner_image.includes("default_profile") ? (
                <img
                  src={`${process.env.REACT_APP_API_URL}/media/${property.property_owner_image}`}
                  alt={property.connect_to_name || "Owner"}
                  loading="lazy"
                  className="object-cover w-full h-full rounded-full"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <AiOutlineUser className="text-[17px] text-blue-600" />
              )}
            </div>
            <div className="flex items-center min-w-0 ml-3 sm:ml-4">
              <span className="text-[12px] font-semibold text-gray-900 truncate whitespace-nowrap" title={property.connect_to_name}>
                {property.connect_to_name || "Owner"}
              </span>
              <div className="w-px h-4 mx-3 bg-gray-300 sm:mx-4"></div>
              <span className="text-[12px] text-gray-500 whitespace-nowrap">{property.user_type || "Owner"}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5 pt-2 mt-2">
          <button
            type="button"
            className="flex items-center justify-center h-8 text-[9.5px] font-semibold text-white rounded-lg bg-[#7a1235] hover:bg-[#5e0d28] active:scale-95 transition-all"
            onClick={() => onContact(property)}
          >
            Contact
          </button>
          <a
            href={`https://wa.me/91${property.connect_to_no}?text=${cardWa}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-1 h-8 text-[9.5px] font-semibold text-white rounded-lg bg-[#25D366] hover:brightness-110 active:scale-95 transition-all"
          >
            <FaWhatsapp className="text-[12px]" />
            WhatsApp
          </a>
         <a
  href={`tel:${property.connect_to_no}`}
  onClick={(e) => e.stopPropagation()}
  className="flex items-center justify-center gap-1 h-8 text-[9.5px] font-semibold text-[#7a1235] rounded-lg border border-[#7a1235] bg-white hover:bg-[#7a1235]  active:scale-95 transition-all"
>
  <IoCall className="text-xs" />
  Call
</a>
        </div>
      </div>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
const AllProperty = () => {
  const location = useLocation();
  const label = new URLSearchParams(location.search).get("label");
  const accessToken = sessionStorage.getItem("accessToken");

  // data
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [amenitiesList, setAmenitiesList] = useState([]);

  // filters
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  // card <-> map
  const [hoveredId, setHoveredId] = useState(null);
  const [panTarget, setPanTarget] = useState(null);
  const [activeIndexes, setActiveIndexes] = useState({});

  // modals / contact
  const [shareUrl, setShareUrl] = useState("");
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [freeViewCount, setFreeViewCount] = useState(0);
  const [paidViewCount, setPaidViewCount] = useState(0);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  const isCommercial = filters.category === "Commercial Buy" || filters.category === "Commercial Lease";

  /* ---------- filter updates (always go back to page 1) ---------- */
  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const toggleIn = useCallback((key, value, single = false) => {
    setFilters((prev) => {
      const list = prev[key];
      if (single) return { ...prev, [key]: [value] };
      return { ...prev, [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] };
    });
    setCurrentPage(1);
  }, []);

  const changeCategory = (val) => {
    setFilters((prev) => ({
      ...prev,
      category: val,
      propertyTypes: [],
      buildingType: val === "Commercial Buy" || val === "Commercial Lease" ? "Commercial" : "",
    }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setOpenDropdown(null);
    setCurrentPage(1);
  };

  const toggleDropdown = useCallback((name) => setOpenDropdown((prev) => (name === null || prev === name ? null : name)), []);

  const stepBathrooms = (delta) => {
    const next = Math.min(20, Math.max(0, (parseInt(filters.bathrooms) || 0) + delta));
    setFilter("bathrooms", next === 0 ? "" : String(next));
  };

  /* ---------- effects ---------- */
  useEffect(() => {
    axios
      .post(`${API_BASE_URL}/cust_api/get_amenities`, new FormData())
      .then((res) => res.data.status === 1 && setAmenitiesList(res.data.data))
      .catch(() => {});
  }, []);

  // New label (route change) -> start over
  useEffect(() => {
    setFilters(INITIAL_FILTERS);
    setCurrentPage(1);
    setLoading(true);
  }, [label]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (!e.target.closest("[data-dd]")) setOpenDropdown(null);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // Fetch whenever label / page / any filter changes (debounced, stale responses ignored)
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/cust_api/filter_property`,
          buildFilterFormData({ filters, label, accessToken, page: currentPage }),
          { headers: { "Content-Type": "multipart/form-data" } },
        );
        if (cancelled) return;
        if (response.status === 200 && response.data.status === 1) {
          setProperties(response.data.data);
          setTotalPages(response.data.total_pages || 1);
          setError(null);
        } else {
          setProperties([]);
          setTotalPages(0);
          setError("No properties available");
        }
      } catch {
        if (cancelled) return;
        setProperties([]);
        setTotalPages(0);
        setError("Failed to load properties.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [filters, label, currentPage, accessToken, refreshKey]);

  /* ---------- contact limits ---------- */
  const checkPostLimits = useCallback(async () => {
    if (!accessToken) return;
    try {
      const form = new FormData();
      form.append("user_id", accessToken);
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/cust_api/get_profile`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const counts = res?.data?.count_data;
      if (counts) {
        setFreeViewCount(counts.free_view_count || 0);
        setPaidViewCount(counts.paid_view_count || 0);
      }
    } catch (e) {
      console.error("Error checking post limits:", e);
    }
  }, [accessToken]);

  useEffect(() => {
    checkPostLimits();
  }, [checkPostLimits]);

  const handleAddCount = async () => {
    try {
      const form = new FormData();
      form.append(freeViewCount > 0 ? "free_view_count" : "paid_view_count", -1);
      form.append("user_id", accessToken);
      const res = await fetch(`${process.env.REACT_APP_API_URL}/cust_api/add_count`, { method: "POST", body: form });
      if (res.ok) checkPostLimits();
    } catch (e) {
      console.error("API error:", e);
    }
  };

  const handleContactClick = async (property) => {
    if (!accessToken) {
      setIsLoginOpen(true);
      return;
    }
    setSelectedProperty(property);
    if (freeViewCount > 0 || paidViewCount > 0) {
      await handleAddCount();
      setShowUpgradePrompt(false);
    } else {
      setShowUpgradePrompt(true);
    }
    setIsContactOpen(true);
  };

  /* ---------- favourites ---------- */
  const handleFavorite = useCallback(
    async (property) => {
      if (!accessToken) {
        setIsLoginOpen(true);
        return;
      }
      try {
        if (property.is_favorite) {
          const form = new FormData();
          form.append("favorite_id", property.favorite_id);
          const res = await axios.delete(`${process.env.REACT_APP_API_URL}/cust_api/remove_from_favorite`, { data: form });
          if (res.data.status === 1) setRefreshKey((k) => k + 1);
        } else {
          await axios.post(`${process.env.REACT_APP_API_URL}/cust_api/add_to_favorite`, {
            user_id: accessToken,
            property_id: property._id,
          });
          setRefreshKey((k) => k + 1);
        }
      } catch (e) {
        toast.error("Failed to update favourites. Please try again.");
      }
    },
    [accessToken],
  );

  /* ---------- save search ---------- */
  const handleSaveSearch = async () => {
    if (!accessToken) {
      toast.error("Please login first to save search.");
      setIsLoginOpen(true);
      return;
    }
    try {
      const form = buildFilterFormData({ filters, label, accessToken, forSave: true });
      form.append("property_id", properties.map((p) => p._id || "").join("|"));
      form.append("property_name", properties.map((p) => p.property_name || "").join("|"));
      form.append("property_category_type", properties.map((p) => p.property_category_type || "").join("|"));
      form.append("building_type", properties.map((p) => p.building_type || "").join("|"));

      const response = await fetch(`${process.env.REACT_APP_API_URL}/cust_api/add_save_search_property`, {
        method: "POST",
        body: form,
      });
      const result = await response.json();
      if (response.ok && result.status === 1) toast.success("Search saved successfully!");
      else toast.error(result.message || "Failed to save search.");
    } catch (e) {
      console.error("Save Search Error:", e);
      toast.error("Something went wrong.");
    }
  };

  /* ---------- card <-> map ---------- */
  const handleCardEnter = useCallback((property) => {
    setHoveredId(property._id);
    if (hasCoords(property)) {
      // new object each time so the map flies even when re-hovering the same card
      setPanTarget({ lat: parseFloat(property.latitude), lng: parseFloat(property.longitude) });
    }
  }, []);
  const handleLeave = useCallback(() => setHoveredId(null), []);
  const handleSlide = useCallback((id, idx) => setActiveIndexes((prev) => ({ ...prev, [id]: idx })), []);
  const handleShare = useCallback((id) => {
    setShareUrl(`${window.location.origin}/propertydetails/${id}`);
    setIsShareOpen(true);
  }, []);

  /* ---------- derived ---------- */
  const mappable = useMemo(() => properties.filter(hasCoords), [properties]);
  const mapPoints = useMemo(
    () => mappable.map((p) => [parseFloat(p.latitude), parseFloat(p.longitude)]),
    [mappable],
  );

  const paginationRange = useMemo(() => {
    const groupSize = 3;
    const start = Math.floor((currentPage - 1) / groupSize) * groupSize + 1;
    const end = Math.min(start + groupSize - 1, totalPages);
    const range = [];
    for (let i = start; i <= end; i++) range.push(i);
    if (end < totalPages) range.push("...", totalPages);
    return range;
  }, [currentPage, totalPages]);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const propertyTypeOptions = getPropertyTypeOptions(filters);
  const availableForOptions = getAvailableForOptions(filters.category);
  const budgetLabel =
    filters.minPrice && filters.maxPrice
      ? `${formatAmount(filters.minPrice)} - ${formatAmount(filters.maxPrice)}`
      : filters.minPrice
        ? `Above ${formatAmount(filters.minPrice)}`
        : filters.maxPrice
          ? `Below ${formatAmount(filters.maxPrice)}`
          : "Budget";
  const areaLabel =
    filters.minArea || filters.maxArea
      ? `${filters.minArea || 0} - ${filters.maxArea || "Any"} ${filters.areaIn}`
      : "Area";
  const closeDropdowns = () => setOpenDropdown(null);

  return (
    <>
      {/* ===================== FILTERS ===================== */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm relative z-20 mb-4">
        <div className="p-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-1.5">
            <SelectField
              value={filters.category}
              onChange={changeCategory}
              onFocus={closeDropdowns}
              placeholder="All Categories"
              options={[
                { value: "Buy", label: "Buy" },
                { value: "Rent", label: "Rent" },
                { value: "Commercial Buy", label: "Commercial Buy" },
                { value: "Commercial Lease", label: "Commercial Lease" },
                { value: "PG/Co-living", label: "PG / Co-living" },
              ]}
            />

            <SelectField
              value={filters.buildingType}
              onChange={(v) => setFilter("buildingType", v)}
              onFocus={closeDropdowns}
              disabled={isCommercial}
              placeholder="Building Type"
              options={["Residential", "Commercial"]}
            />

            <MultiSelect
              id="propertyType"
              openId={openDropdown}
              onToggle={toggleDropdown}
              placeholder="Property Type"
              options={propertyTypeOptions}
              selected={filters.propertyTypes}
              single={filters.category === "Commercial Lease" && filters.buildingType === "Commercial"}
              onChange={(v) =>
                toggleIn("propertyTypes", v, filters.category === "Commercial Lease" && filters.buildingType === "Commercial")
              }
              onClear={() => setFilter("propertyTypes", [])}
            />

            {/* Budget */}
            <DropdownShell id="budget" openId={openDropdown} onToggle={toggleDropdown} label={budgetLabel}>
              <div className="p-3 space-y-2">
                {[
                  { key: "minPrice", text: "Min Price", ph: "Min", ok: (p) => !filters.maxPrice || p < filters.maxPrice },
                  { key: "maxPrice", text: "Max Price", ph: "Max", ok: (p) => !filters.minPrice || p > filters.minPrice },
                ].map(({ key, text, ph, ok }) => (
                  <div key={key}>
                    <label className="text-xs text-gray-500 mb-1 block">{text}</label>
                    <select
                      value={filters[key]}
                      onChange={(e) => setFilter(key, e.target.value)}
                      className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#8B1E3F]"
                    >
                      <option value="">{ph}</option>
                      {PRICE_OPTIONS.filter(ok).map((price) => (
                        <option key={price} value={price}>
                          {formatAmount(price)}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </DropdownShell>

            <SelectField
              value={filters.bhk}
              onChange={(v) => setFilter("bhk", v)}
              onFocus={closeDropdowns}
              placeholder="BHK"
              options={BHK_OPTIONS}
            />

            <button
              type="button"
              onClick={() => {
                setShowMoreFilters((s) => !s);
                closeDropdowns();
              }}
              className={`flex items-center justify-center gap-1 w-full h-8 px-2 text-xs font-medium rounded-lg border transition-all ${
                showMoreFilters
                  ? "bg-[#8B1E3F] text-white border-[#8B1E3F]"
                  : "bg-white text-gray-700 border-gray-300 hover:border-[#8B1E3F] hover:text-[#8B1E3F]"
              }`}
            >
              <span>More Filters</span>
              <RiArrowDropDownLine className={`text-lg transition-transform ${showMoreFilters ? "rotate-180" : ""}`} />
            </button>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={resetFilters}
                className="h-8 flex-1 px-2 text-xs font-medium text-[#8B1E3F] border border-[#8B1E3F] rounded-lg hover:bg-[#8B1E3F]/5 transition-colors"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleSaveSearch}
                className="h-8 flex-1 px-2 text-xs font-medium text-white bg-[#8B1E3F] rounded-lg hover:bg-[#7a1a37] transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        {/* More filters */}
        {showMoreFilters && (
          <div className="border-t border-gray-200 bg-gray-50/70 p-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
              <SelectField
                value={filters.furnished}
                onChange={(v) => setFilter("furnished", v)}
                onFocus={closeDropdowns}
                placeholder="Furnished"
                options={["Furnished", "Semi-Furnished", "Unfurnished"]}
              />
              <SelectField
                value={filters.postedBy}
                onChange={(v) => setFilter("postedBy", v)}
                onFocus={closeDropdowns}
                placeholder="Posted By"
                options={["Owner", "Builder"]}
              />

              <MultiSelect
                id="construction"
                openId={openDropdown}
                onToggle={toggleDropdown}
                placeholder="Construction"
                options={["Ready To Move", "New Launch", "Under Construction"]}
                selected={filters.construction}
                onChange={(v) => toggleIn("construction", v)}
              />

              <MultiSelect
                id="amenities"
                openId={openDropdown}
                onToggle={toggleDropdown}
                placeholder="Amenities"
                countLabel="amenities"
                options={amenitiesList.map((a) => ({ value: String(a._id), label: a.amenity_name }))}
                selected={filters.amenities}
                onChange={(v) => toggleIn("amenities", v)}
              />

              {/* Bathrooms */}
              <div className="flex items-center h-8 border border-gray-300 rounded-lg overflow-hidden bg-white hover:border-[#8B1E3F] transition-colors">
                <button type="button" onClick={() => stepBathrooms(-1)} className="w-8 h-full flex items-center justify-center border-r hover:bg-gray-50 text-base">
                  −
                </button>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={filters.bathrooms}
                  onChange={(e) => {
                    const n = parseInt(e.target.value);
                    if (e.target.value === "") setFilter("bathrooms", "");
                    else if (!isNaN(n) && n >= 0 && n <= 20) setFilter("bathrooms", String(n));
                  }}
                  onFocus={closeDropdowns}
                  placeholder="Bath"
                  className="w-full h-full text-center text-xs focus:outline-none"
                />
                <button type="button" onClick={() => stepBathrooms(1)} className="w-8 h-full flex items-center justify-center border-l hover:bg-gray-50 text-base">
                  +
                </button>
              </div>

              {filters.propertyTypes.includes("Plot/Land") && (
                <SelectField
                  value={filters.facing}
                  onChange={(v) => setFilter("facing", v)}
                  onFocus={closeDropdowns}
                  placeholder="Facing"
                  options={FACING_OPTIONS}
                />
              )}

              <SelectField
                value={filters.withPhoto}
                onChange={(v) => setFilter("withPhoto", v)}
                onFocus={closeDropdowns}
                placeholder="With Photo"
                options={["Yes", "No"]}
              />
              <SelectField
                value={filters.withVideo}
                onChange={(v) => setFilter("withVideo", v)}
                onFocus={closeDropdowns}
                placeholder="With Video"
                options={["Yes", "No"]}
              />

              {/* Area */}
              <DropdownShell id="area" openId={openDropdown} onToggle={toggleDropdown} label={areaLabel}>
                <div className="p-3 space-y-2">
                  <select
                    value={filters.areaIn}
                    onChange={(e) => setFilter("areaIn", e.target.value)}
                    className="w-full p-2 text-xs border border-gray-300 rounded-md"
                  >
                    {AREA_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={filters.minArea}
                    onChange={(e) => setFilter("minArea", e.target.value)}
                    placeholder="Min Area"
                    className="w-full p-2 text-xs border border-gray-300 rounded-md"
                  />
                  <input
                    type="number"
                    value={filters.maxArea}
                    onChange={(e) => setFilter("maxArea", e.target.value)}
                    placeholder="Max Area"
                    className="w-full p-2 text-xs border border-gray-300 rounded-md"
                  />
                  <button type="button" onClick={closeDropdowns} className="w-full py-1.5 text-xs text-white bg-[#8B1E3F] rounded-md hover:bg-[#7a1a37]">
                    Done
                  </button>
                </div>
              </DropdownShell>

              {filters.category === "PG/Co-living" && (
                <>
                  <MultiSelect
                    id="sharingType"
                    openId={openDropdown}
                    onToggle={toggleDropdown}
                    placeholder="Sharing Type"
                    options={["Private Rooms", "2 Per Room", "More than 2 per room"]}
                    selected={filters.sharingType}
                    onChange={(v) => toggleIn("sharingType", v)}
                  />
                  <MultiSelect
                    id="capacity"
                    openId={openDropdown}
                    onToggle={toggleDropdown}
                    placeholder="Capacity"
                    options={["1-2 guest", "2-4 guest", "4-10 guest", "10+ guest"]}
                    selected={filters.capacity}
                    onChange={(v) => toggleIn("capacity", v)}
                  />
                </>
              )}

              {filters.category === "Rent" && (
                <MultiSelect
                  id="availableFrom"
                  openId={openDropdown}
                  onToggle={toggleDropdown}
                  placeholder="Available From"
                  options={["Immediately", "Any Time", "Within 1 Month", "After 1 Month", "Within 3 Month", "After 3 Month"]}
                  selected={filters.availableFrom}
                  onChange={(v) => toggleIn("availableFrom", v)}
                />
              )}

              {availableForOptions.length > 0 && (
                <MultiSelect
                  id="availableFor"
                  openId={openDropdown}
                  onToggle={toggleDropdown}
                  placeholder="Available For"
                  options={availableForOptions}
                  selected={filters.availableFor}
                  onChange={(v) => toggleIn("availableFor", v)}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* ===================== LISTING + MAP ===================== */}
      <style>{`
        .zb-popup .leaflet-popup-content-wrapper { padding: 0; overflow: hidden; border-radius: 12px; box-shadow: 0 14px 32px -12px rgba(94,13,40,0.35); border: 1px solid #eadfd6; }
        .zb-popup .leaflet-popup-content { margin: 0 !important; width: auto !important; }
        .zb-popup .leaflet-popup-content p { margin: 0; }
        .zb-popup .leaflet-popup-tip { background: #fff; }
        .zb-popup a.leaflet-popup-close-button { top: 8px; right: 8px; width: 26px; height: 26px; line-height: 24px; border-radius: 6px; background: rgba(255,255,255,.95); color: #7a1235; font-size: 18px; text-align: center; padding: 0; z-index: 20; }
        .zb-map .leaflet-top.leaflet-left { top: 8px; left: 8px; }
        .zb-map .leaflet-control-zoom { border: none !important; box-shadow: 0 6px 16px -6px rgba(94,13,40,.4) !important; border-radius: 10px; overflow: hidden; }
        .zb-map .leaflet-control-zoom a { color: #7a1235; background: #fff; border-bottom: 1px solid #eadfd6; width: 34px; height: 34px; line-height: 34px; }
        .zb-map .leaflet-control-zoom a:hover { background: #fbf3ec; color: #5e0d28; }
        .zb-map .leaflet-control-attribution { font-size: 10px; background: rgba(255,255,255,.8); }

        .marker-wrapper { position: relative; display: flex; justify-content: center; align-items: center; }
        .custom-marker { display: flex; align-items: center; justify-content: center; }
        .price-tooltip { position: relative; background: #fff; color: #1f2937; padding: 5px 10px; border-radius: 16px; border: 1px solid #eadfd6; font-size: 12px; font-weight: 700; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,.2); transition: background-color .2s ease, color .2s ease, border-color .2s ease, transform .2s ease; }
        .price-tooltip .pointer { position: absolute; bottom: -7px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 7px solid transparent; border-right: 7px solid transparent; border-top: 7px solid #fff; }
        .custom-marker.active .price-tooltip { background: #7a1235; color: #fff; border-color: #7a1235; transform: scale(1.08); }
        .custom-marker.active .price-tooltip .pointer { border-top-color: #7a1235; }

        .zb-card .slick-slide img { transition: transform .6s ease; }
        .zb-card:hover .slick-slide img { transform: scale(1.05); }
        .zb-card .slick-prev, .zb-card .slick-next { z-index: 5; width: 28px; height: 28px; opacity: 0; transition: opacity .25s ease; }
        .zb-card .slick-prev { left: 8px; }
        .zb-card .slick-next { right: 8px; }
        .zb-card:hover .slick-prev, .zb-card:hover .slick-next { opacity: 1; }
        .zb-card .slick-prev:before, .zb-card .slick-next:before { font-size: 28px; text-shadow: 0 2px 6px rgba(0,0,0,.45); }

        input[type="number"]::-webkit-outer-spin-button, input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type="number"] { -moz-appearance: textfield; }
      `}</style>

      <div className="flex flex-col p-2 space-y-4 sm:p-5 rounded-2xl bg-[#fbf3ec]">
        {label && (
          <h1 className="m-0 text-lg font-bold text-[#7a1235] capitalize">{label} Properties</h1>
        )}

        <div className="flex-grow">
          <div className="flex flex-col bg-white border border-[#eadfd6] shadow-sm rounded-2xl sm:flex-row-reverse">
            {/* Properties list */}
            <div className="z-10 flex-1 p-3 sm:p-5 no-scrollbar" style={{ scrollbarWidth: "none" }}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2">
                {properties.length > 0 ? (
                  properties.map((property) => (
                    <PropertyCard
                      key={property._id}
                      property={property}
                      isHovered={hoveredId === property._id}
                      activeIndex={activeIndexes[property._id] || 0}
                      onSlide={handleSlide}
                      onEnter={handleCardEnter}
                      onLeave={handleLeave}
                      onFavorite={handleFavorite}
                      onShare={handleShare}
                      onContact={handleContactClick}
                    />
                  ))
                ) : (
                  <div className="py-10 text-center text-gray-700 col-span-full">
                    <p className="m-0">{loading ? "Loading properties..." : error || "No properties available at the moment."}</p>
                  </div>
                )}
              </div>

              {isContactOpen && selectedProperty && (
                <ContactDetails
                  fullName={
                    freeViewCount <= 0 && paidViewCount <= 0
                      ? `****${selectedProperty.connect_to_name?.slice(-1) || "N/A"}`
                      : selectedProperty.connect_to_name || "N/A"
                  }
                  mobile={
                    freeViewCount <= 0 && paidViewCount <= 0
                      ? `*******${selectedProperty.connect_to_no?.slice(-3) || "000"}`
                      : selectedProperty.connect_to_no || "N/A"
                  }
                  showUpgradePrompt={showUpgradePrompt}
                  onClose={() => setIsContactOpen(false)}
                />
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    type="button"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                    className={`w-9 h-9 flex items-center justify-center rounded-lg border border-[#eadfd6] bg-white text-[#7a1235] transition-colors hover:bg-[#fbf3ec] ${currentPage === 1 ? "opacity-40 cursor-not-allowed" : ""}`}
                  >
                    <MdOutlineNavigateBefore className="text-xl" />
                  </button>
                  {paginationRange.map((page, index) => (
                    <button
                      type="button"
                      key={index}
                      onClick={() => page !== "..." && goToPage(page)}
                      className={`min-w-[36px] h-9 px-2 text-sm rounded-lg flex items-center justify-center transition-colors ${currentPage === page ? "bg-[#7a1235] text-white font-semibold" : "text-gray-700 hover:bg-[#fbf3ec]"}`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                    className={`w-9 h-9 flex items-center justify-center rounded-lg border border-[#eadfd6] bg-white text-[#7a1235] transition-colors hover:bg-[#fbf3ec] ${currentPage === totalPages ? "opacity-40 cursor-not-allowed" : ""}`}
                  >
                    <MdOutlineNavigateNext className="text-xl" />
                  </button>
                </div>
              )}
            </div>

            {/* Map */}
            <div className="sticky top-0 w-full p-3 sm:w-3/4 md:w-1/2 lg:w-[500px] h-[300px] sm:h-screen sm:self-start">
              <div className="relative w-full h-full overflow-hidden bg-[#fbf3ec] border border-[#eadfd6] rounded-xl zb-map">
                {loading ? (
                  <div className="flex items-center justify-center w-full h-full gap-3 text-[#7a1235]">
                    <span className="w-5 h-5 border-2 rounded-full border-[#7a1235] border-t-transparent animate-spin" />
                    <p className="m-0 text-sm font-medium">Loading properties...</p>
                  </div>
                ) : (
                  <>
                    <div className="absolute z-[1000] px-3 py-1.5 text-xs font-semibold text-white rounded-lg shadow-md pointer-events-none bottom-3 left-3 bg-[#7a1235]">
                      {mappable.length} properties on map
                    </div>
                    <MapContainer
                      center={mapPoints[0] || DEFAULT_CENTER}
                      zoom={12}
                      scrollWheelZoom={false}
                      style={{ width: "100%", height: "100%" }}
                    >
                      <ZbMapLayers />
                      <MapFitter points={mapPoints} />
                      <MapPanner target={panTarget} />

                      {mappable.map((property) => (
                        <PropertyMarker
                          key={property._id}
                          property={property}
                          active={hoveredId === property._id}
                          onHover={setHoveredId}
                          onLeave={handleLeave}
                          onFavorite={handleFavorite}
                        />
                      ))}
                    </MapContainer>
                  </>
                )}
              </div>
            </div>

            {isShareOpen && (
              <div className="absolute right-0 z-50">
                <ShareModal
                  currentShareUrl={shareUrl}
                  closeShareModal={() => setIsShareOpen(false)}
                  copyLink={() => copyToClipboard(shareUrl)}
                />
              </div>
            )}
          </div>
        </div>

        <Login1
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
          onSwitchToSignUp={() => {
            setIsLoginOpen(false);
            setIsSignUpOpen(true);
          }}
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
    </>
  );
};

export default AllProperty;