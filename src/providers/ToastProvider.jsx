import { useCallback, useMemo, useRef, useState } from "react";
import { Alert, Snackbar } from "@mui/material";
import { ToastContext } from "../contexts/ToastContext";

export default function ToastProvider({ children }) {
    const timerRef = useRef(null);

    const [toast, setToast] = useState({
        open: false,
        message: "",
        icon: undefined, // ReactNode
        severity: "info", // success | error | warning | info
        duration: 2000,
        anchorOrigin: { vertical: "top", horizontal: "left" }, // غيرها لو تحب
    });

    const showToast = useCallback((options) => {
        const next = {
            open: true,
            message: options?.message ?? "",
            icon: options?.icon, // ممكن تبعت icon
            severity: options?.severity ?? "info",
            duration: options?.duration ?? 2000,
            anchorOrigin: options?.anchorOrigin ?? {
                vertical: "top",
                horizontal: "center",
            },
        };

        // لو فيه toast شغال، اقفله بسرعة وافتح الجديد (عشان ما يضيعش)
        setToast((prev) => ({ ...prev, open: false }));

        // delay بسيط عشان Snackbar يعيد الanimation
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setToast(next), 80);
    }, []);

    const closeToast = useCallback(() => {
        setToast((prev) => ({ ...prev, open: false }));
    }, []);

    const value = useMemo(() => ({ showToast }), [showToast]);

    return (
        <ToastContext.Provider value={value}>
            {children}

            <Snackbar
                open={toast.open}
                onClose={closeToast}
                autoHideDuration={toast.duration}
                // @ts-ignore
                anchorOrigin={toast.anchorOrigin}
                style={{
                    top: 80, // ✅ تنزلها تحت شوية
                }}
            >
                <Alert
                    onClose={closeToast}
                    // @ts-ignore
                    severity={toast.severity}
                    variant="filled"
                    icon={toast.icon} // ✅ icon مخصص
                    sx={{
                        direction: "rtl",

                        minWidth: 420, // ✅ عرض مريح
                        maxWidth: "90vw", // ✅ responsive
                        textAlign: "center",

                        bgcolor: "rgba(11,18,32,0.98)",
                        border: "1px solid rgba(148,163,184,0.30)",
                        color: "#e5e7eb",
                        borderRadius: 2.5,
                        boxShadow: "0 10px 30px rgba(0,0,0,0.45)",

                        "& .MuiAlert-icon": {
                            color: "inherit",
                            fontSize: 26,
                        },

                        "& .MuiAlert-message": {
                            fontSize: 15,
                            fontWeight: 600,
                            lineHeight: 1.7,
                        },
                    }}
                >
                    {toast.message}
                </Alert>
            </Snackbar>
        </ToastContext.Provider>
    );
}
