import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import {
    Box,
    Card,
    CardContent,
    Divider,
    Stack,
    Typography,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    CircularProgress,
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import InventoryIcon from "@mui/icons-material/Inventory";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

import { useUsers } from "../hooks/useUsers";
import { getUserWithProducts } from "../api/user.api";
import {
    cardSx,
    iconBoxSx,
    chipSx,
    selectSx,
    errorBoxSx,
    thSx,
    okChipSx,
    badChipSx,
    actionBtnSx,
} from "../Comps/SomeAttrs";

import ProductActionsDialog from "../dailogs/ProductDialogs/ProductActionsDialog"; // عدّل المسار

function isAdminRole() {
    return String(localStorage.getItem("role") || "").toLowerCase() === "admin";
}

export default function DashboardHome() {
    const admin = isAdminRole();

    // users list provider (للأدمن فقط غالبًا هيبقى محمّل)
    const { users, usersLoading, usersError } = useUsers();

    // default selected user:
    const myId = Number(localStorage.getItem("Id") || 0);
    const myName = localStorage.getItem("name") || "—";

    const [selectedUserId, setSelectedUserId] = useState(
        admin ? "" : String(myId),
    );

    // data from API Get/{id}
    const [data, setData] = useState(null); // UserResponse
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ✅ لما الادمن: لو لسه مختارش user، اختار أول واحد تلقائيًا لما users يجهزوا
    useEffect(() => {
        // if (!admin) return;
        const userId = localStorage.getItem("userId");
        if (userId) setSelectedUserId(String(userId));
        if (selectedUserId) return;
        if (usersLoading) return;


    }, []);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setLoading(true);
                setError("");

                const id = Number(selectedUserId || (admin ? 0 : myId));
                if (!id) {
                    setData(null);
                    setLoading(false);
                    return;
                }

                const res = await getUserWithProducts(id);
                if (cancelled) return;
                setData(res ?? null);
            } catch (e) {
                console.log("Home :", e);
                if (cancelled) return;
                setError("حصل خطأ أثناء تحميل بيانات المخزون");
                setData(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [selectedUserId, admin, myId]);

    const headerName = data?.name ?? (admin ? "—" : myName);
    const headerId = data?.userId ?? (admin ? "-" : myId);
    const products = Array.isArray(data?.userProducts) ? data.userProducts : [];
    const productsCount = products.length;

    // Dailogs
    const [actionsOpen, setActionsOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const openActions = (p) => {
        setSelectedProduct(p);
        setActionsOpen(true);
    };
    const closeActions = () => {
        setActionsOpen(false);
        setSelectedProduct(null);
    };

    const handleTransferred = ({ productId, qty }) => {
        // نقص من المخزون المعروض (current user)
        setData((prev) => {
            if (!prev) return prev;
            const updated = (prev.userProducts || []).map((p) => {
                if (Number(p.productId) !== Number(productId)) return p;
                return {
                    ...p,
                    quantity: Math.max(
                        0,
                        Number(p.quantity ?? 0) - Number(qty ?? 0),
                    ),
                };
            });
            return { ...prev, userProducts: updated };
        });
    };

    return (
        <Box sx={{ direction: "rtl" }}>
            <Typography
                variant="h5"
                sx={{
                    mb: 2,
                    fontWeight: 700,
                    background: "linear-gradient(90deg, #38bdf8, #22d3ee)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                }}
            >
                الصفحة الرئيسية
            </Typography>

            <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                    <Card sx={cardSx}>
                        <CardContent sx={{ p: 3 }}>
                            {/* ✅ Header داخل الجدول زي الصورة التانية */}
                            <Stack
                                direction={{ xs: "column", md: "row" }}
                                spacing={1.5}
                                alignItems={{ xs: "stretch", md: "center" }}
                                sx={{ mb: 2 }}
                            >
                                {/* يمين: اسم المستخدم + id */}
                                <Stack
                                    direction="row"
                                    spacing={1.25}
                                    alignItems="center"
                                >
                                    <Box sx={iconBoxSx}>
                                        <PersonIcon />
                                    </Box>

                                    <Box>
                                        <Typography sx={{ fontWeight: 900 }}>
                                            {headerName}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                color: "text.secondary",
                                                fontSize: 13,
                                            }}
                                        >
                                            UserId: {headerId}
                                        </Typography>
                                    </Box>
                                </Stack>

                                <Box sx={{ flex: 1 }} />

                                {/* chips summary */}
                                <Stack
                                    direction="row"
                                    spacing={1}
                                    flexWrap="wrap"
                                    useFlexGap
                                >
                                    <Chip
                                        icon={<InventoryIcon />}
                                        label={`عدد المنتجات: ${productsCount}`}
                                        sx={chipSx}
                                    />
                                </Stack>

                                {/* ✅ Dropdown للأدمن فقط */}
                                {admin && (
                                    <FormControl
                                        size="small"
                                        sx={{ minWidth: 240, ...selectSx }}
                                        disabled={
                                            usersLoading || Boolean(usersError)
                                        }
                                    >
                                        <InputLabel>اختر المستخدم</InputLabel>
                                        <Select
                                            label="اختر المستخدم"
                                            value={selectedUserId}
                                            onChange={(e) =>
                                                setSelectedUserId(
                                                    e.target.value,
                                                )
                                            }
                                        >
                                            {users.map((u) => (
                                                <MenuItem
                                                    key={u.userId}
                                                    value={String(u.userId)}
                                                >
                                                    {u.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}
                            </Stack>

                            <Divider sx={{ mb: 2, borderColor: "#1e293b" }} />

                            {/* حالات التحميل/الخطأ */}
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
                                        جاري تحميل المخزون...
                                    </Typography>
                                </Stack>
                            )}

                            {!loading && error && (
                                <Box sx={errorBoxSx}>
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

                            {!loading && !error && (
                                <>
                                    <Typography
                                        sx={{ fontWeight: 800, mb: 1.5 }}
                                    >
                                        مخزون الكروت
                                    </Typography>

                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={thSx}>
                                                    المنتج
                                                </TableCell>
                                                <TableCell
                                                    align="center"
                                                    sx={thSx}
                                                >
                                                    الكمية
                                                </TableCell>

                                                {/* ✅ بدل عمود الحالة: عمود إجراءات */}
                                                <TableCell
                                                    align="center"
                                                    sx={thSx}
                                                >
                                                    إجراءات
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {products.map((p) => {
                                                const q = Number(
                                                    p.quantity ?? 0,
                                                );
                                                const inStock = q > 0;

                                                return (
                                                    <TableRow
                                                        key={p.productId}
                                                        hover
                                                        sx={{
                                                            "&:hover": {
                                                                bgcolor:
                                                                    "rgba(148,163,184,0.06)",
                                                            },
                                                        }}
                                                    >
                                                        <TableCell
                                                            sx={{
                                                                fontWeight: 700,
                                                            }}
                                                        >
                                                            {p.productName}
                                                        </TableCell>

                                                        <TableCell align="center">
                                                            <Stack
                                                                direction="row"
                                                                spacing={1}
                                                                justifyContent="center"
                                                                alignItems="center"
                                                            >
                                                                <Typography
                                                                    sx={{
                                                                        fontWeight: 900,
                                                                    }}
                                                                >
                                                                    {q}
                                                                </Typography>

                                                                {/* ✅ بدل عمود حالة منفصل: Chip جنب الكمية */}
                                                                {inStock ? (
                                                                    <Chip
                                                                        size="small"
                                                                        label="متوفر"
                                                                        sx={
                                                                            okChipSx
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <Chip
                                                                        size="small"
                                                                        label="نفد"
                                                                        sx={
                                                                            badChipSx
                                                                        }
                                                                    />
                                                                )}
                                                            </Stack>
                                                        </TableCell>

                                                        <TableCell align="center">
                                                            <IconButton
                                                                size="small"
                                                                sx={actionBtnSx}
                                                                onClick={() =>
                                                                    openActions(
                                                                        p,
                                                                    )
                                                                }
                                                            >
                                                                <MoreHorizIcon />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}

                                            {products.length === 0 && (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={3}
                                                        align="center"
                                                        sx={{
                                                            py: 5,
                                                            color: "text.secondary",
                                                        }}
                                                    >
                                                        لا توجد منتجات لهذا
                                                        المستخدم
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            <ProductActionsDialog
                open={actionsOpen}
                onClose={closeActions}
                product={selectedProduct}
                currentUserId={headerId}
                onTransferred={(x) => {
                    handleTransferred(x);
                    closeActions();
                }}
                onAddQty={({ productId, qtyDelta }) => {
                    setData((prev) => {
                        if (!prev) return prev;
                        const updated = (prev.userProducts || []).map((p) => {
                            if (Number(p.productId) !== Number(productId))
                                return p;
                            return {
                                ...p,
                                quantity: Math.max(
                                    0,
                                    Number(p.quantity ?? 0) +
                                        Number(qtyDelta ?? 0),
                                ),
                            };
                        });
                        return { ...prev, userProducts: updated };
                    });
                }}
            />
        </Box>
    );
}
