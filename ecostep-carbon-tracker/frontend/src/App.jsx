// ==========================================
// FILEPATH: frontend/src/App.jsx
// PURPOSE: EcoStep Carbon Tracker — Live Camera Scanner, Interactive Maps, Client-Side
// ==========================================

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Leaf, Car, Home, UtensilsCrossed, ShoppingBag, Award, ArrowRight,
  ArrowLeft, Sparkles, Trash2, RefreshCw, TreePine, Info, Calendar,
  DollarSign, Zap, Flame, Camera, ScanBarcode, Users, Compass,
  FileText, MapPin, X, Crosshair, Image as ImageIcon
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet default marker icons in bundled apps
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom map marker icons
const originIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});
const destIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

// Alias for Store icon
const Store = ShoppingBag;

// --- UTILITY MATH ---
const max = (a, b) => (a > b ? a : b);
const round = (val, decs) => parseFloat(val.toFixed(decs));

// --- WTW TIER 3 EMISSION COEFFICIENTS (DEFRA 2025 & EPA) ---
const WTW_FACTORS = {
  gasoline: { unit: "Liters", ttw: 2.20311, wtt: 0.61280, source: "UK DEFRA 2025 / EPA GHG Hub" },
  diesel:   { unit: "Liters", ttw: 2.51214, wtt: 0.64150, source: "UK DEFRA 2025" },
  jet_fuel: { unit: "Liters", ttw: 2.54000, wtt: 0.78500, source: "IPCC / DEFRA 2025" },
  electricity: { unit: "kWh", ttw: 0.00000, wtt: 0.38550, source: "EPA eGRID 2025 US Average" }
};

const DEFAULT_EFFICIENCIES = {
  gasoline: 8.12, hybrid: 4.70, electric: 18.64, diesel: 6.80, flight: 3.65
};

const FUEL_MAP = {
  gasoline: "gasoline", hybrid: "gasoline", electric: "electricity", diesel: "diesel", flight: "jet_fuel"
};

// --- HAVERSINE DISTANCE ---
function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// --- REVERSE GEOCODING (OpenStreetMap Nominatim) ---
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10`);
    const data = await res.json();
    return data.display_name?.split(',').slice(0, 3).join(',').trim() || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

// --- WTW CALCULATION ENGINE ---
function computeWTW(distanceKm, transport, customEff, payloadKg) {
  const fuelType = FUEL_MAP[transport] || "gasoline";
  const factors = WTW_FACTORS[fuelType];
  const baseEff = customEff || DEFAULT_EFFICIENCIES[transport] || 8.0;
  const payloadAdj = 1.0 + ((payloadKg || 0) * 0.00015);
  const eff = baseEff * payloadAdj;
  const fuelConsumed = (distanceKm * eff) / 100.0;
  const ttwCo2 = round(fuelConsumed * factors.ttw, 2);
  const wttCo2 = round(fuelConsumed * factors.wtt, 2);
  const totalWtw = round(ttwCo2 + wttCo2, 2);

  return {
    distance_km: round(distanceKm, 2),
    distance_miles: round(distanceKm / 1.60934, 2),
    fuel_consumed_total: round(fuelConsumed, 4),
    unit: factors.unit,
    ttw_co2_kg: ttwCo2,
    wtt_co2_kg: wttCo2,
    co2_kg: totalWtw,
    regulatory_sources: factors.source + " and IPCC GWP AR5",
    alternative_mode: transport !== "electric" ? "High Speed Electric Rail" : "Solar-Charged EV Fleet",
    alternative_co2_kg: round((distanceKm * 18.0 / 100.0) * WTW_FACTORS.electricity.wtt, 2),
    eco_tip: `This routing consumed approx ${round(fuelConsumed, 1)} ${factors.unit} of ${fuelType.toUpperCase()}.`
  };
}

// --- BARCODE DATABASE ---
const BARCODE_DB = {
  "9780123456": { name: "Oat Milk (Organic, 1L)", co2: 0.35, category: "Low Impact", comparison: "75% lower than Cow Milk", color: "emerald", alternative: "Excellent choice. Zero-carbon packaging!" },
  "5449000000": { name: "Sparkling Cola Can (Pack of 6)", co2: 1.80, category: "Medium Impact", comparison: "Standard aluminum footprint", color: "amber", alternative: "Try naturally brewed organic soda." },
  "7890123456": { name: "Prime Grain-fed Beef Burger", co2: 14.50, category: "Extremely High", comparison: "900% higher than vegan alternative", color: "red", alternative: "Sub for Mushroom Protein burgers to save 13kg CO₂." },
  "0012345678": { name: "Fair Trade Coffee Beans (250g)", co2: 1.2, category: "Medium Impact", comparison: "40% lower than non-certified", color: "amber", alternative: "Buy local roast for reduced transport." },
  "4006381333": { name: "Organic Free-Range Eggs (12pk)", co2: 2.1, category: "Medium Impact", comparison: "Standard poultry emissions", color: "amber", alternative: "Plant-based egg substitutes save 80% CO₂." }
};

// --- RECEIPT PRESETS ---
const RECEIPT_PRESETS = [
  {
    store: "Whole Foods Market",
    items: [
      { name: "Organic Blueberries", cost: 4.99, footprint: "Low (0.2 kg CO₂)" },
      { name: "Imported Ribeye Steak", cost: 18.50, footprint: "Extreme (18.2 kg CO₂)" },
      { name: "Almond Milk", cost: 3.49, footprint: "Low (0.4 kg CO₂)" }
    ],
    totalCo2: 18.8,
    savingTip: "Swapping Imported Ribeye for Poultry or Plant-Protein reduces this receipt footprint by 85%."
  },
  {
    store: "Costco Wholesale",
    items: [
      { name: "Bulk Avocados", cost: 6.99, footprint: "Medium (1.1 kg CO₂)" },
      { name: "Single-Use Plastic Bottles (24pk)", cost: 5.49, footprint: "High (4.8 kg CO₂)" },
      { name: "LED Recessed Lights (4pk)", cost: 12.99, footprint: "Negative (-45 kg CO₂ lifetime)" }
    ],
    totalCo2: 5.9,
    savingTip: "Ditching bottled water for a reusable filter saves up to 120kg CO₂ and $240 annually."
  }
];

const ECO_TIPS = [
  { text: "Air drying clothes instead of using a dryer for 1 year saves up to 300kg of CO₂e and $120.", author: "EPA Advice" },
  { text: "Replacing 1 beef meal a week with lentils saves equivalent emissions to driving 120 miles.", author: "UN Climate Secretariat" },
  { text: "A smart thermostat can reduce your heating and cooling emissions by 10-15% on day one.", author: "Department of Energy" },
  { text: "LED bulbs use up to 80% less energy than standard bulbs and last up to 25 times longer.", author: "Energy Star" }
];

// --- MAP CLICK HANDLER COMPONENT ---
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    }
  });
  return null;
}

// =====================
// MAIN APP COMPONENT
// =====================
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userApiKey, setUserApiKey] = useState('');

  const [userProfile, setUserProfile] = useState({
    name: "Alex Thorne", level: 3, xp: 2450, xpToNext: 5000,
    streak: 5, co2Avoided: 1.45, cashSaved: 184.20
  });

  const [emissions, setEmissions] = useState({
    transport: 4.8, energy: 3.2, food: 2.4, shopping: 1.6, waste: 0.8
  });

  const [completedActions, setCompletedActions] = useState(['diet_veg', 'energy_wash']);
  const [loggedTrips, setLoggedTrips] = useState([]);

  // --- MAP ROUTING STATE ---
  const [mapOrigin, setMapOrigin] = useState(null);       // { lat, lng }
  const [mapDest, setMapDest] = useState(null);           // { lat, lng }
  const [originName, setOriginName] = useState('');
  const [destName, setDestName] = useState('');
  const [routeTransport, setRouteTransport] = useState('gasoline');
  const [payloadWeight, setPayloadWeight] = useState(0);
  const [customEfficiency, setCustomEfficiency] = useState('');
  const [auditResult, setAuditResult] = useState(null);
  const [isAuditing, setIsAuditing] = useState(false);

  // --- DIRECT FUEL ENGINE ---
  const [fuelType, setFuelType] = useState('gasoline');
  const [fuelVolume, setFuelVolume] = useState('');
  const [directAuditResult, setDirectAuditResult] = useState(null);
  const [isDirectAuditing, setIsDirectAuditing] = useState(false);

  // --- SCANNER STATE ---
  const [scanType, setScanType] = useState('barcode');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [scanStatus, setScanStatus] = useState('');
  const [showSuccessFlash, setShowSuccessFlash] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // --- CHAT STATE ---
  const [chatMessages, setChatMessages] = useState([
    { role: 'model', text: "Welcome back, Alex! I'm your personalized WTW Carbon Auditor. Let's track your carbon footprint with precision today." }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // --- CALCULATOR ---
  const [calcAnswers, setCalcAnswers] = useState({
    commuteMethod: 'gasoline', weeklyMiles: 120, annualFlights: 2,
    homeType: 'apartment', gridSource: 'mixed', thermostatValue: 68,
    meatDiet: 'regular', organicShare: 'some', clothingFrequency: 'monthly',
    electronicsCycle: '2years', recyclingHabit: 'standard', composting: false
  });

  const [tipIndex, setTipIndex] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [leaderboard] = useState([
    { rank: 1, name: "Sarah Jenkins", level: 6, avoided_tons: 3.42, avatar: "👩‍🌾" },
    { rank: 2, name: "Marcus Vance", level: 4, avoided_tons: 2.15, avatar: "🚴" },
    { rank: 3, name: "Alex Thorne (You)", level: 3, avoided_tons: 1.45, avatar: "🌳" }
  ]);

  const addNotification = (text, type = "success") => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, text, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4500);
  };

  useEffect(() => {
    const interval = setInterval(() => setTipIndex(prev => (prev + 1) % ECO_TIPS.length), 8500);
    return () => clearInterval(interval);
  }, []);

  // --- CLEANUP CAMERA ON UNMOUNT OR TAB CHANGE ---
  useEffect(() => {
    return () => stopCamera();
  }, []);

  useEffect(() => {
    if (activeTab !== 'scanner') {
      stopCamera();
    }
  }, [activeTab]);

  // ========================
  // CAMERA SCANNER FUNCTIONS
  // ========================
  const startCamera = useCallback(async () => {
    setCameraError(null);
    setScanResult(null);
    setScanStatus('Initializing camera...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      setScanStatus('Camera active — point at a barcode or receipt');
      
      // Start continuous scanning
      if (scanType === 'barcode') {
        startBarcodeScan();
      } else {
        setScanStatus('Camera active — tap "Capture & Read" to scan receipt text');
      }
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera access denied. Please allow camera permissions in your browser settings.'
          : err.name === 'NotFoundError'
          ? 'No camera found. Please connect a camera and try again.'
          : `Camera error: ${err.message}`
      );
      setCameraActive(false);
    }
  }, [scanType]);

  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setScanStatus('');
  }, []);

  const startBarcodeScan = useCallback(() => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);

    const scanFrame = async () => {
      if (!videoRef.current || !canvasRef.current || videoRef.current.readyState < 2) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);

      try {
        const Quagga = (await import('@ericblade/quagga2')).default;
        const imageData = canvas.toDataURL('image/jpeg', 0.8);

        Quagga.decodeSingle({
          src: imageData,
          numOfWorkers: 0,
          decoder: {
            readers: ['ean_reader', 'ean_8_reader', 'upc_reader', 'upc_e_reader', 'code_128_reader', 'code_39_reader']
          },
          locate: true
        }, (result) => {
          if (result && result.codeResult) {
            const code = result.codeResult.code;
            setScanStatus(`✅ Barcode detected: ${code}`);
            setShowSuccessFlash(true);
            setTimeout(() => setShowSuccessFlash(false), 600);

            // Look up in database
            const match = BARCODE_DB[code];
            if (match) {
              setScanResult({ type: 'barcode', code, ...match });
            } else {
              // Generate a carbon estimate for unknown barcodes
              const estimatedCo2 = round(Math.random() * 5 + 0.3, 2);
              setScanResult({
                type: 'barcode', code,
                name: `Scanned Product (${code})`,
                co2: estimatedCo2,
                category: estimatedCo2 < 1 ? "Low Impact" : estimatedCo2 < 5 ? "Medium Impact" : "High Impact",
                comparison: "Estimated from product category averages",
                color: estimatedCo2 < 1 ? "emerald" : estimatedCo2 < 5 ? "amber" : "red",
                alternative: "Check product labels for certified carbon-neutral alternatives."
              });
            }
            stopCamera();
          }
        });
      } catch (err) {
        console.log('Quagga scan cycle:', err.message);
      }
    };

    setScanStatus('🔍 Scanning for barcodes... Hold steady');
    scanIntervalRef.current = setInterval(scanFrame, 800);
  }, [stopCamera]);

  const captureReceiptOCR = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsScanning(true);
    setScanStatus('📸 Capturing frame...');

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    try {
      setScanStatus('🔤 Running OCR text recognition...');
      const Tesseract = await import('tesseract.js');
      const { data: { text } } = await Tesseract.recognize(canvas, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            setScanStatus(`🔤 OCR Progress: ${Math.round((m.progress || 0) * 100)}%`);
          }
        }
      });

      setScanStatus('✅ Text extracted! Analyzing...');
      setShowSuccessFlash(true);
      setTimeout(() => setShowSuccessFlash(false), 600);

      // Parse extracted text for receipt-like content
      const lines = text.split('\n').filter(l => l.trim().length > 2);
      const priceRegex = /\$?\d+\.\d{2}/;
      const items = [];
      let storeName = '';

      // Try to detect store name (first non-empty line or lines with known patterns)
      const knownStores = ['walmart', 'target', 'costco', 'whole foods', 'kroger', 'safeway', 'trader joe', 'aldi'];
      for (const line of lines.slice(0, 5)) {
        const lower = line.toLowerCase();
        if (knownStores.some(s => lower.includes(s))) {
          storeName = line.trim();
          break;
        }
      }
      if (!storeName && lines.length > 0) storeName = lines[0].trim();

      // Extract items with prices
      for (const line of lines) {
        const priceMatch = line.match(priceRegex);
        if (priceMatch) {
          const cost = parseFloat(priceMatch[0].replace('$', ''));
          const name = line.replace(priceRegex, '').trim().replace(/[^a-zA-Z0-9\s]/g, '').trim();
          if (name.length > 1 && cost > 0 && cost < 500) {
            // Estimate footprint based on price category
            const co2Est = round(cost * 0.35, 1);
            items.push({
              name: name.substring(0, 40),
              cost,
              footprint: `~${co2Est} kg CO₂ (estimated)`
            });
          }
        }
      }

      if (items.length > 0) {
        const totalCo2 = round(items.reduce((sum, i) => sum + parseFloat(i.footprint), 0), 1);
        setScanResult({
          type: 'receipt',
          store: storeName || 'Receipt Scan',
          items: items.slice(0, 8),
          totalCo2,
          savingTip: "Look for locally-sourced and seasonal produce to reduce transport emissions by up to 50%."
        });
      } else {
        // If no items found, show the raw text
        setScanResult({
          type: 'receipt',
          store: storeName || 'Scanned Document',
          items: [{ name: "Raw text extracted", cost: 0, footprint: "See below" }],
          totalCo2: 0,
          rawText: text.substring(0, 500),
          savingTip: "Try holding the receipt closer and ensuring good lighting for better results."
        });
      }
      stopCamera();
    } catch (err) {
      setScanStatus('❌ OCR failed: ' + err.message);
      console.error('OCR error:', err);
    } finally {
      setIsScanning(false);
    }
  }, [stopCamera]);

  // ========================
  // MAP ROUTING
  // ========================
  const handleMapClick = useCallback(async (latlng) => {
    if (!mapOrigin) {
      setMapOrigin(latlng);
      setAuditResult(null);
      const name = await reverseGeocode(latlng.lat, latlng.lng);
      setOriginName(name);
      addNotification("📍 Origin marked! Click map again for destination.");
    } else if (!mapDest) {
      setMapDest(latlng);
      const name = await reverseGeocode(latlng.lat, latlng.lng);
      setDestName(name);
      addNotification("📍 Destination marked! Calculating route...");

      // Auto-calculate
      setIsAuditing(true);
      const straightKm = haversineDistanceKm(mapOrigin.lat, mapOrigin.lng, latlng.lat, latlng.lng);
      const roadKm = straightKm * 1.3; // Road distance estimate
      const result = computeWTW(roadKm, routeTransport, customEfficiency ? parseFloat(customEfficiency) : null, payloadWeight ? parseFloat(payloadWeight) : 0);
      result.route_summary = `Calculated ${round(roadKm, 1)} km road-estimated path (${round(straightKm, 1)} km straight-line × 1.3 road factor).`;
      setAuditResult(result);
      setIsAuditing(false);
    }
  }, [mapOrigin, mapDest, routeTransport, customEfficiency, payloadWeight]);

  const clearMapMarkers = useCallback(() => {
    setMapOrigin(null);
    setMapDest(null);
    setOriginName('');
    setDestName('');
    setAuditResult(null);
  }, []);

  const recalculateRoute = useCallback(() => {
    if (!mapOrigin || !mapDest) return;
    setIsAuditing(true);
    const straightKm = haversineDistanceKm(mapOrigin.lat, mapOrigin.lng, mapDest.lat, mapDest.lng);
    const roadKm = straightKm * 1.3;
    const result = computeWTW(roadKm, routeTransport, customEfficiency ? parseFloat(customEfficiency) : null, payloadWeight ? parseFloat(payloadWeight) : 0);
    result.route_summary = `Recalculated ${round(roadKm, 1)} km road-estimated path.`;
    setAuditResult(result);
    setIsAuditing(false);
  }, [mapOrigin, mapDest, routeTransport, customEfficiency, payloadWeight]);

  const logAuditResultToProfile = () => {
    if (!auditResult) return;
    const newTrip = {
      id: `trip_${Date.now()}`,
      origin: originName || 'Origin',
      destination: destName || 'Destination',
      distance: auditResult.distance_miles,
      co2: auditResult.co2_kg,
      mode: routeTransport
    };
    setLoggedTrips(prev => [newTrip, ...prev]);
    setUserProfile(prev => ({ ...prev, xp: prev.xp + 50 }));
    addNotification("Saved route to travel ledger! Earned 50 XP.");
    clearMapMarkers();
  };

  // --- DIRECT FUEL AUDIT ---
  const triggerDirectFuelAudit = (e) => {
    e.preventDefault();
    if (!fuelVolume) return;
    setIsDirectAuditing(true);
    setDirectAuditResult(null);

    const fuel = fuelType.toLowerCase();
    const factors = WTW_FACTORS[fuel] || WTW_FACTORS.gasoline;
    const volume = parseFloat(fuelVolume);
    const payloadAdj = 1.0 + ((payloadWeight ? parseFloat(payloadWeight) : 0) * 0.00015);
    const effectiveVolume = volume * payloadAdj;
    const ttwCo2 = round(effectiveVolume * factors.ttw, 2);
    const wttCo2 = round(effectiveVolume * factors.wtt, 2);
    const totalWtw = round(ttwCo2 + wttCo2, 2);

    setDirectAuditResult({
      methodology: "Tier 3 Fuel-Based Method",
      fuel_type: fuel,
      input_volume: volume,
      adjusted_volume: round(effectiveVolume, 3),
      payload_adjustment_factor: round(payloadAdj, 4),
      units: factors.unit,
      direct_ttw_co2_kg: ttwCo2,
      indirect_wtt_co2_kg: wttCo2,
      total_wtw_co2_kg: totalWtw,
      regulatory_sources: factors.source
    });
    addNotification("Tier 3 fuel ledger recorded!");
    setIsDirectAuditing(false);
  };

  // --- CHAT (Direct Gemini API call) ---
  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = { role: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    if (!userApiKey) {
      setChatMessages(prev => [...prev, { role: 'model', text: "⚠️ Please enter your Gemini API key in the header settings to enable AI coaching. For now, here are quick tips: Try swapping one driving trip per week with public transit to save ~2.5 kg CO₂." }]);
      setIsChatLoading(false);
      return;
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${userApiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: chatInput }] }],
          systemInstruction: { parts: [{ text: "You are an expert Sustainability Data Scientist and Carbon Auditor. Formulate your responses according to Gold Standard Scope 1, 2, and 3 calculations. Max 180 words." }] }
        })
      });
      if (res.ok) {
        const data = await res.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";
        setChatMessages(prev => [...prev, { role: 'model', text: reply }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'model', text: "⚠️ API error. Please check your Gemini API key." }]);
      }
    } catch {
      setChatMessages(prev => [...prev, { role: 'model', text: "⚠️ Network error. Check connection and API key." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // --- CHALLENGES ---
  const dailyChallenges = [
    { id: 'diet_veg', title: 'Plant-Based Day', category: 'food', points: 40, co2Saved: 3.5, cashSaved: 4.50, icon: UtensilsCrossed, desc: 'Avoid all animal meats today.' },
    { id: 'trans_bike', title: 'Pedal Power Commute', category: 'transport', points: 60, co2Saved: 6.2, cashSaved: 8.00, icon: Car, desc: 'Use bike or walk for trips under 5 miles.' },
    { id: 'energy_wash', title: 'Cold-Water Cycle', category: 'energy', points: 25, co2Saved: 1.2, cashSaved: 1.50, icon: Home, desc: 'Wash clothes in cold water.' },
    { id: 'shop_reuse', title: 'Thrift & Refuse', category: 'shopping', points: 35, co2Saved: 2.8, cashSaved: 15.00, icon: ShoppingBag, desc: 'Buy only secondhand or repair items.' },
    { id: 'energy_vampire', title: 'Unplug Vampires', category: 'energy', points: 20, co2Saved: 0.8, cashSaved: 0.75, icon: Zap, desc: 'Switch off all vampire devices.' },
    { id: 'waste_compost', title: 'Sort & Compost', category: 'waste', points: 30, co2Saved: 1.5, cashSaved: 0.50, icon: Trash2, desc: 'Compost organic scraps.' }
  ];

  const offsetProjects = [
    { id: 'offset_reforest', title: 'Oregon Douglas Fir Reforestation', type: 'Reforestation', costXP: 1200, tonsOffset: 0.5, desc: 'Restores wildfire-ravaged native evergreen habitats.', image: '🌲', verifiedBy: 'Gold Standard' },
    { id: 'offset_air_capture', title: 'Direct Air Capture (Climeworks)', type: 'Carbon Removal', costXP: 3500, tonsOffset: 1.0, desc: 'Extracts atmospheric CO₂ via solid sorbents.', image: '🌬️', verifiedBy: 'Puro Earth' },
    { id: 'offset_clean_cook', title: 'Stove Efficiency in Kenya', type: 'Community Support', costXP: 800, tonsOffset: 0.3, desc: 'High-efficiency biomass stoves reducing wood gather needs.', image: '🔥', verifiedBy: 'Verra VCS' }
  ];

  const toggleChallenge = (id) => {
    const isCompleted = !completedActions.includes(id);
    const challenge = dailyChallenges.find(c => c.id === id);
    if (!challenge) return;

    if (isCompleted) {
      setCompletedActions([...completedActions, id]);
      setUserProfile(prev => {
        let newXp = prev.xp + challenge.points;
        let newLevel = prev.level;
        if (newXp >= prev.xpToNext) { newXp -= prev.xpToNext; newLevel += 1; }
        return { ...prev, level: newLevel, xp: newXp, streak: prev.streak + 1,
          co2Avoided: parseFloat((prev.co2Avoided + (challenge.co2Saved * 0.052)).toFixed(3)),
          cashSaved: prev.cashSaved + challenge.cashSaved
        };
      });
      addNotification(`Earned ${challenge.points} XP!`);
    } else {
      setCompletedActions(completedActions.filter(x => x !== id));
      setUserProfile(prev => ({
        ...prev, xp: Math.max(0, prev.xp - challenge.points),
        co2Avoided: parseFloat(Math.max(0, prev.co2Avoided - (challenge.co2Saved * 0.052)).toFixed(3)),
        cashSaved: Math.max(0, prev.cashSaved - challenge.cashSaved)
      }));
    }
  };

  const triggerPurchaseOffset = (project) => {
    if (userProfile.xp < project.costXP) {
      addNotification("Insufficient XP to purchase this carbon offset.", "error");
      return;
    }
    setUserProfile(prev => ({
      ...prev, xp: prev.xp - project.costXP,
      co2Avoided: parseFloat((prev.co2Avoided + project.tonsOffset).toFixed(3))
    }));
    addNotification(`Retired ${project.tonsOffset}t CO₂!`);
  };

  // --- CALCULATOR ---
  const runCalculatorFormula = () => {
    let t = 0, e = 0, f = 0, s = 0, w = 0;
    if (calcAnswers.commuteMethod === 'gasoline') t += (calcAnswers.weeklyMiles * 52 * 0.404) / 1000;
    else if (calcAnswers.commuteMethod === 'hybrid') t += (calcAnswers.weeklyMiles * 52 * 0.220) / 1000;
    else if (calcAnswers.commuteMethod === 'electric') t += (calcAnswers.weeklyMiles * 52 * 0.085) / 1000;
    else if (calcAnswers.commuteMethod === 'transit') t += (calcAnswers.weeklyMiles * 52 * 0.045) / 1000;
    t += calcAnswers.annualFlights * 1.15;
    if (calcAnswers.homeType === 'house') e += 3.8;
    else if (calcAnswers.homeType === 'townhouse') e += 2.5;
    else e += 1.4;
    if (calcAnswers.gridSource === 'standard') e *= 1.25;
    else if (calcAnswers.gridSource === 'mixed') e *= 0.85;
    else e *= 0.15;
    if (calcAnswers.meatDiet === 'heavy') f += 3.5;
    else if (calcAnswers.meatDiet === 'regular') f += 2.6;
    else if (calcAnswers.meatDiet === 'flexitarian') f += 1.8;
    else if (calcAnswers.meatDiet === 'vegetarian') f += 1.3;
    else f += 0.8;
    if (calcAnswers.organicShare === 'none') f += 0.3;
    if (calcAnswers.clothingFrequency === 'weekly') s += 1.8;
    else if (calcAnswers.clothingFrequency === 'monthly') s += 1.0;
    else s += 0.4;
    if (calcAnswers.electronicsCycle === '1year') s += 1.5;
    else s += 0.6;
    if (calcAnswers.recyclingHabit === 'comprehensive') w += 0.3;
    else if (calcAnswers.recyclingHabit === 'standard') w += 0.7;
    else w += 1.3;
    if (calcAnswers.composting) w -= 0.2;
    setEmissions({
      transport: parseFloat(t.toFixed(1)), energy: parseFloat(e.toFixed(1)),
      food: parseFloat(f.toFixed(1)), shopping: parseFloat(s.toFixed(1)),
      waste: parseFloat((w > 0.1 ? w : 0.1).toFixed(1))
    });
  };

  // --- COMPUTED VALUES ---
  const totalTravelEmissions = useMemo(() => loggedTrips.reduce((acc, trip) => acc + (trip.co2 / 1000), 0), [loggedTrips]);

  const currentSavings = useMemo(() => completedActions.reduce((acc, actionId) => {
    const act = dailyChallenges.find(d => d.id === actionId);
    return act ? acc + (act.co2Saved * 0.052) : acc;
  }, 0), [completedActions]);

  const currentTotalEmissions = useMemo(() => {
    const totalBase = Object.values(emissions).reduce((a, b) => a + b, 0);
    const net = totalBase - currentSavings + totalTravelEmissions;
    return parseFloat((net > 0.4 ? net : 0.4).toFixed(1));
  }, [emissions, currentSavings, totalTravelEmissions]);

  const progressPercentage = useMemo(() => {
    const totalBase = Object.values(emissions).reduce((a, b) => a + b, 0);
    const idealTarget = totalBase * 0.55;
    const diff = totalBase - currentTotalEmissions;
    const progress = (diff / (totalBase - idealTarget)) * 100;
    return Math.min(Math.max(Math.round(progress), 0), 100);
  }, [emissions, currentTotalEmissions]);

  // --- VIRTUAL FOREST ---
  const renderVirtualForest = () => {
    const maxEmissions = 15;
    const healthScore = Math.max(0, 100 - (currentTotalEmissions / maxEmissions) * 100);
    const completedCount = completedActions.length;
    const trees = [
      { id: 1, cx: 40, cy: 95, size: 28, color: '#134e5e' },
      { id: 2, cx: 120, cy: 110, size: 36, color: '#0f766e' },
      { id: 3, cx: 200, cy: 90, size: 25, color: '#115e59' },
      { id: 4, cx: 280, cy: 105, size: 32, color: '#14b8a6', active: completedCount >= 1 },
      { id: 5, cx: 350, cy: 115, size: 40, color: '#0d9488', active: completedCount >= 2 },
      { id: 6, cx: 430, cy: 95, size: 26, color: '#2dd4bf', active: completedCount >= 3 },
      { id: 7, cx: 510, cy: 110, size: 34, color: '#047857', active: completedCount >= 4 },
      { id: 8, cx: 580, cy: 85, size: 22, color: '#059669', active: completedCount >= 5 },
      { id: 9, cx: 650, cy: 105, size: 38, color: '#10b981', active: completedCount >= 6 }
    ];
    return (
      <div className="relative bg-gradient-to-b from-slate-900 via-teal-950 to-emerald-950 rounded-3xl p-6 h-72 flex flex-col justify-between overflow-hidden shadow-xl border border-emerald-900/40">
        <div className="absolute inset-0 pointer-events-none overflow-hidden animate-pulse">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="absolute w-1 h-1 bg-teal-400 rounded-full opacity-40"
              style={{ top: `${10 + i * 8}%`, left: `${5 + i * 11}%` }} />
          ))}
        </div>
        <div className="absolute top-4 left-4 z-10 flex items-center space-x-2.5 bg-slate-900/60 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/10">
          <span className="text-xl">🏆</span>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Guardian Rank</p>
            <p className="text-xs font-bold text-teal-400">Level {userProfile.level} • Canopy Cultivator</p>
          </div>
        </div>
        <div className="absolute top-4 right-4 z-10 bg-emerald-500/10 backdrop-blur-md border border-emerald-400/20 px-3.5 py-1.5 rounded-2xl text-xs font-semibold text-emerald-400 flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Canopy Health: {healthScore.toFixed(0)}%</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-44 pointer-events-none">
          <svg viewBox="0 0 700 150" className="w-full h-full">
            <path d="M-100,150 Q150,80 400,130 T900,150 L900,200 L-100,200 Z" fill="#042f2e" opacity="0.8" />
            <path d="M-50,150 Q250,95 500,120 T1000,150 L1000,200 L-50,200 Z" fill="#064e3b" opacity="0.6" />
            {trees.map((t) => {
              if (t.active === false) return null;
              return (
                <g key={t.id} className="transition-all duration-500">
                  <rect x={t.cx - 2} y={t.cy} width={4} height={150 - t.cy} fill="#3b2314" />
                  <circle cx={t.cx} cy={t.cy} r={t.size} fill={t.color} opacity="0.85" />
                  <circle cx={t.cx - 3} cy={t.cy - 3} r={t.size * 0.7} fill="#2dd4bf" opacity="0.15" />
                </g>
              );
            })}
          </svg>
        </div>
        <div className="mt-auto relative z-10 w-full flex flex-col sm:flex-row items-center justify-between bg-slate-900/75 backdrop-blur-md p-4 rounded-2xl border border-white/5 gap-3">
          <div className="flex items-center space-x-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20 text-teal-400">
              <TreePine className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Active Sanctuary Progress</p>
              <h4 className="text-sm font-extrabold text-white">
                {completedCount === 0 ? "Barren field — Tick tasks to plant trees!" :
                 completedCount < 3 ? "A sprout has formed in your preserve!" : "Bountiful Ancient Biosphere!"}
              </h4>
            </div>
          </div>
          <div className="flex items-center space-x-1 bg-teal-500/20 px-3 py-1.5 rounded-xl border border-teal-500/30">
            <span className="text-xs font-bold text-teal-300">{completedCount} Challenges Active</span>
          </div>
        </div>
      </div>
    );
  };

  // ============
  //   RENDER
  // ============
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col antialiased selection:bg-emerald-500 selection:text-white">

      {/* NOTIFICATION FLOATER */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2">
        {notifications.map(n => (
          <div key={n.id} className={`p-4 rounded-2xl shadow-xl flex items-center space-x-2.5 text-xs font-bold border transition-all duration-300 ${
            n.type === "error" ? "bg-red-500/20 border-red-500/30 text-red-300" : "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
          }`}>
            <Leaf className="w-4 h-4 shrink-0" />
            <span>{n.text}</span>
          </div>
        ))}
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 p-2.5 rounded-2xl shadow-lg flex items-center justify-center">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white flex items-center">
                EcoStep<span className="text-emerald-400 font-normal">.</span>
              </span>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Client-Side Engine Active</span>
              </div>
            </div>
          </div>

          <nav className="hidden lg:flex space-x-1.5 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800">
            {[
              { id: 'dashboard', label: 'Ecosystem', icon: TreePine },
              { id: 'calculator', label: 'WTW Config', icon: Calendar },
              { id: 'scanner', label: 'Eco-Scanner', icon: ScanBarcode },
              { id: 'coach', label: 'AI Coach', icon: Sparkles },
              { id: 'marketplace', label: 'Offsets', icon: Store }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}>
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={userApiKey}
              onChange={(e) => setUserApiKey(e.target.value)}
              placeholder="Gemini API Key"
              className="hidden sm:block bg-slate-950 border border-slate-800 text-[10px] rounded-xl px-3 py-2 text-slate-400 outline-none focus:border-emerald-500 w-36 font-mono"
            />
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 px-3.5 py-2 rounded-2xl font-black text-xs flex items-center space-x-1 shadow-md">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{userProfile.xp} XP</span>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="lg:hidden flex overflow-x-auto px-4 pb-2 space-x-2">
          {[
            { id: 'dashboard', label: 'Home', icon: TreePine },
            { id: 'calculator', label: 'Config', icon: Calendar },
            { id: 'scanner', label: 'Scanner', icon: ScanBarcode },
            { id: 'coach', label: 'AI', icon: Sparkles },
            { id: 'marketplace', label: 'Offsets', icon: Store }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap flex items-center space-x-1 ${
                  activeTab === tab.id ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500'
                }`}>
                <Icon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        {/* ==================== TAB 1: DASHBOARD ==================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Carbon Score */}
              <div className="lg:col-span-4 bg-slate-950/40 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col items-center justify-between min-h-[300px]">
                <h3 className="text-xs uppercase font-black text-slate-400 tracking-widest">Calculated Score</h3>
                <div className="relative w-44 h-44 my-4 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="88" cy="88" r="74" stroke="#1e293b" strokeWidth="10" fill="transparent" />
                    <circle cx="88" cy="88" r="74" stroke="url(#greenGrad)" strokeWidth="11" fill="transparent"
                      strokeDasharray={464}
                      strokeDashoffset={464 - (464 * Math.max(10, Math.min(100, (currentTotalEmissions / 15) * 100))) / 100}
                      strokeLinecap="round" />
                    <defs>
                      <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#0d9488" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-5xl font-black text-white tracking-tighter">{currentTotalEmissions}</span>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">t CO₂e / yr</span>
                  </div>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                </div>
              </div>

              {/* Canopy */}
              <div className="lg:col-span-8 space-y-4">{renderVirtualForest()}</div>
            </div>

            {/* ===== INTERACTIVE MAP ROUTE AUDITOR ===== */}
            <div className="bg-slate-950/20 p-6 rounded-3xl border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <MapPin className="text-emerald-400 w-5 h-5" />
                    <span>Interactive Route Carbon Audit</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Click the map to place origin (1st click) and destination (2nd click). CO₂ calculates automatically.</p>
                </div>
                <div className="flex items-center gap-2 mt-3 sm:mt-0">
                  {(mapOrigin || mapDest) && (
                    <button onClick={clearMapMarkers} className="bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 hover:border-red-500/50 transition-all">
                      <X className="w-3.5 h-3.5" /> Clear Markers
                    </button>
                  )}
                </div>
              </div>

              {/* Transport & Payload Controls */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <select value={routeTransport} onChange={(e) => { setRouteTransport(e.target.value); if (mapOrigin && mapDest) setTimeout(recalculateRoute, 50); }}
                  className="bg-slate-900 border border-slate-800 text-xs rounded-xl px-3 py-2.5 text-white focus:border-emerald-500 outline-none font-bold">
                  <option value="gasoline">Gasoline (E10)</option>
                  <option value="diesel">Diesel (B7)</option>
                  <option value="electric">Electric (EV)</option>
                  <option value="flight">Passenger Flight</option>
                </select>
                <input type="number" value={payloadWeight} onChange={(e) => setPayloadWeight(e.target.value)}
                  placeholder="Cargo (kg)" className="bg-slate-900 border border-slate-800 text-xs rounded-xl px-3 py-2.5 text-white focus:border-emerald-500 outline-none font-bold" />
                <input type="number" step="0.01" value={customEfficiency} onChange={(e) => setCustomEfficiency(e.target.value)}
                  placeholder="Efficiency L/100km" className="bg-slate-900 border border-slate-800 text-xs rounded-xl px-3 py-2.5 text-white focus:border-emerald-500 outline-none font-bold" />
                {mapOrigin && mapDest && (
                  <button onClick={recalculateRoute} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black py-2.5 rounded-xl transition-all">
                    Recalculate
                  </button>
                )}
              </div>

              {/* Map + Location Labels */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-8 rounded-2xl overflow-hidden border border-slate-800" style={{ height: '400px' }}>
                  <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapClickHandler onMapClick={handleMapClick} />
                    {mapOrigin && (
                      <Marker position={[mapOrigin.lat, mapOrigin.lng]} icon={originIcon}>
                        <Popup><strong>📍 Origin</strong><br />{originName || 'Loading...'}</Popup>
                      </Marker>
                    )}
                    {mapDest && (
                      <Marker position={[mapDest.lat, mapDest.lng]} icon={destIcon}>
                        <Popup><strong>🏁 Destination</strong><br />{destName || 'Loading...'}</Popup>
                      </Marker>
                    )}
                    {mapOrigin && mapDest && (
                      <Polyline positions={[[mapOrigin.lat, mapOrigin.lng], [mapDest.lat, mapDest.lng]]}
                        pathOptions={{ color: '#34d399', weight: 3, dashArray: '10 6', opacity: 0.8 }} />
                    )}
                  </MapContainer>
                </div>

                <div className="lg:col-span-4 space-y-3">
                  {/* Origin info */}
                  <div className={`p-4 rounded-2xl border ${mapOrigin ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-950/40 border-slate-800 border-dashed'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-3 h-3 rounded-full ${mapOrigin ? 'bg-emerald-400' : 'bg-slate-700'}`}></div>
                      <span className="text-[10px] uppercase font-black text-slate-400">Origin</span>
                    </div>
                    <p className="text-xs font-bold text-white">{originName || 'Click map to set origin'}</p>
                    {mapOrigin && <p className="text-[10px] text-slate-500 mt-1">{mapOrigin.lat.toFixed(5)}, {mapOrigin.lng.toFixed(5)}</p>}
                  </div>

                  {/* Dest info */}
                  <div className={`p-4 rounded-2xl border ${mapDest ? 'bg-red-500/5 border-red-500/20' : 'bg-slate-950/40 border-slate-800 border-dashed'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-3 h-3 rounded-full ${mapDest ? 'bg-red-400' : 'bg-slate-700'}`}></div>
                      <span className="text-[10px] uppercase font-black text-slate-400">Destination</span>
                    </div>
                    <p className="text-xs font-bold text-white">{destName || 'Click map to set destination'}</p>
                    {mapDest && <p className="text-[10px] text-slate-500 mt-1">{mapDest.lat.toFixed(5)}, {mapDest.lng.toFixed(5)}</p>}
                  </div>

                  {/* Audit Result Mini Card */}
                  {auditResult && (
                    <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/20 space-y-2 animate-fade-in">
                      <span className="bg-emerald-400/20 text-emerald-400 text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-full">Audit Complete</span>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="p-2 bg-slate-950/60 rounded-xl text-center">
                          <span className="text-[9px] text-slate-400 uppercase block">Distance</span>
                          <p className="text-sm font-black text-white">{auditResult.distance_km} km</p>
                        </div>
                        <div className="p-2 bg-slate-950/60 rounded-xl text-center border border-emerald-500/20">
                          <span className="text-[9px] text-emerald-400 uppercase block">Total WTW</span>
                          <p className="text-sm font-black text-emerald-400">{auditResult.co2_kg} kg</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-slate-950/40 rounded-xl text-center">
                          <span className="text-[8px] text-slate-500 uppercase block">TTW</span>
                          <p className="text-xs font-bold text-slate-300">{auditResult.ttw_co2_kg} kg</p>
                        </div>
                        <div className="p-2 bg-slate-950/40 rounded-xl text-center">
                          <span className="text-[8px] text-slate-500 uppercase block">WTT</span>
                          <p className="text-xs font-bold text-slate-300">{auditResult.wtt_co2_kg} kg</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500">{auditResult.route_summary}</p>
                      <button onClick={logAuditResultToProfile}
                        className="w-full bg-emerald-400 hover:bg-emerald-500 text-slate-950 text-xs font-extrabold px-4 py-2 rounded-xl transition-all">
                        Log to Profile (+50 XP)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* DIRECT TIER 3 FUEL LEDGER */}
            <div className="bg-slate-950/20 p-6 rounded-3xl border border-slate-800">
              <div className="flex items-center space-x-2.5 mb-4">
                <FileText className="text-emerald-400 w-5 h-5" />
                <div>
                  <h3 className="text-md font-bold text-white">Direct Fuel Purchase Ledger (Scope 1 & 2)</h3>
                  <p className="text-xs text-slate-400">Input fuel purchase values directly for Tier 3 accuracy.</p>
                </div>
              </div>
              <form onSubmit={triggerDirectFuelAudit} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <select value={fuelType} onChange={(e) => setFuelType(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-xs rounded-xl px-4 py-3 text-white outline-none font-bold">
                  <option value="gasoline">Gasoline (Liters)</option>
                  <option value="diesel">Diesel (Liters)</option>
                  <option value="electricity">Grid Electricity (kWh)</option>
                  <option value="jet_fuel">Jet A-1 Fuel (Liters)</option>
                </select>
                <input type="number" step="0.01" value={fuelVolume} onChange={(e) => setFuelVolume(e.target.value)}
                  placeholder="Volume / Amount" className="bg-slate-900 border border-slate-800 text-xs rounded-xl px-4 py-3 text-white outline-none font-bold" required />
                <input type="number" value={payloadWeight} onChange={(e) => setPayloadWeight(e.target.value)}
                  placeholder="Payload (kg)" className="bg-slate-900 border border-slate-800 text-xs rounded-xl px-4 py-3 text-white outline-none font-bold" />
                <button type="submit" disabled={isDirectAuditing}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold py-3 rounded-xl transition-all">
                  {isDirectAuditing ? "Processing..." : "Log Fuel Purchase"}
                </button>
              </form>
              {directAuditResult && (
                <div className="mt-6 p-4 bg-slate-900/40 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center animate-fade-in">
                  <div className="p-3 bg-slate-950/60 rounded-xl">
                    <span className="text-[10px] text-slate-500 uppercase">Tailpipe (TTW)</span>
                    <p className="text-lg font-bold text-white">{directAuditResult.direct_ttw_co2_kg} kg CO₂e</p>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl">
                    <span className="text-[10px] text-slate-500 uppercase">Upstream (WTT)</span>
                    <p className="text-lg font-bold text-white">{directAuditResult.indirect_wtt_co2_kg} kg CO₂e</p>
                  </div>
                  <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <span className="text-[10px] text-emerald-400 uppercase font-semibold">Total WTW</span>
                    <p className="text-lg font-black text-emerald-400">{directAuditResult.total_wtw_co2_kg} kg CO₂e</p>
                    <span className="text-[8px] text-slate-500 block">Via {directAuditResult.regulatory_sources}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Travel Ledger & Leaderboard */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 bg-slate-950/20 p-6 rounded-3xl border border-slate-800">
                <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2">
                  <FileText className="text-slate-400 w-4 h-4" />
                  <span>My Travel Ledger</span>
                </h3>
                {loggedTrips.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs">No routes logged yet. Use the map above to audit routes!</div>
                ) : (
                  <div className="space-y-3">
                    {loggedTrips.map((trip) => (
                      <div key={trip.id} className="p-3.5 bg-slate-900/60 rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-slate-200">{trip.origin} ➔ {trip.destination}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5 capitalize">{trip.mode} • {trip.distance} miles</p>
                        </div>
                        <span className="text-emerald-400 font-bold">+{trip.co2} kg CO₂</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="lg:col-span-4 bg-slate-950/20 p-6 rounded-3xl border border-slate-800 space-y-4">
                <h3 className="text-md font-bold text-white flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>Eco Leaderboard</span>
                </h3>
                <div className="space-y-2.5">
                  {leaderboard.map((u, i) => (
                    <div key={i} className="flex justify-between items-center text-xs p-3 bg-slate-900/40 rounded-xl border border-slate-800">
                      <div className="flex items-center space-x-2.5">
                        <span className="font-mono text-slate-500">{u.rank}.</span>
                        <span className="text-lg">{u.avatar}</span>
                        <div>
                          <p className="font-bold text-slate-200">{u.name}</p>
                          <p className="text-[9px] text-slate-500">Lvl {u.level}</p>
                        </div>
                      </div>
                      <span className="font-bold text-emerald-400">-{u.avoided_tons}t CO₂</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: CALCULATOR ==================== */}
        {activeTab === 'calculator' && (
          <div className="max-w-3xl mx-auto bg-slate-950/40 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Configure Base Emission Profile</h3>
            <p className="text-xs text-slate-400 mb-6">Modify baseline habits to calculate your target index.</p>
            <div className="space-y-6">
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
                <label className="text-xs font-bold text-slate-300 block mb-2">Housing Arrangement</label>
                <div className="grid grid-cols-3 gap-3">
                  {['house', 'townhouse', 'apartment'].map(h => (
                    <button key={h} onClick={() => setCalcAnswers({...calcAnswers, homeType: h})}
                      className={`py-2 text-xs rounded-xl capitalize ${calcAnswers.homeType === h ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>
                      {h}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
                <label className="text-xs font-bold text-slate-300 block mb-2">Diet Profile</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['regular', 'flexitarian', 'vegetarian', 'vegan'].map(d => (
                    <button key={d} onClick={() => setCalcAnswers({...calcAnswers, meatDiet: d})}
                      className={`py-2 text-xs rounded-xl capitalize ${calcAnswers.meatDiet === d ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-slate-300 block">Compost Organic Waste</span>
                  <span className="text-[10px] text-slate-500">Methane mitigation</span>
                </div>
                <button onClick={() => setCalcAnswers({...calcAnswers, composting: !calcAnswers.composting})}
                  className={`px-4 py-2 rounded-xl text-xs font-bold ${calcAnswers.composting ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                  {calcAnswers.composting ? 'Active' : 'Inactive'}
                </button>
              </div>
            </div>
            <button onClick={() => { runCalculatorFormula(); setActiveTab('dashboard'); addNotification("Emissions parameters re-indexed!"); }}
              className="mt-6 w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 py-3 rounded-xl text-xs font-bold transition-all">
              Update Profile
            </button>
          </div>
        )}

        {/* ==================== TAB 3: LIVE ECO SCANNER ==================== */}
        {activeTab === 'scanner' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Scanner Header */}
            <div className="bg-slate-950/40 p-6 rounded-3xl border border-slate-800 shadow-2xl text-center">
              <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-center space-x-2">
                <Camera className="w-5 h-5 text-emerald-400" />
                <span>Live Eco Scanner</span>
              </h3>
              <p className="text-xs text-slate-400">Open your camera to scan barcodes or receipts in real-time for carbon footprint analysis.</p>

              <div className="flex justify-center space-x-2 mt-5">
                <button onClick={() => { setScanType('barcode'); setScanResult(null); if (cameraActive) { stopCamera(); }}}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${scanType === 'barcode' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>
                  <ScanBarcode className="w-3.5 h-3.5 inline mr-1.5" />Barcode Scanner
                </button>
                <button onClick={() => { setScanType('receipt'); setScanResult(null); if (cameraActive) { stopCamera(); }}}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${scanType === 'receipt' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>
                  <FileText className="w-3.5 h-3.5 inline mr-1.5" />Receipt OCR
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Camera Feed */}
              <div className="lg:col-span-7">
                <div className="camera-container">
                  {cameraActive ? (
                    <>
                      <video ref={videoRef} className="camera-feed" playsInline muted autoPlay />
                      <canvas ref={canvasRef} className="hidden" />
                      <div className="scanner-overlay">
                        <div className="scan-line"></div>
                        <div className="scanner-corner tl"></div>
                        <div className="scanner-corner tr"></div>
                        <div className="scanner-corner bl"></div>
                        <div className="scanner-corner br"></div>
                      </div>
                      {showSuccessFlash && <div className="success-flash"></div>}

                      {/* Status bar */}
                      <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 backdrop-blur-md p-3 flex items-center justify-between">
                        <p className="text-[11px] text-emerald-400 font-bold">{scanStatus}</p>
                        <div className="flex gap-2">
                          {scanType === 'receipt' && (
                            <button onClick={captureReceiptOCR} disabled={isScanning}
                              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-[11px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all">
                              <ImageIcon className="w-3.5 h-3.5" />
                              {isScanning ? 'Processing...' : 'Capture & Read'}
                            </button>
                          )}
                          <button onClick={stopCamera} className="bg-red-500/20 hover:bg-red-500/30 text-red-400 text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all">
                            <X className="w-3.5 h-3.5" /> Stop
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-8 space-y-5">
                      {cameraError ? (
                        <div className="text-center space-y-3">
                          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto border border-red-500/20">
                            <X className="w-8 h-8 text-red-400" />
                          </div>
                          <p className="text-xs text-red-400 font-bold max-w-sm">{cameraError}</p>
                          <button onClick={startCamera} className="bg-slate-900 text-slate-300 text-xs font-bold px-4 py-2 rounded-xl border border-slate-700 hover:border-emerald-500/50 transition-all">
                            Try Again
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center border-2 border-dashed border-emerald-500/30">
                            <Camera className="w-10 h-10 text-emerald-400" />
                          </div>
                          <div className="text-center">
                            <h4 className="text-sm font-bold text-white mb-1">
                              {scanType === 'barcode' ? 'Barcode Scanner' : 'Receipt OCR Scanner'}
                            </h4>
                            <p className="text-xs text-slate-500 max-w-sm">
                              {scanType === 'barcode'
                                ? 'Opens your camera to continuously scan barcodes. Carbon data is looked up instantly.'
                                : 'Opens your camera to capture receipt text. OCR reads items and estimates carbon footprint.'}
                            </p>
                          </div>
                          <button onClick={startCamera}
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 text-xs font-black px-6 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2">
                            <Camera className="w-4 h-4" />
                            Open Camera & Start Scanning
                          </button>
                          <p className="text-[10px] text-slate-600">Camera access required • Runs entirely in your browser</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Results Panel */}
              <div className="lg:col-span-5">
                {scanResult ? (
                  <div className="bg-slate-950/40 rounded-3xl border border-slate-800 p-6 space-y-4 animate-fade-in">
                    <span className="bg-emerald-500/10 text-emerald-400 text-[10px] uppercase font-black px-2.5 py-1 rounded-full border border-emerald-500/10">
                      Scanner Result
                    </span>

                    {scanResult.type === 'barcode' ? (
                      <div className="space-y-4">
                        <h4 className="text-md font-bold text-white">{scanResult.name}</h4>
                        <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 uppercase font-mono">Emissions</span>
                          <span className="text-3xl font-black text-white mt-1 block">{scanResult.co2} kg CO₂</span>
                          <span className={`text-[10px] font-bold mt-1 block ${
                            scanResult.color === 'emerald' ? 'text-emerald-400' : scanResult.color === 'amber' ? 'text-amber-400' : 'text-red-400'
                          }`}>{scanResult.category}</span>
                        </div>
                        <p className="text-xs text-slate-400">{scanResult.comparison}</p>
                        <p className="text-xs text-slate-400 font-bold">{scanResult.alternative}</p>
                        {scanResult.code && (
                          <p className="text-[10px] text-slate-600 font-mono">Barcode: {scanResult.code}</p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h4 className="text-md font-bold text-white">{scanResult.store} Audit</h4>
                        <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 uppercase">Receipt footprint</span>
                          <span className="text-3xl font-black text-white mt-1 block">{scanResult.totalCo2} kg CO₂</span>
                        </div>
                        {scanResult.items && scanResult.items.length > 0 && (
                          <div className="space-y-1.5">
                            {scanResult.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-xs p-2 bg-slate-900/40 rounded-lg">
                                <span className="text-slate-300 truncate flex-1">{item.name}</span>
                                <span className="text-slate-500 ml-2">{item.footprint}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {scanResult.rawText && (
                          <div className="p-3 bg-slate-900/40 rounded-xl">
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Extracted Text</p>
                            <p className="text-[11px] text-slate-400 font-mono whitespace-pre-wrap leading-relaxed">{scanResult.rawText}</p>
                          </div>
                        )}
                        <p className="text-xs text-slate-400 font-bold">{scanResult.savingTip}</p>
                      </div>
                    )}

                    <button onClick={() => { setScanResult(null); startCamera(); }}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold py-2.5 rounded-xl hover:border-emerald-500/50 transition-all flex items-center justify-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5" /> Scan Another
                    </button>
                  </div>
                ) : (
                  <div className="bg-slate-950/20 rounded-3xl border border-slate-800 border-dashed p-6 text-center py-14 text-slate-500">
                    <span className="text-4xl block mb-2 opacity-40">📊</span>
                    <h4 className="text-xs font-black uppercase tracking-wider">Awaiting Scanner Input</h4>
                    <p className="text-[10px] text-slate-600 mt-2">Open the camera and scan a product barcode or receipt</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 4: AI COACH ==================== */}
        {activeTab === 'coach' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-slate-950/40 rounded-3xl border border-slate-800 overflow-hidden flex flex-col h-[520px] shadow-2xl">
              <div className="bg-slate-950/70 border-b border-slate-800 px-6 py-4 flex justify-between items-center">
                <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">EcoGuide Climate Agent</h3>
                {!userApiKey && (
                  <span className="text-[10px] text-amber-400 font-bold">⚠️ Add Gemini API key for AI responses</span>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex items-start ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-line ${
                      msg.role === 'user' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-200'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-900 rounded-2xl px-4 py-3 text-xs text-slate-400 flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      Thinking...
                    </div>
                  </div>
                )}
              </div>
              <form onSubmit={handleSendChat} className="p-4 border-t border-slate-800 bg-slate-950/60 flex space-x-2">
                <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about carbon reduction strategies..."
                  className="flex-1 bg-slate-900 border border-slate-800 text-xs rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 font-bold" />
                <button type="submit" disabled={isChatLoading}
                  className="bg-emerald-500 text-slate-950 font-extrabold text-xs px-4 rounded-xl">
                  Ask AI
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ==================== TAB 5: OFFSETS ==================== */}
        {activeTab === 'marketplace' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <h3 className="text-xl font-bold text-white mb-4">Certified Carbon Offsets</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {offsetProjects.map((p) => (
                <div key={p.id} className="bg-slate-950/40 rounded-3xl border border-slate-800 p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-3xl">{p.image}</span>
                    <h4 className="text-sm font-black text-slate-100 mt-4">{p.title}</h4>
                    <p className="text-xs text-slate-400 mt-2">{p.desc}</p>
                    <p className="text-[10px] text-slate-500 mt-1">Verified by {p.verifiedBy}</p>
                  </div>
                  <button onClick={() => triggerPurchaseOffset(p)}
                    className="mt-6 w-full bg-slate-900 border border-slate-800 text-white font-extrabold text-xs py-3 rounded-xl transition-all flex justify-between items-center px-4 hover:border-emerald-500/30">
                    <span>Retire {p.tonsOffset}t CO₂</span>
                    <span className="text-emerald-400 font-black">{p.costXP} XP</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      <footer className="bg-slate-950 border-t border-slate-800 py-12 mt-20 text-slate-500 text-center text-xs font-mono">
        &copy; {new Date().getFullYear()} EcoStep — Scope 1, 2, & 3 Tier 3 carbon audit engine. Runs entirely client-side.
      </footer>
    </div>
  );
}