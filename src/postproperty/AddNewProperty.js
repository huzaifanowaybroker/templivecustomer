import React, { useState, useEffect, useRef } from "react";
import {
  ADDRESS_MAX,
  PG_COMMERCIAL_MSG,
  PG_PROPERTY_TYPES,
  cleanSpaces,
  getZipMaxLength,
  sanitizeCityTyping,
  validateAddress,
  validateBuildingName,
  validateCity,
  validateZip,
  PRICE_MAX_DIGITS,
  MAX_PROPERTY_PHOTOS,
  fixAmenityLabel,
  validateAreaPair,
  validateAreaUnit,
  validateAreaValue,
  validatePropertyPrice,
  validateVideoUrl,
  capitalizeFirst,
  PARKING_MAX,
  sanitizeParkingCount,
  validateFlatNo,
  validatePossessionDate,
} from "../utils/propertyFormValidation";
// File ke top mein, component function ke BAHAR

import { IoIosInformationCircle } from "react-icons/io";
import { ToWords } from "to-words";
import { Trash } from "lucide-react"; // Using Lucide Icons for delete button
import {
  Check, Handshake, ShieldCheck, TrendingUp, LayoutDashboard, Zap, Users, Home, ArrowLeft, ArrowRight,
  Smartphone, CircleUser, Bell, Tag, KeyRound, BedDouble, Building2, Building, MapPin, Globe, IndianRupee,
  Ruler, Calendar, Clock, FileText, Video, Upload, CloudUpload, Images, Plus, Sparkles, Sofa, Layers, Bath,
  Award, CalendarCheck, PanelsTopLeft, CircleParking, LocateFixed, Mail, Youtube, Link as LinkIcon, Glasses,
  Droplets, Flame, Cctv, Waves, Dumbbell, Trees, Baby, BatteryCharging, Siren, Car, ArrowUpDown,
  Image as ImageIcon,
} from "lucide-react";
import { MdOutlineDriveFolderUpload } from "react-icons/md";
import axios from "axios";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Autocomplete,
} from "@react-google-maps/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useHistory } from "react-router-dom";
import { MultiSelect } from "primereact/multiselect";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { MdErrorOutline } from "react-icons/md";
import Select, { components } from "react-select";
import { Country, State } from "country-state-city";
const GOOGLE_MAPS_LIBRARIES = ["places"];

const CITY_OPTIONS = [
  "Ahmedabad",
  "Bengaluru",
  "Chennai",
  "Delhi",
  "Hyderabad",
  "Kolkata",
  "Mumbai",
  "Pune",
];

// Human-readable names for every validated field, used in the "please fill" message
const FIELD_LABELS = {
  property_name: "Property Name",
  building_type: "Property Category",
  property_type: "Property Type",
  bhk_type: "BHK / Configuration",
  property_price: "Expected Price",
  rent: "Rent Amount",
  rent_duration: "Rent Duration",
  security_deposit_amount: "Deposit Amount",
  ownership: "Ownership",
  possession_status: "Possession Status",
  available_from: "Available From",
  possession_date: "Possession / Available Date",
  address: "Address",
  country: "Country",
  state: "State",
  city: "City",
  zipCode: "Zip Code",
  builtUpArea: "Built-up Area",
  builtUpAreaUnit: "Built-up Area unit",
  carpetArea: "Carpet Area",
  carpetAreaUnit: "Carpet Area unit",
  property_dimensions_length: "Plot Length",
  property_dimensions_breadth: "Plot Breadth",
  furnished_type: "Furnishing Type",
  block: "Tower / Block Name",
  cover_image: "Cover Image",
  video_url: "Video URL",
  video_url_type: "Video Source",
};

/* ------------------------------------------------------------------ */
/* Layout helpers (presentation only, no logic)                        */
/* ------------------------------------------------------------------ */

const ZB_STYLES = `
.zb-root{min-height:100vh;background:radial-gradient(1200px 500px at 80% -10%,#F8E3E7 0%,transparent 60%),#FDF9F6;color:#1f2937;font-size:13px;padding-bottom:84px;}
.zb-topbar{background:#fff;border-bottom:1px solid #f1f1f1;}
.zb-topbar-inner{max-width:1152px;margin:0 auto;padding:0 16px;height:42px;display:flex;align-items:center;gap:12px;}
.zb-brand{display:flex;align-items:center;gap:7.5px;flex-shrink:0;}
.zb-logo{font-size:22px;font-weight:900;letter-spacing:-.02em;line-height:1;}
.zb-logo-zero{color:#700C28;}
.zb-logo-briks{color:#D4A017;}
.zb-brand-sub{font-size:10px;color:#6b7280;line-height:1.2;border-left:1px solid #e5e7eb;padding-left:10px;}
.zb-links{display:none;gap:12px;font-size:12.5px;font-weight:600;color:#374151;}
@media (min-width:1024px){.zb-links{display:flex;}}
.zb-links a{color:inherit;text-decoration:none;}
.zb-links a:hover{color:#700C28;}
.zb-top-actions{margin-left:auto;display:flex;align-items:center;gap:6px;}
.zb-btn-ghost{display:none;align-items:center;gap:4.5px;height:28px;padding:0 12px;border:1px solid #700C28;border-radius:8px;color:#700C28;background:#fff;font-size:12px;font-weight:600;cursor:pointer;}
@media (min-width:768px){.zb-btn-ghost{display:inline-flex;}}
.zb-btn-post{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 12px;border:0;border-radius:8px;background:#700C28;color:#fff;font-size:12px;font-weight:600;cursor:pointer;}
.zb-free{background:#D4A017;color:#111827;font-size:10px;font-weight:700;border-radius:4px;padding:1.5px 6px;}
.zb-icon-btn{width:30px;height:30px;border-radius:50%;background:#f3f4f6;color:#4b5563;display:flex;align-items:center;justify-content:center;}
.zb-banner{position:relative;overflow:hidden;background:linear-gradient(90deg,rgba(63,6,22,.92) 0%,rgba(112,12,40,.82) 60%,rgba(112,12,40,.7) 100%),url('/images/property-hero.jpg') center/cover no-repeat,#700C28;}
.zb-banner-inner{max-width:1152px;margin:0 auto;padding:8px 16px 6px;display:flex;flex-direction:column;align-items:flex-start;text-align:left;gap:3px;position:relative;}
.zb-banner-text{text-align:left;max-width:680px;}
.zb-banner-text h1{font-size:22px;font-weight:800;color:#fff;line-height:1.2;letter-spacing:-.01em;margin:0 0;}
.zb-banner-text p{font-size:12px;line-height:1.3;color:rgba(255,255,255,.9);margin:2px 0 0;}
.zb-banner-line{height:3px;background:linear-gradient(90deg,#D4A017,#F3D27A,#D4A017);}
.zb-stepper{max-width:1152px;margin:18px auto 0;padding:0 16px;}
.zb-stepper ol{display:flex;align-items:center;gap:9px;list-style:none;margin:0 0;padding:0 0;flex-wrap:wrap;}
.zb-step-item{display:flex;align-items:center;gap:9px;}
.zb-step{display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 14px 0 5px;border-radius:999px;border:0;background:#fff;color:#9ca3af;font-size:13px;font-weight:600;box-shadow:inset 0 0 0 1px #e5e7eb;cursor:pointer;white-space:nowrap;}
.zb-step:disabled{cursor:default;}
.zb-step.is-active{background:#700C28;color:#fff;box-shadow:0 4px 10px rgba(112,12,40,.25);}
.zb-step.is-done{background:#ecfdf5;color:#047857;box-shadow:none;}
.zb-num{width:26px;height:26px;border-radius:50%;background:#f3f4f6;color:#6b7280;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;}
.zb-step.is-active .zb-num{background:#fff;color:#700C28;}
.zb-step.is-done .zb-num{background:#059669;color:#fff;}
.zb-line{flex:1;height:2px;min-width:24px;background:#d1d5db;}
.zb-line.is-done{background:#10b981;}
.zb-main{max-width:1152px;margin:18px auto 0;padding:0 16px;display:grid;gap:18px;}
.zb-main.zb-with-promo{grid-template-columns:minmax(0,1fr) 340px;}
@media (max-width:1023px){.zb-main.zb-with-promo{grid-template-columns:minmax(0,1fr);}.zb-promo{display:none;}}
.zb-card{background:#fff;border-radius:14px;border:1px solid #ebe7e7;box-shadow:0 1px 2px rgba(0,0,0,.04),0 12px 28px -18px rgba(112,12,40,.25);padding:16.5px 22px;min-width:0;}
.zb-promo{background:#fff;border-radius:16px;border:1px solid #ebe7e7;box-shadow:0 12px 28px -18px rgba(112,12,40,.3);overflow:hidden;position:sticky;top:16px;align-self:start;}
.zb-promo-art{background:#F9E2CB;}
.zb-skyline{display:block;width:100%;height:auto;}
.zb-promo-body{padding:13.5px 18px;}
.zb-promo-logo{font-size:15px;font-weight:900;line-height:1;}
.zb-promo h3{font-size:17px;font-weight:700;color:#700C28;margin:7.5px 0 0;}
.zb-promo-tag{font-size:12px;color:#6b7280;margin:1.5px 0 0;}
.zb-points{list-style:none;margin:10.5px 0 0;padding:0 0;display:flex;flex-direction:column;gap:9px;}
.zb-points li{display:flex;gap:7.5px;align-items:flex-start;}
.zb-point-ico{width:28px;height:28px;border-radius:10px;background:#F8EEF1;color:#700C28;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.zb-point-t{font-size:13px;font-weight:700;color:#700C28;margin:0 0;line-height:1.25;}
.zb-point-s{font-size:12px;color:#6b7280;margin:0 0;line-height:1.35;}
.zb-stats{margin-top:12px;display:grid;grid-template-columns:repeat(3,1fr);background:#F8EEF1;border-radius:12px;padding:9px 4px;text-align:center;}
.zb-stats div{display:flex;flex-direction:column;}
.zb-stats div+div{border-left:1px solid #efd3d9;}
.zb-stats b{font-size:18px;font-weight:900;color:#700C28;}
.zb-stats span{font-size:10.5px;color:#4b5563;}
.zb-root input:not([type=checkbox]):not([type=radio]):not([type=file]),.zb-root select,.zb-root textarea{border:1px solid #d1d5db !important;border-radius:8px !important;font-size:13px !important;outline:none !important;background-color:#fff;}
.zb-root input:not([type=checkbox]):not([type=radio]):not([type=file]):focus,.zb-root select:focus,.zb-root textarea:focus{border-color:#700C28 !important;box-shadow:0 0 0 3px rgba(112,12,40,.12) !important;}
.zb-root input:not([type=checkbox]):not([type=radio]):not([type=file]):hover,.zb-root select:hover,.zb-root textarea:hover{border-color:#b9a3a8 !important;}
.zb-root h2{color:#700C28;font-weight:700;}
.zb-root .max-w-3xl,.zb-root .max-w-5xl,.zb-root .max-w-7xl{max-width:100% !important;}
.zb-root .mb-32,.zb-root .mb-20{margin-bottom:12px !important;}
.zb-footer{position:fixed;left:0;right:0;bottom:0;z-index:40;background:rgba(255,255,255,.97);border-top:1px solid #e5e7eb;box-shadow:0 -4px 12px rgba(0,0,0,.04);}
.zb-footer-inner{max-width:1152px;margin:0 auto;padding:9px 16px;display:flex;align-items:center;justify-content:space-between;gap:9px;}
.zb-step-count{font-size:12px;color:#6b7280;}
.zb-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:38px;min-width:150px;padding:0 22px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;border:0;transition:background .15s, transform .15s;}
.zb-btn:disabled{opacity:.6;cursor:not-allowed;}
.zb-btn-primary{background:#700C28;color:#fff;box-shadow:0 4px 12px rgba(112,12,40,.25);}
.zb-btn-primary:hover:not(:disabled){background:#580920;transform:translateY(-1px);}
.zb-btn-outline{background:#fff;color:#700C28;box-shadow:inset 0 0 0 1.5px #700C28;}
.zb-btn-outline:hover{background:#FBF3F5;}
@media (max-width:640px){.zb-step-count{display:none;}.zb-brand-sub{display:none;}.zb-banner-inner{padding:8px 16px 6px;}}
.zb-screen{display:flex;flex-direction:column;gap:10.5px;}
.zb-summary{background:#fef2f2;border:1px solid #fecaca;color:#b91c1c;border-radius:10px;padding:7.5px 14px;font-size:12.5px;font-weight:600;}
.zb-head{display:flex;gap:9px;align-items:center;margin-bottom:3px;}
.zb-head-ico{width:34px;height:34px;border-radius:12px;background:#700C28;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 10px rgba(112,12,40,.25);flex-shrink:0;}
.zb-head h2{font-size:18px;margin:0 0;line-height:1.2;}
.zb-head p{font-size:12.5px;color:#6b7280;margin:1.5px 0 0;}
.zb-sub{display:flex;align-items:center;gap:6px;font-size:14px;font-weight:700;color:#111827;margin-top:7.5px;padding-top:12px;border-top:1px solid #f0eded;}
.zb-sub svg{color:#700C28;}
.zb-note{font-size:12px;color:#6b7280;margin:-4.5px 0 0;}
.zb-field{display:flex;flex-direction:column;gap:4.5px;min-width:0;}
.zb-label{font-size:12px;font-weight:600;color:#1f2937;}
.zb-label b{color:#dc2626;margin-left:2px;}
.zb-err{font-size:11.5px;color:#dc2626;margin:0 0;}
.zb-hint{font-size:11px;color:#6b7280;margin:0 0;}
.zb-right{text-align:right;}
.zb-rel{position:relative;}
.zb-ico{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:#700C28;pointer-events:none;z-index:1;}
.zb-input{width:100%;height:32px;padding:0 12px;font-size:13px;color:#111827;background:#fff;border:1px solid #d1d5db;border-radius:8px;outline:none;box-sizing:border-box;}
.zb-input:focus{border-color:#700C28;box-shadow:0 0 0 3px rgba(112,12,40,.12);}
.zb-input:disabled{background:#f3f4f6;color:#9ca3af;}
.zb-has-icon{padding-left:36px;}
.zb-select{appearance:none;padding-right:32px;cursor:pointer;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;}
.zb-textarea{height:auto;padding:7.5px 12px;resize:vertical;}
.zb-grid-2{display:grid;grid-template-columns:1fr;gap:10.5px;}
.zb-grid-3{display:grid;grid-template-columns:1fr;gap:10.5px;}
@media (min-width:768px){.zb-grid-2{grid-template-columns:1fr 1fr;}.zb-grid-3{grid-template-columns:1fr 1fr 1fr;}}
.zb-choices{display:grid;gap:7.5px;grid-template-columns:repeat(3,1fr);}
.zb-cols-2{grid-template-columns:repeat(2,1fr);}
.zb-choice{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4.5px;min-height:48px;padding:7.5px 8px;border:1.5px solid #e5e7eb;border-radius:10px;background:#fff;color:#374151;font-size:12.5px;font-weight:600;cursor:pointer;transition:all .15s;}
.zb-choice:hover:not(:disabled){border-color:rgba(112,12,40,.45);transform:translateY(-1px);}
.zb-choice:disabled{opacity:.4;cursor:not-allowed;}
.zb-choice.is-on{border-color:#700C28;background:#FBF3F5;color:#700C28;box-shadow:0 1px 4px rgba(112,12,40,.12);}
.zb-choice.is-on::after{content:"✓";position:absolute;top:6px;right:7px;width:17px;height:17px;border-radius:50%;background:#700C28;color:#fff;font-size:10px;line-height:17px;text-align:center;font-weight:700;}
.zb-check{display:flex;align-items:center;gap:6.75px;padding:7.5px 12px;border:1px solid #e5e7eb;border-radius:9px;font-size:12.5px;font-weight:500;color:#374151;cursor:pointer;background:#fff;}
.zb-check.is-on{border-color:#700C28;background:#FBF3F5;color:#700C28;}
.zb-check input{accent-color:#700C28;width:16px;height:16px;}
.zb-checks{display:grid;gap:7.5px;grid-template-columns:1fr;}
@media (min-width:768px){.zb-checks{grid-template-columns:repeat(3,1fr);}}
.zb-area{display:flex;height:32px;border:1px solid #d1d5db;border-radius:8px;background:#fff;overflow:hidden;}
.zb-area:focus-within{border-color:#700C28;box-shadow:0 0 0 3px rgba(112,12,40,.12);}
.zb-area.is-err{border-color:#f87171;}
.zb-area input{flex:1;min-width:0;border:0;padding:0 12px;font-size:13px;outline:none;background:transparent;}
.zb-area select{border:0;border-left:1px solid #e5e7eb;background:#f9fafb;font-size:12px;padding:0 8px;outline:none;color:#374151;max-width:130px;}
.zb-mt{margin-top:3px;}
.zb-row-between{display:flex;align-items:center;justify-content:space-between;margin-top:4.5px;}
.zb-ai-btn{display:inline-flex;align-items:center;gap:4.5px;height:26px;padding:0 12px;border-radius:8px;background:#fffbeb;color:#8a6400;border:1px solid rgba(212,160,23,.55);font-size:12px;font-weight:600;cursor:pointer;}
.zb-ai-btn:disabled{opacity:.6;cursor:not-allowed;}
.zb-count{font-size:13px;color:#4b5563;margin:0 0;}
.zb-count b{color:#700C28;}
.zb-amen-grid{display:grid;gap:7.5px;grid-template-columns:1fr;}
@media (min-width:768px){.zb-amen-grid{grid-template-columns:repeat(3,1fr);}}
.zb-amen{display:flex;align-items:center;gap:7.5px;padding:6.75px 11px;border:1.5px solid #e5e7eb;border-radius:10px;background:#fff;text-align:left;font-size:13px;font-weight:600;color:#1f2937;cursor:pointer;transition:all .15s;}
.zb-amen:hover{border-color:rgba(112,12,40,.45);transform:translateY(-1px);}
.zb-amen.is-on{border-color:#700C28;background:#FBF3F5;}
.zb-amen-ico{width:28px;height:28px;border-radius:8px;background:#F8EEF1;color:#700C28;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.zb-amen.is-on .zb-amen-ico{background:#700C28;color:#fff;}
.zb-amen-name{flex:1;min-width:0;}
.zb-amen-box{width:16px;height:16px;border:1.5px solid #d1d5db;border-radius:5px;display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;}
.zb-amen.is-on .zb-amen-box{background:#700C28;border-color:#700C28;}
.zb-mini{border:1px solid #e5e7eb;border-radius:12px;padding:12px 16px;background:#fff;display:flex;flex-direction:column;gap:9px;}
.zb-mini-head{display:flex;gap:7.5px;align-items:flex-start;}
.zb-mini-ico{width:28px;height:28px;border-radius:10px;background:#F8EEF1;color:#700C28;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.zb-mini h3{font-size:14px;font-weight:700;color:#111827;margin:0 0;}
.zb-mini p{font-size:12px;color:#6b7280;margin:1.5px 0 0;}
.zb-media{align-items:start;}
.zb-col{display:flex;flex-direction:column;gap:10.5px;min-width:0;}
.zb-drop{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4.5px;padding:16.5px 12px;border:1.5px dashed rgba(112,12,40,.4);border-radius:12px;background:#fdf7f8;text-align:center;}
.zb-drop-sm{padding:12px 12px;}
.zb-drop p{font-size:13px;color:#374151;margin:0 0;}
.zb-drop-ico{color:#700C28;}
.zb-link{background:none;border:0;padding:0 0;color:#700C28;font-weight:600;text-decoration:underline;cursor:pointer;font-size:13px;}
.zb-btn-pill{display:inline-flex;align-items:center;gap:4.5px;height:28px;padding:0 14px;border-radius:8px;background:#700C28;color:#fff;font-size:12px;font-weight:600;border:0;cursor:pointer;}
.zb-hidden{display:none;}
.zb-preview{position:relative;border-radius:10px;overflow:hidden;}
.zb-preview img,.zb-preview video{width:100%;display:block;max-height:195px;object-fit:cover;}
.zb-preview-x{position:absolute;top:8px;right:8px;width:28px;height:28px;border-radius:50%;border:0;background:rgba(0,0,0,.6);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;}
.zb-thumbs{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;}
.zb-thumb{position:relative;aspect-ratio:1/1;border-radius:8px;overflow:hidden;background:#f3f4f6;}
.zb-thumb img{width:100%;height:100%;object-fit:cover;display:block;}
.zb-thumb button{position:absolute;top:4px;right:4px;width:22px;height:22px;border-radius:50%;border:0;background:rgba(0,0,0,.6);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;}
.zb-or{display:flex;align-items:center;gap:9px;color:#6b7280;font-size:12px;font-weight:700;}
.zb-or::before,.zb-or::after{content:"";flex:1;height:1px;background:#d1d5db;}
.zb-or span{background:#fff;border:1px solid #e5e7eb;border-radius:999px;padding:2.25px 12px;}
.zb-divider{height:1px;background:#f0eded;margin:4.5px 0;}
.zb-root{background:#FDF9F6;color:#1E2A3B;}
.zb-topbar{background:#fff;border-bottom:1px solid #EFE7DC;}
.zb-card{background:#fff;border-color:#EFE7DC;box-shadow:0 1px 2px rgba(30,42,59,.04),0 10px 24px -16px rgba(112,12,40,.22);transition:box-shadow .2s ease;}
.zb-card:hover{box-shadow:0 16px 32px -18px rgba(112,12,40,.34);}
.zb-main{max-width:1120px;padding:0 12px;}
.zb-stepper{max-width:1120px;padding:0 12px;}
.zb-promo{border-color:#EFE7DC;background:#fff;}
.zb-promo-art{background:#F9ECD9;}
.zb-promo-photo{height:142.5px;background:url('/images/property-hero.jpg') center/cover no-repeat,#F9E2CB;}
.zb-promo-photo img{width:100%;height:100%;object-fit:cover;display:block;}
.zb-point-t{color:#700C28;}
.zb-point-s{color:#5B6472;}
.zb-point-ico{transition:transform .2s ease;}
.zb-points li:hover .zb-point-ico{transform:scale(1.08);}
.zb-stats{background:#FBF4F1;}
.zb-stats b{color:#700C28;}
.zb-stats span{color:#5B6472;}
.zb-step{background:#fff;color:#7B8494;transition:background .2s ease,color .2s ease,transform .2s ease;}
.zb-step:hover:not(:disabled){transform:translateY(-1px);}
.zb-step.is-active{background:#700C28;color:#fff;}
.zb-step.is-done{background:#F3F8F1;color:#2F6B45;}
.zb-num{background:#F1ECE4;color:#5B6472;}
.zb-line{background:#E2D9CB;}
.zb-label{color:#1E2A3B;}
.zb-head p,.zb-mini p,.zb-hint,.zb-note,.zb-count{color:#5B6472;}
.zb-sub{color:#1E2A3B;border-top-color:#EFE7DC;}
.zb-input{background:#FFFDFA;border-color:#E2D9CB;color:#1E2A3B;transition:border-color .15s ease,box-shadow .15s ease,background .15s ease;}
.zb-input:hover:not(:disabled){border-color:#B9A3A8;background:#fff;}
.zb-input:focus{background:#fff;}
.zb-choice{background:#fff;border-color:#E2D9CB;color:#1E2A3B;}
.zb-choice:hover:not(:disabled){box-shadow:0 10px 20px -14px rgba(112,12,40,.5);}
.zb-check{background:#fff;border-color:#E2D9CB;color:#1E2A3B;transition:background .15s ease,border-color .15s ease;}
.zb-check:hover{border-color:#B9A3A8;background:#FFFDFA;}
.zb-amen{background:#fff;border-color:#E2D9CB;color:#1E2A3B;}
.zb-amen:hover{box-shadow:0 10px 20px -14px rgba(112,12,40,.5);}
.zb-drop{background:#FDF8F1;transition:background .15s ease,border-color .15s ease;}
.zb-drop:hover{border-color:#700C28;background:#F9EEEF;}
.zb-mini{background:#fff;border-color:#EFE7DC;transition:box-shadow .2s ease;}
.zb-mini:hover{box-shadow:0 12px 24px -16px rgba(112,12,40,.3);}
.zb-mini h3{color:#1E2A3B;}
.zb-ai-btn{background:#FFF7E0;color:#7A5A00;border-color:#E9C768;transition:background .15s ease,box-shadow .15s ease;}
.zb-ai-btn:hover:not(:disabled){background:#FFEFC2;box-shadow:0 6px 14px -10px rgba(212,160,23,.8);}
.zb-thumb img{transition:transform .25s ease;}
.zb-thumb:hover img{transform:scale(1.05);}
.zb-link:hover{opacity:.8;}
.zb-footer{background:rgba(255,255,255,.97);border-top:1px solid #EFE7DC;}
.zb-step-count{color:#5B6472;}
.zb-btn-primary:hover:not(:disabled){box-shadow:0 10px 20px -10px rgba(112,12,40,.7);}
.zb-btn-outline:hover{box-shadow:inset 0 0 0 1.5px #700C28,0 8px 16px -12px rgba(112,12,40,.6);}
.zb-notice{background:#FFF7E0;border:1px solid #F0D27A;color:#7A5A00;border-radius:10px;padding:7.5px 14px;font-size:12.5px;line-height:1.45;}
.zb-progress{max-width:1120px;margin:10.5px auto 0;padding:0 12px;}
.zb-progress-top{display:flex;justify-content:space-between;align-items:center;font-size:12px;color:#5B6472;margin-bottom:4.5px;}
.zb-progress-top b{color:#700C28;font-size:13px;}
.zb-progress-track{height:8px;border-radius:999px;background:#F1E3E6;overflow:hidden;}
.zb-progress-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,#700C28,#700C28);transition:width .35s ease;}
@keyframes zbEnter{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:none;}}
.zb-enter{animation:zbEnter .2s ease-out both;will-change:opacity,transform;}
@media (prefers-reduced-motion: reduce){.zb-enter{animation:none;}.zb-card,.zb-choice,.zb-amen,.zb-btn,.zb-step,.zb-input,.zb-progress-fill{transition:none;}}
`;

const PROMO_POINTS = [
  { icon: Handshake, title: "Zero Brokerage", text: "Direct deals, no middlemen" },
  { icon: Users, title: "Genuine Interest", text: "Connect with verified buyers & tenants" },
  { icon: ShieldCheck, title: "Verified Leads", text: "Only genuine enquiries reach you" },
  { icon: TrendingUp, title: "Greater Visibility", text: "High exposure across multiple cities" },
  { icon: LayoutDashboard, title: "Track & Manage", text: "Easily manage your listing and enquiries" },
  { icon: Zap, title: "Quick & Easy Listing", text: "List your property in just a few steps" },
];

const ZbPromo = () => (
  <aside className="zb-promo">
    <div className="zb-promo-art zb-promo-photo">
      <img
        src="/images/property-hero.jpg"
        alt="Modern apartment building"
        onError={(e) => { e.currentTarget.style.display = "none"; }}
      />
    </div>
    <div className="zb-promo-body">
      <div className="zb-promo-logo"><span className="zb-logo-zero">ZERO</span><span className="zb-logo-briks">BRIKS</span></div>
      <h3>List on ZEROBRIKS</h3>
      <p className="zb-promo-tag">Your digital agent. Zero brokerage.</p>
      <ul className="zb-points">
        {PROMO_POINTS.map((p) => {
          const Icon = p.icon;
          return (
            <li key={p.title}>
              <span className="zb-point-ico"><Icon size={16} /></span>
              <div>
                <p className="zb-point-t">{p.title}</p>
                <p className="zb-point-s">{p.text}</p>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="zb-stats">
        <div><b>30K+</b><span>Active Users</span></div>
        <div><b>7K+</b><span>Properties Listed</span></div>
        <div><b>8+</b><span>Cities</span></div>
      </div>
    </div>
  </aside>
);

const LISTING_ICONS = { Buy: Tag, Rent: KeyRound, "Paying Guest": BedDouble };
const RENT_DURATION_OPTIONS = ["Per Month", "Per Year"];
const YES_NO = ["Yes", "No"];
const BHK_OPTIONS = ["Studio/Single Room", "1 RK", "1 BHK", "1.5 BHK", "2 BHK", "2.5 BHK", "3 BHK", "3.5 BHK", "4 BHK", "5 BHK", "6 BHK", "6+ BHK"];
const BATHROOM_OPTIONS = [
  { value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4+" },
];
const OWNERSHIP_OPTIONS = ["Freehold", "Leasehold", "Co-operative Society", "Power of Attorney"];
const POSSESSION_OPTIONS = ["Expected Possession", "Ready To Move", "Under Construction", "New Launch", "Resale"];
const FURNISHING_OPTIONS = ["Furnished", "Unfurnished", "Semi-Furnished"];
const AGE_OPTIONS = [
  { value: "0-1", label: "0-1" }, { value: "2-4", label: "2-4" }, { value: "5-7", label: "5-7" },
  { value: "8-10", label: "8-10" }, { value: "10+", label: "10+" },
];
const COUNT_OPTIONS = ["0", "1", "2", "3", "4"];
const BALCONY_OPTIONS = [
  { value: "0", label: "0" }, { value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3" },
  { value: "more than 3", label: "More than 3" },
];
const AREA_UNITS = [
  "sq.ft", "sq.yards", "sq.m", "acre", "marla", "cents", "bigha", "kottah", "kanal", "grounds",
  "ares", "biswa", "guntha", "aankadam", "hectares", "rood", "chataks", "perch",
];

const formatAmount = (value) => (value ? Number(value).toLocaleString("en-IN") : "");

const amenityIconFor = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("visitor")) return CircleParking;
  if (n.includes("water")) return Droplets;
  if (n.includes("fire")) return Siren;
  if (n.includes("security")) return ShieldCheck;
  if (n.includes("cctv") || n.includes("camera")) return Cctv;
  if (n.includes("gas")) return Flame;
  if (n.includes("club")) return Users;
  if (n.includes("power") || n.includes("backup")) return BatteryCharging;
  if (n.includes("pool") || n.includes("swim")) return Waves;
  if (n.includes("gym")) return Dumbbell;
  if (n.includes("garden") || n.includes("park")) return Trees;
  if (n.includes("parking")) return Car;
  if (n.includes("play") || n.includes("child")) return Baby;
  if (n.includes("lift")) return ArrowUpDown;
  return Check;
};

const ZbHeader = ({ icon: Icon, title, subtitle }) => (
  <div className="zb-head">
    <span className="zb-head-ico"><Icon size={16} /></span>
    <div>
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  </div>
);

const ZbSub = ({ icon: Icon, title }) => (
  <div className="zb-sub">
    {Icon && <Icon size={16} />}
    <span>{title}</span>
  </div>
);

const ZbField = ({ label, required, error, hint, className = "", children }) => (
  <div className={`zb-field ${className}`}>
    <label className="zb-label">
      {label}
      {required && <b>*</b>}
    </label>
    {children}
    {error ? <p className="zb-err">{error}</p> : hint ? <p className="zb-hint">{hint}</p> : null}
  </div>
);

const ZbInput = ({ icon: Icon, className = "", ...props }) => (
  <div className="zb-rel">
    {Icon && <Icon className="zb-ico" size={16} />}
    <input className={`zb-input ${Icon ? "zb-has-icon" : ""} ${className}`} {...props} />
  </div>
);

const ZbSelect = ({ icon: Icon, placeholder, options = [], className = "", ...props }) => (
  <div className="zb-rel">
    {Icon && <Icon className="zb-ico" size={16} />}
    <select className={`zb-input zb-select ${Icon ? "zb-has-icon" : ""} ${className}`} {...props}>
      <option value="">{placeholder}</option>
      {options.map((o) => {
        const value = typeof o === "string" ? o : o.value;
        const label = typeof o === "string" ? o : o.label;
        return (
          <option key={value} value={value}>
            {label}
          </option>
        );
      })}
    </select>
  </div>
);

const ZbAreaInput = ({ value, unit, onValue, onUnit, onBlur, placeholder, error }) => (
  <div className={`zb-area ${error ? "is-err" : ""}`}>
    <input
      type="text"
      inputMode="decimal"
      value={value || ""}
      onChange={(e) => onValue(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
    />
    <select value={unit || ""} onChange={(e) => onUnit(e.target.value)}>
      <option value="">Unit</option>
      {AREA_UNITS.map((u) => (
        <option key={u} value={u}>
          {u}
        </option>
      ))}
    </select>
  </div>
);

const ZbChoice = ({ icon: Icon, label, selected, disabled, onClick }) => (
  <button
    type="button"
    className={`zb-choice ${selected ? "is-on" : ""}`}
    aria-pressed={selected}
    disabled={disabled}
    onClick={onClick}
  >
    {Icon && <Icon size={18} />}
    <span>{label}</span>
  </button>
);

const ZbCheck = ({ checked, label, onChange }) => (
  <label className={`zb-check ${checked ? "is-on" : ""}`}>
    <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
    <span>{label}</span>
  </label>
);

const ZbCard = ({ icon: Icon, title, subtitle, children }) => (
  <div className="zb-mini">
    <div className="zb-mini-head">
      <span className="zb-mini-ico"><Icon size={16} /></span>
      <div>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
    </div>
    {children}
  </div>
);

const AddNewProperty = () => {
  const [mapCenter, setMapCenter] = useState({ lat: 18.5204, lng: 73.8567 });
  const [allCountries, setAllCountries] = useState([]);
  const [allStates, setAllStates] = useState([]);
  const [address, setAddress] = useState("");
  const [addressArea, setAddressArea] = useState("");
  const [city, setCity] = useState("");
  const [locality, setLocality] = useState("");
  const [subLocality, setSubLocality] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const autoCompleteRef = useRef(null);
  const GOOGLE_MAPS_API_KEY = "AIzaSyAUCNwxnNo52kFWJNGhRVj-AnkoffmzYe0";
  // const { isLoaded } = useJsApiLoader({
  //   googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  //   libraries: ["places"],
  // });
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const userId = sessionStorage.getItem("accessToken");
  // Login may save this key as "user_type" or "User_Type", so check both.
  const userType =
    sessionStorage.getItem("user_type") || sessionStorage.getItem("User_Type") || "";
  const user_name = sessionStorage.getItem("user_name");
  const Mobile_Number = sessionStorage.getItem("Mobile_Number");
  const user_email = sessionStorage.getItem("user_email");
  const [virtualTourLink, setVirtualTourLink] = useState("");
  const [propertyName, setPropertyName] = useState("");
  const [markAsFeatured, setMarkAsFeatured] = useState("No");
  const [adminApproval, setAdminApproval] = useState("Pending");
  const [propertyPrice, setPropertyPrice] = useState("");
  const [bhkType, setBhkType] = useState("");
  const [bathroom, setBathroom] = useState("");
  // const [area, setArea] = useState("");
  // const [areaIn, setAreaIn] = useState("");
  // const [areaType, setAreaType] = useState("");
  const [propertyDescription, setPropertyDescription] = useState("");
  const [units, setUnits] = useState("");
  const [plotNo, setPlotNo] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableOn, setAvailableOn] = useState("");
  const [operatingSince, setOpertingSince] = useState("");
  const [furnishedType, setFurnishedType] = useState("");
  const [totalFloor, setTotalFloor] = useState("");
  const [propertyFloor, setPropertyFloor] = useState("");
  const [block, setblock] = useState("");
  const [security, setSecurity] = useState("");
  const [activeStatus, setActiveStatus] = useState("");
  const [availableStatus, setAvailableStatus] = useState("");
  const [amenities, setAmenities] = useState("");
  const [possessionStatus, setPossessionStatus] = useState("");
  const [possessionDate, setPossessionDate] = useState("");
  const [ageOfProperty, setAgeOfProperty] = useState("");
  const [coveredParking, setCoveredParking] = useState("");
  const [uncoveredParking, setUncoveredParking] = useState("");
  const [balcony, setBalcony] = useState("");
  const [powerBackup, setPowerBackup] = useState("");
  const [facing, setFacing] = useState("");
  const [view, setView] = useState("");
  const [flooring, setFlooring] = useState("");
  const [waterSource, setWaterSource] = useState("");
  const [additionalRooms, setAdditionalRooms] = useState("");
  const [liftAvailability, setLiftAvailability] = useState("");
  const [loanAvailability, setLoanAvailability] = useState("");
  const [propertyNo, setPropertyNo] = useState("");
  const [officeSpaceType, setOfficeSpaceType] = useState("");
  const [pantry, setPantry] = useState("");
  const [personalWashroom, setPersonalWashroom] = useState("No");
  const [ceilingHeight, setCeilingHeight] = useState("");
  const [parkingAvailability, setParkingAvailability] = useState("");
  const [seatType, setSeatType] = useState("");
  const [numberOfSeatsAvailable, setNumberOfSeatsAvailable] = useState("");
  const [rent, setRent] = useState("");
  const [rentDuration, setRentDuration] = useState("");
  const [maintenanceCost, setMaintenanceCost] = useState("");
  const [maintenanceFrequency, setMaintenanceFrequency] = useState("");
  const [maintenanceIncluded, setMaintenanceIncluded] = useState("");
  const [securityDepositType, setSecurityDepositType] = useState("");
  const [securityDepositAmount, setSecurityDepositAmount] = useState("");
  const [customDepositAmount, setCustomDepositAmount] = useState("");
  const [availableForCompanyLease, setAvailableForCompanyLease] = useState("");
  const [availableFor, setAvailableFor] = useState("");
  const [suitedFor, setSuitedFor] = useState("");
  const [roomType, setRoomType] = useState("");
  const [foodAvailable, setFoodAvailable] = useState("");
  const [foodChargesIncluded, setFoodChargesIncluded] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("");
  const [noticePeriodOtherDays, setNoticePeriodOtherDays] = useState("");
  const [electricityChargesIncluded, setElectricityChargesIncluded] =
    useState("");
  const [totalBeds, setTotalBeds] = useState("");
  const [pgRules, setPgRules] = useState("");
  const [gateClosingTime, setGateClosingTime] = useState("");
  const [gateClosingHour, setGateClosingHour] = useState("");
  const [pgServices, setPgServices] = useState("");
  const [minLockinPeriod, setMinLockinPeriod] = useState("");
  const [amenitiesList, setAmenitiesList] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const history = useHistory();

  // Only logged-in users can open this page
  const isLoggedIn = !!sessionStorage.getItem("accessToken");
  useEffect(() => {
    if (!isLoggedIn) {
      history.replace("/login");
    }
  }, [isLoggedIn, history]);
  const [showFeaturePopup, setShowFeaturePopup] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [freePostCount, setFreePostCount] = useState(0);
  const [paidPostCount, setPaidPostCount] = useState(0);
  const [featureCount, setFeatureCount] = useState(0);
  const [isPostCountLoaded, setIsPostCountLoaded] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  // Latest validation result, so the toast can name the exact fields that are missing
  const lastErrors = useRef({});
  const [isStepValid, setIsStepValid] = useState(true);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [officeSubType, setOfficeSubType] = useState("");
  const [RetailSubType, setRetailSubType] = useState("");
  const [landType, setLandType] = useState("");
  const [washroom, setWashroom] = useState("No");
  const [conferenceRoom, setConferenceRoom] = useState("No");
  const [lengthOfLand, setLengthOfLand] = useState("");
  const [breadthOfLand, setBreadthOfLand] = useState("");
  const [openSidesOfLand, setOpenSidesOfLand] = useState("");
  const [typeOfConstruction, setTypeOfConstruction] = useState("");
  const [builtUpArea, setBuiltUpArea] = useState("");
  const [builtUpAreaUnit, setBuiltUpAreaUnit] = useState("");
  const [retailLocation, setRetailLocation] = useState("");
  const [storageType, setStorageType] = useState("");
  const [industryType, setIndustryType] = useState("");
  const [hospitalityType, setHospitalityType] = useState("");
  const [builderFloorType, setBuilderFloorType] = useState("");
  const [noOfCabines, setNoOfCabines] = useState("");
  const [noOfMeetingRooms, setNoOfMeetingRooms] = useState("");
  const [noOfConferenceRoom, setNoOfConferenceRoom] = useState("");
  const [receptionArea, setReceptionArea] = useState("");
  const [centralAC, setCentralAC] = useState("");
  const [retailWashroom, setRetailWashroom] = useState("");
  const [parkingTypes, setParkingTypes] = useState("");
  const [possessionBy, setPossessionBy] = useState("");
  const [totalNumberOfRooms, setTotalNumberOfRooms] = useState("");
  const [qualityRating, setQualityRating] = useState("");
  const [totalNumberParking, setTotalNumberParking] = useState("");
  //const [priceOnwards, setPriceOnwards] = useState(false);
  const [priceNegotiable, setPriceNegotiable] = useState(false);
  const [electricityAndWaterCharges, setElectricityAndWaterCharges] =
    useState(false);
  const [noOfPeoples, setNoOfPeoples] = useState("");
  const [availableBeds, setAvailableBeds] = useState("");
  const [attachedBalcony, setAttachedBalcony] = useState(false);
  const [attachedBathroom, setAttachedBathroom] = useState(false);
  const [carpetArea, setCarpetArea] = useState("");
  const [carpetAreaUnit, setCarpetAreaUnit] = useState("");
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isLaterSelected, setIsLaterSelected] = useState(false);



  const generateDescription = async () => {
  try {
    setIsGeneratingDescription(true);

    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/cust_api/generate-property-description/`,
      {
        form_type: "property",

        property_name: formData?.property_name?.trim() || "",
        building_type: formData.building_type || "",
        property_type: propertyType || "",
        user_type: formData.user_type || "",
        property_category_type: propertyCategory || "",

        property_price: formData.property_price || "",
        rent: formData.rent || "",

        address: formData.address || "",
        address_area: addressArea || "",
        city_name: city?.trim() || "",
        state: formData.state || "",
        country: formData.country || "",

        bhk_type: formData.bhk_type || "",
        bathroom: formData.bathroom || "",

        area: builtUpArea || "",
        area_in: builtUpAreaUnit || "",

        carpet_area: carpetArea || "",
        carpet_area_unit: carpetAreaUnit || "",

        furnished_type: formData.furnished_type || "",

        property_floor: formData.property_floor || "",
        total_floor: formData.total_floor || "",

        age_of_property: formData.age_of_property || "",
        facing: formData.facing || "",
        balcony: formData.balcony || "",

        covered_parking: formData.covered_parking || "",
        uncovered_parking: formData.uncovered_parking || "",
        parking_availability: formData.parking_availability || "",
        parking_types: formData.parking_types || "",

        lift_availability: formData.lift_availability || "",
        power_backup: formData.power_backup || "",

        possession_status: formData.possession_status || "",
        additional_rooms: formData.additional_rooms || "",

        developer: formData.developer || "",
        amenities: formData.amenities || "",

        // Commercial
        office_type: formData.office_type || "",
        office_space_type: formData.office_space_type || "",
        land_type: formData.land_type || "",
        conferenceRoom: formData.conferenceRoom || "",
        washroom_Check: formData.washroom_Check || "",
        reception_area: formData.reception_area || "",
        pantry: formData.pantry || "",
        cabines: formData.cabines || "",
        meeting_rooms: formData.meeting_rooms || "",
        central_AC: formData.central_AC || "",

        // PG / Co-living
        room_type: formData.room_type || "",
        food_available: formData.food_available || "",
        total_beds: formData.total_beds || "",
        available_beds: formData.available_beds || "",
        suited_for: formData.suited_for || "",
        available_for: formData.available_for || "",

        // Additional
        ownership: formData.ownership || "",
        price_onwards: formData.price_onwards || "",
        price_negotiable: formData.price_negotiable || "",
        all_inclusive_price: formData.all_inclusive_price || "",
        tax_and_goverment_charges:
          formData.tax_and_goverment_charges || "",
        electricity_and_water_charges:
          formData.electricity_and_water_charges || "",
      }
    );

    const description = response?.data?.description || "";

    if (response?.data?.status === 1) {
      setPropertyDescription(description);

      setFormData((prev) => ({
        ...prev,
        property_description: description,
      }));

      toast.success("Description generated successfully");
    } else {
      toast.error(
        response?.data?.message || "Failed to generate description"
      );
    }
  } catch (error) {
    console.error("Generate Description Error:", error);
    toast.error(
      error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to generate description",
    );
  } finally {
    setIsGeneratingDescription(false);
  }
};

  useEffect(() => {
    const countries = Country.getAllCountries();
    setAllCountries(countries);
  }, []);

  useEffect(() => {
    if (country) {
      const states = State.getStatesOfCountry(country);
      setAllStates(states);
    } else {
      setAllStates([]);
    }
  }, [country]);

  const CustomMultiValue = (props) => {
    return (
      <components.MultiValue {...props}>
        <div title={props.data.label} className="flex items-center">
          {props.children}
        </div>
      </components.MultiValue>
    );
  };

  const officeOptions = [
    "Ready to Move Office Space",
    "Bare Shell Office Space",
    "Co-working Office Space",
  ];

  const landOptions = [
    "Commercial Land/Inst. Land",
    "Industrial Lands/Plots",
    "Agricultural/Farm Land",
  ];

  const constructionOptions = ["Shed", "Rooms", "Washroom", "Others"];
  const retailOptions = ["Commercial Shops", "Commercial Showrooms"];

  const storageOptions = ["Ware House", "Cold Storage"];

  const industryOptions = ["Factory", "Manufacturing"];

  const builderFloorOptions = ["Single Floor", "Duplex", "Triplex"];

  const hospitalityOptions = ["Hotel/Resorts", "Guest-House/Banquet-Halls"];

  const retailLocationOptions = [
    "Mall",
    "Commercial Project",
    "Residential Project",
    "Retail Complex/Building",
    "Market/High Street",
    "Others",
  ];

  const options = [
    { value: "Pooja Room", label: "Pooja Room" },
    { value: "Servant Room", label: "Servant Room" },
    { value: "Study Room", label: "Study Room" },
    { value: "Extra Room", label: "Extra Room" },
  ];

  const roomOptions = [
    { label: "Private", value: "Private" },
    { label: "Sharing", value: "Sharing" },
    // { label: "Triple Sharing", value: "Triple Sharing" },
    // { label: "Quad Sharing", value: "Quad Sharing" },
  ];

  const pgRuleOptions = [
    { label: "1. No Smoking", value: "No Smoking" },
    { label: "2. No Guardian Stay", value: "No Guardian Stay" },
    { label: "3. No Drinking", value: "No Drinking" },
    { label: "4. No Non-Veg", value: "No Non-Veg" },
    { label: "5. Visitor Allow", value: "Visitor Allow" },
    { label: "6. Party", value: "Party" },
    { label: "7. Loud Music", value: "Loud Music" },
    { label: "8. Opposite Gender", value: "Opposite Gender" },
  ];

  const foodOptions = [
    { label: "Breakfast", value: "Breakfast" },
    { label: "Lunch", value: "Lunch" },
    { label: "Dinner", value: "Dinner" },
  ];

  useEffect(() => {
    const checkPostLimits = async () => {
      try {
        const profileForm = new FormData();
        profileForm.append("user_id", userId);

        const profileResponse = await axios.post(
          `${process.env.REACT_APP_API_URL}/cust_api/get_profile`,
          profileForm,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        );

        const countData = profileResponse?.data?.count_data;

        if (countData) {
          setFreePostCount(countData.free_post_count || 0);
          setPaidPostCount(countData.paid_post_count || 0);
          setFeatureCount(countData.feature_count || 0);
        }

        setIsPostCountLoaded(true);
      } catch (error) {
        console.error("Error checking post limits:", error);
        setIsPostCountLoaded(true);
      }
    };

    if (userId) {
      checkPostLimits();
    }
  }, [userId]);

  useEffect(() => {
    if (isPostCountLoaded) {
      // Check both conditions only after data is loaded
      if (freePostCount <= 0 && paidPostCount <= 0) {
        setShowModal(true);
      } else {
        setShowModal(false);
      }
    }
  }, [freePostCount, paidPostCount, isPostCountLoaded]);

  useEffect(() => {
    if (showModal) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    // Cleanup on component unmount
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [showModal]);

  // Three visible steps. Each groups the original step numbers, so the
  // field logic, validation and submit stay exactly as they were.
  const steps = ["Basic Info & Address", "Property Details & Amenities", "Photos & Videos"];
  const UI_STEP_LOGICAL = [[0, 1], [2, 3], [4]];
  const [activeStep, setActiveStep] = useState(0);
  const uiStep = activeStep <= 1 ? 0 : activeStep <= 3 ? 1 : 2;

  const prevStep = () => {
    if (uiStep === 0) return;
    setActiveStep(UI_STEP_LOGICAL[uiStep - 1][0]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const nextStep = () => {
    const finished = UI_STEP_LOGICAL[uiStep];
    setCompletedSteps((prev) => Array.from(new Set([...prev, ...finished])));
    setActiveStep(UI_STEP_LOGICAL[Math.min(uiStep + 1, steps.length - 1)][0]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [propertyCategory, setPropertyCategory] = useState("Buy");
  const [buildingType, setBuildingType] = useState("Residential");
  const [propertyType, setPropertyType] = useState("Apartment");
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,

      building_type: buildingType,
      property_category_type: propertyCategory,
      property_type: propertyType,

      sub_sub_property_type:
        propertyType === "Retail" ? prev.sub_sub_property_type : "",

      office_type: [
        "Retail",
        "Office Space",
        "Land",
        "Storage",
        "Industry",
        "Hospitality",
      ].includes(propertyType)
        ? prev.office_type
        : "",
    }));
  }, [propertyCategory, buildingType, propertyType]);
  const propertyCategories = ["Buy", "Rent", "Paying Guest"];
  const buildingTypes = ["Residential", "Commercial"];
  const [propertyTypes, setPropertyTypes] = useState([
    "Apartment",
    "Plot",
    "Independent House/Villa",
    "Independent/Builder Floor",
    "1RK/Studio Apartment",
    "Service Apartment",
  ]);

  useEffect(() => {
    if (propertyCategory === "Buy" && buildingType === "Commercial") {
      setPropertyTypes([
        "Office Space",
        "Retail",
        "Land",
        // "Office Space in IT/SEZ",
        "Storage",
        // "Warehouse",
        "Industry",
        "Hospitality",
        "Other",
      ]);
      setPropertyType("Office Space");
    } else if (propertyCategory === "Buy" && buildingType === "Residential") {
      setPropertyTypes([
        "Apartment",
        "Plot",
        "Independent House/Villa",
        "Independent/Builder Floor",
        "1RK/Studio Apartment",
        "Service Apartment",
        "Farmhouse",
        "Other",
      ]);
      setPropertyType("Apartment");
    }
  }, [propertyCategory, buildingType]);

  useEffect(() => {
    if (propertyCategory === "Paying Guest" && buildingType === "Residential") {
      setPropertyTypes([
        "Apartment", // Flat/Apartment
        "Builder Floor", // Builder Floor
        "1RK/Studio Apartment",
        "Independent House/Villa",
        "Service Apartment", // Serviced Apartment
      ]);

      setPropertyType("Apartment");
    }
  }, [propertyCategory, buildingType]);

  useEffect(() => {
    if (propertyCategory === "Rent" && buildingType === "Commercial") {
      setPropertyTypes([
        "Office Space",
        "Retail",
        "Land",
        // "Office Space in IT/SEZ",
        "Storage",
        // "Warehouse",
        "Industry",
        "Hospitality",
        "Other",
      ]);
      setPropertyType("Office Space");
    } else if (propertyCategory === "Rent" && buildingType === "Residential") {
      setPropertyTypes([
        "Apartment",
        // "Plot",
        "Independent House/Villa",
        "Independent/Builder Floor",
        "1RK/Studio Apartment",
        "Service Apartment",
        // "PG",
        "Farmhouse",
        "Other",
      ]);
      setPropertyType("Apartment");
    }
  }, [propertyCategory, buildingType]);

  // Paying Guest supports Residential only. If Commercial was selected before switching,
  // clear it (and the Property Type) and prompt the user to choose a valid Building Type.
  useEffect(() => {
    if (propertyCategory === "Paying Guest" && buildingType === "Commercial") {
      setBuildingType("");
      setPropertyType("");
      setPropertyTypes(PG_PROPERTY_TYPES);
      setFormErrors((prev) => ({ ...prev, building_type: PG_COMMERCIAL_MSG }));
    }
  }, [propertyCategory, buildingType]);

  // Toggle logic for multiple selection
  const toggleAmenity = (amenity) => {
    console.log("Clicked Amenity:", amenity);
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((item) => item !== amenity)
        : [...prev, amenity],
    );
  };

  // Fetch amenities once
  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/cust_api/get_amenities`,
        );

        if (response.data.status === 1) {
          setAmenitiesList(response.data.data);
        } else {
          console.error("Failed to fetch amenities");
        }
      } catch (error) {
        console.error("Error fetching amenities:", error);
      }
    };

    fetchAmenities();
  }, []);

  // Sync selectedAmenities into formData
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      amenities: selectedAmenities,
    }));
  }, [selectedAmenities]);

  useEffect(() => {
    if (propertyType === "1RK/Studio Apartment") {
      setFormData((prev) => ({
        ...prev,
        bhk_type: "1 RK",
      }));
    }
  }, [propertyType]);

  const [videoURL, setVideoURL] = useState("");
  const [videoSource, setVideoSource] = useState("");

  // Cover Images -
  const [coverImage, setCoverImage] = useState("");
  const imageInputRef = useRef(null);

  const handelCoverImageDelete = () => {
    setCoverImage(null);
  };

  // Properties Images -
  const fileInputRef2 = useRef();
  const [propertyimages, setPropertyImages] = useState([]);
  const [fileData2, setFileData2] = useState([]);

  const imageInputRef2 = useRef(null);
  const handleImageUpload2 = (input) => {
    // input can be event or array of files
    let files = [];

    if (input && input.target && input.target.files) {
      // called from <input onChange>
      files = Array.from(input.target.files);
    } else if (Array.isArray(input)) {
      // called from drag-drop with files array
      files = input;
    } else {
      return; // invalid input
    }

    const maxSize = 50 * 1024 * 1024; // 50MB

    let oversizeFound = false;
    let oversizedFiles = [];
    let newImages = [];
    let newFiles = [];

    for (let file of files) {
      if (file.size > maxSize) {
        oversizeFound = true;
        oversizedFiles.push(file.name);
      } else {
        newImages.push(URL.createObjectURL(file));
        newFiles.push(file);
      }
    }

    if (oversizeFound) {
      toast.error(
        `The following images are larger than 50MB: ${oversizedFiles.join(", ")}`,
      );
    }

    if (propertyimages.length + newImages.length > MAX_PROPERTY_PHOTOS) {
      toast.error(`You can only upload a maximum of ${MAX_PROPERTY_PHOTOS} images.`);
      if (input.target) {
        input.target.value = "";
      }
      return;
    }

    setPropertyImages((prev) => [...prev, ...newImages]);
    setFileData2((prev) => [...prev, ...newFiles]);

    // Clear the file input value if this was an event
    if (input.target) {
      input.target.value = "";
    }
  };

  const handleDelete2 = (index) => {
    const updatedImages = propertyimages.filter((_, i) => i !== index);
    setPropertyImages(updatedImages);
    // keep the files that will be uploaded in step with the previews that are shown
    setFileData2((prev) => prev.filter((_, i) => i !== index));
  };

  // Video Upload Section -
  const [video, setVideo] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const videoInputRef = useRef();

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    const maxSize = 10 * 1024 * 1024;

    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Only video files are allowed.");
      return;
    }

    if (file.size > maxSize) {
      toast.error("Video must be smaller than 10MB.");
      return;
    }

    if (video) {
      toast.error("Only one video allowed.");
      return;
    }
    setVideo(URL.createObjectURL(file));
    setVideoFile(file);
  };

  const handleVideoDelete = () => {
    setVideo(null);
    setVideoFile(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  };

  const handlePlaceChanged = () => {
    const place = autoCompleteRef.current.getPlace();

    if (!place.geometry || !place.address_components) return;

    const location = place.geometry.location;
    setMapCenter({
      lat: location.lat(),
      lng: location.lng(),
    });

    setLatitude(location.lat().toString());
    setLongitude(location.lng().toString());

    setAddress(place.formatted_address || "");

    let extractedCountry = "";
    let extractedState = "";
    let extractedCity = "";
    let extractedZip = "";
    let extractedLocality = "";
    let extractedSubLocality = "";

    place.address_components.forEach((component) => {
      const types = component.types;

      if (types.includes("country")) {
        extractedCountry = component.short_name; // Use "IN", "US", etc.
      }

      if (types.includes("administrative_area_level_1")) {
        extractedState = component.long_name; // Like "Maharashtra"
      }

      if (types.includes("locality")) {
        extractedCity = component.long_name;
      }

      if (types.includes("postal_code")) {
        extractedZip = component.long_name;
      }

      if (types.includes("sublocality_level_1")) {
        extractedLocality = component.long_name;
      }

      if (types.includes("sublocality_level_2")) {
        extractedSubLocality = component.long_name;
      }
    });

    // Set address fields
    setCity(CITY_OPTIONS.includes(extractedCity) ? extractedCity : "");
    setZipCode(extractedZip);
    setLocality(extractedLocality);
    setSubLocality(extractedSubLocality);

    const addressArea =
      extractedLocality && extractedCity
        ? `${extractedLocality}, ${extractedCity}`
        : extractedCity || extractedLocality || "";
    setAddressArea(addressArea);

    // Match the country from allCountries by ISO code
    const matchedCountry = allCountries.find(
      (c) => c.isoCode === extractedCountry,
    );
    if (matchedCountry) {
      setCountry(matchedCountry.isoCode);

      // Now set matching state
      const states = State.getStatesOfCountry(matchedCountry.isoCode);
      setAllStates(states);

      const matchedState = states.find(
        (s) => s.name.toLowerCase() === extractedState.toLowerCase(),
      );
      if (matchedState) {
        setState(matchedState.name);
      } else {
        setState("");
      }
    } else {
      setCountry("");
      setState("");
    }
  };

  const [formData, setFormData] = useState({
    user_id: userId,
    connect_to_name: user_name,
    connect_to_no: Mobile_Number,
    connect_to_email: user_email,
    building_type: buildingType,
    property_category_type: propertyCategory,
    user_type: userType,
    property_type: propertyType,
    ownership: "",
    all_inclusive_price: "No",
    price_onwards: "No",
    price_negotiable: "No",
    tax_and_goverment_charges: "No",
    property_dimensions_length: lengthOfLand,
    property_dimensions_breadth: breadthOfLand,
    property_name: propertyName,
    mark_as_featured: markAsFeatured,
    property_price: propertyPrice,
    bhk_type: bhkType,
    bathroom: bathroom,
    no_of_cabines: noOfCabines,
    no_of_meeting_Rooms: noOfMeetingRooms,
    no_of_conference_room: noOfConferenceRoom,
    reception_area: receptionArea,
    central_AC: centralAC,
    parking_types: parkingTypes,
    possession_by: possessionBy,
    total_number_of_rooms: totalNumberOfRooms,
    quality_rating: qualityRating,
    total_number_parking: totalNumberParking,
    electricity_and_water_charges: "No",
    no_of_peoples: noOfPeoples,
    available_beds: availableBeds,
    attached_balcony: "No",
    attached_bathroom: "No",
    // area: area,
    // area_in: areaIn,
    // area_type: areaType,
    property_description: propertyDescription,
    units: units,
    plot_no: plotNo,
    available_from: "",
    available_on: availableOn,
    operating_since: operatingSince,
    furnished_type: furnishedType,
    total_floor: totalFloor,
    property_floor: propertyFloor,
    block: block,
    security: security,
    active_status: activeStatus,
    available_status: availableStatus,
    admin_approval: adminApproval,
    possession_status: possessionStatus,
    possession_date: possessionDate,
    age_of_property: ageOfProperty,
    covered_parking: coveredParking,
    uncovered_parking: uncoveredParking,
    balcony: balcony,
    power_backup: powerBackup,
    facing: facing,
    view: view,
    flooring: flooring,
    // property_video: video,
    water_source: waterSource,
    additional_rooms: additionalRooms,
    lift_availability: liftAvailability,
    loan_availability: loanAvailability,
    property_no: propertyNo,
    office_space_type: officeSpaceType,
    pantry_option: pantry,
    investment_options: "",
    purchase_type: "",
    sub_sub_property_type: "",
    builder_floor_type: builderFloorType,
    personal_washroom: personalWashroom,
    ceiling_height: ceilingHeight,
    parking_availability: parkingAvailability,
    seat_type: seatType,
    number_of_seats_available: numberOfSeatsAvailable,
    rent: rent,
    rent_duration: rentDuration,
    maintenance_cost: maintenanceCost,
    maintenance_frequency: maintenanceFrequency,
    maintenance_included: maintenanceIncluded,
    security_deposit_type: securityDepositType,
    security_deposit_amount: securityDepositAmount,
    custom_deposit_amount: customDepositAmount,
    available_for_company_lease: availableForCompanyLease,
    available_for: availableFor,
    suited_for: suitedFor,
    room_type: roomType,
    food_available: foodAvailable,
    food_charges_included: foodChargesIncluded,
    notice_period: noticePeriod,
    notice_period_other_days: noticePeriodOtherDays,
    electricity_charges_included: electricityChargesIncluded,
    total_beds: totalBeds,
    pg_rules: pgRules,
    gate_closing_time: gateClosingTime,
    gate_closing_hour: gateClosingHour,
    pg_services: pgServices,
    min_lockin_period: minLockinPeriod,
    video_url: videoURL,
    video_url_type: videoSource,
    virtual_tour_availability: virtualTourLink,
    office_type: officeSubType,
    washroom: "No",
    commercial_washroom: "",
    conferenceRoom: conferenceRoom,
    // length_of_land: lengthOfLand,
    // breadthOfLand: breadthOfLand,
    openSidesOfLand: openSidesOfLand,
    type_of_construction: typeOfConstruction,
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      attached_balcony: attachedBalcony ? "Yes" : "No",
      attached_bathroom: attachedBathroom ? "Yes" : "No",
    }));
  }, [attachedBalcony, attachedBathroom]);
  useEffect(() => {
    if (propertyCategory !== "Paying Guest" || propertyType !== "Apartment") {
      setAvailableBeds("");

      setFormData((prev) => ({
        ...prev,
        available_beds: "",
      }));
    }
  }, [propertyCategory, propertyType]);

  useEffect(() => {
    if (roomType !== "Sharing") {
      setNoOfPeoples("");

      setFormData((prev) => ({
        ...prev,
        no_of_peoples: "",
      }));
    }
  }, [roomType]);
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      price_negotiable: priceNegotiable ? "Yes" : "No",
      electricity_and_water_charges: electricityAndWaterCharges ? "Yes" : "No",
    }));
  }, [priceNegotiable, electricityAndWaterCharges]);
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      total_number_parking: totalNumberParking,
    }));
  }, [totalNumberParking]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      quality_rating: qualityRating,
    }));
  }, [qualityRating]);
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      total_number_of_rooms: totalNumberOfRooms,
    }));
  }, [totalNumberOfRooms]);
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      possession_by: possessionBy,
    }));
  }, [possessionBy]);
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      parking_types: parkingTypes,
    }));
  }, [parkingTypes]);

  // useEffect(() => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     washroom: retailWashroom,
  //   }));
  // }, [retailWashroom]);
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      central_AC: centralAC,
    }));
  }, [centralAC]);
  useEffect(() => {
  setFormData((prev) => ({
    ...prev,
    pantry_option: pantry,
  }));
}, [pantry]);
useEffect(() => {
  setFormData((prev) => ({
    ...prev,
    reception_area: receptionArea,
  }));
}, [receptionArea]);
  // useEffect(() => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     commercial_washroom: retailWashroom,
  //   }));
  // }, [retailWashroom]);
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      no_of_cabines: noOfCabines,
      no_of_meeting_Rooms: noOfMeetingRooms,
      no_of_conference_room: noOfConferenceRoom,
    }));
  }, [noOfCabines, noOfMeetingRooms, noOfConferenceRoom]);
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      builder_floor_type: builderFloorType,
    }));
  }, [builderFloorType]);
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      type_of_construction: typeOfConstruction,
    }));
  }, [typeOfConstruction]);
  useEffect(() => {
  setFormData((prev) => ({
    ...prev,
    property_dimensions_length: lengthOfLand,
    property_dimensions_breadth: breadthOfLand,
  }));
}, [lengthOfLand, breadthOfLand]);
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      conferenceRoom: conferenceRoom,
    }));
  }, [conferenceRoom]);
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      commercial_washroom: washroom,
    }));
  }, [washroom]);
  useEffect(() => {
    if (
      propertyCategory === "Rent" &&
      buildingType === "Residential" &&
      [
        "Apartment",
        "Independent House/Villa",
        "Independent/Builder Floor",
        "1RK/Studio Apartment",
        "Service Apartment",
        "Plot",
        "PG",
      ].includes(propertyType)
    ) {
      setRentDuration("Per Month"); // keep state in sync
      setFormData((prev) => ({
        ...prev,
        rent_duration: "Per Month",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        rent_duration: rentDuration,
      }));
    }
  }, [propertyCategory, buildingType, propertyType]);

  // Inside your component
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.user_type) {
      toast.error("Your session has expired. Please log in again.");
      return;
    }

    setIsSubmitting(true);
    const form = new FormData();
    for (const key in formData) {
      if (key === "property_category_type") {
        let apiValue = formData[key];

        if (apiValue === "Buy" && buildingType === "Residential") {
          apiValue = "Buy";
        } else if (apiValue === "Buy" && buildingType === "Commercial") {
          apiValue = "Buy";
        } else if (apiValue === "Rent" && buildingType === "Residential") {
          apiValue = "Rent";
        } else if (apiValue === "Rent" && buildingType === "Commercial") {
          apiValue = "Rent";
        } else if (apiValue === "Paying Guest") {
          apiValue = "PG/Co-living";
        }

        form.append("property_category_type", apiValue);
      } else if (key === "property_type") {
        let apiValue = formData[key];

        if (formData[key] === "Plot") {
          apiValue = "Plot/Land";
        }

        if (formData[key] === "Land") {
          apiValue = "Plot/Land";
        }

        if (formData[key] === "Office Space") {
          apiValue = "Office";
        }

        form.append(key, apiValue);
      } else {
        form.append(key, formData[key] ?? "");
      }
    }
    form.append("area", builtUpArea);
    form.append("area_in", builtUpAreaUnit);

    form.append("carpet_area", carpetArea);
    form.append("carpet_area_unit", carpetAreaUnit);

    // Append amenities as array
    for (let pair of form.entries()) {
      console.log(pair[0], pair[1]);
    }

    // Location fields
    form.append("address", address);
    form.append("address_area", addressArea);
    form.append("city_name", city);
    form.append("country", country);
    form.append("state", state);
    form.append("zip_code", zipCode);
    form.append("latitude", latitude);
    form.append("longitude", longitude);
    form.append("conferenceRoom", conferenceRoom);
    // form.append("land_type", landType);
    form.append(
      "office_type",
      propertyType === "Retail"
        ? RetailSubType
        : propertyType === "Land"
          ? landType
          : propertyType === "Storage"
            ? storageType
            : propertyType === "Industry"
              ? industryType
              : propertyType === "Hospitality"
                ? hospitalityType
                : officeSubType,
    );
    // Cover image
    if (coverImage) {
      form.append("cover_image", coverImage);
    }

    // Video file
    if (videoFile) {
      form.append("property_video", videoFile);
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/cust_api/post_property`,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const propertyData = response.data;
      const property_id = propertyData?.data?._id;

      // Upload images
      let imagesSuccess = 0;
      let imagesFailure = 0;

      for (let i = 0; i < fileData2.length; i++) {
        const imageForm = new FormData();
        imageForm.append("property_id", property_id);
        imageForm.append("property_image", fileData2[i]);

        try {
          const res = await fetch(
            `${process.env.REACT_APP_API_URL}/cust_api/add_property_images`,
            {
              method: "POST",
              body: imageForm,
            },
          );
          if (res.ok) {
            imagesSuccess += 1;
          } else {
            imagesFailure += 1;
          }
        } catch (uploadError) {
          imagesFailure += 1;
        }
      }

      if (imagesFailure > 0) {
        toast.warning(
          `${imagesFailure} of ${fileData2.length} photos could not be uploaded. You can add them again by editing the property.`,
        );
      }

      toast.success("Property posted successfully.");
      history.push({
        pathname: "/dashboard",
        state: { page: "myProperties" },
      });
    } catch (error) {
      console.error("Error posting property:", error);
      toast.error(
        error?.response?.data?.message || "Failed to post property.",
      );
      history.push({
        pathname: "/dashboard",
        state: { page: "myProperties" },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Any edit clears that field's error straight away
    clearFormError(name);

    setFormData((prev) => {
      const updatedData = {
        ...prev,
        [name]: value,
      };

      // if (name === "available_from") {
      //   updatedData.isImmediateAvailable =
      //     value === "Immediately" ? "Yes" : "No";

      // if (name === "available_from") {
      //   updatedData.available_from = "Immediately";
      //   updatedData.isImmediateAvailable = "Yes";
      //   updatedData.possession_date = new Date().toISOString().split("T")[0];

      //   updatedData.possession_date =
      //     value === "Immediately"
      //       ? new Date().toISOString().split("T")[0]
      //       : prev.possession_date;

      //   // remove available_from when Later selected
      //   if (value === "Later") {
      //     delete updatedData.available_from;
      //   }
      // }
      if (name === "available_from") {
  updatedData.available_from = value;

  updatedData.isImmediateAvailable =
    value === "Immediately" ? "Yes" : "No";

  if (value === "Immediately") {
    updatedData.possession_date = new Date()
      .toISOString()
      .split("T")[0];
  }
}

      return updatedData;
    });
  };

  // clears one field's error message as soon as the user edits that field
  const clearFormError = (key) =>
    setFormErrors((prev) => (prev[key] ? { ...prev, [key]: "" } : prev));

  const handleBuildingTypeChange = (type) => {
    setBuildingType(type);
    setFormData({ ...formData, building_type: type });
    setFormErrors((prev) => ({ ...prev, building_type: "" }));
  };

  useEffect(() => {
    if (showModal || showFeaturePopup) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal, showFeaturePopup]);

  // Inline Error -
  const validateStepFields = (stepIdxs = [activeStep]) => {
    const errors = {};

    if (stepIdxs.includes(0)) {
      const nameError = validateBuildingName(formData.property_name);
      if (nameError) {
        errors.property_name = nameError;
      }
      // Building Type and Property Type are mandatory (NWB-BUG-046, 047, 048, 049)
      if (!buildingType) {
        errors.building_type = "Please select a Building Type";
      }
      if (!propertyType) {
        errors.property_type = "Please select a Property Type";
      }
    }

    if (stepIdxs.includes(1)) {
      const addressError = validateAddress(address);
      if (addressError) {
        errors.address = addressError;
      }
      if (!country?.trim()) {
        errors.country = "country is required";
      }
      if (!state?.trim()) {
        errors.state = "state is required";
      }
      const zipError = validateZip(country, zipCode);
      if (zipError) {
        errors.zipCode = zipError;
      }
      const cityError = CITY_OPTIONS.includes(city)
        ? ""
        : "Please select a city from the list";
      if (cityError) {
        errors.city = cityError;
      }

      // keep the trimmed values (leading / trailing / repeated spaces removed)
      if (!errors.address && cleanSpaces(address) !== address) {
        setAddress(cleanSpaces(address));
      }
      if (!errors.city && cleanSpaces(city) !== city) {
        setCity(cleanSpaces(city));
      }
      if (!errors.zipCode && zipCode !== String(zipCode).trim()) {
        setZipCode(String(zipCode).trim());
      }
    }

    if (stepIdxs.includes(2)) {
      // if (!(propertyCategory === "Rent")) {
      //   if (!formData.property_price?.trim()) {
      //     errors.property_price = "Property Price is required";
      //   }
      // }
      if (!builtUpArea?.trim()) {
        errors.builtUpArea = "Built-up area is required";
      }

      if (
        propertyCategory === "Buy" &&
        buildingType === "Residential" &&
        propertyType === "Plot"
      ) {
        if (!lengthOfLand) {
          errors.property_dimensions_length = "Length is required";
        }

        if (!breadthOfLand) {
          errors.property_dimensions_breadth = "Breadth is required";
        }
      }
      if (!builtUpAreaUnit?.trim()) {
        errors.builtUpAreaUnit = "Built-up area unit is required";
      }

      if (!carpetArea?.trim()) {
        errors.carpetArea = "Carpet area is required";
      }

      if (!carpetAreaUnit?.trim()) {
        errors.carpetAreaUnit = "Carpet area unit is required";
      }

      if (
        propertyCategory === "Rent" &&
        buildingType === "Residential" &&
        propertyType === "PG"
      ) {
        if (
  !Array.isArray(formData.available_for) ||
  formData.available_for.length === 0
) {
  errors.available_for = "Available For is required";
}
        if (!formData.suited_for?.trim()) {
          errors.suited_for = "Suited For is required";
        }
        if (!formData.room_type || formData.room_type.length === 0) {
          errors.room_type = "Room Type is required";
        }
        if (!formData.food_charges_included?.trim()) {
          errors.food_charges_included = "Food charges inclusion is required";
        }
      }

      if (
        !(
          (propertyCategory === "Buy" &&
            buildingType === "Residential" &&
            propertyType === "Plot") ||
          (propertyCategory === "Rent" &&
            buildingType === "Residential" &&
            propertyType === "Plot") ||
          (propertyCategory === "Rent" &&
            buildingType === "Commercial" &&
            propertyType === "Industry") ||
          (propertyCategory === "Buy" &&
            buildingType === "Commercial" &&
            propertyType === "Land") ||
          (propertyCategory === "Rent" &&
            buildingType === "Commercial" &&
            propertyType === "Land") ||
          (propertyCategory === "Buy" &&
            buildingType === "Commercial" &&
            propertyType === "Industry") ||
          (propertyCategory === "Rent" &&
            buildingType === "Commercial" &&
            propertyType === "Industry") ||
          (propertyCategory === "Rent" &&
            buildingType === "Residential" &&
            propertyType === "PG")
        )
      ) {
        // if (!formData.area_type?.trim()) {
        //   errors.area_type = "Area type is required";
        // }
      }

      // if (
      //   !(
      //     (propertyCategory === "Buy" &&
      //       buildingType === "Residential" &&
      //       propertyType === "Plot") ||
      //     (propertyCategory === "Rent" &&
      //       buildingType === "Residential" &&
      //       propertyType === "Plot") ||
      //     (propertyCategory === "Rent" &&
      //       buildingType === "Residential" &&
      //       propertyType === "PG")
      //   )
      // ) {
      //   if (!formData.units?.trim()) {
      //     errors.units = "Units is required";
      //   }
      // }

      if (
        !(
          (propertyCategory === "Buy" &&
            buildingType === "Residential" &&
            (propertyType === "Apartment" ||
              propertyType === "Independent House/Villa" ||
              propertyType === "Plot")) ||
          (propertyCategory === "Buy" &&
            buildingType === "Residential" &&
            propertyType === "Independent/Builder Floor") ||
          (propertyCategory === "Buy" &&
            buildingType === "Residential" &&
            propertyType === "1RK/Studio Apartment") ||
          (propertyCategory === "Buy" &&
            buildingType === "Residential" &&
            propertyType === "Service Apartment") ||
          (propertyCategory === "Buy" &&
            buildingType === "Commercial" &&
            propertyType === "Storage ") ||
          (propertyCategory === "Buy" &&
            buildingType === "Commercial" &&
            propertyType === "Office Space") ||
          (propertyCategory === "Buy" &&
            buildingType === "Commercial" &&
            propertyType === "Retail") ||
          (propertyCategory === "Buy" &&
            buildingType === "Commercial" &&
            propertyType === "Office Space in IT/SEZ") ||
          (propertyCategory === "Buy" &&
            buildingType === "Commercial" &&
            propertyType === "Storage") ||
          (propertyCategory === "Buy" &&
            buildingType === "Commercial" &&
            propertyType === "Warehouse") ||
          (propertyCategory === "Buy" &&
            buildingType === "Commercial" &&
            propertyType === "Industry") ||
          (propertyCategory === "Buy" &&
            buildingType === "Commercial" &&
            propertyType === "Hospitality") ||
          (propertyCategory === "Buy" &&
            buildingType === "Commercial" &&
            propertyType === "Land")
        )
      ) {
        // Rent input is only shown for Rent / PG listings, so never require it for Buy
        if (propertyCategory === "Buy") {
          // nothing to check
        } else if (!formData.rent?.trim()) {
          errors.rent = "Rent is required";
        } else if (!/^\d+$/.test(formData.rent.trim())) {
          errors.rent = "Rent must be a numeric value";
        }
      }

      // if (propertyCategory === "Rent") {
      //   if (!formData.rent_duration?.trim()) {
      //     errors.rent_duration = "Rent duration is required";
      //   }
      // }

      if (
        !(
          (propertyCategory === "Buy" &&
            buildingType === "Residential" &&
            (propertyType === "Apartment" ||
              propertyType === "Independent House/Villa" ||
              propertyType === "Plot")) ||
          (propertyCategory === "Buy" &&
            buildingType === "Residential" &&
            propertyType === "Independent/Builder Floor") ||
          (propertyCategory === "Buy" &&
            buildingType === "Residential" &&
            propertyType === "1RK/Studio Apartment") ||
          (propertyCategory === "Buy" &&
            buildingType === "Residential" &&
            propertyType === "Service Apartment") ||
          (propertyCategory === "Buy" &&
            buildingType === "Commercial" &&
            propertyType === "Storage") ||
          (propertyCategory === "Buy" &&
            buildingType === "Commercial" &&
            propertyType === "Office Space") ||
          (propertyCategory === "Buy" &&
            buildingType === "Commercial" &&
            propertyType === "Retail") ||
          (propertyCategory === "Buy" &&
            buildingType === "Commercial" &&
            propertyType === "Land") ||
          (propertyCategory === "Buy" &&
            buildingType === "Commercial" &&
            propertyType === "Office Space in IT/SEZ") ||
          (propertyCategory === "Buy" &&
            buildingType === "Commercial" &&
            propertyType === "Storage") ||
          (propertyCategory === "Buy" &&
            buildingType === "Commercial" &&
            propertyType === "Warehouse") ||
          (propertyCategory === "Buy" &&
            buildingType === "Commercial" &&
            propertyType === "Industry") ||
          (propertyCategory === "Buy" &&
            buildingType === "Commercial" &&
            propertyType === "Hospitality")
        )
      ) {
        // The deposit input is bound to security_deposit_amount and only shown for Rent / PG
        if (propertyCategory !== "Buy" && !formData.security_deposit_amount?.trim()) {
          errors.security_deposit_amount = "Security deposit amount is required";
        }
      }

      if (
        !(
          (propertyCategory === "Buy" &&
            buildingType === "Residential" &&
            propertyType === "Plot") ||
          (propertyCategory === "Rent" &&
            buildingType === "Residential" &&
            propertyType === "Plot") ||
          (propertyCategory === "Rent" &&
            buildingType === "Commercial" &&
            propertyType === "Land") ||
          (propertyCategory === "Rent" &&
            buildingType === "Commercial" &&
            propertyType === "Warehouse") ||
          (propertyCategory === "Rent" &&
            buildingType === "Commercial" &&
            propertyType === "Industry") ||
          (propertyCategory === "Buy" &&
            buildingType === "Commercial" &&
            propertyType === "Land") ||
          (propertyCategory === "Buy" &&
            buildingType === "Commercial" &&
            propertyType === "Warehouse") ||
          (propertyCategory === "Buy" &&
            buildingType === "Commercial" &&
            propertyType === "Industry")
        )
      ) {
        if (
  !formData.furnished_type &&
  propertyType !== "Storage"
) {
  errors.furnished_type = "furnished type is required";
}
      }

      // if (
      //   (propertyCategory === "Buy" &&
      //     buildingType === "Residential" &&
      //     propertyType === "Plot") ||
      //   (propertyCategory === "Rent" &&
      //     buildingType === "Residential" &&
      //     propertyType === "Plot")
      // ) {
      //   if (!formData.plot_no?.trim()) {
      //     errors.plot_no = "plot no is required";
      //   }
      // }

      if (
        !(
          (propertyCategory === "Buy" &&
            buildingType === "Residential" &&
            propertyType === "Plot") ||
          (propertyCategory === "Rent" &&
            buildingType === "Residential" &&
            propertyType === "Plot") ||
          buildingType === "Commercial" ||
          (propertyCategory === "Rent" &&
            buildingType === "Residential" &&
            propertyType === "PG")
        )
      ) {
        if (!formData.bhk_type?.trim()) {
          errors.bhk_type = "BHK type is required";
        }
      }
      if (
  propertyCategory === "Buy" &&
  !formData.possession_status?.trim()
) {
  errors.possession_status = "Possession Status is required";
}

if (
  propertyCategory === "Rent" &&
  !(
    (buildingType === "Residential" && propertyType === "Plot") ||
    (buildingType === "Commercial" && propertyType === "Land")
  ) &&
  !formData.available_from?.trim()
) {
  errors.available_from = "Available From is required";
}

      if (formData.possession_status === "Under Construction" ||
        formData.possession_status === "Expected Possession"
      ) {
        if (!formData.possession_date?.trim()) {
          errors.possession_date = "Possession Date is required";
        }
      }
      if (formData.available_from === "Later") {
        if (!formData.possession_date?.trim()) {
          errors.possession_date =
            "Possession Date is required for later availability";
        }
      }
    }

    if (stepIdxs.includes(2)) {
      // Area details: required, greater than 0, not unrealistically small, units required
      const carpetValueError = validateAreaValue("Carpet area", carpetArea, carpetAreaUnit);
      if (carpetValueError) errors.carpetArea = carpetValueError;
      const builtUpValueError = validateAreaValue("Built-up area", builtUpArea, builtUpAreaUnit);
      if (builtUpValueError) errors.builtUpArea = builtUpValueError;

      const carpetUnitError = validateAreaUnit("Carpet area", carpetAreaUnit);
      if (carpetUnitError) errors.carpetAreaUnit = carpetUnitError;
      const builtUpUnitError = validateAreaUnit("Built-up area", builtUpAreaUnit);
      if (builtUpUnitError) errors.builtUpAreaUnit = builtUpUnitError;

      // Carpet vs Built-up must make sense once both are in the same unit.
      {
        const pair = validateAreaPair({
          carpet: carpetArea,
          carpetUnit: carpetAreaUnit,
          builtUp: builtUpArea,
          builtUpUnit: builtUpAreaUnit,
        });
        if (pair.carpetArea && !errors.carpetArea) errors.carpetArea = pair.carpetArea;
        if (pair.builtUpArea && !errors.builtUpArea) errors.builtUpArea = pair.builtUpArea;
      }

      // Property Price (shown for Buy): required and not longer than the maximum
      if (propertyCategory === "Buy") {
        const priceError = validatePropertyPrice(formData.property_price);
        if (priceError) errors.property_price = priceError;
      }

      // Ownership (shown and mandatory for Buy + Residential)
      if (
        propertyCategory === "Buy" &&
        buildingType === "Residential" &&
        !String(formData.ownership || "").trim()
      ) {
        errors.ownership = "Ownership is required";
      }

      // Possession / available date must be a real date with a sensible year
      const possessionDateError = formData.possession_date ? validatePossessionDate(formData.possession_date) : "";
      if (possessionDateError) errors.possession_date = possessionDateError;

      // Flat / House No: special characters alone are not accepted
      const flatNoError = formData.block ? validateFlatNo(formData.block) : "";
      if (flatNoError) errors.block = flatNoError;
    }

    // Amenities are optional (NWB-BUG-079): nothing to validate on this step.

    if (stepIdxs.includes(4)) {
      if (!coverImage) {
        errors.cover_image = "Please upload a cover image";
      }

      // Video link: a source must be chosen first, and the link must be a valid URL
      const videoUrl = String(formData.video_url || "").trim();
      if (videoUrl) {
        if (!String(formData.video_url_type || "").trim()) {
          errors.video_url_type = "Select a video source for the video URL";
        } else {
          const videoUrlError = validateVideoUrl(videoUrl);
          if (videoUrlError) errors.video_url = videoUrlError;
        }
      }
    }

    // Empty required fields get one clear message
    const emptyRequired = {
      property_name: ["Property Name", formData.property_name],
      building_type: ["Property Category", buildingType],
      property_type: ["Property Type", propertyType],
      address: ["Address", address],
      country: ["Country", country],
      state: ["State", state],
      city: ["City", city],
      zipCode: ["Zip Code", zipCode],
      bhk_type: ["BHK / Configuration", formData.bhk_type],
      property_price: ["Expected Price", formData.property_price],
      rent: ["Rent Amount", formData.rent],
      ownership: ["Ownership", formData.ownership],
      possession_status: ["Possession Status", formData.possession_status],
      available_from: ["Available From", formData.available_from],
      possession_date: ["Possession Date", formData.possession_date],
      property_dimensions_length: ["Plot Length", lengthOfLand],
      property_dimensions_breadth: ["Plot Breadth", breadthOfLand],
      builtUpArea: ["Built-up Area", builtUpArea],
      builtUpAreaUnit: ["Built-up Area unit", builtUpAreaUnit],
      carpetArea: ["Carpet Area", carpetArea],
      carpetAreaUnit: ["Carpet Area unit", carpetAreaUnit],
      furnished_type: ["Furnishing Type", formData.furnished_type],
      cover_image: ["Cover Image", coverImage],
    };
    Object.entries(emptyRequired).forEach(([key, [label, value]]) => {
      const isEmpty = value === null || value === undefined || String(value).trim() === "";
      if (errors[key] && isEmpty) {
        errors[key] = `${label} is required`;
      }
    });

    // Unit errors have no slot of their own on the area inputs, so show them on the value field
    if (errors.builtUpAreaUnit && !errors.builtUpArea) errors.builtUpArea = errors.builtUpAreaUnit;
    if (errors.carpetAreaUnit && !errors.carpetArea) errors.carpetArea = errors.carpetAreaUnit;

    // every validation message starts with a capital letter
    Object.keys(errors).forEach((key) => {
      errors[key] = capitalizeFirst(errors[key]);
    });

    setFormErrors(errors);
    lastErrors.current = errors;

    console.log(errors);
    return Object.keys(errors).length === 0;
  };

  // Scrolls to the first highlighted field that is still empty or invalid,
  // with room for the header, and puts the cursor in it.
  const scrollToFirstError = () => {
    setTimeout(() => {
      const target = document.querySelector(".zb-root .zb-err, .zb-root .is-err");
      if (!target) return;
      const field = target.closest(".zb-field") || target.closest(".zb-rel") || target;
      const top = field.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      const input = field.querySelector("input, select, textarea");
      if (input && typeof input.focus === "function") {
        setTimeout(() => input.focus({ preventScroll: true }), 400);
      }
    }, 60);
  };

  // Runs the step validation; any exception is reported instead of failing silently
  const runStepValidation = (indexes) => {
    let ok = false;
    try {
      ok = validateStepFields(indexes);
    } catch (err) {
      console.error("Step validation failed:", err);
      toast.error("This step could not be checked. Please re-check the fields and try again.");
      return false;
    }
    if (!ok) {
      // Name every missing field so nothing has to be hunted for
      const missing = [
        ...new Set(
          Object.keys(lastErrors.current).map((key) => FIELD_LABELS[key] || key)
        ),
      ];
      toast.error(
        missing.length
          ? `Please fill: ${missing.join(", ")}`
          : "Please complete the highlighted fields before continuing."
      );
      scrollToFirstError();
    }
    return ok;
  };

  const categoryLabelMap = {
    Buy: "Sell",
    Rent: "Rent/Lease",
    "Paying Guest": "Paying Guest",
  };

  const hideParkingSection =
    propertyType === "Plot" ||
    propertyType === "Land" ||
    officeSubType === "Co-working Office Space";

  const getPropertyTypeLabel = (type) => {
    if (type === "Plot") return "Plot/Land";
    if (type === "Land") return "Plot/Land"; //  ADD THIS
    if (type === "Office Space") return "Office";
    if (type === "Independent/Builder Floor") return "Builder Floor";
    return type;
  };

  if (!isLoaded) {
    return <div>Loading Maps...</div>;
  }
  const toWords = new ToWords({
    localeCode: "en-IN",
  });
  if (!isLoaded) {
    return <div>Loading Google Maps...</div>;
  }

  const isPlot = propertyType === "Plot" || propertyType === "Land";
  const isHome = buildingType === "Residential" && !isPlot;
  const requiredChecks = [
    !!propertyCategory,
    !!buildingType,
    !!propertyType,
    !!String(formData.property_name || "").trim(),
    propertyCategory === "Buy" ? !!formData.property_price : !!formData.rent,
    propertyCategory === "Buy" || !!formData.rent_duration,
    !!String(address || "").trim(),
    !!country,
    !!state,
    !!String(city || "").trim(),
    !!String(zipCode || "").trim(),
    !isHome || !!formData.bhk_type,
    !!carpetArea,
    !!builtUpArea,
    propertyCategory !== "Buy" || !!formData.ownership,
    propertyCategory !== "Buy" || !!formData.possession_status,
    isPlot || !!formData.furnished_type,
    !!coverImage,
  ];
  const completion = Math.round((requiredChecks.filter(Boolean).length / requiredChecks.length) * 100);

  // Render nothing while redirecting logged-out users
  if (!isLoggedIn) return null;

  return (
    <>
      <div className="zb-root">
        <style>{ZB_STYLES}</style>

        {/* Top bar */}


        {/* Banner */}
        <header className="zb-banner">
          <div className="zb-banner-inner">
            <div className="zb-banner-text">
              <h1>Add New Property</h1>
              <p>List your property on ZEROBRIKS and connect with genuine buyers or tenants.</p>
            </div>
          </div>
          <div className="zb-banner-line" />
        </header>

        {/* Stepper */}
        <nav className="zb-stepper" aria-label="Progress">
          <ol>
            {steps.map((label, index) => {
              const isActive = uiStep === index;
              const isDone = index < uiStep;
              const clickable = index < uiStep || completedSteps.includes(UI_STEP_LOGICAL[index][0]);
              return (
                <li key={label} className="zb-step-item">
                  <button
                    type="button"
                    disabled={!clickable}
                    aria-current={isActive ? "step" : undefined}
                    className={`zb-step ${isActive ? "is-active" : isDone ? "is-done" : ""}`}
                    onClick={() => setActiveStep(UI_STEP_LOGICAL[index][0])}
                  >
                    <span className="zb-num">{isDone ? <Check size={14} /> : index + 1}</span>
                    <span>{label}</span>
                  </button>
                  {index < steps.length - 1 && <span className={`zb-line ${isDone ? "is-done" : ""}`} />}
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Completion */}
        <div className="zb-progress">
          <div className="zb-progress-top">
            <span>Details saved</span>
            <b>{completion}%</b>
          </div>
          <div className="zb-progress-track">
            <div className="zb-progress-fill" style={{ width: `${completion}%` }} />
          </div>
        </div>

        {/* Form + promo */}
        <main className={`zb-main ${uiStep === 0 ? "zb-with-promo" : ""}`}>
          <section className="zb-card">
            {/* Render Step Content */}
            {Object.values(formErrors).some(Boolean) && (
              <div className="zb-summary">Please fix the highlighted fields before continuing.</div>
            )}

            {/* ============ SCREEN 1: Basic Info + Address ============ */}
            {uiStep === 0 && (
              <div className="zb-screen zb-enter">
                <ZbHeader
                  icon={Home}
                  title="Basic Information"
                  subtitle="Tell buyers and tenants what kind of property you are listing."
                />

                <ZbField label="Listing Type" required>
                  <div className="zb-choices">
                    {propertyCategories.map((category) => (
                      <ZbChoice
                        key={category}
                        icon={LISTING_ICONS[category]}
                        label={categoryLabelMap[category]}
                        selected={propertyCategory === category}
                        onClick={() => {
                          setPropertyCategory(category);
                          setFormErrors((prev) => ({ ...prev, building_type: "", property_type: "" }));
                          setFormData({ ...formData, property_category_type: category });
                        }}
                      />
                    ))}
                  </div>
                </ZbField>

                <ZbField label="Property Category" required error={formErrors.building_type}>
                  <div className="zb-choices zb-cols-2">
                    {buildingTypes.map((type) => (
                      <ZbChoice
                        key={type}
                        icon={type === "Commercial" ? Building2 : Home}
                        label={type}
                        selected={buildingType === type}
                        disabled={propertyCategory === "Paying Guest" && type !== "Residential"}
                        onClick={() => handleBuildingTypeChange(type)}
                      />
                    ))}
                  </div>
                </ZbField>

                {buildingType === "Commercial" && (
                  <div className="zb-notice">
                    Commercial listings need the sub-type and security deposit fields, which are not in this layout yet.
                    Submission will be blocked for commercial sale listings until they are added.
                  </div>
                )}

                <div className="zb-grid-2">
                  <ZbField label="Property Name" required error={formErrors.property_name}>
                    <ZbInput
                      icon={Building}
                      name="property_name"
                      value={formData.property_name || ""}
                      onChange={handleInputChange}
                      placeholder="Enter Property Name"
                    />
                  </ZbField>

                  <ZbField label="Property Type" required error={formErrors.property_type}>
                    <ZbSelect
                      icon={Building2}
                      value={propertyType || ""}
                      onChange={(e) => {
                        const type = e.target.value;
                        setPropertyType(type);
                        setFormData({ ...formData, property_type: type });
                        setFormErrors((prev) => ({ ...prev, property_type: "" }));
                      }}
                      placeholder="Select Property Type"
                      options={propertyTypes.map((t) => ({ value: t, label: getPropertyTypeLabel(t) }))}
                    />
                  </ZbField>

                  {isHome && (
                    <ZbField label="BHK / Configuration" required error={formErrors.bhk_type}>
                      <ZbSelect
                        icon={BedDouble}
                        name="bhk_type"
                        value={formData.bhk_type || ""}
                        onChange={handleInputChange}
                        placeholder="Select Configuration"
                        options={BHK_OPTIONS}
                      />
                    </ZbField>
                  )}

                  {propertyCategory === "Buy" ? (
                    <ZbField
                      label={isPlot ? "Plot Price" : "Expected Price"}
                      required
                      error={formErrors.property_price}
                      hint={formData.property_price ? `₹ ${toWords.convert(Number(formData.property_price))}` : ""}
                    >
                      <ZbInput
                        icon={IndianRupee}
                        name="property_price"
                        placeholder="Enter Price"
                        value={formatAmount(formData.property_price)}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/,/g, "");
                          if (/^\d*$/.test(raw) && raw.length <= PRICE_MAX_DIGITS) {
                            handleInputChange({ target: { name: "property_price", value: raw } });
                          }
                        }}
                      />
                    </ZbField>
                  ) : (
                    <ZbField
                      label="Rent Amount"
                      required
                      error={formErrors.rent}
                      hint={formData.rent ? `₹ ${toWords.convert(Number(formData.rent))}` : ""}
                    >
                      <ZbInput
                        icon={IndianRupee}
                        name="rent"
                        placeholder="Enter Rent"
                        value={formatAmount(formData.rent)}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/,/g, "");
                          if (/^\d*$/.test(raw)) {
                            handleInputChange({ target: { name: "rent", value: raw } });
                          }
                        }}
                      />
                    </ZbField>
                  )}

                  {propertyCategory !== "Buy" && (
                    <ZbField label="Rent Duration" required error={formErrors.rent_duration}>
                      <ZbSelect
                        icon={Calendar}
                        name="rent_duration"
                        value={formData.rent_duration || ""}
                        onChange={handleInputChange}
                        placeholder="Select Rent Duration"
                        options={RENT_DURATION_OPTIONS}
                      />
                    </ZbField>
                  )}

                  {propertyCategory !== "Buy" && (
                    <ZbField
                      label="Deposit Amount (One Time)"
                      required
                      error={formErrors.security_deposit_amount}
                      hint={
                        formData.security_deposit_amount
                          ? `₹ ${toWords.convert(Number(formData.security_deposit_amount))}`
                          : "Paid once at the start of the tenancy"
                      }
                    >
                      <ZbInput
                        icon={IndianRupee}
                        name="security_deposit_amount"
                        placeholder="Enter deposit amount"
                        value={formatAmount(formData.security_deposit_amount)}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/,/g, "");
                          if (/^\d*$/.test(raw)) {
                            handleInputChange({ target: { name: "security_deposit_amount", value: raw } });
                          }
                        }}
                      />
                    </ZbField>
                  )}
                </div>

                <ZbCheck
                  checked={formData.mark_as_featured === "Yes"}
                  label="Showcase your property as a featured listing"
                  onChange={(checked) => {
                    if (checked && featureCount <= 0) {
                      setShowFeaturePopup(true);
                      return;
                    }
                    setFormData({ ...formData, mark_as_featured: checked ? "Yes" : "No" });
                  }}
                />

                <ZbSub icon={MapPin} title="Property  Address" />
                <p className="zb-note">
                  Place the listing pin on the map to help buyers and tenants find your property easily.
                </p>

                <ZbField label="Address" required error={formErrors.address}>
                  <div className="zb-rel">
                    <MapPin className="zb-ico" size={16} />
                    {isLoaded ? (
                      <Autocomplete
                        onLoad={(ac) => (autoCompleteRef.current = ac)}
                        onPlaceChanged={handlePlaceChanged}
                      >
                        <input
                          type="text"
                          autoComplete="off"
                          value={address}
                          placeholder="Enter complete address (Building, Street, Area, Landmark)"
                          className={`zb-input zb-has-icon ${formErrors.address ? "is-err" : ""}`}
                          onChange={(e) => {
                            const value = e.target.value.replace(/^\s+/, "");
                            const isValid = /^[a-zA-Z0-9\s]*$/.test(value) && value.length <= ADDRESS_MAX;
                            if (isValid) setAddress(value);
                            clearFormError("address");
                          }}
                        />
                      </Autocomplete>
                    ) : (
                      <input
                        type="text"
                        autoComplete="off"
                        value={address}
                        placeholder="Enter complete address (Building, Street, Area, Landmark)"
                        className="zb-input zb-has-icon"
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    )}
                  </div>
                </ZbField>

                <div className="zb-grid-2">
                  <ZbField label="Country" required error={formErrors.country}>
                    <ZbSelect
                      icon={Globe}
                      value={country || ""}
                      onChange={(e) => {
                        setCountry(e.target.value);
                        setState("");
                        clearFormError("country");
                      }}
                      placeholder="Select Country"
                      options={allCountries.map((c) => ({ value: c.isoCode, label: c.name }))}
                    />
                  </ZbField>

                  <ZbField label="State" required error={formErrors.state}>
                    <ZbSelect
                      icon={MapPin}
                      value={state || ""}
                      onChange={(e) => {
                        setState(e.target.value);
                        clearFormError("state");
                      }}
                      placeholder="Select State"
                      options={allStates.map((s) => ({ value: s.name, label: s.name }))}
                    />
                  </ZbField>

                  <ZbField label="City" required error={formErrors.city}>
  <ZbSelect
    icon={Building2}
    value={city || ""}
    placeholder="Select City"
    onChange={(e) => {
      setCity(e.target.value);
      clearFormError("city");
    }}
    options={CITY_OPTIONS}
  />
</ZbField>

                  <ZbField label="Zip Code" required error={formErrors.zipCode}>
                    <ZbInput
                      icon={Mail}
                      value={zipCode || ""}
                      placeholder="Enter Zip Code"
                      onChange={(e) => {
                        const v = e.target.value;
                        if (/^\d*$/.test(v) && v.length <= getZipMaxLength(country)) {
                          setZipCode(v);
                          clearFormError("zipCode");
                        }
                      }}
                    />
                  </ZbField>

                  <ZbField label="Locality">
                    <ZbInput
                      icon={LocateFixed}
                      value={locality || ""}
                      placeholder="Enter locality"
                      onChange={(e) => setLocality(e.target.value)}
                    />
                  </ZbField>

                  <ZbField label="Sub-locality">
                    <ZbInput
                      icon={LocateFixed}
                      value={subLocality || ""}
                      placeholder="Enter sub-locality"
                      onChange={(e) => setSubLocality(e.target.value)}
                    />
                  </ZbField>
                </div>
              </div>
            )}

            {/* ============ SCREEN 2: Property Details + Amenities ============ */}
            {uiStep === 1 && (
              <div className="zb-screen zb-enter">
                <ZbHeader
                  icon={Building2}
                  title="Property Details"
                  subtitle="Only the fields that apply to this property type are shown."
                />

                <div className="zb-grid-3">
                  {propertyCategory === "Buy" && (
                    <ZbField label="Ownership" required error={formErrors.ownership}>
                      <ZbSelect
                        icon={Award}
                        name="ownership"
                        value={formData.ownership || ""}
                        onChange={handleInputChange}
                        placeholder="Select Ownership"
                        options={OWNERSHIP_OPTIONS}
                      />
                    </ZbField>
                  )}

                  {isHome && (
                    <ZbField label="Bathroom">
                      <ZbSelect
                        icon={Bath}
                        name="bathroom"
                        value={formData.bathroom || ""}
                        onChange={handleInputChange}
                        placeholder="Select Bathrooms"
                        options={BATHROOM_OPTIONS}
                      />
                    </ZbField>
                  )}

                  {propertyCategory === "Buy" && (
                    <ZbField label="Possession Status" required error={formErrors.possession_status}>
                      <ZbSelect
                        icon={CalendarCheck}
                        name="possession_status"
                        value={formData.possession_status || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            possession_status: value,
                            available_from: value === "Ready To Move" ? "Immediately" : "",
                            possession_date: value === "Ready To Move" ? "" : prev.possession_date,
                          }));
                          clearFormError("possession_status");
                        }}
                        placeholder="Select Status"
                        options={POSSESSION_OPTIONS}
                      />
                    </ZbField>
                  )}

                  {!isPlot &&
                    ((propertyCategory === "Rent" && buildingType === "Residential") ||
                      propertyCategory === "Paying Guest" ||
                      (propertyCategory === "Rent" && buildingType === "Commercial")) && (
                      <ZbField label="Available From" required error={formErrors.available_from}>
                        <ZbSelect
                          icon={Clock}
                          name="available_from"
                          value={formData.available_from || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            setIsLaterSelected(value === "Later");
                            setFormData((prev) => ({ ...prev, available_from: value }));
                            clearFormError("available_from");
                          }}
                          placeholder="Select availability"
                          options={[
                            { value: "Immediately", label: "Immediate" },
                            { value: "Later", label: "Later" },
                          ]}
                        />
                      </ZbField>
                    )}
                </div>

                {(formData.possession_status || isLaterSelected) && propertyCategory === "Buy" && (
                  <ZbField
                    label={
                      isLaterSelected
                        ? "Available Date"
                        : formData.possession_status === "Ready To Move"
                          ? "Ready To Move From"
                          : "Possession Date"
                    }
                    required={
                      formData.possession_status === "Under Construction" ||
                      formData.possession_status === "Expected Possession" ||
                      isLaterSelected
                    }
                    error={formErrors.possession_date}
                  >
                    <div className="zb-rel">
                      <Calendar className="zb-ico" size={16} />
                      <input
                        type="date"
                        name="possession_date"
                        className="zb-input zb-has-icon"
                        value={formData.possession_date || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                  </ZbField>
                )}

                {isLaterSelected && propertyCategory !== "Buy" && (
                  <ZbField label="Available Date" required error={formErrors.possession_date}>
                    <div className="zb-rel">
                      <Calendar className="zb-ico" size={16} />
                      <input
                        type="date"
                        name="possession_date"
                        className="zb-input zb-has-icon"
                        value={formData.possession_date || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                  </ZbField>
                )}

                {propertyCategory === "Buy" && (
                  <div className="zb-checks">
                    <ZbCheck
                      checked={formData.all_inclusive_price === "Yes"}
                      label="All Inclusive Price"
                      onChange={(c) => setFormData({ ...formData, all_inclusive_price: c ? "Yes" : "No" })}
                    />
                    <ZbCheck
                      checked={formData.price_negotiable === "Yes"}
                      label="Price Negotiable"
                      onChange={(c) => setFormData({ ...formData, price_negotiable: c ? "Yes" : "No" })}
                    />
                    <ZbCheck
                      checked={formData.tax_and_goverment_charges === "Yes"}
                      label="Tax & Government Charges Excluded"
                      onChange={(c) => setFormData({ ...formData, tax_and_goverment_charges: c ? "Yes" : "No" })}
                    />
                  </div>
                )}

                {isPlot && (
                  <div className="zb-grid-2">
                    <ZbField label="Plot Length" required error={formErrors.property_dimensions_length}>
                      <ZbInput
                        icon={Ruler}
                        value={lengthOfLand || ""}
                        placeholder="Enter length"
                        onChange={(e) => {
                          if (/^\d{0,6}$/.test(e.target.value)) {
                            setLengthOfLand(e.target.value);
                            clearFormError("property_dimensions_length");
                          }
                        }}
                      />
                    </ZbField>
                    <ZbField label="Plot Breadth" required error={formErrors.property_dimensions_breadth}>
                      <ZbInput
                        icon={Ruler}
                        value={breadthOfLand || ""}
                        placeholder="Enter breadth"
                        onChange={(e) => {
                          if (/^\d{0,6}$/.test(e.target.value)) {
                            setBreadthOfLand(e.target.value);
                            clearFormError("property_dimensions_breadth");
                          }
                        }}
                      />
                    </ZbField>
                  </div>
                )}

                <ZbSub icon={Ruler} title="Area Details" />
                <div className="zb-grid-2">
                  <ZbField label="Built-up Area" required error={formErrors.builtUpArea}>
                    <ZbAreaInput
                      value={builtUpArea}
                      unit={builtUpAreaUnit}
                      placeholder="Enter built-up area"
                      error={formErrors.builtUpArea}
                      onValue={(v) => {
                        if (/^\d{0,10}$/.test(v)) {
                          setBuiltUpArea(v);
                          clearFormError("builtUpArea");
                        }
                      }}
                      onUnit={(u) => {
                        setBuiltUpAreaUnit(u);
                        clearFormError("builtUpAreaUnit");
                      }}
                      onBlur={() => {
                        if (String(builtUpArea || "").trim()) {
                          const msg = validateAreaValue("Built-up area", builtUpArea, builtUpAreaUnit);
                          if (msg) setFormErrors((prev) => ({ ...prev, builtUpArea: msg }));
                        }
                      }}
                    />
                  </ZbField>

                  <ZbField
                    label={isPlot ? "Plot Area" : "Carpet Area"}
                    required
                    error={formErrors.carpetArea}
                  >
                    <ZbAreaInput
                      value={carpetArea}
                      unit={carpetAreaUnit}
                      placeholder="Enter area"
                      error={formErrors.carpetArea}
                      onValue={(v) => {
                        if (/^\d{0,10}$/.test(v)) {
                          setCarpetArea(v);
                          clearFormError("carpetArea");
                        }
                      }}
                      onUnit={(u) => {
                        setCarpetAreaUnit(u);
                        clearFormError("carpetAreaUnit");
                      }}
                      onBlur={() => {
                        if (String(carpetArea || "").trim()) {
                          const msg = validateAreaValue("Carpet area", carpetArea, carpetAreaUnit);
                          if (msg) setFormErrors((prev) => ({ ...prev, carpetArea: msg }));
                        }
                      }}
                    />
                  </ZbField>
                </div>

                {!isPlot && (
                  <div className="zb-grid-3">
                    <ZbField label="Tower / Block Name" error={formErrors.block}>
                      <ZbInput
                        icon={Building}
                        name="block"
                        value={formData.block || ""}
                        onChange={handleInputChange}
                        placeholder="Enter Tower / Block Name"
                      />
                    </ZbField>

                    <ZbField label="Total Floor">
                      <ZbInput
                        icon={Layers}
                        name="total_floor"
                        value={formData.total_floor || ""}
                        placeholder="Enter Total Floor"
                        onChange={(e) => {
                          if (/^\d{0,3}$/.test(e.target.value)) handleInputChange(e);
                        }}
                      />
                    </ZbField>

                    <ZbField label="Floor Number">
                      <ZbSelect
                        icon={Layers}
                        name="property_floor"
                        value={formData.property_floor || ""}
                        onChange={handleInputChange}
                        placeholder="Select Floor"
                        options={Array.from({ length: Number(formData.total_floor) || 0 }, (_, i) => String(i + 1))}
                      />
                    </ZbField>

                    <ZbField label="Furnishing Type" required error={formErrors.furnished_type}>
                      <ZbSelect
                        icon={Sofa}
                        name="furnished_type"
                        value={formData.furnished_type || ""}
                        onChange={handleInputChange}
                        placeholder="Select Furnishing Type"
                        options={FURNISHING_OPTIONS}
                      />
                    </ZbField>

                    <ZbField label="Age of Property">
                      <ZbSelect
                        icon={Calendar}
                        name="age_of_property"
                        value={formData.age_of_property || ""}
                        onChange={handleInputChange}
                        placeholder="Select Age of Property"
                        options={AGE_OPTIONS}
                      />
                    </ZbField>

                    <ZbField label="Car Parking">
                      <ZbSelect
                        icon={CircleParking}
                        name="covered_parking"
                        value={formData.covered_parking || ""}
                        onChange={handleInputChange}
                        placeholder="Select Car Parking"
                        options={COUNT_OPTIONS}
                      />
                    </ZbField>

                    {isHome && (
                      <ZbField label="Balcony">
                        <ZbSelect
                          icon={PanelsTopLeft}
                          name="balcony"
                          value={formData.balcony || ""}
                          onChange={handleInputChange}
                          placeholder="Select No. of Balconies"
                          options={BALCONY_OPTIONS}
                        />
                      </ZbField>
                    )}

                    <ZbField label="Lift Availability">
                      <ZbSelect
                        icon={ArrowUpDown}
                        name="lift_availability"
                        value={formData.lift_availability || ""}
                        onChange={handleInputChange}
                        placeholder="Select Lift Availability"
                        options={YES_NO}
                      />
                    </ZbField>

                    <ZbField label="Parking Availability">
                      <ZbSelect
                        icon={Car}
                        name="parking_availability"
                        value={formData.parking_availability || ""}
                        onChange={handleInputChange}
                        placeholder="Select Option"
                        options={YES_NO}
                      />
                    </ZbField>
                  </div>
                )}

                {isHome && (
                  <ZbField label="Additional Rooms">
                    <Select
                      isMulti
                      name="additional_rooms"
                      options={options}
                      value={options.filter((opt) => (formData.additional_rooms || []).includes(opt.value))}
                      onChange={(selected) =>
                        handleInputChange({
                          target: { name: "additional_rooms", value: selected.map((opt) => opt.value) },
                        })
                      }
                      components={{ MultiValue: CustomMultiValue }}
                      placeholder="Select Additional Room"
                      classNamePrefix="react-select"
                    />
                  </ZbField>
                )}

                <ZbSub icon={FileText} title="Property Info" />
                <div className="zb-row-between">
                  <label className="zb-label">About Property</label>
                  <button
                    type="button"
                    onClick={generateDescription}
                    disabled={isGeneratingDescription}
                    className="zb-ai-btn"
                  >
                    <Sparkles size={14} />
                    {isGeneratingDescription ? "Generating..." : "Generate with AI"}
                  </button>
                </div>
                <textarea
                  name="property_description"
                  maxLength={500}
                  rows={4}
                  className="zb-input zb-textarea"
                  value={formData?.property_description || ""}
                  onChange={handleInputChange}
                  placeholder="Describe the property (up to 500 characters)"
                />
                <p className="zb-hint zb-right">{(formData?.property_description || "").length}/500</p>

                <ZbSub icon={Building2} title="Amenities" />
                <p className="zb-note">Select the amenities available for the property. Selected features appear checked.</p>
                <p className="zb-count">
                  <b>{selectedAmenities.length}</b> selected
                </p>
                <div className="zb-amen-grid">
                  {amenitiesList.map((amenity) => {
                    const Icon = amenityIconFor(amenity.amenity_name);
                    const on = selectedAmenities.includes(amenity._id);
                    return (
                      <button
                        type="button"
                        key={amenity._id}
                        aria-pressed={on}
                        className={`zb-amen ${on ? "is-on" : ""}`}
                        onClick={() => toggleAmenity(amenity._id)}
                      >
                        <span className="zb-amen-ico">
                          <Icon size={16} />
                        </span>
                        <span className="zb-amen-name">{fixAmenityLabel(amenity.amenity_name)}</span>
                        <span className="zb-amen-box">{on && <Check size={12} />}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ============ SCREEN 3: Photos & Videos ============ */}
            {uiStep === 2 && (
              <div className="zb-screen zb-enter">
                <ZbHeader
                  icon={ImageIcon}
                  title="Photos & Videos"
                  subtitle="Good photos get far more enquiries. Add a cover image and a gallery."
                />

                <div className="zb-grid-2 zb-media">
                  <div className="zb-col">
                    <ZbCard
                      icon={ImageIcon}
                      title="Upload Property Cover Photo"
                      subtitle="This image will be shown as the main cover image for your property."
                    >
                      {coverImage ? (
                        <div className="zb-preview">
                          <img src={URL.createObjectURL(coverImage)} alt="Cover preview" />
                          <button
                            type="button"
                            className="zb-preview-x"
                            onClick={handelCoverImageDelete}
                            aria-label="Remove cover photo"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      ) : (
                        <div
                          className="zb-drop"
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const file = e.dataTransfer.files[0];
                            if (file && file.type.startsWith("image/")) {
                              setCoverImage(file);
                              clearFormError("cover_image");
                            }
                          }}
                        >
                          <CloudUpload size={24} className="zb-drop-ico" />
                          <p>
                            Drag &amp; drop an image or{" "}
                            <button type="button" className="zb-link" onClick={() => imageInputRef.current.click()}>
                              Upload
                            </button>
                          </p>
                          <button type="button" className="zb-btn-pill" onClick={() => imageInputRef.current.click()}>
                            <Plus size={14} /> Add Cover Photo
                          </button>
                          <span className="zb-hint">JPG, JPEG, PNG, WebP · Max 10 MB · Recommended 1200 × 675 (16:9)</span>
                          <input
                            ref={imageInputRef}
                            type="file"
                            accept="image/*"
                            className="zb-hidden"
                            onChange={(e) => {
                              setCoverImage(e.target.files[0]);
                              clearFormError("cover_image");
                            }}
                          />
                        </div>
                      )}
                      {formErrors.cover_image && <p className="zb-err">{formErrors.cover_image}</p>}
                    </ZbCard>

                    <ZbCard
                      icon={Images}
                      title="Upload Photos of Your Property"
                      subtitle="Add multiple images to showcase the property (interiors, exteriors, amenities, etc.)."
                    >
                      <div
                        className="zb-drop zb-drop-sm"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
                          if (files.length) handleImageUpload2(files);
                        }}
                      >
                        <CloudUpload size={22} className="zb-drop-ico" />
                        <p>
                          Drag &amp; drop images or{" "}
                          <button type="button" className="zb-link" onClick={() => imageInputRef2.current.click()}>
                            Upload
                          </button>
                        </p>
                        <button type="button" className="zb-btn-pill" onClick={() => imageInputRef2.current.click()}>
                          <Plus size={14} /> Add Photos
                        </button>
                        <span className="zb-hint">JPG, JPEG, PNG, WebP · Max 10 MB per image</span>
                        <input
                          ref={imageInputRef2}
                          type="file"
                          accept="image/*"
                          multiple
                          className="zb-hidden"
                          onChange={handleImageUpload2}
                        />
                      </div>
                      {propertyimages.length > 0 && (
                        <div className="zb-thumbs">
                          {propertyimages.map((src, index) => (
                            <div key={index} className="zb-thumb">
                              <img src={src} alt={`Property ${index + 1}`} />
                              <button type="button" onClick={() => handleDelete2(index)} aria-label="Remove photo">
                                <Trash size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </ZbCard>
                  </div>

                  <div className="zb-col">
                    <ZbCard icon={Video} title="Upload Video" subtitle="You can upload one video. Max size: 50MB.">
                      {video ? (
                        <div className="zb-preview">
                          <video src={video} controls />
                          <button
                            type="button"
                            className="zb-preview-x"
                            onClick={handleVideoDelete}
                            aria-label="Remove video"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      ) : (
                        <div
                          className="zb-drop zb-drop-sm"
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const file = e.dataTransfer.files[0];
                            if (file && file.type.startsWith("video/")) {
                              handleVideoUpload({ target: { files: [file] } });
                            }
                          }}
                        >
                          <Video size={22} className="zb-drop-ico" />
                          <button
                            type="button"
                            className="zb-btn-pill"
                            onClick={() => videoInputRef.current && videoInputRef.current.click()}
                          >
                            <Upload size={14} /> Upload Video
                          </button>
                          <span className="zb-hint">MP4, MOV, AVI · Max 50 MB</span>
                          <input
                            ref={videoInputRef}
                            type="file"
                            accept="video/*"
                            className="zb-hidden"
                            onChange={handleVideoUpload}
                          />
                        </div>
                      )}
                    </ZbCard>

                    <div className="zb-or">
                      <span>OR</span>
                    </div>

                    <ZbCard
                      icon={Youtube}
                      title="Video Option"
                      subtitle="Add a video from an external source (e.g., YouTube)."
                    >
                      <div className="zb-grid-2">
                        <ZbField label="Select Video Source" error={formErrors.video_url_type}>
                          <ZbSelect
                            name="video_url_type"
                            value={formData.video_url_type || ""}
                            onChange={(e) => {
                              handleInputChange(e);
                              handleInputChange({ target: { name: "video_url", value: "" } });
                            }}
                            placeholder="Select Video Source"
                            options={["YouTube", "Vimeo", "Other"]}
                          />
                        </ZbField>
                        <ZbField label="Enter Video URL" error={formErrors.video_url}>
                          <ZbInput
                            icon={LinkIcon}
                            name="video_url"
                            value={formData.video_url || ""}
                            onChange={handleInputChange}
                            disabled={!formData.video_url_type}
                            placeholder="Paste YouTube link here"
                          />
                        </ZbField>
                      </div>
                    </ZbCard>

                    <ZbCard
                      icon={Glasses}
                      title="Virtual Tour"
                      subtitle="Add a 360° virtual tour to give viewers an immersive experience of the property."
                    >
                      <ZbSelect
                        value={virtualTourLink || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setVirtualTourLink(value);
                          setFormData((prev) => ({ ...prev, virtual_tour_availability: value }));
                        }}
                        placeholder="Is Virtual Tour Available?"
                        options={YES_NO}
                      />
                    </ZbCard>
                  </div>
                </div>
              </div>
            )}

          </section>
          {uiStep === 0 && <ZbPromo />}
        </main>

        {/* Footer actions */}
        <footer className="zb-footer">
          <div className="zb-footer-inner">
            {uiStep > 0 ? (
              <button type="button" onClick={prevStep} className="zb-btn zb-btn-outline">
                <ArrowLeft size={16} /> Back
              </button>
            ) : (
              <span />
            )}

            <span className="zb-step-count">Step {uiStep + 1} of {steps.length}</span>

            {uiStep < steps.length - 1 ? (
              <button
                type="button"
                className="zb-btn zb-btn-primary"
                onClick={() => {
                  if (runStepValidation(UI_STEP_LOGICAL[uiStep])) {
                    nextStep();
                  }
                }}
              >
                Continue <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                className="zb-btn zb-btn-primary"
                onClick={(e) => {
                  if (runStepValidation(UI_STEP_LOGICAL[uiStep])) {
                    handleSubmit(e);
                  }
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            )}
          </div>
        </footer>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white shadow-2xl rounded-xl">
            <h2 className="mb-3 text-xl font-semibold text-red-600">
              Free Property Posting Limit Reached
            </h2>
            <p className="mb-3 text-gray-700">
              Your free property posting limit has ended. Please purchase a plan
              to continue posting properties.
            </p>
            {/* Align buttons side by side on the right */}
            <div className="flex items-center justify-between px-1">
              <button
                className="px-4 py-1.5 text-white my-bg rounded hover:bg-green-700"
                onClick={() => {
                  setShowModal(false); // FIXED
                  history.push({
                    pathname: "/dashboard",
                    state: { page: "mySubscriptions" },
                  });
                }}
              >
                Purchase Plan
              </button>
              <button
                className="px-4 py-1.5 text-black bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => {
                  setShowModal(false); // FIXED
                  history.push("/");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showFeaturePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white shadow-2xl rounded-xl">
            <h2 className="mb-3 text-xl font-semibold text-red-600">
              Your featured count has expired
            </h2>
            <p className="mb-3 text-gray-700">
              Please purchase a plan to feature more properties.
            </p>
            <div className="flex items-center justify-between px-1">
              <button
                className="px-4 py-1.5 text-white my-bg rounded hover:bg-green-700"
                onClick={() => {
                  setShowFeaturePopup(false);
                  history.push({
                    pathname: "/dashboard",
                    state: { page: "mySubscriptions" },
                  });
                }}
              >
                Purchase Plan
              </button>
              <button
                className="px-4 py-1.5 text-black bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => {
                  setShowFeaturePopup(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddNewProperty;