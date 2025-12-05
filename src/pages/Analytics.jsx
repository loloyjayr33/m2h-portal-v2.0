import { useEffect, useState } from 'react';
import BackButton from '../components/BackButton';
import './Analytics.css';

function Analytics() {
    const [range, setRange] = useState('30');
    const [metrics, setMetrics] = useState({ users: 0, revenue: 0, reports: 0, occupancy: 0 });
    const [events, setEvents] = useState([]);

    useEffect(() => {
        // Mock load - replace with Supabase queries for real data
        setMetrics({ users: 152, revenue: 85420, reports: 23, occupancy: 88 });
        setEvents([
            { id: 1, label: 'New user signups', value: 12, date: '2025-09-28' },
            { id: 2, label: 'Payments processed', value: 24, date: '2025-09-27' },
            { id: 3, label: 'Reports filed', value: 5, date: '2025-09-25' },
        ]);
    }, []);

    const fmt = (n) => n.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' });

    return (
        <div className="analytics-page">
            <header className="analytics-header">
                <div>
                    <h1>Analytics</h1>
                    <p className="subtitle">Overview of system metrics and recent trends.</p>
                </div>
                <div className="analytics-actions">
                    <label className="small-select">
                        Range
                        <select value={range} onChange={(e) => setRange(e.target.value)}>
                            <option value="7">7 days</option>
                            <option value="30">30 days</option>
                            <option value="90">90 days</option>
                        </select>
                    </label>
                    <BackButton label="Back" />
                </div>
            </header>

            <section className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-title">Users</div>
                    <div className="metric-value">{metrics.users}</div>
                </div>
                <div className="metric-card">
                    <div className="metric-title">Revenue</div>
                    <div className="metric-value">{fmt(metrics.revenue)}</div>
                </div>
                <div className="metric-card">
                    <div className="metric-title">Reports</div>
                    <div className="metric-value">{metrics.reports}</div>
                </div>
                <div className="metric-card">
                    <div className="metric-title">Occupancy</div>
                    <div className="metric-value">{metrics.occupancy}%</div>
                </div>
            </section>

            <section className="analytics-main">
                <div className="chart-glass">
                    <div className="panel-title">Activity chart (placeholder)</div>
                    <div className="chart-area">[Chart goes here]</div>
                </div>

                <aside className="events-panel">
                    <div className="panel-title">Recent events</div>
                    <ul className="events-list">
                        {events.map((e) => (
                            <li key={e.id} className="event-item">
                                <div className="event-left">
                                    <div className="event-label">{e.label}</div>
                                    <div className="event-date">{e.date}</div>
                                </div>
                                <div className="event-value">{e.value}</div>
                            </li>
                        ))}
                    </ul>
                </aside>
            </section>
        </div>
    );
}

export default Analytics;
