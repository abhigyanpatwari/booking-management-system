import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from "@/components/ui/select";
import { useNavigate, useLocation } from "react-router-dom";

const Bookings = () => {
  const navigate = useNavigate();
  const [timeSlots, setTimeSlots] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState("all");
  const [error, setError] = useState("");
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { state: { from: "/bookings" } });
      return;
    }

    // Get service ID from URL parameters
    const params = new URLSearchParams(location.search);
    const serviceId = params.get('service');
    if (serviceId) {
      setSelectedService(serviceId);
    }

    fetchServices();
    fetchTimeSlots();
  }, [navigate, location]);

  const fetchServices = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/v1/services");
      setServices(response.data);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const fetchTimeSlots = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login", { state: { from: "/bookings" } });
        return;
      }

      const url = selectedService && selectedService !== "all"
        ? `http://localhost:3000/api/v1/services/${selectedService}/timeslots`
        : "http://localhost:3000/api/v1/timeslots";
      
      const response = await axios.get(url, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

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
        setError(error.response?.data?.message || "Failed to fetch available time slots. Please try again.");
      }
      setTimeSlots([]);
    }
  };

  // Effect to refetch time slots when service filter changes
  useEffect(() => {
    fetchTimeSlots();
  }, [selectedService]);

  const handleBooking = async (timeSlotId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:3000/api/v1/bookings", { timeSlot: timeSlotId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTimeSlots();
    } catch (error) {
      console.error("Error booking appointment:", error);
      setError("Failed to book appointment. Please try again.");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Book an Appointment</h1>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="mb-6">
        <Label htmlFor="service">Filter by Service</Label>
        <Select
          value={selectedService}
          onValueChange={setSelectedService}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Services" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Services</SelectItem>
            {services.map((service) => (
              <SelectItem key={service._id} value={service._id}>
                {service.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {timeSlots.map((slot) => (
          <Card key={slot._id} className="flex flex-col">
            <CardHeader>
              <CardTitle>
                {slot.service.name}
              </CardTitle>
              <CardDescription>
                {new Date(slot.startTime).toLocaleString()} - {new Date(slot.endTime).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Duration: {slot.service.duration} minutes
              </p>
              <p className="text-sm font-semibold">
                Price: ${slot.service.price}
              </p>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button
                className="w-full"
                onClick={() => handleBooking(slot._id)}
                disabled={slot.isBooked || slot.isHoliday}
              >
                {slot.isBooked 
                  ? "Already Booked" 
                  : slot.isHoliday 
                    ? "Holiday" 
                    : "Book Appointment"}
              </Button>
            </CardFooter>
          </Card>
        ))}
        {timeSlots.length === 0 && (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500">No available time slots found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;
