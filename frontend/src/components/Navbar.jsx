import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useContext } from "react";
import { UserContext } from "@/context/UserContext";

const Navbar = () => {
  const { user } = useContext(UserContext);

  return (
    <nav className="border-b">
      <div className="container mx-auto flex justify-between items-center py-4">
        <div className="flex items-center space-x-2">
          {user && (
            <>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-bold">{user.name}</span>
            </>
          )}
        </div>
        <div className="space-x-2">
          <Button variant="ghost" asChild>
            <Link to="/services">Services</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/bookings">Bookings</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/signin">Sign In</Link>
          </Button>
          <Button variant="default" asChild>
            <Link to="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
