import { useEffect, useMemo, useState } from "react";
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
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

import { getInvoiceById } from "../../api/Invoice.api";
import { getInvoiceItemsByInvoiceId } from "../../api/InvoiceItem.api"; // ✅ عدّل المسار حسب عندك
import { getErrorMessage } from "../../api/apiError";
import { formatDateTime, formatMoney } from "../../utils/Methods";
import { btnOutlineSx, cardSx } from "@/styles/uiStyles";

export default function InvoiceDetailsPage() {
    const { invoiceId } = useParams();
    const navigate = useNavigate();

    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ✅ Items state
    const [items, setItems] = useState([]);
    const [itemsLoading, setItemsLoading] = useState(true);
    const [itemsError, setItemsError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setLoading(true);
                setError("");
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

    // ✅ Load Items (بدون هوك)
    useEffect(() => {
        let cancelled = false;

        async function loadItems() {
            try {
                setItemsLoading(true);
                setItemsError("");
                const list = await getInvoiceItemsByInvoiceId(invoiceId);
                if (cancelled) return;
                setItems(Array.isArray(list) ? list : []);
            } catch (e) {
                if (cancelled) return;
                setItemsError(
                    getErrorMessage(e) || "حصل خطأ أثناء تحميل بنود الفاتورة",
                );
                setItems([]);
            } finally {
                if (!cancelled) setItemsLoading(false);
            }
        }

        if (invoiceId) loadItems();
        return () => {
            cancelled = true;
        };
    }, [invoiceId]);

    const computedItemsTotal = useMemo(() => {
        return items.reduce((sum, it) => {
            if (it?.isGift) return sum;
            const qty = Number(it?.qty ?? 0);
            const price = Number(it?.pricePerUnit ?? 0);
            if (!Number.isFinite(qty) || !Number.isFinite(price)) return sum;
            return sum + qty * price;
        }, 0);
    }, [items]);

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

            {/* Invoice Card */}
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

                            {/* ✅ Items section */}
                            <Divider sx={{ my: 2, borderColor: "#1e293b" }} />

                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                                sx={{ mb: 1 }}
                            >
                                <ShoppingCartIcon
                                    sx={{ color: "text.secondary" }}
                                />
                                <Typography sx={{ fontWeight: 900 }}>
                                    بنود الفاتورة
                                </Typography>
                                <Box sx={{ flex: 1 }} />
                                <Chip
                                    label={`الإجمالي المحسوب: ${formatMoney(computedItemsTotal)}`}
                                    sx={{
                                        bgcolor: "rgba(148,163,184,0.06)",
                                        border: "1px solid rgba(148,163,184,0.18)",
                                        color: "#e5e7eb",
                                        fontWeight: 800,
                                    }}
                                />
                            </Stack>

                            {itemsLoading && (
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={1}
                                    sx={{ mt: 1 }}
                                >
                                    <CircularProgress size={18} />
                                    <Typography
                                        sx={{
                                            color: "text.secondary",
                                            fontSize: 13,
                                        }}
                                    >
                                        جاري تحميل البنود...
                                    </Typography>
                                </Stack>
                            )}

                            {!itemsLoading && itemsError && (
                                <Typography
                                    sx={{
                                        color: "error.main",
                                        fontWeight: 800,
                                        mt: 1,
                                    }}
                                >
                                    {itemsError}
                                </Typography>
                            )}

                            {!itemsLoading && !itemsError && (
                                <Stack spacing={1.25} sx={{ mt: 1 }}>
                                    {items.length === 0 ? (
                                        <Typography
                                            sx={{
                                                color: "text.secondary",
                                                fontSize: 13,
                                            }}
                                        >
                                            لا توجد بنود لهذه الفاتورة.
                                        </Typography>
                                    ) : (
                                        items.map((it, idx) => {
                                            const lineTotal = it.isGift
                                                ? 0
                                                : Number(it.qty) *
                                                  Number(it.pricePerUnit);
                                            return (
                                                <Card
                                                    key={`${it.productName}-${idx}`}
                                                    sx={{
                                                        bgcolor:
                                                            "rgba(148,163,184,0.05)",
                                                        border: "1px solid rgba(148,163,184,0.14)",
                                                        borderRadius: 2,
                                                        boxShadow: "none",
                                                    }}
                                                >
                                                    <CardContent sx={{ p: 2 }}>
                                                        <Stack spacing={0.75}>
                                                            <Stack
                                                                direction="row"
                                                                alignItems="center"
                                                                spacing={1}
                                                            >
                                                                <Typography
                                                                    sx={{
                                                                        fontWeight: 900,
                                                                    }}
                                                                >
                                                                    {
                                                                        it.productName
                                                                    }
                                                                </Typography>
                                                                {it.isGift && (
                                                                    <Chip
                                                                        label="هدية"
                                                                        size="small"
                                                                        sx={{
                                                                            bgcolor:
                                                                                "rgba(245,158,11,0.12)",
                                                                            border: "1px solid rgba(245,158,11,0.30)",
                                                                            color: "#e5e7eb",
                                                                            fontWeight: 800,
                                                                        }}
                                                                    />
                                                                )}
                                                                <Box
                                                                    sx={{
                                                                        flex: 1,
                                                                    }}
                                                                />
                                                                <Typography
                                                                    sx={{
                                                                        fontWeight: 900,
                                                                    }}
                                                                >
                                                                    {formatMoney(
                                                                        lineTotal,
                                                                    )}
                                                                </Typography>
                                                            </Stack>

                                                            <Stack
                                                                direction={{
                                                                    xs: "column",
                                                                    sm: "row",
                                                                }}
                                                                spacing={2}
                                                            >
                                                                <MiniRow
                                                                    label="الكمية"
                                                                    value={String(
                                                                        it.qty,
                                                                    )}
                                                                />
                                                                <MiniRow
                                                                    label="سعر الوحدة"
                                                                    value={formatMoney(
                                                                        it.pricePerUnit,
                                                                    )}
                                                                />
                                                            </Stack>
                                                        </Stack>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })
                                    )}
                                </Stack>
                            )}
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

function MiniRow({ label, value }) {
    return (
        <Stack direction="row" spacing={1} alignItems="baseline">
            <Typography sx={{ color: "text.secondary", fontSize: 12 }}>
                {label}:
            </Typography>
            <Typography sx={{ fontWeight: 800, fontSize: 12 }}>
                {value}
            </Typography>
        </Stack>
    );
}
