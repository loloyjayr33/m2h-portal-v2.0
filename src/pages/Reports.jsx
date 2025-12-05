import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import './Reports.css';

export default function Reports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedReport, setSelectedReport] = useState(null);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('reports')
                .select(`*, reporter:reporter_id (id, first_name, last_name, email), room:room_id (id, room_number, building)`)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReports(data || []);
        } catch (err) {
            console.error('Error fetching reports', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredReports = reports.filter(r => {
        if (filter !== 'all' && r.status !== filter) return false;
        if (!search) return true;
        const s = search.toLowerCase();
        return (
            (r.title && r.title.toLowerCase().includes(s)) ||
            (r.description && r.description.toLowerCase().includes(s)) ||
            (r.reporter && `${r.reporter.first_name} ${r.reporter.last_name}`.toLowerCase().includes(s)) ||
            (r.room && `${r.room.building} ${r.room.room_number}`.toLowerCase().includes(s))
        );
    });

    const openReport = (report) => {
        setSelectedReport(report);
    };

    const changeStatus = async (reportId, newStatus) => {
        setStatusUpdating(true);
        try {
            const { error } = await supabase.from('reports').update({ status: newStatus }).eq('id', reportId);
            if (error) throw error;
            await fetchReports();
            setSelectedReport(null);
        } catch (err) {
            console.error('Error updating status', err);
            alert('Failed to update status');
        } finally {
            setStatusUpdating(false);
        }
    };

    return (
        <div className="reports-page">
            <header className="reports-header">
                <div className="reports-header-inner">
                    <div>
                        <h1>Reports & Violations</h1>
                        <p>View, filter and manage violation reports and maintenance requests.</p>
                    </div>
                    <div className="reports-actions">
                        <Link to="/admin" className="btn-secondary">Back to Dashboard</Link>
                        <button className="btn-primary" onClick={fetchReports}>Refresh</button>
                    </div>
                </div>
            </header>

            <div className="reports-controls">
                <div className="search-box">
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reports..." />
                </div>
                <div className="filter-box">
                    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="all">All</option>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            <main className="reports-main">
                <div className="reports-list">
                    {loading ? <div className="loading">Loading...</div> : (
                        filteredReports.map(report => (
                            <div key={report.id} className={`report-card ${report.status}`} onClick={() => openReport(report)}>
                                <div className="report-meta">
                                    <div className="report-title">{report.title || 'No Title'}</div>
                                    <div className="report-room">{report.room ? `${report.room.building} ${report.room.room_number}` : 'N/A'}</div>
                                </div>
                                <div className="report-summary">{report.description?.slice(0, 120)}{report.description && report.description.length > 120 ? '...' : ''}</div>
                                <div className="report-footer">
                                    <div className="report-reporter">{report.reporter ? `${report.reporter.first_name} ${report.reporter.last_name}` : 'Anonymous'}</div>
                                    <div className="report-time">{new Date(report.created_at).toLocaleString()}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <aside className="reports-side">
                    {selectedReport ? (
                        <div className="report-detail">
                            <h2>{selectedReport.title}</h2>
                            <p className="report-meta-small">Reported by {selectedReport.reporter ? `${selectedReport.reporter.first_name} ${selectedReport.reporter.last_name}` : 'Anonymous'}</p>
                            <p className="report-meta-small">Location: {selectedReport.room ? `${selectedReport.room.building} ${selectedReport.room.room_number}` : 'N/A'}</p>
                            <div className="report-body">{selectedReport.description}</div>

                            <div className="report-actions">
                                <button className="btn-secondary" onClick={() => setSelectedReport(null)}>Close</button>
                                <button className="btn-primary" disabled={statusUpdating} onClick={() => changeStatus(selectedReport.id, 'in_progress')}>Mark In Progress</button>
                                <button className="btn-primary" disabled={statusUpdating} onClick={() => changeStatus(selectedReport.id, 'resolved')}>Mark Resolved</button>
                                <button className="btn-secondary" disabled={statusUpdating} onClick={() => changeStatus(selectedReport.id, 'rejected')}>Reject</button>
                            </div>
                        </div>
                    ) : (
                        <div className="empty-side">
                            <p>Select a report to view details</p>
                        </div>
                    )}
                </aside>
            </main>
        </div>
    );
}
