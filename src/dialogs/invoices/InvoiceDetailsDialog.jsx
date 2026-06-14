import {
    Dialog,
    DialogTitle,
    Box,
    Typography,
    IconButton,
    Divider,
    DialogContent,
    Stack,
    Chip,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    DialogActions,
    Button,
} from "@mui/material";
import {
    dialogPaperSx,
    closeBtnSx,
    chipSx,
    tableScrollSx,
    thSx,
    notesBoxSx,
    btnOutlineSx,
} from "@/styles/uiStyles";
import CloseIcon from "@mui/icons-material/Close";
import { formatDateTime, formatMoney } from "../../utils/Methods";

export default function InvoiceDetailsDialog({ open, onClose, invoice }) {
    if (!invoice) return null;

    const items = Array.isArray(invoice.invoiceItems)
        ? invoice.invoiceItems
        : [];

    const itemsTotal = items.reduce((sum, it) => {
        if (it?.isGift) return sum;
        const qty = Number(it?.qty ?? 0);
        const price = Number(it?.pricePerUnit ?? 0);
        if (!Number.isFinite(qty) || !Number.isFinite(price)) return sum;
        return sum + qty * price;
    }, 0);

    const hasNotes = Boolean(invoice.notes?.trim());

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            PaperProps={{ sx: dialogPaperSx }}
        >
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 900 }}>
                        تفاصيل الفاتورة #{invoice.invoiceId}
                    </Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                        {formatDateTime(invoice.invoiceDate)}
                    </Typography>
                </Box>

                <IconButton onClick={onClose} sx={closeBtnSx}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <Divider sx={{ borderColor: "#1e293b" }} />

            <DialogContent sx={{ pt: 2 }}>
                {/* ===== Items Summary ===== */}
                <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    useFlexGap
                    sx={{ mb: 1.5 }}
                >
                    <Chip label={`عدد البنود: ${items.length}`} sx={chipSx} />
                    <Chip
                        label={`إجمالي البنود (محسوب): ${formatMoney(itemsTotal)}`}
                        sx={chipSx}
                    />
                </Stack>

                {/* ===== Items Table ===== */}
                <Typography sx={{ fontWeight: 800, mb: 1 }}>
                    بنود الفاتورة
                </Typography>

                {items.length === 0 ? (
                    <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                        لا توجد بنود (فاتورة دين/خدمة).
                    </Typography>
                ) : (
                    <Box sx={{ overflowX: "auto", ...tableScrollSx }}>
                        <Table size="small" sx={{ minWidth: 700 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={thSx}>المنتج</TableCell>
                                    <TableCell align="center" sx={thSx}>
                                        الكمية
                                    </TableCell>
                                    <TableCell align="center" sx={thSx}>
                                        سعر الوحدة
                                    </TableCell>
                                    <TableCell align="center" sx={thSx}>
                                        الإجمالي
                                    </TableCell>
                                    <TableCell align="center" sx={thSx}>
                                        نوع
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {items.map((it, idx) => {
                                    const qty = Number(it?.qty ?? 0);
                                    const price = Number(it?.pricePerUnit ?? 0);
                                    const lineTotal = it?.isGift
                                        ? 0
                                        : (Number.isFinite(qty) ? qty : 0) *
                                          (Number.isFinite(price) ? price : 0);

                                    return (
                                        <TableRow
                                            key={idx}
                                            hover
                                            sx={{
                                                "&:hover": {
                                                    bgcolor:
                                                        "rgba(148,163,184,0.06)",
                                                },
                                            }}
                                        >
                                            <TableCell sx={{ fontWeight: 700 }}>
                                                {it?.productName ?? "-"}
                                            </TableCell>

                                            <TableCell align="center">
                                                {it?.qty ?? "-"}
                                            </TableCell>

                                            <TableCell align="center">
                                                {formatMoney(
                                                    it?.pricePerUnit ?? 0,
                                                )}
                                            </TableCell>

                                            <TableCell align="center">
                                                <Typography
                                                    sx={{ fontWeight: 800 }}
                                                >
                                                    {formatMoney(lineTotal)}
                                                </Typography>
                                            </TableCell>

                                            <TableCell align="center">
                                                {it?.isGift ? (
                                                    <Chip
                                                        size="small"
                                                        label="هدية"
                                                        sx={{
                                                            bgcolor:
                                                                "rgba(245,158,11,0.14)",
                                                            border: "1px solid rgba(245,158,11,0.30)",
                                                            color: "#fde68a",
                                                            fontWeight: 800,
                                                        }}
                                                    />
                                                ) : (
                                                    <Chip
                                                        size="small"
                                                        label="بيع"
                                                        sx={{
                                                            bgcolor:
                                                                "rgba(56,189,248,0.12)",
                                                            border: "1px solid rgba(56,189,248,0.25)",
                                                            color: "#bae6fd",
                                                            fontWeight: 800,
                                                        }}
                                                    />
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </Box>
                )}

                {/* ===== Notes ===== */}
                <Divider sx={{ borderColor: "#1e293b", my: 2 }} />

                <Typography
                    sx={{ color: "text.secondary", fontSize: 13, mb: 1 }}
                >
                    ملاحظات
                </Typography>

                <Box sx={notesBoxSx}>
                    {hasNotes ? invoice.notes : "لا توجد ملاحظات"}
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} variant="outlined" sx={btnOutlineSx}>
                    إغلاق
                </Button>
            </DialogActions>
        </Dialog>
    );
}
