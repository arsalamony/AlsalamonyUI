import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    Stack,
    Typography,
    CircularProgress,
    Chip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

import { getInvoiceById } from "../../api/Invoice.api";
import { getErrorMessage } from "../../api/apiError";
import { formatDateTime, formatMoney } from "../../utils/Methods";
import { btnOutlineSx, cardSx } from "../../Comps/SomeAttrs";

export default function InvoiceDetailsPage() {
    const { invoiceId } = useParams();
    const navigate = useNavigate();

    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setLoading(true);
                setError("");
                console.log("in Invoice Details page")
                const data = await getInvoiceById(invoiceId);
                if (cancelled) return;
                setInvoice(data);
            } catch (e) {
                if (cancelled) return;
                setError(getErrorMessage(e) || "حصل خطأ أثناء تحميل الفاتورة");
                setInvoice(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        if (invoiceId) load();
        return () => {
            cancelled = true;
        };
    }, [invoiceId]);

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
                    تفاصيل الفاتورة
                </Typography>

                <Chip
                    icon={<ReceiptLongIcon />}
                    label={`#${invoiceId}`}
                    sx={{
                        bgcolor: "rgba(56,189,248,0.12)",
                        border: "1px solid rgba(56,189,248,0.25)",
                        color: "#e5e7eb",
                        fontWeight: 800,
                    }}
                />

                <Box sx={{ flex: 1 }} />

                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={btnOutlineSx}
                >
                    رجوع
                </Button>
            </Stack>

            <Card sx={cardSx}>
                <CardContent sx={{ p: 3 }}>
                    {loading && (
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <CircularProgress size={18} />
                            <Typography
                                sx={{ color: "text.secondary", fontSize: 13 }}
                            >
                                جاري تحميل الفاتورة...
                            </Typography>
                        </Stack>
                    )}

                    {!loading && error && (
                        <Typography
                            sx={{ color: "error.main", fontWeight: 800 }}
                        >
                            {error}
                        </Typography>
                    )}

                    {!loading && !error && invoice && (
                        <>
                            <Stack spacing={1}>
                                <Row
                                    label="العميل"
                                    value={invoice.customerName}
                                />
                                <Row
                                    label="التاريخ"
                                    value={formatDateTime(invoice.invoiceDate)}
                                />
                                <Row
                                    label="الإجمالي"
                                    value={formatMoney(invoice.totalAmount)}
                                />
                                <Row
                                    label="المدفوع"
                                    value={formatMoney(invoice.amountPaid)}
                                />
                                <Row
                                    label="المتبقي"
                                    value={formatMoney(invoice.remainingAmount)}
                                />
                                <Row label="أنشأها" value={invoice.createdBy} />
                                <Divider
                                    sx={{ my: 1.5, borderColor: "#1e293b" }}
                                />
                                <Row
                                    label="ملاحظات"
                                    value={invoice.notes || "—"}
                                />
                            </Stack>
                        </>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
}

function Row({ label, value }) {
    return (
        <Stack direction="row" spacing={2} alignItems="baseline">
            <Typography
                sx={{ width: 120, color: "text.secondary", fontSize: 13 }}
            >
                {label}
            </Typography>
            <Typography sx={{ fontWeight: 800 }}>{value}</Typography>
        </Stack>
    );
}
