import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./Components/Header/Header";
import Home from "./pages/Home/Home";
import BookingPage from "./pages/BookingPage/BookingPage";
import Login from "./pages/Login/Login";
import BookingSuccess from "./pages/BookingSuccess/BookingSuccess";
import MyBooking from "./pages/MyBooking/MyBooking";
import AdminBookings from "./pages/AdminBookings/AdminBookings";

function App() {
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/book" element={<BookingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/booking-success" element={<BookingSuccess />} />
        <Route path="/my-bookings" element={<MyBooking />} />
        <Route path="/admin/bookings" element={<AdminBookings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

