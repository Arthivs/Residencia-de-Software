export const geocodeNominatim = async (query) => {
  if (!query) return { lat: -10.9117, lng: -37.0678, display: "Aracaju" };
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=BR&q=${encodeURIComponent(query + ', Brasil')}`);
    const data = await res.json();
    if (data && data.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), display: data[0].display_name };
  } catch (err) {
    console.error("Nominatim error", err);
  }
  return { lat: -10.9117, lng: -37.0678, display: "Aracaju" };
};
