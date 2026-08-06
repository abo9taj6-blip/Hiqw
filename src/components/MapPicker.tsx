import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { WifiOff, MapPin } from 'lucide-react';

interface MapPickerProps {
  lat?: number;
  lng?: number;
  onChange?: (lat: number, lng: number) => void;
  readOnly?: boolean;
  color?: string; // Hex color or color name for the marker
  height?: string;
}

export default function MapPicker({
  lat,
  lng,
  onChange,
  readOnly = false,
  color = '#0ea5e9', // default primary shirqat medical-blue
  height = '300px'
}: MapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Dynamic status of internet connectivity
  const [isOnline, setIsOnline] = useState(() => typeof window !== 'undefined' ? window.navigator.onLine : true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fallbacks: defaults to Al-Shirqat center coordinates if not provided
  const centerLat = lat && !isNaN(lat) ? lat : 35.5033;
  const centerLng = lng && !isNaN(lng) ? lng : 43.2450;
  const hasCoordinates = !!(lat && lng);

  // Keep callback and config in refs to avoid re-binding map events constantly
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const readOnlyRef = useRef(readOnly);
  readOnlyRef.current = readOnly;

  const colorRef = useRef(color);
  colorRef.current = color;

  // Dynamic custom SVG icon to avoid broken default Leaflet image paths
  const getCustomIcon = (markerColor: string) => {
    // Standardize to Google Map Red pin style if desired, or user-selected color
    const pinColor = markerColor === '#0ea5e9' ? '#EA4335' : markerColor; // default to google red for default
    return L.divIcon({
      html: `
        <div style="position: relative; width: 36px; height: 42px; transform: translate(-10px, -38px); filter: drop-shadow(0 3px 6px rgba(0,0,0,0.25));">
          <svg width="36" height="42" viewBox="0 0 36 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 0C8.06 0 0 8.06 0 18C0 29.82 15.42 41.05 17.21 41.79C17.71 42 18.29 42 18.79 41.79C20.58 41.05 36 29.82 36 18C36 8.06 27.94 0 18 0Z" fill="${pinColor}"/>
            <circle cx="18" cy="18" r="7" fill="#800c0c" opacity="0.3"/>
            <circle cx="18" cy="18" r="6" fill="white"/>
            <circle cx="18" cy="18" r="3" fill="${pinColor}"/>
          </svg>
          <div style="position: absolute; bottom: -6px; left: 14px; width: 8px; height: 8px; border-radius: 50%; background: black; opacity: 0.15; transform: scaleY(0.4);"></div>
        </div>
      `,
      className: 'custom-shirqat-marker',
      iconSize: [36, 42],
      iconAnchor: [18, 42]
    });
  };

  // 1. Map Initialization (ONCE ON MOUNT or when IS_ONLINE changes)
  useEffect(() => {
    if (!isOnline) {
      if (mapRef.current) {
        mapRef.current.off();
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
      return;
    }

    if (!mapContainerRef.current) return;

    // Check if container already had a leaflet instance to avoid "Map container is already initialized" error
    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
      dragging: true
    }).setView([35.5033, 43.2450], 13);

    // Load High-DPI Premium Google Maps Tile Layer with clear Arabic localized annotations
    L.tileLayer('https://{s}.google.com/vt/lyrs=m&hl=ar&x={x}&y={y}&z={z}', {
      maxZoom: 21,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      detectRetina: true
    }).addTo(map);

    mapRef.current = map;

    // Map click option to reposition or create marker if editable
    map.on('click', (e) => {
      if (readOnlyRef.current) return;
      const { lat: clickLat, lng: clickLng } = e.latlng;
      
      if (markerRef.current) {
        markerRef.current.setLatLng([clickLat, clickLng]);
      } else {
        const marker = L.marker([clickLat, clickLng], {
          icon: getCustomIcon(colorRef.current),
          draggable: true
        }).addTo(map);

        marker.on('dragend', () => {
          const position = marker.getLatLng();
          onChangeRef.current?.(position.lat, position.lng);
        });
        markerRef.current = marker;
      }
      onChangeRef.current?.(clickLat, clickLng);
    });

    // Invalidate size once map element is in place
    const resizeTimeout = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(resizeTimeout);
      if (mapRef.current) {
        mapRef.current.off(); // Remove all listeners
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isOnline]); // Run when online status transitions

  // 2. Map coordinates synchronization
  useEffect(() => {
    if (!isOnline) return;
    const map = mapRef.current;
    if (!map) return;

    const latLng = L.latLng(centerLat, centerLng);

    if (markerRef.current) {
      // Marker exists, adjust position safely
      markerRef.current.setLatLng(latLng);
      map.setView(latLng, map.getZoom());
    } else if (hasCoordinates || !readOnly) {
      // Create new marker
      const marker = L.marker(latLng, {
        icon: getCustomIcon(color),
        draggable: !readOnly
      }).addTo(map);

      if (!readOnly) {
        marker.on('dragend', () => {
          const position = marker.getLatLng();
          onChangeRef.current?.(position.lat, position.lng);
        });
      }
      markerRef.current = marker;
      map.setView(latLng, hasCoordinates ? 15 : 13);
    }
  }, [centerLat, centerLng, hasCoordinates, readOnly, color, isOnline]);

  const handleResetToShirqat = () => {
    if (mapRef.current) {
      const defaultLat = 35.5033;
      const defaultLng = 43.2450;
      mapRef.current.setView([defaultLat, defaultLng], 14);
      if (markerRef.current) {
        markerRef.current.setLatLng([defaultLat, defaultLng]);
      }
      onChange?.(defaultLat, defaultLng);
    }
  };

  if (!isOnline) {
    return (
      <div className="flex flex-col gap-2 w-full text-right animate-in fade-in duration-300" dir="rtl">
        <div 
          style={{ height }} 
          className="w-full bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800 rounded-3xl overflow-hidden relative z-10 flex flex-col items-center justify-center p-6 text-center select-none shadow-xs"
        >
          {/* Wave animation and offline icon */}
          <div className="relative mb-3.5 flex items-center justify-center">
            <div className="absolute w-12 h-12 bg-amber-500/10 dark:bg-amber-400/5 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
            <div className="absolute w-10 h-10 bg-amber-500/20 dark:bg-amber-400/10 rounded-full" />
            <div className="relative w-8 h-8 bg-amber-50 dark:bg-amber-950/30 rounded-xl flex items-center justify-center border border-amber-200/40 dark:border-amber-900/40 text-amber-500 dark:text-amber-400 shadow-xs z-10">
              <WifiOff size={16} />
            </div>
          </div>
          
          <h5 className="text-[11px] font-black text-slate-800 dark:text-slate-200 mb-1 leading-normal">
            الخريطة التفاعلية غير متوفرة بدون إنترنت 📡
          </h5>
          <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 max-w-[240px] leading-relaxed">
            يرجى تشغيل الاتصال بالإنترنت لتحميل الخريطة التفاعلية وتتبع الموقع الجغرافي.
            <br />
            باقي تفاصيل الاتصال والمعلومات محفوظة بالكامل وتعمل دون اتصال بالإنترنت لخدمتك.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full text-right" dir="rtl">
      <div 
        ref={mapContainerRef} 
        style={{ height }} 
        className="w-full bg-slate-100 rounded-2xl border border-slate-200 shadow-inner overflow-hidden relative z-10"
      />
      {!readOnly && (
        <div className="flex items-center justify-between gap-2 mt-1 px-1">
          <button
            type="button"
            onClick={handleResetToShirqat}
            className="text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-2.5 py-1.5 active:scale-95 transition-all cursor-pointer"
          >
            📍 إعادة التعيين لمركز الشرقاط
          </button>
          
          <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
            <span>خط العرض: {centerLat.toFixed(5)}</span>
            <span className="text-slate-300">|</span>
            <span>خط الطول: {centerLng.toFixed(5)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
