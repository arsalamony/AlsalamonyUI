import {
    useCallback,
    useRef,
    useState,
} from "react";
import ConfirmDialog from "@/dialogs/ConfirmDialog";
import { ConfirmDialogContext } from "../contexts/ConfirmDialogContext";


export function ConfirmDialogProvider({ children }) {
    const [state, setState] = useState({
        open: false,
        title: "تأكيد",
        message: "",
        icon: null,
        confirmText: "حذف",
        cancelText: "إلغاء",
        danger: true,
        loading: false,
    });

    // هنخزن resolver بتاع الـ Promise هنا
    const resolverRef = useRef(null);

    const confirm = useCallback((options) => {
        return new Promise((resolve) => {
            resolverRef.current = resolve;

            setState((prev) => ({
                ...prev,
                open: true,
                title: options?.title ?? "تأكيد",
                message: options?.message ?? "",
                icon: options?.icon ?? null,
                confirmText: options?.confirmText ?? "حذف",
                cancelText: options?.cancelText ?? "إلغاء",
                danger: options?.danger ?? true,
                loading: false,
            }));
        });
    }, []);

    const close = useCallback((result) => {
        setState((prev) => ({ ...prev, open: false, loading: false }));
        if (resolverRef.current) {
            resolverRef.current(result);
            resolverRef.current = null;
        }
    }, []);

    const handleClose = () => close(false);
    const handleConfirm = () => close(true);

    return (
        <ConfirmDialogContext.Provider value={{ confirm }}>
            {children}

            <ConfirmDialog
                open={state.open}
                title={state.title}
                message={state.message}
                icon={state.icon}
                confirmText={state.confirmText}
                cancelText={state.cancelText}
                danger={state.danger}
                loading={state.loading}
                onClose={handleClose}
                onConfirm={handleConfirm}
            />
        </ConfirmDialogContext.Provider>
    );
}
