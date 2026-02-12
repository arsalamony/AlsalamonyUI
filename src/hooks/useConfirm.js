import { ConfirmDialogContext } from "../contexts/ConfirmDialogContext";
import { useContext } from "react";

export function useConfirm() {
    const ctx = useContext(ConfirmDialogContext);
    if (!ctx)
        throw new Error("useConfirm must be used inside ConfirmDialogProvider");
    return ctx.confirm;
}
