import { useEffect, useState } from "react";
import {
    collection,
    getDocs,
    orderBy,
    query, doc, updateDoc, deleteDoc,
    where
} from "firebase/firestore";
import { db } from "../../firebase";
import "./AdminBookings.css";

function AdminBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stylist, setStylist] = useState(null);
    const [stylists, setStylists] = useState([]);
    const [statusFilter, setStatusFilter] = useState("All");

    const filteredBookings =
        statusFilter === "All"
            ? bookings
            : bookings.filter(b => b.status === statusFilter);
    // count of each booking
    const CompletedBookings = bookings.filter(b => b.status === "Completed");
    const PendingBookings = bookings.filter(b => b.status === "Pending");
    const CancelledBookings = bookings.filter(b => b.status === "Cancelled");
    const bookingStatusArr = [
        { status: "All", count: bookings.length },
        { status: "Completed", count: CompletedBookings.length },
        { status: "Pending", count: PendingBookings.length },
        { status: "Cancelled", count: CancelledBookings.length }
    ]
    // Fetch stylists 
    useEffect(() => {
        const fetchstylists = async () => {
            try {
                const snap = await getDocs(collection(db, "stylists"));
                console.log("snap ", snap.docs)
                const data = snap.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(s =>
                        s.active
                    );

                setStylists(data);
            } catch (err) {
                console.error("Failed to fetch admin bookings", err);
            } finally {
                setLoading(false);

            }
        };

        fetchstylists();
    }, []);

    //fetch booking of selected stylist
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                if(!stylist) {
                    console.log("No stylist",stylist)
                    return};
                const q = query(
                    collection(db, "bookings"),
                    where("stylistId", "==", stylist.id)
                    // orderBy("createdAt", "desc")
                );

                const snap = await getDocs(q);
                const data = snap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setBookings(data);
                console.log("booking",data)
            } catch (err) {
                console.error("Failed to fetch admin bookings", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [stylist]);

    // Mark complete  
    const markCompleted = async (booking) => {
        try {
            await updateDoc(doc(db, "bookings", booking.id), {//admin booking
                status: "Completed",
            });
            updateDoc(doc(db, "users", booking.userId, "bookings", booking.id), {//user booking
                status: "Completed",
            });
            setBookings(prev =>
                prev.map(b =>
                    b.id === booking.id ? { ...b, status: "Completed" } : b
                )
            );
        } catch (err) {
            console.error("Failed to mark completed", err);
        }
    };

    // cancel booking 
    const cancelBooking = async (booking) => {
        try {
            const confirmCancel = window.confirm(
                "Are you sure you want to cancel this booking?"
            );

            if (!confirmCancel) return;

            // 1️⃣ Update booking status
            await updateDoc(doc(db, "bookings", booking.id), {
                status: "Cancelled",
            });
            updateDoc(doc(db, "users", booking.userId, "bookings", booking.id), {//user booking
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


            {(
                <section >
                    <h3>Select Stylist</h3>

                    <div className="stylists-grid">
                        {stylists.map(st => (
                            <div
                                key={st.id}
                                className={`stylist-card ${stylist?.id === st.id ? "active" : ""
                                    }`}
                                onClick={() => {
                                    setStylist(st);
                                    setStatusFilter("All")
                                }}
                            >
                                <img src={st.photo} alt={st.name} />
                                <p>{st.name}</p>
                            </div>
                        ))}
                    </div>

                </section>
            )
            }

            {/* filter */}
            {stylist && <div className="admin-filters">
                {bookingStatusArr.map(booking => (
                    <button
                        key={booking.status}
                        className={statusFilter === booking.status ? "active" : ""}
                        onClick={() => setStatusFilter(booking.status)}
                    >
                        {booking.status} ({booking.count})
                    </button>
                ))}
            </div>}

            {stylist && <div className="admin-booking-list">
                {filteredBookings.map(b => (
                    <div key={b.id} className="admin-booking-card">
                        <h4>{b.serviceName}</h4>
                        <img
                            src={b.image}
                            alt={b.name}
                            className="service-image"
                        />
                        <p><strong>Stylist:</strong> {b.stylistName}</p>
                        <p><strong>Date:</strong> {b.date}</p>
                        <p><strong>Time:</strong> {b.time}</p>
                        <p><strong>Customer:</strong> {b.userName || b.userEmail}</p>
                        <p className={`status ${b.status.toLowerCase()}`}>
                            {b.status}
                        </p>
                        {/* 🔹 Admin actions */}
                        {b.status === "Pending" && (
                            <div className="admin-actions">
                                <button
                                    className="complete-btn"
                                    onClick={() => markCompleted(b)}
                                >
                                    Mark Complete
                                </button>

                                <button
                                    className="cancel-btn"
                                    onClick={() => cancelBooking(b)}
                                >
                                    Cancel Booking
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            }
        </div>
    );
}

export default AdminBookings;
