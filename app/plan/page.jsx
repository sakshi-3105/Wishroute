"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Calendar, DollarSign, Users, MapPin, Check, Plus, Trash2, 
  Download, Share2, Heart, ArrowLeft, Sun, CloudRain, ListTodo, 
  PieChart, Shield, Navigation, Plane, Compass, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import Chatbot from "@/components/chatbot";
import { motion, AnimatePresence } from "framer-motion";

// Markdown helper parser
const parseBoldAndItalic = (text) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={idx} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
    }
    const italicParts = part.split(/(\*.*?\*)/g);
    return italicParts.map((ipart, iidx) => {
      if (ipart.startsWith("*") && ipart.endsWith("*")) {
        return <em key={iidx} className="italic text-gray-800">{ipart.slice(1, -1)}</em>;
      }
      return ipart;
    });
  });
};

const renderMarkdownLine = (line, index) => {
  let trimmed = line.trim();
  if (!trimmed) return <div key={index} className="h-2"></div>;
  
  if (trimmed.startsWith("###")) {
    return <h4 key={index} className="text-base font-semibold text-gray-800 mt-4 mb-2 flex items-center gap-1.5 border-b border-gray-100 pb-1">{trimmed.replace(/^###\s*/, "")}</h4>;
  }
  if (trimmed.startsWith("##")) {
    return <h3 key={index} className="text-lg font-bold text-[#122B41] mt-5 mb-2.5">{trimmed.replace(/^##\s*/, "")}</h3>;
  }
  if (trimmed.startsWith("#")) {
    return <h2 key={index} className="text-xl font-extrabold text-[#122B41] mt-6 mb-3">{trimmed.replace(/^#\s*/, "")}</h2>;
  }
  
  if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
    const listContent = trimmed.replace(/^[\-\*]\s*/, "");
    return (
      <li key={index} className="list-disc ml-5 mb-1.5 text-sm text-gray-700 leading-relaxed">
        {parseBoldAndItalic(listContent)}
      </li>
    );
  }
  
  if (/^\d+\.\s+/.test(trimmed)) {
    const listContent = trimmed.replace(/^\d+\.\s+/, "");
    return (
      <li key={index} className="list-decimal ml-5 mb-1.5 text-sm text-gray-700 leading-relaxed">
        {parseBoldAndItalic(listContent)}
      </li>
    );
  }
  
  return <p key={index} className="text-sm text-gray-600 mb-2 leading-relaxed">{parseBoldAndItalic(trimmed)}</p>;
};

// Help helper to parse day text
function parseItinerary(text) {
  if (!text) return { intro: "", days: [] };
  
  const parts = text.split(/(?:^|\n)(?:#{1,4}\s+)?Day\s+(\d+)/gi);
  const days = [];
  let intro = parts[0] || "";
  
  for (let i = 1; i < parts.length; i += 2) {
    const dayNum = parts[i];
    let content = parts[i + 1] || "";
    content = content.replace(/^[:\-\s]+/, "").trim();
    
    const lines = content.split('\n');
    let title = `Day ${dayNum}`;
    let body = content;
    
    if (lines.length > 0 && lines[0].length < 100 && !lines[0].includes('###')) {
      title = lines[0].replace(/^[:\-\s*#]+|[*#]+$/g, '').trim() || `Day ${dayNum}`;
      body = lines.slice(1).join('\n').trim();
    }
    
    days.push({
      day: dayNum,
      title: title,
      content: body || content
    });
  }
  
  if (days.length === 0) {
    days.push({
      day: "1",
      title: "Itinerary Details",
      content: text
    });
  }
  
  return { intro, days };
}

// Custom mock weather
const getWeather = (destination) => {
  const hash = destination.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const temps = [24, 28, 16, 7, 31, 26, 19, 13];
  const conditions = ["Sunny", "Partly Cloudy", "Mild & Clear", "Cool & Crisp", "Tropical & Warm", "Breezy", "Pleasant & Sunny", "Overcast"];
  const rainChance = [5, 15, 0, 10, 40, 20, 5, 30];
  const index = hash % temps.length;
  
  return {
    temp: temps[index],
    condition: conditions[index],
    rainChance: rainChance[index],
    humidity: 45 + (hash % 35),
    wind: 6 + (hash % 12)
  };
};

// Custom packing list generator
const getPackingList = (preferencesStr, destination) => {
  const preferences = preferencesStr ? preferencesStr.split(",") : [];
  const baseItems = [
    { id: "pass", text: "Passport & Identity Cards", category: "Essentials", checked: false },
    { id: "docs", text: "Hotel vouchers & Ticket copies", category: "Essentials", checked: false },
    { id: "cash", text: "Local currency / Debit card", category: "Essentials", checked: false },
    { id: "charger", text: "Phone charger & Powerbank", category: "Essentials", checked: false },
    { id: "meds", text: "Personal medicines & Band-aids", category: "Essentials", checked: false }
  ];
  
  const prefItems = [];
  const destLower = destination.toLowerCase();
  
  if (preferences.includes("adventure")) {
    prefItems.push(
      { id: "adv1", text: "Trekking shoes & Hiking socks", category: "Adventure", checked: false },
      { id: "adv2", text: "Waterproof backpack cover", category: "Adventure", checked: false },
      { id: "adv3", text: "Energy bars & Rehydration packets", category: "Adventure", checked: false }
    );
  }
  if (preferences.includes("relaxation") || destLower.includes("beach") || destLower.includes("island") || destLower.includes("maldives") || destLower.includes("goa") || destLower.includes("bali")) {
    prefItems.push(
      { id: "rel1", text: "Sunscreen lotion (SPF 50+)", category: "Leisure", checked: false },
      { id: "rel2", text: "Sunglasses & Wide hat", category: "Leisure", checked: false },
      { id: "rel3", text: "Swimsuits & Sand slippers", category: "Leisure", checked: false }
    );
  }
  if (preferences.includes("culture")) {
    prefItems.push(
      { id: "cul1", text: "Modest clothes (shoulders & knees covered)", category: "Culture", checked: false },
      { id: "cul2", text: "Easy slip-off walking shoes", category: "Culture", checked: false }
    );
  }
  if (preferences.includes("food")) {
    prefItems.push(
      { id: "fod1", text: "Hand sanitizer & Wet wipes", category: "Foodie", checked: false },
      { id: "fod2", text: "Digestive tablets & Antacids", category: "Foodie", checked: false }
    );
  }
  if (preferences.includes("shopping")) {
    prefItems.push(
      { id: "shp1", text: "Foldable extra luggage bag", category: "Shopping", checked: false },
      { id: "shp2", text: "Cloth/reusable tote shopping bags", category: "Shopping", checked: false }
    );
  }
  
  return [...baseItems, ...prefItems];
};

// Budget category generator
const getBudgetBreakdown = (totalBudget) => {
  return [
    { category: "Hotels & Stay", percentage: 40, amount: Math.round(totalBudget * 0.40), color: "bg-sky-500", rawColor: "#38bdf8" },
    { category: "Food & Dining", percentage: 25, amount: Math.round(totalBudget * 0.25), color: "bg-amber-500", rawColor: "#f59e0b" },
    { category: "Activities & Entrance Fees", percentage: 20, amount: Math.round(totalBudget * 0.20), color: "bg-emerald-500", rawColor: "#10b981" },
    { category: "Local Transport", percentage: 15, amount: Math.round(totalBudget * 0.15), color: "bg-indigo-500", rawColor: "#6366f1" }
  ];
};

const LOADING_MESSAGES = [
  "Mapping the most scenic routes...",
  "Consulting local guides & reviews...",
  "Fitting activities into your budget...",
  "Sourcing the best food recommendations...",
  "Packing your virtual suitcases...",
  "Polishing your custom adventure guide...",
  "Almost there! Securing local travel tips..."
];

function PlanContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const destination = searchParams.get("destination") || "";
  const duration = searchParams.get("duration") || "5";
  const budget = searchParams.get("budget") || "30000";
  const guests = searchParams.get("guests") || "1";
  const startDate = searchParams.get("startDate") || "";
  const preferencesStr = searchParams.get("preferences") || "";

  const [loading, setLoading] = useState(true);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [itineraryText, setItineraryText] = useState("");
  const [selectedDayTab, setSelectedDayTab] = useState(0);
  const [saved, setSaved] = useState(false);
  const [activeTabSection, setActiveTabSection] = useState("itinerary"); // "itinerary", "packing", "budget"

  // Packing list state
  const [packingList, setPackingList] = useState([]);
  const [newItemText, setNewItemText] = useState("");

  // Weather memoized
  const weather = useMemo(() => getWeather(destination), [destination]);

  // Budget memoized
  const budgetBreakdown = useMemo(() => getBudgetBreakdown(Number(budget)), [budget]);

  // Calculate formatted dates
  const datesFormatted = useMemo(() => {
    if (!startDate) return "";
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + parseInt(duration) - 1);
    
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  }, [startDate, duration]);

  // Rotate loading messages
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [loading]);

  // Fetch itinerary
  useEffect(() => {
    if (!destination) {
      router.push("/");
      return;
    }

    // Pre-seed chatbot destination in sessionStorage
    sessionStorage.setItem("activeDestination", destination);

    const generateTrip = async () => {
      setLoading(true);
      try {
        const start = new Date(startDate || Date.now());
        const end = new Date(start);
        end.setDate(end.getDate() + parseInt(duration) - 1);
        const endStr = end.toISOString().split("T")[0];

        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            destination,
            budget: Number(budget),
            startDate: startDate || start.toISOString().split("T")[0],
            endDate: endStr,
            preferences: preferencesStr ? preferencesStr.split(",") : []
          })
        });
        
        const data = await response.json();
        if (data.success) {
          setItineraryText(data.itinerary);
          setPackingList(getPackingList(preferencesStr, destination));
        } else {
          toast.error("Generation failed. Please try again.");
          setItineraryText("### Generation failed\nWe could not contact the AI service. Please check your network connection or API keys.");
        }
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong while generating itinerary.");
        setItineraryText("### Generation Error\nAn unexpected error occurred during trip planning.");
      } finally {
        setLoading(false);
      }
    };

    generateTrip();
  }, [destination, duration, budget, guests, startDate, preferencesStr, router]);

  // Check if already saved
  useEffect(() => {
    if (!destination) return;
    const savedTrips = JSON.parse(localStorage.getItem("wishroute_trips") || "[]");
    const isSaved = savedTrips.some(
      (trip) => trip.destination.toLowerCase() === destination.toLowerCase() && trip.startDate === startDate
    );
    setSaved(isSaved);
  }, [destination, startDate]);

  // Parse structured itinerary
  const { intro, days } = useMemo(() => parseItinerary(itineraryText), [itineraryText]);

  // Handle save trip
  const handleSaveTrip = () => {
    const savedTrips = JSON.parse(localStorage.getItem("wishroute_trips") || "[]");
    
    if (saved) {
      // Remove trip
      const filtered = savedTrips.filter(
        (trip) => !(trip.destination.toLowerCase() === destination.toLowerCase() && trip.startDate === startDate)
      );
      localStorage.setItem("wishroute_trips", JSON.stringify(filtered));
      setSaved(false);
      toast.success("Itinerary removed from saved trips.");
    } else {
      // Save trip
      const newTrip = {
        id: `${destination}-${startDate || Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        destination,
        duration,
        budget,
        guests,
        startDate,
        preferences: preferencesStr,
        itineraryText,
        savedAt: new Date().toISOString()
      };
      savedTrips.push(newTrip);
      localStorage.setItem("wishroute_trips", JSON.stringify(savedTrips));
      setSaved(true);
      toast.success("Itinerary saved successfully! Check it in Saved Trips.");
    }
  };

  // Handle share
  const handleShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl)
      .then(() => toast.success("Share link copied to clipboard!"))
      .catch(() => toast.error("Could not copy link."));
  };

  // Toggle checklist item
  const toggleChecklistItem = (id) => {
    setPackingList(prev => 
      prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item)
    );
  };

  // Add custom checklist item
  const addChecklistItem = (e) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    
    const newItem = {
      id: `custom-${Date.now()}`,
      text: newItemText.trim(),
      category: "Personal",
      checked: false
    };
    
    setPackingList(prev => [...prev, newItem]);
    setNewItemText("");
    toast.success("Item added to checklist.");
  };

  // Delete checklist item
  const deleteChecklistItem = (id) => {
    setPackingList(prev => prev.filter(item => item.id !== id));
  };

  // Print action
  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-gradient-to-br from-[#122B41]/5 via-white to-orange-500/5 px-6">
        <div className="relative flex flex-col items-center justify-center p-8 bg-white/70 backdrop-blur-md border border-gray-100 rounded-3xl shadow-2xl max-w-md w-full text-center">
          <div className="relative mb-6">
            {/* Spinning Compass Outer ring */}
            <div className="w-20 h-20 rounded-full border-4 border-orange-100 border-t-orange-500 animate-spin"></div>
            {/* Inner Compass Icon */}
            <Compass className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-[#122B41] animate-pulse" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2 font-playfair">Crafting Your WishRoute</h3>
          <p className="text-sm text-gray-500 h-10 transition-all duration-300 font-medium">
            {LOADING_MESSAGES[loadingMsgIdx]}
          </p>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-4">
            <motion.div 
              className="bg-orange-500 h-full rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 25, ease: "linear" }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 pb-16 text-gray-800">
      
      {/* Background Banner Info */}
      <div className="bg-gradient-to-r from-[#122B41] via-[#1a3d5c] to-[#122B41] text-white py-10 px-4 sm:px-6 md:px-8 border-b border-white/10 relative overflow-hidden print:bg-white print:text-black print:border-b-2 print:border-gray-300">
        
        {/* Background Decorative Circles */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full filter blur-2xl transform translate-x-20 -translate-y-20 pointer-events-none print:hidden"></div>
        <div className="absolute -bottom-10 left-10 w-60 h-60 bg-orange-500/5 rounded-full filter blur-xl pointer-events-none print:hidden"></div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          
          <div className="space-y-3">
            <button 
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 font-semibold uppercase tracking-wider transition-colors print:hidden"
            >
              <ArrowLeft size={14} /> Back to Search
            </button>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-playfair tracking-tight">
              Trip to {destination}
            </h2>
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-gray-300 print:text-gray-700">
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold print:border print:border-gray-200">
                <Calendar size={13} className="text-orange-400" />
                {datesFormatted || `${duration} Days`}
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold print:border print:border-gray-200">
                <DollarSign size={13} className="text-orange-400" />
                ₹ {Number(budget).toLocaleString()} Budget
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold print:border print:border-gray-200">
                <Users size={13} className="text-orange-400" />
                {guests} {Number(guests) === 1 ? "Guest" : "Guests"}
              </span>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="flex flex-wrap items-center gap-3 print:hidden">
            <button 
              onClick={handleSaveTrip}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold shadow-md transition-all duration-300 cursor-pointer ${
                saved 
                  ? "bg-red-500 hover:bg-red-600 text-white" 
                  : "bg-white hover:bg-gray-50 text-gray-800"
              }`}
            >
              <Heart size={16} fill={saved ? "currentColor" : "none"} className={saved ? "scale-110" : ""} />
              {saved ? "Saved" : "Save Trip"}
            </button>

            <button 
              onClick={handleShare}
              className="flex items-center gap-2 bg-white/15 hover:bg-white/20 text-white border border-white/20 px-4 py-2 rounded-xl text-sm font-semibold shadow-md transition-all duration-200 cursor-pointer"
            >
              <Share2 size={16} />
              Share
            </button>

            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 bg-white/15 hover:bg-white/20 text-white border border-white/20 px-4 py-2 rounded-xl text-sm font-semibold shadow-md transition-all duration-200 cursor-pointer"
            >
              <Download size={16} />
              PDF / Print
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Companion Widgets (Weather, Checklist, Budget) */}
        <div className="space-y-6 print:hidden">
          
          {/* Weather Widget */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Sun className="text-orange-500 w-4 h-4" /> Destination Weather
              </h4>
              <span className="text-xs text-gray-500 font-semibold bg-gray-50 px-2 py-0.5 rounded">Forecast</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{weather.icon}</span>
                <div>
                  <div className="text-2xl font-black text-gray-900 leading-none">{weather.temp}°C</div>
                  <div className="text-xs text-gray-500 font-medium mt-1">{weather.condition}</div>
                </div>
              </div>
              
              <div className="text-right text-xs space-y-1 text-gray-500 font-semibold">
                <div>💧 Humidity: {weather.humidity}%</div>
                <div>💨 Wind: {weather.wind} km/h</div>
                {weather.rainChance > 0 && <div className="text-blue-500 flex items-center gap-1 justify-end"><CloudRain size={12} /> Rain: {weather.rainChance}%</div>}
              </div>
            </div>
          </div>

          {/* Budget Allocation Widget */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <PieChart className="text-indigo-500 w-4 h-4" /> Estimated Expenses
              </h4>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Breakdown</span>
            </div>

            <div className="space-y-3.5">
              {budgetBreakdown.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                      {item.category}
                    </span>
                    <span>₹ {item.amount.toLocaleString()} ({item.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
            
            <p className="text-[10px] text-gray-400 mt-4 leading-relaxed font-medium">
              * Calculations are estimations based on typical travel distributions. Real pricing may vary depending on bookings and seasons.
            </p>
          </div>

          {/* Checklist Widget */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <ListTodo className="text-emerald-500 w-4 h-4" /> Travel Checklist
              </h4>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                {packingList.filter(i => i.checked).length}/{packingList.length} packed
              </span>
            </div>

            {/* Checklist Items list */}
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1 mb-4">
              {packingList.map((item) => (
                <div 
                  key={item.id}
                  className={`flex items-center justify-between p-2 rounded-lg border text-xs transition-all duration-200 ${
                    item.checked 
                      ? "bg-emerald-50/50 border-emerald-100 text-gray-400 line-through" 
                      : "bg-gray-50/50 border-gray-100 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <label className="flex items-center gap-2 cursor-pointer flex-1 select-none font-semibold">
                    <input 
                      type="checkbox" 
                      checked={item.checked} 
                      onChange={() => toggleChecklistItem(item.id)}
                      className="rounded border-gray-300 text-emerald-500 focus:ring-emerald-500 w-3.5 h-3.5"
                    />
                    <span>{item.text}</span>
                  </label>
                  <button 
                    onClick={() => deleteChecklistItem(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              {packingList.length === 0 && (
                <div className="text-center py-6 text-gray-400 text-xs font-semibold">
                  No items in your packing checklist yet!
                </div>
              )}
            </div>

            {/* Add Custom Item */}
            <form onSubmit={addChecklistItem} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Add custom item..." 
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                className="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-500"
                maxLength={50}
              />
              <button 
                type="submit"
                className="bg-[#122B41] hover:bg-[#1a3d5c] text-white p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <Plus size={16} />
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: Itinerary Day-by-Day Viewer */}
        <div className="lg:col-span-2 space-y-6 print:w-full print:shadow-none">
          
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 print:border-none print:shadow-none print:p-0">
            
            {/* Header Tabs (Print Hidden) */}
            <div className="flex border-b border-gray-100 mb-6 print:hidden">
              <button
                onClick={() => setActiveTabSection("itinerary")}
                className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTabSection === "itinerary" 
                    ? "border-orange-500 text-orange-500" 
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Compass size={16} /> Day-by-Day Plan
              </button>
              <button
                onClick={() => setActiveTabSection("packing")}
                className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all lg:hidden flex items-center gap-1.5 cursor-pointer ${
                  activeTabSection === "packing" 
                    ? "border-orange-500 text-orange-500" 
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <ListTodo size={16} /> Packing List
              </button>
              <button
                onClick={() => setActiveTabSection("budget")}
                className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all lg:hidden flex items-center gap-1.5 cursor-pointer ${
                  activeTabSection === "budget" 
                    ? "border-orange-500 text-orange-500" 
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <PieChart size={16} /> Budget
              </button>
            </div>

            {/* Mobile-Friendly conditional widgets */}
            <AnimatePresence mode="wait">
              {activeTabSection === "packing" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  key="packing-tab"
                  className="lg:hidden space-y-4"
                >
                  <h4 className="font-bold text-gray-900 text-base">Checklist Checklist</h4>
                  {/* Reuse the checklist content */}
                  <div className="space-y-2 mb-4">
                    {packingList.map((item) => (
                      <div 
                        key={item.id}
                        className={`flex items-center justify-between p-2.5 rounded-lg border text-xs ${
                          item.checked 
                            ? "bg-emerald-50 border-emerald-100 text-gray-400 line-through" 
                            : "bg-gray-50 border-gray-100 text-gray-700"
                        }`}
                      >
                        <label className="flex items-center gap-2.5 cursor-pointer flex-1 font-semibold">
                          <input 
                            type="checkbox" 
                            checked={item.checked} 
                            onChange={() => toggleChecklistItem(item.id)}
                            className="rounded border-gray-300 text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                          />
                          <span>{item.text}</span>
                        </label>
                        <button 
                          onClick={() => deleteChecklistItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={addChecklistItem} className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Add custom item..." 
                      value={newItemText}
                      onChange={(e) => setNewItemText(e.target.value)}
                      className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                    <button type="submit" className="bg-[#122B41] text-white px-3 py-2 rounded-lg cursor-pointer font-bold">Add</button>
                  </form>
                </motion.div>
              )}

              {activeTabSection === "budget" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  key="budget-tab"
                  className="lg:hidden space-y-4"
                >
                  <h4 className="font-bold text-gray-900 text-base">Expense breakdown</h4>
                  <div className="space-y-4">
                    {budgetBreakdown.map((item, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold text-gray-600">
                          <span className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${item.color}`} />
                            {item.category}
                          </span>
                          <span>₹ {item.amount.toLocaleString()} ({item.percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.percentage}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTabSection === "itinerary" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key="itinerary-tab"
                  className="space-y-6"
                >
                  
                  {/* Intro Text */}
                  {intro && intro.trim().length > 10 && (
                    <div className="bg-orange-500/5 border border-orange-500/10 rounded-2xl p-4 text-sm text-gray-600 leading-relaxed font-medium italic print:hidden">
                      <Sparkles size={16} className="text-orange-500 inline mr-2 mb-0.5" />
                      {intro.replace(/^\s*#+\s*.*$/m, "").trim()}
                    </div>
                  )}

                  {/* Print Version: render all days sequentially */}
                  <div className="hidden print:block space-y-8">
                    {days.map((d, index) => (
                      <div key={index} className="border-b border-gray-200 pb-6 last:border-0">
                        <h3 className="text-xl font-bold text-[#122B41] mb-3">
                          Day {d.day}: {d.title}
                        </h3>
                        <div className="space-y-1 pl-4 border-l-2 border-orange-500/40">
                          {d.content.split('\n').map((line, lIdx) => renderMarkdownLine(line, lIdx))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Interactive Screen Version: day-by-day tabs */}
                  <div className="print:hidden">
                    
                    {/* Days Navigation Row */}
                    <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-thin scrollbar-thumb-gray-200">
                      {days.map((d, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedDayTab(idx)}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                            selectedDayTab === idx
                              ? "bg-[#122B41] text-white shadow-md shadow-gray-200"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                          }`}
                        >
                          Day {d.day}
                        </button>
                      ))}
                    </div>

                    {/* Day Content */}
                    <AnimatePresence mode="wait">
                      {days[selectedDayTab] && (
                        <motion.div
                          key={selectedDayTab}
                          initial={{ opacity: 0, x: 8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -8 }}
                          transition={{ duration: 0.2 }}
                          className="bg-gray-50/50 rounded-2xl border border-gray-100 p-5 sm:p-6"
                        >
                          <div className="flex items-start gap-4 mb-4">
                            {/* Day Number Badge */}
                            <div className="bg-orange-500 text-white text-base font-extrabold w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-orange-100">
                              D{days[selectedDayTab].day}
                            </div>
                            <div>
                              <h3 className="text-xl font-extrabold text-gray-900 font-playfair tracking-wide leading-snug">
                                {days[selectedDayTab].title}
                              </h3>
                              <p className="text-xs font-bold text-orange-500 mt-1 uppercase tracking-wider">
                                Custom Day Plan
                              </p>
                            </div>
                          </div>

                          <div className="space-y-1.5 mt-5 pl-1.5 border-l-2 border-orange-500/20">
                            {days[selectedDayTab].content.split('\n').map((line, lIdx) => renderMarkdownLine(line, lIdx))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>

                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>

      </div>

      <Chatbot />
    </div>
  );
}

export default function PlanPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-t-4 border-orange-500 animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Retrieving travel details...</p>
        </div>
      </div>
    }>
      <PlanContent />
    </Suspense>
  );
}
