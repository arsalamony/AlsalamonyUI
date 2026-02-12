import { useEffect, useMemo, useRef, useState } from "react";
import { updateUserLocation } from "../api/user.api"; // عدّل المسار
import { UserLocationContext } from "../contexts/UserLocationContext";

function hasToken() {
    // عدّل اسم التخزين عندك (token / accessToken)
    return Boolean(
        localStorage.getItem("token") || localStorage.getItem("accessToken"),
    );
}

export function UserLocationProvider({ children, intervalMs = 60_000 }) {
    const [state, setState] = useState({
        latitude: null,
        longitude: null,
        lastSentAt: null,
        status: "idle", // idle | running | denied | unsupported | error
        error: null,
    });

    const timerRef = useRef(null);
    const inFlightRef = useRef(false);
    const stoppedRef = useRef(false);
    const lastCoordsRef = useRef({ lat: null, lng: null });

    const stop = () => {
        stoppedRef.current = true;
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const readGpsOnce = () =>
        new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("GeolocationUnsupported"));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    resolve({
                        latitude: pos.coords?.latitude ?? null,
                        longitude: pos.coords?.longitude ?? null,
                    });
                },
                (err) => reject(err),
                {
                    enableHighAccuracy: false,
                    timeout: 10_000,
                    maximumAge: 30_000,
                },
            );
        });

    const tick = async () => {
        // شروط تشغيل
        if (stoppedRef.current) return;
        if (!hasToken()) return;

        // قلل طلبات وانت برا التبويب
        if (document.visibilityState === "hidden") return;

        if (inFlightRef.current) return;
        inFlightRef.current = true;

        try {
            setState((s) => ({ ...s, status: "running", error: null }));

            const { latitude, longitude } = await readGpsOnce();

            // لو مفيش coords (نادر) ابعتها null
            const lat = typeof latitude === "number" ? latitude : null;
            const lng = typeof longitude === "number" ? longitude : null;

            // ✅ منع تكرار الإرسال لو نفس الإحداثيات تقريبًا
            const prev = lastCoordsRef.current;
            const same =
                prev.lat != null &&
                prev.lng != null &&
                lat != null &&
                lng != null &&
                Math.abs(prev.lat - lat) < 0.00001 &&
                Math.abs(prev.lng - lng) < 0.00001;

            if (!same) {
                await updateUserLocation({ latitude: lat, longitude: lng });
                lastCoordsRef.current = { lat, lng };
                setState((s) => ({
                    ...s,
                    latitude: lat,
                    longitude: lng,
                    lastSentAt: new Date(),
                    status: "running",
                    error: null,
                }));
            } else {
                // نفس المكان، اعتبره ناجح بدون إرسال
                setState((s) => ({
                    ...s,
                    latitude: lat,
                    longitude: lng,
                    lastSentAt: s.lastSentAt ?? new Date(),
                    status: "running",
                    error: null,
                }));
            }
        } catch (err) {
            // لو رفض صلاحية الموقع: وقف نهائيًا (عشان متكرر كل دقيقة)
            const code = err?.code; // 1 denied, 2 unavailable, 3 timeout
            if (String(err?.message) === "GeolocationUnsupported") {
                setState((s) => ({
                    ...s,
                    status: "unsupported",
                    error: "المتصفح لا يدعم تحديد الموقع",
                }));
                stop();
            } else if (code === 1) {
                setState((s) => ({
                    ...s,
                    status: "denied",
                    error: "تم رفض صلاحية الموقع",
                }));
                stop();
            } else {
                setState((s) => ({
                    ...s,
                    status: "error",
                    error: "فشل تحديد/إرسال الموقع",
                }));
                // هنا مش بنوقف، ممكن تكون مشكلة مؤقتة
            }
        } finally {
            inFlightRef.current = false;
        }
    };

    useEffect(() => {
        stoppedRef.current = false;

        // شغّل مرة فورًا
        tick();

        // وبعدها كل دقيقة
        timerRef.current = setInterval(() => {
            tick();
        }, intervalMs);

        return () => stop();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [intervalMs]);

    const value = useMemo(() => ({ ...state }), [state]);

    return (
        <UserLocationContext.Provider value={value}>
            {children}
        </UserLocationContext.Provider>
    );
}
