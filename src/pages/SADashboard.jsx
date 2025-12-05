import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import BackButton from "../components/BackButton";
import './SADashboard.css';

function SADashboard() {
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
        localStorage.removeItem('role');
        navigate("/");
    };

    return (
        <div className="sa-dashboard">
            <header className="sa-header">
                <div>
                    <h1>Student Affairs (SA)</h1>
                    <p className="subtitle">Quick view of occupants, reports, and room assignments.</p>
                </div>
                <div className="sa-header-actions">
                    <BackButton />
                    <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
                </div>
            </header>

            <main className="sa-main">
                <section className="sa-stats">
                    <div className="stat-card">
                        <div className="stat-title">Total Occupants</div>
                        <div className="stat-value">148</div>
                        <div className="stat-meta">Active this semester</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-title">Pending Reports</div>
                        <div className="stat-value">18</div>
                        <div className="stat-meta">Needs review</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-title">Available Rooms</div>
                        <div className="stat-value">12</div>
                        <div className="stat-meta">Ready to assign</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-title">Occupancy Rate</div>
                        <div className="stat-value">92%</div>
                        <div className="stat-meta">Current</div>
                    </div>
                </section>

                <section className="sa-actions-activity">
                    <div className="sa-actions">
                        <h2>Quick Actions</h2>
                        <div className="actions-grid">
                            <Link to="/rooms-occupants" className="action-card">
                                <div className="action-icon">🏠</div>
                                <div className="action-title">Manage Rooms</div>
                                <div className="action-desc">Assign occupants, update statuses.</div>
                            </Link>

                            <Link to="/reports" className="action-card">
                                <div className="action-icon">📋</div>
                                <div className="action-title">Review Reports</div>
                                <div className="action-desc">Process violations & follow-ups.</div>
                            </Link>

                            <Link to="/register" className="action-card">
                                <div className="action-icon">➕</div>
                                <div className="action-title">Register Occupant</div>
                                <div className="action-desc">Add new occupants or guests.</div>
                            </Link>

                            <Link to="/settings" className="action-card">
                                <div className="action-icon">⚙️</div>
                                <div className="action-title">Settings</div>
                                <div className="action-desc">Profile & notification preferences.</div>
                            </Link>
                        </div>
                    </div>

                    <aside className="sa-activity">
                        <h3>Recent Activity</h3>
                        <ul className="activity-list">
                            <li>
                                <div className="act-left">
                                    <div className="act-title">New report submitted</div>
                                    <div className="act-sub">Room B-205 — 30 mins ago</div>
                                </div>
                                <div className="act-badge">Review</div>
                            </li>
                            <li>
                                <div className="act-left">
                                    <div className="act-title">Occupant moved</div>
                                    <div className="act-sub">A-101 → A-202 — 2 hours ago</div>
                                </div>
                                <div className="act-badge">Info</div>
                            </li>
                            <li>
                                <div className="act-left">
                                    <div className="act-title">Room inspection scheduled</div>
                                    <div className="act-sub">C wing — Tomorrow</div>
                                </div>
                                <div className="act-badge">Plan</div>
                            </li>
                        </ul>
                    </aside>
                </section>
            </main>
        </div>
    );
}

export default SADashboard;
