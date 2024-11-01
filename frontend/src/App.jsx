import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import Dashboard from "./pages/Dashboard";
import Services from "./pages/Services";
import Bookings from "./pages/Bookings";
import Navbar from "./components/Navbar";
import Admin from "./pages/Admin";
import AdminSignIn from "./pages/AdminSignIn";
import AdminRoute from "./components/AdminRoute";
import './App.css'

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      {!isAdminRoute && <Navbar />}
      <main className="container mx-auto py-6 px-4">
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/services" element={<Services />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/admin/signin" element={<AdminSignIn />} />
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
