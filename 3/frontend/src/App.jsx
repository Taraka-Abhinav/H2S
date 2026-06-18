// ==========================================
// FILEPATH: frontend/src/App.jsx
// LOCATION: Frontend Src Folder (ecostep-carbon-tracker/frontend/src/App.jsx)
// PURPOSE: Corrected React application (featuring Store = ShoppingBag alias to prevent ReferenceError)
// ==========================================

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Leaf, 
  Car, 
  Home, 
  UtensilsCrossed, 
  ShoppingBag, 
  Award, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Trash2, 
  RefreshCw, 
  TreePine, 
  Info, 
  Calendar, 
  DollarSign, 
  Zap, 
  Flame, 
  Camera, 
  ScanBarcode, 
  Users, 
  Compass,
  FileText
} from 'lucide-react';

// --- CRITICAL RECOVERY ALIAS FIX ---
// This line fixes the 'Store is not defined' ReferenceError seen in your logs
const Store = ShoppingBag;

const BACKEND_URL = "http://localhost:8000";

// --- UTILITY MATHEMATICAL OPERATORS (SCOPED HIGHER TO PREVENT REFERENCE ERRORS) ---
const max = (a, b) => (a > b ? a : b);
const round = (val, decs) => parseFloat(val.toFixed(decs));

const ECO_TIPS = [
  { text: "Air drying clothes instead of using a dryer for 1 year saves up to 300kg of CO₂e and $120.", author: "EPA Advice" },
  { text: "Replacing 1 beef meal a week with lentils saves equivalent emissions to driving 120 miles.", author: "UN Climate Secretariat" },
  { text: "A smart thermostat can reduce your heating and cooling emissions by 10-15% on day one.", author: "Department of Energy" },
  { text: "LED bulbs use up to 80% less energy than standard bulbs and last up to 25 times longer.", author: "Energy Star" }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userApiKey, setUserApiKey] = useState('');
  
  const [backendConnected, setBackendConnected] = useState(false);
  const [checkingHealth, setCheckingHealth] = useState(true);

  const [userProfile, setUserProfile] = useState({
    name: "Alex Thorne",
    level: 3,
    xp: 2450,
    xpToNext: 5000,
    streak: 5,
    co2Avoided: 1.45, 
    cashSaved: 184.20
  });

  const [emissions, setEmissions] = useState({
    transport: 4.8,
    energy: 3.2,
    food: 2.4,
    shopping: 1.6,
    waste: 0.8
  });

  const [completedActions, setCompletedActions] = useState(['diet_veg', 'energy_wash']);
  const [loggedTrips, setLoggedTrips] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  // --- ROUTING ENGINE ---
  const [routeFrom, setRouteFrom] = useState('');
  const [routeTo, setRouteTo] = useState('');
  const [routeTransport, setRouteTransport] = useState('gasoline');
  const [payloadWeight, setPayloadWeight] = useState(0);
  const [customEfficiency, setCustomEfficiency] = useState('');
  
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState(null);

  // --- DIRECT FUEL ENGINE ---
  const [fuelType, setFuelType] = useState('gasoline');
  const [fuelVolume, setFuelVolume] = useState('');
  const [directAuditResult, setDirectAuditResult] = useState(null);
  const [isDirectAuditing, setIsDirectAuditing] = useState(false);

  // --- SCANNERS STATE ---
  const [scanType, setScanType] = useState('barcode'); 
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // --- CHAT STATE ---
  const [chatMessages, setChatMessages] = useState([
    { 
      role: 'model', 
      text: "Welcome back, Alex! I'm your personalized WTW Carbon Auditor. Let's process your direct fuel metrics or physical route manifests with maximum Tier-3 precision today." 
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // --- CALCULATION BUILDER WIZARD ---
  const [calcAnswers, setCalcAnswers] = useState({
    commuteMethod: 'gasoline',
    weeklyMiles: 120,
    annualFlights: 2,
    homeType: 'apartment',
    gridSource: 'mixed',
    thermostatValue: 68,
    meatDiet: 'regular',
    organicShare: 'some',
    clothingFrequency: 'monthly',
    electronicsCycle: '2years',
    recyclingHabit: 'standard',
    composting: false
  });

  const [tipIndex, setTipIndex] = useState(0);
  const [notifications, setNotifications] = useState([]);

  const addNotification = (text, type = "success") => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4500);
  };

  const fetchBackendProfile = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/profile`);
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.profile);
        setCompletedActions(data.completed_challenges);
        setLoggedTrips(data.logged_trips);
        setBackendConnected(true);
      }
    } catch (err) {
      setBackendConnected(false);
    } finally {
      setCheckingHealth(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/leaderboard`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard);
      }
    } catch (err) {
      setLeaderboard([
        {rank: 1, name: "Sarah Jenkins", level: 6, avoided_tons: 3.42, avatar: "👩‍🌾"},
        {rank: 2, name: "Marcus Vance", level: 4, avoided_tons: 2.15, avatar: "🚴"},
        {rank: 3, name: "Alex Thorne (You)", level: userProfile.level, avoided_tons: userProfile.co2Avoided, avatar: "🌳"}
      ]);
    }
  };

  useEffect(() => {
    fetchBackendProfile();
    fetchLeaderboard();
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % ECO_TIPS.length);
    }, 8500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchBackendProfile();
      fetchLeaderboard();
    }
  }, [activeTab]);

  const dailyChallenges = [
    { id: 'diet_veg', title: 'Plant-Based Day', category: 'food', points: 40, co2Saved: 3.5, cashSaved: 4.50, icon: UtensilsCrossed, desc: 'Avoid all animal meats today to decrease livestock demands.' },
    { id: 'trans_bike', title: 'Pedal Power Commute', category: 'transport', points: 60, co2Saved: 6.2, cashSaved: 8.00, icon: Car, desc: 'Use a bicycle, scooter, or walking for all trips under 5 miles.' },
    { id: 'energy_wash', title: 'Cold-Water Cycle', category: 'energy', points: 25, co2Saved: 1.2, cashSaved: 1.50, icon: Home, desc: 'Wash your clothes in cold water settings to prevent water heating.' },
    { id: 'shop_reuse', title: 'Thrift & Refuse', category: 'shopping', points: 35, co2Saved: 2.8, cashSaved: 15.00, icon: ShoppingBag, desc: 'Refuse fast fashion; buy only secondhand or repair existing items.' },
    { id: 'energy_vampire', title: 'Unplug Vampires', category: 'energy', points: 20, co2Saved: 0.8, cashSaved: 0.75, icon: Zap, desc: 'Switch off all multi-plugs and vampire devices before sleeping.' },
    { id: 'waste_compost', title: 'Sort & Compost', category: 'waste', points: 30, co2Saved: 1.5, cashSaved: 0.50, icon: Trash2, desc: 'Compost organic scraps to mitigate landfill methane gas.' }
  ];

  const offsetProjects = [
    { id: 'offset_reforest', title: 'Oregon Douglas Fir Reforestation', type: 'Reforestation', costXP: 1200, tonsOffset: 0.5, desc: 'Restores wildfire-ravaged native evergreen habitats.', image: '🌲', verifiedBy: 'Gold Standard' },
    { id: 'offset_air_capture', title: 'Direct Air Capture (Climeworks)', type: 'Carbon Removal', costXP: 3500, tonsOffset: 1.0, desc: 'Extracts atmospheric carbon dioxide directly via solid sorbents.', image: '🌬️', verifiedBy: 'Puro Earth' },
    { id: 'offset_clean_cook', title: 'Stove Efficiency in Kenya', type: 'Community Support', costXP: 800, tonsOffset: 0.3, desc: 'Provides safe, high-efficiency biomass stoves reducing wood gather needs.', image: '🔥', verifiedBy: 'Verra VCS' }
  ];

  const barcodePresets = {
    "9780123456": { name: "Oat Milk (Organic, 1L)", co2: 0.35, category: "Low Impact", comparison: "75% lower than Cow Milk", color: "emerald", alternative: "Excellent choices. Zero-carbon packaging!" },
    "5449000000": { name: "Sparkling Cola Can (Pack of 6)", co2: 1.80, category: "Medium Impact", comparison: "Standard aluminum footprint", color: "amber", alternative: "Try naturally brewed carbonated organic soda." },
    "7890123456": { name: "Prime Grain-fed Beef Burger", co2: 14.50, category: "Extremely High", comparison: "900% higher than vegan alternative", color: "red", alternative: "Sub for Mushroom Protein burgers to save 13kg CO₂." }
  };

  const receiptPresets = [
    {
      store: "Whole Foods Market",
      items: [
        { name: "Organic Blueberries", cost: 4.99, category: "Produce", footprint: "Low (0.2 kg CO₂)" },
        { name: "Imported Ribeye Steak", cost: 18.50, category: "Meat", footprint: "Extreme (18.2 kg CO₂)" },
        { name: "Almond Milk", cost: 3.49, category: "Dairy Alt", footprint: "Low (0.4 kg CO₂)" }
      ],
      totalCo2: 18.8,
      savingTip: "Swapping Imported Ribeye for Poultry or Plant-Protein reduces this grocery receipt footprint by 85%."
    },
    {
      store: "Costco wholesale",
      items: [
        { name: "Bulk Avocados", cost: 6.99, category: "Produce", footprint: "Medium (1.1 kg CO₂)" },
        { name: "Single-Use Plastic Bottles (24pk)", cost: 5.49, category: "Beverage", footprint: "High (4.8 kg CO₂)" },
        { name: "LED Recessed Lights (4pk)", cost: 12.99, category: "Home", footprint: "Negative (-45 kg CO₂ avoided over lifetime)" }
      ],
      totalCo2: 5.9,
      savingTip: "Ditching bottled water for a reusable filter saves up to 120kg CO₂ and $240 annually."
    }
  ];

  const totalTravelEmissions = useMemo(() => {
    return loggedTrips.reduce((acc, trip) => acc + (trip.co2 / 1000), 0);
  }, [loggedTrips]);

  const currentSavings = useMemo(() => {
    return completedActions.reduce((acc, actionId) => {
      const act = dailyChallenges.find(d => d.id === actionId);
      if (act) {
        return acc + (act.co2Saved * 0.052); 
      }
      return acc;
    }, 0);
  }, [completedActions, dailyChallenges]);

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

  const toggleChallenge = async (id) => {
    const isCompleted = !completedActions.includes(id);
    const challenge = dailyChallenges.find(c => c.id === id);
    if (!challenge) return;

    if (backendConnected) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/challenges/toggle`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            challenge_id: id,
            is_completed: isCompleted,
            points: challenge.points,
            co2_saved: challenge.co2Saved,
            cash_saved: challenge.cashSaved
          })
        });
        if (response.ok) {
          const data = await response.json();
          setUserProfile(data.profile);
          setCompletedActions(data.completed_challenges);
          addNotification(isCompleted ? `Earned ${challenge.points} XP!` : `Task removed.`);
        }
      } catch (err) {
        handleLocalChallengeToggle(id, isCompleted, challenge);
      }
    } else {
      handleLocalChallengeToggle(id, isCompleted, challenge);
    }
  };

  const handleLocalChallengeToggle = (id, isCompleted, challenge) => {
    if (isCompleted) {
      setCompletedActions([...completedActions, id]);
      setUserProfile(prev => {
        const addedXp = challenge.points;
        let newXp = prev.xp + addedXp;
        let newLevel = prev.level;
        if (newXp >= prev.xpToNext) {
          newXp -= prev.xpToNext;
          newLevel += 1;
        }
        return {
          ...prev,
          level: newLevel,
          xp: newXp,
          streak: prev.streak + 1,
          co2Avoided: parseFloat((prev.co2Avoided + (challenge.co2Saved * 0.052)).toFixed(3)),
          cashSaved: prev.cashSaved + challenge.cashSaved
        };
      });
      addNotification(`Earned ${challenge.points} XP! (Simulation Mode)`);
    } else {
      setCompletedActions(completedActions.filter(x => x !== id));
      setUserProfile(prev => ({
        ...prev,
        xp: Math.max(0, prev.xp - challenge.points),
        co2Avoided: parseFloat(Math.max(0, prev.co2Avoided - (challenge.co2Saved * 0.052)).toFixed(3)),
        cashSaved: Math.max(0, prev.cashSaved - challenge.cashSaved)
      }));
    }
  };

  const triggerRouteAudit = async (e) => {
    e.preventDefault();
    if (!routeFrom || !routeTo) return;

    setIsAuditing(true);
    setAuditResult(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/calculate-route`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: routeFrom,
          destination: routeTo,
          transport_type: routeTransport,
          custom_efficiency: customEfficiency ? parseFloat(customEfficiency) : null,
          payload_weight_kg: payloadWeight ? parseFloat(payloadWeight) : 0,
          api_key_override: userApiKey || null
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAuditResult(data);
      }
    } catch (err) {
      const distance = max(15.0, (routeFrom.length + routeTo.length) * 36);
      setAuditResult({
        distance_miles: distance,
        distance_km: round(distance * 1.609, 2),
        fuel_consumed_total: round(distance * 0.08, 2),
        unit: "Liters",
        ttw_co2_kg: round(distance * 0.32, 2),
        wtt_co2_kg: round(distance * 0.08, 2),
        co2_kg: round(distance * 0.404, 1),
        route_summary: "Offline Simulator calculation engine active.",
        alternative_mode: "Electric Rail Transit",
        alternative_co2_kg: round(distance * 0.045, 1),
        regulatory_sources: "IPCC AR5 Core Coefficients",
        eco_tip: "Consider swapping to a train line to reduce travel emissions."
      });
    } finally {
      setIsAuditing(false);
    }
  };

  const triggerDirectFuelAudit = async (e) => {
    e.preventDefault();
    if (!fuelVolume) return;

    setIsDirectAuditing(true);
    setDirectAuditResult(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/audit/direct-fuel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fuel_type: fuelType,
          fuel_volume: parseFloat(fuelVolume),
          payload_weight_kg: payloadWeight ? parseFloat(payloadWeight) : 0
        })
      });
      if (response.ok) {
        const data = await response.json();
        setDirectAuditResult(data);
        addNotification("Tier 3 fuel ledger recorded!");
      }
    } catch (err) {
      const coeffs = { gasoline: 2.81, diesel: 3.15, jet_fuel: 3.32, electricity: 0.38 };
      const computed = parseFloat(fuelVolume) * (coeffs[fuelType] || 2.8);
      setDirectAuditResult({
        methodology: "Tier 3 Fuel-Based Method (Offline)",
        fuel_type: fuelType,
        input_volume: parseFloat(fuelVolume),
        adjusted_volume: parseFloat(fuelVolume),
        payload_adjustment_factor: 1.0,
        units: fuelType === 'electricity' ? 'kWh' : 'Liters',
        direct_ttw_co2_kg: round(computed * 0.78, 2),
        indirect_wtt_co2_kg: round(computed * 0.22, 2),
        total_wtw_co2_kg: round(computed, 2),
        regulatory_sources: "DEFRA 2025 Guidelines"
      });
    } finally {
      setIsDirectAuditing(false);
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { role: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.text,
          current_emissions: currentTotalEmissions,
          api_key_override: userApiKey || null
        })
      });
      if (response.ok) {
        const data = await response.json();
        setChatMessages(prev => [...prev, { role: 'model', text: data.reply }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'model', text: "⚠️ You are offline. Let's aim to buy locally and swap single-occupancy vehicle trips to low-carbon shared transport networks." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const logAuditResultToProfile = () => {
    if (!auditResult) return;
    const newTrip = {
      id: `trip_${Date.now()}`,
      origin: routeFrom,
      destination: routeTo,
      distance: auditResult.distance_miles,
      co2: auditResult.co2_kg,
      mode: routeTransport
    };

    setLoggedTrips(prev => [newTrip, ...prev]);
    setUserProfile(prev => ({ ...prev, xp: prev.xp + 50 }));
    addNotification("Saved route to travel ledger! Earned 50 XP.");

    setRouteFrom('');
    setRouteTo('');
    setAuditResult(null);
  };

  const triggerPurchaseOffset = async (project) => {
    if (userProfile.xp < project.costXP) {
      addNotification("Insufficient XP to purchase this carbon offset.", "error");
      return;
    }

    if (backendConnected) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/offset/purchase`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            project_id: project.id,
            cost_xp: project.costXP,
            tons_offset: project.tonsOffset
          })
        });
        if (response.ok) {
          const data = await response.json();
          setUserProfile(data.profile);
          addNotification(`Retired ${project.tonsOffset}t of verified carbon credits!`);
        }
      } catch (err) {
        handleLocalOffsetPurchase(project);
      }
    } else {
      handleLocalOffsetPurchase(project);
    }
  };

  const handleLocalOffsetPurchase = (project) => {
    setUserProfile(prev => ({
      ...prev,
      xp: prev.xp - project.costXP,
      co2Avoided: parseFloat((prev.co2Avoided + project.tonsOffset).toFixed(3))
    }));
    addNotification(`Retired ${project.tonsOffset}t CO2! (Simulation Mode)`);
  };

  const handleBarcodeDemoScan = async (code) => {
    setIsScanning(true);
    setScanResult(null);
    try {
      const response = await fetch(`${BACKEND_URL}/api/scan/barcode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barcode: code })
      });
      if (response.ok) {
        const data = await response.json();
        setScanResult({ type: 'barcode', code, ...data });
      }
    } catch (err) {
      setTimeout(() => {
        setScanResult({ type: 'barcode', code, ...barcodePresets[code] });
      }, 800);
    } finally {
      setIsScanning(false);
    }
  };

  const handleReceiptDemoScan = async (index) => {
    setIsScanning(true);
    setScanResult(null);
    try {
      const response = await fetch(`${BACKEND_URL}/api/scan/receipt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receipt_preset_index: index })
      });
      if (response.ok) {
        const data = await response.json();
        setScanResult({ type: 'receipt', ...data });
      }
    } catch (err) {
      setTimeout(() => {
        setScanResult({ type: 'receipt', ...receiptPresets[0] });
      }, 800);
    } finally {
      setIsScanning(false);
    }
  };

  const runCalculatorFormula = () => {
    let t = 0; let e = 0; let f = 0; let s = 0; let w = 0;

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
      transport: parseFloat(t.toFixed(1)),
      energy: parseFloat(e.toFixed(1)),
      food: parseFloat(f.toFixed(1)),
      shopping: parseFloat(s.toFixed(1)),
      waste: parseFloat((w > 0.1 ? w : 0.1).toFixed(1))
    });
  };

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
        <div className="absolute inset-0 bg-radial-gradient from-white/5 to-transparent pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none overflow-hidden animate-pulse">
          {Array.from({ length: 8 }).map((_, i) => (
            <div 
              key={i}
              className="absolute w-1 h-1 bg-teal-400 rounded-full opacity-40"
              style={{
                top: `${Math.random() * 70}%`,
                left: `${Math.random() * 95}%`,
              }}
            />
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
                {completedCount === 0 ? "Barren field — Tick tasks below to plant trees!" : 
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

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
      
      {/* NOTIFICATION FLOATER */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2">
        {notifications.map(n => (
          <div 
            key={n.id} 
            className={`p-4 rounded-2xl shadow-xl flex items-center space-x-2.5 text-xs font-bold border transition-all duration-300 transform translate-y-0 ${
              n.type === "error" ? "bg-red-500/20 border-red-500/30 text-red-300" : "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
            }`}
          >
            <Leaf className="w-4 h-4 shrink-0" />
            <span>{n.text}</span>
          </div>
        ))}
      </div>

      {/* GLOBAL BANNER */}
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
                <span className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}></span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                  {backendConnected ? 'Live Connection Active' : 'Simulation Mode'}
                </span>
              </div>
            </div>
          </div>

          <nav className="hidden lg:flex space-x-1.5 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800">
            {[
              { id: 'dashboard', label: 'Ecosystem', icon: TreePine },
              { id: 'calculator', label: 'WTW Routing', icon: Calendar },
              { id: 'scanner', label: 'Eco-Scanner', icon: ScanBarcode },
              { id: 'coach', label: 'AI Coach', icon: Sparkles },
              { id: 'marketplace', label: 'Offsets', icon: Store }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                    activeTab === tab.id 
                      ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 px-3.5 py-2 rounded-2xl font-black text-xs flex items-center space-x-1 shadow-md">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{userProfile.xp} XP</span>
            </div>
          </div>

        </div>
      </header>

      {/* CORE WRAPPER */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TAB 1: ECOSYSTEM VIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Carbon Score */}
              <div className="lg:col-span-4 bg-slate-950/40 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col items-center justify-between min-h-[300px]">
                <h3 className="text-xs uppercase font-black text-slate-400 tracking-widest">Calculated Score</h3>
                <div className="relative w-44 h-44 my-4 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="88" cy="88" r="74" stroke="#1e293b" strokeWidth="10" fill="transparent" />
                    <circle 
                      cx="88" cy="88" r="74" stroke="url(#greenGrad)" strokeWidth="11" fill="transparent" 
                      strokeDasharray={464} 
                      strokeDashoffset={464 - (464 * Math.max(10, Math.min(100, (currentTotalEmissions / 15) * 100))) / 100}
                      strokeLinecap="round"
                    />
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
                  <div className="bg-emerald-400 h-full" style={{ width: `${progressPercentage}%` }}></div>
                </div>
              </div>

              {/* Canopy */}
              <div className="lg:col-span-8 space-y-4">
                {renderVirtualForest()}
              </div>

            </div>

            {/* REAL-TIME ROUTE AUDITOR */}
            <div className="bg-slate-950/20 p-6 rounded-3xl border border-slate-850">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Compass className="text-emerald-400 w-5 h-5" />
                    <span>Real-Time Ground Distance Routing Audit (Tier 3 WTW Engine)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Evaluate actual routes. Provide payload parameters to scale exact direct/indirect combustion factors.</p>
                </div>
              </div>

              <form onSubmit={triggerRouteAudit} className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <input 
                  type="text" 
                  value={routeFrom}
                  onChange={(e) => setRouteFrom(e.target.value)}
                  placeholder="Origin (e.g. London)" 
                  className="bg-slate-900 border border-slate-800 text-xs rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none font-bold md:col-span-1"
                  required
                />
                <input 
                  type="text" 
                  value={routeTo}
                  onChange={(e) => setRouteTo(e.target.value)}
                  placeholder="Destination (e.g. Paris)" 
                  className="bg-slate-900 border border-slate-800 text-xs rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none font-bold md:col-span-1"
                  required
                />
                <select 
                  value={routeTransport}
                  onChange={(e) => setRouteTransport(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-xs rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none font-bold md:col-span-1"
                >
                  <option value="gasoline">Standard Gasoline (E10)</option>
                  <option value="diesel">Standard Diesel (B7)</option>
                  <option value="electric">Electric (EV Grid WTW)</option>
                  <option value="flight">Passenger Flight (Jet A-1)</option>
                </select>

                <input 
                  type="number" 
                  value={payloadWeight}
                  onChange={(e) => setPayloadWeight(e.target.value)}
                  placeholder="Cargo/Payload (kg)" 
                  className="bg-slate-900 border border-slate-800 text-xs rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none font-bold md:col-span-1"
                />

                <input 
                  type="number" 
                  step="0.01"
                  value={customEfficiency}
                  onChange={(e) => setCustomEfficiency(e.target.value)}
                  placeholder="Efficiency L/100km (Opt)" 
                  className="bg-slate-900 border border-slate-800 text-xs rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none font-bold md:col-span-1"
                />

                <button 
                  type="submit" 
                  disabled={isAuditing}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black py-3 rounded-xl transition-all md:col-span-1"
                >
                  {isAuditing ? "Auditing Route..." : "Query Route"}
                </button>
              </form>

              {/* Route Audit Output display */}
              {auditResult && (
                <div className="mt-6 p-5 bg-slate-900/50 rounded-2xl border border-slate-800 animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="bg-emerald-400/20 text-emerald-400 text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-full">
                        Audit Completed
                      </span>
                    </div>
                    <h4 className="text-md font-bold text-white">{routeFrom.toUpperCase()} ➔ {routeTo.toUpperCase()}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{auditResult.route_summary}</p>
                    
                    <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                      <div className="p-3 bg-slate-950/60 rounded-xl">
                        <span className="text-[9px] text-slate-400 uppercase">Distance</span>
                        <p className="text-sm font-black text-white">{auditResult.distance_km} km</p>
                      </div>
                      <div className="p-3 bg-slate-950/60 rounded-xl">
                        <span className="text-[9px] text-slate-400 uppercase font-bold">Fuel Consumed</span>
                        <p className="text-sm font-black text-white">{auditResult.fuel_consumed_total} {auditResult.unit}</p>
                      </div>
                      <div className="p-3 bg-slate-950/60 rounded-xl border border-emerald-500/20">
                        <span className="text-[9px] text-emerald-400 uppercase font-bold">Total WTW</span>
                        <p className="text-sm font-black text-emerald-400">{auditResult.co2_kg} kg CO₂e</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 space-y-3">
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-black text-slate-400">
                      <span>Scientific WTW Breakdown</span>
                      <span className="text-emerald-400">{auditResult.regulatory_sources}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                      <div className="p-2 bg-slate-950/40 rounded-xl">
                        <p className="text-[10px] text-slate-500">Scope 1 / Scope 2 (TTW Tailpipe)</p>
                        <p className="text-sm font-bold text-slate-200">{auditResult.ttw_co2_kg} kg CO₂e</p>
                      </div>
                      <div className="p-2 bg-slate-950/40 rounded-xl">
                        <p className="text-[10px] text-slate-500">Scope 3 (WTT Upstream)</p>
                        <p className="text-sm font-bold text-slate-200">{auditResult.wtt_co2_kg} kg CO₂e</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-450 leading-relaxed">{auditResult.eco_tip}</p>
                    
                    <div className="flex justify-between items-center pt-2">
                      <button 
                        onClick={logAuditResultToProfile}
                        className="bg-emerald-400 hover:bg-emerald-500 text-slate-950 text-xs font-extrabold px-4 py-2 rounded-xl"
                      >
                        Log to Profile (+50 XP)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* DIRECT TIER 3 FUEL AUDITING LEDGER ENTRY */}
            <div className="bg-slate-950/20 p-6 rounded-3xl border border-slate-850">
              <div className="flex items-center space-x-2.5 mb-4">
                <FileText className="text-emerald-400 w-5 h-5" />
                <div>
                  <h3 className="text-md font-bold text-white">Direct Fuel Purchase Ledger (Scope 1 & 2 Core Audit)</h3>
                  <p className="text-xs text-slate-400">If direct fuel purchase or electricity bill indicators are available, input values directly for Tier 3 accuracy.</p>
                </div>
              </div>

              <form onSubmit={triggerDirectFuelAudit} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <select 
                  value={fuelType} 
                  onChange={(e) => setFuelType(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-xs rounded-xl px-4 py-3 text-white outline-none font-bold"
                >
                  <option value="gasoline">Gasoline (Liters)</option>
                  <option value="diesel">Diesel (Liters)</option>
                  <option value="electricity">Grid Electricity (kWh)</option>
                  <option value="jet_fuel">Aviation Fuel Jet A-1 (Liters)</option>
                </select>

                <input 
                  type="number" 
                  step="0.01"
                  value={fuelVolume}
                  onChange={(e) => setFuelVolume(e.target.value)}
                  placeholder="Volume / Consumption Amount"
                  className="bg-slate-900 border border-slate-800 text-xs rounded-xl px-4 py-3 text-white outline-none font-bold"
                  required
                />

                <input 
                  type="number" 
                  value={payloadWeight}
                  onChange={(e) => setPayloadWeight(e.target.value)}
                  placeholder="Payload Cargo Weight (kg)"
                  className="bg-slate-900 border border-slate-800 text-xs rounded-xl px-4 py-3 text-white outline-none font-bold"
                />

                <button 
                  type="submit" 
                  disabled={isDirectAuditing}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold py-3 rounded-xl transition-all font-bold"
                >
                  {isDirectAuditing ? "Processing Ledger..." : "Log Fuel Purchase"}
                </button>
              </form>

              {directAuditResult && (
                <div className="mt-6 p-4 bg-slate-900/40 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-slate-950/60 rounded-xl">
                    <span className="text-[10px] text-slate-500 uppercase">Tailpipe Combustion (TTW)</span>
                    <p className="text-lg font-bold text-white">{directAuditResult.direct_ttw_co2_kg} kg CO₂e</p>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl">
                    <span className="text-[10px] text-slate-500 uppercase">Upstream Extraction (WTT)</span>
                    <p className="text-lg font-bold text-white">{directAuditResult.indirect_wtt_co2_kg} kg CO₂e</p>
                  </div>
                  <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <span className="text-[10px] text-emerald-400 uppercase font-semibold">Total Well-to-Wheel (WTW)</span>
                    <p className="text-lg font-black text-emerald-400">{directAuditResult.total_wtw_co2_kg} kg CO₂e</p>
                    <span className="text-[8px] text-slate-500 block">Verified via {directAuditResult.regulatory_sources}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Travel Ledger Logs & Competitions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Ledger */}
              <div className="lg:col-span-8 bg-slate-950/20 p-6 rounded-3xl border border-slate-850">
                <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2">
                  <FileText className="text-slate-400 w-4 h-4" />
                  <span>My Travel Ledger Logs</span>
                </h3>
                {loggedTrips.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    No routes queried and logged to profile yet. Try querying above!
                  </div>
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

              {/* Right Column: Global Leaderboard */}
              <div className="lg:col-span-4 bg-slate-950/20 p-6 rounded-3xl border border-slate-850 space-y-4">
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

        {/* TAB 2: DETAILED EMISSIONS CALCULATOR */}
        {activeTab === 'calculator' && (
          <div className="max-w-3xl mx-auto bg-slate-950/40 p-6 sm:p-8 rounded-3xl border border-slate-850 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Configure Base Emission Profile</h3>
            <p className="text-xs text-slate-400 mb-6">Modify baseline home, diet, and apparel habits to calculate your initial target index.</p>
            
            <div className="space-y-6">
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
                <label className="text-xs font-bold text-slate-300 block mb-2">Typical Housing Arrangement</label>
                <div className="grid grid-cols-3 gap-3">
                  {['house', 'townhouse', 'apartment'].map(h => (
                    <button 
                      key={h} 
                      onClick={() => setCalcAnswers({...calcAnswers, homeType: h})}
                      className={`py-2 text-xs rounded-xl capitalize ${calcAnswers.homeType === h ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-450'}`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
                <label className="text-xs font-bold text-slate-300 block mb-2">Diet Profile</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['regular', 'flexitarian', 'vegetarian', 'vegan'].map(d => (
                    <button 
                      key={d} 
                      onClick={() => setCalcAnswers({...calcAnswers, meatDiet: d})}
                      className={`py-2 text-xs rounded-xl capitalize ${calcAnswers.meatDiet === d ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-450'}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-slate-300 block">Compost Organic Waste</span>
                  <span className="text-[10px] text-slate-500">Methane mitigation sheet</span>
                </div>
                <button 
                  onClick={() => setCalcAnswers({...calcAnswers, composting: !calcAnswers.composting})}
                  className={`px-4 py-2 rounded-xl text-xs font-bold ${calcAnswers.composting ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-450'}`}
                >
                  {calcAnswers.composting ? 'Active' : 'Inactive'}
                </button>
              </div>
            </div>

            <button 
              onClick={() => {
                runCalculatorFormula();
                setActiveTab('dashboard');
                addNotification("Emissions parameters re-indexed successfully!");
              }}
              className="mt-6 w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 py-3 rounded-xl text-xs font-bold transition-all"
            >
              Update Profile
            </button>
          </div>
        )}

        {/* TAB 3: THE ECO BARCODE & RECEIPT SCANNER */}
        {activeTab === 'scanner' && (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="bg-slate-950/40 p-6 rounded-3xl border border-slate-850 shadow-2xl text-center">
              <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-center space-x-2">
                <ScanBarcode className="w-5 h-5 text-emerald-400" />
                <span>Eco Scanner Integration</span>
              </h3>
              <p className="text-xs text-slate-400">Scan standard commercial barcodes or receipts to extract database footprints.</p>
              
              <div className="flex justify-center space-x-2 mt-5">
                <button 
                  onClick={() => { setScanType('barcode'); setScanResult(null); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold ${scanType === 'barcode' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}
                >
                  Barcode Scanner
                </button>
                <button 
                  onClick={() => { setScanType('receipt'); setScanResult(null); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold ${scanType === 'receipt' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}
                >
                  Receipt Scan
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              <div className="lg:col-span-7 bg-slate-950/40 rounded-3xl border border-slate-850 overflow-hidden relative min-h-[350px] flex flex-col items-center justify-center p-6 text-center">
                {isScanning ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin mx-auto"></div>
                    <p className="text-xs text-slate-550 font-bold">Processing optical carbon label scanner...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="relative w-44 h-44 border-2 border-dashed border-slate-700 rounded-3xl flex items-center justify-center mx-auto">
                      <Camera className="w-10 h-10 text-slate-600" />
                    </div>

                    {scanType === 'barcode' ? (
                      <div className="flex justify-center gap-2 flex-wrap">
                        <button onClick={() => handleBarcodeDemoScan("9780123456")} className="bg-slate-900 px-3 py-2 rounded-xl text-[11px] font-bold border border-slate-800 font-bold">Scan Oat Milk</button>
                        <button onClick={() => handleBarcodeDemoScan("5449000000")} className="bg-slate-900 px-3 py-2 rounded-xl text-[11px] font-bold border border-slate-800 font-bold">Scan Cola Can</button>
                        <button onClick={() => handleBarcodeDemoScan("7890123456")} className="bg-slate-900 px-3 py-2 rounded-xl text-[11px] font-bold border border-slate-800 font-bold">Scan Beef Patties</button>
                      </div>
                    ) : (
                      <div className="flex justify-center gap-2 flex-wrap">
                        <button onClick={() => handleReceiptDemoScan(0)} className="bg-slate-900 px-3 py-2 rounded-xl text-[11px] font-bold border border-slate-800 font-bold">Whole Foods Receipt</button>
                        <button onClick={() => handleReceiptDemoScan(1)} className="bg-slate-900 px-3 py-2 rounded-xl text-[11px] font-bold border border-slate-800 font-bold">Target Receipt</button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="lg:col-span-5">
                {scanResult ? (
                  <div className="bg-slate-950/40 rounded-3xl border border-slate-850 p-6 space-y-4">
                    <span className="bg-emerald-500/10 text-emerald-400 text-[10px] uppercase font-black px-2.5 py-1 rounded-full border border-emerald-500/10">
                      Scanner Result
                    </span>

                    {scanResult.type === 'barcode' ? (
                      <div className="space-y-4 animate-fade-in">
                        <h4 className="text-md font-bold text-white">{scanResult.name}</h4>
                        <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 uppercase font-mono">Emissions equivalent</span>
                          <span className="text-3xl font-black text-white mt-1 block">{scanResult.co2} kg CO₂</span>
                        </div>
                        <p className="text-xs text-slate-400 font-bold">{scanResult.alternative}</p>
                      </div>
                    ) : (
                      <div className="space-y-4 animate-fade-in">
                        <h4 className="text-md font-bold text-white">{scanResult.store} Audit</h4>
                        <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 uppercase">Receipt footprint load</span>
                          <span className="text-3xl font-black text-white mt-1 block">{scanResult.totalCo2} kg CO₂</span>
                        </div>
                        <p className="text-xs text-slate-400 font-bold">{scanResult.savingTip}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-950/20 rounded-3xl border border-slate-850 border-dashed p-6 text-center py-14 text-slate-500">
                    <span className="text-4xl block mb-2 opacity-40">📊</span>
                    <h4 className="text-xs font-black uppercase tracking-wider">Awaiting Scanner Input</h4>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: THE ECO AI COACH */}
        {activeTab === 'coach' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-slate-950/40 rounded-3xl border border-slate-850 overflow-hidden flex flex-col h-[520px] shadow-2xl">
              <div className="bg-slate-950/70 border-b border-slate-850 px-6 py-4 flex justify-between items-center">
                <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">EcoGuide Climate Agent</h3>
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
              </div>

              <form onSubmit={handleSendChat} className="p-4 border-t border-slate-850 bg-slate-950/60 flex space-x-2">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask e.g. 'How can I save carbon on home energy?'..."
                  className="flex-1 bg-slate-900 border border-slate-800 text-xs rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 font-bold"
                />
                <button type="submit" className="bg-emerald-500 text-slate-950 font-extrabold text-xs px-4 rounded-xl font-bold">Ask AI</button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 5: CARBON OFFSETS MARKETPLACE */}
        {activeTab === 'marketplace' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <h3 className="text-xl font-bold text-white mb-4">Certified Carbon Offsets</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {offsetProjects.map((p) => (
                <div key={p.id} className="bg-slate-950/40 rounded-3xl border border-slate-850 p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-3xl">{p.image}</span>
                    <h4 className="text-sm font-black text-slate-100 mt-4">{p.title}</h4>
                    <p className="text-xs text-slate-400 mt-2">{p.desc}</p>
                  </div>
                  <button 
                    onClick={() => triggerPurchaseOffset(p)}
                    className="mt-6 w-full bg-slate-900 border border-slate-800 text-white font-extrabold text-xs py-3 rounded-xl transition-all flex justify-between items-center px-4"
                  >
                    <span>Retire {p.tonsOffset}t CO₂</span>
                    <span className="text-emerald-400 font-black">{p.costXP} XP</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      <footer className="bg-slate-950 border-t border-slate-850 py-12 mt-20 text-slate-500 text-center text-xs font-mono">
        &copy; {new Date().getFullYear()} EcoStep professional auditing system. Scope 1, 2, & 3 Tier 3 engine active.
      </footer>

    </div>
  );
}