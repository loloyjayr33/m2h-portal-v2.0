import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import BackButton from "../components/BackButton";
import './TreasurerDashboard.css';

function TreasurerDashboard() {
    const [user, setUser] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState({ collected: 85420, outstanding: 12400, fines: 3200 });
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

        // mock transactions - replace with real supabase query
        setTransactions([
            { id: 1, date: '2025-09-30', reference: 'PAY-00123', payer: 'A-101', amount: 2500 },
            { id: 2, date: '2025-09-28', reference: 'PAY-00122', payer: 'C-302', amount: 3000 },
            { id: 3, date: '2025-09-27', reference: 'PAY-00121', payer: 'B-205', amount: 2000 },
        ]);
    }, [navigate]);

    const fmt = (v) => v.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' });

    return (
        <div className="tre-dashboard">
            <header className="tre-header">
                <div>
                    <h1>Treasurer</h1>
                    <p className="subtitle">Payments, balances, and financial controls.</p>
                </div>
                <div className="tre-actions">
                    <BackButton />
                </div>
            </header>

            <section className="tre-summary">
                <div className="card collected">
                    <div className="card-title">Collected (Month)</div>
                    <div className="card-value">{fmt(summary.collected)}</div>
                </div>
                <div className="card outstanding">
                    <div className="card-title">Outstanding</div>
                    <div className="card-value">{fmt(summary.outstanding)}</div>
                </div>
                <div className="card fines">
                    <div className="card-title">Fines</div>
                    <div className="card-value">{fmt(summary.fines)}</div>
                </div>
                <div className="card actions">
                    <div className="card-title">Quick</div>
                    <div className="card-value actions-list">
                        <Link to="/finance" className="quick-link">View Financial Overview</Link>
                        <a className="quick-link" href="#export">Export CSV</a>
                    </div>
                </div>
            </section>

            <section className="tre-transactions">
                <h2>Recent Transactions</h2>
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Reference</th>
                                <th>Payer</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(t => (
                                <tr key={t.id}>
                                    <td>{t.date}</td>
                                    <td>{t.reference}</td>
                                    <td>{t.payer}</td>
                                    <td>{fmt(t.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

export default TreasurerDashboard;
