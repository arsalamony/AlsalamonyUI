import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Divider,
    IconButton,
    Typography,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function SettleAccountDialog({
    open,
    onClose,
    users,
    selectedUserId,
    setSelectedUserId,
    onSettle,
}) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="xs"
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
                <Typography sx={{ fontWeight: 900, flex: 1 }}>
                    تخليص الحساب
                </Typography>
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

            <Divider sx={{ borderColor: "#1e293b" }} />

            <DialogContent sx={{ pt: 2 }}>
                <FormControl
                    fullWidth
                    sx={{
                        "& .MuiOutlinedInput-root": {
                            bgcolor: "rgba(148,163,184,0.06)",
                            borderRadius: 2,
                        },
                    }}
                >
                    <InputLabel>اختر الموظف</InputLabel>
                    <Select
                        label="اختر الموظف"
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                    >
                        {users.map((u) => (
                            <MenuItem key={u.userId} value={String(u.userId)}>
                                {u.name} (#{u.userId})
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Box sx={{ mt: 1.5, color: "text.secondary", fontSize: 12 }}>
                    * تخليص الحساب يعني إن كل الدفعات الخاصة بالمستخدم أصبحت
                    “Finished”.
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{
                        borderColor: "rgba(148,163,184,0.25)",
                        color: "#e5e7eb",
                        borderRadius: 2,
                        "&:hover": { borderColor: "rgba(56,189,248,0.35)" },
                    }}
                >
                    إلغاء
                </Button>

                <Button
                    onClick={() => onSettle(selectedUserId)}
                    variant="contained"
                    disabled={!selectedUserId}
                    sx={{
                        borderRadius: 2,
                        fontWeight: 900,
                        bgcolor: "rgba(34,197,94,0.16)",
                        border: "1px solid rgba(34,197,94,0.30)",
                        color: "#e5e7eb",
                        "&:hover": { bgcolor: "rgba(34,197,94,0.24)" },
                        "&.Mui-disabled": {
                            opacity: 0.6,
                            color: "#e5e7eb",
                            bgcolor: "rgba(148,163,184,0.10)",
                            border: "1px solid rgba(148,163,184,0.18)",
                        },
                    }}
                >
                    تخليص الحساب
                </Button>
            </DialogActions>
        </Dialog>
    );
}
