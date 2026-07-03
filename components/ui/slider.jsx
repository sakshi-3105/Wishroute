// components/ui/slider.jsx
import * as React from "react";
import { cn } from "@/lib/utils";

export const Slider = React.forwardRef(
  ({ 
    className, 
    value = [0], 
    onValueChange, 
    min = 0, 
    max = 100, 
    step = 1,
    showValue = true,
    showMinMax = false,
    formatValue,
    orientation = "horizontal",
    ...props 
  }, ref) => {
    const percentage = ((value[0] - min) / (max - min)) * 100;
    const displayValue = formatValue ? formatValue(value[0]) : value[0];
    
    const handleChange = (event) => {
      const newValue = parseInt(event.target.value);
      onValueChange?.([newValue]);
    };
    
    return (
      <div className={cn("relative w-full", className)} {...props}>
        {showMinMax && (
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>{formatValue ? formatValue(min) : min}</span>
            <span>{formatValue ? formatValue(max) : max}</span>
          </div>
        )}
        
        <div className="relative">
          <input
            ref={ref}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value[0]}
            onChange={handleChange}
            className={cn(
              "w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-orange-500/20",
              className
            )}
            style={{
              background: `linear-gradient(to right, #f97316 0%, #f97316 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`
            }}
          />
          
          {/* Custom thumb indicator */}
          <div 
            className="absolute top-1/2 w-5 h-5 bg-white border-2 border-orange-500 rounded-full transform -translate-y-1/2 shadow-sm pointer-events-none transition-all duration-200 hover:scale-110"
            style={{ left: `calc(${percentage}% - 10px)` }}
          />
        </div>
        
        {showValue && (
          <div className="text-center mt-3">
            <span className="text-sm font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded-md">
              {displayValue}
            </span>
          </div>
        )}
      </div>
    );
  }
);

Slider.displayName = "Slider";

// Dual range slider for price ranges, etc.
export const DualSlider = React.forwardRef(
  ({ 
    className, 
    value = [0, 100], 
    onValueChange, 
    min = 0, 
    max = 100, 
    step = 1,
    formatValue,
    ...props 
  }, ref) => {
    const [minVal, maxVal] = value;
    const minPercentage = ((minVal - min) / (max - min)) * 100;
    const maxPercentage = ((maxVal - min) / (max - min)) * 100;
    
    const handleMinChange = (event) => {
      const val = Math.min(parseInt(event.target.value), maxVal - step);
      onValueChange?.([val, maxVal]);
    };
    
    const handleMaxChange = (event) => {
      const val = Math.max(parseInt(event.target.value), minVal + step);
      onValueChange?.([minVal, val]);
    };
    
    return (
      <div className={cn("relative w-full", className)} {...props}>
        <div className="relative h-2">
          {/* Track */}
          <div className="absolute w-full h-2 bg-gray-200 rounded-full" />
          
          {/* Active range */}
          <div 
            className="absolute h-2 bg-orange-500 rounded-full"
            style={{
              left: `${minPercentage}%`,
              width: `${maxPercentage - minPercentage}%`
            }}
          />
          
          {/* Min thumb */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={minVal}
            onChange={handleMinChange}
            className="absolute w-full h-2 appearance-none bg-transparent cursor-pointer"
          />
          
          {/* Max thumb */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={maxVal}
            onChange={handleMaxChange}
            className="absolute w-full h-2 appearance-none bg-transparent cursor-pointer"
          />
        </div>
        
        <div className="flex justify-between text-sm font-medium text-gray-900 mt-3">
          <span className="bg-gray-100 px-2 py-1 rounded-md">
            {formatValue ? formatValue(minVal) : minVal}
          </span>
          <span className="bg-gray-100 px-2 py-1 rounded-md">
            {formatValue ? formatValue(maxVal) : maxVal}
          </span>
        </div>
      </div>
    );
  }
);

DualSlider.displayName = "DualSlider";