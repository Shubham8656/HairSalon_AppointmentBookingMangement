import { useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    collection, getDocs, query, where, addDoc,
    doc, orderBy,
    serverTimestamp,
    setDoc
} from "firebase/firestore";
import { db } from "../../firebase";
import { AuthContext } from "../../context/AuthContext";
import "./BookingPage.css";

function BookingPage() {
    const { user, loading } = useContext(AuthContext);
    const navigate = useNavigate();

    // Booking states
    const [services, setServices] = useState([]);
    const [servicesLoading, setServicesLoading] = useState(true);

    const [service, setService] = useState(null);
    const [stylist, setStylist] = useState(null);
    const [date, setDate] = useState(null);
    const [time, setTime] = useState(null);

    const [stylists, setStylists] = useState([]);
    const [stylistsLoading, setStylistsLoading] = useState(false);

    const [bookedSlots, setBookedSlots] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);

    const stylistRef = useRef(null);
    const dateTimeRef = useRef(null);
    const TimeRef = useRef(null);

    /* 🔐 Protect page */
    useEffect(() => {
        if (!loading && !user) {
            navigate("/login");
        }
    }, [user, loading, navigate]);

    /* 🔄 Fetch services */
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const snap = await getDocs(query(collection(db, "services"), orderBy("id", "asc")));
                const data = snap.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(s => s.active);

                setServices(data);
            } catch (err) {
                console.error("Failed to fetch services", err);
            } finally {
                setServicesLoading(false);
            }
        };

        fetchServices();
    }, []);

    // Fetch Stylists
    useEffect(() => {
        if (!service) return;

        const fetchStylists = async () => {
            setStylistsLoading(true);

            try {
                const snap = await getDocs(collection(db, "stylists"));
                const data = snap.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(s =>
                        s.active &&
                        s.services.includes(service.name)
                    );

                setStylists(data);
            } catch (err) {
                console.error("Failed to fetch stylists", err);
            } finally {
                setStylistsLoading(false);
            }
        };

        fetchStylists();
    }, [service]);

    // Fetch Booked Slots
    useEffect(() => {
        if (!stylist || !date) return;

        const fetchBookedSlots = async () => {
            setSlotsLoading(true);

            try {
                const q = query(
                    collection(db, "bookings"),
                    where("stylistId", "==", stylist.id),
                    where("date", "==", date),
                    // where("status", "!=", "Cancelled")
                );

                const snap = await getDocs(q);
                const booked = snap.docs
                    .map(doc => doc.data())
                    .filter(b => b.status !== "Cancelled")
                    .map(b => b.time); // VERY IMPORTANT

                setBookedSlots(booked);
            } catch (err) {
                console.error("Failed to fetch booked slots", err);
                setBookedSlots([]);
            } finally {
                setSlotsLoading(false);
            }
        };

        fetchBookedSlots();
    }, [stylist, date]);

    if (loading || !user) {
        return <p className="page-loading">Checking login...</p>;
    }

    // Time slot generator
    const generateTimeSlots = (start, end, duration) => {
        console.log("start :", start);
        if (typeof start !== "string" || typeof end !== "string") {
            console.error("Invalid working hours format:", start, end);
            return [];
        }
        const slots = [];

        const [startH, startM] = start.split(":").map(Number);
        const [endH, endM] = end.split(":").map(Number);
        let current = new Date();
        current.setHours(startH, startM, 0, 0);

        const endTime = new Date();
        endTime.setHours(endH, endM, 0, 0);
        while (current.valueOf() + duration * 60000 <= endTime.valueOf()) {
            const hours = current.getHours().toString().padStart(2, "0");
            const minutes = current.getMinutes().toString().padStart(2, "0");

            slots.push(`${hours}:${minutes}`);

            current = new Date(current.getTime() + duration * 60000);
        }
        console.log("slot :", slots)
        return slots;
    };

    const handleBooking = async () => {
        if (!service || !stylist || !date || !time) return;

        try {
            const bookingData = {
                userId: user.uid,
                userName: user.displayName || "Guest",
                userEmail: user.email,
                stylistId: stylist.id,
                stylistName: stylist.name,
                serviceName: service.name,
                duration: service.duration,
                date,
                time,
                status: "Pending",
                image: service.image,
                createdAt: serverTimestamp(),
            };

            // 1️⃣ Save in global bookings
            const bookingRef = await addDoc(
                collection(db, "bookings"),
                bookingData
            );

            // 2️⃣ Save under user
            await setDoc(
                doc(db, "users", user.uid, "bookings", bookingRef.id),
                bookingData
            );

            navigate("/booking-success");

            // Reset state (optional)
            setService(null);
            setStylist(null);
            setDate(null);
            setTime(null);
        } catch (err) {
            console.error("Booking failed", err);
            alert("Failed to book. Try again.");
        }
    };



    return (
        <div className="booking-page">
            <h2>Book Appointment</h2>

            {/* STEP 1: SERVICE */}
            <section>
                <h3>Select Service</h3>

                {servicesLoading ? (
                    <p>Loading services...</p>
                ) : (
                    <div className="services-grid">
                        {services.map(s => (
                            <div
                                key={s.id}
                                className={`service-card ${service?.id === s.id ? "active" : ""
                                    }`}
                                onClick={() => {
                                    setService(s);
                                    setStylist(null);
                                    setDate(null);
                                    setTime(null);
                                    setTimeout(() => {
                                        stylistRef.current?.scrollIntoView({
                                            behavior: "smooth",
                                            block: "start",
                                        });
                                    }, 200);
                                }}
                            >
                                <img
                                    src={s.image}
                                    alt={s.name}
                                    className="service-image"
                                />
                                <h4>{s.name}</h4>
                                <p>{s.duration} mins</p>
                                <strong>₹{s.price}</strong>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* STEP 2: STYLIST (next step) */}
            {service && (
                <section ref={stylistRef}>
                    <h3>Select Stylist</h3>

                    {stylistsLoading ? (
                        <p>Loading stylists...</p>
                    ) : stylists.length === 0 ? (
                        <p className="placeholder">
                            No stylists available for this service
                        </p>
                    ) : (
                        <div className="stylists-grid">
                            {stylists.map(st => (
                                <div
                                    key={st.id}
                                    className={`stylist-card ${stylist?.id === st.id ? "active" : ""
                                        }`}
                                    onClick={() => {
                                        setStylist(st);
                                        setDate(null);
                                        setTime(null);
                                        setTimeout(() => {
                                            dateTimeRef.current?.scrollIntoView({
                                                behavior: "smooth",
                                                block: "start",
                                            });
                                        }, 200);
                                    }}
                                >
                                    <img src={st.photo} alt={st.name} />
                                    <p>{st.name}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}


            {/* STEP 3: DATE */}
            {stylist && (
                <section ref={dateTimeRef}>
                    <h3>Select Date</h3>

                    <input
                        type="date"
                        className="date-input"
                        value={date || ""}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => {
                            setDate(e.target.value);
                            setTime(null);
                            setTimeout(() => {
                                TimeRef.current?.scrollIntoView({
                                    behavior: "smooth",
                                    block: "start",
                                });
                            }, 300);
                        }}
                    />

                </section>
            )}


            {/* STEP 4: TIME */}
            {date && stylist && service && (
                <section ref={TimeRef}>
                    <h3>Select Time Slot</h3>

                    {slotsLoading ? (
                        <p>Loading slots...</p>
                    ) : (
                        <div className="time-slots">
                            {generateTimeSlots(
                                stylist.workingHours.start,
                                stylist.workingHours.end,
                                service.duration
                            ).map(slot => {
                                const isBooked = bookedSlots.includes(slot);

                                return (
                                    <button
                                        key={slot}
                                        disabled={isBooked}
                                        className={`time-slot
                                                    ${time === slot ? "active" : ""}
                                                    ${isBooked ? "disabled" : ""}
                                                `}
                                        onClick={() => !isBooked && setTime(slot)}
                                    >
                                        {slot}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </section>
            )}



            {/* STEP 5: CONFIRM */}
            {time && (
                <button
                    className="primary-btn"
                    onClick={handleBooking}
                >
                    Confirm Booking
                </button>
            )}

        </div>
    );
}

export default BookingPage;
