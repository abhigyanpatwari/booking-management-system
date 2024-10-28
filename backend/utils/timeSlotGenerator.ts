import { getHolidays, isHoliday } from "../services/holidayService.ts";

export const generateTimeSlots = async (service: any, startDate: Date, endDate: Date) => {
  const slots = [];
  const currentDate = new Date(startDate);
  const holidays = await getHolidays("US", currentDate.getFullYear());

  console.log('Generating slots with service:', {
    schedule: service.schedule,
    duration: service.duration,
    bookingTimeLimit: service.bookingTimeLimit
  });

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    const schedule = service.schedule.find((s: any) => s.dayOfWeek === dayOfWeek && s.isEnabled);

    if (schedule) {
      console.log(`Processing schedule for ${currentDate.toDateString()}:`, schedule);
      
      const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
      const [endHour, endMinute] = schedule.endTime.split(':').map(Number);
      
      let slotTime = new Date(currentDate);
      slotTime.setHours(startHour, startMinute, 0);
      
      const endTime = new Date(currentDate);
      endTime.setHours(endHour, endMinute, 0);

      console.log(`Creating slots between ${slotTime} and ${endTime}`);

      while (slotTime < endTime) {
        const slotEndTime = new Date(slotTime);
        slotEndTime.setMinutes(slotEndTime.getMinutes() + service.duration);

        if (slotEndTime <= endTime) {
          slots.push({
            service: service._id,
            startTime: new Date(slotTime),
            endTime: new Date(slotEndTime),
            isHoliday: isHoliday(currentDate, holidays)
          });
        }
        
        slotTime.setMinutes(slotTime.getMinutes() + schedule.interval);
      }
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  console.log(`Generated ${slots.length} slots`);
  return slots;
};
