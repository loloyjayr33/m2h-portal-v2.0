import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

// Lightweight hook to provide current user's role.
// It first checks localStorage (app stores role on login), then falls back to fetching profile from `users` table.
export default function useRole() {
    const [role, setRole] = useState(() => localStorage.getItem('role'));
    const [loading, setLoading] = useState(!role);

    useEffect(() => {
        if (role) return; // already have role
        let mounted = true;
        async function fetchRole() {
            setLoading(true);
            try {
                const { data: userData, error } = await supabase.auth.getUser();
                if (error || !userData?.user) {
                    setRole(null);
                } else {
                    const uid = userData.user.id;
                    const { data, error: e2 } = await supabase.from('users').select('role').eq('id', uid).single();
                    if (!e2 && data?.role) {
                        localStorage.setItem('role', data.role);
                        if (mounted) setRole(data.role);
                    }
                }
            } catch (err) {
                console.warn('useRole error', err.message || err);
            } finally {
                if (mounted) setLoading(false);
            }
        }
        fetchRole();
        return () => { mounted = false };
    }, [role]);

    return { role, loading };
}
