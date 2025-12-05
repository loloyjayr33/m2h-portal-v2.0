import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import emailjs from '@emailjs/browser';
import m2hLogo from '../assets/m2h-logo.svg';
import './Register.css';

function Register() {
    const [occupants, setOccupants] = useState([{ email: "", first_name: "", last_name: "" }]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState(""); // success, error, info
    const [configError, setConfigError] = useState("");
    const navigate = useNavigate();

    // Check environment configuration
    useEffect(() => {
        const checkConfig = () => {
            const missingVars = [];

            if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'your_supabase_url_here') {
                missingVars.push('VITE_SUPABASE_URL');
            }
            if (!import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY === 'your_supabase_anon_key_here') {
                missingVars.push('VITE_SUPABASE_ANON_KEY');
            }
            if (!import.meta.env.VITE_EMAILJS_SERVICE_ID || import.meta.env.VITE_EMAILJS_SERVICE_ID === 'your_emailjs_service_id') {
                missingVars.push('VITE_EMAILJS_SERVICE_ID');
            }
            if (!import.meta.env.VITE_EMAILJS_TEMPLATE_ID || import.meta.env.VITE_EMAILJS_TEMPLATE_ID === 'your_emailjs_template_id') {
                missingVars.push('VITE_EMAILJS_TEMPLATE_ID');
            }
            if (!import.meta.env.VITE_EMAILJS_PUBLIC_KEY || import.meta.env.VITE_EMAILJS_PUBLIC_KEY === 'your_emailjs_public_key') {
                missingVars.push('VITE_EMAILJS_PUBLIC_KEY');
            }

            if (missingVars.length > 0) {
                setConfigError(`⚠️ Configuration missing: ${missingVars.join(', ')}. Please update your .env file.`);
            }
        };

        checkConfig();
    }, []);

    // Initialize EmailJS
    useEffect(() => {
        if (import.meta.env.VITE_EMAILJS_PUBLIC_KEY && import.meta.env.VITE_EMAILJS_PUBLIC_KEY !== 'your_emailjs_public_key') {
            emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
        }
    }, []);

    // Generate random password
    const generatePassword = () => {
        return Math.random().toString(36).slice(-8) + "!";
    };

    // Send email with login credentials
    const sendCredentialsEmail = async (email, firstName, lastName, password) => {
        try {
            const templateParams = {
                to_email: email,
                to_name: `${firstName} ${lastName}`,
                user_email: email,
                user_password: password,
                from_name: "M2H Portal Admin"
            };

            await emailjs.send(
                import.meta.env.VITE_EMAILJS_SERVICE_ID,
                import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
                templateParams,
                import.meta.env.VITE_EMAILJS_PUBLIC_KEY
            );

            console.log(`✅ Email sent to ${email}`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to send email to ${email}:`, error);
            return false;
        }
    };

    // Add another occupant row
    const addRow = () => {
        setOccupants([...occupants, { email: "", first_name: "", last_name: "" }]);
    };

    // Remove occupant row
    const removeRow = (index) => {
        if (occupants.length > 1) {
            const updated = occupants.filter((_, i) => i !== index);
            setOccupants(updated);
        }
    };

    // Handle input change with validation
    const handleChange = (index, field, value) => {
        const updated = [...occupants];
        updated[index][field] = value;
        setOccupants(updated);

        // Clear messages when user starts typing
        if (message && messageType === 'error') {
            setMessage("");
            setMessageType("");
        }
    };

    // Validate individual occupant
    const validateOccupant = (occ) => {
        const errors = [];

        if (!occ.first_name.trim()) {
            errors.push("First name is required");
        } else if (occ.first_name.trim().length < 2) {
            errors.push("First name must be at least 2 characters");
        }

        if (!occ.last_name.trim()) {
            errors.push("Last name is required");
        } else if (occ.last_name.trim().length < 2) {
            errors.push("Last name must be at least 2 characters");
        }

        if (!occ.email.trim()) {
            errors.push("Email is required");
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(occ.email)) {
                errors.push("Invalid email format");
            }
        }

        return errors;
    };

    // Check for duplicate emails
    const checkDuplicateEmails = (occupants) => {
        const emails = occupants.map(occ => occ.email.toLowerCase().trim()).filter(email => email);
        const duplicates = emails.filter((email, index) => emails.indexOf(email) !== index);
        return [...new Set(duplicates)];
    };

    // Clear all forms
    const clearAll = () => {
        setOccupants([{ email: "", first_name: "", last_name: "" }]);
        setMessage("");
        setMessageType("");
    };

    // Submit form
    const handleRegister = async () => {
        setLoading(true);
        setMessage("");
        setMessageType("");

        // Check configuration first
        if (configError) {
            setMessage(configError);
            setMessageType("error");
            setLoading(false);
            return;
        }

        // Filter valid occupants
        const validOccupants = occupants.filter(occ =>
            occ.email.trim() && occ.first_name.trim() && occ.last_name.trim()
        );

        if (validOccupants.length === 0) {
            setMessage("Please fill in at least one complete occupant form.");
            setMessageType("error");
            setLoading(false);
            return;
        }

        // Validate each occupant
        let validationErrors = [];
        validOccupants.forEach((occ, index) => {
            const errors = validateOccupant(occ);
            if (errors.length > 0) {
                validationErrors.push(`Occupant ${index + 1}: ${errors.join(', ')}`);
            }
        });

        if (validationErrors.length > 0) {
            setMessage(`Validation errors:\n${validationErrors.join('\n')}`);
            setMessageType("error");
            setLoading(false);
            return;
        }

        // Check for duplicate emails
        const duplicateEmails = checkDuplicateEmails(validOccupants);
        if (duplicateEmails.length > 0) {
            setMessage(`Duplicate email addresses found: ${duplicateEmails.join(', ')}`);
            setMessageType("error");
            setLoading(false);
            return;
        }

        try {
            let successCount = 0;
            let failCount = 0;
            let failedEmails = [];

            for (const occ of validOccupants) {
                const password = generatePassword();

                try {
                    // Step 1: Insert occupant record first
                    const { data: occData, error: occError } = await supabase
                        .from("occupants")
                        .insert([
                            {
                                first_name: occ.first_name.trim(),
                                last_name: occ.last_name.trim(),
                                email: occ.email.toLowerCase().trim(),
                            },
                        ])
                        .select("id")
                        .single();

                    if (occError) {
                        console.error("Occupant error:", occError);
                        if (occError.code === '23505') { // Unique constraint violation
                            failedEmails.push(`${occ.email} (already exists)`);
                        } else {
                            failedEmails.push(`${occ.email} (database error)`);
                        }
                        failCount++;
                        continue;
                    }

                    // Step 2: Create user in Supabase Auth (using regular signup)
                    const { data: authData, error: authError } = await supabase.auth.signUp({
                        email: occ.email.toLowerCase().trim(),
                        password,
                        options: {
                            emailRedirectTo: `${window.location.origin}/login`,
                            data: {
                                first_name: occ.first_name.trim(),
                                last_name: occ.last_name.trim(),
                                role: 'occupant'
                            }
                        }
                    });

                    if (authError) {
                        console.error("Auth error:", authError);
                        // Try to cleanup occupant record
                        await supabase.from("occupants").delete().eq("id", occData.id);

                        if (authError.message.includes('already registered')) {
                            failedEmails.push(`${occ.email} (user already exists)`);
                        } else {
                            failedEmails.push(`${occ.email} (auth error)`);
                        }
                        failCount++;
                        continue;
                    }

                    // Step 3: Insert into users table
                    const { error: userError } = await supabase.from("users").insert([
                        {
                            id: authData.user?.id,
                            email: occ.email.toLowerCase().trim(),
                            role: "occupant",
                            occupant_id: occData.id,
                            status: "active",
                        },
                    ]);

                    if (userError) {
                        console.error("User table error:", userError);
                        // Continue anyway as the main auth user was created
                    }

                    // Step 4: Send email with login credentials
                    const emailSent = await sendCredentialsEmail(
                        occ.email,
                        occ.first_name,
                        occ.last_name,
                        password
                    );

                    if (emailSent) {
                        console.log(`✅ Account created and email sent to ${occ.email}`);
                        successCount++;
                    } else {
                        console.log(`⚠️ Account created for ${occ.email}, but email failed to send. Password: ${password}`);
                        successCount++;
                    }

                } catch (individualError) {
                    console.error(`Error creating account for ${occ.email}:`, individualError);
                    failCount++;
                    failedEmails.push(`${occ.email} (unexpected error)`);
                }
            }

            // Display results
            if (successCount > 0) {
                setMessage(`✅ Successfully created ${successCount} account(s)! Login credentials have been sent to email addresses.`);
                setMessageType("success");
                // Clear forms on success
                setTimeout(() => {
                    clearAll();
                }, 3000);
            }

            if (failCount > 0) {
                const failedEmailsList = failedEmails.length > 0 ? `\nFailed: ${failedEmails.join(', ')}` : '';
                const currentMessage = successCount > 0 ? message : '';
                setMessage(currentMessage + ` ${failCount} account(s) failed to create.${failedEmailsList}`);
                setMessageType(successCount > 0 ? "warning" : "error");
            }

        } catch (err) {
            console.error("Registration error:", err);
            setMessage("❌ Error creating accounts. Please check your connection and try again.");
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">
            {/* Background Elements */}
            <div className="background-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
            </div>

            {/* Navigation Header */}
            <nav className="register-nav">
                <Link to="/" className="nav-logo">
                    <img src={m2hLogo} alt="M2H Logo" className="logo-image" />
                    <span className="logo-text">M2H Portal</span>
                </Link>
                <button className="nav-link" onClick={() => navigate(-1)}>
                    <span className="nav-icon">🏠</span>
                    Back
                </button>
            </nav>

            {/* Main Content */}
            <div className="register-container">
                <div className="register-card">
                    {/* Header Section */}
                    <div className="register-header">
                        <div className="header-icon">
                            <span className="icon">👥</span>
                        </div>
                        <h1 className="register-title">Register Occupants</h1>
                        <p className="register-subtitle">
                            Add new occupants to the M2H Portal system. Login credentials will be automatically generated and sent via email.
                        </p>
                    </div>

                    {/* Configuration Warning */}
                    {configError && (
                        <div className="message-alert error">
                            <span className="message-icon">⚙️</span>
                            <span className="message-text">{configError}</span>
                        </div>
                    )}

                    {/* Message Display */}
                    {message && (
                        <div className={`message-alert ${messageType}`}>
                            <span className="message-icon">
                                {messageType === 'success' ? '✅' :
                                    messageType === 'error' ? '❌' :
                                        messageType === 'warning' ? '⚠️' : 'ℹ️'}
                            </span>
                            <span className="message-text" style={{ whiteSpace: 'pre-line' }}>{message}</span>
                        </div>
                    )}

                    {/* Form Section */}
                    <div className="register-form">
                        <div className="form-header">
                            <h3 className="form-title">
                                <span className="form-icon">📝</span>
                                Occupant Details
                            </h3>
                            <div className="form-actions">
                                <button
                                    type="button"
                                    onClick={clearAll}
                                    className="btn-secondary"
                                    disabled={loading}
                                >
                                    <span className="btn-icon">🗑️</span>
                                    Clear All
                                </button>
                            </div>
                        </div>

                        <div className="occupants-list">
                            {occupants.map((occ, index) => (
                                <div key={index} className="occupant-form">
                                    <div className="form-row">
                                        <div className="occupant-number">
                                            <span className="number-badge">{index + 1}</span>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">First Name</label>
                                            <input
                                                type="text"
                                                placeholder="Enter first name"
                                                value={occ.first_name}
                                                onChange={(e) => handleChange(index, "first_name", e.target.value)}
                                                className="form-input"
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Last Name</label>
                                            <input
                                                type="text"
                                                placeholder="Enter last name"
                                                value={occ.last_name}
                                                onChange={(e) => handleChange(index, "last_name", e.target.value)}
                                                className="form-input"
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Email Address</label>
                                            <input
                                                type="email"
                                                placeholder="Enter email address"
                                                value={occ.email}
                                                onChange={(e) => handleChange(index, "email", e.target.value)}
                                                className="form-input"
                                                disabled={loading}
                                            />
                                        </div>
                                        {occupants.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeRow(index)}
                                                className="remove-btn"
                                                disabled={loading}
                                                title="Remove this occupant"
                                            >
                                                <span className="remove-icon">✕</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="form-actions-row">
                            <button
                                type="button"
                                onClick={addRow}
                                className="btn-add"
                                disabled={loading}
                            >
                                <span className="btn-icon">➕</span>
                                Add Another Occupant
                            </button>
                        </div>

                        {/* Submit Section */}
                        <div className="submit-section">
                            <div className="submit-info">
                                <div className="info-item">
                                    <span className="info-icon">🔐</span>
                                    <span className="info-text">Secure passwords will be auto-generated</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-icon">📧</span>
                                    <span className="info-text">Login credentials sent via email</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-icon">✅</span>
                                    <span className="info-text">Accounts activated immediately</span>
                                </div>
                            </div>

                            <div className="submit-buttons">
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="btn-cancel"
                                    disabled={loading}
                                >
                                    <span className="btn-icon">⬅️</span>
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleRegister}
                                    className="btn-submit"
                                    disabled={loading || configError}
                                >
                                    {loading ? (
                                        <>
                                            <span className="loading-spinner"></span>
                                            Creating Accounts...
                                        </>
                                    ) : configError ? (
                                        <>
                                            <span className="btn-icon">⚙️</span>
                                            Configuration Required
                                        </>
                                    ) : (
                                        <>
                                            <span className="btn-icon">🚀</span>
                                            Create {occupants.filter(occ => occ.email.trim() && occ.first_name.trim() && occ.last_name.trim()).length} Account{occupants.filter(occ => occ.email.trim() && occ.first_name.trim() && occ.last_name.trim()).length !== 1 ? 's' : ''}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
