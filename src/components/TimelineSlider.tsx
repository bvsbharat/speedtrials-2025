import React, { useState, useRef, useEffect } from "react";

interface TimelineSliderProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  onDateRangeChange?: (dateRange: { start: string; end: string }) => void;
  className?: string;
  violationsData?: any[]; // Add violations data to generate dynamic timeline
}

const TimelineSlider: React.FC<TimelineSliderProps> = ({
  selectedDate,
  onDateChange,
  onDateRangeChange,
  className = "",
  violationsData = [],
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  // Generate monthly timeline data from January 2024 to June 2025
  const generateTimelineData = () => {
    const timelineData = [];
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const colors = [
      "#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899",
      "#06B6D4", "#84CC16", "#F97316", "#6366F1", "#14B8A6", "#F43F5E"
    ];

    // Generate months from January 2024 to June 2025
    for (let year = 2024; year <= 2025; year++) {
      const endMonth = year === 2025 ? 5 : 11; // June 2025 (index 5) or December 2024 (index 11)
      
      for (let month = 0; month <= endMonth; month++) {
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0); // Last day of the month
        
        const monthIndex = (year - 2024) * 12 + month;
        const colorIndex = monthIndex % colors.length;
        
        timelineData.push({
          label: `${months[month]} ${year}`,
          value: `${year}-${String(month + 1).padStart(2, '0')}`,
          color: colors[colorIndex],
          dateRange: {
            start: startDate.toISOString().split("T")[0],
            end: endDate.toISOString().split("T")[0],
          },
        });
      }
    }

    return timelineData;
  };

  const timelineData = generateTimelineData();

  // Find current selected index
  const selectedIndex = timelineData.findIndex(
    (item) => item.value === selectedDate
  );
  const sliderPosition =
    selectedIndex >= 0 ? (selectedIndex / (timelineData.length - 1)) * 100 : 0;

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
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div className={`relative w-full h-full flex ${className}`}>
      {/* Timeline Labels */}
      <div className="flex flex-col justify-between h-full w-16 pr-2">
        {timelineData.map((item, index) => (
          <div key={item.value} className="flex items-center justify-end h-8">
            <span
              className={`text-xs whitespace-nowrap ${
                item.value === selectedDate
                  ? "font-semibold text-gray-900"
                  : "text-gray-600"
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
              background:
                "linear-gradient(to bottom, #3B82F6, #10B981, #F59E0B, #EF4444)",
            }}
          />

          {/* Timeline Markers */}
          {timelineData.map((item, index) => {
            const position = (index / (timelineData.length - 1)) * 100;
            return (
              <div
                key={item.value}
                className="absolute flex items-center"
                style={{
                  top: `${position}%`,
                  left: "-2px",
                  transform: "translateY(-50%)",
                }}
              >
                {/* Horizontal tick mark */}
                <div
                  className={`h-0.5 transition-all duration-200 ${
                    item.value === selectedDate
                      ? "w-5 bg-gray-800"
                      : "w-4 bg-gray-500"
                  }`}
                />
                {/* Circle marker */}
                <div
                  className={`absolute w-2 h-2 rounded-full border border-white shadow-sm transition-all duration-200 ${
                    item.value === selectedDate
                      ? "w-2.5 h-2.5 ring-1 ring-gray-300"
                      : ""
                  }`}
                  style={{
                    backgroundColor: item.color,
                    left: "6px",
                    transform: "translateX(-50%) translateY(-50%)",
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
              left: "6px",
              transform: "translateX(-50%) translateY(-50%)",
            }}
            onMouseDown={handleMouseDown}
          >
            <div className="w-3 h-3 bg-white border border-gray-400 rounded-full shadow-md hover:border-gray-600 transition-colors duration-150 flex items-center justify-center">
              <div
                className="w-1 h-1 rounded-full"
                style={{
                  backgroundColor:
                    timelineData.find((item) => item.value === selectedDate)
                      ?.color || "#6B7280",
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
