import "./../styles/globals.css";
import { Toaster } from "sonner";
import Navbar from "@/components/navbar"; // Import responsive Navbar

export const metadata = {
  title: "GlobeGuide",
  description: "Your smart travel itinerary planner",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond&family=EB+Garamond&family=Merriweather&family=Playfair+Display&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="m-0 p-0">
        <Navbar /> {/* ✅ Use responsive navbar */}
        <main className="pt-16 h-screen overflow-hidden">
          {children}
        </main>
        <Toaster richColors position="top-left" duration={2000} />
      </body>
    </html>
  );
}
