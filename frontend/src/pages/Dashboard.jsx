import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        // Fetch user data and their bookings
        const [userResponse, bookingsResponse] = await Promise.all([
          axios.get("http://localhost:3000/api/v1/users/me", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:3000/api/v1/bookings", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setUser(userResponse.data);
        setBookings(bookingsResponse.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleBookAppointment = () => {
    navigate("/services");
  };

  const handleCancelBooking = async (bookingId, appointmentDate) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const appointmentDay = new Date(appointmentDate);
      appointmentDay.setHours(0, 0, 0, 0);

      // Check if trying to cancel on the day of appointment or after
      if (today >= appointmentDay) {
        setError("Appointments can only be cancelled at least one day before the scheduled date");
        return;
      }

      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `http://localhost:3000/api/v1/bookings/${bookingId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data) {
        // Refresh bookings after cancellation
        const bookingsResponse = await axios.get(
          "http://localhost:3000/api/v1/bookings",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setBookings(bookingsResponse.data);
        setError(""); // Clear any existing error
      }
    } catch (error) {
      console.error("Error canceling booking:", error);
      setError(error.response?.data?.message || "Failed to cancel booking");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
        </CardHeader>
        <CardContent>Loading user data...</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {user?.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Email: {user?.email}</p>
          <Button 
            onClick={handleBookAppointment}
            className="mt-4"
          >
            Book New Appointment
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {bookings.length === 0 ? (
            <p>No upcoming appointments</p>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking._id} className="bg-gray-100 p-4 rounded-lg">
                  <p>Date: {booking.timeSlot?.startTime ? new Date(booking.timeSlot.startTime).toLocaleString() : 'N/A'}</p>
                  <p>Service: {booking.timeSlot?.service?.name || 'N/A'}</p>
                  <p>Duration: {booking.timeSlot?.service?.duration ? `${booking.timeSlot.service.duration} minutes` : 'N/A'}</p>
                  <p>Price: {booking.timeSlot?.service?.price ? `$${booking.timeSlot.service.price}` : 'N/A'}</p>
                  <Button 
                    onClick={() => handleCancelBooking(booking._id, booking.timeSlot.startTime)}
                    variant="destructive"
                    className="mt-2"
                  >
                    Cancel Appointment
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
