// src/pages/Tasks/TaskDetailsDialog.jsx
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Divider,
    IconButton,
    Stack,
    Chip,
    CircularProgress,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import BlockIcon from "@mui/icons-material/Block";

import {
    btnOutlineSx,
    btnSaveSx,
    closeBtnSx,
    dialogPaperSx,
} from "../../Comps/SomeAttrs";

function fmt(d) {
    if (!d) return "—";
    try {
        return new Date(d).toLocaleString("ar-EG");
    } catch {
        return String(d);
    }
}

export default function TaskDetailsDialog({
    open,
    onClose,
    task,
    isAdmin,
    onComplete,
    onCancel,
    onDelete,
    loading = false,
}) {
    if (!task) return null;

    return (
        <Dialog
            open={open}
            onClose={loading ? undefined : onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{ sx: dialogPaperSx }}
        >
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 900 }}>
                        تفاصيل المهمة
                    </Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                        #{task.taskId} — {task.name}
                    </Typography>
                </Box>

                <IconButton
                    onClick={onClose}
                    disabled={loading}
                    sx={closeBtnSx}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <Divider sx={{ borderColor: "#1e293b" }} />

            <DialogContent sx={{ pt: 2 }}>
                <Stack spacing={1.2}>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Chip
                            label={`الأولوية: ${task.priority}`}
                            sx={{
                                bgcolor: "rgba(56,189,248,0.10)",
                                border: "1px solid rgba(56,189,248,0.22)",
                                color: "#e5e7eb",
                            }}
                        />
                        <Chip
                            label={`الحالة: ${task.status}`}
                            sx={{
                                bgcolor: "rgba(34,197,94,0.10)",
                                border: "1px solid rgba(34,197,94,0.22)",
                                color: "#e5e7eb",
                            }}
                        />
                        <Chip
                            label={`العنوان: ${task.addressName}`}
                            sx={{
                                bgcolor: "rgba(148,163,184,0.08)",
                                border: "1px solid rgba(148,163,184,0.18)",
                                color: "#e5e7eb",
                            }}
                        />
                    </Stack>

                    <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                        <b style={{ color: "#e5e7eb" }}>AssignedTo:</b>{" "}
                        {task.assignedTo
                            ? `${task.assignedTo} (#${task.assignedToUserId})`
                            : "—"}
                    </Typography>

                    <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                        <b style={{ color: "#e5e7eb" }}>Created:</b>{" "}
                        {fmt(task.createdAt)} — بواسطة {task.createdBy} (#
                        {task.createdByUserId})
                    </Typography>

                    <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                        <b style={{ color: "#e5e7eb" }}>Updated:</b>{" "}
                        {fmt(task.updatedAt)}
                    </Typography>

                    <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                        <b style={{ color: "#e5e7eb" }}>Completed:</b>{" "}
                        {fmt(task.completedAt)}{" "}
                        {task.completedBy
                            ? `— بواسطة ${task.completedBy} (#${task.completedByUserId})`
                            : ""}
                    </Typography>

                    {task.notes ? (
                        <Box
                            sx={{
                                mt: 1,
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: "rgba(148,163,184,0.06)",
                                border: "1px solid rgba(148,163,184,0.14)",
                            }}
                        >
                            <Typography sx={{ fontWeight: 800, mb: 0.5 }}>
                                ملاحظات
                            </Typography>
                            <Typography
                                sx={{ color: "#e5e7eb", lineHeight: 1.9 }}
                            >
                                {task.notes}
                            </Typography>
                        </Box>
                    ) : null}
                </Stack>
            </DialogContent>

            <Divider sx={{ borderColor: "#1e293b" }} />

            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={btnOutlineSx}
                    disabled={loading}
                >
                    إغلاق
                </Button>

                <Box sx={{ flex: 1 }} />

                <Button
                    onClick={() => onComplete?.(task)}
                    variant="contained"
                    startIcon={
                        loading ? (
                            <CircularProgress size={16} />
                        ) : (
                            <DoneAllIcon />
                        )
                    }
                    disabled={loading}
                    sx={{
                        ...btnSaveSx,
                        bgcolor: "rgba(34,197,94,0.16)",
                        border: "1px solid rgba(34,197,94,0.30)",
                        "&:hover": { bgcolor: "rgba(34,197,94,0.24)" },
                    }}
                >
                    تمت
                </Button>

                <Button
                    onClick={() => onCancel?.(task)}
                    variant="contained"
                    startIcon={<BlockIcon />}
                    disabled={loading}
                    sx={{
                        borderRadius: 2,
                        fontWeight: 900,
                        bgcolor: "rgba(245,158,11,0.16)",
                        border: "1px solid rgba(245,158,11,0.30)",
                        color: "#e5e7eb",
                        "&:hover": { bgcolor: "rgba(245,158,11,0.24)" },
                    }}
                >
                    إلغاء
                </Button>

                {isAdmin && (
                    <Button
                        onClick={() => onDelete?.(task)}
                        variant="contained"
                        startIcon={<DeleteOutlineIcon />}
                        disabled={loading}
                        sx={{
                            borderRadius: 2,
                            fontWeight: 900,
                            bgcolor: "rgba(239,68,68,0.18)",
                            border: "1px solid rgba(239,68,68,0.30)",
                            color: "#e5e7eb",
                            "&:hover": { bgcolor: "rgba(239,68,68,0.26)" },
                        }}
                    >
                        حذف
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}
