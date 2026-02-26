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
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Typography,
} from "@mui/material";

import ReplayIcon from "@mui/icons-material/Replay";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import InsightsIcon from "@mui/icons-material/Insights";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

import {
    ResponsiveContainer,
    AreaChart,
    Area,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

import { getIncomeReport } from "../../api/report.api";
import { getErrorMessage } from "../../api/apiError";
import { formatMoney } from "../../utils/Methods";

import { cardSx, chipSx, btnOutlineSx } from "../../Comps/SomeAttrs";

function toMonthKey(d) {
    const dt = new Date(d);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
}

function parseIncomeArray(data) {
    const arr = Array.isArray(data) ? data : [];
    return arr
        .map((x) => ({
            date: x?.date,
            totalIncome: Number(x?.totalIncome ?? 0),
        }))
        .filter((x) => x.date && Number.isFinite(x.totalIncome))
        .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
}

function aggregateMonthly(daily) {
    const map = new Map();
    for (const x of daily) {
        const key = toMonthKey(x.date);
        map.set(key, (map.get(key) ?? 0) + Number(x.totalIncome ?? 0));
    }
    const out = Array.from(map.entries()).map(([key, sum]) => {
        const [y, m] = key.split("-").map(Number);
        const dt = new Date(y, m - 1, 1);
        return { date: dt.toISOString(), totalIncome: sum };
    });
    return out.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
}

function applyRange(data, rangeDays) {
    if (rangeDays === "all") return data;
    const n = Number(rangeDays);
    if (!Number.isFinite(n) || n <= 0) return data;

    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setDate(now.getDate() - n);

    return data.filter((x) => new Date(x.date) >= cutoff);
}

function formatXAxisDate(d, mode) {
    const dt = new Date(d);
    if (mode === "monthly") {
        return dt.toLocaleDateString("ar-EG", { year: "numeric", month: "short" });
    }
    return dt.toLocaleDateString("ar-EG", { day: "2-digit", month: "2-digit" });
}

function tooltipLabel(d, mode) {
    const dt = new Date(d);
    if (mode === "monthly") {
        return dt.toLocaleDateString("ar-EG", { year: "numeric", month: "long" });
    }
    return dt.toLocaleDateString("ar-EG", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function StatChip({ icon, label, value, tone = "base" }) {
    const toneSx =
        tone === "success"
            ? {
                  bgcolor: "rgba(34,197,94,0.12)",
                  border: "1px solid rgba(34,197,94,0.25)",
              }
            : tone === "warning"
              ? {
                    bgcolor: "rgba(245,158,11,0.12)",
                    border: "1px solid rgba(245,158,11,0.30)",
                }
              : tone === "info"
                ? {
                      bgcolor: "rgba(56,189,248,0.12)",
                      border: "1px solid rgba(56,189,248,0.25)",
                  }
                : {
                      bgcolor: "rgba(148,163,184,0.10)",
                      border: "1px solid rgba(148,163,184,0.20)",
                  };

    return (
        <Chip
            icon={icon}
            label={`${label}: ${value}`}
            sx={{
                ...chipSx,
                ...toneSx,
                color: "#e5e7eb",
                fontWeight: 800,
            }}
        />
    );
}

// ===== y-axis nice domain =====
function niceCeil(n) {
    if (!Number.isFinite(n) || n <= 0) return 0;
    const exp = Math.floor(Math.log10(n));
    const base = 10 ** exp;
    const x = n / base;
    const nice = x <= 1 ? 1 : x <= 2 ? 2 : x <= 5 ? 5 : 10;
    return nice * base;
}

function niceFloor(n) {
    if (!Number.isFinite(n) || n <= 0) return 0;
    const exp = Math.floor(Math.log10(n));
    const base = 10 ** exp;
    const x = n / base;
    const nice = x < 1 ? 0 : x < 2 ? 1 : x < 5 ? 2 : 5;
    return nice * base;
}

function calcYDomain(values) {
    const nums = values.filter((v) => Number.isFinite(v));
    if (nums.length === 0) return [0, 1];

    const min = Math.min(...nums);
    const max = Math.max(...nums);

    const pad = Math.max(1, (max - min) * 0.1);
    const low = Math.max(0, min - pad);
    const high = max + pad;

    const yMin = niceFloor(low);
    const yMax = niceCeil(high);

    if (yMin === yMax) return [0, yMax || 1];
    return [yMin, yMax];
}

export default function IncomeReport() {
    const [mode, setMode] = useState("daily"); // daily | monthly
    const [range, setRange] = useState("30"); // all | 7 | 30 | 90 | 365

    const [rawDaily, setRawDaily] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const fetchData = async ({ silent = false } = {}) => {
        try {
            if (!silent) setLoading(true);
            else setRefreshing(true);

            setError("");
            const data = await getIncomeReport();
            setRawDaily(parseIncomeArray(data));
        } catch (e) {
            setError(getErrorMessage(e) || "فشل تحميل تقرير الدخل");
            setRawDaily([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const chartData = useMemo(() => {
        const daily = applyRange(rawDaily, range);
        return mode === "monthly" ? aggregateMonthly(daily) : daily;
    }, [rawDaily, mode, range]);

    // ✅ متوسط تراكمي (حتى اليوم)
    const chartDataWithAvg = useMemo(() => {
        let running = 0;
        return chartData.map((x, idx) => {
            const income = Number(x.totalIncome ?? 0);
            running += income;
            const avgIncome = running / (idx + 1);
            return { ...x, avgIncome };
        });
    }, [chartData]);

    const stats = useMemo(() => {
        const n = chartDataWithAvg.length;
        const total = chartDataWithAvg.reduce(
            (s, x) => s + Number(x.totalIncome ?? 0),
            0,
        );

        // متوسط الفترة (آخر قيمة من المتوسط التراكمي)
        const avg = n ? Number(chartDataWithAvg[n - 1]?.avgIncome ?? 0) : 0;

        let maxItem = null;
        for (const x of chartDataWithAvg) {
            if (!maxItem || x.totalIncome > maxItem.totalIncome) maxItem = x;
        }

        return { n, total, avg, maxItem };
    }, [chartDataWithAvg]);

    const yDomain = useMemo(() => {
        const vals = chartDataWithAvg.flatMap((x) => [
            Number(x.totalIncome ?? 0),
            Number(x.avgIncome ?? 0),
        ]);
        return calcYDomain(vals);
    }, [chartDataWithAvg]);

    return (
        <Box sx={{ direction: "rtl" }}>
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
                    التقارير — الدخل
                </Typography>

                <Box sx={{ flex: 1 }} />

                <FormControl size="small" sx={{ minWidth: 220 }}>
                    <InputLabel>نوع العرض</InputLabel>
                    <Select
                        label="نوع العرض"
                        value={mode}
                        onChange={(e) => setMode(e.target.value)}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                bgcolor: "rgba(148,163,184,0.06)",
                                borderRadius: 2,
                            },
                        }}
                    >
                        <MenuItem value="daily">يومي</MenuItem>
                        <MenuItem value="monthly">شهري</MenuItem>
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 220 }}>
                    <InputLabel>النطاق</InputLabel>
                    <Select
                        label="النطاق"
                        value={range}
                        onChange={(e) => setRange(e.target.value)}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                bgcolor: "rgba(148,163,184,0.06)",
                                borderRadius: 2,
                            },
                        }}
                    >
                        <MenuItem value="7">آخر 7 أيام</MenuItem>
                        <MenuItem value="30">آخر 30 يوم</MenuItem>
                        <MenuItem value="90">آخر 90 يوم</MenuItem>
                        <MenuItem value="365">آخر سنة</MenuItem>
                        <MenuItem value="all">الكل</MenuItem>
                    </Select>
                </FormControl>

                <Button
                    variant="outlined"
                    startIcon={
                        refreshing ? <CircularProgress size={16} /> : <ReplayIcon />
                    }
                    onClick={() => fetchData({ silent: true })}
                    disabled={loading || refreshing}
                    sx={btnOutlineSx}
                >
                    تحديث
                </Button>
            </Stack>

            <Card sx={cardSx}>
                <CardContent sx={{ p: 3 }}>
                    <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                        sx={{ mb: 2 }}
                    >
                        <StatChip icon={<InsightsIcon />} label="عدد النقاط" value={stats.n} />
                        <StatChip
                            icon={<TrendingUpIcon />}
                            label="إجمالي الدخل"
                            value={formatMoney(stats.total)}
                            tone="success"
                        />
                        <StatChip
                            icon={<CalendarMonthIcon />}
                            label="متوسط تراكمي (آخر نقطة)"
                            value={formatMoney(stats.avg)}
                            tone="warning"
                        />

                        {stats.maxItem ? (
                            <Chip
                                label={`أعلى ${mode === "monthly" ? "شهر" : "يوم"}: ${formatMoney(stats.maxItem.totalIncome)} (${formatXAxisDate(
                                    stats.maxItem.date,
                                    mode,
                                )})`}
                                sx={{
                                    ...chipSx,
                                    bgcolor: "rgba(56,189,248,0.12)",
                                    border: "1px solid rgba(56,189,248,0.25)",
                                    color: "#e5e7eb",
                                    fontWeight: 800,
                                }}
                            />
                        ) : null}
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
                                جاري تحميل التقرير...
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
                                onClick={() => fetchData()}
                                sx={btnOutlineSx}
                            >
                                إعادة المحاولة
                            </Button>
                        </Stack>
                    ) : chartDataWithAvg.length === 0 ? (
                        <Typography sx={{ color: "text.secondary" }}>
                            لا توجد بيانات في هذا النطاق.
                        </Typography>
                    ) : (
                        <>
                            <Box sx={{ width: "100%", height: 360 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={chartDataWithAvg}
                                        margin={{ top: 10, right: 20, left: 5, bottom: 10 }}
                                    >
                                        <CartesianGrid
                                            stroke="rgba(148,163,184,0.12)"
                                            vertical={false}
                                        />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(d) => formatXAxisDate(d, mode)}
                                            stroke="rgba(148,163,184,0.6)"
                                            tick={{ fontSize: 12 }}
                                            minTickGap={18}
                                        />
                                        <YAxis
                                            tickFormatter={(v) => formatMoney(v)}
                                            stroke="rgba(148,163,184,0.6)"
                                            tick={{ fontSize: 12 }}
                                            domain={yDomain}
                                            allowDataOverflow
                                        />
                                        <Tooltip content={<CustomTooltip mode={mode} active={undefined} payload={undefined} label={undefined} />} />

                                        {/* الدخل */}
                                        <Area
                                            type="monotone"
                                            dataKey="totalIncome"
                                            stroke="#38bdf8"
                                            fill="rgba(56,189,248,0.16)"
                                            strokeWidth={2}
                                            name="الدخل"
                                            dot={false}
                                            activeDot={{ r: 5 }}
                                        />

                                        {/* متوسط تراكمي */}
                                        <Line
                                            type="monotone"
                                            dataKey="avgIncome"
                                            stroke="#f59e0b"
                                            strokeWidth={2}
                                            dot={false}
                                            name="المتوسط التراكمي"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Box>

                            <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                                flexWrap="wrap"
                                useFlexGap
                                sx={{ mt: 1.5 }}
                            >
                                <LegendItem
                                    color="#38bdf8"
                                    text="الدخل (اليومي/الشهري حسب الاختيار)"
                                />
                                <LegendItem
                                    color="#f59e0b"
                                    text="متوسط تراكمي حتى التاريخ"
                                />
                            </Stack>
                        </>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
}

function LegendItem({ color, text, dashed = false }) {
    return (
        <Stack direction="row" spacing={1} alignItems="center">
            <Box
                sx={{
                    width: 28,
                    height: 0,
                    borderTop: dashed ? `2px dashed ${color}` : `3px solid ${color}`,
                    borderRadius: 2,
                }}
            />
            <Typography sx={{ color: "#e5e7eb", fontSize: 13, fontWeight: 700 }}>
                {text}
            </Typography>
        </Stack>
    );
}

function CustomTooltip({ active, payload, label, mode }) {
    if (!active || !payload?.length) return null;

    const incomeItem = payload.find((p) => p.dataKey === "totalIncome");
    const avgItem = payload.find((p) => p.dataKey === "avgIncome");

    const income = Number(incomeItem?.value ?? 0);
    const avg = Number(avgItem?.value ?? 0);

    return (
        <Box
            sx={{
                bgcolor: "#0b1220",
                border: "1px solid rgba(148,163,184,0.25)",
                borderRadius: 2,
                p: 1.25,
                minWidth: 240,
            }}
        >
            <Typography sx={{ fontWeight: 900, mb: 0.75, color: "#e5e7eb" }}>
                {tooltipLabel(label, mode)}
            </Typography>

            <Stack spacing={0.5}>
                <RowLine label="الدخل" value={formatMoney(income)} color="#38bdf8" />
                <RowLine label="المتوسط حتى هذا التاريخ" value={formatMoney(avg)} color="#f59e0b" />
            </Stack>
        </Box>
    );
}

function RowLine({ label, value, color, dashed = false }) {
    return (
        <Stack direction="row" spacing={1} alignItems="center">
            <Box
                sx={{
                    width: 18,
                    height: 0,
                    borderTop: dashed ? `2px dashed ${color}` : `3px solid ${color}`,
                    borderRadius: 2,
                    flexShrink: 0,
                }}
            />
            <Typography sx={{ color: "text.secondary", fontSize: 12, flex: 1 }}>
                {label}
            </Typography>
            <Typography sx={{ color: "#e5e7eb", fontWeight: 800, fontSize: 12 }}>
                {value}
            </Typography>
        </Stack>
    );
}