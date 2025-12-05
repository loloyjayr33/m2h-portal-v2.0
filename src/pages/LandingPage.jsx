import { Link } from 'react-router-dom';
import './LandingPage.css';
import m2hLogo from '../assets/m2h-logo.svg';

function LandingPage() {
    return (
        <div className="landing-page">
            {/* Navigation Header */}
            <nav className="navbar">
                <div className="nav-container">
                    <div className="nav-logo">
                        <img src={m2hLogo} alt="M2H Logo" className="nav-logo-image" />
                        <h2>M2H Portal</h2>
                    </div>
                    <div className="nav-links">
                        <Link to="/login" className="nav-button">Login</Link>
                        <Link to="/login" className="nav-button">Get Started</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-container">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Welcome to <span className="highlight">M2H Portal</span>
                        </h1>
                        <p className="hero-description">
                            Your comprehensive management portal for seamless administration,
                            efficient operations, and enhanced user experience. Access all your
                            essential tools and services in one secure platform.
                        </p>
                        <div className="hero-buttons">
                            <Link to="/login" className="btn-primary">
                                Access Portal
                            </Link>
                            <button className="btn-secondary">
                                Learn More
                            </button>
                        </div>
                    </div>
                    <div className="hero-image">
                        <div className="hero-graphic">
                            <div className="floating-card card-1">
                                <div className="card-icon">📊</div>
                                <span>Analytics</span>
                            </div>
                            <div className="floating-card card-2">
                                <div className="card-icon">🏠</div>
                                <span>Properties</span>
                            </div>
                            <div className="floating-card card-3">
                                <div className="card-icon">👥</div>
                                <span>Users</span>
                            </div>
                            <div className="floating-card card-4">
                                <div className="card-icon">💰</div>
                                <span>Finance</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <div className="features-container">
                    <div className="section-header">
                        <h2>Powerful Features</h2>
                        <p>Everything you need to manage your operations efficiently</p>
                    </div>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">
                                <div className="icon-circle">👨‍💼</div>
                            </div>
                            <h3>Admin Dashboard</h3>
                            <p>Complete administrative control with comprehensive management tools and system oversight capabilities.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <div className="icon-circle">🏢</div>
                            </div>
                            <h3>Property Management</h3>
                            <p>Streamlined property administration with occupant management and facility oversight features.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <div className="icon-circle">💳</div>
                            </div>
                            <h3>Financial Tracking</h3>
                            <p>Advanced treasury management with detailed financial reporting and payment processing.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <div className="icon-circle">📱</div>
                            </div>
                            <h3>User Portal</h3>
                            <p>Intuitive user interface designed for occupants with easy access to essential services.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats">
                <div className="stats-container">
                    <div className="stat-item">
                        <div className="stat-number">500+</div>
                        <div className="stat-label">Active Users</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">50+</div>
                        <div className="stat-label">Properties</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">99.9%</div>
                        <div className="stat-label">Uptime</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">24/7</div>
                        <div className="stat-label">Support</div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta">
                <div className="cta-container">
                    <div className="cta-content">
                        <h2>Ready to Get Started?</h2>
                        <p>Join thousands of users who trust M2H Portal for their management needs.</p>
                        <Link to="/login" className="cta-button">
                            Access Your Portal Now
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-container">
                    <div className="footer-content">
                        <div className="footer-section">
                            <h3>M2H Portal</h3>
                            <p>Your trusted management solution for modern operations.</p>
                        </div>
                        <div className="footer-section">
                            <h4>Quick Links</h4>
                            <ul>
                                <li><Link to="/login">Login</Link></li>
                                <li><a href="#features">Features</a></li>
                                <li><a href="#contact">Contact</a></li>
                            </ul>
                        </div>
                        <div className="footer-section">
                            <h4>Support</h4>
                            <ul>
                                <li><a href="#help">Help Center</a></li>
                                <li><a href="#docs">Documentation</a></li>
                                <li><a href="#contact">Contact Us</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; 2024 M2H Portal. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;