import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter,
  CardDescription 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import { addDays, format } from "date-fns";

const DAYS_OF_WEEK = [
  { id: 0, name: "Sunday" },
  { id: 1, name: "Monday" },
  { id: 2, name: "Tuesday" },
  { id: 3, name: "Wednesday" },
  { id: 4, name: "Thursday" },
  { id: 5, name: "Friday" },
  { id: 6, name: "Saturday" },
];

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({
    name: "",
    description: "",
    duration: "",
    price: "",
    startDate: new Date(),
    endDate: new Date(),
    schedule: DAYS_OF_WEEK.map(day => ({
      dayOfWeek: day.id,
      isEnabled: false,
      startTime: "09:00",
      endTime: "17:00",
      interval: 30
    }))
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/api/v1/admin/services", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(response.data);
    } catch (error) {
      console.error("Error fetching services:", error);
      setError("Failed to fetch services. Please try again.");
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const duration = parseInt(newService.duration);
      const price = parseFloat(newService.price);

      // Add validation logging
      console.log('Validating service data:', {
        duration: {
          raw: newService.duration,
          parsed: duration,
          isValid: !isNaN(duration)
        },
        price: {
          raw: newService.price,
          parsed: price,
          isValid: !isNaN(price)
        }
      });

      const serviceData = {
        name: newService.name,
        description: newService.description,
        duration,
        price,
        startDate: newService.startDate.toISOString(),
        endDate: newService.endDate.toISOString(),
        schedule: newService.schedule
          .filter(slot => slot.isEnabled)
          .map(({ dayOfWeek, startTime, endTime, interval }) => ({
            dayOfWeek,
            startTime,
            endTime,
            interval: parseInt(interval),
            isEnabled: true
          }))
      };

      console.log('Sending service data:', JSON.stringify(serviceData, null, 2));

      const response = await axios.post(
        "http://localhost:3000/api/v1/admin/services",
        serviceData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Generate time slots for the new service
      await axios.post(
        `http://localhost:3000/api/v1/admin/services/${response.data._id}/generate-slots`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchServices();
      setNewService({
        name: "",
        description: "",
        duration: "",
        price: "",
        startDate: new Date(),
        endDate: new Date(),
        schedule: DAYS_OF_WEEK.map(day => ({
          dayOfWeek: day.id,
          isEnabled: false,
          startTime: "09:00",
          endTime: "17:00",
          interval: 30
        }))
      });
    } catch (error) {
      console.error("Error adding service:", error.response?.data || error);
      setError(error.response?.data?.message || "Failed to add service. Please try again.");
    }
  };

  const handleUpdateService = async (serviceId, updatedData) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:3000/api/v1/admin/services/${serviceId}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchServices();
    } catch (error) {
      console.error("Error updating service:", error);
      setError("Failed to update service. Please try again.");
    }
  };

  const handleDeleteService = async (serviceId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/api/v1/admin/services/${serviceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchServices();
    } catch (error) {
      console.error("Error deleting service:", error);
      setError("Failed to delete service. Please try again.");
    }
  };

  const handleScheduleToggle = (dayIndex) => {
    setNewService(prev => ({
      ...prev,
      schedule: prev.schedule.map((day, index) => 
        index === dayIndex 
          ? { ...day, isEnabled: !day.isEnabled }
          : day
      )
    }));
    
    // Debug log
    console.log('Schedule after toggle:', newService.schedule);
  };

  const renderDatePicker = () => (
    <div className="space-y-4">
      <Label>Service Period</Label>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Calendar
            mode="single"
            selected={newService.startDate}
            onSelect={(date) => {
              if (date) {
                setNewService(prev => ({
                  ...prev,
                  startDate: date,
                  endDate: prev.endDate < date ? date : prev.endDate
                }));
              }
            }}
            disabled={(date) => date < new Date()}
            className="rounded-md border"
          />
        </div>
        <div className="space-y-2">
          <Label>End Date</Label>
          <Calendar
            mode="single"
            selected={newService.endDate}
            onSelect={(date) => date && setNewService(prev => ({ ...prev, endDate: date }))}
            disabled={(date) => date < newService.startDate}
            className="rounded-md border"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Services</h2>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add New Service</CardTitle>
        </CardHeader>
        <form onSubmit={handleAddService}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Service Name</Label>
              <Input
                id="name"
                value={newService.name}
                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                placeholder="Enter service name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newService.description}
                onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                placeholder="Enter service description"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={newService.duration}
                onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                placeholder="Enter duration in minutes"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                value={newService.price}
                onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                placeholder="Enter price"
                required
              />
            </div>
            {renderDatePicker()}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Operating Hours</h3>
              {DAYS_OF_WEEK.map((day) => (
                <Card key={day.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <Checkbox
                      id={`day-${day.id}`}
                      checked={newService.schedule?.[day.id]?.isEnabled}
                      onCheckedChange={() => handleScheduleToggle(day.id)}
                    />
                    <Label htmlFor={`day-${day.id}`}>{day.name}</Label>
                    
                    {newService.schedule?.[day.id]?.isEnabled && (
                      <div className="flex items-center gap-4">
                        <Input
                          type="time"
                          value={newService.schedule[day.id].startTime}
                          onChange={(e) => {
                            const updatedSchedule = [...newService.schedule];
                            updatedSchedule[day.id] = {
                              ...updatedSchedule[day.id],
                              startTime: e.target.value
                            };
                            setNewService({
                              ...newService,
                              schedule: updatedSchedule
                            });
                          }}
                        />
                        <span>to</span>
                        <Input
                          type="time"
                          value={newService.schedule[day.id].endTime}
                          onChange={(e) => {
                            const updatedSchedule = [...newService.schedule];
                            updatedSchedule[day.id] = {
                              ...updatedSchedule[day.id],
                              endTime: e.target.value
                            };
                            setNewService({
                              ...newService,
                              schedule: updatedSchedule
                            });
                          }}
                        />
                        <Input
                          type="number"
                          value={newService.schedule[day.id].interval}
                          onChange={(e) => {
                            const updatedSchedule = [...newService.schedule];
                            updatedSchedule[day.id] = {
                              ...updatedSchedule[day.id],
                              interval: parseInt(e.target.value)
                            };
                            setNewService({
                              ...newService,
                              schedule: updatedSchedule
                            });
                          }}
                          className="w-24"
                          min="15"
                          step="15"
                        />
                        <span>min interval</span>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit">Add Service</Button>
          </CardFooter>
        </form>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service._id}>
            <CardHeader>
              <CardTitle>{service.name}</CardTitle>
              <CardDescription>{service.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>Duration: {service.duration} minutes</p>
                <p>Price: ${service.price}</p>
                <p>Service Period: {
                  service.startDate && service.endDate 
                    ? `${format(new Date(service.startDate), 'PPP')} - ${format(new Date(service.endDate), 'PPP')}`
                    : 'Date range not set'
                }</p>
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Operating Hours</h4>
                  {service.schedule.map((day) => (
                    <div key={day.dayOfWeek} className="text-sm">
                      {DAYS_OF_WEEK[day.dayOfWeek].name}: {day.startTime} - {day.endTime}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    const token = localStorage.getItem("token");
                    await axios.post(
                      `http://localhost:3000/api/v1/admin/services/${service._id}/generate-slots`,
                      {},
                      { headers: { Authorization: `Bearer ${token}` }}
                    );
                    setError("Time slots regenerated successfully!");
                  } catch (error) {
                    console.error("Error regenerating time slots:", error);
                    setError("Failed to regenerate time slots.");
                  }
                }}
              >
                Regenerate Time Slots
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleDeleteService(service._id)}
              >
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ServiceManagement;
