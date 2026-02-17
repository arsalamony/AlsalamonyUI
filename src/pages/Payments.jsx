import { useEffect, useMemo, useState } from "react";
import Grid from "@mui/material/Grid";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
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
    CircularProgress,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import PersonIcon from "@mui/icons-material/Person";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import TaskAltIcon from "@mui/icons-material/TaskAlt";

import { useConfirm } from "../hooks/useConfirm";
import { useToast } from "../hooks/useToast";
import { formatDateTime, formatMoney } from "../utils/Methods";

import PaymentAddDialog from "./Payments/PaymentAddDialog";
import SettleAccountDialog from "./Payments/SettleAccountDialog";
import PaymentActionsDialog from "./Payments/PaymentActionsDialog";
import PaymentDetailsDialog from "./Payments/PaymentDetailsDialog";
import SummaryCard from "../Comps/SummaryCard";
import {
    amountChipSx,
    btnPrimarySx,
    cardSx,
    chipCollectSx,
    chipDeductSx,
    chipSx,
    infoBtnSx,
    moreBtnSx,
    tableScrollSx,
    thSx,
} from "../Comps/SomeAttrs";

import { useUsers } from "../hooks/useUsers"; // ✅
import { getPaymentsByUserId, finshAllPayment } from "../api/payment.api"; // ✅

export default function Payments() {
    const confirm = useConfirm();
    const showToast = useToast();

    const role = (localStorage.getItem("role") || "").toLowerCase();
    const isAdmin = role === "admin";
    const myUserId = Number(localStorage.getItem("userId") || 0);

    // ✅ users from provider (Admin only usage)
    const { users, usersLoading } = useUsers();

    // ===== Data from API =====
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadErr, setLoadErr] = useState("");
    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setLoading(true);
                setLoadErr("");

                // endpoint بيقرر حسب role من التوكن، ف هنمرر Id الحالي
                const data = await getPaymentsByUserId(myUserId);
                if (cancelled) return;
                setPayments(Array.isArray(data) ? data : []);
            } catch (e) {
                console.log(e);
                if (cancelled) return;
                setLoadErr("فشل تحميل الدفعات");
                setPayments([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [myUserId]);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const userId = localStorage.getItem("userId");
            const data = await getPaymentsByUserId(userId); // /Payment/GetAll/{UserId}
            setPayments(data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    // ===== Dialogs =====
    const [addOpen, setAddOpen] = useState(false);
    const [settleOpen, setSettleOpen] = useState(false);
    const [settleUserId, setSettleUserId] = useState("");

    // ===== Filter by CreatedBy (Admin only) =====
    const creators = useMemo(() => {
        // لو السيرفر بيرجع createdBy string زي "عبدالله محمد"
        const set = new Set(payments.map((p) => p.createdBy).filter(Boolean));
        return ["الكل", ...Array.from(set)];
    }, [payments]);

    const [createdByFilter, setCreatedByFilter] = useState("الكل");

    const filteredPayments = useMemo(() => {
        if (!isAdmin) return payments; // user أصلاً هيجيله دفعاته فقط
        if (createdByFilter === "الكل") return payments;
        return payments.filter((p) => p.createdBy === createdByFilter);
    }, [isAdmin, createdByFilter, payments]);

    // ===== Summary (على filteredPayments) =====
    const sums = useMemo(() => {
        const collection = filteredPayments
            .filter((p) => p.added)
            .reduce((s, p) => s + Number(p.amount ?? 0), 0);

        const deduction = filteredPayments
            .filter((p) => !p.added)
            .reduce((s, p) => s + Number(p.amount ?? 0), 0);

        const cashCollection =
            filteredPayments
                .filter((p) => p.added && p.paymentMethod === "كاش")
                .reduce((s, p) => s + Number(p.amount ?? 0), 0) - deduction;

        const total = collection + deduction;
        return { total, collection, deduction, cashCollection };
    }, [filteredPayments]);

    // ===== Details dialog =====
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selected, setSelected] = useState(null);

    const openDetails = (p) => {
        setSelected(p);
        setDetailsOpen(true);
    };
    const closeDetails = () => {
        setDetailsOpen(false);
        setSelected(null);
    };

    // ===== Actions dialog =====
    const [actionsOpen, setActionsOpen] = useState(false);
    const [selectedActionPayment, setSelectedActionPayment] = useState(null);

    const openActions = (p) => {
        setSelectedActionPayment(p);
        setActionsOpen(true);
    };
    const closeActions = () => {
        setActionsOpen(false);
        setSelectedActionPayment(null);
    };

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
                    الدفعات والحساب
                </Typography>

                <Box sx={{ flex: 1 }} />

                {/* Admin filter */}
                {isAdmin && (
                    <FormControl
                        size="small"
                        sx={{
                            minWidth: 220,
                            "& .MuiOutlinedInput-root": {
                                bgcolor: "rgba(148,163,184,0.06)",
                                borderRadius: 2,
                            },
                        }}
                    >
                        <InputLabel>المُنشئ</InputLabel>
                        <Select
                            label="المُنشئ"
                            value={createdByFilter}
                            onChange={(e) => setCreatedByFilter(e.target.value)}
                        >
                            {creators.map((c) => (
                                <MenuItem key={c} value={c}>
                                    {c}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}

                {/* Admin buttons */}
                {isAdmin && (
                    <Button
                        startIcon={<DoneAllIcon />}
                        variant="outlined"
                        sx={{
                            borderRadius: 2,
                            fontWeight: 800,
                            borderColor: "rgba(34,197,94,0.40)",
                            color: "#a7f3d0",
                            "&:hover": {
                                borderColor: "rgba(34,197,94,0.60)",
                                bgcolor: "rgba(34,197,94,0.08)",
                            },
                        }}
                        onClick={() => {
                            const first = users?.[0];
                            setSettleUserId(first ? String(first.userId) : "");
                            setSettleOpen(true);
                        }}
                        disabled={usersLoading || users.length === 0}
                    >
                        تخليص الحساب
                    </Button>
                )}

                {/* Add Payment (always visible) */}
                <Button
                    startIcon={<AddIcon />}
                    variant="contained"
                    sx={btnPrimarySx}
                    onClick={() => setAddOpen(true)}
                >
                    إضافة دفعة
                </Button>
            </Stack>

            {/* Summary */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, md: 3 }}>
                    <SummaryCard
                        title="المجموع الكلي"
                        value={formatMoney(sums.total)}
                        tone="info"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                    <SummaryCard
                        title="مجموع التحصيل"
                        value={formatMoney(sums.collection)}
                        tone="success"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                    <SummaryCard
                        title="مجموع الاستقطاع"
                        value={formatMoney(sums.deduction)}
                        tone="danger"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                    <SummaryCard
                        title='تحصيل "كاش"'
                        value={formatMoney(sums.cashCollection)}
                        tone="cash"
                    />
                </Grid>
            </Grid>

            {/* Table */}
            <Card sx={cardSx}>
                <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
                        <Typography sx={{ fontWeight: 900 }}>
                            قائمة الدفعات
                        </Typography>
                        <Box sx={{ flex: 1 }} />
                        <Chip
                            label={`النتائج: ${filteredPayments.length}`}
                            sx={chipSx}
                        />
                    </Stack>

                    <Divider sx={{ mb: 2, borderColor: "#1e293b" }} />

                    {loading && (
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                            sx={{ py: 2 }}
                        >
                            <CircularProgress size={18} />
                            <Typography
                                sx={{ color: "text.secondary", fontSize: 13 }}
                            >
                                جاري تحميل الدفعات...
                            </Typography>
                        </Stack>
                    )}

                    {!loading && loadErr && (
                        <Box
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                border: "1px solid rgba(239,68,68,0.35)",
                                bgcolor: "rgba(239,68,68,0.10)",
                            }}
                        >
                            <Typography
                                sx={{ fontWeight: 800, color: "#fecaca" }}
                            >
                                {loadErr}
                            </Typography>
                        </Box>
                    )}

                    {!loading && !loadErr && (
                        <Box sx={{ overflowX: "auto", ...tableScrollSx }}>
                            <Table size="small" sx={{ minWidth: 1150 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={thSx}>
                                            رقم الدفعة
                                        </TableCell>
                                        <TableCell sx={thSx}>
                                            رقم الفاتورة
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
                                    {filteredPayments.map((p) => (
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

                                    {filteredPayments.length === 0 && (
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

            {/* dialogs */}
            <PaymentDetailsDialog
                open={detailsOpen}
                onClose={closeDetails}
                payment={selected}
            />

            <PaymentActionsDialog
                open={actionsOpen}
                onClose={closeActions}
                payment={selectedActionPayment}
                onSuccess={() => fetchPayments()}
            />

            <PaymentAddDialog
                open={addOpen}
                onClose={() => setAddOpen(false)}
                users={users}
                onSuccess={() => {
                    fetchPayments();
                }}
            />

            <SettleAccountDialog
                open={settleOpen}
                onClose={() => setSettleOpen(false)}
                users={users}
                selectedUserId={settleUserId}
                setSelectedUserId={setSettleUserId}
                onSettle={async (userId) => {
                    const user = users.find((u) => u.userId === Number(userId));
                    const ok = await confirm({
                        title: "تخليص الحساب",
                        message: `متأكد أنك تريد تخليص حساب "${user?.name ?? userId}"؟`,
                        confirmText: "تأكيد",
                        cancelText: "إلغاء",
                        danger: false,
                        icon: <TaskAltIcon />,
                    });

                    if (!ok) return;

                    // داخل onSettle بعد ok
                    await finshAllPayment(Number(userId));

                    showToast({
                        message: "تم تخليص الحساب بنجاح",
                        icon: <TaskAltIcon />,
                        severity: "success",
                        duration: 2000,
                    });

                    await fetchPayments();
                    showToast({
                        message: "تم تخليص الحساب (تجربة UI)",
                        icon: <TaskAltIcon />,
                        severity: "success",
                        duration: 2000,
                    });

                    setSettleOpen(false);
                }}
            />
        </Box>
    );
}
