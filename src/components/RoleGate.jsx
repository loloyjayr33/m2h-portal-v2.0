import React from 'react';
import useRole from '../hooks/useRole';

export default function RoleGate({ allowed = [], children, fallback = null }) {
    const { role, loading } = useRole();

    if (loading) return null; // or show a small skeleton
    if (!role) return fallback;
    if (allowed.includes(role)) return <>{children}</>;
    return fallback;
}
