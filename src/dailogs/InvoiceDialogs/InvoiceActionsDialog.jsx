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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InvoicePaymentDialog from "../../pages/Payments/InvoicePaymentDialog";
import { useState } from "react";
import { formatMoney } from "../../utils/Methods";
import { dialogPaperSx, closeBtnSx, btnOutlineSx } from "../../Comps/SomeAttrs";

export default function InvoiceActionsDialog({ open, onClose, invoice, onPaymentSuccess }) {
    const [payOpen, setPayOpen] = useState(false);

    if (!invoice) return null;

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
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

                    <IconButton onClick={onClose} sx={closeBtnSx}>
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
                    >
                        إغلاق
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog تحصيل دفعة */}
            <InvoicePaymentDialog
                open={payOpen}
                onClose={() => setPayOpen(false)}
                invoice={invoice}
                onSuccess={onPaymentSuccess}
            />
        </>
    );
}
