'use client';

import { useState, useRef, useEffect } from 'react';
import { LogOut, Mail } from 'lucide-react';

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const userEmail = "sakshinarkhede@gmail.com";
  const userName = "Sakshi Narkhede"; // Extract from email or get from auth
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleLogout = () => {
    setIsOpen(false);
    // Replace with actual logout logic
    alert("Logged out!");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative w-10 h-10 rounded-full bg-white text-[#122B41] flex items-center justify-center text-sm font-semibold hover:scale-110 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none border border-gray-200 cursor-pointer"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        {userInitials}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 transform animate-in fade-in-0 zoom-in-95 duration-200">
          {/* User Info Section */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3 ">
              <div className="w-12 h-12 rounded-full bg-white text-[#122B41] flex items-center justify-center text-lg font-semibold border border-gray-200">
                {userInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                <p className="text-xs text-gray-500 truncate flex items-center">
                  <Mail className="w-3 h-3 mr-1" />
                  {userEmail}
                </p>
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}