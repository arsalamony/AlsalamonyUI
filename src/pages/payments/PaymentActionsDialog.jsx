import {
    Dialog,
    DialogTitle,
    Typography,
    IconButton,
    Divider,
    DialogContent,
    Button,
    DialogActions,
    Stack,
    CircularProgress,
} from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useNavigate } from "react-router-dom";

import { useConfirm } from "../../hooks/useConfirm";
import { useToast } from "../../hooks/useToast";
import { dialogPaperSx, closeBtnSx, btnOutlineSx } from "@/styles/uiStyles";
import { finshPayment, deletePayment } from "../../api/payment.api";
import { getErrorMessage } from "../../api/apiError";
import { useState } from "react";

export default function PaymentActionsDialog({
    open,
    onClose,
    payment,
    onSuccess,
}) {
    const confirm = useConfirm();
    const showToast = useToast();
    const navigate = useNavigate();

    const role = (localStorage.getItem("role") || "").toLowerCase();
    const isAdmin = role === "admin";

    const [busy, setBusy] = useState(false);

    if (!payment) return null;

    const invoiceId = payment.invoiceId ?? payment.InvoiceId ?? null;
    const hasInvoice = Number(invoiceId) > 0;

    const finshed = Boolean(payment.finshed ?? payment.Finshed);

    const goToInvoiceDetails = () => {
        if (!hasInvoice) return;
        onClose?.();
        navigate(`/invoices/${invoiceId}`);
    };

    const settlePayment = async () => {
        const ok = await confirm({
            title: "تخليص الدفعة",
            message: `متأكد أنك تريد تخليص الدفعة رقم #${payment.paymentId}؟`,
            confirmText: "تأكيد",
            cancelText: "إلغاء",
            danger: false,
            icon: <DoneIcon />,
        });
        if (!ok) return;

        try {
            setBusy(true);
            await finshPayment(payment.paymentId);

            showToast({
                message: "تم تخليص الدفعة",
                icon: <DoneIcon />,
                severity: "success",
                duration: 2000,
            });

            onClose?.();
            onSuccess?.();
        } catch (err) {
            showToast({
                message: getErrorMessage(err),
                icon: <DoneIcon />,
                severity: "error",
                duration: 2500,
            });
        } finally {
            setBusy(false);
        }
    };

    const handleDelete = async () => {
        const ok = await confirm({
            title: "حذف الدفعة",
            message: `متأكد أنك تريد حذف الدفعة رقم #${payment.paymentId}؟`,
            confirmText: "حذف",
            cancelText: "إلغاء",
            danger: true,
            icon: <DeleteOutlineIcon />,
        });
        if (!ok) return;

        try {
            setBusy(true);
            await deletePayment(payment.paymentId);

            showToast({
                message: "تم حذف الدفعة",
                icon: <DeleteOutlineIcon />,
                severity: "success",
                duration: 2000,
            });

            onClose?.();
            onSuccess?.();
        } catch (err) {
            showToast({
                message: getErrorMessage(err),
                icon: <DeleteOutlineIcon />,
                severity: "error",
                duration: 2500,
            });
        } finally {
            setBusy(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={busy ? undefined : onClose}
            fullWidth
            maxWidth="xs"
            PaperProps={{ sx: dialogPaperSx }}
        >
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ fontWeight: 900, flex: 1 }}>
                    إجراءات الدفعة #{payment.paymentId}
                </Typography>
                <IconButton onClick={onClose} disabled={busy} sx={closeBtnSx}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <Divider sx={{ borderColor: "#1e293b" }} />

            <DialogContent sx={{ pt: 2 }}>
                <Stack spacing={1.25}>
                    {/* ✅ تخليص (Admin فقط) */}
                    {isAdmin && (
                        <Button
                            fullWidth
                            startIcon={
                                busy ? (
                                    <CircularProgress size={16} />
                                ) : (
                                    <DoneIcon />
                                )
                            }
                            variant="contained"
                            onClick={settlePayment}
                            disabled={busy || finshed}
                            sx={{
                                justifyContent: "space-between",
                                borderRadius: 2,
                                py: 1.2,
                                bgcolor: "rgba(34,197,94,0.16)",
                                border: "1px solid rgba(34,197,94,0.30)",
                                color: "#e5e7eb",
                                "&:hover": { bgcolor: "rgba(34,197,94,0.24)" },
                                textTransform: "none",
                                fontWeight: 800,
                            }}
                        >
                            {finshed ? "الدفعة مُخلصة بالفعل" : "تخليص الدفعة"}
                        </Button>
                    )}

                    {/* ✅ تفاصيل الفاتورة (لو مرتبطة) */}
                    {hasInvoice && (
                        <Button
                            fullWidth
                            startIcon={<ReceiptLongIcon />}
                            variant="contained"
                            onClick={goToInvoiceDetails}
                            disabled={busy}
                            sx={{
                                justifyContent: "space-between",
                                borderRadius: 2,
                                py: 1.2,
                                bgcolor: "rgba(56,189,248,0.16)",
                                border: "1px solid rgba(56,189,248,0.30)",
                                color: "#e5e7eb",
                                "&:hover": { bgcolor: "rgba(56,189,248,0.24)" },
                                textTransform: "none",
                                fontWeight: 800,
                            }}
                        >
                            تفاصيل الفاتورة
                        </Button>
                    )}

                    {/* ✅ حذف (Admin فقط) */}
                    {isAdmin && (
                        <Button
                            fullWidth
                            startIcon={
                                busy ? (
                                    <CircularProgress size={16} />
                                ) : (
                                    <DeleteOutlineIcon />
                                )
                            }
                            variant="contained"
                            onClick={handleDelete}
                            disabled={busy}
                            sx={{
                                justifyContent: "space-between",
                                borderRadius: 2,
                                py: 1.2,
                                bgcolor: "rgba(239,68,68,0.16)",
                                border: "1px solid rgba(239,68,68,0.30)",
                                color: "#e5e7eb",
                                "&:hover": { bgcolor: "rgba(239,68,68,0.24)" },
                                textTransform: "none",
                                fontWeight: 900,
                            }}
                        >
                            حذف الدفعة
                        </Button>
                    )}

                    {!isAdmin && !hasInvoice && (
                        <Typography
                            sx={{ color: "text.secondary", fontSize: 13 }}
                        >
                            لا توجد إجراءات متاحة لك.
                        </Typography>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={btnOutlineSx}
                    disabled={busy}
                >
                    إغلاق
                </Button>
            </DialogActions>
        </Dialog>
    );
}
