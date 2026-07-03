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
  const [loading, setLoading] = useState(true)
  const [currentImage, setCurrentImage] = useState(0)

  useEffect(() => {
    const token = typeof window !== "undefined" && localStorage.getItem("TM_T")
    if (token) {
      router.push("/table")
    } else {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % backgroundImages.length)
    }, 8000) // Image changes every 5 seconds
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-8 border-b-8 border-gray-200"></div>
          <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-8 border-b-8 border-primary animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 z-20 w-full h-16 bg-white shadow flex items-center justify-between px-6">
        <h1 className="text-lg font-bold">GlobeGuide</h1>
        {/* Add navbar items if needed */}
      </nav>

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

      {/* Itinerary Generator - slightly moved up */}
      <div className="absolute bottom-20 left-0 z-10 w-full flex justify-center px-4 pb-8">
        <div className="w-full max-w-4xl">
          <ItineraryGenerator />
        </div>
        <Chatbot/>
      </div>
    </div>
  )
}
