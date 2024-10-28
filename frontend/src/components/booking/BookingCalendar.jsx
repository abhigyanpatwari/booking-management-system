import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const BookingCalendar = ({ 
  selectedDate, 
  onSelect, 
  service,
  availableDates = [] 
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const serviceStartDate = new Date(service.startDate);
  serviceStartDate.setHours(0, 0, 0, 0);
  
  const serviceEndDate = new Date(service.endDate);
  serviceEndDate.setHours(23, 59, 59, 999);

  // Get enabled days from service schedule
  const enabledDays = new Set(service.schedule.filter(s => s.isEnabled).map(s => s.dayOfWeek));

  return (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={onSelect}
      disabled={(date) => {
        const dayOfWeek = date.getDay();
        return (
          date < Math.max(today, serviceStartDate) || 
          date > serviceEndDate || 
          !enabledDays.has(dayOfWeek) ||
          !availableDates.some(slot => 
            new Date(slot.startTime).toDateString() === date.toDateString()
          )
        );
      }}
      className="rounded-md border"
    />
  );
};

export default BookingCalendar;
