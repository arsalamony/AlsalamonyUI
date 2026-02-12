import { useEffect, useMemo, useState } from "react";
import Grid from "@mui/material/Grid";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    FormControlLabel,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    TextField,
    Typography,
    CircularProgress,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import PaymentsIcon from "@mui/icons-material/Payments";
import NotesIcon from "@mui/icons-material/Notes";
import PersonIcon from "@mui/icons-material/Person";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

import { useToast } from "../../hooks/useToast";
import {
    btnOutlineSx,
    btnSaveSx,
    inputSx,
    selectSx,
} from "../../Comps/SomeAttrs";

import { addPayment, addPaymentByAdmin } from "../../api/payment.api"; // ✅
import { usePaymentMethods } from "../../hooks/usePaymentMethods"; // ✅

function parseAmount(input) {
    if (input == null) return NaN;
    // const s = String(input).trim().replaceAll("٬", "").replaceAll(",", ".");
    const s = String(input).trim();
    return Number(s);
}

/**
 * mode:
 *  - "self": إضافة دفعة عادية -> Payment/Add
 *  - "admin": إضافة بالنيابة -> Payment/Admin (يطلب createdByUserId)
 */
export default function PaymentAddDialog({
    open,
    onClose,
    users = [],
    onSuccess,
}) {
    const showToast = useToast();

    const role = (localStorage.getItem("role") || "").toLowerCase();
    const isAdminMode = role === "admin";

    const { paymentMethods } = usePaymentMethods();
    const defaultMethodValue = String(paymentMethods?.[0]?.value ?? 1);

    // const defaultUserId = users?.[0]?.userId ? String(users[0].userId) : "";
    const defaultUserId = localStorage.getItem("userId");

    const [form, setForm] = useState({
        amount: "",
        paymentMethod: defaultMethodValue,
        added: true,
        notes: "",
        createdByUserId: defaultUserId,
    });

    const [submitting, setSubmitting] = useState(false);

    // reset when open
    useEffect(() => {
        if (!open) return;
        setForm({
            amount: "",
            paymentMethod: defaultMethodValue,
            added: true,
            notes: "",
            createdByUserId: defaultUserId,
        });
        setSubmitting(false);
    }, [open, defaultMethodValue, defaultUserId]);

    const errors = useMemo(() => {
        const e = {};

        const a = parseAmount(form.amount);
        if (!form.amount) e.amount = "أدخل المبلغ";
        else if (!Number.isFinite(a) || a <= 0)
            e.amount = "المبلغ لازم يكون رقم أكبر من صفر";

        if (!form.paymentMethod) e.paymentMethod = "اختر طريقة الدفع";

        // Notes إجباري
        if (!form.notes.trim()) e.notes = "الملاحظات مطلوبة";

        if (isAdminMode) {
            if (!form.createdByUserId) e.createdByUserId = "اختر الموظف";
        }

        return e;
    }, [form, isAdminMode]);

    const isValid = Object.keys(errors).length === 0 && !submitting;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isValid) {
            showToast({
                message:
                    errors.amount ||
                    errors.notes ||
                    errors.createdByUserId ||
                    "راجع البيانات",
                icon: <ErrorOutlineIcon />,
                severity: "error",
                duration: 2000,
            });
            return;
        }

        const basePayload = {
            amount: Number(parseAmount(form.amount)),
            paymentMethod: Number(form.paymentMethod),
            added: form.added === true,
            notes: form.notes.trim(),
        };

        try {
            setSubmitting(true);

            let apiResult;
            if (isAdminMode) {
                const payload = {
                    ...basePayload,
                    createdByUserId: Number(form.createdByUserId),
                };
                apiResult = await addPaymentByAdmin(payload);
            } else {
                apiResult = await addPayment(basePayload);
            }

            showToast({
                message: basePayload.added
                    ? "تم تسجيل التحصيل"
                    : "تم تسجيل الاستقطاع",
                icon: <CheckCircleIcon />,
                severity: "success",
                duration: 2000,
            });
            onSuccess?.({ apiResult });
            onClose?.();
        } catch {
            showToast({
                message: "فشل إضافة الدفعة. حاول مرة أخرى.",
                icon: <ErrorOutlineIcon />,
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
                <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 900 }}>
                        {isAdminMode ? "إضافة دفعة بالنيابة" : "إضافة دفعة"}
                    </Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                        {isAdminMode
                            ? "سيتم تسجيل الدفعة باسم الموظف المختار"
                            : "سجل تحصيل أو استقطاع"}
                    </Typography>
                </Box>

                <IconButton
                    onClick={onClose}
                    disabled={submitting}
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
                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        {/* Amount */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="المبلغ"
                                value={form.amount}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        amount: e.target.value,
                                    }))
                                }
                                error={Boolean(errors.amount)}
                                helperText={errors.amount || " "}
                                inputProps={{ inputMode: "decimal" }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LocalAtmIcon
                                                sx={{ color: "text.secondary" }}
                                            />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={inputSx}
                                disabled={submitting}
                            />
                        </Grid>

                        {/* PaymentMethod */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <FormControl
                                fullWidth
                                sx={selectSx}
                                error={Boolean(errors.paymentMethod)}
                                disabled={submitting}
                            >
                                <InputLabel>طريقة الدفع</InputLabel>
                                <Select
                                    label="طريقة الدفع"
                                    value={form.paymentMethod}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            paymentMethod: e.target.value,
                                        }))
                                    }
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <PaymentsIcon
                                                sx={{
                                                    color: "text.secondary",
                                                    mr: 1,
                                                }}
                                            />
                                        </InputAdornment>
                                    }
                                >
                                    {paymentMethods.map((m) => (
                                        <MenuItem
                                            key={m.value}
                                            value={String(m.value)}
                                        >
                                            {m.label}
                                        </MenuItem>
                                    ))}
                                </Select>

                                <Typography
                                    sx={{
                                        mt: 0.5,
                                        fontSize: 12,
                                        color: "error.main",
                                        minHeight: 18,
                                    }}
                                >
                                    {errors.paymentMethod || " "}
                                </Typography>
                            </FormControl>
                        </Grid>

                        {/* Added */}
                        <Grid size={{ xs: 12 }}>
                            <FormControl
                                disabled={submitting}
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: "rgba(148,163,184,0.06)",
                                    border: "1px solid rgba(148,163,184,0.18)",
                                    width: "100%",
                                }}
                            >
                                <Typography sx={{ fontWeight: 800, mb: 1 }}>
                                    نوع العملية
                                </Typography>

                                <RadioGroup
                                    row
                                    value={form.added}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            added: e.target.value === "true",
                                        }))
                                    }
                                >
                                    <FormControlLabel
                                        value="true"
                                        control={<Radio />}
                                        label="تحصيل"
                                    />
                                    <FormControlLabel
                                        value="false"
                                        control={<Radio />}
                                        label="استقطاع"
                                    />
                                </RadioGroup>
                            </FormControl>
                        </Grid>

                        {/* CreatedByUserId (Admin mode only) */}
                        {isAdminMode && (
                            <Grid size={{ xs: 12 }}>
                                <FormControl
                                    fullWidth
                                    sx={selectSx}
                                    error={Boolean(errors.createdByUserId)}
                                    disabled={submitting}
                                >
                                    <InputLabel>الموظف</InputLabel>
                                    <Select
                                        label="الموظف"
                                        value={form.createdByUserId}
                                        onChange={(e) =>
                                            setForm((p) => ({
                                                ...p,
                                                createdByUserId: e.target.value,
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
                                        {users.map((u) => (
                                            <MenuItem
                                                key={u.userId}
                                                value={String(u.userId)}
                                            >
                                                {u.name} (#{u.userId})
                                            </MenuItem>
                                        ))}
                                    </Select>

                                    <Typography
                                        sx={{
                                            mt: 0.5,
                                            fontSize: 12,
                                            color: "error.main",
                                            minHeight: 18,
                                        }}
                                    >
                                        {errors.createdByUserId || " "}
                                    </Typography>
                                </FormControl>
                            </Grid>
                        )}

                        {/* Notes */}
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="ملاحظات (إجباري)"
                                value={form.notes}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        notes: e.target.value,
                                    }))
                                }
                                error={Boolean(errors.notes)}
                                helperText={errors.notes || " "}
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
                                    <PaymentsIcon />
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
