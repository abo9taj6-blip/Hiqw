import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import {
  MapPin,
  Layers,
  Search,
  Navigation,
  RotateCcw,
  Sparkles,
  Locate,
  Check,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface InteractiveMapPickerProps {
  latitude?: number | string;
  longitude?: number | string;
  onChange: (lat: number | "", lng: number | "") => void;
}

interface LandmarkPreset {
  name: string;
  lat: number;
  lng: number;
  area: string;
}

// Key medical & urban landmarks in Al-Shirqat (قضاء الشرقاط)
const SHIRQAT_PRESETS: LandmarkPreset[] = [
  { name: "شارع الأطباء (المركز)", lat: 35.525120, lng: 43.218540, area: "الساحل الأيمن" },
  { name: "مستشفى الشرقاط العام", lat: 35.517850, lng: 43.212300, area: "الساحل الأيمن" },
  { name: "مركز المدينة والسوق", lat: 35.522400, lng: 43.224800, area: "المركز" },
  { name: "جسر الشرقاط الرئيسي", lat: 35.524200, lng: 43.228500, area: "نهر دجلة" },
  { name: "الساحل الأيسر (الشرقاط)", lat: 35.534800, lng: 43.245200, area: "الساحل الأيسر" },
  { name: "حي المعلمين / العسكري", lat: 35.531500, lng: 43.208600, area: "الساحل الأيمن" },
  { name: "ناحية سديرة", lat: 35.565400, lng: 43.260200, area: "شمال الشرقاط" },
  { name: "قرية الزوية", lat: 35.445200, lng: 43.230100, area: "جنوب الشرقاط" },
];

const DEFAULT_CENTER: [number, number] = [35.523100, 43.220500]; // Central Al-Shirqat

// Custom SVG Medical Pin Icon for Leaflet
const createCustomMarkerIcon = () => {
  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div style="position: relative; width: 38px; height: 38px; transform: translate(-50%, -100%); cursor: grab;">
        <div style="position: absolute; inset: -4px; border-radius: 9999px; background: rgba(16, 185, 129, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: relative; width: 38px; height: 38px; border-radius: 9999px; background: linear-gradient(135deg, #059669, #10b981); border: 2.5px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
        <div style="position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); width: 8px; height: 8px; background: #059669; border-radius: 9999px; border: 1.5px solid #ffffff;"></div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
  });
};

export const InteractiveMapPicker: React.FC<InteractiveMapPickerProps> = ({
  latitude,
  longitude,
  onChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [mapType, setMapType] = useState<"streets" | "satellite" | "topo">("streets");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [locatingUser, setLocatingUser] = useState(false);

  const numLat = typeof latitude === "number" ? latitude : parseFloat(String(latitude || ""));
  const numLng = typeof longitude === "number" ? longitude : parseFloat(String(longitude || ""));

  const hasValidCoords =
    !isNaN(numLat) &&
    !isNaN(numLng) &&
    numLat >= -90 &&
    numLat <= 90 &&
    numLng >= -180 &&
    numLng <= 180;

  // Tile layer sources (Real, Licensed, Modern Open Maps)
  const tileSources = {
    streets: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    },
    satellite: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics",
      maxZoom: 19,
    },
    topo: {
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
      maxZoom: 17,
    },
  };

  // Update map coordinates safely
  const updateCoords = useCallback(
    (lat: number | "", lng: number | "") => {
      onChange(lat, lng);
    },
    [onChange]
  );

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Prevent double init

    const initialCenter: [number, number] = hasValidCoords
      ? [numLat, numLng]
      : DEFAULT_CENTER;
    const initialZoom = hasValidCoords ? 16 : 14;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: false,
    });

    // Add Zoom Control on top-left for RTL ergonomics
    L.control.zoom({ position: "topleft" }).addTo(map);

    // Add selected Tile Layer
    const source = tileSources[mapType];
    const tileLayer = L.tileLayer(source.url, {
      attribution: source.attribution,
      maxZoom: source.maxZoom,
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    mapInstanceRef.current = map;

    // Handle Map Clicks to place marker
    map.on("click", (e: L.LeafletMouseEvent) => {
      const lat = Number(e.latlng.lat.toFixed(6));
      const lng = Number(e.latlng.lng.toFixed(6));
      updateCoords(lat, lng);
    });

    // Fix map sizing on resize
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Update Tile Layer when mapType changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const source = tileSources[mapType];
    const newLayer = L.tileLayer(source.url, {
      attribution: source.attribution,
      maxZoom: source.maxZoom,
    }).addTo(map);

    tileLayerRef.current = newLayer;
  }, [mapType]);

  // Sync Marker Position with Props
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (hasValidCoords) {
      const pos: [number, number] = [numLat, numLng];

      if (markerRef.current) {
        markerRef.current.setLatLng(pos);
      } else {
        const marker = L.marker(pos, {
          icon: createCustomMarkerIcon(),
          draggable: true,
          autoPan: true,
        }).addTo(map);

        // Marker Drag Event
        marker.on("dragend", () => {
          const newLatLng = marker.getLatLng();
          const lat = Number(newLatLng.lat.toFixed(6));
          const lng = Number(newLatLng.lng.toFixed(6));
          updateCoords(lat, lng);
        });

        markerRef.current = marker;
      }
    } else {
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
    }
  }, [hasValidCoords, numLat, numLng, updateCoords]);

  // Handle Current GPS Location
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("خاصية تحديد الموقع الجغرافي غير مدعومة في متصفحك.");
      return;
    }

    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocatingUser(false);
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        updateCoords(lat, lng);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 17, { duration: 1.5 });
        }
      },
      (err) => {
        setLocatingUser(false);
        console.warn("Geolocation error:", err);
        alert("تعذر جلب موقعك الحالي. يرجى السماح بصلاحية الموقع من إعدادات المتصفح.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Search places using OpenStreetMap Nominatim Geocoder
  const handleSearchPlace = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    try {
      // Append Al-Shirqat context if not included
      const searchTarget = query.includes("الشرقاط") || query.includes("صلاح الدين")
        ? query
        : `${query} الشرقاط صلاح الدين العراق`;

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchTarget
        )}&limit=5&accept-language=ar`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const bestMatch = data[0];
        const lat = Number(parseFloat(bestMatch.lat).toFixed(6));
        const lng = Number(parseFloat(bestMatch.lon).toFixed(6));
        updateCoords(lat, lng);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 17, { duration: 1.2 });
        }
      } else {
        alert(`لم يتم العثور على نتائج لـ "${query}". يمكنك النقر مباشرة على الخريطة لتحديد الموقع.`);
      }
    } catch (err) {
      console.warn("Geocoding error:", err);
      alert("تعذر الاتصال بخدمة البحث. يمكنك النقر على الخريطة مباشرة لتثبيت المكان.");
    } finally {
      setIsSearching(false);
    }
  };

  // Pan to preset landmark
  const handleSelectPreset = (preset: LandmarkPreset) => {
    updateCoords(preset.lat, preset.lng);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([preset.lat, preset.lng], 16, { duration: 1 });
    }
  };

  return (
    <div
      className={`space-y-3 p-4 bg-slate-50 dark:bg-slate-950/80 rounded-3xl border-2 border-emerald-500/30 dark:border-emerald-500/40 text-right font-sans transition-all duration-300 ${
        isFullscreen ? "fixed inset-4 z-[9999] bg-white dark:bg-slate-900 overflow-y-auto shadow-2xl" : ""
      }`}
      dir="rtl"
    >
      {/* Header with Title & Map Layers Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <MapPin size={18} className="animate-bounce" />
          </div>
          <div>
            <h4 className="font-display font-black text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>خريطة تفاعلية حقيقية ومرخصة (GPS)</span>
              <Sparkles size={14} className="text-amber-500 shrink-0" />
            </h4>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
              انقر أو اسحب الدبوس 📍 مباشرة على الخريطة لتحديد موقع العيادة
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Map Layer Mode Toggle */}
          <div className="flex items-center p-0.5 bg-slate-200/80 dark:bg-slate-800 rounded-xl border border-slate-300/80 dark:border-slate-700 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setMapType("streets")}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                mapType === "streets"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-black"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              🗺️ شوارع
            </button>
            <button
              type="button"
              onClick={() => setMapType("satellite")}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                mapType === "satellite"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-black"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              🛰️ قمر صناعي
            </button>
            <button
              type="button"
              onClick={() => setMapType("topo")}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                mapType === "topo"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-black"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              ⛰️ تضاريس
            </button>
          </div>

          {/* Fullscreen Mode Toggle */}
          <button
            type="button"
            onClick={() => {
              setIsFullscreen(!isFullscreen);
              setTimeout(() => {
                mapInstanceRef.current?.invalidateSize();
              }, 150);
            }}
            className="p-2 bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-all cursor-pointer"
            title={isFullscreen ? "تصغير الخريطة" : "تكبير الخريطة"}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Live Search Bar for Places & Geolocation button */}
      <div className="flex items-center gap-2">
        <form onSubmit={handleSearchPlace} className="relative flex-1">
          <input
            type="text"
            placeholder="ابحث عن شارع أو حي في الشرقاط (مثال: شارع الأطباء، سديرة)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pr-9 pl-16 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 focus:border-emerald-500 font-bold text-xs text-slate-800 dark:text-slate-100 outline-none transition-all"
          />
          <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black cursor-pointer transition-all active:scale-95 disabled:opacity-50"
          >
            {isSearching ? "بحث..." : "بحث"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleLocateMe}
          disabled={locatingUser}
          className="h-10 px-3 bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0"
          title="تحديد موقعي الحالي بالـ GPS"
        >
          <Locate size={15} className={locatingUser ? "animate-spin text-emerald-500" : "text-emerald-600"} />
          <span className="hidden sm:inline">{locatingUser ? "جارِ التحديد..." : "موقعي الحالي"}</span>
        </button>
      </div>

      {/* Real Leaflet Map Canvas */}
      <div className="relative w-full rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-md">
        <div
          ref={mapContainerRef}
          className={`w-full ${isFullscreen ? "h-[65vh]" : "h-72 sm:h-80"} z-10`}
          style={{ minHeight: "260px" }}
        />

        {/* Live Coordinate Overlay on Map */}
        <div
          className="absolute bottom-2.5 left-2.5 z-[400] bg-slate-900/90 text-white dark:bg-white/95 dark:text-slate-900 px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold shadow-lg pointer-events-none flex items-center gap-2 backdrop-blur-sm"
          dir="ltr"
        >
          <Navigation size={12} className="text-emerald-400 dark:text-emerald-600 animate-pulse" />
          <span>
            {hasValidCoords
              ? `${numLat.toFixed(6)}, ${numLng.toFixed(6)}`
              : "انقر على الخريطة لتثبيت الإحداثيات"}
          </span>
        </div>

        {/* Reset / Clear Coordinates Button */}
        {hasValidCoords && (
          <button
            type="button"
            onClick={() => updateCoords("", "")}
            className="absolute top-2.5 right-2.5 z-[400] px-2.5 py-1.5 bg-rose-600/90 hover:bg-rose-700 text-white text-[11px] font-bold rounded-xl shadow-lg flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer backdrop-blur-sm"
            title="إلغاء التحديد وحذف الإحداثيات"
          >
            <RotateCcw size={12} />
            <span>إلغاء الموقع</span>
          </button>
        )}
      </div>

      {/* Quick Landmark Presets in Al-Shirqat */}
      <div className="space-y-1.5 pt-1">
        <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 block">
          أماكن ومعالم سريعة في الشرقاط (انقر للتوجيه المباشر):
        </label>
        <div className="flex flex-wrap gap-1.5">
          {SHIRQAT_PRESETS.map((preset, i) => {
            const isSelected =
              hasValidCoords &&
              Math.abs(numLat - preset.lat) < 0.003 &&
              Math.abs(numLng - preset.lng) < 0.003;
            return (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1 border ${
                  isSelected
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800"
                }`}
              >
                {isSelected ? <Check size={12} className="stroke-[3]" /> : <MapPin size={11} className="text-emerald-500 shrink-0" />}
                <span>{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Synchronized Coordinates Input Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 border-t border-slate-200/80 dark:border-slate-800">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between">
            <span>خط العرض (Latitude):</span>
            <span className="text-[10px] text-slate-400 font-mono">-90 إلى 90</span>
          </label>
          <input
            type="number"
            step="0.000001"
            name="latitude"
            placeholder="مثال: 35.523100"
            value={latitude !== undefined && latitude !== null ? latitude : ""}
            onChange={(e) => {
              const val = e.target.value;
              const newLat = val === "" ? "" : parseFloat(val);
              updateCoords(newLat, numLng || "");
              if (typeof newLat === "number" && !isNaN(newLat) && hasValidCoords && mapInstanceRef.current) {
                mapInstanceRef.current.panTo([newLat, numLng]);
              }
            }}
            className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 focus:border-emerald-500 font-mono font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 outline-none transition-all text-left"
            dir="ltr"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between">
            <span>خط الطول (Longitude):</span>
            <span className="text-[10px] text-slate-400 font-mono">-180 إلى 180</span>
          </label>
          <input
            type="number"
            step="0.000001"
            name="longitude"
            placeholder="مثال: 43.220500"
            value={longitude !== undefined && longitude !== null ? longitude : ""}
            onChange={(e) => {
              const val = e.target.value;
              const newLng = val === "" ? "" : parseFloat(val);
              updateCoords(numLat || "", newLng);
              if (typeof newLng === "number" && !isNaN(newLng) && hasValidCoords && mapInstanceRef.current) {
                mapInstanceRef.current.panTo([numLat, newLng]);
              }
            }}
            className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 focus:border-emerald-500 font-mono font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 outline-none transition-all text-left"
            dir="ltr"
          />
        </div>
      </div>
    </div>
  );
};
