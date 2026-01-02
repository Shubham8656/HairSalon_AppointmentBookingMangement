import { useEffect, useState, useContext } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../../firebase";
import { AuthContext } from "../../context/AuthContext";
import "./MyBooking.css";

function MyBookings() {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchBookings = async () => {
      try {
        const q = query(
          collection(db, "users", user.uid, "bookings"),
          orderBy("createdAt", "desc")
        );

        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setBookings(data);
      } catch (err) {
        console.error("Failed to fetch bookings", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  if (loading) return <p style={{ padding: 20 }}>Loading bookings...</p>;

  return (
    <div className="my-bookings">
      <h2>My Bookings</h2>

      {bookings.length === 0 ? (
        <p>No bookings yet.</p>
      ) : (
        <div className="booking-list">
          {bookings.map(b => (
            <div key={b.id} className="booking-card">
              <h4>{b.serviceName}</h4>
              <img
                src={b.image}
                alt={b.name}
                className="service-image"
              />
              <p><strong>Stylist:</strong> {b.stylistName}</p>
              <p><strong>Date:</strong> {b.date}</p>
              <p><strong>Time:</strong> {b.time}</p>
              <p><strong>Status:</strong><span className={`status ${b.status.toLowerCase()}`}> {b.status}</span></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBookings;
