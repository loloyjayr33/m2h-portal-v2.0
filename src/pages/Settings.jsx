import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import './Settings.css';

function Settings() {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState({ full_name: '', phone: '', notifications: true });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const { data: userData, error: userErr } = await supabase.auth.getUser();
            if (userErr) {
                setMessage({ type: 'error', text: 'Unable to load user.' });
                setLoading(false);
                return;
            }
            setUser(userData.user || null);

            // Try loading profile row from `profiles` table (convention)
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('full_name, phone, notifications')
                    .eq('id', userData.user.id)
                    .single();
                if (!error && data) {
                    setProfile({ full_name: data.full_name || '', phone: data.phone || '', notifications: !!data.notifications });
                }
            } catch (err) {
                // ignore - fallback to empty profile
            }

            setLoading(false);
        };
        load();
    }, []);

    const handleProfileSave = async (e) => {
        e.preventDefault();
        setMessage(null);
        if (!user) return setMessage({ type: 'error', text: 'Not logged in.' });

        // Upsert into profiles table
        const payload = { id: user.id, full_name: profile.full_name, phone: profile.phone, notifications: profile.notifications };
        const { error } = await supabase.from('profiles').upsert(payload);
        if (error) return setMessage({ type: 'error', text: error.message });
        setMessage({ type: 'success', text: 'Profile saved.' });
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setMessage(null);
        if (!password || password !== confirmPassword) return setMessage({ type: 'error', text: 'Passwords do not match.' });
        const { data, error } = await supabase.auth.updateUser({ password });
        if (error) return setMessage({ type: 'error', text: error.message });
        setPassword('');
        setConfirmPassword('');
        setMessage({ type: 'success', text: 'Password updated successfully.' });
    };

    const toggleNotification = async () => {
        const newVal = !profile.notifications;
        setProfile((p) => ({ ...p, notifications: newVal }));
        if (!user) return;
        await supabase.from('profiles').upsert({ id: user.id, notifications: newVal });
    };

    const handleDeleteAccount = async () => {
        // Soft-safety: ask user to confirm in UI; here we provide a wireframe function
        if (!confirm('Delete your account? This cannot be undone from the UI.')) return;
        // Supabase does not support client-side account deletion without verifying security rules; redirect to contact support
        setMessage({ type: 'info', text: 'Contact system administrator to fully remove accounts.' });
    };

    if (loading) return <div className="settings-page"><p>Loading...</p></div>;

    return (
        <div className="settings-page">
            <header className="settings-header">
                <div>
                    <h1>Settings</h1>
                    <p className="subtitle">Manage profile, security and notification preferences.</p>
                </div>
                <BackButton />
            </header>

            {message && <div className={`settings-alert ${message.type}`}>{message.text}</div>}

            <div className="settings-grid">
                <section className="card profile-card">
                    <h2>Profile</h2>
                    <form onSubmit={handleProfileSave} className="form">
                        <label>
                            Full name
                            <input value={profile.full_name} onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))} />
                        </label>
                        <label>
                            Email
                            <input value={user?.email || ''} disabled />
                        </label>
                        <label>
                            Phone
                            <input value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
                        </label>
                        <div className="form-row">
                            <button className="btn" type="submit">Save profile</button>
                            <button className="btn secondary" type="button" onClick={() => navigate('/admin')}><BackButton label="Cancel" /></button>
                        </div>
                    </form>
                </section>

                <section className="card security-card">
                    <h2>Security</h2>
                    <form onSubmit={handleChangePassword} className="form">
                        <label>
                            New password
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </label>
                        <label>
                            Confirm password
                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        </label>
                        <div className="form-row">
                            <button className="btn" type="submit">Change password</button>
                        </div>
                    </form>
                    <hr />
                    <div className="danger-zone">
                        <h3>Danger Zone</h3>
                        <p>Delete your account permanently.</p>
                        <button className="btn danger" onClick={handleDeleteAccount}>Delete account</button>
                    </div>
                </section>

                <section className="card notifications-card">
                    <h2>Notifications</h2>
                    <div className="notif-row">
                        <label className="switch">
                            <input type="checkbox" checked={profile.notifications} onChange={toggleNotification} />
                            <span className="slider" />
                        </label>
                        <div>
                            <div className="notif-title">Email notifications</div>
                            <div className="notif-desc">Receive email alerts for payments and reports.</div>
                        </div>
                    </div>

                    <div className="payment-settings">
                        <h3>Payment Settings</h3>
                        <p>Manage invoicing and payment providers. (Placeholder)</p>
                        <button className="btn secondary">Connect payment provider</button>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default Settings;
