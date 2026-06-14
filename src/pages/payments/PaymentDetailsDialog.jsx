import {
    Dialog,
    DialogTitle,
    Box,
    Typography,
    IconButton,
    Divider,
    DialogContent,
    Grid,
    DialogActions,
    Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import InfoLine from "@/components/InfoLine";
import {
    dialogPaperSx,
    closeBtnSx,
    notesBoxSx,
    btnOutlineSx,
} from "@/styles/uiStyles";
import { formatDateTime, formatMoney } from "../../utils/Methods";

export default function PaymentDetailsDialog({ open, onClose, payment }) {
    if (!payment) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{ sx: dialogPaperSx }}
        >
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 900 }}>
                        تفاصيل الدفعة #{payment.paymentId}
                    </Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                        {formatDateTime(payment.paymentDate)}
                    </Typography>
                </Box>

                <IconButton onClick={onClose} sx={closeBtnSx}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <Divider sx={{ borderColor: "#1e293b" }} />

            <DialogContent sx={{ pt: 2 }}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <InfoLine
                            label="النوع"
                            value={payment.added ? "تحصيل" : "استقطاع"}
                            highlight={undefined}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <InfoLine
                            label="المبلغ"
                            value={formatMoney(payment.amount)}
                            highlight
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <InfoLine
                            label="طريقة الدفع"
                            value={payment.paymentMethod}
                            highlight={undefined}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <InfoLine
                            label="أنشأها"
                            value={payment.createdBy}
                            highlight={undefined}
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <InfoLine
                            label="InvoiceId"
                            value={
                                payment.invoiceId
                                    ? `#${payment.invoiceId}`
                                    : "غير مرتبط بفاتورة"
                            }
                            highlight={undefined}
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <Divider sx={{ borderColor: "#1e293b", my: 1 }} />
                        <Typography
                            sx={{
                                color: "text.secondary",
                                fontSize: 13,
                                mb: 1,
                            }}
                        >
                            ملاحظات
                        </Typography>
                        <Box sx={notesBoxSx}>
                            {payment.notes?.trim()
                                ? payment.notes
                                : "لا توجد ملاحظات"}
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} variant="outlined" sx={btnOutlineSx}>
                    إغلاق
                </Button>
            </DialogActions>
        </Dialog>
    );
}
