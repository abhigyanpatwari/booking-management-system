import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const isAdmin = localStorage.getItem("isAdmin") === "true";
      
      if (!isAdmin) {
        navigate("/admin/signin");
        return;
      }

      const response = await axios.get("http://localhost:3000/api/v1/admin/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(response.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `http://localhost:3000/api/v1/bookings/${bookingId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data) {
        fetchBookings();
      }
    } catch (error) {
      console.error("Error canceling booking:", {
        error: error.response?.data,
        bookingId,
        status: error.response?.status
      });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Bookings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bookings.map((booking) => (
          <Card key={booking._id}>
            <CardHeader>
              <CardTitle>
                {booking.timeSlot?.startTime ? 
                  new Date(booking.timeSlot.startTime).toLocaleString() : 
                  'No start time'
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>User: {booking.patient?.name || 'No name'}</p>
              <p>Service: {booking.timeSlot?.service?.name || 'No service'}</p>
              <p>End: {booking.timeSlot?.endTime ? 
                new Date(booking.timeSlot.endTime).toLocaleString() : 
                'No end time'
              }</p>
              <Button 
                onClick={() => handleCancelBooking(booking._id)} 
                variant="destructive"
              >
                Cancel Booking
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BookingManagement;
