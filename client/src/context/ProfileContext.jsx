import React, { createContext, useContext, useState, useEffect } from 'react';

const ProfileContext = createContext();

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load profile from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('anandamoyee_profile');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Verify profile still exists in DB
                fetch(`/api/profile/${parsed._id}`)
                    .then(res => res.ok ? res.json() : Promise.reject())
                    .then(data => {
                        setProfile(data.profile);
                        localStorage.setItem('anandamoyee_profile', JSON.stringify(data.profile));
                    })
                    .catch(() => {
                        // Profile deleted or invalid
                        localStorage.removeItem('anandamoyee_profile');
                        setProfile(null);
                    })
                    .finally(() => setLoading(false));
            } catch {
                localStorage.removeItem('anandamoyee_profile');
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, []);

    // Login: call after OTP is verified
    const login = async (phone) => {
        const res = await fetch('/api/profile/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone })
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message);
        }
        const { profile: p } = await res.json();
        setProfile(p);
        localStorage.setItem('anandamoyee_profile', JSON.stringify(p));
        return p;
    };

    // Update phone: call after OTP verified for new number
    const updatePhone = async (newPhone) => {
        if (!profile) throw new Error('Not logged in');
        const res = await fetch(`/api/profile/${profile._id}/phone`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newPhone })
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message);
        }
        const { profile: p } = await res.json();
        setProfile(p);
        localStorage.setItem('anandamoyee_profile', JSON.stringify(p));
        return p;
    };

    const logout = () => {
        setProfile(null);
        localStorage.removeItem('anandamoyee_profile');
    };

    const isLoggedIn = !!profile;

    return (
        <ProfileContext.Provider value={{ profile, isLoggedIn, loading, login, updatePhone, logout }}>
            {children}
        </ProfileContext.Provider>
    );
};
