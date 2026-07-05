"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ItineraryGenerator from "@/components/itinerary-generator"
import Chatbot from "@/components/chatbot"

const backgroundImages = [
  "/maldives.jpg",
  "/japan.jpg",
  "/austria.jpg",
  "/switzerland.jpg",
  "/australia.jpg",
]

export default function HomePage() {
  const router = useRouter()
  const [currentImage, setCurrentImage] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % backgroundImages.length)
    }, 8000) // Image changes every 8 seconds
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden">
      {/* Background Images */}
      {backgroundImages.map((img, idx) => (
        <div
          key={idx}
          className={`absolute top-0 left-0 h-full w-full bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
            currentImage === idx ? "opacity-100" : "opacity-0"
          }`}
          style={{
            backgroundImage: `url(${img})`,
            zIndex: 0,
          }}
        />
      ))}

      {/* Dark overlay for better text contrast */}
      <div className="absolute inset-0 bg-black/45 z-5" />

      {/* Itinerary Generator overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 pb-12">
        <div className="text-center mb-8 max-w-2xl px-4 text-white drop-shadow-md">
          <h2 className="text-4xl md:text-5xl font-bold font-playfair mb-3 leading-tight">
            Discover Your Next Adventure
          </h2>
          <p className="text-lg md:text-xl text-gray-200 font-light">
            Create AI-powered itineraries customized for your preferences and budget
          </p>
        </div>
        <div className="w-full max-w-4xl">
          <ItineraryGenerator />
        </div>
        <Chatbot />
      </div>
    </div>
  )
}
