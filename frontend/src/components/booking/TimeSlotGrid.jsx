import { Button } from "@/components/ui/button";

const TimeSlotGrid = ({ timeSlots, selectedDate, onSelectSlot }) => {
  const filteredSlots = timeSlots.filter(slot => 
    new Date(slot.startTime).toDateString() === selectedDate?.toDateString()
  );

  return (
    <div className="grid grid-cols-3 gap-4">
      {filteredSlots.map((slot) => (
        <Button
          key={slot._id}
          onClick={() => onSelectSlot(slot)}
          variant="outline"
          disabled={slot.isBooked || slot.isHoliday}
          className="p-4"
        >
          {new Date(slot.startTime).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Button>
      ))}
    </div>
  );
};

export default TimeSlotGrid;
