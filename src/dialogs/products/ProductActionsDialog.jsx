import { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Divider,
    IconButton,
    Stack,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

import { TransferDialog } from "./TransferDialog";
import {
    dialogPaperSx,
    closeBtnSx,
    btnOutlineSx,
    actionPrimaryBtnSx,
    actionSuccessBtnSx,
} from "@/styles/uiStyles";
import AdjustQuantityDialog from "./AdjustQuantityDialog";

function isAdminRole() {
    return String(localStorage.getItem("role") || "").toLowerCase() === "admin";
}

export default function ProductActionsDialog({
    open,
    onClose,
    product,
    currentUserId,
    onTransferred,
    onAddQty, // هنركبه بعدين للتزويد
}) {
    const isAdmin = isAdminRole();
    const [transferOpen, setTransferOpen] = useState(false);
    const [adjustOpen, setAdjustOpen] = useState(false);
    if (!product) return null;

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                fullWidth
                maxWidth="xs"
                PaperProps={{ sx: dialogPaperSx }}
            >
                <DialogTitle
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                    <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 900 }}>
                            إجراءات المنتج
                        </Typography>
                        <Typography
                            sx={{ color: "text.secondary", fontSize: 13 }}
                        >
                            {product.productName}
                        </Typography>
                    </Box>

                    <IconButton onClick={onClose} sx={closeBtnSx}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <Divider sx={{ borderColor: "#1e293b" }} />

                <DialogContent sx={{ pt: 2 }}>
                    <Stack spacing={1.25}>
                        <Button
                            fullWidth
                            startIcon={<SwapHorizIcon />}
                            variant="contained"
                            onClick={() => setTransferOpen(true)}
                            sx={actionPrimaryBtnSx}
                        >
                            تحويل
                        </Button>

                        {isAdmin && (
                            <Button
                                fullWidth
                                startIcon={<AddCircleOutlineIcon />}
                                variant="contained"
                                onClick={() => setAdjustOpen(true)}
                                sx={actionSuccessBtnSx}
                            >
                                تزويد/تنقيص
                            </Button>
                        )}
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={onClose}
                        variant="outlined"
                        sx={btnOutlineSx}
                    >
                        إغلاق
                    </Button>
                </DialogActions>
            </Dialog>

            <TransferDialog
                open={transferOpen}
                onClose={() => setTransferOpen(false)}
                product={product}
                currentUserId={currentUserId}
                onTransferred={onTransferred}
            />
            <AdjustQuantityDialog
                open={adjustOpen}
                onClose={() => setAdjustOpen(false)}
                product={product}
                targetUserId={currentUserId} // ✅ نفس المستخدم المعروض
                onAdjusted={(x) => {
                    // x: { productId, qtyDelta }
                    onAddQty?.(x); // هنستخدم نفس callback بس بمعنى "adjusted"
                    setAdjustOpen(false);
                }}
            />
        </>
    );
}

/* styles */
