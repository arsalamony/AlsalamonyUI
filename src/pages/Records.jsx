import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Link from "@mui/material/Link";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";

import TaskAltIcon from "@mui/icons-material/TaskAlt";
import ReplayIcon from "@mui/icons-material/Replay";

import { useToast } from "../hooks/useToast";
import { useConfirm } from "../hooks/useConfirm";
import { getErrorMessage } from "../api/apiError";
import { formatDateTime } from "../utils/Methods";

import { getSystemRecords, finishSystemRecord } from "../api/systemRecord.api";

// لو عندك SomeAttrs استخدمها، لو مش موجودة سيب اللي تحت
import {
    cardSx,
    chipSx,
    tableScrollSx,
    thSx,
    btnOutlineSx,
} from "../Comps/SomeAttrs";

function isAdminRole() {
    return String(localStorage.getItem("role") || "").toLowerCase() === "admin";
}

function levelMeta(level) {
    const v = Number(level);

    // عدّل التسميات حسب نظامك
    if (v === 1)
        return {
            label: "معلومة",
            sx: {
                bgcolor: "rgba(56,189,248,0.12)",
                border: "1px solid rgba(56,189,248,0.25)",
                color: "#e5e7eb",
            },
        };
    if (v === 2)
        return {
            label: "تحذير",
            sx: {
                bgcolor: "rgba(245,158,11,0.12)",
                border: "1px solid rgba(245,158,11,0.30)",
                color: "#e5e7eb",
            },
        };
    if (v === 3)
        return {
            label: "تحذير",
            sx: {
                bgcolor: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "#e5e7eb",
            },
        };
    return {
        label: `Level ${v}`,
        sx: {
            bgcolor: "rgba(148,163,184,0.10)",
            border: "1px solid rgba(148,163,184,0.20)",
            color: "#e5e7eb",
        },
    };
}

const finishBtnSx = {
    bgcolor: "rgba(34,197,94,0.12)",
    border: "1px solid rgba(34,197,94,0.25)",
    color: "#22c55e",
    "&:hover": { bgcolor: "rgba(34,197,94,0.18)" },
};

export default function Records() {
    const showToast = useToast();
    const confirm = useConfirm();

    const isAdmin = isAdminRole();

    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const [finishingId, setFinishingId] = useState(null);

    const fetchRecords = async ({ silent = false } = {}) => {
        try {
            if (!silent) setLoading(true);
            else setRefreshing(true);

            setError("");
            const data = await getSystemRecords();
            setRecords(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(getErrorMessage(err));
            setRecords([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    const count = records.length;

    const handleFinish = async (rec) => {
        const ok = await confirm({
            title: "تمت المراجعة",
            message: `متأكد أنك تريد إنهاء مراجعة السجل #${rec.systemRecordId}؟`,
            confirmText: "تأكيد",
            cancelText: "إلغاء",
            danger: false,
            icon: <TaskAltIcon />,
        });

        if (!ok) return;

        try {
            setFinishingId(rec.systemRecordId);
            await finishSystemRecord(rec.systemRecordId);

            // بما إن API بيرجع غير Finished فقط، نشيل السطر من UI
            setRecords((prev) =>
                prev.filter((x) => x.systemRecordId !== rec.systemRecordId),
            );

            showToast({
                message: "تمت المراجعة بنجاح",
                icon: <TaskAltIcon />,
                severity: "success",
                duration: 2000,
            });
        } catch (err) {
            showToast({
                message: getErrorMessage(err),
                icon: <TaskAltIcon />,
                severity: "error",
                duration: 2500,
            });
        } finally {
            setFinishingId(null);
        }
    };

    const navigate = useNavigate();

    const renderDescription = (desc) => {
        const text = String(desc ?? "");

        // يلقط: "فاتوره رقم 1114" أو "فاتورة رقم 1114" (مع اختلاف الهاء/ة)
        const re = /((?:فاتور(?:ة|ه)|فاتوره)\s*رقم\s*:?\s*)(\d+)/;
        const m = re.exec(text);

        // لو مش وصف فاتورة، رجّعه عادي
        if (!m) {
            return (
                <Typography sx={{ fontWeight: 700, color: "#e5e7eb" }}>
                    {text}
                </Typography>
            );
        }

        const full = m[0]; // "فاتوره رقم 1114"
        const prefix = m[1]; // "فاتوره رقم "
        const invoiceNo = m[2]; // "1114"

        const before = text.slice(0, m.index);
        const after = text.slice(m.index + full.length);

        return (
            <Typography sx={{ fontWeight: 700, color: "#e5e7eb" }}>
                {before}
                {prefix}
                <Link
                    component="button"
                    onClick={() => navigate(`/invoices/${invoiceNo}`)} // ✅ عدّل المسار لو مختلف عندك
                    sx={{
                        fontWeight: 900,
                        color: "#38bdf8",
                        textDecoration: "underline",
                        cursor: "pointer",
                        p: 0,
                        "&:hover": { color: "#22d3ee" },
                    }}
                >
                    {invoiceNo}
                </Link>
                {after}
            </Typography>
        );
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
                    التسجيلات
                </Typography>

                <Box sx={{ flex: 1 }} />

                <Button
                    variant="outlined"
                    startIcon={
                        refreshing ? (
                            <CircularProgress size={16} />
                        ) : (
                            <ReplayIcon />
                        )
                    }
                    onClick={() => fetchRecords({ silent: true })}
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
                            قائمة التسجيلات غير المُراجعة
                        </Typography>
                        <Box sx={{ flex: 1 }} />
                        <Chip label={`النتائج: ${count}`} sx={chipSx} />
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
                                sx={{ color: "error.main", fontSize: 13 }}
                            >
                                {error}
                            </Typography>
                            <Button
                                variant="outlined"
                                onClick={() => fetchRecords()}
                                sx={btnOutlineSx}
                            >
                                إعادة المحاولة
                            </Button>
                        </Stack>
                    ) : (
                        <Box sx={{ overflowX: "auto", ...tableScrollSx }}>
                            <Table
                                size="small"
                                sx={{ minWidth: isAdmin ? 950 : 820 }}
                            >
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={thSx}>ID</TableCell>
                                        <TableCell sx={thSx}>الوصف</TableCell>
                                        <TableCell align="center" sx={thSx}>
                                            المستوى
                                        </TableCell>
                                        <TableCell sx={thSx}>التاريخ</TableCell>

                                        {/* آخر عمود للأدمن فقط */}
                                        {isAdmin && (
                                            <TableCell align="center" sx={thSx}>
                                                تمت المراجعة
                                            </TableCell>
                                        )}
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {records.map((r) => {
                                        const meta = levelMeta(r.level);
                                        const busy =
                                            finishingId === r.systemRecordId;

                                        return (
                                            <TableRow
                                                key={r.systemRecordId}
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
                                                    #{r.systemRecordId}
                                                </TableCell>

                                                <TableCell>
                                                    <Typography
                                                        sx={{
                                                            fontWeight: 700,
                                                            color: "#e5e7eb",
                                                        }}
                                                    >
                                                        <TableCell>
                                                            {renderDescription(
                                                                r.description,
                                                            )}
                                                        </TableCell>{" "}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell align="center">
                                                    <Chip
                                                        size="small"
                                                        label={meta.label}
                                                        sx={meta.sx}
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    {formatDateTime(
                                                        r.createdDate,
                                                    )}
                                                </TableCell>

                                                {isAdmin && (
                                                    <TableCell align="center">
                                                        <IconButton
                                                            size="small"
                                                            sx={finishBtnSx}
                                                            disabled={busy}
                                                            onClick={() =>
                                                                handleFinish(r)
                                                            }
                                                            title="تمت المراجعة"
                                                        >
                                                            {busy ? (
                                                                <CircularProgress
                                                                    size={16}
                                                                />
                                                            ) : (
                                                                <TaskAltIcon fontSize="small" />
                                                            )}
                                                        </IconButton>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        );
                                    })}

                                    {records.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={isAdmin ? 5 : 4}
                                                align="center"
                                                sx={{
                                                    py: 5,
                                                    color: "text.secondary",
                                                }}
                                            >
                                                لا توجد تسجيلات غير مُراجعة
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
}
