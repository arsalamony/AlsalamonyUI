import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Stack,
    Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function ConfirmDialog({
    open,
    title = "تأكيد",
    message,
    icon,
    confirmText = "حذف",
    cancelText = "إلغاء",
    onConfirm,
    onClose,
    loading = false,
    danger = true, // لو true نخلي زر التأكيد باللون الأحمر
}) {
    return (
        <Dialog
            open={open}
            onClose={loading ? undefined : onClose}
            fullWidth
            maxWidth="xs"
            PaperProps={{
                sx: {
                    direction: "rtl",
                    bgcolor: "#0b1220",
                    border: "1px solid #1e293b",
                    borderRadius: 3,
                    boxShadow: "none",
                },
            }}
        >
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ fontWeight: 800, flex: 1 }}>
                    {title}
                </Typography>

                <IconButton
                    onClick={onClose}
                    disabled={loading}
                    sx={{
                        color: "text.secondary",
                        bgcolor: "rgba(148,163,184,0.06)",
                        border: "1px solid rgba(148,163,184,0.12)",
                        "&:hover": { bgcolor: "rgba(148,163,184,0.10)" },
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <Divider sx={{ borderColor: "#1e293b" }} />

            <DialogContent sx={{ pt: 2 }}>
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    {/* Icon */}
                    {icon ? (
                        <Box
                            sx={{
                                width: 44,
                                height: 44,
                                borderRadius: 2,
                                display: "grid",
                                placeItems: "center",
                                bgcolor: danger
                                    ? "rgba(239,68,68,0.12)"
                                    : "rgba(56,189,248,0.12)",
                                border: danger
                                    ? "1px solid rgba(239,68,68,0.25)"
                                    : "1px solid rgba(56,189,248,0.25)",
                                color: danger ? "#ef4444" : "#38bdf8",
                                flexShrink: 0,
                            }}
                        >
                            {icon}
                        </Box>
                    ) : null}

                    <Typography sx={{ color: "#e5e7eb", lineHeight: 1.8 }}>
                        {message}
                    </Typography>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button
                    onClick={onClose}
                    disabled={loading}
                    variant="outlined"
                    sx={{
                        borderColor: "rgba(148,163,184,0.25)",
                        color: "#e5e7eb",
                        borderRadius: 2,
                        "&:hover": { borderColor: "rgba(56,189,248,0.35)" },
                    }}
                >
                    {cancelText}
                </Button>

                <Button
                    onClick={onConfirm}
                    disabled={loading}
                    variant="contained"
                    sx={{
                        borderRadius: 2,
                        fontWeight: 800,
                        bgcolor: danger
                            ? "rgba(239,68,68,0.18)"
                            : "rgba(56,189,248,0.18)",
                        border: danger
                            ? "1px solid rgba(239,68,68,0.30)"
                            : "1px solid rgba(56,189,248,0.30)",
                        color: "#e5e7eb",
                        "&:hover": {
                            bgcolor: danger
                                ? "rgba(239,68,68,0.26)"
                                : "rgba(56,189,248,0.26)",
                        },
                        "&.Mui-disabled": {
                            opacity: 0.6,
                            color: "#e5e7eb",
                        },
                    }}
                >
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
