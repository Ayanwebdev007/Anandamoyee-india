import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// Simple generate pseudo-anonymous session ID
const getSessionId = () => {
    let sid = sessionStorage.getItem('an_session_id');
    if (!sid) {
        sid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem('an_session_id', sid);
    }
    return sid;
};

// Simple device detection
const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    let deviceType = 'desktop';
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        deviceType = 'tablet';
    } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        deviceType = 'mobile';
    }

    let os = 'Unknown OS';
    if (ua.indexOf('Win') !== -1) os = 'Windows';
    else if (ua.indexOf('Mac') !== -1) os = 'MacOS';
    else if (ua.indexOf('Linux') !== -1) os = 'Linux';
    else if (ua.indexOf('Android') !== -1) os = 'Android';
    else if (ua.indexOf('like Mac') !== -1) os = 'iOS';

    return { deviceType, os };
};

const useAnalytics = () => {
    const location = useLocation();
    const hasTrackedInitialRender = useRef(false);

    useEffect(() => {
        // Exclude admin routes from tracking to prevent skewed metric data
        if (location.pathname.startsWith('/admin')) {
            return;
        }

        const trackVisit = async () => {
            const { deviceType, os } = getDeviceInfo();
            const sessionId = getSessionId();

            try {
                await fetch('/api/analytics/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionId,
                        path: location.pathname,
                        deviceType,
                        os
                    })
                });
            } catch (err) {
                // Tracking should fail silently
                console.error('Analytics tracking failed:', err);
            }
        };

        // Track every route change
        trackVisit();

    }, [location.pathname]);

    return null;
};

export default useAnalytics;
