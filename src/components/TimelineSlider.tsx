import React, { useState, useRef, useEffect } from 'react';

interface TimelineSliderProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  onDateRangeChange?: (dateRange: { start: string; end: string }) => void;
  className?: string;
}

const TimelineSlider: React.FC<TimelineSliderProps> = ({
  selectedDate,
  onDateChange,
  onDateRangeChange,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  // Timeline data - months from Feb to Today with actual date ranges
  const timelineData = [
    { label: 'Feb', value: 'Feb', color: '#3B82F6', dateRange: { start: '2024-02-01', end: '2024-02-29' } },
    { label: 'Mar', value: 'Mar', color: '#3B82F6', dateRange: { start: '2024-03-01', end: '2024-03-31' } },
    { label: 'Apr', value: 'Apr', color: '#10B981', dateRange: { start: '2024-04-01', end: '2024-04-30' } },
    { label: 'May', value: 'May', color: '#F59E0B', dateRange: { start: '2024-05-01', end: '2024-05-31' } },
    { label: 'Jun', value: 'Jun', color: '#F59E0B', dateRange: { start: '2024-06-01', end: '2024-06-30' } },
    { label: 'Jul', value: 'Jul', color: '#F97316', dateRange: { start: '2024-07-01', end: '2024-07-31' } },
    { label: 'Aug', value: 'Aug', color: '#EF4444', dateRange: { start: '2024-08-01', end: '2024-08-31' } },
    { label: 'Sep', value: 'Sep', color: '#EF4444', dateRange: { start: '2024-09-01', end: '2024-09-30' } },
    { label: 'Oct', value: 'Oct', color: '#8B5CF6', dateRange: { start: '2024-10-01', end: '2024-10-31' } },
    { label: 'Nov', value: 'Nov', color: '#8B5CF6', dateRange: { start: '2024-11-01', end: '2024-11-30' } },
    { label: 'Dec', value: 'Dec', color: '#6366F1', dateRange: { start: '2024-12-01', end: '2024-12-31' } },
    { label: 'Today', value: 'Today', color: '#EF4444', dateRange: { start: '2024-01-01', end: new Date().toISOString().split('T')[0] } }
  ];

  // Find current selected index
  const selectedIndex = timelineData.findIndex(item => item.value === selectedDate);
  const sliderPosition = selectedIndex >= 0 ? (selectedIndex / (timelineData.length - 1)) * 100 : 0;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateSliderPosition(e);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      updateSliderPosition(e);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updateSliderPosition = (e: MouseEvent | React.MouseEvent) => {
    if (!trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const percentage = Math.max(0, Math.min(100, (y / rect.height) * 100));
    
    // Calculate which timeline item this corresponds to
    const index = Math.round((percentage / 100) * (timelineData.length - 1));
    const selectedItem = timelineData[index];
    
    if (selectedItem && selectedItem.value !== selectedDate) {
      onDateChange(selectedItem.value);
      if (onDateRangeChange) {
        onDateRangeChange(selectedItem.dateRange);
      }
    }
  };

  const handleTrackClick = (e: React.MouseEvent) => {
    updateSliderPosition(e);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div className={`relative w-full h-full flex ${className}`}>
      {/* Timeline Labels */}
      <div className="flex flex-col justify-between h-full w-16 pr-2">
        {timelineData.map((item, index) => (
          <div
            key={item.value}
            className="flex items-center justify-end h-8"
          >
            <span 
              className={`text-xs whitespace-nowrap ${
                item.value === selectedDate 
                  ? 'font-semibold text-gray-900' 
                  : 'text-gray-600'
              }`}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Vertical Timeline Track */}
      <div className="relative flex-1 max-w-[12px]">
        {/* Background Track */}
        <div 
          ref={trackRef}
          className="w-3 h-full bg-gray-200 rounded-full cursor-pointer relative"
          onClick={handleTrackClick}
        >
          {/* Gradient Progress Track */}
          <div 
            className="absolute top-0 left-0 w-full rounded-full transition-all duration-200"
            style={{ 
              height: `${sliderPosition}%`,
              background: 'linear-gradient(to bottom, #3B82F6, #10B981, #F59E0B, #EF4444)'
            }}
          />
          
          {/* Timeline Markers */}
          {timelineData.map((item, index) => {
            const position = (index / (timelineData.length - 1)) * 100;
            return (
              <div
                key={item.value}
                className="absolute flex items-center"
                style={{ top: `${position}%`, left: '-2px', transform: 'translateY(-50%)' }}
              >
                {/* Horizontal tick mark */}
                <div 
                  className={`h-0.5 transition-all duration-200 ${
                    item.value === selectedDate ? 'w-5 bg-gray-800' : 'w-4 bg-gray-500'
                  }`}
                />
                {/* Circle marker */}
                <div 
                  className={`absolute w-2 h-2 rounded-full border border-white shadow-sm transition-all duration-200 ${
                    item.value === selectedDate ? 'w-2.5 h-2.5 ring-1 ring-gray-300' : ''
                  }`}
                  style={{ 
                    backgroundColor: item.color,
                    left: '6px',
                    transform: 'translateX(-50%) translateY(-50%)'
                  }}
                />
              </div>
            );
          })}
          
          {/* Slider Handle */}
          <div
            className="absolute cursor-grab active:cursor-grabbing z-10"
            style={{ 
              top: `${sliderPosition}%`, 
              left: '6px',
              transform: 'translateX(-50%) translateY(-50%)'
            }}
            onMouseDown={handleMouseDown}
          >
            <div className="w-3 h-3 bg-white border border-gray-400 rounded-full shadow-md hover:border-gray-600 transition-colors duration-150 flex items-center justify-center">
              <div 
                className="w-1 h-1 rounded-full"
                style={{ 
                  backgroundColor: timelineData.find(item => item.value === selectedDate)?.color || '#6B7280'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineSlider;