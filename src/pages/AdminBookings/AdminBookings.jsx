import { useEffect, useState } from "react";
import {
    collection,
    getDocs,
    orderBy,
    query, doc, updateDoc, deleteDoc
} from "firebase/firestore";
import { db } from "../../firebase";
import "./AdminBookings.css";

function AdminBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch bookings 
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const q = query(
                    collection(db, "bookings"),
                    orderBy("createdAt", "desc")
                );

                const snap = await getDocs(q);
                const data = snap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setBookings(data);
            } catch (err) {
                console.error("Failed to fetch admin bookings", err);
            } finally {
                setLoading(false);

            }
        };

        fetchBookings();
    }, []);

    // Mark complete  
    const markCompleted = async (bookingId) => {
        try {
            await updateDoc(doc(db, "bookings", bookingId), {
                status: "Completed",
            });
            setBookings(prev =>
                prev.map(b =>
                    b.id === bookingId ? { ...b, status: "Completed" } : b
                )
            );
        } catch (err) {
            console.error("Failed to mark completed", err);
        }
    };

    // cancel booking 
    const cancelBooking = async (booking) => {
        try {
            // 1️⃣ Update booking status
            await updateDoc(doc(db, "bookings", booking.id), {
                status: "Cancelled",
            });

            // 2️⃣ Free the slot
            const slotKey = `${booking.date}_${booking.time}_${booking.stylistId}`;
            await deleteDoc(doc(db, "slots", slotKey));

            setBookings(prev =>
                prev.map(b =>
                    b.id === booking.id ? { ...b, status: "Cancelled" } : b
                )
            );
        } catch (err) {
            console.error("Failed to cancel booking", err);
        }
    };

    if (loading) return <p style={{ padding: 20 }}>Loading bookings...</p>;

    return (
        <div className="admin-bookings">
            <h2>All Bookings</h2>

            <div className="admin-booking-list">
                {bookings.map(b => (
                    <div key={b.id} className="admin-booking-card">
                        <h4>{b.serviceName}</h4>
                        <p><strong>Stylist:</strong> {b.stylistName}</p>
                        <p><strong>Date:</strong> {b.date}</p>
                        <p><strong>Time:</strong> {b.time}</p>
                        <p><strong>Customer:</strong> {b.userName || b.userEmail}</p>
                        <p className={`status ${b.status.toLowerCase()}`}>
                            {b.status}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AdminBookings;
