import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      {/* HERO */}
      <section className="hero">
        <h1>Premium Hair & Grooming Services</h1>
        <p>No waiting. Choose your stylist. Book your time.</p>

        <button
          className="primary-btn large"
          onClick={() => navigate("/book")}
        >
          Book Appointment
        </button>
      </section>

      {/* INFO */}
      <section className="info">
        <h3>Why Book Online?</h3>
        <ul>
          <li>No waiting at salon</li>
          <li>Choose your preferred stylist</li>
          <li>Fixed time slots</li>
          <li>Easy cancellation</li>
        </ul>
      </section>
    </div>
  );
}

export default Home;
