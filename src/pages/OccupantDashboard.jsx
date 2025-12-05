import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import m2hLogo from '../assets/m2h-logo.svg';
import './OccupantDashboard.css';

function OccupantDashboard() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkUser = async () => {
            const { data, error } = await supabase.auth.getUser();
            if (error || !data.user) {
                navigate("/");
            } else {
                setUser(data.user);
            }
        };
        checkUser();
    }, [navigate]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem("role");
        localStorage.removeItem("email");
        navigate("/");
    };

    const getUserInitials = (email) => {
        return email ? email.substring(0, 2).toUpperCase() : 'OC';
    };

    return (
        <div className="occupant-dashboard">
            {/* Dashboard Header */}
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <img src={m2hLogo} alt="M2H Logo" className="dashboard-logo" />
                        <h1 className="header-title">Occupant Portal</h1>
                    </div>
                    <div className="user-info">
                        <div className="user-avatar">
                            {getUserInitials(user?.email)}
                        </div>
                        <div className="user-details">
                            <span className="user-name">Occupant</span>
                            <span className="user-email">{user?.email}</span>
                        </div>
                        <button onClick={handleLogout} className="logout-button">
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Dashboard Content */}
            <main className="dashboard-main">
                <div className="dashboard-container">
                    {/* Welcome Section */}
                    <section className="welcome-section">
                        <h2 className="welcome-title">Welcome to Your Portal</h2>
                        <p className="welcome-subtitle">
                            Access your account information, view balances, and manage your residence details
                        </p>
                        <div className="status-badge">
                            <span>✅</span>
                            Active Resident
                        </div>
                    </section>

                    {/* Features Grid */}
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">💰</div>
                            <h3 className="feature-title">View Balances</h3>
                            <p className="feature-description">
                                Check your current account balance, payment history, and upcoming dues.
                            </p>
                            <div className="feature-status available">
                                <span>✅</span>
                                Available
                            </div>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">⚠️</div>
                            <h3 className="feature-title">View Fines</h3>
                            <p className="feature-description">
                                Monitor any outstanding fines, penalty fees, and payment deadlines.
                            </p>
                            <div className="feature-status available">
                                <span>✅</span>
                                Available
                            </div>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">📋</div>
                            <h3 className="feature-title">View Violations</h3>
                            <p className="feature-description">
                                Review violation reports, incident details, and resolution status.
                            </p>
                            <div className="feature-status available">
                                <span>✅</span>
                                Available
                            </div>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">✏️</div>
                            <h3 className="feature-title">Edit Data</h3>
                            <p className="feature-description">
                                Modify personal information, contact details, and account preferences.
                            </p>
                            <div className="feature-status unavailable">
                                <span>❌</span>
                                Restricted Access
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <section className="quick-actions">
                        <h2 className="actions-title">
                            <span>⚡</span>
                            Quick Actions
                        </h2>
                        <div className="actions-grid">
                            <button className="action-button">
                                <span className="action-icon">💰</span>
                                Check Balance
                            </button>
                            <button className="action-button">
                                <span className="action-icon">💳</span>
                                Payment History
                            </button>
                            <button className="action-button">
                                <span className="action-icon">📋</span>
                                View Reports
                            </button>
                            <button className="action-button">
                                <span className="action-icon">📞</span>
                                Contact Support
                            </button>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

export default OccupantDashboard;
