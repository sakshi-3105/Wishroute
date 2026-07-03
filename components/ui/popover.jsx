// components/ui/popover.jsx
import * as React from "react";
import { cn } from "@/lib/utils";

// Context for managing popover state
const PopoverContext = React.createContext({});

export const Popover = ({ children, defaultOpen = false, onOpenChange }) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  
  const handleOpenChange = React.useCallback((open) => {
    setIsOpen(open);
    onOpenChange?.(open);
  }, [onOpenChange]);
  
  const contextValue = React.useMemo(() => ({
    isOpen,
    setIsOpen: handleOpenChange,
  }), [isOpen, handleOpenChange]);
  
  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        handleOpenChange(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, handleOpenChange]);
  
  return (
    <PopoverContext.Provider value={contextValue}>
      <div className="relative">
        {children}
      </div>
    </PopoverContext.Provider>
  );
};

export const PopoverTrigger = React.forwardRef(
  ({ children, asChild = false, ...props }, ref) => {
    const { isOpen, setIsOpen } = React.useContext(PopoverContext);
    
    const handleClick = (event) => {
      event.preventDefault();
      setIsOpen(!isOpen);
    };
    
    if (asChild) {
      return React.cloneElement(children, {
        ref,
        onClick: handleClick,
        'aria-expanded': isOpen,
        'aria-haspopup': true,
        ...props
      });
    }
    
    return (
      <button
        ref={ref}
        onClick={handleClick}
        aria-expanded={isOpen}
        aria-haspopup={true}
        {...props}
      >
        {children}
      </button>
    );
  }
);

PopoverTrigger.displayName = "PopoverTrigger";

export const PopoverContent = React.forwardRef(
  ({ className, align = "center", sideOffset = 4, children, ...props }, ref) => {
    const { isOpen, setIsOpen } = React.useContext(PopoverContext);
    const contentRef = React.useRef(null);
    
    // Close on click outside
    React.useEffect(() => {
      const handleClickOutside = (event) => {
        if (contentRef.current && !contentRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };
      
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen, setIsOpen]);
    
    if (!isOpen) return null;
    
    const alignmentClasses = {
      start: "left-0",
      center: "left-1/2 transform -translate-x-1/2",
      end: "right-0"
    };
    
    return (
      <div
        ref={(node) => {
          contentRef.current = node;
          if (ref) {
            if (typeof ref === 'function') ref(node);
            else ref.current = node;
          }
        }}
        className={cn(
          "absolute z-50 w-64 rounded-xl border border-gray-200 bg-white p-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200",
          alignmentClasses[align],
          className
        )}
        style={{ top: `calc(100% + ${sideOffset}px)` }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

PopoverContent.displayName = "PopoverContent";

// Alternative simpler popover for basic use cases
export const SimplePopover = ({ trigger, content, className }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <Popover onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {trigger}
      </PopoverTrigger>
      <PopoverContent className={className}>
        {content}
      </PopoverContent>
    </Popover>
  );
};