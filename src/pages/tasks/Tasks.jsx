// src/pages/Tasks/Tasks.jsx
import { useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    FormControl,
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
    IconButton,
    CircularProgress,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PlaceIcon from "@mui/icons-material/Place";
import PersonIcon from "@mui/icons-material/Person";

import { useToast } from "../../hooks/useToast";
import { useConfirm } from "../../hooks/useConfirm";

import { getAllTasks, setTaskComplete, deleteTask } from "../../api/task.api";
import { getErrorMessage } from "../../api/apiError";

import TaskAddDialog from "./TaskAddDialog";
import TaskDetailsDialog from "./TaskDetailsDialog";

// ✅ hooks عندك
import { useAddresses } from "../../hooks/useAddresses"; // عدّل المسار
import { useUsers } from "../../hooks/useUsers"; // عدّل المسار حسب مشروعك
import TaskCancelDialog from "./TaskCancelDialog";
import { setCancelTask } from "../../api/task.api";
// لو عندك SomeAttrs استخدمهم بدل اللي تحت
import {
    btnPrimarySx,
    cardSx,
    selectSx,
    thSx,
    tableScrollSx,
    infoBtnSx,
} from "@/styles/uiStyles";

export default function Tasks() {
    const showToast = useToast();
    const confirm = useConfirm();

    const role = (localStorage.getItem("role") || "").toLowerCase();
    const isAdmin = role === "admin";

    // users + addresses
    const { users = [] } = useUsers(); // لو اسم الريترن مختلف عدّله
    const { addresses = [], loading: addressesLoading } = useAddresses();

    // data
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);

    // dialogs
    const [addOpen, setAddOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    // filters
    const [addressFilter, setAddressFilter] = useState("all");
    const [assignedFilter, setAssignedFilter] = useState("all");

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const data = await getAllTasks();
            setTasks(Array.isArray(data) ? data : []);
        } catch (err) {
            showToast({
                message: getErrorMessage(err) || "فشل تحميل المهام",
                severity: "error",
                duration: 2500,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const addressOptions = useMemo(() => {
        const list = addresses.map((a) => a.addressName).filter(Boolean);
        return [
            { value: "all", label: "الكل" },
            ...list.map((n) => ({ value: n, label: n })),
        ];
    }, [addresses]);

    const assignedOptions = useMemo(() => {
        return [
            { value: "all", label: "الكل" },
            { value: "none", label: "غير مسند" },
            ...users.map((u) => ({
                value: String(u.userId),
                label: `${u.name} (#${u.userId})`,
            })),
        ];
    }, [users]);

    const filteredTasks = useMemo(() => {
        return tasks.filter((t) => {
            const okAddress =
                addressFilter === "all"
                    ? true
                    : t.addressName === addressFilter;

            const okAssigned =
                assignedFilter === "all"
                    ? true
                    : assignedFilter === "none"
                      ? !t.assignedToUserId
                      : String(t.assignedToUserId) === assignedFilter;

            return okAddress && okAssigned;
        });
    }, [tasks, addressFilter, assignedFilter]);

    const openDetails = (t) => {
        setSelected(t);
        setDetailsOpen(true);
    };
    const closeDetails = () => {
        setDetailsOpen(false);
        setSelected(null);
        setDetailsLoading(false);
    };

    const handleComplete = async (task) => {
        const ok = await confirm({
            title: "إتمام المهمة",
            message: `متأكد أنك تريد جعل المهمة "${task.name}" مكتملة؟`,
            confirmText: "تأكيد",
            cancelText: "إلغاء",
            danger: false,
        });
        if (!ok) return;

        try {
            setDetailsLoading(true);
            await setTaskComplete(task.taskId);

            showToast({
                message: "تمت المهمة بنجاح",
                severity: "success",
                duration: 2000,
            });

            closeDetails();
            await fetchTasks();
        } catch (err) {
            showToast({
                message: getErrorMessage(err) || "فشل إتمام المهمة",
                severity: "error",
                duration: 2500,
            });
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleDelete = async (task) => {
        const ok = await confirm({
            title: "حذف المهمة",
            message: `متأكد أنك تريد حذف المهمة "${task.name}"؟`,
            confirmText: "حذف",
            cancelText: "إلغاء",
            danger: true,
        });
        if (!ok) return;

        try {
            setDetailsLoading(true);
            await deleteTask(task.taskId);

            showToast({
                message: "تم حذف المهمة",
                severity: "success",
                duration: 2000,
            });

            closeDetails();
            await fetchTasks();
        } catch (err) {
            showToast({
                message: getErrorMessage(err) || "فشل حذف المهمة",
                severity: "error",
                duration: 2500,
            });
        } finally {
            setDetailsLoading(false);
        }
    };

    // داخل component:
    const [cancelOpen, setCancelOpen] = useState(false);
    const [cancelTaskObj, setCancelTaskObj] = useState(null);

    // افتح دايلوج الإلغاء من تفاصيل
    const openCancel = (t) => {
        setCancelTaskObj(t);
        setCancelOpen(true);
    };

    // نفّذ الإلغاء
    const handleCancelSubmit = async (notes) => {
        if (!cancelTaskObj) return;

        try {
            setDetailsLoading(true); // نفس loading بتاع التفاصيل
            await setCancelTask(cancelTaskObj.taskId, notes);

            showToast({
                message: "تم إلغاء المهمة بنجاح",
                severity: "success",
                duration: 2000,
            });

            setCancelOpen(false);
            setCancelTaskObj(null);
            closeDetails();
            await fetchTasks();
        } catch (err) {
            showToast({
                message: getErrorMessage(err) || "فشل إلغاء المهمة",
                severity: "error",
                duration: 2500,
            });
        } finally {
            setDetailsLoading(false);
        }
    };

    return (
        <Box sx={{ direction: "rtl" }}>
            {/* Header */}
            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                alignItems={{ xs: "stretch", sm: "center" }}
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
                    المهام
                </Typography>

                <Box sx={{ flex: 1 }} />

                {/* Address filter */}
                <FormControl size="small" sx={{ minWidth: 220, ...selectSx }}>
                    <InputLabel>العنوان</InputLabel>
                    <Select
                        label="العنوان"
                        value={addressFilter}
                        onChange={(e) => setAddressFilter(e.target.value)}
                        disabled={loading || addressesLoading}
                        startAdornment={
                            <PlaceIcon
                                sx={{ color: "text.secondary", mr: 1 }}
                            />
                        }
                    >
                        {addressOptions.map((a) => (
                            <MenuItem key={a.value} value={a.value}>
                                {a.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Assigned filter */}
                <FormControl size="small" sx={{ minWidth: 240, ...selectSx }}>
                    <InputLabel>مُسند إلي</InputLabel>
                    <Select
                        label="مُسند إلي"
                        value={assignedFilter}
                        onChange={(e) => setAssignedFilter(e.target.value)}
                        disabled={loading}
                        startAdornment={
                            <PersonIcon
                                sx={{ color: "text.secondary", mr: 1 }}
                            />
                        }
                    >
                        {assignedOptions.map((u) => (
                            <MenuItem key={u.value} value={u.value}>
                                {u.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Button
                    startIcon={<AddIcon />}
                    variant="contained"
                    sx={btnPrimarySx}
                    onClick={() => setAddOpen(true)}
                    disabled={loading}
                >
                    إضافة مهمة
                </Button>
            </Stack>

            {/* Table */}
            <Card sx={cardSx}>
                <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
                        <Typography sx={{ fontWeight: 900 }}>
                            قائمة المهام
                        </Typography>
                        <Box sx={{ flex: 1 }} />

                        {loading ? <CircularProgress size={18} /> : null}

                        <Chip
                            label={`النتائج: ${filteredTasks.length}`}
                            sx={{
                                ml: 1,
                                bgcolor: "rgba(148,163,184,0.08)",
                                border: "1px solid rgba(148,163,184,0.18)",
                                color: "#e5e7eb",
                                fontWeight: 800,
                            }}
                        />
                    </Stack>

                    <Divider sx={{ mb: 2, borderColor: "#1e293b" }} />

                    <Box sx={{ overflowX: "auto", ...tableScrollSx }}>
                        <Table size="small" sx={{ minWidth: 1150 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={thSx}>رقم المهمه</TableCell>
                                    <TableCell sx={thSx}>الاسم</TableCell>
                                    <TableCell sx={thSx}>الاولويه</TableCell>
                                    <TableCell sx={thSx}>الحاله</TableCell>
                                    <TableCell sx={thSx}>العنوان</TableCell>
                                    <TableCell sx={thSx}>مُسند إلي</TableCell>
                                    <TableCell sx={thSx}>
                                        مُنشئ المهمه
                                    </TableCell>
                                    <TableCell sx={thSx}>
                                        تاريخ المهمه
                                    </TableCell>
                                    <TableCell align="center" sx={thSx}>
                                        تفاصيل
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {filteredTasks.map((t) => (
                                    <TableRow
                                        key={t.taskId}
                                        hover
                                        sx={{
                                            "&:hover": {
                                                bgcolor:
                                                    "rgba(148,163,184,0.06)",
                                            },
                                        }}
                                    >
                                        <TableCell sx={{ fontWeight: 900 }}>
                                            #{t.taskId}
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 800 }}>
                                            {t.name}
                                        </TableCell>

                                        {/* ✅ زي ما جاي نص */}
                                        <TableCell>{t.priority}</TableCell>
                                        <TableCell>{t.status}</TableCell>

                                        <TableCell>{t.addressName}</TableCell>
                                        <TableCell>
                                            {t.assignedTo ? t.assignedTo : "—"}
                                        </TableCell>
                                        <TableCell>{t.createdBy}</TableCell>
                                        <TableCell>
                                            {new Date(
                                                t.createdAt,
                                            ).toLocaleString("ar-EG")}
                                        </TableCell>

                                        <TableCell align="center">
                                            <IconButton
                                                size="small"
                                                onClick={() => openDetails(t)}
                                                sx={infoBtnSx}
                                            >
                                                <InfoOutlinedIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {!loading && filteredTasks.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={9}
                                            align="center"
                                            sx={{
                                                py: 5,
                                                color: "text.secondary",
                                            }}
                                        >
                                            لا توجد مهام
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Box>
                </CardContent>
            </Card>

            {/* Dialogs */}
            <TaskAddDialog
                open={addOpen}
                onClose={() => setAddOpen(false)}
                users={users}
                onSuccess={async () => {
                    await fetchTasks();
                }}
            />

            <TaskDetailsDialog
                open={detailsOpen}
                onClose={closeDetails}
                task={selected}
                isAdmin={isAdmin}
                loading={detailsLoading}
                onComplete={handleComplete}
                onCancel={(t) => openCancel(t)}
                onDelete={handleDelete}
            />

            <TaskCancelDialog
                open={cancelOpen}
                onClose={() => {
                    if (detailsLoading) return;
                    setCancelOpen(false);
                    setCancelTaskObj(null);
                }}
                task={cancelTaskObj}
                loading={detailsLoading}
                onSubmit={handleCancelSubmit}
            />
        </Box>
    );
}
