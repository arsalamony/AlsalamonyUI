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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
    CircularProgress,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import PaymentsIcon from "@mui/icons-material/Payments";
import NotesIcon from "@mui/icons-material/Notes";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import { useToast } from "../../hooks/useToast";
import { formatMoney, parseAmount } from "../../utils/Methods";
import { addInvoicePayment } from "../../api/Invoice.api";
import { dialogPaperSx, closeBtnSx, inputSx, btnOutlineSx } from "../../Comps/SomeAttrs";
import { usePaymentMethods } from "../../hooks/usePaymentMethods";

export default function InvoicePaymentDialog({
    open,
    onClose,
    invoice,
    onSuccess,
}) {
    const showToast = useToast();
    const { paymentMethods } = usePaymentMethods();

    const remaining = Number(invoice?.remainingAmount ?? 0);

    const [form, setForm] = useState({
        amountPaid: "",
        notes: "",
        paymentMethod: String(paymentMethods[0].value),
    });

    const [touched, setTouched] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // ✅ reset فورم عند فتح الديالوج على فاتورة جديدة / أو فتحه عمومًا
    useEffect(() => {
        if (!open) return;
        setForm({
            amountPaid: "",
            notes: "",
            paymentMethod: String(paymentMethods[0].value),
        });
        setTouched(false);
        setSubmitting(false);
    }, [open, invoice.invoiceId, paymentMethods]);

    const amountValue = useMemo(
        () => parseAmount(form.amountPaid),
        [form.amountPaid],
    );

    const error = useMemo(() => {
        if (!touched) return "";

        if (!form.amountPaid) return "أدخل المبلغ المدفوع";
        if (!Number.isFinite(amountValue) || amountValue <= 0)
            return "المبلغ لازم يكون رقم أكبر من صفر";
        if (amountValue > remaining)
            return `لا يمكن أن يتجاوز المتبقي (${formatMoney(remaining)})`;
        return "";
    }, [form.amountPaid, touched, remaining, amountValue]);

    const isValid = !error && remaining > 0 && !submitting;

    const setFullPayment = () => {
        setForm((p) => ({
            ...p,
            amountPaid: String(Number(remaining).toFixed(2)),
        }));
        setTouched(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTouched(true);

        if (!isValid) return;

        const payload = {
            invoiceId: invoice.invoiceId,
            amountPaid: Number(amountValue),
            notes: form.notes.trim() ? form.notes.trim() : null,
            paymentMethod: Number(form.paymentMethod),
        };

        try {
            setSubmitting(true);

            // ✅ call API
            const apiResult = await addInvoicePayment(payload);

            showToast({
                message:
                    payload.amountPaid === remaining
                        ? "تم سداد الفاتورة بالكامل"
                        : "تم تسجيل الدفعة بنجاح",
                icon: <PaymentsIcon />,
                severity: "success",
                duration: 2000,
            });

            // ✅ رجّع للصفحة عشان تحدث الجدول
            // apiResult ممكن يكون void أو يرجّع فاتورة/مدفوعات — هنمرر payload + apiResult
            onSuccess?.({ payload, apiResult });

            onClose?.();
        } catch (err) {
            console.log("Error ", err);
            showToast({
                message: "فشل تسجيل الدفعة. تأكد من الاتصال أو حاول مرة أخرى.",
                icon: <PaymentsIcon />,
                severity: "error",
                duration: 2500,
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (!invoice) return null;

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
                    <Typography sx={{ fontWeight: 900 }}>تحصيل دفعة</Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                        فاتورة #{invoice.invoiceId} — المتبقي:{" "}
                        {formatMoney(remaining)}
                    </Typography>
                </Box>

                <IconButton
                    onClick={onClose}
                    sx={closeBtnSx}
                    disabled={submitting}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <Divider sx={{ borderColor: "#1e293b" }} />

            <DialogContent sx={{ pt: 2 }}>
                <Box component="form" onSubmit={handleSubmit}>
                    <Stack spacing={2}>
                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={1.5}
                        >
                            <TextField
                                fullWidth
                                label="المبلغ المدفوع"
                                value={form.amountPaid}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        amountPaid: e.target.value,
                                    }))
                                }
                                onBlur={() => setTouched(true)}
                                error={Boolean(error)}
                                helperText={error || " "}
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
                                disabled={submitting || remaining <= 0}
                            />

                            <Button
                                type="button"
                                onClick={setFullPayment}
                                variant="outlined"
                                sx={{
                                    ...btnOutlineSx,
                                    minWidth: { xs: "100%", sm: 160 },
                                    height: { sm: 56 },
                                    alignSelf: { sm: "flex-start" },
                                }}
                                disabled={submitting || remaining <= 0}
                            >
                                دفع كامل
                            </Button>
                        </Stack>

                        <FormControl
                            fullWidth
                            sx={inputSx}
                            disabled={submitting || remaining <= 0}
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
                        </FormControl>

                        <TextField
                            fullWidth
                            label="ملاحظات (اختياري)"
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
                            disabled={submitting || remaining <= 0}
                        />
                    </Stack>

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
                            sx={{
                                borderRadius: 2,
                                fontWeight: 800,
                                bgcolor: "rgba(34,197,94,0.16)",
                                border: "1px solid rgba(34,197,94,0.30)",
                                color: "#e5e7eb",
                                "&:hover": { bgcolor: "rgba(34,197,94,0.24)" },
                                "&.Mui-disabled": {
                                    opacity: 0.6,
                                    color: "#e5e7eb",
                                    bgcolor: "rgba(148,163,184,0.10)",
                                    border: "1px solid rgba(148,163,184,0.18)",
                                },
                            }}
                        >
                            {submitting ? "جاري الحفظ..." : "تسجيل الدفعة"}
                        </Button>
                    </DialogActions>
                </Box>
            </DialogContent>
        </Dialog>
    );
}

