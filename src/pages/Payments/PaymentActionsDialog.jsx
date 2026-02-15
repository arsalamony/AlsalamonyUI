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
} from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { useNavigate } from "react-router-dom";

import { useConfirm } from "../../hooks/useConfirm";
import { useToast } from "../../hooks/useToast";
import { dialogPaperSx, closeBtnSx, btnOutlineSx } from "../../Comps/SomeAttrs";
import { finshPayment } from "../../api/payment.api";

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

    if (!payment) return null;

    // ✅ ممكن يجي invoiceId أو InvoiceId
    const invoiceId =
        payment.invoiceId ?? payment.InvoiceId ?? null;

    const hasInvoice = Number(invoiceId) > 0;

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

        await finshPayment(payment.paymentId);

        showToast({
            message: "تم تخليص الدفعة",
            icon: <DoneIcon />,
            severity: "success",
            duration: 2000,
        });

        onClose?.();
        onSuccess?.();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="xs"
            PaperProps={{ sx: dialogPaperSx }}
        >
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ fontWeight: 900, flex: 1 }}>
                    إجراءات الدفعة #{payment.paymentId}
                </Typography>
                <IconButton onClick={onClose} sx={closeBtnSx}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <Divider sx={{ borderColor: "#1e293b" }} />

            <DialogContent sx={{ pt: 2 }}>
                <Stack spacing={1.25}>
                    {/* ✅ زر تخليص الدفعة (Admin فقط) */}
                    {isAdmin ? (
                        <Button
                            fullWidth
                            startIcon={<DoneIcon />}
                            variant="contained"
                            onClick={settlePayment}
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
                            تخليص الدفعة
                        </Button>
                    ) : (
                        <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                            لا توجد إجراءات متاحة لك.
                        </Typography>
                    )}

                    {/* ✅ زر تفاصيل الفاتورة (يظهر فقط لو الدفعة مرتبطة بفاتورة) */}
                    {hasInvoice && (
                        <Button
                            fullWidth
                            startIcon={<ReceiptLongIcon />}
                            variant="contained"
                            onClick={goToInvoiceDetails}
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
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} variant="outlined" sx={btnOutlineSx}>
                    إغلاق
                </Button>
            </DialogActions>
        </Dialog>
    );
}