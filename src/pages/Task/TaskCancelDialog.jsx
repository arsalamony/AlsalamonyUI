// src/pages/Tasks/TaskCancelDialog.jsx
import { useEffect, useMemo, useState } from "react";
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
    TextField,
    InputAdornment,
    CircularProgress,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import NotesIcon from "@mui/icons-material/Notes";
import BlockIcon from "@mui/icons-material/Block";

import { btnOutlineSx, inputSx } from "../../Comps/SomeAttrs";

const dialogPaperSx = {
    direction: "rtl",
    bgcolor: "#0b1220",
    border: "1px solid #1e293b",
    borderRadius: 3,
    boxShadow: "none",
};

const closeBtnSx = {
    color: "text.secondary",
    bgcolor: "rgba(148,163,184,0.06)",
    border: "1px solid rgba(148,163,184,0.12)",
    "&:hover": { bgcolor: "rgba(148,163,184,0.10)" },
};

export default function TaskCancelDialog({
    open,
    onClose,
    task,
    loading = false,
    onSubmit, // (notes) => Promise<void>
}) {
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (!open) return;
    }, [open]);

    const error = useMemo(() => {
        if (!notes.trim()) return "لازم تكتب سبب الإلغاء";
        if (notes.trim().length < 3) return "اكتب سبب أوضح (٣ أحرف على الأقل)";
        return "";
    }, [notes]);

    const canSubmit = !error && !loading;

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
                        إلغاء المهمة
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
                <TextField
                    fullWidth
                    label="سبب الإلغاء (إجباري)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    error={Boolean(error)}
                    helperText={error || " "}
                    multiline
                    minRows={3}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <NotesIcon sx={{ color: "text.secondary" }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={inputSx}
                    disabled={loading}
                />
            </DialogContent>

            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={btnOutlineSx}
                    disabled={loading}
                >
                    رجوع
                </Button>

                <Button
                    onClick={() => onSubmit?.(notes.trim())}
                    variant="contained"
                    startIcon={
                        loading ? <CircularProgress size={16} /> : <BlockIcon />
                    }
                    disabled={!canSubmit}
                    sx={{
                        borderRadius: 2,
                        fontWeight: 900,
                        bgcolor: "rgba(245,158,11,0.16)",
                        border: "1px solid rgba(245,158,11,0.30)",
                        color: "#e5e7eb",
                        "&:hover": { bgcolor: "rgba(245,158,11,0.24)" },
                    }}
                >
                    تأكيد الإلغاء
                </Button>
            </DialogActions>
        </Dialog>
    );
}
