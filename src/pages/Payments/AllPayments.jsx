import { useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";

import ReplayIcon from "@mui/icons-material/Replay";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

import { formatDateTime, formatMoney } from "../../utils/Methods";
import { getErrorMessage } from "../../api/apiError";
import { getAllPaymentsPaged, getPaymentNo } from "../../api/payment.api";

import PaymentActionsDialog from "./PaymentActionsDialog";
// لو عندك DetailsDialog للدفعة استخدمه، لو مش موجود شيله
import PaymentDetailsDialog from "./PaymentDetailsDialog";

import {
    cardSx,
    chipSx,
    thSx,
    tableScrollSx,
    infoBtnSx,
    moreBtnSx,
    chipCollectSx,
    chipDeductSx,
    btnOutlineSx,
    amountChipSx,
} from "@/styles/uiStyles";

export default function AllPayments() {
    const [pageNo, setPageNo] = useState(1); // يبدأ من 1
    const [pageSize, setPageSize] = useState(10); // 10/20/30/50/100

    const [total, setTotal] = useState(0);
    const [payments, setPayments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    // dialogs
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selected, setSelected] = useState(null);

    const [actionsOpen, setActionsOpen] = useState(false);
    const [actionPayment, setActionPayment] = useState(null);

    const totalPages = useMemo(() => {
        const tp = Math.ceil(Number(total || 0) / Number(pageSize || 1));
        return Math.max(1, tp);
    }, [total, pageSize]);

    const fetchAll = async ({ silent = false } = {}) => {
        try {
            if (!silent) setLoading(true);
            else setRefreshing(true);

            setError("");

            const [count, data] = await Promise.all([
                getPaymentNo(),
                getAllPaymentsPaged(pageNo, pageSize),
            ]);

            setTotal(Number(count ?? 0));
            setPayments(Array.isArray(data) ? data : []);
        } catch (e) {
            setError(getErrorMessage(e) || "فشل تحميل الدفعات");
            setTotal(0);
            setPayments([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageNo, pageSize]);

    // لو قل العدد بعد حذف و pageNo خرجت برا totalPages، رجع للآخر
    useEffect(() => {
        if (pageNo > totalPages) setPageNo(totalPages);
    }, [totalPages, pageNo]);

    const openDetails = (p) => {
        setSelected(p);
        setDetailsOpen(true);
    };
    const closeDetails = () => {
        setSelected(null);
        setDetailsOpen(false);
    };

    const openActions = (p) => {
        setActionPayment(p);
        setActionsOpen(true);
    };
    const closeActions = () => {
        setActionPayment(null);
        setActionsOpen(false);
    };

    const pageSizes = [10, 20, 30, 50, 100];

    return (
        <Box sx={{ direction: "rtl" }}>
            {/* Header */}
            <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "stretch", sm: "center" }}
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
                    كل الدفعات
                </Typography>

                <Box sx={{ flex: 1 }} />

                {/* PageSize dropdown ✅ */}
                <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel>حجم الصفحة</InputLabel>
                    <Select
                        label="حجم الصفحة"
                        value={String(pageSize)}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setPageNo(1);
                        }}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                bgcolor: "rgba(148,163,184,0.06)",
                                borderRadius: 2,
                            },
                        }}
                    >
                        {pageSizes.map((s) => (
                            <MenuItem key={s} value={String(s)}>
                                {s}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Prev/Next */}
                <Button
                    variant="outlined"
                    sx={btnOutlineSx}
                    disabled={loading || pageNo <= 1}
                    onClick={() => setPageNo((p) => Math.max(1, p - 1))}
                >
                    السابق
                </Button>

                <Chip label={`صفحة ${pageNo} / ${totalPages}`} sx={chipSx} />

                <Button
                    variant="outlined"
                    sx={btnOutlineSx}
                    disabled={loading || pageNo >= totalPages}
                    onClick={() =>
                        setPageNo((p) => Math.min(totalPages, p + 1))
                    }
                >
                    التالي
                </Button>

                <Button
                    variant="outlined"
                    startIcon={
                        refreshing ? (
                            <CircularProgress size={16} />
                        ) : (
                            <ReplayIcon />
                        )
                    }
                    onClick={() => fetchAll({ silent: true })}
                    disabled={loading || refreshing}
                    sx={btnOutlineSx}
                >
                    تحديث
                </Button>
            </Stack>

            <Card sx={cardSx}>
                <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
                        <Typography sx={{ fontWeight: 900 }}>
                            قائمة الدفعات
                        </Typography>
                        <Box sx={{ flex: 1 }} />
                        <Chip label={`الإجمالي: ${total}`} sx={chipSx} />
                    </Stack>

                    <Divider sx={{ mb: 2, borderColor: "#1e293b" }} />

                    {loading ? (
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ color: "text.secondary" }}
                        >
                            <CircularProgress size={18} />
                            <Typography sx={{ fontSize: 13 }}>
                                جاري التحميل...
                            </Typography>
                        </Stack>
                    ) : error ? (
                        <Stack spacing={1}>
                            <Typography
                                sx={{
                                    color: "error.main",
                                    fontSize: 13,
                                    fontWeight: 800,
                                }}
                            >
                                {error}
                            </Typography>
                            <Button
                                variant="outlined"
                                onClick={() => fetchAll()}
                                sx={btnOutlineSx}
                            >
                                إعادة المحاولة
                            </Button>
                        </Stack>
                    ) : (
                        <Box sx={{ overflowX: "auto", ...tableScrollSx }}>
                            <Table size="small" sx={{ minWidth: 1150 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={thSx}>
                                            PaymentId
                                        </TableCell>
                                        <TableCell sx={thSx}>
                                            InvoiceId
                                        </TableCell>
                                        <TableCell align="center" sx={thSx}>
                                            النوع
                                        </TableCell>
                                        <TableCell align="center" sx={thSx}>
                                            المبلغ
                                        </TableCell>
                                        <TableCell sx={thSx}>
                                            طريقة الدفع
                                        </TableCell>
                                        <TableCell sx={thSx}>التاريخ</TableCell>
                                        <TableCell sx={thSx}>أنشأها</TableCell>
                                        <TableCell align="center" sx={thSx}>
                                            تفاصيل
                                        </TableCell>
                                        <TableCell align="center" sx={thSx}>
                                            إجراءات
                                        </TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {payments.map((p) => (
                                        <TableRow
                                            key={p.paymentId}
                                            hover
                                            sx={{
                                                "&:hover": {
                                                    bgcolor:
                                                        "rgba(148,163,184,0.06)",
                                                },
                                            }}
                                        >
                                            <TableCell sx={{ fontWeight: 800 }}>
                                                #{p.paymentId}
                                            </TableCell>

                                            <TableCell>
                                                {p.invoiceId ? (
                                                    <Chip
                                                        size="small"
                                                        icon={
                                                            <ReceiptLongIcon />
                                                        }
                                                        label={`#${p.invoiceId}`}
                                                        sx={{
                                                            bgcolor:
                                                                "rgba(56,189,248,0.10)",
                                                            border: "1px solid rgba(56,189,248,0.22)",
                                                            color: "#e5e7eb",
                                                        }}
                                                    />
                                                ) : (
                                                    <Typography
                                                        sx={{
                                                            color: "text.secondary",
                                                            fontSize: 13,
                                                        }}
                                                    >
                                                        —
                                                    </Typography>
                                                )}
                                            </TableCell>

                                            <TableCell align="center">
                                                {p.added ? (
                                                    <Chip
                                                        size="small"
                                                        label="تحصيل"
                                                        sx={chipCollectSx}
                                                    />
                                                ) : (
                                                    <Chip
                                                        size="small"
                                                        label="استقطاع"
                                                        sx={chipDeductSx}
                                                    />
                                                )}
                                            </TableCell>

                                            <TableCell align="center">
                                                <Chip
                                                    size="small"
                                                    label={formatMoney(
                                                        p.amount,
                                                    )}
                                                    sx={amountChipSx(p)}
                                                />
                                            </TableCell>

                                            <TableCell>
                                                {p.paymentMethod}
                                            </TableCell>
                                            <TableCell>
                                                {formatDateTime(p.paymentDate)}
                                            </TableCell>
                                            <TableCell>{p.createdBy}</TableCell>

                                            <TableCell align="center">
                                                <IconButton
                                                    size="small"
                                                    onClick={() =>
                                                        openDetails(p)
                                                    }
                                                    sx={infoBtnSx}
                                                >
                                                    <InfoOutlinedIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>

                                            <TableCell align="center">
                                                <IconButton
                                                    size="small"
                                                    onClick={() =>
                                                        openActions(p)
                                                    }
                                                    sx={moreBtnSx}
                                                >
                                                    <MoreHorizIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}

                                    {payments.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={9}
                                                align="center"
                                                sx={{
                                                    py: 5,
                                                    color: "text.secondary",
                                                }}
                                            >
                                                لا توجد دفعات
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Details */}
            <PaymentDetailsDialog
                open={detailsOpen}
                onClose={closeDetails}
                payment={selected}
            />

            {/* Actions */}
            <PaymentActionsDialog
                open={actionsOpen}
                onClose={closeActions}
                payment={actionPayment}
                onSuccess={async () => {
                    // بعد تخليص/حذف -> ريفرش الصفحة والعدد
                    await fetchAll({ silent: true });
                }}
            />
        </Box>
    );
}
