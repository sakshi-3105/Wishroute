'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import ProfileDropdown from './profile-dropdown';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#122B41] backdrop-blur-md border-b border-white/30">
      <nav className="relative h-16 flex items-center justify-between px-4 md:px-8">
        {/* Brand */}
        <h1 className="text-2xl md:text-3xl text-white font-playfair hover:scale-105 transition-transform duration-300">
          WishRoute
        </h1>

        {/* Hamburger for mobile */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-white"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-6 text-lg font-playfair text-white">
          <Link href="/" className="hover:underline">Home</Link>
          <Link href="/plan" className="hover:underline">Plan</Link>
          <Link href="/saved" className="hover:underline">Saved Trips</Link>
        </div>

        {/* ProfileDropdown (Always visible on right) */}
        <div className="hidden md:block">
          <ProfileDropdown />
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#122B41] text-white flex flex-col px-6 py-4 space-y-4 font-playfair text-lg border-t border-white/20">
          <Link href="/" onClick={() => setIsOpen(false)}>Home</Link>
          <Link href="/plan" onClick={() => setIsOpen(false)}>Plan</Link>
          <Link href="/saved" onClick={() => setIsOpen(false)}>Saved Trips</Link>
          <ProfileDropdown />
        </div>
      )}
    </header>
  );
}
