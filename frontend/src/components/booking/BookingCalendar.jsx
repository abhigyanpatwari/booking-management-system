import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const BookingCalendar = ({ 
  selectedDate, 
  onSelect, 
  service,
  availableDates = [] 
}) => {
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + (service?.bookingTimeLimit || 0));

  const isDateAvailable = (date) => {
    return availableDates.some(slot => 
      new Date(slot.startTime).toDateString() === date.toDateString()
    );
  };

  return (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={onSelect}
      disabled={(date) => 
        date < new Date() || 
        date > maxDate || 
        !isDateAvailable(date)
      }
      modifiers={{
        holiday: (date) => availableDates.some(slot => 
          new Date(slot.startTime).toDateString() === date.toDateString() && 
          slot.isHoliday
        )
      }}
      modifiersClassNames={{
        holiday: "text-red-500 line-through",
        disabled: "text-gray-300"
      }}
      className="rounded-md border"
    />
  );
};

export default BookingCalendar;
