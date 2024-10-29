import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Navbar = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/signin");
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-3">
            {user && (
              <Link to="/dashboard" className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100">
                <Avatar>
                  <AvatarFallback className="font-bold">{getInitial(user.name)}</AvatarFallback>
                </Avatar>
                <span className="text-gray-700">{user.name}</span>
              </Link>
            )}
          </div>
          
          <div className="flex items-center space-x-6">
            {user && (
              <>
                <Link to="/services" className="px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                  Services
                </Link>
                <Link to="/bookings" className="px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                  Book Appointment
                </Link>
                <Button onClick={handleLogout} variant="outline">
                  Logout
                </Button>
              </>
            )}
            {!user && (
              <div className="flex space-x-4">
                <Link to="/signin">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
