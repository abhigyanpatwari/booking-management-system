import { Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const navigate = useNavigate();

  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/v1/admin/check", {
          headers: { Authorization: `Bearer ${token}` },
        });
        localStorage.setItem("isAdmin", response.data.isAdmin.toString());
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("isAdmin");
        navigate("/signin");
      }
    };

    if (token) {
      validateToken();
    }
  }, [token, navigate]);

  if (!token) {
    return <Navigate to="/signin" />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default ProtectedRoute;
