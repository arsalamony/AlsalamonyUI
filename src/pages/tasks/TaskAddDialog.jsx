// src/pages/Tasks/TaskAddDialog.jsx
import { useEffect, useMemo, useState } from "react";
import Grid from "@mui/material/Grid";
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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
    CircularProgress,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import NotesIcon from "@mui/icons-material/Notes";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import PersonIcon from "@mui/icons-material/Person";
import PlaceIcon from "@mui/icons-material/Place";
import FlagIcon from "@mui/icons-material/Flag";

import { useToast } from "../../hooks/useToast";
import { getErrorMessage } from "../../api/apiError";
import { addTask } from "../../api/task.api";

// ✅ عندك hook جاهز
import { useAddresses } from "../../hooks/useAddresses"; // عدّل المسار

// لو عندك SomeAttrs استخدمهم بدل اللي تحت
import {
    btnOutlineSx,
    btnSaveSx,
    closeBtnSx,
    dialogPaperSx,
    inputSx,
    selectSx,
} from "@/styles/uiStyles";

// ✅ عدّل القيم لتطابق enum عندك (نفس AddTaskRequest)
const priorityOptions = [
    { value: 3, label: "عادي" },
    { value: 2, label: "مهم" },
    { value: 1, label: "مهم جدا" },
];

export default function TaskAddDialog({
    open,
    onClose,
    users = [],
    onSuccess,
}) {
    const showToast = useToast();

    const { addresses = [], loading: addressesLoading } = useAddresses();

    const defaultAddressId = addresses?.[0]?.addressId
        ? String(addresses[0].addressId)
        : "";

    const [form, setForm] = useState({
        name: "",
        priority: String(priorityOptions[0].value),
        addressId: defaultAddressId,
        assignedToUserId: "",
        notes: "",
    });

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!open) return;
        setForm({
            name: "",
            priority: String(priorityOptions[0].value),
            addressId: defaultAddressId,
            assignedToUserId: "",
            notes: "",
        });
        setSubmitting(false);
    }, [open, defaultAddressId]);

    const errors = useMemo(() => {
        const e = {};
        if (!form.name.trim()) e.name = "اكتب اسم المهمة";
        if (!form.priority) e.priority = "اختر الأولوية";
        if (!form.addressId) e.addressId = "اختر العنوان";
        return e;
    }, [form]);

    const isValid = Object.keys(errors).length === 0 && !submitting;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isValid) return;

        const payload = {
            name: form.name.trim(),
            priority: Number(form.priority),
            addressId: Number(form.addressId),
            assignedToUserId: form.assignedToUserId
                ? Number(form.assignedToUserId)
                : null,
            notes: form.notes.trim() ? form.notes.trim() : null,
        };

        try {
            setSubmitting(true);
            const apiResult = await addTask(payload);

            showToast({
                message: "تم إضافة المهمة بنجاح",
                icon: <TaskAltIcon />,
                severity: "success",
                duration: 2000,
            });

            onSuccess?.({ apiResult, payload });
            onClose?.();
        } catch (err) {
            showToast({
                message: getErrorMessage(err),
                icon: <TaskAltIcon />,
                severity: "error",
                duration: 2500,
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={submitting ? undefined : onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{ sx: dialogPaperSx }}
        >
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 900 }}>إضافة مهمة</Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                        اكتب بيانات المهمة ثم حفظ
                    </Typography>
                </Box>

                <IconButton
                    onClick={onClose}
                    disabled={submitting}
                    sx={closeBtnSx}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <Divider sx={{ borderColor: "#1e293b" }} />

            <DialogContent sx={{ pt: 2 }}>
                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="اسم المهمة"
                                value={form.name}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        name: e.target.value,
                                    }))
                                }
                                error={Boolean(errors.name)}
                                helperText={errors.name || " "}
                                sx={inputSx}
                                disabled={submitting}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <FormControl
                                fullWidth
                                sx={selectSx}
                                error={Boolean(errors.priority)}
                                disabled={submitting}
                            >
                                <InputLabel>الأولوية</InputLabel>
                                <Select
                                    label="الأولوية"
                                    value={form.priority}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            priority: e.target.value,
                                        }))
                                    }
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <FlagIcon
                                                sx={{
                                                    color: "text.secondary",
                                                    mr: 1,
                                                }}
                                            />
                                        </InputAdornment>
                                    }
                                >
                                    {priorityOptions.map((x) => (
                                        <MenuItem
                                            key={x.value}
                                            value={String(x.value)}
                                        >
                                            {x.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <FormControl
                                fullWidth
                                sx={selectSx}
                                error={Boolean(errors.addressId)}
                                disabled={submitting || addressesLoading}
                            >
                                <InputLabel>العنوان</InputLabel>
                                <Select
                                    label="العنوان"
                                    value={form.addressId}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            addressId: e.target.value,
                                        }))
                                    }
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <PlaceIcon
                                                sx={{
                                                    color: "text.secondary",
                                                    mr: 1,
                                                }}
                                            />
                                        </InputAdornment>
                                    }
                                >
                                    {addresses.map((a) => (
                                        <MenuItem
                                            key={a.addressId}
                                            value={String(a.addressId)}
                                        >
                                            {a.addressName} (#{a.addressId})
                                        </MenuItem>
                                    ))}
                                </Select>

                                {errors.addressId ? (
                                    <Typography
                                        sx={{
                                            mt: 0.5,
                                            fontSize: 12,
                                            color: "error.main",
                                            minHeight: 18,
                                        }}
                                    >
                                        {errors.addressId}
                                    </Typography>
                                ) : (
                                    <Typography
                                        sx={{
                                            mt: 0.5,
                                            fontSize: 12,
                                            color: "transparent",
                                            minHeight: 18,
                                        }}
                                    >
                                        .
                                    </Typography>
                                )}
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <FormControl
                                fullWidth
                                sx={selectSx}
                                disabled={submitting}
                            >
                                <InputLabel>إسناد إلى (اختياري)</InputLabel>
                                <Select
                                    label="إسناد إلى (اختياري)"
                                    value={form.assignedToUserId}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            assignedToUserId: e.target.value,
                                        }))
                                    }
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <PersonIcon
                                                sx={{
                                                    color: "text.secondary",
                                                    mr: 1,
                                                }}
                                            />
                                        </InputAdornment>
                                    }
                                >
                                    <MenuItem value="">بدون</MenuItem>
                                    {users.map((u) => (
                                        <MenuItem
                                            key={u.userId}
                                            value={String(u.userId)}
                                        >
                                            {u.name} (#{u.userId})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="ملاحظات"
                                value={form.notes}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        notes: e.target.value,
                                    }))
                                }
                                multiline
                                minRows={3}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <NotesIcon
                                                sx={{ color: "text.secondary" }}
                                            />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={inputSx}
                                disabled={submitting}
                            />
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 2, borderColor: "#1e293b" }} />

                    <DialogActions sx={{ p: 0 }}>
                        <Button
                            onClick={onClose}
                            variant="outlined"
                            sx={btnOutlineSx}
                            disabled={submitting}
                        >
                            إلغاء
                        </Button>

                        <Button
                            type="submit"
                            variant="contained"
                            startIcon={
                                submitting ? (
                                    <CircularProgress size={16} />
                                ) : (
                                    <TaskAltIcon />
                                )
                            }
                            disabled={!isValid}
                            sx={btnSaveSx}
                        >
                            {submitting ? "جاري الحفظ..." : "حفظ"}
                        </Button>
                    </DialogActions>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
