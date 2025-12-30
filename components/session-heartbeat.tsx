"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function SessionHeartbeat() {
    const pathname = usePathname();

    useEffect(() => {
        // Ping every 2 mins
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                fetch('/api/session/ping', { method: 'POST', keepalive: true }).catch(() => { });
            }
        }, 120 * 1000);

        // Also ping on visibility change (user comes back to tab)
        const onVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetch('/api/session/ping', { method: 'POST', keepalive: true }).catch(() => { });
            }
        };

        window.addEventListener('visibilitychange', onVisibilityChange);

        // Initial ping on mount? Maybe wait a bit to avoid spamming on Nav
        // Let's rely on interval or Login-start for first one.

        return () => {
            clearInterval(interval);
            window.removeEventListener('visibilitychange', onVisibilityChange);
        };
    }, []);

    // Optional: detect nav changes to ping? 
    // Usually not needed if Interval is sufficient.

    return null;
}
