import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import {
  MapPin,
  Navigation,
  WifiOff,
  ExternalLink,
  Compass,
  Layers,
} from "lucide-react";
import { Doctor } from "../types";

interface DoctorLocationMapProps {
  doctor: Doctor;
}

const createCustomMarkerIcon = () => {
  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div style="position: relative; width: 36px; height: 36px; transform: translate(-50%, -100%);">
        <div style="position: absolute; inset: -4px; border-radius: 9999px; background: rgba(16, 185, 129, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: relative; width: 36px; height: 36px; border-radius: 9999px; background: linear-gradient(135deg, #059669, #10b981); border: 2.5px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
        <div style="position: absolute; bottom: -5px; left: 50%; transform: translateX(-50%); width: 7px; height: 7px; background: #059669; border-radius: 9999px; border: 1px solid #ffffff;"></div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });
};

export const DoctorLocationMap: React.FC<DoctorLocationMapProps> = ({ doctor }) => {
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"real" | "svg">("real");
  const [mapLayer, setMapLayer] = useState<"streets" | "satellite">("streets");

  const realMapContainerRef = useRef<HTMLDivElement>(null);
  const realMapInstanceRef = useRef<L.Map | null>(null);
  const realTileLayerRef = useRef<L.TileLayer | null>(null);
  const realMarkerRef = useRef<L.Marker | null>(null);

  const hasCoordinates =
    typeof doctor.latitude === "number" &&
    typeof doctor.longitude === "number" &&
    Number.isFinite(doctor.latitude) &&
    Number.isFinite(doctor.longitude) &&
    doctor.latitude >= -90 &&
    doctor.latitude <= 90 &&
    doctor.longitude >= -180 &&
    doctor.longitude <= 180;

  // Real Map initialization
  useEffect(() => {
    if (viewMode !== "real" || !realMapContainerRef.current) return;
    if (realMapInstanceRef.current) return;

    const centerPos: [number, number] = hasCoordinates && doctor.latitude && doctor.longitude
      ? [doctor.latitude, doctor.longitude]
      : [35.523100, 43.220500];

    const map = L.map(realMapContainerRef.current, {
      center: centerPos,
      zoom: hasCoordinates ? 16 : 14,
      zoomControl: false,
    });

    L.control.zoom({ position: "topleft" }).addTo(map);

    const tileUrl =
      mapLayer === "satellite"
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    const tileLayer = L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap / Esri',
      maxZoom: 19,
    }).addTo(map);

    realTileLayerRef.current = tileLayer;

    if (hasCoordinates && doctor.latitude && doctor.longitude) {
      const marker = L.marker([doctor.latitude, doctor.longitude], {
        icon: createCustomMarkerIcon(),
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: sans-serif; text-align: right; direction: rtl; font-size: 12px; font-weight: bold;">
          <div style="color: #059669; font-size: 13px; font-weight: 900;">${doctor.name}</div>
          <div style="color: #64748b;">${doctor.subtitle || "عيادة طبية"}</div>
          <div style="color: #0f172a; margin-top: 4px;">${doctor.location || "الشرقاط"}</div>
        </div>
      `);

      realMarkerRef.current = marker;
    }

    realMapInstanceRef.current = map;

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      realMapInstanceRef.current = null;
      realMarkerRef.current = null;
    };
  }, [viewMode, hasCoordinates, doctor.latitude, doctor.longitude]);

  // Update Tile Layer on Layer Switch
  useEffect(() => {
    if (!realMapInstanceRef.current) return;
    const map = realMapInstanceRef.current;

    if (realTileLayerRef.current) {
      map.removeLayer(realTileLayerRef.current);
    }

    const tileUrl =
      mapLayer === "satellite"
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    const newLayer = L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap / Esri',
      maxZoom: 19,
    }).addTo(map);

    realTileLayerRef.current = newLayer;
  }, [mapLayer]);

  // Approximate relative positioning inside Al-Shirqat bounds for the SVG pin
  const getPinCoordinates = () => {
    if (!hasCoordinates || !doctor.latitude || !doctor.longitude) {
      return { x: 200, y: 150 };
    }

    const minLat = 35.40;
    const maxLat = 35.65;
    const minLng = 43.10;
    const maxLng = 43.35;

    let normX = (doctor.longitude - minLng) / (maxLng - minLng);
    let normY = 1 - (doctor.latitude - minLat) / (maxLat - minLat);

    normX = Math.max(0.15, Math.min(0.85, normX));
    normY = Math.max(0.15, Math.min(0.85, normY));

    return {
      x: Math.round(normX * 400),
      y: Math.round(normY * 260),
    };
  };

  const pinPos = getPinCoordinates();

  const handleOpenDirections = () => {
    if (!hasCoordinates || doctor.latitude === undefined || doctor.longitude === undefined) {
      alert("⚠️ إحداثيات العيادة غير مضافة حتى الآن.");
      return;
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setOfflineNotice("حساب المسار والاتجاهات يتطلب اتصالاً بالإنترنت");
      setTimeout(() => setOfflineNotice(null), 4000);
      return;
    }

    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${doctor.latitude},${doctor.longitude}`;
    window.open(mapsUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-800/90 rounded-3xl border border-slate-200/80 dark:border-slate-700/70 p-4 sm:p-5 shadow-xs text-right space-y-4 font-sans" dir="rtl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Compass size={18} />
          </div>
          <div>
            <h4 className="font-display font-black text-sm text-slate-900 dark:text-white">
              موقع العيادة على الخريطة
            </h4>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              دليل الشرقاط - خريطة الأطباء المرخصة
            </span>
          </div>
        </div>

        {/* View mode toggle (Real map vs SVG) */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center p-0.5 bg-slate-200/80 dark:bg-slate-700/80 rounded-xl text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setViewMode("real")}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === "real"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-black"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              🗺️ خريطة حية
            </button>
            <button
              type="button"
              onClick={() => setViewMode("svg")}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === "svg"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-black"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              📐 مخطط
            </button>
          </div>

          {viewMode === "real" && (
            <button
              type="button"
              onClick={() => setMapLayer(mapLayer === "streets" ? "satellite" : "streets")}
              className="px-2 py-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-xl text-[11px] font-bold border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer flex items-center gap-1"
              title="تبديل القمر الصناعي"
            >
              <Layers size={13} className="text-emerald-500" />
              <span>{mapLayer === "streets" ? "قمر صناعي" : "شوارع"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Map Surface */}
      {viewMode === "real" ? (
        /* Real Leaflet Map */
        <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-inner">
          <div ref={realMapContainerRef} className="w-full h-full z-10" />
          {offlineNotice && (
            <div className="absolute top-3 left-3 right-3 z-[400] bg-rose-600 text-white px-3 py-2 rounded-xl text-xs font-black shadow-lg flex items-center justify-center gap-2 animate-bounce">
              <WifiOff size={16} className="shrink-0" />
              <span>{offlineNotice}</span>
            </div>
          )}
        </div>
      ) : (
        /* Local SVG Map Canvas */
        <div className="relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-inner select-none">
          <svg
            viewBox="0 0 400 260"
            className="w-full h-full object-cover"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="patient-grid-dots" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" className="fill-slate-300 dark:fill-slate-800" />
              </pattern>
              <linearGradient id="patientRiverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.45" />
                <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#0369a1" stopOpacity="0.5" />
              </linearGradient>
            </defs>

            <rect width="400" height="260" className="fill-slate-50 dark:fill-slate-900/90" />
            <rect width="400" height="260" fill="url(#patient-grid-dots)" />

            <path
              d="M 190,0 Q 225,55 195,110 T 215,190 T 175,260"
              fill="none"
              stroke="url(#patientRiverGradient)"
              strokeWidth="24"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 190,0 Q 225,55 195,110 T 215,190 T 175,260"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="3"
              strokeDasharray="4 6"
              className="opacity-70 animate-pulse"
            />

            <line x1="180" y1="130" x2="225" y2="130" className="stroke-amber-500" strokeWidth="4" />
            <text x="202" y="124" textAnchor="middle" className="text-[8px] font-black fill-amber-700">
              جسر الشرقاط
            </text>

            <path d="M 110,0 L 120,80 L 140,160 L 115,260" fill="none" className="stroke-slate-300 dark:stroke-slate-700" strokeWidth="4" />
            <path d="M 60,130 L 180,130 L 290,140 L 370,135" fill="none" className="stroke-slate-300 dark:stroke-slate-700" strokeWidth="3" strokeDasharray="5 3" />

            <text x="85" y="70" textAnchor="middle" className="text-[10px] font-extrabold fill-slate-500 dark:fill-slate-400">
              الساحل الأيمن (المركز)
            </text>
            <text x="310" y="70" textAnchor="middle" className="text-[10px] font-extrabold fill-slate-500 dark:fill-slate-400">
              الساحل الأيسر
            </text>
            <text x="115" y="145" textAnchor="middle" className="text-[8px] font-black fill-emerald-600 dark:fill-emerald-400">
              شارع الأطباء
            </text>

            {hasCoordinates ? (
              <g transform={`translate(${pinPos.x}, ${pinPos.y})`}>
                <circle r="16" className="fill-emerald-500/20 stroke-emerald-500/50 animate-ping" strokeWidth="1.5" />
                <path d="M 0,0 C -6,-10 -8,-16 0,-24 C 8,-16 6,-10 0,0 Z" className="fill-emerald-600" />
                <circle cx="0" cy="-15" r="3.5" className="fill-white" />
              </g>
            ) : (
              <g transform="translate(200, 130)">
                <circle r="6" className="fill-slate-400" />
                <text x="0" y="20" textAnchor="middle" className="text-[9px] font-bold fill-slate-400">
                  مركز قضاء الشرقاط
                </text>
              </g>
            )}
          </svg>

          {offlineNotice && (
            <div className="absolute top-3 left-3 right-3 bg-rose-600 text-white px-3 py-2 rounded-xl text-xs font-black shadow-lg flex items-center justify-center gap-2 animate-bounce">
              <WifiOff size={16} className="shrink-0" />
              <span>{offlineNotice}</span>
            </div>
          )}
        </div>
      )}

      {/* Address & GPS Coordinate Info Box */}
      <div className="space-y-2 bg-white dark:bg-slate-900/80 rounded-2xl p-3.5 border border-slate-100 dark:border-slate-800">
        {doctor.location && (
          <div className="flex items-start gap-2 text-xs">
            <MapPin size={15} className="text-emerald-500 shrink-0 mt-0.5" />
            <span className="text-slate-800 dark:text-slate-200 font-bold">
              العنوان: <span className="font-normal text-slate-600 dark:text-slate-300">{doctor.location}</span>
            </span>
          </div>
        )}

        {hasCoordinates ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono font-bold pt-1 border-t border-slate-100 dark:border-slate-800/60" dir="ltr">
            <span className="flex items-center gap-1">
              <span className="text-slate-400">Lat:</span>
              <span className="text-slate-800 dark:text-slate-200 font-black">{doctor.latitude?.toFixed(6)}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-slate-400">Lng:</span>
              <span className="text-slate-800 dark:text-slate-200 font-black">{doctor.longitude?.toFixed(6)}</span>
            </span>
          </div>
        ) : (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            لم يتم تزويد إحداثيات GPS المباشرة لهذه العيادة بعد من قِبل إدارة التطبيق.
          </p>
        )}
      </div>

      {/* Action Button: Open Google Maps Directions */}
      <button
        type="button"
        onClick={handleOpenDirections}
        disabled={!hasCoordinates}
        className={`w-full h-12 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer shadow-sm ${
          hasCoordinates
            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
            : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
        }`}
      >
        <Navigation size={17} className={hasCoordinates ? "animate-pulse" : ""} />
        <span>
          {hasCoordinates
            ? "فتح المسار والاتجاهات عبر Google Maps"
            : "المسار غير متاح (الإحداثيات غير مضافة)"}
        </span>
        {hasCoordinates && <ExternalLink size={14} className="opacity-80" />}
      </button>
    </div>
  );
};
