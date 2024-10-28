import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useNavigate, useLocation } from "react-router-dom";
import BookingCalendar from "@/components/booking/BookingCalendar";
import TimeSlotGrid from "@/components/booking/TimeSlotGrid";

const STEPS = {
  SELECT_SERVICE: 0,
  SELECT_DATE: 1,
  SELECT_TIME: 2
};

const Bookings = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(STEPS.SELECT_SERVICE);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [services, setServices] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/v1/services");
      setServices(response.data);
    } catch (error) {
      console.error("Error fetching services:", error);
      setError("Failed to load services. Please try again.");
    }
  };

  const fetchTimeSlots = async () => {
    if (!selectedService) return;
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login", { state: { from: "/bookings" } });
        return;
      }

      const service = services.find(s => s._id === selectedService);
      if (!service) return;

      const response = await axios.get(
        `http://localhost:3000/api/v1/services/${selectedService}/timeslots`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          params: {
            startDate: service.startDate,
            endDate: service.endDate
          }
        }
      );

      if (response.data) {
        setTimeSlots(response.data);
        setError("");
      } else {
        setTimeSlots([]);
        setError("No time slots available");
      }
    } catch (error) {
      console.error("Error fetching time slots:", error);
      if (error.response?.status === 401) {
        navigate("/login", { state: { from: "/bookings" } });
      } else {
        setError(error.response?.data?.message || "Failed to fetch available time slots");
      }
      setTimeSlots([]);
    }
  };

  useEffect(() => {
    if (selectedService) {
      fetchTimeSlots();
    }
  }, [selectedService]);

  const handleServiceSelect = async (serviceId) => {
    setSelectedService(serviceId);
    setCurrentStep(STEPS.SELECT_DATE);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setCurrentStep(STEPS.SELECT_TIME);
  };

  const handleTimeSlotSelect = async (slot) => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      
      if (!userId || userId === "undefined") {
        console.error("Invalid userId:", userId);
        setError("Session expired. Please login again.");
        navigate("/signin", { state: { from: "/bookings" } });
        return;
      }

      console.log('Debug booking data:', {
        timeSlot: slot._id,
        patient: userId,
        token: token ? 'present' : 'missing'
      });

      const response = await axios.post(
        "http://localhost:3000/api/v1/bookings",
        { 
          timeSlot: slot._id,
          patient: userId
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      if (response.data) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Booking error details:", {
        error: error.response?.data,
        userId: localStorage.getItem("userId"),
        timeSlotId: slot._id,
        fullError: error
      });
      setError(error.response?.data?.message || "Failed to book appointment. Please try again.");
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case STEPS.SELECT_SERVICE:
        return (
          <div className="space-y-4">
            <Label>Select a Service</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <Card 
                  key={service._id}
                  className="cursor-pointer hover:border-primary"
                  onClick={() => handleServiceSelect(service._id)}
                >
                  <CardHeader>
                    <CardTitle>{service.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Duration: {service.duration} minutes</p>
                    <p>Price: ${service.price}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case STEPS.SELECT_DATE:
        const selectedServiceData = services.find(s => s._id === selectedService);
        return (
          <div className="space-y-4">
            <Label>Select a Date</Label>
            <BookingCalendar
              selectedDate={selectedDate}
              onSelect={handleDateSelect}
              service={selectedServiceData}
              availableDates={timeSlots}
            />
          </div>
        );

      case STEPS.SELECT_TIME:
        return (
          <div className="space-y-4">
            <Label>Select a Time</Label>
            <TimeSlotGrid
              timeSlots={timeSlots}
              selectedDate={selectedDate}
              onSelectSlot={handleTimeSlotSelect}
            />
          </div>
        );
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Book an Appointment</h1>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {renderStep()}
    </div>
  );
};

export default Bookings;
