import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Grid from "@mui/material/Grid";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    CircularProgress,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

import { formatDateTime, formatMoney, sum } from "../utils/Methods";

// ✅ استدعاء الـ API
import { getUnpaidInvoicesByCustomer } from "../api/Invoice.api"; // عدّل المسار حسب مشروعك
import {
    btnOutlineSx,
    cardSx,
    chipSx,
    tableScrollSx,
    thSx,
    remainingChipSx,
} from "../Comps/SomeAttrs";
import InvoiceActionsDialog from "../dailogs/InvoiceDialogs/InvoiceActionsDialog";
import InvoiceDetailsDialog from "../dailogs/InvoiceDialogs/InvoiceDetailsDialog";

export default function CustomerInvoices() {
    const navigate = useNavigate();
    const { customerId } = useParams();

    // ✅ State: invoices from API
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setLoading(true);
                setError("");

                const data = await getUnpaidInvoicesByCustomer(customerId);

                if (cancelled) return;

                // ضمان إنها Array
                setInvoices(Array.isArray(data) ? data : []);
            } catch (e) {
                console.log("CustomerInvoices Error: ", e);
                if (cancelled) return;
                setError("حصل خطأ أثناء تحميل الفواتير. حاول مرة أخرى.");
                setInvoices([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        if (customerId) load();

        return () => {
            cancelled = true;
        };
    }, [customerId]);

    // Details dialog
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    const openDetails = (inv) => {
        setSelectedInvoice(inv);
        setDetailsOpen(true);
    };
    const closeDetails = () => {
        setDetailsOpen(false);
        setSelectedInvoice(null);
    };

    // Actions dialog
    const [actionsOpen, setActionsOpen] = useState(false);
    const [actionsInvoice, setActionsInvoice] = useState(null);

    const openActions = (inv) => {
        setActionsInvoice(inv);
        setActionsOpen(true);
    };
    const closeActions = () => {
        setActionsOpen(false);
        setActionsInvoice(null);
    };

    // ✅ customerName لازم يعتمد على invoices مش mock
    const customerName = useMemo(() => {
        return invoices[0]?.customerName || `Customer #${customerId}`;
    }, [invoices, customerId]);

    // ✅ totalRemaining لازم يعتمد على invoices
    const totalRemaining = useMemo(() => {
        return sum(invoices.map((x) => Number(x?.remainingAmount ?? 0)));
    }, [invoices]);

    const handlePaymentSuccess = ({ payload }) => {
        const paid = Number(payload?.amountPaid ?? 0);

        setInvoices((prev) => {
            return prev.map((inv) => {
                if (inv.invoiceId !== payload.invoiceId) return inv;

                const newPaid = Number(inv.amountPaid ?? 0) + paid;
                const newRemaining = Math.max(
                    0,
                    Number(inv.remainingAmount ?? 0) - paid,
                );

                return {
                    ...inv,
                    amountPaid: newPaid,
                    remainingAmount: newRemaining,
                };
            });
        });
    };

    return (
        <Box sx={{ direction: "rtl" }}>
            {/* Header */}
            <Stack
                direction="row"
                alignItems="center"
                spacing={1.5}
                sx={{ mb: 2 }}
            >
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 800,
                        background: "linear-gradient(90deg, #38bdf8, #22d3ee)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}
                >
                    فواتير العميل
                </Typography>

                <Box sx={{ flex: 1 }} />

                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate("/customers")}
                    sx={btnOutlineSx}
                >
                    رجوع للعملاء
                </Button>
            </Stack>

            <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                    <Card sx={cardSx}>
                        <CardContent sx={{ p: 3 }}>
                            {/* Summary */}
                            <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={1}
                                alignItems={{ xs: "flex-start", sm: "center" }}
                                sx={{ mb: 2 }}
                            >
                                <Stack
                                    direction="row"
                                    spacing={1.25}
                                    alignItems="center"
                                >
                                    <Box
                                        sx={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: 2,
                                            display: "grid",
                                            placeItems: "center",
                                            bgcolor: "rgba(56,189,248,0.12)",
                                            border: "1px solid rgba(56,189,248,0.25)",
                                        }}
                                    >
                                        <ReceiptLongIcon />
                                    </Box>

                                    <Box>
                                        <Typography sx={{ fontWeight: 800 }}>
                                            {customerName}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                color: "text.secondary",
                                                fontSize: 13,
                                            }}
                                        >
                                            CustomerId: {customerId}
                                        </Typography>
                                    </Box>
                                </Stack>

                                <Box sx={{ flex: 1 }} />

                                <Stack
                                    direction="row"
                                    spacing={1}
                                    flexWrap="wrap"
                                    useFlexGap
                                >
                                    <Chip
                                        label={`عدد الفواتير: ${invoices.length}`}
                                        sx={chipSx}
                                    />
                                    <Chip
                                        label={`إجمالي المتبقي: ${formatMoney(totalRemaining)}`}
                                        sx={{
                                            ...chipSx,
                                            border: "1px solid rgba(239,68,68,0.25)",
                                            bgcolor: "rgba(239,68,68,0.10)",
                                        }}
                                    />
                                </Stack>
                            </Stack>

                            <Divider sx={{ mb: 2, borderColor: "#1e293b" }} />

                            {/* ✅ Loading / Error */}
                            {loading && (
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={1}
                                    sx={{ py: 2 }}
                                >
                                    <CircularProgress size={18} />
                                    <Typography
                                        sx={{
                                            color: "text.secondary",
                                            fontSize: 13,
                                        }}
                                    >
                                        جاري تحميل الفواتير...
                                    </Typography>
                                </Stack>
                            )}

                            {!loading && error && (
                                <Box
                                    sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        border: "1px solid rgba(239,68,68,0.35)",
                                        bgcolor: "rgba(239,68,68,0.10)",
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontWeight: 800,
                                            color: "#fecaca",
                                        }}
                                    >
                                        {error}
                                    </Typography>
                                </Box>
                            )}

                            {/* Table */}
                            {!loading && !error && (
                                <Box
                                    sx={{ overflowX: "auto", ...tableScrollSx }}
                                >
                                    <Table size="small" sx={{ minWidth: 1050 }}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={thSx}>
                                                    InvoiceId
                                                </TableCell>
                                                <TableCell sx={thSx}>
                                                    التاريخ
                                                </TableCell>
                                                <TableCell
                                                    align="center"
                                                    sx={thSx}
                                                >
                                                    الإجمالي
                                                </TableCell>
                                                <TableCell
                                                    align="center"
                                                    sx={thSx}
                                                >
                                                    المدفوع
                                                </TableCell>
                                                <TableCell
                                                    align="center"
                                                    sx={thSx}
                                                >
                                                    المتبقي
                                                </TableCell>
                                                <TableCell sx={thSx}>
                                                    أنشأها
                                                </TableCell>
                                                <TableCell
                                                    align="center"
                                                    sx={thSx}
                                                >
                                                    تفاصيل
                                                </TableCell>
                                                <TableCell
                                                    align="center"
                                                    sx={thSx}
                                                >
                                                    إجراءات
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {invoices.map((inv) => (
                                                <TableRow
                                                    key={inv.invoiceId}
                                                    hover
                                                    sx={{
                                                        "&:hover": {
                                                            bgcolor:
                                                                "rgba(148,163,184,0.06)",
                                                        },
                                                    }}
                                                >
                                                    <TableCell
                                                        sx={{ fontWeight: 800 }}
                                                    >
                                                        #{inv.invoiceId}
                                                    </TableCell>

                                                    <TableCell>
                                                        {formatDateTime(
                                                            inv.invoiceDate,
                                                        )}
                                                    </TableCell>

                                                    <TableCell align="center">
                                                        {formatMoney(
                                                            inv.totalAmount,
                                                        )}
                                                    </TableCell>

                                                    <TableCell align="center">
                                                        {formatMoney(
                                                            inv.amountPaid,
                                                        )}
                                                    </TableCell>

                                                    <TableCell align="center">
                                                        <Chip
                                                            size="small"
                                                            label={formatMoney(
                                                                inv.remainingAmount,
                                                            )}
                                                            sx={remainingChipSx(
                                                                inv.remainingAmount,
                                                            )}
                                                        />
                                                    </TableCell>

                                                    <TableCell>
                                                        {inv.createdBy}
                                                    </TableCell>

                                                    <TableCell align="center">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() =>
                                                                openDetails(inv)
                                                            }
                                                            sx={{
                                                                color: "#38bdf8",
                                                                bgcolor:
                                                                    "rgba(56,189,248,0.10)",
                                                                border: "1px solid rgba(56,189,248,0.22)",
                                                                "&:hover": {
                                                                    bgcolor:
                                                                        "rgba(56,189,248,0.18)",
                                                                },
                                                            }}
                                                        >
                                                            <InfoOutlinedIcon fontSize="small" />
                                                        </IconButton>
                                                    </TableCell>

                                                    <TableCell align="center">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() =>
                                                                openActions(inv)
                                                            }
                                                            sx={{
                                                                color: "#e5e7eb",
                                                                bgcolor:
                                                                    "rgba(148,163,184,0.10)",
                                                                border: "1px solid rgba(148,163,184,0.20)",
                                                                "&:hover": {
                                                                    bgcolor:
                                                                        "rgba(56,189,248,0.12)",
                                                                },
                                                            }}
                                                        >
                                                            <MoreHorizIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}

                                            {invoices.length === 0 && (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={8}
                                                        align="center"
                                                        sx={{
                                                            py: 5,
                                                            color: "text.secondary",
                                                        }}
                                                    >
                                                        لا توجد فواتير غير مسددة
                                                        لهذا العميل
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <InvoiceDetailsDialog
                open={detailsOpen}
                onClose={closeDetails}
                invoice={selectedInvoice}
            />

            <InvoiceActionsDialog
                open={actionsOpen}
                onClose={closeActions}
                invoice={actionsInvoice}
                onPaymentSuccess={handlePaymentSuccess}
                onDeleted={(deletedId) => {
                    // 1) شيل الفاتورة من الليست
                    setInvoices((prev) =>
                        prev.filter((x) => x.invoiceId !== deletedId),
                    );

                    // 2) اقفل الدايلوج (احتياطي)
                    closeActions();
                }}
            />
        </Box>
    );
}
