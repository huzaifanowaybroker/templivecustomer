import React, { useState } from "react";
import { createPortal } from "react-dom";
import { TileLayer, useMap } from "react-leaflet";
import L from "leaflet";

/* =====================================================================
   HOUSE MARKER ICON (white halo + maroon house pin, as in the design)
   ===================================================================== */
export const houseMarkerIcon = (isActive = false) => {
  const w = isActive ? 46 : 38;
  const h = Math.round((w * 58) / 48);
  const fill = isActive ? "#5e0d28" : "#7a1235";
  return L.divIcon({
    className: "zb-house-marker",
    iconSize: [w, h],
    iconAnchor: [w / 2, h],
    popupAnchor: [0, -h + 6],
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 48 58"
           style="filter: drop-shadow(0 4px 6px rgba(0,0,0,.28)); display:block;">
        <circle cx="24" cy="22" r="21" fill="#ffffff" />
        <path d="M24 56 C24 56 8 37 8 22 A16 16 0 0 1 40 22 C40 37 24 56 24 56 Z" fill="${fill}" />
        <path d="M24 13.5 L33.5 21.5 L30.5 21.5 L30.5 29.5 L17.5 29.5 L17.5 21.5 L14.5 21.5 Z" fill="#ffffff" />
        <path d="M22 29.5 L22 24.5 L26 24.5 L26 29.5 Z" fill="${fill}" />
      </svg>`,
  });
};

/* =====================================================================
   MAP LAYERS WITH SIMPLE / SATELLITE SWITCH
   Simple mode is the default and is NOT part of the satellite code.

   TO REMOVE SATELLITE MODE: delete every line that ends with
   "// SATELLITE MODE" and the block between the two
   "SATELLITE MODE: START" / "SATELLITE MODE: END" comments. Nothing else changes.
   ===================================================================== */
const SIMPLE_TILE_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}";

// SATELLITE MODE: START
const SATELLITE_TILE_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"; // SATELLITE MODE
// SATELLITE MODE: END

const MAP_MODES = [
  { key: "simple", label: "Simple" },
  { key: "satellite", label: "Satellite" }, // SATELLITE MODE
];

export const ZbMapLayers = () => {
  const map = useMap();
  const [mode, setMode] = useState("simple");

  return (
    <>
      {mode === "simple" && <TileLayer key="simple" url={SIMPLE_TILE_URL} />}

      {/* SATELLITE MODE: START */}
      {mode === "satellite" && <TileLayer key="satellite" url={SATELLITE_TILE_URL} />} {/* SATELLITE MODE */}
      {/* SATELLITE MODE: END */}

      {createPortal(
        <div
          className="zb-map-mode"
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 1000,
            display: "flex",
            background: "#fff",
            borderRadius: 10,
            boxShadow: "0 6px 16px -6px rgba(94,13,40,.4)",
            overflow: "hidden",
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
        >
          {MAP_MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMode(m.key)}
              style={{
                padding: "6px 10px",
                fontSize: 12,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                color: mode === m.key ? "#fff" : "#7a1235",
                background: mode === m.key ? "#7a1235" : "#fff",
              }}
            >
              {m.label}
            </button>
          ))}
        </div>,
        map.getContainer()
      )}
    </>
  );
};
