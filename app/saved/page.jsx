"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Calendar, DollarSign, Users, Heart, Trash2, ArrowLeft, 
  MapPin, Compass, ArrowRight, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function SavedTripsPage() {
  const router = useRouter();
  const [trips, setTrips] = useState([]);

  // Load saved trips on mount
  useEffect(() => {
    const saved = localStorage.getItem("wishroute_trips");
    if (saved) {
      try {
        setTrips(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Format date range helper
  const getDatesFormatted = (startDate, duration) => {
    if (!startDate) return `${duration} Days`;
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + parseInt(duration) - 1);
    
    const options = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}, ${start.getFullYear()}`;
  };

  // Delete trip
  const handleDeleteTrip = (id, e) => {
    e.stopPropagation(); // Avoid triggering card click
    
    if (confirm("Are you sure you want to delete this trip itinerary?")) {
      const updated = trips.filter(trip => trip.id !== id);
      setTrips(updated);
      localStorage.setItem("wishroute_trips", JSON.stringify(updated));
      toast.success("Trip itinerary deleted.");
    }
  };

  // Open saved plan
  const handleOpenTrip = (trip) => {
    const params = new URLSearchParams({
      destination: trip.destination,
      duration: trip.duration,
      budget: trip.budget,
      guests: trip.guests || "1",
      startDate: trip.startDate || "",
      preferences: trip.preferences || ""
    });
    router.push(`/plan?${params.toString()}`);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-gray-50 to-gray-100/50 py-10 px-4 sm:px-6 md:px-8 text-gray-800">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="space-y-1.5">
            <button 
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-1.5 text-xs text-orange-500 hover:text-orange-600 font-semibold uppercase tracking-wider transition-colors"
            >
              <ArrowLeft size={14} /> Home
            </button>
            <h2 className="text-3xl font-extrabold font-playfair tracking-tight text-[#122B41] flex items-center gap-2">
              <Heart size={28} className="text-red-500" fill="currentColor" /> My Saved Journeys
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              Browse and reopen your curated travel itineraries.
            </p>
          </div>

          {trips.length > 0 && (
            <button 
              onClick={() => router.push("/")}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-1 cursor-pointer"
            >
              <Sparkles size={13} />
              Plan Another Trip
            </button>
          )}
        </div>

        {/* Trips Grid */}
        <AnimatePresence mode="wait">
          {trips.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm max-w-xl mx-auto mt-12"
            >
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <Compass className="w-8 h-8 text-orange-500 animate-spin-slow" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 font-playfair">Your wishlist is empty</h3>
              <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                You haven't saved any travel itineraries yet. Start planning your dream vacation and save it here.
              </p>
              <button 
                onClick={() => router.push("/")}
                className="bg-[#122B41] hover:bg-[#1a3d5c] text-white font-semibold px-6 py-2.5 rounded-xl shadow-md transition-all inline-flex items-center gap-1.5 cursor-pointer text-sm"
              >
                Create an Itinerary <ArrowRight size={15} />
              </button>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {trips.map((trip, idx) => (
                <motion.div 
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.05 } }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  onClick={() => handleOpenTrip(trip)}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-pointer relative"
                >
                  
                  {/* Visual Destination Header */}
                  <div className="bg-gradient-to-br from-[#122B41] to-[#1a3d5c] text-white p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full filter blur-xl transform translate-x-4 -translate-y-4"></div>
                    
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] bg-orange-500 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Itinerary
                        </span>
                        <h4 className="text-xl font-bold truncate pr-6 font-playfair group-hover:text-orange-300 transition-colors">
                          {trip.destination}
                        </h4>
                      </div>
                      
                      <button 
                        onClick={(e) => handleDeleteTrip(trip.id, e)}
                        className="text-white/60 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
                        title="Delete Journey"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    
                    {/* Metadata Specs */}
                    <div className="space-y-2 text-xs font-semibold text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar size={13} className="text-orange-500" />
                        <span>Dates: {getDatesFormatted(trip.startDate, trip.duration)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign size={13} className="text-[#122B41]" />
                        <span>Budget: ₹ {Number(trip.budget).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={13} className="text-[#122B41]" />
                        <span>Travelers: {trip.guests || 1} {Number(trip.guests) === 1 ? "Person" : "People"}</span>
                      </div>
                    </div>

                    {/* Preference badges */}
                    {trip.preferences && (
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-50">
                        {trip.preferences.split(",").map((pref) => (
                          <span 
                            key={pref} 
                            className="bg-orange-50 text-orange-600 border border-orange-100 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                          >
                            {pref}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Open Footer Details */}
                  <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#122B41] group-hover:text-orange-500 group-hover:bg-orange-50/20 transition-all">
                    <span>View Full Plan</span>
                    <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
                  </div>

                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
