import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Minimize2, Maximize2 } from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(' ');

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1,
      sender: "bot", 
      text: "Hi there! 👋 I'm your travel assistant. How can I help you plan your perfect trip today?",
      timestamp: new Date()
    },
  ]);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Update greeting if there's an active destination in session storage
  useEffect(() => {
    if (open) {
      const activeDest = typeof window !== "undefined" ? sessionStorage.getItem("activeDestination") : null;
      if (activeDest) {
        setMessages(prev => {
          if (prev.length === 1 && prev[0].text.startsWith("Hi there!")) {
            return [
              {
                id: 1,
                sender: "bot",
                text: `Hi there! 👋 I see you're exploring a trip to ${activeDest}! ✈️ I can help you with local restaurant recommendations, transport advice, packing tips, or travel guidelines. What would you like to know?`,
                timestamp: new Date()
              }
            ];
          }
          return prev;
        });
      }
    }
  }, [open]);

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, minimized]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { 
      id: Date.now(),
      sender: "user", 
      text: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate bot response delay
    setTimeout(() => {
      const activeDest = typeof window !== "undefined" ? sessionStorage.getItem("activeDestination") : null;
      
      let botResponses = [
        "That's a great question! I'd love to help you with your travel plans. 🗺️",
        "Let me help you find the perfect destination for your budget and preferences! ✈️",
        "I can assist you with itineraries, budget planning, and destination recommendations. What interests you most?",
        "Tell me more about your travel preferences - adventure, relaxation, culture, or cuisine? 🌍",
        "I'm here to make your trip planning easier! What specific help do you need?"
      ];

      if (activeDest) {
        botResponses = [
          `That's a great question regarding your trip to ${activeDest}! I recommend trying the local street food and checking out regional historic landmarks. 🍜`,
          `I can definitely assist with your plans for ${activeDest}. Are you looking for popular hotspots or quiet, off-the-beaten-path locations? 🌿`,
          `A vacation to ${activeDest} sounds wonderful! Be sure to pack comfortable shoes, as you'll want to explore a lot on foot. 🚶‍♂️`,
          `For ${activeDest}, it's often best to check if you need any local transport cards or advanced booking for top sights. Let me know if you want details! 🎫`,
          `I'm here to help make your journey to ${activeDest} unforgettable! Ask me about packing checkups, weather, or custom activities.`
        ];
      }
      
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
      
      const botMessage = {
        id: Date.now() + 1,
        sender: "bot",
        text: randomResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1200);
  };

  const formatTime = (timestamp) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(timestamp);
  };

  const TypingIndicator = () => (
    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg mr-12 animate-pulse">
      <Bot className="w-4 h-4 text-orange-500" />
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      <span className="text-xs text-gray-500">Assistant is typing...</span>
    </div>
  );

  return (
    <>
      {/* Floating Chat Icon */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          className="relative p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 hover:shadow-orange-500/25 cursor-pointer"
          onClick={() => setOpen(!open)}
          aria-label="Toggle Chatbot"
        >
          {open ? <X size={24} /> : <MessageSquare size={24} />}
        </button>
      </div>

      {/* Chatbox with enhanced UI */}
      {open && (
        <div className={cn(
          "fixed bottom-24 right-6 z-50 bg-white shadow-2xl rounded-2xl border border-gray-200 flex flex-col transition-all duration-300 transform",
          minimized ? "w-80 h-16" : "w-80 sm:w-96 h-96"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Bot className="w-6 h-6" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h3 className="font-semibold text-sm">GlobeGuide Assistant</h3>
                <p className="text-xs opacity-90">Online • Ready to help</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setMinimized(!minimized)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                aria-label={minimized ? "Maximize" : "Minimize"}
              >
                {minimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                aria-label="Close chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          {!minimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50/50 to-white">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex items-start space-x-2 animate-in fade-in slide-in-from-bottom-2 duration-300",
                      msg.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
                    )}
                  >
                    {/* Avatar */}
                    <div className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium",
                      msg.sender === "user" 
                        ? "bg-gradient-to-r from-blue-500 to-blue-600" 
                        : "bg-gradient-to-r from-orange-500 to-orange-600"
                    )}>
                      {msg.sender === "user" ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    
                    {/* Message Bubble */}
                    <div className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2 shadow-sm",
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
                        : "bg-white border border-gray-200 text-gray-800 rounded-bl-md"
                    )}>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <p className={cn(
                        "text-xs mt-1 opacity-70",
                        msg.sender === "user" ? "text-blue-100" : "text-gray-500"
                      )}>
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && <TypingIndicator />}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 p-4 bg-white rounded-b-2xl">
                <div className="flex items-center space-x-3">
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      className="w-full border border-gray-300 rounded-full px-4 py-2 pr-12 text-sm outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 placeholder:text-gray-400"
                      type="text"
                      value={input}
                      placeholder="Ask me about destinations, budgets, itineraries..."
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                      disabled={isTyping}
                      maxLength={500}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                      {input.length}/500
                    </div>
                  </div>
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className={cn(
                      "p-2 rounded-full transition-all duration-200 transform",
                      input.trim() && !isTyping
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:scale-105 shadow-lg hover:shadow-orange-500/25"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    )}
                    aria-label="Send message"
                  >
                    <Send size={16} />
                  </button>
                </div>
                
                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {[
                    "Plan a trip 🗺️",
                    "Best destinations 🌍",
                    "Travel tips ✈️"
                  ].map((action) => (
                    <button
                      key={action}
                      onClick={() => setInput(action)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors duration-200"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}