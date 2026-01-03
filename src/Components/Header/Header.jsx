import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./Header.css";

function Header() {
  const { user, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="header">
      {/* <header > */}
        {/* LEFT */}
        <div className="header-left">
          <div className="logo">
            ✂️ <strong>StyleCraft Salon</strong>
          </div>
          <span className="location">Andheri West</span>
        </div>

        {/* RIGHT */}
        <div className="header-right">
          <Link to="/book" className="book-btn">
            Book Appointment
          </Link>
          <Link to="/admin/bookings" className="book-btn">
            Admin Dashboard
          </Link>
          {user && (
            <div className="profile-wrapper" ref={dropdownRef}>
              <img
                src={user.photoURL || "https://i.pravatar.cc/40"}
                alt="profile"
                className="profile-img"
                onClick={() => setOpen(!open)}
              />

              {open && (
                <div className="profile-dropdown">
                  <p className="profile-email">{user.email}</p>

                  <Link
                    to="/my-bookings"
                    className="dropdown-link"
                    onClick={() => setOpen(false)}
                  >
                    My Bookings
                  </Link>

                  <button className="logout-btn" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      {/* </header> */}
    </div>
  );
}

export default Header;
