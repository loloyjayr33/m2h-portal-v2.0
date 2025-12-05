import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BackButton.css';

export default function BackButton({ fallback = '/admin', label = 'Back' }) {
    const navigate = useNavigate();
    const goBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate(fallback);
        }
    };

    return (
        <button type="button" className="back-button" onClick={goBack}>
            ← {label}
        </button>
    );
}
