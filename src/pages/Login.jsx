// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import m2hLogo from '../assets/m2h-logo.svg';
import './Login.css';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError("Invalid email or password. Please try again.");
                setIsLoading(false);
                return;
            }

            const { data: userData, error: userError } = await supabase
                .from("users")
                .select("role")
                .eq("email", email)
                .single();

            if (userError) {
                console.error('Failed to fetch user role:', userError);
                setError(userError.message || 'Could not fetch user role.');
                setIsLoading(false);
                return;
            }

            if (!userData) {
                setError('User record not found. Please contact support.');
                setIsLoading(false);
                return;
            }

            localStorage.setItem("role", userData.role);
            localStorage.setItem("email", email);

            // Navigate based on role
            if (userData.role === "admin") navigate("/admin");
            else if (userData.role === "SA") navigate("/sa");
            else if (userData.role === "treasurer") navigate("/treasurer");
            else if (userData.role === "occupant") navigate("/occupant");
            else navigate("/"); // fallback
        } catch (err) {
            console.error(err);
            setError(err?.message || "An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* Navigation back to home */}
            <nav className="login-nav">
                <Link to="/" className="back-to-home">
                    <span className="back-arrow">←</span>
                    Back to Home
                </Link>
            </nav>

            {/* Main login container */}
            <div className="login-container">
                <div className="login-header">
                    <div className="login-logo">
                        <img src={m2hLogo} alt="M2H Logo" className="login-logo-image" />
                        <h1 className="login-title">M2H Portal</h1>
                    </div>
                    <p className="login-subtitle">Welcome back! Please sign in to your account.</p>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form className="login-form" onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            className="form-input"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="form-input"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        type="submit"
                        className={`login-button ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? '' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}
