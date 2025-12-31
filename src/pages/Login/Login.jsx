import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./Login.css";

function Login() {
  const { user, login, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  // If already logged in → go to booking
  useEffect(() => {
    if (!loading && user) {
      navigate("/book");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: 60 }}>Loading...</p>;
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Login to StyleCraft Salon</h2>
        <p>Book appointments without waiting</p>

        <button className="google-btn" onClick={login}>
          Continue with Google
        </button>
      </div>
    </div>
  );
}

export default Login;
