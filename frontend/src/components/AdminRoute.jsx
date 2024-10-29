import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";

const AdminRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const token = localStorage.getItem("token");
        const isAdminFlag = localStorage.getItem("isAdmin") === "true";

        if (!token || !isAdminFlag) {
          navigate("/admin/signin");
          return;
        }

        const response = await axios.get("http://localhost:3000/api/v1/admin/check", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.data.isAdmin) {
          localStorage.clear();
          navigate("/admin/signin");
          return;
        }

        setIsAdmin(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Admin verification failed:", error);
        localStorage.clear();
        navigate("/admin/signin");
      }
    };

    verifyAdmin();
  }, [navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAdmin ? children : null;
};

export default AdminRoute; 