import { useMemo, useState, useEffect } from "react";
import {
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    IconButton,
    InputAdornment,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CloseIcon from "@mui/icons-material/Close";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PaymentsIcon from "@mui/icons-material/Payments";
import { useNavigate } from "react-router-dom";
import { useConfirm } from "../../hooks/useConfirm";
import { CheckCircle } from "@mui/icons-material";
import { useToast } from "../../hooks/useToast";
import { getAllCustomers } from "../../api/customer.api";
import { getErrorMessage } from "../../api/apiError";

export default function CustomersList() {
    const showToast = useToast();
    const [q, setQ] = useState("");

    // ✅ بيانات السيرفر
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Actions dialog
    const [actionsOpen, setActionsOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const handleOpenActions = (customer) => {
        setSelectedCustomer(customer);
        setActionsOpen(true);
    };

    const handleCloseActions = () => {
        setActionsOpen(false);
        setSelectedCustomer(null);
    };

    // ✅ جلب البيانات
    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const data = await getAllCustomers();

            // تأمين بسيط لو الباك رجع حاجة غير array
            setCustomers(Array.isArray(data) ? data : []);
        } catch (err) {
            showToast({
                message: getErrorMessage(err),
                severity: "error",
                duration: 2000,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ✅ فلترة محلية على بيانات السيرفر
    const filtered = useMemo(() => {
        const s = q.trim();
        if (!s) return customers;

        return customers.filter((c) =>
            [c.customerName, c.phone, c.address].some((x) =>
                String(x ?? "").includes(s),
            ),
        );
    }, [q, customers]);

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
                        fontWeight: 700,
                        background: "linear-gradient(90deg, #38bdf8, #22d3ee)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}
                >
                    العملاء
                </Typography>

                <Box sx={{ flex: 1 }} />

                <TextField
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="بحث بالاسم / الهاتف / العنوان"
                    size="small"
                    sx={{
                        width: { xs: "100%", sm: 360 },
                        "& .MuiOutlinedInput-root": {
                            bgcolor: "rgba(148,163,184,0.06)",
                            borderRadius: 2,
                        },
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: "text.secondary" }} />
                            </InputAdornment>
                        ),
                    }}
                />

                {/* ✅ Refresh حقيقي */}
                <IconButton
                    sx={{
                        bgcolor: "rgba(148,163,184,0.08)",
                        border: "1px solid rgba(148,163,184,0.16)",
                        "&:hover": { bgcolor: "rgba(56,189,248,0.10)" },
                    }}
                    onClick={fetchCustomers}
                    disabled={loading}
                >
                    <RefreshIcon />
                </IconButton>
            </Stack>

            <Card
                sx={{
                    bgcolor: "#0b1220",
                    border: "1px solid #1e293b",
                    borderRadius: 3,
                    boxShadow: "none",
                }}
            >
                <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
                        <Typography sx={{ fontWeight: 700 }}>
                            قائمة العملاء
                        </Typography>
                        <Box sx={{ flex: 1 }} />

                        {loading ? (
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                            >
                                <CircularProgress size={18} />
                                <Typography
                                    sx={{
                                        color: "text.secondary",
                                        fontSize: 12,
                                    }}
                                >
                                    جاري التحميل...
                                </Typography>
                            </Stack>
                        ) : (
                            <Chip
                                label={`العدد: ${filtered.length}`}
                                sx={{
                                    bgcolor: "rgba(148,163,184,0.10)",
                                    border: "1px solid rgba(148,163,184,0.20)",
                                    color: "#e5e7eb",
                                }}
                            />
                        )}
                    </Stack>

                    <Divider sx={{ mb: 2, borderColor: "#1e293b" }} />

                    {/* Table */}
                    <Box
                        sx={{
                            overflowX: "auto",
                            "&::-webkit-scrollbar": { height: "6px" },
                            "&::-webkit-scrollbar-thumb": {
                                backgroundColor: "rgba(148,163,184,0.28)",
                                borderRadius: "10px",
                            },
                        }}
                    >
                        <Table size="small" sx={{ minWidth: 800 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ color: "text.secondary" }}>
                                        ID
                                    </TableCell>
                                    <TableCell sx={{ color: "text.secondary" }}>
                                        اسم العميل
                                    </TableCell>
                                    <TableCell sx={{ color: "text.secondary" }}>
                                        الهاتف
                                    </TableCell>
                                    <TableCell sx={{ color: "text.secondary" }}>
                                        العنوان
                                    </TableCell>
                                    <TableCell
                                        align="center"
                                        sx={{ color: "text.secondary" }}
                                    >
                                        المديونية
                                    </TableCell>
                                    <TableCell
                                        align="center"
                                        sx={{ color: "text.secondary" }}
                                    >
                                        إجراءات
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {filtered.map((c) => (
                                    <TableRow
                                        key={c.customerId}
                                        hover
                                        sx={{
                                            "&:hover": {
                                                bgcolor:
                                                    "rgba(148,163,184,0.06)",
                                            },
                                        }}
                                    >
                                        <TableCell>{c.customerId}</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>
                                            {c.customerName}
                                        </TableCell>
                                        <TableCell>{c.phone}</TableCell>
                                        <TableCell>{c.address}</TableCell>
                                        <TableCell align="center">
                                            {c.dept}
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                size="small"
                                                onClick={() =>
                                                    handleOpenActions(c)
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

                                {!loading && filtered.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            align="center"
                                            sx={{
                                                py: 4,
                                                color: "text.secondary",
                                            }}
                                        >
                                            لا توجد نتائج مطابقة
                                        </TableCell>
                                    </TableRow>
                                )}

                                {loading && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            align="center"
                                            sx={{
                                                py: 4,
                                                color: "text.secondary",
                                            }}
                                        >
                                            جاري تحميل العملاء...
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Box>
                </CardContent>
            </Card>

            <CustomerActionsDialog
                open={actionsOpen}
                onClose={handleCloseActions}
                customer={selectedCustomer}
            />
        </Box>
    );
}

function CustomerActionsDialog({ open, onClose, customer }) {
    const navigate = useNavigate();
    const confirm = useConfirm();
    const showToast = useToast();

    // const [deleteOpen, setDeleteOpen] = useState(false);
    // const [customerToDelete, setCustomerToDelete] = useState(null);

    // const openDeleteDialog = (customer) => {
    //     setCustomerToDelete(customer);
    //     setDeleteOpen(true);
    // };

    // const closeDeleteDialog = () => {
    //     setDeleteOpen(false);
    //     setCustomerToDelete(null);
    // };

    // const handleDeleteConfirm = () => {
    //     console.log("delete customer id:", customerToDelete?.customerId);
    //     // بعدين هنا هتعمل API call
    //     closeDeleteDialog();
    // };

    // UI فقط (بدّلها بعدين بـ navigate / api calls)
    const onAction = async (type) => {
        if (!customer) return;

        switch (type) {
            case "edit": {
                onClose(); // اقفل Dialog الخيارات
                navigate(`/customers/edit/${customer.customerId}`);
                break;
            }

            case "delete": {
                const ok = await confirm({
                    title: "حذف عميل",
                    icon: <DeleteOutlineIcon />,
                    message: `هل أنت متأكد أنك تريد حذف العميل "${customer.customerName}"؟`,
                    confirmText: "حذف",
                    cancelText: "إلغاء",
                    danger: true,
                });

                if (!ok) return;

                // بعد ما يتم الحذف بنجاح:
                showToast({
                    message: "تم حذف العميل بنجاح",
                    icon: <CheckCircle />,
                    severity: "success",
                    duration: 2000,
                });

                // ✅ هنا بعدين تحط API call
                console.log("DELETE customer id:", customer.customerId);

                onClose(); // اقفل Dialog الخيارات بعد الحذف
                break;
            }
            case "invoices": {
                onClose();
                navigate(`/customers/${customer.customerId}/invoices`);
                break;
            }
            case "add_invoice": {
                onClose();
                navigate(`/customers/${customer.customerId}/invoices/new`);
                break;
            }

            default:
                return;
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: {
                    direction: "rtl",
                    bgcolor: "#0b1220",
                    border: "1px solid #1e293b",
                    borderRadius: 3,
                    boxShadow: "none",
                },
            }}
        >
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 800 }}>خيارات</Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                        {customer
                            ? `${customer.customerName} — ID: ${customer.customerId}`
                            : ""}
                    </Typography>
                </Box>

                <IconButton
                    onClick={onClose}
                    sx={{
                        color: "text.secondary",
                        bgcolor: "rgba(148,163,184,0.06)",
                        border: "1px solid rgba(148,163,184,0.12)",
                        "&:hover": { bgcolor: "rgba(148,163,184,0.10)" },
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ borderColor: "#1e293b" }}>
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                        gap: 1.25,
                    }}
                >
                    <ActionBtn
                        title="عرض الفواتير الغير مسددة"
                        icon={<VisibilityIcon />}
                        bg="rgba(56,189,248,0.14)"
                        border="rgba(56,189,248,0.28)"
                        onClick={() => onAction("invoices")}
                        danger={undefined}
                    />

                    <ActionBtn
                        title="تعديل العميل"
                        icon={<EditIcon />}
                        bg="rgba(124,58,237,0.14)"
                        border="rgba(124,58,237,0.28)"
                        onClick={() => onAction("edit")}
                        danger={undefined}
                    />

                    <ActionBtn
                        title="إضافة فاتورة"
                        icon={<ReceiptLongIcon />}
                        bg="rgba(34,197,94,0.14)"
                        border="rgba(34,197,94,0.28)"
                        onClick={() => onAction("add_invoice")}
                        danger={undefined}
                    />

                    <ActionBtn
                        title="تحصيل / دفعة"
                        icon={<PaymentsIcon />}
                        bg="rgba(245,158,11,0.14)"
                        border="rgba(245,158,11,0.28)"
                        onClick={() => onAction("payment")}
                        danger={undefined}
                    />

                    <ActionBtn
                        title="حذف"
                        icon={<DeleteOutlineIcon />}
                        bg="rgba(239,68,68,0.14)"
                        border="rgba(239,68,68,0.28)"
                        onClick={() => onAction("delete")}
                        danger
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{
                        borderColor: "rgba(148,163,184,0.25)",
                        color: "#e5e7eb",
                        "&:hover": { borderColor: "rgba(56,189,248,0.35)" },
                        borderRadius: 2,
                    }}
                >
                    إغلاق
                </Button>
            </DialogActions>
        </Dialog>
    );
}

function ActionBtn({ title, icon, bg, border, onClick, danger }) {
    return (
        <Button
            fullWidth
            onClick={onClick}
            startIcon={icon}
            variant="contained"
            sx={{
                justifyContent: "space-between",
                bgcolor: bg,
                border: `1px solid ${border}`,
                color: danger ? "#fecaca" : "#e5e7eb",
                borderRadius: 2,
                py: 1.2,
                "&:hover": {
                    bgcolor: bg,
                    filter: "brightness(1.08)",
                },
                textTransform: "none",
            }}
        >
            {title}
        </Button>
    );
}
