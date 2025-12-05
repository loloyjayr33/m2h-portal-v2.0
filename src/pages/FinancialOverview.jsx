import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import BackButton from '../components/BackButton';
import './FinancialOverview.css';

function FinancialOverview() {
    const [summary, setSummary] = useState({ income: 0, expenses: 0, balance: 0, due: 0 });
    const [transactions, setTransactions] = useState([]);
    const [fromDate, setFromDate] = useState('2025-09-01');
    const [toDate, setToDate] = useState('2025-09-30');

    useEffect(() => {
        // TODO: replace with supabase fetch from payments/transactions tables
        const mockSummary = { income: 85420, expenses: 24500, balance: 60920, due: 7200 };
        const mockTransactions = [
            { id: 1, type: 'Payment', desc: 'Tenant C-302 rent', amount: 3500, date: '2025-09-28', status: 'Paid' },
            { id: 2, type: 'Refund', desc: 'Overcharge refund for B-101', amount: -200, date: '2025-09-27', status: 'Completed' },
            { id: 3, type: 'Payment', desc: 'Online payment A-110', amount: 1800, date: '2025-09-25', status: 'Paid' },
            { id: 4, type: 'Invoice', desc: 'Rent due for D-210', amount: 2500, date: '2025-09-20', status: 'Due' },
        ];
        setSummary(mockSummary);
        setTransactions(mockTransactions);
    }, []);

    const formatCurrency = (val) => {
        const number = Number(val) || 0;
        return number.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' });
    };

    const filteredTransactions = useMemo(() => {
        const from = new Date(fromDate);
        const to = new Date(toDate);
        return transactions.filter((t) => {
            const d = new Date(t.date);
            return d >= from && d <= to;
        });
    }, [transactions, fromDate, toDate]);

    // Tiny sparkline generator from amounts
    const Sparkline = ({ data = [] }) => {
        if (!data.length) return <div className="spark-empty">–</div>;
        const max = Math.max(...data.map(Math.abs));
        const points = data.map((v, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - (Math.abs(v) / max) * 100;
            return `${x},${y}`;
        });
        return (
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="sparkline">
                <polyline points={points.join(' ')} fill="none" stroke="#2e7d32" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    };

    const amounts = filteredTransactions.map((t) => t.amount);

    return (
        <div className="financial-page">
            <header className="financial-header">
                <div>
                    <h1>Financial Overview</h1>
                    <p className="subtitle">Monthly summary, quick actions and recent activity.</p>
                </div>

                <div className="header-actions">
                    <div className="date-filters">
                        <label>
                            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                        </label>
                        <span className="dash">—</span>
                        <label>
                            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                        </label>
                    </div>
                    <div className="action-buttons">
                        <button className="btn secondary">Export CSV</button>
                        <BackButton />
                    </div>
                </div>
            </header>

            <section className="finance-summary">
                <div className="summary-grid">
                    <div className="summary-card income">
                        <div className="card-top">
                            <div className="card-title">Income</div>
                            <div className="card-spark">
                                <Sparkline data={amounts.slice(-8)} />
                            </div>
                        </div>
                        <div className="card-value">{formatCurrency(summary.income)}</div>
                        <div className="card-meta">This month • {formatCurrency(summary.due)} due</div>
                    </div>

                    <div className="summary-card expenses">
                        <div className="card-top">
                            <div className="card-title">Expenses</div>
                            <div className="card-spark">
                                <Sparkline data={amounts.slice(-8).map((a) => -a)} />
                            </div>
                        </div>
                        <div className="card-value">{formatCurrency(summary.expenses)}</div>
                        <div className="card-meta">This month</div>
                    </div>

                    <div className="summary-card balance">
                        <div className="card-top">
                            <div className="card-title">Balance</div>
                            <div className="trend">+8% <span className="trend-sub">vs last month</span></div>
                        </div>
                        <div className="card-value">{formatCurrency(summary.balance)}</div>
                        <div className="card-meta">Available funds</div>
                    </div>
                </div>
            </section>

            <section className="finance-main">
                <div className="chart-panel">
                    <div className="panel-title">Income vs Expenses</div>
                    <div className="chart-placeholder">[Interactive chart placeholder — integrate Chart.js or Recharts]</div>
                </div>

                <aside className="transactions-panel">
                    <div className="panel-title">Recent Transactions</div>
                    <div className="transactions-scroll">
                        <ul className="transactions-list">
                            {filteredTransactions.map((t) => (
                                <li key={t.id} className={`transaction-item ${t.status?.toLowerCase()}`}>
                                    <div className="tx-left">
                                        <div className="tx-type">{t.type}</div>
                                        <div className="tx-desc">{t.desc}</div>
                                    </div>
                                    <div className="tx-right">
                                        <div className="tx-amount">{formatCurrency(t.amount)}</div>
                                        <div className="tx-meta">
                                            <span className={`tx-status {t.status}`}>{t.status}</span>
                                            <span className="tx-date">{t.date}</span>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>
            </section>
        </div>
    );
}

export default FinancialOverview;
