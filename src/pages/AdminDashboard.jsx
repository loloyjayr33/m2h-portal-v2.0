import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import m2hLogo from '../assets/m2h-logo.svg';
import './AdminDashboard.css';
import RoleGate from '../components/RoleGate';

function AdminDashboard() {
    const [user, setUser] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false); // For mobile only
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

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const getUserInitials = (email) => {
        return email ? email.substring(0, 2).toUpperCase() : 'AD';
    };

    return (
        <div className="admin-dashboard">
            {/* Sidebar Navigation */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <img src={m2hLogo} alt="M2H Logo" className="sidebar-logo-image" />
                        <div>
                            <h2 className="sidebar-title">M2H Portal</h2>
                            <p className="sidebar-subtitle">Admin Panel</p>
                        </div>
                    </div>
                    <button className="sidebar-close" onClick={toggleSidebar}>
                        ✕
                    </button>
                </div>

                <div className="sidebar-user">
                    <div className="user-info">
                        <div className="user-avatar">
                            {getUserInitials(user?.email)}
                        </div>
                        <div className="user-details">
                            <h4>Administrator</h4>
                            <p>{user?.email}</p>
                        </div>
                    </div>
                </div>

                <nav className="nav-menu">
                    <div className="nav-section">
                        <h3 className="nav-section-title">Overview</h3>
                        <div className="nav-item">
                            {/* Show Finance only to admin + treasurer */}
                            <RoleGate allowed={["admin", "treasurer"]} fallback={null}>
                                <Link to="/finance" className="nav-link">
                                    <span className="nav-icon">�</span>
                                    Financial Overview
                                </Link>
                            </RoleGate>
                        </div>
                    </div>

                    <div className="nav-section">
                        <h3 className="nav-section-title">Management</h3>
                        <div className="nav-item">
                            <Link to="/register" className="nav-link">
                                <span className="nav-icon">👥</span>
                                Manage Users
                            </Link>
                        </div>
                        <div className="nav-item">
                            <Link to="/rooms-occupants" className="nav-link">
                                <span className="nav-icon">🏠</span>
                                Rooms & Occupants
                            </Link>
                        </div>
                        <div className="nav-item">
                            <Link to="/reports" className="nav-link">
                                <span className="nav-icon">📋</span>
                                Reports & Violations
                            </Link>
                        </div>
                        {/* duplicate legacy anchor removed; use Link to /finance above */}
                    </div>

                    <div className="nav-section">
                        <h3 className="nav-section-title">System</h3>
                        <div className="nav-item">
                            <Link to="/settings" className="nav-link">
                                <span className="nav-icon">⚙️</span>
                                Settings
                            </Link>
                        </div>
                        <div className="nav-item">
                            <Link to="/analytics" className="nav-link">
                                <span className="nav-icon">📈</span>
                                Analytics
                            </Link>
                        </div>
                    </div>
                </nav>

                <div className="logout-section">
                    <button onClick={handleLogout} className="logout-btn">
                        <span className="nav-icon">🚪</span>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="main-content">
                {/* Top Header */}
                <header className="top-header">
                    <div className="header-content">
                        <div className="header-left">
                            <button className="menu-toggle" onClick={toggleSidebar}>
                                ☰
                            </button>
                            <div>
                                <h1 className="page-title">Admin Dashboard</h1>
                                <p className="page-subtitle">Welcome back! Here's what's happening with your portal.</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="dashboard-content">
                    {/* Stats Cards */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-header">
                                <div>
                                    <div className="stat-number">150</div>
                                    <div className="stat-label">Total Users</div>
                                </div>
                                <div className="stat-icon users">👥</div>
                            </div>
                            <div className="stat-change positive">
                                ↗ +12% from last month
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-header">
                                <div>
                                    <div className="stat-number">48</div>
                                    <div className="stat-label">Active Rooms</div>
                                </div>
                                <div className="stat-icon rooms">🏠</div>
                            </div>
                            <div className="stat-change positive">
                                ↗ +3 new this week
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-header">
                                <div>
                                    <div className="stat-number">23</div>
                                    <div className="stat-label">Pending Reports</div>
                                </div>
                                <div className="stat-icon reports">📋</div>
                            </div>
                            <div className="stat-change negative">
                                ↗ +5 since yesterday
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-header">
                                <div>
                                    <div className="stat-number">₱85,420</div>
                                    <div className="stat-label">Monthly Revenue</div>
                                </div>
                                <div className="stat-icon revenue">💰</div>
                            </div>
                            <div className="stat-change positive">
                                ↗ +8% from last month
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <section className="quick-actions">
                        <h2 className="section-title">
                            <span>⚡</span>
                            Quick Actions
                        </h2>
                        <div className="actions-grid">
                            <Link to="/register" className="action-card">
                                <div className="action-header">
                                    <div className="action-icon">➕</div>
                                    <h3 className="action-title">Register New User</h3>
                                </div>
                                <p className="action-description">
                                    Add new occupants, staff members, or assign roles to existing users in the system.
                                </p>
                            </Link>

                            <Link to="/rooms-occupants" className="action-card">
                                <div className="action-header">
                                    <div className="action-icon">🏠</div>
                                    <h3 className="action-title">Manage Rooms</h3>
                                </div>
                                <p className="action-description">
                                    View room assignments, update occupancy status, and manage facility information.
                                </p>
                            </Link>

                            <Link to="/reports" className="action-card">
                                <div className="action-header">
                                    <div className="action-icon">📋</div>
                                    <h3 className="action-title">Review Reports</h3>
                                </div>
                                <p className="action-description">
                                    Check pending violation reports, maintenance requests, and system notifications.
                                </p>
                            </Link>

                            <Link to="/analytics" className="action-card">
                                <div className="action-header">
                                    <div className="action-icon">📊</div>
                                    <h3 className="action-title">View Analytics</h3>
                                </div>
                                <p className="action-description">
                                    Access detailed reports, usage statistics, and system performance metrics.
                                </p>
                            </Link>
                        </div>
                    </section>

                    {/* Recent Activity */}
                    <section className="recent-activity">
                        <div className="activity-header">
                            <h2 className="section-title">
                                <span>🕒</span>
                                Recent Activity
                            </h2>
                        </div>
                        <div className="activity-list">
                            <div className="activity-item">
                                <div className="activity-icon">👤</div>
                                <div className="activity-content">
                                    <p className="activity-text">New user registration: john.doe@email.com</p>
                                    <span className="activity-time">2 minutes ago</span>
                                </div>
                            </div>
                            <div className="activity-item">
                                <div className="activity-icon">🏠</div>
                                <div className="activity-content">
                                    <p className="activity-text">Room A-101 occupancy updated</p>
                                    <span className="activity-time">15 minutes ago</span>
                                </div>
                            </div>
                            <div className="activity-item">
                                <div className="activity-icon">📋</div>
                                <div className="activity-content">
                                    <p className="activity-text">Violation report submitted for Room B-205</p>
                                    <span className="activity-time">1 hour ago</span>
                                </div>
                            </div>
                            <div className="activity-item">
                                <div className="activity-icon">💰</div>
                                <div className="activity-content">
                                    <p className="activity-text">Payment received from tenant in C-302</p>
                                    <span className="activity-time">3 hours ago</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

export default AdminDashboard;
