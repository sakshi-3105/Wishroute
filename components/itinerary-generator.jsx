import React, { useState } from "react";

// Utility function for class names
const cn = (...classes) => classes.filter(Boolean).join(' ');

// Enhanced Button Component
const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
    
    const variantStyles = {
      default: "bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500 shadow-sm hover:shadow-md",
      outline: "border-2 border-gray-200 bg-white hover:bg-gray-50 text-gray-700 hover:border-gray-300 focus:ring-gray-300",
      ghost: "bg-transparent hover:bg-gray-100 text-gray-700",
    };
    
    const sizeStyles = {
      sm: "h-8 px-3 text-sm",
      default: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
    };
    
    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

// Enhanced Input Component
const Input = React.forwardRef(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

// Enhanced Popover Components
const Popover = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      {React.Children.map(children, child => 
        React.cloneElement(child, { isOpen, setIsOpen })
      )}
    </div>
  );
};

const PopoverTrigger = ({ children, isOpen, setIsOpen }) => {
  return React.cloneElement(children, { 
    onClick: () => setIsOpen(!isOpen),
    'aria-expanded': isOpen 
  });
};

const PopoverContent = ({ children, isOpen, className }) => {
  if (!isOpen) return null;
  
  return (
    <div className={cn(
      "absolute top-full left-0 z-50 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200",
      className
    )}>
      {children}
    </div>
  );
};

// Enhanced Slider Component
const Slider = ({ value, onValueChange, min, max, step }) => {
  const percentage = ((value[0] - min) / (max - min)) * 100;
  
  return (
    <div className="px-1">
      <div className="relative mb-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={(e) => onValueChange([parseInt(e.target.value)])}
          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #f97316 0%, #f97316 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`
          }}
        />
        <div 
          className="absolute top-1/2 w-5 h-5 bg-white border-2 border-orange-500 rounded-full transform -translate-y-1/2 shadow-sm"
          style={{ left: `calc(${percentage}% - 10px)` }}
        />
      </div>
      <div className="text-center">
        <span className="text-sm font-medium text-gray-900">{value[0]}</span>
      </div>
    </div>
  );
};

export default function ItineraryGenerator() {
  const [where, setWhere] = useState("");
  const [duration, setDuration] = useState([5]);
  const [budget, setBudget] = useState([10000]);
  const [guests, setGuests] = useState(1);

  return (
    <div className="items-center justify-center px-4 sm:px-6 md:px-8">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-14">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          
          {/* Where Input */}
          <div className="flex flex-col text-left flex-1 min-w-0">
            <label className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
              Where
            </label>
            <Input
              placeholder="Destination"
              value={where}
              onChange={(e) => setWhere(e.target.value)}
              className="text-base font-medium"
            />
          </div>

          {/* Duration Slider in Popover */}
          <div className="flex flex-col flex-1 min-w-0">
            <label className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
              Duration
            </label>
            <Popover>
              <PopoverTrigger>
                <Button 
                  variant="outline" 
                  className="w-full flex flex-col items-start h-auto py-2 hover:shadow-sm"
                >
                  <span className="text-base font-medium text-gray-900">
                    {duration[0]} days
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="space-y-0.5">
                  <div className="text-sm font-medium text-gray-700 text-center">
                    Select Duration
                  </div>
                  <Slider
                    min={1}
                    max={30}
                    step={1}
                    value={duration}
                    onValueChange={setDuration}
                  />
                  {/* <div className="text-xs text-gray-500 text-center">
                    {duration[0]} day{duration[0] > 1 ? 's' : ''}
                  </div> */}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Budget Slider in Popover */}
          <div className="flex flex-col flex-1 min-w-0">
            <label className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
              Budget
            </label>
            <Popover>
              <PopoverTrigger>
                <Button 
                  variant="outline" 
                  className="w-full flex flex-col items-start h-auto py-2 hover:shadow-sm"
                >
                  <span className="text-base font-medium text-gray-900">
                    ₹ {budget[0].toLocaleString()}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="space-y-0.5">
                  <div className="text-sm font-medium text-gray-700 text-center">
                    Set Budget
                  </div>
                  <Slider
                    min={10000}
                    max={150000}
                    step={1000}
                    value={budget}
                    onValueChange={setBudget}
                  />
                  {/* <div className="text-xs text-gray-500 text-center">
                    ₹ {budget[0].toLocaleString()}
                  </div> */}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Guests Input */}
          <div className="flex flex-col text-left flex-1 min-w-0">
            <label className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
              Guests
            </label>
            <Input
              type="number"
              min={1}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="text-base font-medium text-center"
            />
          </div>

          {/* Search Button */}
          <div className="w-full md:w-auto">
            <Button 
              className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-2.5 h-10 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              Search
            </Button>
          </div>
        </div>
      </div>

      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          border: 2px solid #f97316;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          border: 2px solid #f97316;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}
