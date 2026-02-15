import { Payments } from "@mui/icons-material";
import {
    Dialog,
    DialogTitle,
    Box,
    Typography,
    IconButton,
    Divider,
    DialogContent,
    Button,
    DialogActions,
    CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import InvoicePaymentDialog from "../../pages/Payments/InvoicePaymentDialog";
import { useState } from "react";
import { formatMoney } from "../../utils/Methods";
import { dialogPaperSx, closeBtnSx, btnOutlineSx } from "../../Comps/SomeAttrs";

import { useConfirm } from "../../hooks/useConfirm"; // ✅ عدّل المسار
import { useToast } from "../../hooks/useToast"; // ✅ عدّل المسار
import { getErrorMessage } from "../../api/apiError"; // ✅ عدّل المسار
import { FullDeleteInvoice } from "../../api/Invoice.api"; // ✅

function isAdminRole() {
    return String(localStorage.getItem("role") || "").toLowerCase() === "admin";
}

export default function InvoiceActionsDialog({
    open,
    onClose,
    invoice,
    onPaymentSuccess,
    onDeleted, // ✅ اختياري: عشان تعمل refetch/تحديث
}) {
    const [payOpen, setPayOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const isAdmin = isAdminRole();
    const confirm = useConfirm();
    const showToast = useToast();

    if (!invoice) return null;

    const handleFullDelete = async () => {
        const ok = await confirm({
            title: "حذف نهائي",
            message: `متأكد أنك تريد حذف الفاتورة #${invoice.invoiceId} نهائيًا؟ هذا الإجراء لا يمكن التراجع عنه.`,
            confirmText: "حذف",
            cancelText: "إلغاء",
            danger: true,
            icon: <DeleteOutlineIcon />,
        });

        if (!ok) return;

        try {
            setDeleting(true);
            await FullDeleteInvoice(invoice.invoiceId);

            showToast({
                message: "تم حذف الفاتورة نهائيًا",
                icon: <DeleteOutlineIcon />,
                severity: "success",
                duration: 2000,
            });

            onClose?.();
            onDeleted?.(invoice.invoiceId);
        } catch (err) {
            showToast({
                message: getErrorMessage(err),
                icon: <DeleteOutlineIcon />,
                severity: "error",
                duration: 2500,
            });
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={deleting ? undefined : onClose}
                fullWidth
                maxWidth="xs"
                PaperProps={{ sx: dialogPaperSx }}
            >
                <DialogTitle
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                    <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 900 }}>
                            إجراءات الفاتورة
                        </Typography>
                        <Typography
                            sx={{ color: "text.secondary", fontSize: 13 }}
                        >
                            #{invoice.invoiceId}
                        </Typography>
                    </Box>

                    <IconButton
                        onClick={onClose}
                        disabled={deleting}
                        sx={closeBtnSx}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <Divider sx={{ borderColor: "#1e293b" }} />

                <DialogContent sx={{ pt: 2 }}>
                    <Button
                        fullWidth
                        startIcon={<Payments />}
                        variant="contained"
                        onClick={() => setPayOpen(true)}
                        disabled={deleting}
                        sx={{
                            justifyContent: "space-between",
                            borderRadius: 2,
                            py: 1.2,
                            bgcolor: "rgba(34,197,94,0.16)",
                            border: "1px solid rgba(34,197,94,0.30)",
                            color: "#e5e7eb",
                            "&:hover": { bgcolor: "rgba(34,197,94,0.24)" },
                            textTransform: "none",
                        }}
                    >
                        تحصيل دفعة
                    </Button>

                    {/* ✅ زر الحذف للأدمن فقط */}
                    {isAdmin && (
                        <Button
                            fullWidth
                            startIcon={
                                deleting ? (
                                    <CircularProgress size={16} />
                                ) : (
                                    <DeleteOutlineIcon />
                                )
                            }
                            variant="contained"
                            onClick={handleFullDelete}
                            disabled={deleting}
                            sx={{
                                mt: 1.5,
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
                            {deleting ? "جاري الحذف..." : "حذف نهائي"}
                        </Button>
                    )}

                    <Typography
                        sx={{ mt: 2, color: "text.secondary", fontSize: 12 }}
                    >
                        المتبقي الحالي: {formatMoney(invoice.remainingAmount)}
                    </Typography>
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={onClose}
                        variant="outlined"
                        sx={btnOutlineSx}
                        disabled={deleting}
                    >
                        إغلاق
                    </Button>
                </DialogActions>
            </Dialog>

            <InvoicePaymentDialog
                open={payOpen}
                onClose={() => setPayOpen(false)}
                invoice={invoice}
                onSuccess={onPaymentSuccess}
            />
        </>
    );
}
