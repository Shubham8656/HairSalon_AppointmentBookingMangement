import { Link } from "react-router-dom";
import "./BookingSuccess.css";

function BookingSuccess() {
  return (
    <div className="success-page">
      <div className="success-card">
        <h1>🎉 Booking Confirmed!</h1>
        <p>Your appointment has been successfully booked. Please arrive 10 minutes early.</p>

        <div className="success-actions">
          <Link to="/book" className="btn-outline">
            Book Another
          </Link>
          <Link to="/my-bookings" className="btn-primary">
            View My Bookings
          </Link>
        </div>
      </div>
    </div>
  );
}

export default BookingSuccess;
