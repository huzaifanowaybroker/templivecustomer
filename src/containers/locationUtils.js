// Location names are stored in SearchContext as one comma-separated string,
// so a single location name must never contain a comma.
const PLACE_TYPES = [
  "locality",
  "administrative_area_level_1",
  "administrative_area_level_2",
  "country",
];

// Remove commas and collapse whitespace so a name is safe to store
export const cleanLocationName = (s = "") =>
  String(s).replace(/,/g, " ").replace(/\s+/g, " ").trim();

// Read the stored searchCity string back into an array of names
export const splitLocations = (value) =>
  (Array.isArray(value) ? value : String(value || "").split(","))
    .map((s) => s.trim())
    .filter(Boolean);

// Turn a Google Places prediction into a comma-free location name
export const buildLocationName = (pred) => {
  const main = cleanLocationName(
    pred.structured_formatting?.main_text || pred.description || ""
  );
  const sec = cleanLocationName(
    pred.structured_formatting?.secondary_text?.split(",")[0] || ""
  );
  const isPlace = (pred.types || []).some((t) => PLACE_TYPES.includes(t));
  return isPlace || !sec ? main : `${main} - ${sec}`;
};
